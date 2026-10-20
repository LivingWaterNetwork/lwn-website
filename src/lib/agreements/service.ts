import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { computeContentHash, computeDerivedVariables, substituteVariables, type VariablesSchema } from "./render";
import { generateAccessCode, generateAgreementSlug, hashSecret } from "./crypto";
import { logAgreementEvent } from "./events";

export type SignerInput = {
  role: "partner" | "participant" | "organization";
  name: string;
  email: string;
  title?: string;
};

export type CreateAgreementInput = {
  templateKey: string;
  templateVersion: string;
  name: string;
  email: string;
  variables: Record<string, unknown>;
  signers: SignerInput[];
  paymentUrl?: string;
  expiresInDays?: number;
  isTest?: boolean;
};

export class AgreementServiceError extends Error {}

/** Generates a slug, retrying on the rare collision — @unique on Agreement.slug is the real guard. */
async function uniqueSlug(name: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateAgreementSlug(name);
    const existing = await prisma.agreement.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
  }
  throw new AgreementServiceError("Could not generate a unique agreement slug after 5 attempts.");
}

/**
 * Creates a new draft agreement from a published template. Shared by the
 * admin "create" API route and the `agreement:new` CLI so there's exactly
 * one code path that knows how to assemble an agreement.
 */
export async function createAgreementFromTemplate(input: CreateAgreementInput) {
  const template = await prisma.agreementTemplate.findUnique({
    where: { key_version: { key: input.templateKey, version: input.templateVersion } },
  });
  if (!template) {
    throw new AgreementServiceError(`No template found for ${input.templateKey}@${input.templateVersion}.`);
  }
  if (template.status !== "published") {
    throw new AgreementServiceError(
      `Template ${input.templateKey}@${input.templateVersion} is "${template.status}", not "published".`
    );
  }

  const schema = template.variablesSchema as VariablesSchema;
  const variables = computeDerivedVariables(input.variables, schema) as Prisma.InputJsonValue;

  const slug = await uniqueSlug(input.name);
  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // default 30 days, per spec

  const signerRoles = template.signerRoles as Array<{ role: string; order: number }>;

  const agreement = await prisma.agreement.create({
    data: {
      slug,
      templateId: template.id,
      variables,
      paymentUrl: input.paymentUrl || null,
      expiresAt,
      isTest: Boolean(input.isTest) || slug.startsWith("test-"),
      signers: {
        create: input.signers.map((s) => ({
          role: s.role,
          order: signerRoles.find((r) => r.role === s.role)?.order ?? 99,
          name: s.name,
          email: s.email,
          title: s.title,
        })),
      },
    },
  });

  await logAgreementEvent(null, agreement.id, "created", { actorRole: "admin" });

  return agreement;
}

/**
 * Freezes the agreement's content: substitutes variables into the template
 * body, verifies no unresolved tokens remain (besides the two allowed system
 * tokens), and moves status to "ready". This is the one-way door — once
 * ready, `renderedBody`/`contentSha256` never change; a post-signing edit
 * means voiding and reissuing a new agreement instead.
 */
export async function markAgreementReady(agreementId: string) {
  const agreement = await prisma.agreement.findUniqueOrThrow({
    where: { id: agreementId },
    include: { template: true },
  });

  if (agreement.status !== "draft") {
    throw new AgreementServiceError(`Agreement is "${agreement.status}", not "draft" — cannot mark ready.`);
  }

  const { body, unresolved } = substituteVariables(
    agreement.template.body,
    agreement.variables as Record<string, unknown>
  );

  if (unresolved.length > 0) {
    throw new AgreementServiceError(
      `Cannot mark ready — unresolved template tokens: ${unresolved.map((t) => `{{${t}}}`).join(", ")}`
    );
  }

  const contentSha256 = computeContentHash(body);

  const updated = await prisma.agreement.update({
    where: { id: agreementId },
    data: { renderedBody: body, contentSha256, status: "ready" },
  });

  await logAgreementEvent(null, agreementId, "marked_ready", { actorRole: "admin" });

  return updated;
}

/** Generates a fresh access code, stores only its hash, and returns the plaintext once (never persisted). */
export async function issueAccessCode(agreementId: string): Promise<string> {
  const code = generateAccessCode();
  const accessCodeHash = await hashSecret(code);
  await prisma.agreement.update({
    where: { id: agreementId },
    data: { accessCodeHash, codeAttempts: 0, lockedUntil: null },
  });
  return code;
}
