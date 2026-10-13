import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set default locale cookie if not present
  const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - logo.svg (logo file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|logo.svg).*)",
  ],
};
