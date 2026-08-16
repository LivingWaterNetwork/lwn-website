import { NextResponse } from "next/server";
import { YAN_ADMIN_COOKIE } from "@/lib/yanAdminAuth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(YAN_ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
