import { prisma } from "@/lib/prisma";

/**
 * Maps an admin model key to its Prisma delegate. Deliberately an allowlist
 * switch (not dynamic `prisma[key]` property access) so the admin API can
 * never be pointed at a model outside this list, YAN or otherwise.
 */
export function getYanPrismaDelegate(modelKey: string) {
  switch (modelKey) {
    case "groups":
      return prisma.yanGroup;
    case "leaders":
      return prisma.yanLeader;
    case "events":
      return prisma.yanEvent;
    case "resources":
      return prisma.yanResource;
    case "stories":
      return prisma.yanStory;
    case "prayer-themes":
      return prisma.yanPrayerTheme;
    case "prayer-requests":
      return prisma.yanPrayerRequest;
    case "join-submissions":
      return prisma.yanJoinSubmission;
    case "subscribers":
      return prisma.yanSubscriber;
    default:
      return null;
  }
}
