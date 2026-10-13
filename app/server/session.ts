import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/auth";
import type { SessionPayload } from "@/app/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get("pah_session")?.value);
}
