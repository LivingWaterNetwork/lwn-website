/**
 * Prefixes a path in /public with the configured basePath.
 *
 * next/link and next/image do this automatically; a plain <img src> or a
 * metadata icon path does not. The brand lockups are served as supplied files
 * rather than through next/image, so they go through here.
 */
export const BASE_PATH = "/measure-and-make";

export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}

/** Same prefixing, for a fetch to one of this app's own API routes. */
export function apiPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
