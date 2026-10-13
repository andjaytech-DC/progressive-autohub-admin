import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import {
  requireAdmin,
  isAuthError,
  pick,
  ADMIN_USER_WRITABLE,
  ADMIN_USER_FORBIDDEN,
} from "@/app/server/authz";

export const runtime = "nodejs";

/**
 * P0-4: this route previously forwarded the entire request body into
 * `prisma.user.update({ data: body })`. Any authenticated session — including
 * CUSTOMER — could send `{ "role": "ADMIN" }` or `{ "password": "x" }`; the
 * latter was stored verbatim because no hashing happens at this layer.
 *
 * Now: admin-only, explicit allow-list, and credentials/role are refused.
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

  const bodyKeys =
    body && typeof body === "object" && !Array.isArray(body)
      ? Object.keys(body as Record<string, unknown>)
      : [];

  const attempted = bodyKeys.filter((k) =>
    (ADMIN_USER_FORBIDDEN as readonly string[]).includes(k),
  );
  if (attempted.length > 0) {
    return NextResponse.json(
      {
        error: `Fields not writable here: ${attempted.join(", ")}. Use the role-guarded backend endpoints PATCH /api/users/:id/assign-role and PATCH /api/users/:id/change-password.`,
      },
      { status: 400 },
    );
  }

  const data = pick(body, ADMIN_USER_WRITABLE);
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: `No writable fields supplied. Allowed: ${ADMIN_USER_WRITABLE.join(", ")}` },
      { status: 400 },
    );
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  // Never return credential material, even to an admin.
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user });
}