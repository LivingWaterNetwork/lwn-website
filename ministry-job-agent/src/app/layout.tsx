import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ministry Job Agent",
  description: "Discovery, research, scoring, and human-gated application preparation for ministry positions.",
};

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/queue", label: "Human Input" },
  { href: "/theology", label: "Theology" },
  { href: "/answers", label: "Answer Bank" },
  { href: "/candidate", label: "Candidate" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-[1400px] gap-8 px-6 py-6">
          <aside className="w-52 shrink-0">
            <div className="sticky top-6">
              <Link href="/" className="block">
                <div className="text-[15px] font-semibold leading-tight">Ministry Job Agent</div>
                <div className="muted mt-0.5 text-[11px]">Omar J. Fandino</div>
              </Link>

              <nav className="mt-7 space-y-0.5">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-md px-2.5 py-1.5 text-[13px] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="hairline muted mt-8 border-t pt-4 text-[11px] leading-relaxed">
                <div className="font-semibold uppercase tracking-wider">Submission</div>
                <div className="mt-1">
                  Locked. No application is submitted without your explicit approval.
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 pb-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
