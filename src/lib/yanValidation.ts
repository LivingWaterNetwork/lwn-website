import { z } from "zod";

const name = z.string().trim().min(1, "Name is required.").max(200);
const email = z.string().trim().min(1, "Email is required.").email("Please enter a valid email.").max(320);
const optionalPhone = z.string().trim().max(40).optional().or(z.literal(""));
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

/** /yan/join — first question picks the pathway; the rest adapts around it. */
export const yanJoinSchema = z.object({
  pathway: z.enum([
    "ministry-leader",
    "pastor",
    "roundtable-interest",
    "find-community",
    "partner-volunteer",
    "updates",
  ]),
  name,
  email,
  phone: optionalPhone,
  ministryName: optionalText(200),
  city: optionalText(120),
  role: optionalText(120),
  message: optionalText(3000),
});

/** /yan/events — roundtable/event registration + waitlist. */
export const yanEventRegistrationSchema = z.object({
  eventId: z.string().trim().min(1),
  name,
  email,
  phone: optionalPhone,
  role: optionalText(120),
  organization: optionalText(200),
});

/** /yan/pray — private/anonymized prayer request submission. */
export const yanPrayerRequestSchema = z.object({
  requestText: z.string().trim().min(1, "Please share your prayer request.").max(3000),
  name: optionalText(200),
  email: z.string().trim().email("Please enter a valid email.").max(320).optional().or(z.literal("")),
  city: optionalText(120),
  visibility: z.enum(["private", "anonymous-public"]).default("private"),
  allowFollowUp: z.boolean().default(false),
});

/** /yan/network — "Add your group" / "Suggest an update" submissions (queued for moderation). */
export const yanGroupSuggestionSchema = z.object({
  name,
  email,
  groupName: z.string().trim().min(1, "Group or ministry name is required.").max(200),
  city: optionalText(120),
  neighborhood: optionalText(120),
  meetingDay: optionalText(60),
  meetingFrequency: optionalText(60),
  gatheringType: optionalText(40),
  websiteUrl: optionalText(300),
  instagramHandle: optionalText(100),
  description: z.string().trim().min(1, "Please describe the group.").max(2000),
});

/** /yan/resources — resource submission for review. */
export const yanResourceSubmissionSchema = z.object({
  name,
  email,
  title: z.string().trim().min(1, "Title is required.").max(200),
  resourceType: z.enum(["leader-tool", "curriculum", "prayer-guide", "event-kit", "reading", "training", "opportunity"]),
  description: z.string().trim().min(1, "Please describe the resource.").max(2000),
  externalUrl: optionalText(300),
  city: optionalText(120),
});

/** /yan/stories — testimony/story submission for review. */
export const yanStorySubmissionSchema = z.object({
  name,
  email,
  title: z.string().trim().min(1, "Title is required.").max(200),
  storyType: z.enum(["testimony", "movement-moment", "event-recap", "collaboration"]),
  body: z.string().trim().min(1, "Please share the story.").max(4000),
  consentGiven: z.literal(true, { message: "Consent to publish is required." }),
  city: optionalText(120),
});

/** /yan/leaders — leader/ministry nomination for review. */
export const yanLeaderNominationSchema = z.object({
  name: z.string().trim().min(1, "Leader's name is required.").max(200),
  ministryName: optionalText(200),
  role: optionalText(120),
  bio: z.string().trim().min(1, "Please share a short bio.").max(2000),
  nominatedByName: name,
  nominatedByEmail: email,
  consentGiven: z.literal(true, { message: "Confirming consent is required." }),
  city: optionalText(120),
});

/** Shared "get launch updates" subscribe form. */
export const yanSubscribeSchema = z.object({
  email,
  firstName: optionalText(120),
  interests: optionalText(200),
});

export { HONEYPOT_FIELD, isHoneypotTripped, firstIssueMessage } from "@/lib/validation";
