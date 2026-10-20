import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Agreements Admin", template: "%s | Agreements Admin" },
  robots: { index: false, follow: false },
};

export default function AgreementsAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
