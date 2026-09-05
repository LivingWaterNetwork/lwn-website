import type { Capability } from "@/content/capabilities";

export function CapabilityCard({
  capability,
  index,
}: {
  capability: Capability;
  index: number;
}) {
  return (
    <article className="flex h-full flex-col border border-forest/10 bg-limestone-light p-8">
      <p className="font-display text-sm text-brass-dark">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-4 font-display text-xl leading-snug text-forest">
        {capability.name}
      </h3>
      <p className="mt-4 font-sans text-base leading-relaxed text-field">
        {capability.summary}
      </p>
    </article>
  );
}
