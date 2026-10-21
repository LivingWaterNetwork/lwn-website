import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LWN Member Portal",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
