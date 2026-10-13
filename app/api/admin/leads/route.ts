import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  // Include vehicle context that LeadsPage renders.
  const leads = await prisma.lead.findMany({
    include: { vehicle: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ leads, source: "local" });
}
