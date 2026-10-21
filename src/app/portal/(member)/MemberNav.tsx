"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// "core" links (journey, sessions, steps, documents, account) are always on —
// see lib/portal/constants.ts. Payments is the one Phase-1 optional module,
// gated by the viewed enrollment's own `modules.payments` flag.
const CORE_LINKS = [
  { href: "/portal", label: "Home" },
  { href: "/portal/journey", label: "Journey" },
  { href: "/portal/sessions", label: "Sessions" },
  { href: "/portal/steps", label: "Steps" },
  { href: "/portal/documents", label: "Documents" },
];
const PAYMENTS_LINK = { href: "/portal/payments", label: "Payments" };
const ACCOUNT_LINK = { href: "/portal/account", label: "Account" };
const ADMIN_LINK = { href: "/portal/admin", label: "Coach/Admin dashboard" };

export default function MemberNav({ showPayments, isStaff }: { showPayments: boolean; isStaff: boolean }) {
  const pathname = usePathname();
  const links = [
    ...CORE_LINKS,
    ...(showPayments ? [PAYMENTS_LINK] : []),
    ACCOUNT_LINK,
    ...(isStaff ? [ADMIN_LINK] : []),
  ];

  return (
    <nav aria-label="Your LWN space" className="border-b border-slate/20 bg-white print:hidden">
      <ul className="mx-auto flex max-w-2xl flex-wrap gap-1 px-4">
        {links.map((link) => {
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
