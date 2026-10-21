"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: "/portal/admin", label: "Dashboard" },
    { href: "/portal/admin/library", label: "Library" },
    { href: "/portal/admin/programs", label: "Programs" },
    ...(isAdmin
      ? [
          { href: "/portal/admin/staff", label: "Staff" },
          { href: "/portal/admin/partners", label: "Partners" },
          { href: "/portal/admin/audit", label: "Audit" },
        ]
      : []),
  ];

  return (
    <nav aria-label="Coach and admin" className="border-b border-slate/20 bg-navy">
      <ul className="mx-auto flex max-w-5xl flex-wrap gap-1 px-4">
        {links.map((link) => {
          const active = link.href === "/portal/admin" ? pathname === "/portal/admin" : pathname?.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block min-h-[44px] px-3 py-3 text-sm font-medium ${
                  active ? "border-b-2 border-copper text-white" : "text-spring hover:text-white"
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
