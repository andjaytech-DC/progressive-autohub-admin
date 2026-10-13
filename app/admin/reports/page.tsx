import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import ReportsPage from "@/app/components/admin/reports/ReportsPage";

export default async function ReportsPageRoute() {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("pah_session")?.value);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return <ReportsPage />;
}
