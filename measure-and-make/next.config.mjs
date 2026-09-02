/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Every route is served under /measure-and-make, matching where the site
  // lives on the Living Water Network domain while it shares that
  // infrastructure. next/link and next/image prepend this automatically;
  // hand-written paths (the logo files) use the basePath-aware helper in
  // src/lib/asset-path.ts.
  basePath: "/measure-and-make",
};

export default nextConfig;
