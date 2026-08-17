"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { RevealText } from "@/components/motion/RevealText";

type FormState = "idle" | "submitting" | "success" | "error";

const CLIENT_SLUG = "dante";

const CAPACITY_OPTIONS = [
  { value: "close-to-capacity", label: "A little more — we're fairly close to capacity" },
  { value: "1-2-per-week", label: "1–2 additional jobs per week" },
  { value: "3-5-per-week", label: "3–5 additional jobs per week" },
  { value: "6-plus-per-week", label: "6+ additional jobs per week" },
  { value: "double-volume", label: "We could approximately double our current volume" },
  { value: "not-sure", label: "I'm honestly not sure yet" },
];

const PRIORITY_OPTIONS = [
  { value: "more-revenue", label: "More total revenue" },
  { value: "more-consistent-work", label: "More consistent weekly work" },
  { value: "higher-value-jobs", label: "Higher-value jobs" },
  { value: "more-partnerships", label: "More strategic referral partnerships" },
  { value: "fewer-dependencies", label: "Building systems so the company depends less on me" },
  { value: "prep-to-scale", label: "Preparing the company to scale" },
  { value: "combination", label: "A combination of these" },
];

const PARTNERSHIP_COMFORT_OPTIONS = [
  { value: "very-comfortable", label: "Very comfortable" },
  { value: "comfortable-but-diversify", label: "Comfortable, but I want diversification" },
  { value: "somewhat-concerned", label: "Somewhat concerned" },
  { value: "very-concerned", label: "Very concerned about depending on a small number of sources" },
  { value: "havent-thought-about-it", label: "I haven't really thought about it" },
];

const ADD_EMPLOYEES_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "maybe", label: "Maybe" },
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "As-needed"];

const initialAnswers = {
  otherServices: "",
  otherPartnerships: "",
  replicatePartnershipTypes: "",
  estateJobsPerWeek: "2–5 jobs/week",
  estateJobValue: "$1,500–$3,000/job",
  foreclosureJobsPerMonth: "3–6 jobs/month",
  foreclosureJobValue: "$3,000–$10,000/job",
  hasWebsite: "No",
  googlePresence: "Not currently established",
  growthMotivation: "Create more consistent work and hours for the team.",
  teamDependents: "",
  employeeCount: "",
  contractorCount: "",
  primaryRoles: "",
  employmentType: "",
  consistentWorkTarget: "",
  currentUtilizationDays: "2–3 days/week during slower weeks",
  capacityCeiling: "",
  capacityExplanation: "",
  hiringThreshold: "",
  priorityNext90Days: "",
  priorityRanking: "",
  partnershipComfort: "",
  partnershipRiskImpact: "",
  idealJobsPerWeek: "",
  idealCrewDaysPerWeek: "",
  idealAvgJobValue: "",
  idealReferralChannels: "",
  wouldAddEmployees: "",
  ninetyDayVision: "",
};

type Answers = typeof initialAnswers;

function OptionCards({
  options,
  value,
  onChange,
  columns = 1,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-left rounded-lg border px-4 py-3 text-sm font-sans transition ${
              selected
                ? "border-[#0A77BC] bg-[#0A77BC]/5 text-navy font-semibold ring-1 ring-[#0A77BC]"
                : "border-mist bg-white text-slate hover:border-[#0A77BC]/40"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function DanteDiscoveryContent() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [ranking, setRanking] = useState(["", "", ""]);
  const [employmentSelections, setEmploymentSelections] = useState<string[]>([]);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleEmploymentType(type: string) {
    setEmploymentSelections((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  const rankablePriorities = PRIORITY_OPTIONS.filter((o) => o.value !== "combination");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypot.trim().length > 0) return;

    setState("submitting");
    setErrorMsg("");

    const priorityRanking =
      answers.priorityNext90Days === "combination"
        ? ranking
            .map((v, i) => {
              const label = rankablePriorities.find((o) => o.value === v)?.label;
              return label ? `${i + 1}. ${label}` : null;
            })
            .filter(Boolean)
            .join("; ")
        : "";

    const employmentType = employmentSelections.join(", ");

    const body = {
      clientSlug: CLIENT_SLUG,
      name: "Dante",
      email,
      phone: phone || undefined,
      answers: { ...answers, priorityRanking, employmentType },
    };

    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <section className="min-h-[70vh] flex items-center justify-center bg-mist py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card max-w-xl mx-auto text-center py-12 px-8"
        >
          <div className="text-5xl mb-4">🙏</div>
          <h1 className="font-serif text-3xl font-semibold text-navy mb-4">Got it, Dante.</h1>
          <p className="text-slate font-sans text-sm leading-relaxed mb-4">
            Thanks for taking the time to walk through this.
          </p>
          <p className="text-slate font-sans text-sm leading-relaxed mb-6">
            We&apos;ll use what you shared — along with what we already know about the business — to
            map the current operation, identify the biggest constraints, and work backward from what
            healthy growth actually needs to look like. Then we can determine what role Google,
            technology, partnerships, systems, and other growth channels should play.
          </p>
          <p className="font-serif text-lg text-navy italic">We&apos;ll dig into it together on the call.</p>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      {/* ── Personalized hero ── */}
      <section className="relative bg-navy py-24 text-white text-center overflow-hidden">
        <div className="relative max-w-2xl mx-auto px-4">
          <FadeInSection>
            <p className="section-label text-spring mb-4">Business Stewardship Discovery</p>
          </FadeInSection>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-6">
            <RevealText text="Dante, let's map out what you're building." />
          </h1>
          <FadeInSection delay={0.25}>
            <p className="text-white/75 text-base font-sans leading-relaxed max-w-xl mx-auto text-left sm:text-center">
              You&apos;ve already built something with real momentum in a short amount of time. More
              importantly, you&apos;ve made it clear that growth isn&apos;t only about generating more
              revenue — you want to build enough consistency to take care of the people working
              alongside you.
            </p>
            <p className="text-white/75 text-base font-sans leading-relaxed max-w-xl mx-auto mt-4 text-left sm:text-center">
              Before we talk about Google, websites, advertising, or technology, we want to understand
              the business itself.
            </p>
            <p className="text-white/75 text-base font-sans leading-relaxed max-w-xl mx-auto mt-4 text-left sm:text-center">
              This short discovery will help us look at what&apos;s already working, your team&apos;s
              current capacity, where the gaps are, and what healthy growth would actually need to look
              like. We&apos;ll use your answers to make our conversation more strategic and spend less
              time covering information we already know.
            </p>
            <p className="mt-6 text-spring text-sm font-sans font-semibold uppercase tracking-wide">
              About 5–10 minutes
            </p>
            <p className="mt-6 text-white/60 text-sm font-sans italic max-w-md mx-auto">
              The goal isn&apos;t growth for growth&apos;s sake. It&apos;s building the right structure
              around what has already been entrusted to you.
            </p>
          </FadeInSection>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="website">Leave this field blank</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* ── What We Already Know ── */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading className="mb-3" label="Before We Ask Anything Else" heading="What We Already Know" />
            <FadeInSection>
              <p className="text-slate text-sm font-sans text-center mb-8">
                Based on what you&apos;ve already shared with us. If anything has changed or needs
                clarification, you can update it below.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="card">
                  <p className="section-label mb-2">Business</p>
                  <p className="text-navy font-sans font-semibold text-sm">Estate cleanouts &amp; junk removal</p>
                </div>
                <div className="card">
                  <p className="section-label mb-2">Current Referral Channel #1</p>
                  <p className="text-navy font-sans font-semibold text-sm">Estate-sale company</p>
                  <p className="text-slate font-sans text-xs mt-1">Approximately 2–5 jobs/week</p>
                  <p className="text-slate font-sans text-xs">Approximately $1,500–$3,000/job</p>
                </div>
                <div className="card">
                  <p className="section-label mb-2">Current Referral Channel #2</p>
                  <p className="text-navy font-sans font-semibold text-sm">Foreclosure acquisition company</p>
                  <p className="text-slate font-sans text-xs mt-1">Approximately 3–6 jobs/month</p>
                  <p className="text-slate font-sans text-xs">Approximately $3,000–$10,000/job</p>
                </div>
                <div className="card">
                  <p className="section-label mb-2">Current Digital Presence</p>
                  <p className="text-navy font-sans font-semibold text-sm">No website / not currently established on Google</p>
                </div>
                <div className="card sm:col-span-2">
                  <p className="section-label mb-2">Primary Growth Motivation</p>
                  <p className="text-navy font-sans font-semibold text-sm">
                    Create more consistent work and hours for the team.
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ── Services & partnerships ── */}
        <section className="py-16 bg-mist">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <SectionHeading className="mb-2" label="The Business Itself" heading="Services & Referral Relationships" />

            <div className="card">
              <label htmlFor="otherServices" className="form-label">
                Beyond estate cleanouts and junk removal, are there any other services you currently
                offer or want to offer?
              </label>
              <textarea
                id="otherServices"
                rows={3}
                className="form-textarea"
                value={answers.otherServices}
                onChange={(e) => set("otherServices", e.target.value)}
              />
            </div>

            <div className="card">
              <label htmlFor="otherPartnerships" className="form-label">
                You mentioned your estate-sale and foreclosure acquisition partnerships. Are there any
                other relationships currently sending you work?
              </label>
              <textarea
                id="otherPartnerships"
                rows={3}
                className="form-textarea"
                value={answers.otherPartnerships}
                onChange={(e) => set("otherPartnerships", e.target.value)}
              />
            </div>

            <div className="card">
              <label htmlFor="replicatePartnershipTypes" className="form-label">
                If you could replicate one of those existing partnerships 3–5 more times, what types of
                organizations or businesses do you think would be the best fit?
              </label>
              <p className="text-xs text-slate/60 font-sans mb-2">
                Examples: estate-sale companies, realtors, property managers, investors, probate
                professionals, senior-transition services, foreclosure companies, etc. These are just
                examples for discovery — not necessarily the right channels.
              </p>
              <textarea
                id="replicatePartnershipTypes"
                rows={3}
                className="form-textarea"
                value={answers.replicatePartnershipTypes}
                onChange={(e) => set("replicatePartnershipTypes", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Team composition ── */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <SectionHeading className="mb-2" label="Your Team" heading="Team Composition" />

            <div className="card">
              <label htmlFor="teamDependents" className="form-label">
                How many people are currently depending on the business for work?
              </label>
              <input
                id="teamDependents"
                type="text"
                className="form-input"
                placeholder="e.g. 4, including me"
                value={answers.teamDependents}
                onChange={(e) => set("teamDependents", e.target.value)}
              />
            </div>

            <div className="card">
              <p className="form-label mb-3">What does your current team look like?</p>
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="employeeCount" className="form-label">Number of employees</label>
                  <input
                    id="employeeCount"
                    type="text"
                    className="form-input"
                    value={answers.employeeCount}
                    onChange={(e) => set("employeeCount", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="contractorCount" className="form-label">Number of contractors</label>
                  <input
                    id="contractorCount"
                    type="text"
                    className="form-input"
                    value={answers.contractorCount}
                    onChange={(e) => set("contractorCount", e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-5">
                <label htmlFor="primaryRoles" className="form-label">Primary roles</label>
                <input
                  id="primaryRoles"
                  type="text"
                  className="form-input"
                  placeholder="e.g. crew lead, haulers, driver"
                  value={answers.primaryRoles}
                  onChange={(e) => set("primaryRoles", e.target.value)}
                />
              </div>
              <div>
                <p className="form-label mb-2">Full-time / part-time / as-needed</p>
                <div className="flex flex-wrap gap-3">
                  {EMPLOYMENT_TYPES.map((type) => {
                    const selected = employmentSelections.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleEmploymentType(type)}
                        className={`px-4 py-2 rounded-md border text-sm font-sans transition ${
                          selected
                            ? "border-[#0A77BC] bg-[#0A77BC]/5 text-navy font-semibold ring-1 ring-[#0A77BC]"
                            : "border-mist bg-white text-slate hover:border-[#0A77BC]/40"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Consistent work target (emphasized) ── */}
        <section className="py-16 bg-navy">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInSection>
              <div className="rounded-xl border-2 border-spring/40 bg-white/5 p-8">
                <p className="section-label text-spring mb-3">The Core Question</p>
                <label htmlFor="consistentWorkTarget" className="block font-serif text-2xl text-white font-semibold mb-3 leading-snug">
                  You mentioned wanting to provide more consistent hours for your guys. What would
                  &ldquo;consistent&rdquo; ideally look like?
                </label>
                <p className="text-white/60 text-sm font-sans mb-4">
                  For example: 5 workdays per week, 30–40 hours per person, a certain number of jobs
                  per week, etc.
                </p>
                <textarea
                  id="consistentWorkTarget"
                  rows={4}
                  className="form-textarea"
                  value={answers.consistentWorkTarget}
                  onChange={(e) => set("consistentWorkTarget", e.target.value)}
                />
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ── Utilization & capacity ── */}
        <section className="py-16 bg-mist">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <SectionHeading className="mb-2" label="Current Capacity" heading="What the Crew Can Actually Handle" />

            <div className="card">
              <label htmlFor="currentUtilizationDays" className="form-label">
                Right now, approximately how many days per week is the crew actively working?
              </label>
              <input
                id="currentUtilizationDays"
                type="text"
                className="form-input"
                value={answers.currentUtilizationDays}
                onChange={(e) => set("currentUtilizationDays", e.target.value)}
              />
            </div>

            <div className="card">
              <p className="form-label mb-3">
                With your current crew, equipment, vehicles, and processes, how much additional work
                could you realistically take on right now?
              </p>
              <OptionCards
                options={CAPACITY_OPTIONS}
                value={answers.capacityCeiling}
                onChange={(v) => set("capacityCeiling", v)}
                columns={2}
              />
              <div className="mt-4">
                <label htmlFor="capacityExplanation" className="form-label">
                  Optional explanation
                </label>
                <textarea
                  id="capacityExplanation"
                  rows={2}
                  className="form-textarea"
                  value={answers.capacityExplanation}
                  onChange={(e) => set("capacityExplanation", e.target.value)}
                />
              </div>
            </div>

            <div className="card">
              <label htmlFor="hiringThreshold" className="form-label">
                At what point would additional demand require you to hire or add another crew?
              </label>
              <p className="text-xs text-slate/60 font-sans mb-2">
                We don&apos;t want marketing to generate demand that operations can&apos;t fulfill.
              </p>
              <input
                id="hiringThreshold"
                type="text"
                className="form-input"
                placeholder="Short answer, or 'I don't know yet'"
                value={answers.hiringThreshold}
                onChange={(e) => set("hiringThreshold", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Priority & partnership dependence ── */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div>
              <SectionHeading className="mb-4" label="Where Focus Should Go" heading="If You Had to Prioritize One for the Next 90 Days" />
              <OptionCards
                options={PRIORITY_OPTIONS}
                value={answers.priorityNext90Days}
                onChange={(v) => set("priorityNext90Days", v)}
                columns={2}
              />
              {answers.priorityNext90Days === "combination" && (
                <div className="mt-5 card">
                  <p className="form-label mb-3">Rank your top three</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i}>
                        <label className="form-label">#{i + 1}</label>
                        <select
                          className="form-input"
                          value={ranking[i]}
                          onChange={(e) => {
                            const next = [...ranking];
                            next[i] = e.target.value;
                            setRanking(next);
                          }}
                        >
                          <option value="">Select</option>
                          {rankablePriorities.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <SectionHeading className="mb-4" label="Stewardship & Risk" heading="Depending on Two Major Relationships" />
              <p className="text-slate text-sm font-sans mb-3">
                How comfortable are you with the amount of business currently coming from two major
                referral relationships?
              </p>
              <OptionCards
                options={PARTNERSHIP_COMFORT_OPTIONS}
                value={answers.partnershipComfort}
                onChange={(v) => set("partnershipComfort", v)}
              />
              <div className="mt-5 card">
                <label htmlFor="partnershipRiskImpact" className="form-label">
                  If one of those relationships stopped sending work tomorrow, what impact would that
                  have on the business?
                </label>
                <textarea
                  id="partnershipRiskImpact"
                  rows={3}
                  className="form-textarea"
                  value={answers.partnershipRiskImpact}
                  onChange={(e) => set("partnershipRiskImpact", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 90-day target ── */}
        <section className="py-20 bg-gradient-to-b from-navy to-[#0d3a5c]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              className="mb-10"
              label="90 Days From Now"
              heading="Where Are We Trying to Go?"
              labelClassName="section-label text-spring"
              headingClassName="font-serif text-3xl md:text-4xl font-semibold text-white"
            />

            <FadeInSection className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="rounded-lg bg-white/95 p-5">
                <label htmlFor="idealJobsPerWeek" className="form-label">Ideal jobs per week</label>
                <input
                  id="idealJobsPerWeek"
                  type="text"
                  className="form-input"
                  value={answers.idealJobsPerWeek}
                  onChange={(e) => set("idealJobsPerWeek", e.target.value)}
                />
              </div>
              <div className="rounded-lg bg-white/95 p-5">
                <label htmlFor="idealCrewDaysPerWeek" className="form-label">Ideal crew workdays per week</label>
                <input
                  id="idealCrewDaysPerWeek"
                  type="text"
                  className="form-input"
                  value={answers.idealCrewDaysPerWeek}
                  onChange={(e) => set("idealCrewDaysPerWeek", e.target.value)}
                />
              </div>
              <div className="rounded-lg bg-white/95 p-5">
                <label htmlFor="idealAvgJobValue" className="form-label">Ideal average job value</label>
                <input
                  id="idealAvgJobValue"
                  type="text"
                  className="form-input"
                  value={answers.idealAvgJobValue}
                  onChange={(e) => set("idealAvgJobValue", e.target.value)}
                />
              </div>
              <div className="rounded-lg bg-white/95 p-5">
                <label htmlFor="idealReferralChannels" className="form-label">Ideal number of reliable lead/referral channels</label>
                <input
                  id="idealReferralChannels"
                  type="text"
                  className="form-input"
                  value={answers.idealReferralChannels}
                  onChange={(e) => set("idealReferralChannels", e.target.value)}
                />
              </div>
            </FadeInSection>

            <FadeInSection className="mb-10">
              <p className="form-label text-white mb-3">Would you expect to add employees?</p>
              <div className="flex gap-3">
                {ADD_EMPLOYEES_OPTIONS.map((opt) => {
                  const selected = answers.wouldAddEmployees === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("wouldAddEmployees", opt.value)}
                      className={`px-5 py-2.5 rounded-md border text-sm font-sans transition ${
                        selected
                          ? "border-spring bg-spring/10 text-white font-semibold ring-1 ring-spring"
                          : "border-white/25 bg-white/5 text-white/70 hover:border-white/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </FadeInSection>

            <FadeInSection>
              <div className="rounded-xl border-2 border-copper bg-white p-8">
                <label htmlFor="ninetyDayVision" className="block font-serif text-2xl text-navy font-semibold mb-3 leading-snug">
                  If we were sitting down again 90 days from now and you told me, &ldquo;Bro, this
                  worked,&rdquo; what would have happened?
                </label>
                <textarea
                  id="ninetyDayVision"
                  rows={6}
                  required
                  className="form-textarea text-base"
                  value={answers.ninetyDayVision}
                  onChange={(e) => set("ninetyDayVision", e.target.value)}
                />
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ── Contact & submit ── */}
        <section className="py-16 bg-white">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card space-y-5">
              <div>
                <label htmlFor="email" className="form-label">
                  Best email to reach you at <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {state === "error" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="form-error text-sm"
                >
                  {errorMsg || "Something went wrong. Please try again."}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={state === "submitting"}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state === "submitting" ? "Submitting…" : "Submit Discovery"}
              </button>
              <p className="text-xs text-slate/55 text-center font-sans">
                Your information is kept private and used only to prepare for our conversation.
              </p>
            </div>
          </div>
        </section>
      </form>
    </>
  );
}
