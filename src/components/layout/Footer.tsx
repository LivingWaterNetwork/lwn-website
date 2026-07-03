import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="inline-flex items-center bg-white rounded-xl px-3 py-2 mb-4">
              <Image
                src="/images/logo-mark.png"
                alt="Living Water Network"
                width={48}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed font-sans">
              Equipping Kingdom leaders to disrupt darkness and disciple nations.
            </p>
            <p className="mt-2 font-serif italic text-spring text-sm">Rooted in truth. Sent to lead.</p>
          </div>

          {/* Quick links */}
          <div>
            <p className="section-label text-spring mb-3">
              Quick Links
            </p>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "About" },
                { href: "/programs", label: "Programs" },
                { href: "/cohort", label: "Cohort" },
                { href: "/faq", label: "FAQ" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
                { href: "/donate", label: "Donate" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="section-label text-spring mb-3">
              Get in Touch
            </p>
            <a
              href="mailto:info@lwnetwork.org"
              className="text-white/60 hover:text-white transition-colors text-sm font-sans"
            >
              info@lwnetwork.org
            </a>
            <div className="mt-6">
              <Link href="/donate" className="btn-copper text-sm">
                Support the Movement
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-sans">
          <p>
            &copy; {new Date().getFullYear()} Living Water Network Inc. All rights reserved.
          </p>
          <p>
            Living Water Network Inc. is a registered 501(c)(3) nonprofit organization.
          </p>
        </div>
      </div>
    </footer>
  );
}
