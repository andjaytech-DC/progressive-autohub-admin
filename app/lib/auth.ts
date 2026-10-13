import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "pah_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type UserRole = "CUSTOMER" | "DEALER" | "ADMIN" | "DEALER_EMPLOYEE";

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
}

export interface SessionPayload extends SessionUser {
  iat?: number;
  exp?: number;
}

/** Non-secret placeholder used only outside production. */
const DEV_SECRET_FALLBACK = "progressive-autohub-dev-secret-please-set-AUTH_SECRET";

/**
 * SECURITY: this previously fell back to a hard-coded string committed to the
 * repository, so any deployment that forgot AUTH_SECRET would sign and verify
 * admin sessions with a publicly known key — anyone could mint an ADMIN cookie.
 * In production we now refuse to run. Dev fallback kept for local setup.
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set in production. Refusing to sign or verify sessions with a default value.");
    }
    return new TextEncoder().encode(DEV_SECRET_FALLBACK);
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(getSecretKey());
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  // Resolved outside the try/catch on purpose: a missing AUTH_SECRET is a
  // deployment misconfiguration and must surface loudly rather than silently
  // log every admin out.
  const key = getSecretKey();
  try {
    const { payload } = await jwtVerify(token, key);
    if (typeof payload.id !== "string" || typeof payload.role !== "string") return null;
    return payload as unknown as SessionPayload;
  } catch { return null; }
}

export function decodeSessionClient(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload?.id || !payload?.role) return null;
    return { id: payload.id, username: payload.username, email: payload.email, name: payload.name, role: payload.role, token: payload.token };
  } catch { return null; }
}

export function sessionCookieValue(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearSessionCookieValue(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function readSessionCookie(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  const match = header.split("; ").find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return match?.slice(SESSION_COOKIE.length + 1);
}

