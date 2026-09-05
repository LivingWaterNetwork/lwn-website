/** @type {import('next').NextConfig} */

// The Measure & Make site is a separate application, in its own repository
// and deployed as its own Vercel project, served at
// https://www.measureandmakegroup.com. It used to live in this repository and
// be proxied through this domain at /measure-and-make; everything below exists
// so the addresses that were published while that was true still land
// somewhere correct.
const MEASURE_AND_MAKE_SITE = "https://www.measureandmakegroup.com";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async redirects() {
    // The site has moved off this domain, so these are permanent: the old
    // path is not coming back, and search engines should transfer the address
    // rather than keep both. /measure&make and /measure-make were always just
    // the spellings people reasonably try — "&" is legal in a path but breaks
    // in practice, in link detection, analytics, and anything that reads a
    // path as a query string.
    return [
      {
        source: "/measure-and-make",
        destination: MEASURE_AND_MAKE_SITE,
        permanent: true,
      },
      {
        source: "/measure-and-make/:path*",
        destination: `${MEASURE_AND_MAKE_SITE}/:path*`,
        permanent: true,
      },
      {
        source: "/measure&make",
        destination: MEASURE_AND_MAKE_SITE,
        permanent: true,
      },
      {
        source: "/measure&make/:path*",
        destination: `${MEASURE_AND_MAKE_SITE}/:path*`,
        permanent: true,
      },
      {
        source: "/measure-make",
        destination: MEASURE_AND_MAKE_SITE,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
