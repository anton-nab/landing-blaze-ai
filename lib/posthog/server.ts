import { PostHog } from "posthog-node";

let cachedClient: PostHog | null | undefined;

/**
 * Returns null (not throws) when unconfigured. flushAt:1/flushInterval:0 send each
 * capture() immediately over HTTP — required in serverless, where the process can
 * suspend right after the response and never flush a buffered batch.
 */
export function getPosthogServerClient(): PostHog | null {
  if (cachedClient !== undefined) return cachedClient;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    cachedClient = null;
    return null;
  }

  cachedClient = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return cachedClient;
}
