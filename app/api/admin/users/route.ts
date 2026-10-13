import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { readSessionCookie, verifySession } from "@/app/lib/auth";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  const users = await prisma.user.findMany({ select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, createdAt: true } });
  return NextResponse.json({ users, source: "local" });
}
