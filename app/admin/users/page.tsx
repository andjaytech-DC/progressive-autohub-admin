import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import UsersRolesPage from "@/app/components/admin/users-roles/UsersRolesPage";

export default async function UsersPageRoute() {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("pah_session")?.value);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return <UsersRolesPage />;
}
