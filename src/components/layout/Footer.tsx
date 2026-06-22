import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-teal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-serif text-xl font-semibold text-white mb-3">
              Living Water Network
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              Equipping Kingdom leaders to disrupt darkness and disciple nations.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="font-semibold text-sm uppercase tracking-wider text-gold mb-3">
              Quick Links
            </p>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "About" },
                { href: "/programs", label: "Programs" },
                { href: "/cohort", label: "Cohort" },
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
            <p className="font-semibold text-sm uppercase tracking-wider text-gold mb-3">
              Get in Touch
            </p>
            <a
              href="mailto:info@lwnetwork.org"
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              info@lwnetwork.org
            </a>
            <div className="mt-6">
              <Link href="/donate" className="btn-gold text-sm">
                Support the Movement
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
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
