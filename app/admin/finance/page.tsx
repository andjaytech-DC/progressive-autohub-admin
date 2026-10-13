import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import FinancePage from "@/app/components/admin/finance/FinancePage";

export default async function FinancePageRoute() {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("pah_session")?.value);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return <FinancePage />;
}
