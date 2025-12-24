import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ Public routes
  const isAuthPage = pathname.startsWith("/auth");
  const isPublicPage = pathname === "/";

  // Allow public & auth routes
  if (isAuthPage || isPublicPage) {
    return NextResponse.next();
  }

  /**
   * ⚠️ IMPORTANT
   * Firebase Authentication is handled on the CLIENT SIDE.
   * Firebase does NOT set auth cookies automatically.
   *
   * Route protection is handled by:
   * - AuthContext (onAuthStateChanged)
   * - AuthGuard (client component)
   *
   * So middleware should NOT block requests.
   */
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/profile/:path*"],
};
