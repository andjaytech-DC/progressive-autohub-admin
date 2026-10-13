import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  // Include the relation fields that FinancePage renders — bare findMany
  // returned records with undefined user/vehicle fields.
  const finance = await prisma.financeApplication.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      vehicle: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ finance, source: "local" });
}
