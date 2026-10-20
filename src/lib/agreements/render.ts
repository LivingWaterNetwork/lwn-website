import { marked } from "marked";
import { sha256Hex } from "./crypto";

/**
 * Template rendering: fills `{{variable}}` tokens in a template's markdown
 * body with an agreement's `variables`, leaving only the two system tokens
 * (`{{system:effective_date}}` and a per-role `{{system:signature:<role>}}`)
 * unresolved. Those are filled at view/PDF time from live signer data, never
 * frozen into storage — everything else is baked into `renderedBody` once an
 * agreement moves to "ready" and never changes again (voiding + reissuing is
 * the only path for a post-signing content change).
 */

export type VariablesSchema = {
  /** Field name -> how to derive a human-readable `${field}_display` variable. */
  fields?: Record<string, { type: "currency" | "date" }>;
  /** Name of an `[{ label, due, amount }]` field to render as a markdown table at `${field}_table`. */
  installmentsField?: string;
};

export function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatDateLong(isoDate: string): string {
  // Parsed as UTC noon to avoid local-timezone date-shifting in the sandbox/server.
  const d = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function formatDateLongWithWeekday(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function buildInstallmentsTable(installments: Array<{ label: string; due: string; amount: number }>): string {
  const rows = installments.map(
    (i) => `| ${i.label} | ${formatDateLong(i.due)} | ${formatCurrency(i.amount)} |`
  );
  const total = installments.reduce((sum, i) => sum + i.amount, 0);
  return [
    "| Installment | Due date | Amount |",
    "| --- | --- | --- |",
    ...rows,
    `| **Total** |  | **${formatCurrency(total)}** |`,
  ].join("\n");
}

/** Merges computed display/table variables into the raw variable set, per the template's variablesSchema. */
export function computeDerivedVariables(
  raw: Record<string, unknown>,
  schema: VariablesSchema | null | undefined
): Record<string, unknown> {
  const derived: Record<string, unknown> = { ...raw };

  for (const [field, config] of Object.entries(schema?.fields ?? {})) {
    const value = raw[field];
    if (value === undefined || value === null) continue;
    if (config.type === "currency" && typeof value === "number") {
      derived[`${field}_display`] = formatCurrency(value);
    } else if (config.type === "date" && typeof value === "string") {
      derived[`${field}_display`] = formatDateLong(value);
      derived[`${field}_weekday_display`] = formatDateLongWithWeekday(value);
    }
  }

  const installmentsField = schema?.installmentsField;
  if (installmentsField && Array.isArray(raw[installmentsField])) {
    derived[`${installmentsField}_table`] = buildInstallmentsTable(
      raw[installmentsField] as Array<{ label: string; due: string; amount: number }>
    );
  }

  return derived;
}

/**
 * Escapes the handful of markdown-significant characters that matter when a
 * value is inserted mid-paragraph — inline emphasis/code/link syntax — so a
 * variable like a business name can't accidentally start italics or a code
 * span. Deliberately narrow: punctuation such as `.` `-` `(` `)` `#` is left
 * alone, since escaping it would litter normal prose with visible backslashes
 * and those characters are only structural at the start of a line, which an
 * inline substitution never is.
 */
function escapeMarkdownValue(value: unknown): string {
  if (typeof value !== "string") return String(value);
  return value.replace(/([\\`*_[\]])/g, "\\$1");
}

const SYSTEM_TOKEN_PATTERN = /\{\{system:(effective_date|signature:[a-z][a-z0-9_]*)\}\}/g;
const ANY_TOKEN_PATTERN = /\{\{([^}]+)\}\}/g;

/**
 * Substitutes `{{variable}}` tokens from `variables` into `templateBody`,
 * leaving `{{system:effective_date}}` and `{{system:signature:<role>}}`
 * untouched. Returns the substituted body plus any tokens that could not be
 * resolved (neither a known variable nor an allowed system token) — the
 * caller must refuse to mark the agreement "ready" while this list is
 * non-empty.
 */
export function substituteVariables(
  templateBody: string,
  variables: Record<string, unknown>
): { body: string; unresolved: string[] } {
  const unresolved: string[] = [];

  const body = templateBody.replace(ANY_TOKEN_PATTERN, (match, rawKey: string) => {
    const key = rawKey.trim();
    if (key === "system:effective_date" || /^system:signature:[a-z][a-z0-9_]*$/.test(key)) {
      return match; // left for render-time substitution
    }
    if (Object.prototype.hasOwnProperty.call(variables, key) && variables[key] !== undefined && variables[key] !== null) {
      // `_table` variables (e.g. installments_table) are pre-built markdown
      // structure from computeDerivedVariables, not free-text — insert as-is.
      return key.endsWith("_table") ? String(variables[key]) : escapeMarkdownValue(variables[key]);
    }
    unresolved.push(key);
    return match;
  });

  return { body, unresolved };
}

export type SignerForRender = {
  role: string;
  name: string;
  title?: string | null;
  status: string;
  signedAt?: Date | string | null;
  typedName?: string | null;
  signatureImage?: string | null;
};

/**
 * Fills the system tokens in a frozen `renderedBody` using live signer data.
 * Called at every view, PDF generation, and download — never stored back.
 */
export function fillSystemTokens(
  renderedBody: string,
  opts: { effectiveDate: Date | null; signers: SignerForRender[] }
): string {
  return renderedBody.replace(SYSTEM_TOKEN_PATTERN, (_match, token: string) => {
    if (token === "effective_date") {
      return opts.effectiveDate
        ? opts.effectiveDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
        : "_____________________";
    }
    const role = token.replace("signature:", "");
    const signer = opts.signers.find((s) => s.role === role);
    if (!signer || signer.status !== "signed") return "_____________________";
    const signedAt = signer.signedAt ? new Date(signer.signedAt) : null;
    const when = signedAt
      ? signedAt.toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })
      : "";
    return `${signer.typedName ?? signer.name} — signed ${when}`;
  });
}

/** sha256 of the frozen renderedBody — pins exactly what every signer saw and signed. */
export function computeContentHash(renderedBody: string): string {
  return sha256Hex(renderedBody);
}

// Configured once: raw HTML in the source markdown is always dropped, never
// passed through, so a template can never embed script tags or arbitrary
// markup — the only way content reaches the page is as rendered markdown.
const safeRenderer = new marked.Renderer();
safeRenderer.html = () => "";

marked.setOptions({ gfm: true, breaks: false, renderer: safeRenderer });

/** Renders markdown (with system tokens already filled) to sanitized HTML for on-screen display. */
export function markdownToSafeHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
