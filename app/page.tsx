import { redirect } from "next/navigation";
import { getSession } from "@/app/server/session";

export default async function Home() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  redirect("/admin");
}
