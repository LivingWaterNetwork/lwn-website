import Link from "next/link";
import { CATALYST_PROCESS, CATALYST_RELATIONSHIP_LINE } from "@/lib/catalystContent";
import { CatalystInquiryForm } from "./CatalystInquiryForm";

export function CatalystStartContent() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <p className="cat-eyebrow cat-eyebrow-dark">Living Water Catalyst</p>
          <h1 className="cat-h1 text-white mt-5 max-w-3xl">Start a conversation.</h1>
          <p className="cat-lede text-white/75 mt-7 max-w-2xl">
            Tell us what you&apos;re building and where it&apos;s getting stuck. There&apos;s no
            obligation on either side — the first step is just understanding the work.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7">
              <CatalystInquiryForm />
            </div>

            <aside className="lg:col-span-5 space-y-10">
              <div>
                <h2 className="cat-eyebrow">What happens next</h2>
                <ol className="mt-5 space-y-5">
                  {CATALYST_PROCESS.map((stage) => (
                    <li key={stage.index} className="flex gap-4">
                      <span className="cat-index shrink-0 pt-1">{stage.index}</span>
                      <div>
                        <h3 className="font-serif text-base font-semibold text-navy">
                          {stage.title}
                        </h3>
                        <p className="cat-body text-[15px] mt-1">{stage.summary}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-8 cat-rule">
                <h2 className="cat-eyebrow">Good to know</h2>
                <ul className="mt-5 space-y-3">
                  {[
                    "We'll read what you send before we reply — no automated pitch.",
                    "If Catalyst isn't the right fit for your project, we'll tell you.",
                    "Scope and cost are discussed in conversation, not quoted from a package.",
                  ].map((item) => (
                    <li key={item} className="cat-body text-[15px] flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[0.65em] h-px w-3 bg-[#0A77BC] shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Commercial inquiry — deliberately kept separate from LWN's giving language. */}
              <div className="pt-8 cat-rule">
                <p className="cat-body text-[15px] text-slate/80">{CATALYST_RELATIONSHIP_LINE}</p>
                <p className="cat-body text-[15px] mt-4">
                  This form is for project inquiries. If you&apos;re looking for Living Water
                  Network&apos;s programs or ways to give, start{" "}
                  <Link href="/programs" className="text-[#0A77BC] underline hover:text-deep-sea">
                    here
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
