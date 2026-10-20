import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions
) => Promise<Buffer>;

const SCRYPT_KEYLEN = 64;
// N=16384, r=8, p=1 — Node's documented default cost parameters for scrypt,
// tuned for an interactive login (not a bulk hashing job), run once per
// access-code or password check.
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;

/**
 * Hashes a plaintext secret (an agreement access code) for storage. Format:
 * `scrypt:<saltHex>:<hashHex>`. The plaintext is never stored or logged.
 */
export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(secret, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS)) as Buffer;
  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/** Verifies a plaintext secret against a stored `hashSecret` output, in constant time. */
export async function verifySecret(secret: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;

  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derivedKey = (await scrypt(secret, salt, expected.length, SCRYPT_PARAMS)) as Buffer;
    if (derivedKey.length !== expected.length) return false;
    return timingSafeEqual(derivedKey, expected);
  } catch {
    return false;
  }
}

// Unambiguous alphabet: no 0/O, 1/I/L — chosen so a code read aloud or typed
// on a phone keyboard can't be misread as a different valid character.
const ACCESS_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Generates a random 8-character access code from the unambiguous alphabet. */
export function generateAccessCode(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ACCESS_CODE_ALPHABET[bytes[i] % ACCESS_CODE_ALPHABET.length];
  }
  return code;
}

/** Generates `<slugBase>-<8 random hex>` — the slug never encodes anything reversible beyond the display name. */
export function generateAgreementSlug(name: string): string {
  const slugBase = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "agreement";
  return `${slugBase}-${randomBytes(4).toString("hex")}`;
}

/** sha256 of a UTF-8 string, hex-encoded. */
export function sha256Hex(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}
