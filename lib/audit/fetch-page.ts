import { assertPublicHttpUrl, UnsafeUrlError } from "@/lib/security/ssrf";

const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 3 * 1024 * 1024; // 3MB — plenty for HTML, guards against huge/hostile responses
const FETCH_TIMEOUT_MS = 10_000;

export class FetchPageError extends Error {}

async function readTextCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
}

/**
 * Fetches a user-supplied URL safely: validates every hop (including redirect
 * targets, to close DNS-rebinding / redirect-based SSRF bypasses) against
 * private/internal address ranges, caps redirects and response size.
 */
export async function fetchPageHtml(target: URL): Promise<{ html: string; finalUrl: string }> {
  let current = target;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    try {
      await assertPublicHttpUrl(current);
    } catch (err) {
      if (err instanceof UnsafeUrlError) throw new FetchPageError(err.message);
      throw err;
    }

    let res: Response;
    try {
      res = await fetch(current.href, {
        headers: { "User-Agent": "LandingRoastBot/1.0 (+https://landingroast.ai)" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        redirect: "manual",
      });
    } catch {
      throw new FetchPageError(
        "Impossible de récupérer cette page. Vérifiez qu'elle est publique et accessible.",
      );
    }

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) throw new FetchPageError("Redirection invalide.");
      current = new URL(location, current);
      continue;
    }

    if (!res.ok) {
      throw new FetchPageError(`La page a répondu avec une erreur (HTTP ${res.status}).`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new FetchPageError("Cette URL ne pointe pas vers une page HTML.");
    }

    const html = await readTextCapped(res, MAX_BODY_BYTES);
    return { html, finalUrl: current.href };
  }

  throw new FetchPageError("Trop de redirections.");
}
