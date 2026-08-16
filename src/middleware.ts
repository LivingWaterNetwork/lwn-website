import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSessionToken, YAN_ADMIN_COOKIE } from "@/lib/yanAdminAuth";

/**
 * Gates the YAN admin surface only. Every other route on the site (main LWN
 * pages and the public /yan mini-site) never touches this middleware, so it
 * can't introduce a regression outside the admin area it's scoped to.
 */
export async function middleware(req: NextRequest) {
  const isAdminApi = req.nextUrl.pathname.startsWith("/api/yan/admin") &&
    !req.nextUrl.pathname.startsWith("/api/yan/admin/login");
  const isAdminPage = req.nextUrl.pathname.startsWith("/yan/admin") &&
    !req.nextUrl.pathname.startsWith("/yan/admin/login");

  if (!isAdminApi && !isAdminPage) return NextResponse.next();

  const token = req.cookies.get(YAN_ADMIN_COOKIE)?.value;
  const valid = await isValidAdminSessionToken(token).catch(() => false);

  if (valid) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const loginUrl = new URL("/yan/admin/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/yan/admin/:path*", "/api/yan/admin/:path*"],
};
