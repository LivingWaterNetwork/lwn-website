import { NextResponse } from "next/server";
import { AGREEMENTS_ADMIN_COOKIE } from "@/lib/agreements/adminAuth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(AGREEMENTS_ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
