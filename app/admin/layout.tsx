import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/app/components/admin/adminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("pah_session")?.value);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
