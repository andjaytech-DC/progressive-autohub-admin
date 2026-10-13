import { NextResponse } from "next/server";
import { backendFetch } from "@/app/lib/backend";
import { signSession } from "@/app/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (process.env.NESTJS_API_URL) {
    try {
      const result = await backendFetch("/auth/login", { method: "POST", body: { email, password } });
      const cookieStore = await cookies();
      const session = await signSession({
        id: String(result.user?.id ?? 0),
        username: result.user?.email ?? email,
        email,
        name: result.user?.firstName ?? "",
        role: result.user?.role ?? "CUSTOMER",
        token: result.accessToken,
      });
      cookieStore.set("pah_session", session, { httpOnly: true, sameSite: "lax", maxAge: 604800 });
      return NextResponse.json({ success: true });
    } catch {}
  }

  return NextResponse.json({ error: "Login failed" }, { status: 401 });
}
