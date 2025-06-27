import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for database session cookie directly from request
  // When using database sessions, the cookie name could be different
  // Try all possible cookie names for NextAuth sessions
  const sessionCookie =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  const isAuthenticated = !!sessionCookie;

  // If the user is authenticated and trying to access login or signup pages
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    // Redirect to the home page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For all other routes, let NextAuth handle them
  return NextResponse.next();
}

// Configure the middleware to run on login, signup, and other protected paths
export const config = {
  matcher: [
    // Auth pages - redirect to home if already authenticated
    "/login",
    "/signup",
    // Add other paths that should be protected by authentication here
    // For example: "/dashboard/:path*", "/profile", etc.
  ],
};
