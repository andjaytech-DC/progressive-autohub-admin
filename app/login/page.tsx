import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("pah_session")?.value);
  if (session) redirect("/admin");

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#090B0D]">
      <div className="rounded-2xl border border-line bg-card p-8 w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-[#FFC700] mb-6 text-center">AutoHub Admin</h1>
        <p className="text-sm text-content-muted text-center mb-6">Please log in to access the admin panel</p>
        <form action="/api/auth/login" method="post" className="space-y-4">
          <div><label className="block text-sm font-medium text-content-muted mb-1">Email</label><input name="email" type="email" required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-content" /></div>
          <div><label className="block text-sm font-medium text-content-muted mb-1">Password</label><input name="password" type="password" required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-content" /></div>
          <button type="submit" className="w-full py-3 bg-[#FFC700] text-[#15130a] rounded-xl font-bold hover:brightness-110">Sign In</button>
        </form>
      </div>
    </div>
  );
}
