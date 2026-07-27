"use client";

import posthog from "posthog-js";

/** No-ops when PostHog isn't initialized (missing key) — analytics should never break the app. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

export function identifyUser(id: string, properties?: Record<string, unknown>) {
  if (!posthog.__loaded) return;
  posthog.identify(id, properties);
}
