import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard"];

// Rutas públicas (login, etc)
const publicRoutes = ["/", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  // Obtener sesión del usuario
  const session = request.cookies.get("admin_session");
  
  // Si está en ruta protegida sin sesión, redirigir al login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Si está en login con sesión, redirigir al dashboard
  if (isPublicRoute && session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
