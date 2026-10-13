import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { requireAdmin, isAuthError, pick, ADMIN_VEHICLE_WRITABLE } from "@/app/server/authz";

export const runtime = "nodejs";

async function idFrom(params: Promise<{ id: string }>): Promise<number | null> {
  const id = Number((await params).id);
  return Number.isInteger(id) ? id : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const id = await idFrom(params);
  if (id === null) return NextResponse.json({ error: "Invalid vehicle id" }, { status: 400 });

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ vehicle });
}

/**
 * P0-4: previously `data: body` — every key in the request body reached
 * Prisma unchecked, and the route verified only that a session existed.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const id = await idFrom(params);
  if (id === null) return NextResponse.json({ error: "Invalid vehicle id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = pick(body, ADMIN_VEHICLE_WRITABLE);
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: `No writable fields supplied. Allowed: ${ADMIN_VEHICLE_WRITABLE.join(", ")}` },
      { status: 400 },
    );
  }

  const vehicle = await prisma.vehicle.update({ where: { id }, data });
  return NextResponse.json({ vehicle });
}

/** Soft delete — matches the backend, which archives via status=INACTIVE. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const id = await idFrom(params);
  if (id === null) return NextResponse.json({ error: "Invalid vehicle id" }, { status: 400 });

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: { status: "INACTIVE" },
  });
  return NextResponse.json({ vehicle });
}