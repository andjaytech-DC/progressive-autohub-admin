import { NextResponse } from "next/server";
import { verifySession, type SessionPayload, readSessionCookie } from "@/app/lib/auth";

export interface AuthContext {
  session: SessionPayload;
}

export type AuthResult = AuthContext | NextResponse;

/**
 * Central admin authorization gate.
 *
 * This helper already existed but was imported by ZERO routes: 16 of the 18
 * `/api/admin/*` endpoints verified only that *a* session existed, never the
 * role. Any logged-in CUSTOMER could therefore read admin data and, via
 * `PATCH /api/admin/users/:id`, write `{ role: "ADMIN" }` or a plaintext
 * `{ password }` straight into the User table.
 */
export async function requireAdmin(request: Request): Promise<AuthResult> {
  const session = await verifySession(readSessionCookie(request));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { session };
}

export function isAuthError(value: AuthResult): value is NextResponse {
  return value instanceof NextResponse;
}

/**
 * Explicit field allow-list for administrative writes.
 *
 * `prisma.x.update({ data: body })` is never acceptable in an admin route:
 * it forwards every key the client sent to the ORM, so adding a field to a
 * request body is enough to escalate privilege or corrupt a row. Always pick
 * the intended keys explicitly.
 */
export function pick<T extends Record<string, unknown>>(
  body: unknown,
  allowed: readonly string[],
): Partial<T> {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const src = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (src[key] !== undefined) out[key] = src[key];
  }
  return out as Partial<T>;
}

/**
 * Keys an admin may change on a User — deliberately excludes role/password.
 *
 * `profileImage` is omitted because it does not exist in this app's (drifted)
 * Prisma User model. It belongs in the backend's canonical schema.
 */
export const ADMIN_USER_WRITABLE = [
  "firstName",
  "lastName",
  "phone",
  "isActive",
] as const;

/**
 * Role changes are NOT writable here. They must go through the NestJS
 * admin endpoint `PATCH /api/users/:id/assign-role`, which is role-guarded and
 * records the change. Same for password: `PATCH /api/users/:id/change-password`,
 * which bcrypt-hashes. Allowing them here would bypass both the guard and the
 * hashing, which is exactly how plaintext passwords reached the table.
 */
export const ADMIN_USER_FORBIDDEN = ["role", "password", "refreshToken", "fcmToken"] as const;

/** Keys an admin may change on a Vehicle. */
export const ADMIN_VEHICLE_WRITABLE = [
  "title",
  "description",
  "price",
  "emi",
  "year",
  "mileage",
  "fuel",
  "transmission",
  "bodyType",
  "color",
  "engine",
  "images",
  "status",
  "listingStatus",
  "city",
  "state",
  "pincode",
  "latitude",
  "longitude",
  "registrationNumber",
  "registrationState",
  "features",
  "highlights",
  "isFeatured",
  "availableForFinance",
  "isCertified",
  "sellerType",
  "brandId",
  "categoryId",
  "dealerId",
] as const;

/** Keys an admin may change on a Lead. */
export const ADMIN_LEAD_WRITABLE = ["status", "notes"] as const;

/** Keys an admin may change on a FinanceApplication. */
export const ADMIN_FINANCE_WRITABLE = ["status"] as const;