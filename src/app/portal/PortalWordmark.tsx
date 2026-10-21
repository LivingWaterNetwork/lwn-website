import Link from "next/link";

/** Small LWN identity + return-to-site link for the focused portal auth shell. */
export default function PortalWordmark() {
  return (
    <div className="mx-auto flex max-w-md items-center justify-between px-4 pt-6 text-sm">
      <span className="font-serif text-navy">Living Water Network</span>
      <Link href="/" className="text-slate underline hover:text-navy">
        Back to the main site
      </Link>
    </div>
  );
}
