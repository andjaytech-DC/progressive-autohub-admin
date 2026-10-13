import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import Link from "next/link";

export default async function Navbar() {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("pah_session")?.value);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <Link href="/" className="text-xl font-extrabold text-[#FFC700]">
        AutoHub <span className="text-white text-sm font-normal">Admin</span>
      </Link>
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm text-content-muted">{session.email}</span>
            <span className="px-2 py-1 bg-[#FFC700] text-[#15130a] rounded-lg text-xs font-bold">{session.role}</span>
            <form action="/api/auth/logout" method="POST" className="m-0">
              <button type="submit" className="px-3 py-1.5 border border-border rounded-lg text-sm text-content-muted hover:text-white">Logout</button>
            </form>
          </>
        ) : (
          <Link href="/login" className="px-3 py-1.5 bg-[#FFC700] text-[#15130a] rounded-lg text-sm font-bold">Login</Link>
        )}
      </div>
    </nav>
  );
}
