import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenFromCookieHeader, verifySessionToken } from "@/lib/auth/session";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/", "/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  const token = getTokenFromCookieHeader(request.headers.get("cookie"));
  const sessionValid = await verifySessionToken(token);

  if (isProtectedRoute && !sessionValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicRoute && sessionValid && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
