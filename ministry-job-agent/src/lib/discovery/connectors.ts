import type { RawPosting } from "../domain/types";
import { DISCOVERY_SOURCES, mayReadListings, SOURCE_BY_KEY } from "./sources";
import { buildQueries, type QueryOptions } from "./search-terms";

/**
 * Connector interface.
 *
 * A connector either returns postings or returns a manual work item explaining
 * what a human needs to do. It never has a third option, and it never tries an
 * automated fetch against a source whose policy forbids one — `mayFetchAutomatically`
 * is checked by the runner, not left to each connector's discretion.
 */

export interface ManualWorkItem {
  sourceKey: string;
  sourceName: string;
  reason: string;
  /** Ready-to-use queries the candidate can paste into the site's own search. */
  suggestedQueries: string[];
  homepage: string;
  /** How to get results back into the system. */
  howToImport: string;
}

export interface DiscoveryResult {
  sourceKey: string;
  postings: RawPosting[];
  manualWork: ManualWorkItem | null;
  notes: string[];
}

export interface Connector {
  key: string;
  discover(opts: QueryOptions): Promise<DiscoveryResult>;
}

/**
 * The default connector for every source that is not automation-eligible.
 * It produces a precise manual work item rather than attempting a fetch.
 */
export function createManualConnector(sourceKey: string): Connector {
  return {
    key: sourceKey,
    async discover(opts) {
      const source = SOURCE_BY_KEY.get(sourceKey);
      if (!source) {
        return {
          sourceKey,
          postings: [],
          manualWork: null,
          notes: [`Unknown source "${sourceKey}" — skipped.`],
        };
      }
      const queries = buildQueries(sourceKey, opts).slice(0, 12).map((q) => q.query);
      return {
        sourceKey,
        postings: [],
        manualWork: {
          sourceKey,
          sourceName: source.name,
          reason: source.policyNote,
          suggestedQueries: queries,
          homepage: source.homepage,
          howToImport:
            "Run these searches in your own browser session, then save each posting as a .json or .md file in ./inbox and run `npm run import`.",
        },
        notes: [`${source.name} discovery is ${source.discoveryPolicy}; produced a manual review item instead of fetching.`],
      };
    },
  };
}

/**
 * Inbox connector: reads postings the candidate has dropped into ./inbox.
 * This is the path that always works, on every source, without touching anyone's
 * terms of service.
 */
export function createInboxConnector(
  readInbox: () => Promise<RawPosting[]>,
): Connector {
  return {
    key: "manual",
    async discover() {
      const postings = await readInbox();
      return {
        sourceKey: "manual",
        postings,
        manualWork: null,
        notes: [`Read ${postings.length} posting(s) from ./inbox.`],
      };
    },
  };
}

/**
 * Church careers-page connector.
 *
 * Phase 1 ships the shape but not the fetching: pointing an automated fetcher at
 * arbitrary church websites needs per-host robots.txt handling and a review of
 * which hosts to visit, and the candidate has not yet supplied a church list.
 * Until `fetchPage` is provided, this returns a manual item rather than pretending.
 */
export function createChurchSiteConnector(
  churchCareerUrls: string[],
  fetchPage?: (url: string) => Promise<RawPosting[]>,
): Connector {
  return {
    key: "church_site",
    async discover() {
      if (!fetchPage || churchCareerUrls.length === 0) {
        return {
          sourceKey: "church_site",
          postings: [],
          manualWork: {
            sourceKey: "church_site",
            sourceName: "Church career pages",
            reason:
              churchCareerUrls.length === 0
                ? "No church career-page URLs have been configured yet."
                : "No page fetcher has been wired up for church sites yet.",
            suggestedQueries: [],
            homepage: "",
            howToImport:
              "Add church career-page URLs in Settings, or drop postings into ./inbox and run `npm run import`.",
          },
          notes: ["Church-site fetching is not enabled in Phase 1."],
        };
      }

      const postings: RawPosting[] = [];
      const notes: string[] = [];
      for (const url of churchCareerUrls) {
        try {
          postings.push(...(await fetchPage(url)));
        } catch (err) {
          notes.push(`Failed to read ${url}: ${(err as Error).message}`);
        }
      }
      return { sourceKey: "church_site", postings, manualWork: null, notes };
    },
  };
}

/** Build the connector set for a discovery run, honoring each source's policy. */
export function buildConnectors(deps: {
  readInbox: () => Promise<RawPosting[]>;
  churchCareerUrls?: string[];
  fetchChurchPage?: (url: string) => Promise<RawPosting[]>;
}): Connector[] {
  const connectors: Connector[] = [createInboxConnector(deps.readInbox)];

  for (const source of DISCOVERY_SOURCES) {
    if (!source.enabled || source.key === "manual") continue;
    if (source.key === "church_site") {
      connectors.push(
        createChurchSiteConnector(deps.churchCareerUrls ?? [], deps.fetchChurchPage),
      );
      continue;
    }
    // Every remaining source is manual until its policy is reviewed and changed.
    if (!mayReadListings(source.key)) {
      connectors.push(createManualConnector(source.key));
    }
  }

  return connectors;
}
