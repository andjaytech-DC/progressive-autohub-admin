import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { requireAdmin, isAuthError, pick, ADMIN_VEHICLE_WRITABLE } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  const vehicles = await prisma.vehicle.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ vehicles, source: "local" });
}

/**
 * Create a vehicle. VehicleForm POSTs here (previously it posted to
 * /api/vehicles, which did not exist in this repo). Validates + whitelists
 * against ADMIN_VEHICLE_WRITABLE.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

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

  // Title, price, brandId, categoryId, and dealerId are required by the schema.
  if (typeof data.title !== "string" || typeof data.price !== "number") {
    return NextResponse.json({ error: "title (string) and price (number) are required" }, { status: 400 });
  }
  if (typeof data.brandId !== "number" || typeof data.categoryId !== "number" || typeof data.dealerId !== "number") {
    return NextResponse.json({ error: "brandId, categoryId, and dealerId are required numbers" }, { status: 400 });
  }

  try {
    const vehicle = await prisma.vehicle.create({ data: data as any });
    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? "Unable to create vehicle" }, { status: 500 });
  }
}
