/** @type {import('next').NextConfig} */
const nextConfig = {
  // The agent is a local-first, single-operator tool. No remote images, no telemetry.
  reactStrictMode: true,
  eslint: { dirs: ["src", "scripts", "browser"] },
};

export default nextConfig;
