import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { requireAdmin, isAuthError, pick, ADMIN_LEAD_WRITABLE } from "@/app/server/authz";

export const runtime = "nodejs";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "FOLLOW_UP", "TEST_DRIVE", "NEGOTIATION", "WON", "LOST"] as const;

/**
 * P0-4: previously `data: body` — any key was forwarded to Prisma, and the
 * route only checked that a session existed, not the role.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = pick(body, ADMIN_LEAD_WRITABLE);
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: `No writable fields supplied. Allowed: ${ADMIN_LEAD_WRITABLE.join(", ")}` },
      { status: 400 },
    );
  }

  // The lead lifecycle is a controlled vocabulary, not free text.
  if (typeof data.status === "string" && !(LEAD_STATUSES as readonly string[]).includes(data.status)) {
    return NextResponse.json(
      { error: `Invalid lead status. Allowed: ${LEAD_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  const lead = await prisma.lead.update({ where: { id }, data });
  return NextResponse.json({ lead });
}