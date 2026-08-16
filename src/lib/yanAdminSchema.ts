import { YAN_CITY_NAMES } from "@/lib/yanCities";

/**
 * Field metadata for the generic YAN admin CRUD UI + server validation.
 * Adding a new manageable model means adding one entry here — the admin
 * list/edit pages and the API route are both driven off this config.
 */
export type YanAdminFieldType = "text" | "textarea" | "number" | "boolean" | "select" | "datetime" | "email";

export interface YanAdminField {
  name: string;
  label: string;
  type: YanAdminFieldType;
  required?: boolean;
  options?: string[];
  helpText?: string;
}

export interface YanAdminModelConfig {
  key: string;
  label: string;
  pluralLabel: string;
  /** Column(s) shown in the list table, in order. */
  listColumns: string[];
  fields: YanAdminField[];
  /** Fields editable inline from the list (fast publish/feature toggles). */
  quickToggleFields?: string[];
}

const STATUS_CONTENT = ["pending", "published", "archived"];
const STATUS_SUBMISSION = ["new", "reviewed", "archived"];

export const YAN_ADMIN_MODELS: Record<string, YanAdminModelConfig> = {
  groups: {
    key: "groups",
    label: "Group",
    pluralLabel: "Groups & Ministries",
    listColumns: ["name", "city", "neighborhood", "status", "featured", "verified"],
    quickToggleFields: ["featured", "verified"],
    fields: [
      { name: "name", label: "Group / ministry name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, helpText: "URL-safe, unique, e.g. beltline-young-adults" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "city", label: "City", type: "select", required: true, options: YAN_CITY_NAMES },
      { name: "neighborhood", label: "Neighborhood / area", type: "text" },
      { name: "meetingDay", label: "Meeting day", type: "text" },
      { name: "meetingFrequency", label: "Meeting frequency", type: "text" },
      { name: "ageRangeMin", label: "Age range (min)", type: "number" },
      { name: "ageRangeMax", label: "Age range (max)", type: "number" },
      { name: "churchAffiliation", label: "Church affiliation", type: "text" },
      { name: "gatheringType", label: "Gathering type", type: "select", options: ["in-person", "hybrid", "online"] },
      { name: "accessibilityNotes", label: "Accessibility notes", type: "textarea" },
      { name: "websiteUrl", label: "Website URL", type: "text" },
      { name: "instagramHandle", label: "Instagram handle", type: "text" },
      { name: "contactEmail", label: "Contact email", type: "email" },
      { name: "leaderName", label: "Leader name", type: "text" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "verified", label: "Verified", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_CONTENT, required: true },
    ],
  },
  leaders: {
    key: "leaders",
    label: "Leader",
    pluralLabel: "Leader Spotlights",
    listColumns: ["name", "city", "ministryName", "status", "featured", "consentGiven"],
    quickToggleFields: ["featured"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "role", label: "Role / title", type: "text" },
      { name: "ministryName", label: "Ministry / church", type: "text" },
      { name: "bio", label: "Bio", type: "textarea", required: true },
      { name: "photoUrl", label: "Photo URL", type: "text" },
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "city", label: "City", type: "select", required: true, options: YAN_CITY_NAMES },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "consentGiven", label: "Consent given", type: "boolean", required: true },
      { name: "status", label: "Status", type: "select", options: STATUS_CONTENT, required: true },
    ],
  },
  events: {
    key: "events",
    label: "Event",
    pluralLabel: "Events",
    listColumns: ["title", "city", "eventType", "startsAt", "status", "featured"],
    quickToggleFields: ["featured"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      {
        name: "eventType",
        label: "Event type",
        type: "select",
        required: true,
        options: ["roundtable", "prayer-gathering", "worship-night", "service-project", "training", "resource-exchange"],
      },
      { name: "city", label: "City", type: "select", required: true, options: YAN_CITY_NAMES },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "description", label: "Full description", type: "textarea" },
      { name: "startsAt", label: "Starts at", type: "datetime" },
      { name: "endsAt", label: "Ends at", type: "datetime" },
      { name: "venueName", label: "Venue name", type: "text" },
      { name: "venueAddress", label: "Venue address", type: "text" },
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "waitlistEnabled", label: "Waitlist enabled", type: "boolean" },
      { name: "audience", label: "Audience", type: "text" },
      { name: "featured", label: "Featured", type: "boolean" },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["draft", "coming-soon", "published", "past", "cancelled"],
      },
    ],
  },
  resources: {
    key: "resources",
    label: "Resource",
    pluralLabel: "Resources",
    listColumns: ["title", "city", "resourceType", "status", "featured"],
    quickToggleFields: ["featured"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      {
        name: "resourceType",
        label: "Resource type",
        type: "select",
        required: true,
        options: ["leader-tool", "curriculum", "prayer-guide", "event-kit", "reading", "training", "opportunity"],
      },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "fileUrl", label: "File URL", type: "text" },
      { name: "externalUrl", label: "External URL", type: "text" },
      { name: "city", label: "City", type: "select", required: true, options: YAN_CITY_NAMES },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_CONTENT, required: true },
    ],
  },
  stories: {
    key: "stories",
    label: "Story",
    pluralLabel: "Stories",
    listColumns: ["title", "city", "storyType", "status", "consentGiven"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      {
        name: "storyType",
        label: "Story type",
        type: "select",
        required: true,
        options: ["testimony", "movement-moment", "event-recap", "collaboration"],
      },
      { name: "body", label: "Story", type: "textarea", required: true },
      { name: "authorName", label: "Author name", type: "text" },
      { name: "mediaUrl", label: "Media URL", type: "text" },
      { name: "city", label: "City", type: "select", required: true, options: YAN_CITY_NAMES },
      { name: "consentGiven", label: "Consent given", type: "boolean", required: true },
      { name: "status", label: "Status", type: "select", options: STATUS_CONTENT, required: true },
    ],
  },
  "prayer-themes": {
    key: "prayer-themes",
    label: "Prayer theme",
    pluralLabel: "Prayer Themes",
    listColumns: ["title", "city", "scriptureRef", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Prayer prompt", type: "textarea", required: true },
      { name: "scriptureRef", label: "Scripture reference", type: "text" },
      { name: "city", label: "City", type: "select", required: true, options: YAN_CITY_NAMES },
      { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"], required: true },
    ],
  },
  "prayer-requests": {
    key: "prayer-requests",
    label: "Prayer request",
    pluralLabel: "Prayer Requests",
    listColumns: ["visibility", "city", "status", "allowFollowUp", "createdAt"],
    fields: [
      { name: "requestText", label: "Request", type: "textarea", required: true },
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "city", label: "City (if shared)", type: "select", options: YAN_CITY_NAMES },
      { name: "visibility", label: "Visibility", type: "select", options: ["private", "anonymous-public"] },
      { name: "allowFollowUp", label: "Allow follow-up", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_SUBMISSION.concat("published") },
    ],
  },
  "join-submissions": {
    key: "join-submissions",
    label: "Join submission",
    pluralLabel: "Join Submissions",
    listColumns: ["pathway", "name", "email", "status", "createdAt"],
    fields: [
      { name: "pathway", label: "Pathway", type: "text" },
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "ministryName", label: "Ministry", type: "text" },
      { name: "city", label: "City", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "message", label: "Message", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: STATUS_SUBMISSION },
    ],
  },
  subscribers: {
    key: "subscribers",
    label: "Subscriber",
    pluralLabel: "Subscribers",
    listColumns: ["email", "firstName", "interests", "createdAt"],
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "firstName", label: "First name", type: "text" },
      { name: "interests", label: "Interests", type: "text" },
    ],
  },
};

export function getYanAdminModel(key: string): YanAdminModelConfig | undefined {
  return YAN_ADMIN_MODELS[key];
}
