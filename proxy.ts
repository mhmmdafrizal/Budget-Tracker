import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC = ["/signin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Validate the session cookie server-side — handles expired/orphaned cookies
  // try/catch: a malformed/invalid token makes getSession throw, not return null
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch {
    session = null;
  }

  const isPublic = PUBLIC.includes(pathname);

  if (session?.user) {
    if (isPublic) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // No valid session — clear any stale cookie so it can't loop or 500
  const response = isPublic
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/signin", request.url));
  response.cookies.delete("better-auth.session_token");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};