import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/" &&
    !request.cookies.has("sessionid") &&
    process.env.NEXT_PUBLIC_API_URL !== "mock"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const development = process.env.NODE_ENV !== "production";
  const apiOrigin = development ? "http://localhost:8000 http://127.0.0.1:8000" : "";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    // Tailwind, crop and drag libraries set dynamic inline styles.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${apiOrigin}`,
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin}${development ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!api|admin|static|_next/static|_next/image|favicon.ico|placeholders).*)"],
};
