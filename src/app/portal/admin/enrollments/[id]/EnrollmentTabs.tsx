"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EnrollmentTabs({ enrollmentId }: { enrollmentId: string }) {
  const pathname = usePathname();
  const base = `/portal/admin/enrollments/${enrollmentId}`;

  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/sessions`, label: "Sessions" },
    { href: `${base}/steps`, label: "Steps" },
    { href: `${base}/documents`, label: "Documents" },
    { href: `${base}/payments`, label: "Payments" },
    { href: `${base}/activity`, label: "Activity" },
  ];

  return (
    <nav aria-label="Enrollment sections" className="mt-4 border-b border-slate/20">
      <ul className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const active = tab.href === base ? pathname === base : pathname?.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block min-h-[44px] px-3 py-3 text-sm font-medium ${
                  active ? "border-b-2 border-navy text-navy" : "text-slate hover:text-navy"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
