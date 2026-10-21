/**
 * The additive-only DDL for the portal_* tables — shared by
 * scripts/portal-migrate.ts (the CLI dry-run/--apply runner) so there is
 * exactly one copy of the statements and the allowlist check, not two
 * drifting copies.
 *
 * See scripts/portal-migrate.ts's own header comment for the full rules.
 */

export type Statement = {
  description: string;
  sql: string;
};

// Tables this file is allowed to CREATE and later ALTER. Nothing outside
// this set may appear as the target of any statement below.
export const CREATED_TABLES = [
  "portal_persons",
  "portal_staff_roles",
  "portal_partner_orgs",
  "portal_partner_users",
  "portal_login_challenges",
  "portal_login_throttle",
  "portal_sessions",
  "portal_program_templates",
  "portal_enrollments",
  "portal_phases",
  "portal_meetings",
  "portal_meeting_private_notes",
  "portal_action_steps",
  "portal_documents",
  "portal_document_blobs",
  "portal_installments",
  "portal_partner_grants",
  "portal_events",
] as const;

export const STATEMENTS: Statement[] = [
  {
    description: "create table portal_persons",
    sql: `CREATE TABLE "portal_persons" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "phone" TEXT,
      "isTest" BOOLEAN NOT NULL DEFAULT false,
      "status" TEXT NOT NULL DEFAULT 'active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "unique index portal_persons_email_key",
    sql: `CREATE UNIQUE INDEX "portal_persons_email_key" ON "portal_persons"("email")`,
  },
  {
    description: "create table portal_staff_roles",
    sql: `CREATE TABLE "portal_staff_roles" (
      "id" TEXT PRIMARY KEY,
      "personId" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "grantedBy" TEXT NOT NULL,
      "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "revokedAt" TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_staff_roles_personId_idx",
    sql: `CREATE INDEX "portal_staff_roles_personId_idx" ON "portal_staff_roles"("personId")`,
  },
  {
    description: "create table portal_partner_orgs",
    sql: `CREATE TABLE "portal_partner_orgs" (
      "id" TEXT PRIMARY KEY,
      "key" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "unique index portal_partner_orgs_key_key",
    sql: `CREATE UNIQUE INDEX "portal_partner_orgs_key_key" ON "portal_partner_orgs"("key")`,
  },
  {
    description: "create table portal_partner_users",
    sql: `CREATE TABLE "portal_partner_users" (
      "id" TEXT PRIMARY KEY,
      "personId" TEXT NOT NULL,
      "partnerOrgId" TEXT NOT NULL,
      "revokedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_partner_users_personId_idx",
    sql: `CREATE INDEX "portal_partner_users_personId_idx" ON "portal_partner_users"("personId")`,
  },
  {
    description: "index portal_partner_users_partnerOrgId_idx",
    sql: `CREATE INDEX "portal_partner_users_partnerOrgId_idx" ON "portal_partner_users"("partnerOrgId")`,
  },
  {
    description: "create table portal_login_challenges",
    sql: `CREATE TABLE "portal_login_challenges" (
      "id" TEXT PRIMARY KEY,
      "emailHash" TEXT NOT NULL,
      "personId" TEXT,
      "codeHash" TEXT NOT NULL,
      "linkTokenHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "usedAt" TIMESTAMP(3),
      "ip" TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_login_challenges_emailHash_idx",
    sql: `CREATE INDEX "portal_login_challenges_emailHash_idx" ON "portal_login_challenges"("emailHash")`,
  },
  {
    description: "create table portal_login_throttle",
    sql: `CREATE TABLE "portal_login_throttle" (
      "id" TEXT PRIMARY KEY,
      "key" TEXT NOT NULL,
      "windowStart" TIMESTAMP(3) NOT NULL,
      "count" INTEGER NOT NULL DEFAULT 0,
      "lockedUntil" TIMESTAMP(3)
    )`,
  },
  {
    description: "unique index portal_login_throttle_key_key",
    sql: `CREATE UNIQUE INDEX "portal_login_throttle_key_key" ON "portal_login_throttle"("key")`,
  },
  {
    description: "create table portal_sessions",
    sql: `CREATE TABLE "portal_sessions" (
      "id" TEXT PRIMARY KEY,
      "tokenHash" TEXT NOT NULL,
      "personId" TEXT NOT NULL,
      "activeEnrollmentId" TEXT,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "revokedAt" TIMESTAMP(3),
      "ip" TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "unique index portal_sessions_tokenHash_key",
    sql: `CREATE UNIQUE INDEX "portal_sessions_tokenHash_key" ON "portal_sessions"("tokenHash")`,
  },
  {
    description: "index portal_sessions_personId_idx",
    sql: `CREATE INDEX "portal_sessions_personId_idx" ON "portal_sessions"("personId")`,
  },
  {
    description: "create table portal_program_templates",
    sql: `CREATE TABLE "portal_program_templates" (
      "id" TEXT PRIMARY KEY,
      "key" TEXT NOT NULL,
      "version" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "body" JSONB NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "sha256" TEXT NOT NULL,
      "publishedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "unique index portal_program_templates_key_version_key",
    sql: `CREATE UNIQUE INDEX "portal_program_templates_key_version_key" ON "portal_program_templates"("key", "version")`,
  },
  {
    description: "create table portal_enrollments",
    sql: `CREATE TABLE "portal_enrollments" (
      "id" TEXT PRIMARY KEY,
      "personId" TEXT NOT NULL,
      "templateId" TEXT NOT NULL,
      "templateSnapshot" JSONB NOT NULL,
      "coachPersonId" TEXT,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "startDate" TIMESTAMP(3),
      "endDate" TIMESTAMP(3),
      "currentPhaseKey" TEXT,
      "modules" JSONB NOT NULL,
      "agreementId" TEXT,
      "paymentUrl" TEXT,
      "invitedAt" TIMESTAMP(3),
      "archivedAt" TIMESTAMP(3),
      "isTest" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_enrollments_personId_idx",
    sql: `CREATE INDEX "portal_enrollments_personId_idx" ON "portal_enrollments"("personId")`,
  },
  {
    description: "index portal_enrollments_coachPersonId_idx",
    sql: `CREATE INDEX "portal_enrollments_coachPersonId_idx" ON "portal_enrollments"("coachPersonId")`,
  },
  {
    description:
      "foreign key portal_enrollments.agreementId -> agreements.id (read-only reference; agreements table is never altered)",
    sql: `ALTER TABLE "portal_enrollments" ADD CONSTRAINT "portal_enrollments_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  },
  {
    description: "create table portal_phases",
    sql: `CREATE TABLE "portal_phases" (
      "id" TEXT PRIMARY KEY,
      "enrollmentId" TEXT NOT NULL,
      "key" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "startsOn" TIMESTAMP(3),
      "endsOn" TIMESTAMP(3),
      "summary" TEXT NOT NULL,
      "order" INTEGER NOT NULL
    )`,
  },
  {
    description: "index portal_phases_enrollmentId_idx",
    sql: `CREATE INDEX "portal_phases_enrollmentId_idx" ON "portal_phases"("enrollmentId")`,
  },
  {
    description: "create table portal_meetings",
    sql: `CREATE TABLE "portal_meetings" (
      "id" TEXT PRIMARY KEY,
      "enrollmentId" TEXT NOT NULL,
      "scheduledAt" TIMESTAMP(3),
      "durationMin" INTEGER NOT NULL DEFAULT 60,
      "format" TEXT NOT NULL DEFAULT 'zoom',
      "status" TEXT NOT NULL DEFAULT 'scheduled',
      "countsTowardTotal" BOOLEAN NOT NULL DEFAULT true,
      "sharedRecap" TEXT,
      "recapSharedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_meetings_enrollmentId_idx",
    sql: `CREATE INDEX "portal_meetings_enrollmentId_idx" ON "portal_meetings"("enrollmentId")`,
  },
  {
    description: "create table portal_meeting_private_notes",
    sql: `CREATE TABLE "portal_meeting_private_notes" (
      "id" TEXT PRIMARY KEY,
      "meetingId" TEXT NOT NULL,
      "enrollmentId" TEXT NOT NULL,
      "authorPersonId" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_meeting_private_notes_meetingId_idx",
    sql: `CREATE INDEX "portal_meeting_private_notes_meetingId_idx" ON "portal_meeting_private_notes"("meetingId")`,
  },
  {
    description: "index portal_meeting_private_notes_enrollmentId_idx",
    sql: `CREATE INDEX "portal_meeting_private_notes_enrollmentId_idx" ON "portal_meeting_private_notes"("enrollmentId")`,
  },
  {
    description: "create table portal_action_steps",
    sql: `CREATE TABLE "portal_action_steps" (
      "id" TEXT PRIMARY KEY,
      "enrollmentId" TEXT NOT NULL,
      "meetingId" TEXT,
      "phaseKey" TEXT,
      "title" TEXT NOT NULL,
      "detail" TEXT,
      "dueOn" TIMESTAMP(3),
      "status" TEXT NOT NULL DEFAULT 'open',
      "doneAt" TIMESTAMP(3),
      "memberNote" TEXT,
      "tags" TEXT[] NOT NULL DEFAULT '{}',
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdBy" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_action_steps_enrollmentId_idx",
    sql: `CREATE INDEX "portal_action_steps_enrollmentId_idx" ON "portal_action_steps"("enrollmentId")`,
  },
  {
    description: "create table portal_documents",
    sql: `CREATE TABLE "portal_documents" (
      "id" TEXT PRIMARY KEY,
      "enrollmentId" TEXT,
      "templateKey" TEXT,
      "kind" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "filename" TEXT NOT NULL,
      "mime" TEXT NOT NULL,
      "size" INTEGER NOT NULL,
      "sha256" TEXT NOT NULL,
      "agreementDocumentId" TEXT,
      "uploadedBy" TEXT NOT NULL,
      "visibleToMember" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_documents_enrollmentId_idx",
    sql: `CREATE INDEX "portal_documents_enrollmentId_idx" ON "portal_documents"("enrollmentId")`,
  },
  {
    description:
      "foreign key portal_documents.agreementDocumentId -> agreement_documents.id (read-only reference; agreement_documents table is never altered)",
    sql: `ALTER TABLE "portal_documents" ADD CONSTRAINT "portal_documents_agreementDocumentId_fkey" FOREIGN KEY ("agreementDocumentId") REFERENCES "agreement_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  },
  {
    description: "create table portal_document_blobs",
    sql: `CREATE TABLE "portal_document_blobs" (
      "id" TEXT PRIMARY KEY,
      "documentId" TEXT NOT NULL,
      "bytes" BYTEA NOT NULL
    )`,
  },
  {
    description: "unique index portal_document_blobs_documentId_key",
    sql: `CREATE UNIQUE INDEX "portal_document_blobs_documentId_key" ON "portal_document_blobs"("documentId")`,
  },
  {
    description: "create table portal_installments",
    sql: `CREATE TABLE "portal_installments" (
      "id" TEXT PRIMARY KEY,
      "enrollmentId" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "dueOn" TIMESTAMP(3) NOT NULL,
      "amountCents" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'due',
      "paidOn" TIMESTAMP(3),
      "note" TEXT,
      "markedBy" TEXT
    )`,
  },
  {
    description: "index portal_installments_enrollmentId_idx",
    sql: `CREATE INDEX "portal_installments_enrollmentId_idx" ON "portal_installments"("enrollmentId")`,
  },
  {
    description: "create table portal_partner_grants",
    sql: `CREATE TABLE "portal_partner_grants" (
      "id" TEXT PRIMARY KEY,
      "enrollmentId" TEXT NOT NULL,
      "partnerOrgId" TEXT NOT NULL,
      "modules" JSONB NOT NULL,
      "grantedByPersonId" TEXT NOT NULL,
      "grantedVia" TEXT NOT NULL,
      "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "revokedAt" TIMESTAMP(3)
    )`,
  },
  {
    description: "index portal_partner_grants_enrollmentId_idx",
    sql: `CREATE INDEX "portal_partner_grants_enrollmentId_idx" ON "portal_partner_grants"("enrollmentId")`,
  },
  {
    description: "index portal_partner_grants_partnerOrgId_idx",
    sql: `CREATE INDEX "portal_partner_grants_partnerOrgId_idx" ON "portal_partner_grants"("partnerOrgId")`,
  },
  {
    description: "create table portal_events",
    sql: `CREATE TABLE "portal_events" (
      "id" TEXT PRIMARY KEY,
      "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      "actorPersonId" TEXT,
      "actorRole" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "subjectType" TEXT NOT NULL,
      "subjectId" TEXT NOT NULL,
      "enrollmentId" TEXT,
      "ip" TEXT,
      "userAgent" TEXT,
      "meta" JSONB
    )`,
  },
  {
    description: "index portal_events_enrollmentId_idx",
    sql: `CREATE INDEX "portal_events_enrollmentId_idx" ON "portal_events"("enrollmentId")`,
  },
  {
    description: "index portal_events_subjectType_subjectId_idx",
    sql: `CREATE INDEX "portal_events_subjectType_subjectId_idx" ON "portal_events"("subjectType", "subjectId")`,
  },
];

/**
 * Migration 002 — run separately from STATEMENTS above (which was already
 * applied against the live shared Preview+Production database on
 * 2026-10-21; re-running it as a blind replay would fail immediately on
 * the first "already exists" CREATE TABLE). Each later increment belongs
 * in its own named export here, run by its own small CLI script, exactly
 * like a new Agreements/program template version file — never folded back
 * into an already-applied batch.
 *
 * Adds `portal_persons.hideProgress`: a member's own opt-out of the
 * progress/streak UI. Nullable-safe default (`DEFAULT false`), so every
 * existing row gets the column with no backfill UPDATE needed.
 */
export const STATEMENTS_002_HIDE_PROGRESS: Statement[] = [
  {
    description: "add column portal_persons.hideProgress",
    sql: `ALTER TABLE "portal_persons" ADD COLUMN "hideProgress" BOOLEAN NOT NULL DEFAULT false`,
  },
];

// DROP/TRUNCATE/RENAME/GRANT/REVOKE are refused anywhere in a statement.
// DELETE/UPDATE are refused only as the statement's own command (a FK's
// "ON DELETE SET NULL ON UPDATE CASCADE" referential action is not a DML
// statement and is allowed).
const FORBIDDEN_ANYWHERE = /\b(DROP|TRUNCATE|RENAME|GRANT|REVOKE)\b/i;
const FORBIDDEN_LEADING_COMMAND = /^\s*(DELETE|UPDATE)\b/i;
const CREATE_TABLE_RE = /^CREATE TABLE "?(portal_[a-z_]+)"?\s*\(/i;
const CREATE_INDEX_RE = /^CREATE (?:UNIQUE )?INDEX "?[A-Za-z0-9_]+"?\s+ON\s+"?(portal_[a-z_]+)"?\s*\(/i;
const CREATE_TYPE_RE = /^CREATE TYPE "?(portal_[A-Za-z0-9_]+)"?\s+AS/i;
const ALTER_ADD_CONSTRAINT_RE = /^ALTER TABLE "?(portal_[a-z_]+)"?\s+ADD CONSTRAINT/i;
// Deliberately narrow: a column added this way must be nullable or carry a
// DEFAULT (so it never requires a backfill UPDATE), and the column/type
// portion is restricted to a short list of primitive SQL types — this is
// for small, additive schema growth on a table this file already created,
// never a way to smuggle arbitrary DDL past the allowlist.
const ALTER_ADD_COLUMN_RE =
  /^ALTER TABLE "?(portal_[a-z_]+)"?\s+ADD COLUMN "?[A-Za-z][A-Za-z0-9_]*"?\s+(BOOLEAN|TEXT|INTEGER|TIMESTAMP\(3\))\s*(NOT NULL\s+)?DEFAULT\s+\S.*$/i;

export function assertStatementIsSafe(stmt: Statement): void {
  const sql = stmt.sql.trim();

  if (FORBIDDEN_ANYWHERE.test(sql) || FORBIDDEN_LEADING_COMMAND.test(sql)) {
    throw new Error(
      `Refusing migration: statement "${stmt.description}" contains a forbidden keyword (DROP/TRUNCATE/DELETE/UPDATE/RENAME/GRANT/REVOKE).`
    );
  }

  const createTable = sql.match(CREATE_TABLE_RE);
  const createIndex = sql.match(CREATE_INDEX_RE);
  const createType = sql.match(CREATE_TYPE_RE);
  const alterAddConstraint = sql.match(ALTER_ADD_CONSTRAINT_RE);
  const alterAddColumn = sql.match(ALTER_ADD_COLUMN_RE);

  const match = createTable ?? createIndex ?? createType ?? alterAddConstraint ?? alterAddColumn;
  if (!match) {
    throw new Error(
      `Refusing migration: statement "${stmt.description}" is not a recognized CREATE TABLE / CREATE INDEX / CREATE TYPE / ` +
        `ALTER TABLE ... ADD CONSTRAINT / ALTER TABLE ... ADD COLUMN (nullable or defaulted) on a portal_* table.`
    );
  }

  const table = match[1];
  if (!table.startsWith("portal_")) {
    throw new Error(`Refusing migration: statement "${stmt.description}" targets non-portal table "${table}".`);
  }

  if ((createTable || createType) && !CREATED_TABLES.includes(table as (typeof CREATED_TABLES)[number])) {
    throw new Error(
      `Refusing migration: statement "${stmt.description}" creates "${table}", which is not in the declared CREATED_TABLES list.`
    );
  }

  if (
    (createIndex || alterAddConstraint || alterAddColumn) &&
    !CREATED_TABLES.includes(table as (typeof CREATED_TABLES)[number])
  ) {
    throw new Error(
      `Refusing migration: statement "${stmt.description}" targets "${table}", which this file does not create.`
    );
  }
}
