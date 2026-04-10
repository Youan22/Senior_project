/**
 * Browser-visible API origin. Set in `.env.local` or the shell when running `next dev`:
 *   NEXT_PUBLIC_API_URL=http://localhost:5000
 * No trailing slash.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return raw.replace(/\/+$/, "");
}

/** Build an absolute URL for a path starting with `/api/...`. */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${p}`;
}
