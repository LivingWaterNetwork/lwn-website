import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSessionToken, YAN_ADMIN_COOKIE } from "@/lib/yanAdminAuth";
import { isValidDiscoverySessionToken, DANTE_DISCOVERY_COOKIE } from "@/lib/danteDiscoveryAuth";
import { isValidAgreementsAdminSessionToken, AGREEMENTS_ADMIN_COOKIE } from "@/lib/agreements/adminAuth";

/**
 * Gates the YAN admin surface, the private Dante discovery link, and the
 * LWN Agreements admin dashboard. Every other route on the site (main LWN
 * pages, the public /yan mini-site, and the /agreements signer-facing pages
 * — which self-check their own per-agreement session in each API route
 * instead) never touches this middleware, so it can't introduce a
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

  const isAgreementsAdminApi = pathname.startsWith("/api/agreements/admin") &&
    !pathname.startsWith("/api/agreements/admin/login");
  const isAgreementsAdminPage = pathname.startsWith("/agreements/admin") &&
    !pathname.startsWith("/agreements/admin/login");

  if (isAgreementsAdminApi || isAgreementsAdminPage) {
    const token = req.cookies.get(AGREEMENTS_ADMIN_COOKIE)?.value;
    const valid = await isValidAgreementsAdminSessionToken(token).catch(() => false);
    if (valid) return NextResponse.next();

    if (isAgreementsAdminApi) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const loginUrl = new URL("/agreements/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/yan/admin/:path*",
    "/api/yan/admin/:path*",
    "/discovery/dante/:path*",
    "/api/discovery",
    "/agreements/admin/:path*",
    "/api/agreements/admin/:path*",
  ],
};
