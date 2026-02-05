import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieName } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body?.username || "");
    const password = String(body?.password || "");

    const adminUser =
      process.env.ADMIN_USER ||
      process.env.NEXT_PUBLIC_ADMIN_USER ||
      "admin";
    const adminPass =
      process.env.ADMIN_PASS ||
      process.env.NEXT_PUBLIC_ADMIN_PASS ||
      "admin";

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSessionToken();
    const ttlSeconds = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24);
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Number.isFinite(ttlSeconds) ? ttlSeconds : 60 * 60 * 24,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
