import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { readSessionCookie, verifySession } from "@/app/lib/auth";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  const enquiries = await prisma.insuranceEnquiry.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ enquiries });
}
