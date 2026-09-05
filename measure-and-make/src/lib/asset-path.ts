/**
 * Prefixes a path in /public with the site's base path.
 *
 * The site is served at the root of its own domain, so there is nothing to
 * prepend and these are pass-throughs. They stay because next/link and
 * next/image handle a basePath automatically while a plain <img src>, a
 * metadata icon path, or a fetch does not — if the site is ever mounted under
 * a prefix again, this is the one place that has to change.
 */
export const BASE_PATH = "";

export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}

/** Same prefixing, for a fetch to one of this app's own API routes. */
export function apiPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
