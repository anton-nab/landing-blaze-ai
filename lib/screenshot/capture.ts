const SCREENSHOTONE_ENDPOINT = "https://api.screenshotone.com/take";

/**
 * Captures a JPEG screenshot of the target page via ScreenshotOne.
 * Never throws — screenshots are a nice-to-have, not required for an audit
 * to succeed. Returns null if unconfigured or on any failure.
 */
export async function captureScreenshot(url: string): Promise<Buffer | null> {
  const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
  if (!accessKey) return null;

  const params = new URLSearchParams({
    access_key: accessKey,
    url,
    viewport_width: "1440",
    viewport_height: "900",
    device_scale_factor: "1",
    format: "jpg",
    image_quality: "80",
    block_ads: "true",
    block_cookie_banners: "true",
    block_trackers: "true",
    block_chats: "true",
    cache: "true",
    cache_ttl: "86400",
    timeout: "20",
  });

  try {
    const res = await fetch(`${SCREENSHOTONE_ENDPOINT}?${params.toString()}`, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.error("[screenshot] ScreenshotOne error", res.status, await res.text().catch(() => ""));
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error("[screenshot] capture failed", err);
    return null;
  }
}
