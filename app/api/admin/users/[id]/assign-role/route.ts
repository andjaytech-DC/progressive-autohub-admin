import { NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/app/server/authz";
import { backendFetch } from "@/app/lib/backend";

export const runtime = "nodejs";

/**
 * Admin-only proxy: role mutation MUST go through the backend's dedicated
 * assign-role endpoint, which validates the role against the canonical Role
 * enum. PATCH /api/admin/users/:id explicitly refuses `role` in the body.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const result = await backendFetch(`/users/${id}/assign-role`, {
      method: "PATCH",
      token: auth.session?.token ?? null,
      body,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Assign-role failed" }, { status: 400 });
  }
}
