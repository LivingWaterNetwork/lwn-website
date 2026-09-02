import { CATALYST_STATUS_LABELS, type CatalystStatus } from "@/lib/catalystTypes";

const STATUS_CLASS: Record<CatalystStatus, string> = {
  live: "cat-status-live",
  "in-development": "cat-status-in-development",
  "foundation-strategy": "cat-status-foundation-strategy",
  private: "cat-status-private",
  archived: "cat-status-archived",
};

/**
 * Renders a project's delivery state. Always shown alongside project titles so
 * work in progress is never presented as finished.
 */
export function CatalystStatusBadge({ status }: { status: CatalystStatus }) {
  return (
    <span className={`cat-status ${STATUS_CLASS[status]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {CATALYST_STATUS_LABELS[status]}
    </span>
  );
}
