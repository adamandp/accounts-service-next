export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");
const useApiProxy = process.env.NEXT_PUBLIC_USE_API_PROXY === "true";

export function apiPath(path: string): string {
  if (!useApiProxy) return API_URL + path;
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/api" + path;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
let generation = 0;
export function setAccessToken(token: string | null) {
  generation++;
  accessToken = token;
}
export async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  token?: string | null,
): Promise<T> {
  const response = await fetch(apiPath(path), {
    method,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(!["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())
        ? { "X-Accounts-CSRF": "1" }
        : {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      response.status,
      result?.errors ?? "Request failed (" + response.status + ")",
    );
  return (result && "data" in result ? result.data : result) as T;
}
export function refresh(): Promise<string> {
  if (!refreshPromise) {
    const epoch = generation;
    const run = async () => {
      const data = await request<{ accessToken: string }>(
        "/sessions/refresh",
        "POST",
      );
      if (epoch !== generation) throw new ApiError(401, "Session changed");
      accessToken = data.accessToken;
      return data.accessToken;
    };
    const locked = async () =>
      typeof navigator !== "undefined" && navigator.locks
        ? await navigator.locks.request("accounts-service-refresh", run)
        : await run();
    refreshPromise = locked()
      .catch((error) => {
        if (
          error instanceof ApiError &&
          error.status === 401 &&
          epoch === generation &&
          typeof window !== "undefined"
        )
          window.dispatchEvent(new Event("accounts-session-expired"));
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise!;
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const token = accessToken;
  try {
    return await request<T>(path, method, body, token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const next =
      accessToken && accessToken !== token ? accessToken : await refresh();
    return request<T>(path, method, body, next);
  }
}
