import Link from "next/link";
import { YanLogoStacked } from "@/components/yan/brand/YanLogo";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";

const footerLinks = [
  { href: "/yan/network", label: "Network" },
  { href: "/yan/events", label: "Events" },
  { href: "/yan/leaders", label: "Leaders" },
  { href: "/yan/pray", label: "Pray" },
  { href: "/yan/resources", label: "Resources" },
  { href: "/yan/stories", label: "Stories" },
  { href: "/yan/join", label: "Join the Network" },
];

export function YanFooter() {
  return (
    <footer className="bg-yan-navy text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 mb-10 border-b border-white/10">
          <div>
            <p className="yan-eyebrow yan-eyebrow-dark mb-2">Stay in the Loop</p>
            <h3 className="yan-h3 text-white">Get YAN launch updates.</h3>
          </div>
          <NewsletterSignup dark />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <YanLogoStacked tone="light" />
          </div>

          <div>
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">Explore</p>
            <ul className="space-y-2 text-sm font-yan-body">
              {footerLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/65 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">Contact</p>
            <a
              href="mailto:yan@lwnetwork.org"
              className="text-white/65 hover:text-white transition-colors text-sm font-yan-body"
            >
              yan@lwnetwork.org
            </a>
            <p className="mt-4 text-white/50 text-xs font-yan-body">@youngadults.network</p>
          </div>

          <div>
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">Living Water Network</p>
            <p className="text-white/50 text-sm font-yan-body leading-relaxed mb-3">
              YAN is an initiative of Living Water Network.
            </p>
            <Link href="/" className="text-white/70 hover:text-white text-sm font-yan-body underline underline-offset-4">
              Visit lwnetwork.org
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-yan-body">
          <p>&copy; {new Date().getFullYear()} Young Adults Network — an initiative of Living Water Network Inc.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
