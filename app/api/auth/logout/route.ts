import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { backendFetch } from "@/app/lib/backend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const session = sessionToken ? await verifySession(sessionToken) : null;

  // Best-effort server-side revocation: kill the stored backend refresh token.
  // Failure must not block local logout, so errors are swallowed.
  if (session?.token) {
    try {
      await backendFetch("/auth/logout", {
        method: "POST",
        token: session.token,
      });
    } catch {
      // ignore — the session cookie is still cleared below
    }
  }

  // Clear with the same path/same-site attributes it was set with. Previously
  // this set the cookie's *value* to a raw Set-Cookie header string, which left
  // a live cookie in place (and the user still logged in).
  cookieStore.delete({ name: SESSION_COOKIE, path: "/" });

  // Browser form submissions follow the redirect; JSON clients get JSON.
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }
  return NextResponse.json({ success: true });
}
