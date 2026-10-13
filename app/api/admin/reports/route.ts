import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { readSessionCookie, verifySession } from "@/app/lib/auth";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;

  const [totalVehicles, availableVehicles, soldVehicles, totalCustomers, totalDealers, pendingDealers, totalLeads, newLeads, totalOrders, totalFinanceApps, totalInspections, totalServiceBookings, revenueThisMonth] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "SOLD" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.dealer.count(),
    prisma.dealer.count({ where: { status: "PENDING" } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.order.count(),
    prisma.financeApplication.count(),
    prisma.inspectionRequest.count(),
    prisma.serviceBooking.count(),
    prisma.order.aggregate({ _sum: { totalPrice: true }, where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
  ]);

  const revenue = revenueThisMonth?._sum?.totalPrice ?? 0;

  return NextResponse.json({
    stats: {
      totalVehicles, availableVehicles, soldVehicles, totalCustomers, totalDealers, pendingDealers,
      totalLeads, newLeads, totalOrders, totalFinanceApps, totalInspections, totalServiceBookings, revenue,
    },
  });
}
