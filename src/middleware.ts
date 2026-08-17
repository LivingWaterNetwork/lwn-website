import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSessionToken, YAN_ADMIN_COOKIE } from "@/lib/yanAdminAuth";
import { isValidDiscoverySessionToken, DANTE_DISCOVERY_COOKIE } from "@/lib/danteDiscoveryAuth";

/**
 * Gates the YAN admin surface and the private Dante discovery link only.
 * Every other route on the site (main LWN pages and the public /yan
 * mini-site) never touches this middleware, so it can't introduce a
 * regression outside the areas it's scoped to.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminApi = pathname.startsWith("/api/yan/admin") &&
    !pathname.startsWith("/api/yan/admin/login");
  const isAdminPage = pathname.startsWith("/yan/admin") &&
    !pathname.startsWith("/yan/admin/login");

  if (isAdminApi || isAdminPage) {
    const token = req.cookies.get(YAN_ADMIN_COOKIE)?.value;
    const valid = await isValidAdminSessionToken(token).catch(() => false);
    if (valid) return NextResponse.next();

    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const loginUrl = new URL("/yan/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isDiscoverySubmitApi = pathname === "/api/discovery";
  const isDiscoveryPage = pathname.startsWith("/discovery/dante") &&
    !pathname.startsWith("/discovery/dante/access");

  if (isDiscoverySubmitApi || isDiscoveryPage) {
    const token = req.cookies.get(DANTE_DISCOVERY_COOKIE)?.value;
    const valid = await isValidDiscoverySessionToken(token).catch(() => false);
    if (valid) return NextResponse.next();

    if (isDiscoverySubmitApi) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const accessUrl = new URL("/discovery/dante/access", req.url);
    accessUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(accessUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/yan/admin/:path*",
    "/api/yan/admin/:path*",
    "/discovery/dante/:path*",
    "/api/discovery",
  ],
};
