import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for session cookie directly from request
  const sessionCookie = request.cookies.get("next-auth.session-token");
  const isAuthenticated = !!sessionCookie;

  // If the user is authenticated and trying to access login or signup pages
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    // Redirect to the home page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For all other routes, let NextAuth handle them
  return NextResponse.next();
}

// Configure the middleware to only run on login and signup pages
export const config = {
  matcher: ["/login", "/signup"],
};
