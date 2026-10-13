import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import LeadsPage from "@/app/components/admin/leads/LeadsPage";

export default async function LeadsPageRoute() {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("pah_session")?.value);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return <LeadsPage />;
}
