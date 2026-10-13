import { NextResponse } from "next/server";
import { prisma } from "@/app/server/prisma";
import { backendFetch, isBackendUnreachable, BackendError } from "@/app/lib/backend";
import { requireAdmin, isAuthError } from "@/app/server/authz";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const session = auth.session;

  if (session.token) {
    try {
      const [brands, categories, dealers] = await Promise.all([
        backendFetch<{ id: number; name: string }[]>("/vehicles/popular-brands", { token: session.token }).catch(() => null),
        backendFetch<{ id: number; name: string; slug: string }[]>("/categories", { token: session.token }).catch(() => null),
        backendFetch<{ id: number; businessName: string; city: string; state: string; status: string }[]>("/dealers", { token: session.token }).catch(() => null),
      ]);
      return NextResponse.json({
        brands: (brands ?? []).map((b) => ({ id: b.id, name: b.name })),
        categories: categories ?? [],
        dealers: (dealers ?? []).map((d) => ({ id: d.id, name: d.businessName, city: d.city, state: d.state, status: d.status })),
        source: "backend",
      });
    } catch {}
  }

  const [brands, categories, dealers] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.dealer.findMany({ orderBy: { businessName: "asc" } }),
  ]);

  return NextResponse.json({
    brands: brands.map((b) => ({ id: b.id, name: b.name })),
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    dealers: dealers.map((d) => ({ id: d.id, name: d.businessName, city: d.city, state: d.state, status: d.status })),
    source: "local",
  });
}
