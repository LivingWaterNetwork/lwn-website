"use client";

import { FadeInSection } from "@/components/motion/FadeInSection";

interface Section {
  heading: string;
  body: string[];
}

interface TermsOfUseContentProps {
  sections: Section[];
}

export function TermsOfUseContent({ sections }: TermsOfUseContentProps) {
  return (
    <>
      <section className="bg-navy py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Terms of Use
          </h1>
          <p className="text-white/65 font-sans text-sm">Effective Date: July 5, 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-slate font-sans text-base leading-relaxed mb-10">
            These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of lwnetwork.org (the &ldquo;Site&rdquo;), operated by Living Water Network Inc. (&ldquo;LWN,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By using the Site, you agree to these Terms.
          </p>
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="font-serif text-xl text-navy font-semibold mb-3">{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="text-slate font-sans text-sm leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>
    </>
  );
}
