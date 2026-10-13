import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  // Shape the response to what LocationsPage renders. Dealer.status is
  // "PENDING"|"APPROVED"|"REJECTED", not a boolean; map APPROVED → active.
  const dealers = await prisma.dealer.findMany({
    select: { id: true, businessName: true, city: true, state: true, pincode: true, status: true },
  });
  const locations = dealers.map((d) => ({
    id: d.id,
    name: d.businessName,
    city: d.city,
    state: d.state,
    pincode: d.pincode,
    active: d.status === "APPROVED",
  }));
  return NextResponse.json({ locations });
}
