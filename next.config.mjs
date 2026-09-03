/** @type {import('next').NextConfig} */

// The Measure & Make site is a separate Next application in measure-and-make/,
// deployed as its own Vercel project, and served to the world under this
// domain at /measure-and-make. That app sets basePath: "/measure-and-make", so
// its pages, its API route, and its /_next assets all already carry the prefix
// and pass straight through.
//
// This is the whole integration: two rewrites and three redirects. No Living
// Water Network route, page, or data is touched, and nothing here runs for a
// path that does not start with /measure-and-make.
const MEASURE_AND_MAKE_ORIGIN = "https://measure-and-make-henna.vercel.app";
const MEASURE_AND_MAKE_PATH = "/measure-and-make";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async rewrites() {
    return {
      // beforeFiles so the prefix is claimed before this app's own routing and
      // 404 handling gets a look at it.
      beforeFiles: [
        {
          source: MEASURE_AND_MAKE_PATH,
          destination: `${MEASURE_AND_MAKE_ORIGIN}${MEASURE_AND_MAKE_PATH}`,
        },
        {
          source: `${MEASURE_AND_MAKE_PATH}/:path*`,
          destination: `${MEASURE_AND_MAKE_ORIGIN}${MEASURE_AND_MAKE_PATH}/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async redirects() {
    // One canonical address, /measure-and-make, plus the two spellings people
    // will reasonably try. "&" is legal in a path but breaks in practice —
    // link detection in messaging apps, analytics, and anything that reads a
    // path as a query string — so it redirects rather than serving the site.
    return [
      {
        source: "/measure&make",
        destination: MEASURE_AND_MAKE_PATH,
        permanent: false,
      },
      {
        source: "/measure&make/:path*",
        destination: `${MEASURE_AND_MAKE_PATH}/:path*`,
        permanent: false,
      },
      {
        source: "/measure-make",
        destination: MEASURE_AND_MAKE_PATH,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
