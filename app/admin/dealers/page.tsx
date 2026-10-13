import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import DealersPage from "@/app/components/admin/dealers/DealersPage";

export default async function DealersPageRoute() {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("pah_session")?.value);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return <DealersPage />;
}
