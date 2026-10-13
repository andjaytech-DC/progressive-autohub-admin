import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { readSessionCookie, verifySession } from "@/app/lib/auth";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  const settings = await prisma.setting.findMany();
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  const body = await request.json();
  const { key, value } = body;
  const setting = await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  return NextResponse.json({ setting });
}
