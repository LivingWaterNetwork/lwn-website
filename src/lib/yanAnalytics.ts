"use client";

/**
 * No-op analytics event helper for YAN. The site has no analytics provider
 * configured yet, so this only logs in development — swap the body of
 * `track()` for a real provider call (GA4, Plausible, etc.) once one is
 * chosen, without touching any of the ~15 call sites below.
 *
 * Never pass free-text form content, prayer text, or email addresses as
 * event properties — only structured, non-identifying values.
 */
export type YanAnalyticsEvent =
  | "yan_gateway_opened"
  | "yan_gateway_pathway_selected"
  | "yan_join_started"
  | "yan_join_completed"
  | "yan_network_searched"
  | "yan_network_profile_opened"
  | "yan_event_interest_submitted"
  | "yan_event_registration_completed"
  | "yan_prayer_request_submitted"
  | "yan_resource_opened"
  | "yan_story_submission_started"
  | "yan_story_submission_completed"
  | "yan_lwn_entry_clicked"
  | "yan_return_to_lwn_clicked";

export function track(event: YanAnalyticsEvent, properties?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[yan-analytics]", event, properties ?? {});
  }
  // Intentionally no-op beyond dev logging until a provider is wired up.
}
