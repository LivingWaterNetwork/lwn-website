/**
 * Identifies a file's real type from its magic bytes, never from its
 * extension or client-declared Content-Type (both are easy to fake). Only
 * the four types the portal accepts for upload are recognized; anything
 * else is rejected.
 */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export type AcceptedDocumentMime =
  | "application/pdf"
  | "image/png"
  | "image/jpeg"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function startsWith(buf: Buffer, bytes: number[]): boolean {
  if (buf.length < bytes.length) return false;
  return bytes.every((b, i) => buf[i] === b);
}

export function detectDocumentMime(bytes: Buffer): AcceptedDocumentMime | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "application/pdf"; // %PDF
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  // DOCX is a zip (PK\x03\x04); we can't fully distinguish it from any other
  // zip from magic bytes alone, but combined with the 10MB cap and this
  // being an admin-only upload (never member-supplied), that's an
  // acceptable tradeoff for Phase 1.
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return null;
}

export interface ValidatedUpload {
  mime: AcceptedDocumentMime;
  size: number;
}

export class DocumentValidationError extends Error {}

export function validateDocumentUpload(bytes: Buffer): ValidatedUpload {
  if (bytes.length === 0) throw new DocumentValidationError("The file is empty.");
  if (bytes.length > MAX_UPLOAD_BYTES) throw new DocumentValidationError("Files must be 10 MB or smaller.");

  const mime = detectDocumentMime(bytes);
  if (!mime) throw new DocumentValidationError("Only PDF, PNG, JPG, and DOCX files are accepted.");

  return { mime, size: bytes.length };
}
