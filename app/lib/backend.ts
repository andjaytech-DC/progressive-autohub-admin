export const BACKEND_URL =
  (process.env.NESTJS_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

export const isBackendConfigured = () => Boolean(process.env.NESTJS_API_URL);

export class BackendError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "BackendError";
  }
}

export interface BackendFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  timeoutMs?: number;
}

export async function backendFetch<T = any>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const origin = BACKEND_URL.endsWith("/api") ? BACKEND_URL : `${BACKEND_URL}/api`;
  const url = `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(options.timeoutMs ?? 6_000),
      cache: "no-store",
    });
  } catch {
    throw new BackendError(0, "Backend unreachable");
  }
  const text = await res.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const record = (json ?? {}) as Record<string, unknown>;
    const message = (record.message as string) ?? (record.error as string) ?? `Backend error (${res.status})`;
    throw new BackendError(res.status, typeof message === "string" ? message : JSON.stringify(message));
  }
  const record = (json ?? {}) as Record<string, unknown>;
  if (record && typeof record === "object" && "data" in record) {
    return record.data as T;
  }
  return json as T;
}

export function isBackendUnreachable(err: unknown): boolean {
  return err instanceof BackendError && err.status === 0;
}
