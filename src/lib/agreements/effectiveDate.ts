export type SignerStatusForEffectiveDate = { status: string; signedAt: Date | null };

/**
 * The effective date is when the last required signer signs — i.e. only
 * meaningful once every signer has actually signed. Returns null until then,
 * which `fillSystemTokens` renders as a blank line.
 */
export function computeEffectiveDate(signers: SignerStatusForEffectiveDate[]): Date | null {
  if (signers.length === 0 || !signers.every((s) => s.status === "signed")) return null;
  return signers.reduce<Date | null>((latest, s) => {
    if (!s.signedAt) return latest;
    return !latest || s.signedAt > latest ? s.signedAt : latest;
  }, null);
}
