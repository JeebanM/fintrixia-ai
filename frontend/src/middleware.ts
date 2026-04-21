import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/transactions", "/assistant", "/budget", "/notifications"];
const PUBLIC_ROUTES = ["/login"];

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("fintrixia-auth")?.value ||
    req.headers.get("authorization");

  // Try to parse token from localStorage via cookie (set by client)
  const authCookie = req.cookies.get("fintrixia-auth-token");
  const isAuthenticated = !!authCookie?.value;

  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
