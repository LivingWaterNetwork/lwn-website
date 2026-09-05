import type { ProcessStage } from "@/content/process";

/**
 * Renders the step's contents, NOT the list item. Every caller sits inside an
 * <ol>, and the entrance wrapper around it is the <li> — see Reveal's `as`
 * prop. A wrapper between <ol> and <li> is what broke the list's semantics
 * before, so the item element belongs to whatever is outermost, not here.
 */
export function ProcessStep({
  stage,
  detail = "summary",
}: {
  stage: ProcessStage;
  detail?: "summary" | "full";
}) {
  return (
    <div className="flex gap-6 border-t border-limestone/20 pt-6">
      <span
        aria-hidden="true"
        className="mt-1 font-display text-2xl leading-none text-brass"
      >
        {stage.number}
      </span>
      <div>
        <h3 className="font-display text-xl text-limestone">{stage.name}</h3>
        <p className="mt-2 max-w-prose font-sans text-base leading-relaxed text-sage">
          {detail === "full" ? stage.body : stage.summary}
        </p>
      </div>
    </div>
  );
}
