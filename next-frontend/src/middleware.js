import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")

  // Protected routes
  const protectedPaths = ["/app"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing protected route without token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If accessing login with token, redirect to app
  if (request.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
