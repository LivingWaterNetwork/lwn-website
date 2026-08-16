import { FadeInSection } from "@/components/motion/FadeInSection";
import { getFaithContent } from "@/lib/yanFaithContent";

/**
 * Anchors a page in Scripture (and, where a real verified quote exists, a
 * historic Christian teacher) — the reminder that every page here exists to
 * point back to Jesus, not to the network itself. `pageKey` must match an
 * entry in `yanFaithContent.ts`; never invent scripture or a quote here.
 */
export function YanFaithAnchor({ pageKey, dark = false }: { pageKey: string; dark?: boolean }) {
  const content = getFaithContent(pageKey);
  if (!content) return null;

  return (
    <FadeInSection className="max-w-2xl mx-auto text-center">
      <p className={`yan-eyebrow ${dark ? "yan-eyebrow-dark" : ""} mb-4`}>For the Glory of Jesus</p>
      <blockquote className={`yan-h3 !font-normal !text-xl md:!text-2xl italic leading-relaxed mb-3 ${dark ? "text-white/90" : "text-yan-navy/85"}`}>
        {content.scripture.text}
      </blockquote>
      <p className={`text-sm font-yan-heading font-semibold mb-8 ${dark ? "text-white/50" : "text-yan-navy/45"}`}>
        {content.scripture.reference}
      </p>

      {content.quote && (
        <div className={`pt-8 border-t ${dark ? "border-white/10" : "border-yan-navy/10"}`}>
          <p className={`font-yan-body text-base leading-relaxed mb-3 ${dark ? "text-white/70" : "text-yan-navy/65"}`}>
            &ldquo;{content.quote.text}&rdquo;
          </p>
          <p className={`text-xs font-yan-body ${dark ? "text-white/40" : "text-yan-navy/40"}`}>
            — {content.quote.author}, <em>{content.quote.source}</em>
          </p>
        </div>
      )}
    </FadeInSection>
  );
}
