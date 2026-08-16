"use client";

import { useMemo, useState } from "react";
import { track } from "@/lib/yanAnalytics";

export interface YanGroupSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  neighborhood: string | null;
  meetingDay: string | null;
  meetingFrequency: string | null;
  gatheringType: string | null;
  churchAffiliation: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  featured: boolean;
  verified: boolean;
}

export function YanNetworkContent({ groups }: { groups: YanGroupSummary[] }) {
  const [query, setQuery] = useState("");
  const [neighborhood, setNeighborhood] = useState("all");
  const [view, setView] = useState<"list" | "map">("list");
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const neighborhoods = useMemo(
    () => Array.from(new Set(groups.map((g) => g.neighborhood).filter(Boolean))) as string[],
    [groups]
  );

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const matchesQuery =
        !query || g.name.toLowerCase().includes(query.toLowerCase()) || g.description.toLowerCase().includes(query.toLowerCase());
      const matchesNeighborhood = neighborhood === "all" || g.neighborhood === neighborhood;
      return matchesQuery && matchesNeighborhood;
    });
  }, [groups, query, neighborhood]);

  const grouped = useMemo(() => {
    const map = new Map<string, YanGroupSummary[]>();
    filtered.forEach((g) => {
      const key = g.neighborhood ?? "Atlanta area";
      map.set(key, [...(map.get(key) ?? []), g]);
    });
    return map;
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <label htmlFor="network-search" className="sr-only">
            Search the network
          </label>
          <input
            id="network-search"
            type="search"
            placeholder="Search by name or focus…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              track("yan_network_searched");
            }}
            className="yan-form-input"
          />
        </div>
        <select
          aria-label="Filter by neighborhood"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="yan-form-input sm:w-56"
        >
          <option value="all">All neighborhoods</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-yan-navy/15 overflow-hidden shrink-0" role="group" aria-label="View mode">
          <button
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`px-4 text-sm font-yan-body font-medium transition-colors ${view === "list" ? "bg-yan-blue text-white" : "bg-white text-yan-navy/60"}`}
          >
            List
          </button>
          <button
            onClick={() => setView("map")}
            aria-pressed={view === "map"}
            className={`px-4 text-sm font-yan-body font-medium transition-colors ${view === "map" ? "bg-yan-blue text-white" : "bg-white text-yan-navy/60"}`}
          >
            Map
          </button>
        </div>
      </div>

      {filtered.length === 0 ? null : view === "map" ? (
        <div className="yan-card">
          <p className="text-xs text-yan-navy/40 mb-4">
            Grouped by area — for privacy, exact meeting addresses aren&apos;t shown. Switch to List for full details.
          </p>
          <div className="flex flex-wrap gap-3">
            {Array.from(grouped.entries()).map(([area, areaGroups]) => (
              <div key={area} className="rounded-xl border border-yan-navy/10 p-4 min-w-[10rem]">
                <p className="text-xs font-yan-heading font-bold uppercase tracking-wide text-yan-blue mb-2">{area}</p>
                <ul className="space-y-1">
                  {areaGroups.map((g) => (
                    <li key={g.id}>
                      <button onClick={() => { setOpenGroup(g.id); track("yan_network_profile_opened"); }} className="text-sm text-yan-navy hover:text-yan-blue text-left">
                        {g.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {filtered.map((g) => (
            <li key={g.id} className="yan-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="yan-h3 !text-lg text-yan-navy">{g.name}</h3>
                {g.verified && <span className="yan-pill !text-yan-blue !border-yan-blue/30 !bg-yan-blue/5 shrink-0">Verified</span>}
              </div>
              {g.neighborhood && <p className="text-xs text-yan-navy/40 mb-2">{g.neighborhood}</p>}
              <p className="text-sm text-yan-navy/65 font-yan-body leading-relaxed mb-3 line-clamp-3">{g.description}</p>
              <div className="flex flex-wrap gap-1.5 text-xs text-yan-navy/50 mb-3">
                {g.meetingDay && <span>{g.meetingDay}</span>}
                {g.meetingFrequency && <span>&middot; {g.meetingFrequency}</span>}
                {g.gatheringType && <span>&middot; {g.gatheringType}</span>}
              </div>
              <button
                onClick={() => { setOpenGroup(g.id); track("yan_network_profile_opened"); }}
                className="text-yan-blue text-sm font-semibold"
              >
                View details
              </button>
            </li>
          ))}
        </ul>
      )}

      {openGroup && (
        <GroupDetailDialog group={groups.find((g) => g.id === openGroup)!} onClose={() => setOpenGroup(null)} />
      )}
    </div>
  );
}

function GroupDetailDialog({ group, onClose }: { group: YanGroupSummary; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-yan-navy/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="group-detail-title" className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-yan-navy/40 hover:text-yan-navy">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 id="group-detail-title" className="yan-h3 text-yan-navy mb-1 pr-8">{group.name}</h3>
        {group.neighborhood && <p className="text-xs text-yan-navy/40 mb-3">{group.neighborhood}</p>}
        <p className="text-sm text-yan-navy/70 font-yan-body leading-relaxed mb-4">{group.description}</p>
        <dl className="text-sm space-y-1.5 mb-4">
          {group.meetingDay && (
            <div className="flex gap-2">
              <dt className="text-yan-navy/40 w-28 shrink-0">Meets</dt>
              <dd className="text-yan-navy/70">{group.meetingDay}{group.meetingFrequency ? ` · ${group.meetingFrequency}` : ""}</dd>
            </div>
          )}
          {group.churchAffiliation && (
            <div className="flex gap-2">
              <dt className="text-yan-navy/40 w-28 shrink-0">Affiliation</dt>
              <dd className="text-yan-navy/70">{group.churchAffiliation}</dd>
            </div>
          )}
        </dl>
        <div className="flex gap-3">
          {group.websiteUrl && (
            <a href={group.websiteUrl} target="_blank" rel="noopener noreferrer" className="yan-btn-ghost text-xs">
              Visit website
            </a>
          )}
          {group.instagramHandle && (
            <a
              href={`https://instagram.com/${group.instagramHandle.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="yan-btn-ghost text-xs"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
