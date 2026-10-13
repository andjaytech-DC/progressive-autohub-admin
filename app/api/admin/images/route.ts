import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { readSessionCookie, verifySession } from "@/app/lib/auth";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;
  const vehicles = await prisma.vehicle.findMany({ select: { id: true, title: true, images: true, createdAt: true } });
  const allImages = vehicles.flatMap((v: any) => (v.images ?? []).map((url: string, i: number) => ({ id: `${v.id}-${i}`, url, vehicleId: v.id, createdAt: v.createdAt })));
  return NextResponse.json({ images: allImages });
}
