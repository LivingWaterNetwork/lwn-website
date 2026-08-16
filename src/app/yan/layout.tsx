import type { Metadata } from "next";
import { Poppins, Manrope } from "next/font/google";
import { YanNavbar } from "@/components/yan/layout/YanNavbar";
import { YanFooter } from "@/components/yan/layout/YanFooter";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-yan-poppins",
  display: "swap",
  weight: ["600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-yan-manrope",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "YAN Atlanta | Young Adults Network Atlanta",
    template: "%s | YAN Atlanta",
  },
  description:
    "YAN Atlanta connects the young-adult ministries, groups, pastors, and leaders already serving metro Atlanta into one shared mission — a movement, not a program.",
};

export default function YanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${poppins.variable} ${manrope.variable} font-yan-body bg-yan-navy`}>
      <a href="#yan-main-content" className="yan-skip-link">
        Skip to content
      </a>
      <YanNavbar />
      <main id="yan-main-content">{children}</main>
      <YanFooter />
    </div>
  );
}
