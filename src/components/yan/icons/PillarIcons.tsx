/** Rounded, single-weight line icons — one per movement pillar, matching the brand's icon style. */
const shared = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function ConnectIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" {...shared}>
      <circle cx="10" cy="10" r="3.5" />
      <circle cx="22" cy="10" r="3.5" />
      <circle cx="16" cy="22" r="3.5" />
      <path d="M13 12l3 7M19 12l-3 7M13.5 10h5" />
    </svg>
  );
}

export function CollaborateIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" {...shared}>
      <path d="M6 16l5-5 4 3 4-3 5 5" />
      <path d="M12 20l4 3 4-3" />
      <circle cx="6" cy="16" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="26" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PrayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" {...shared}>
      <path d="M16 6c0 6-5 7-5 12a5 5 0 0010 0c0-5-5-6-5-12z" />
      <path d="M16 22v4" />
    </svg>
  );
}

export function ImpactIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" {...shared}>
      <path d="M6 26V14l5-3 5 3v12M16 26V10l5-3 5 3v16" />
      <path d="M6 26h20" />
    </svg>
  );
}
