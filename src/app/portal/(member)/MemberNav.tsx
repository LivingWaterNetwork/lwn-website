"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/portal", label: "Home" },
  { href: "/portal/journey", label: "Journey" },
  { href: "/portal/sessions", label: "Sessions" },
  { href: "/portal/steps", label: "Steps" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/payments", label: "Payments" },
  { href: "/portal/account", label: "Account" },
];

export default function MemberNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Your LWN space" className="border-b border-slate/20 bg-white print:hidden">
      <ul className="mx-auto flex max-w-2xl flex-wrap gap-1 px-4">
        {LINKS.map((link) => {
          const active = link.href === "/portal" ? pathname === "/portal" : pathname?.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block min-h-[44px] px-3 py-3 text-sm font-medium ${
                  active ? "border-b-2 border-navy text-navy" : "text-slate hover:text-navy"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
