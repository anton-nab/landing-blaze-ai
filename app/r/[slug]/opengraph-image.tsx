import { ImageResponse } from "next/og";
import { getAuditBySlug } from "@/lib/audit/get-audit";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);

  const score = audit?.report.score ?? 0;
  const grade = audit?.report.grade ?? "";

  let hostname = audit?.url ?? "landingblaze.ai";
  try {
    if (audit) hostname = new URL(audit.url).hostname;
  } catch {
    // keep fallback
  }

  const RADIUS = 80;
  const CIRC = 2 * Math.PI * RADIUS;
  const offset = CIRC * (1 - score / 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0A0B12 0%, #12142E 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              display: "flex",
              background: "linear-gradient(135deg, #7C89F5, #5B6EE8 55%, #3F4FC4)",
            }}
          />
          <div style={{ display: "flex", color: "#fff", fontSize: 30, fontWeight: 700 }}>
            LandingBlaze
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
            <div style={{ display: "flex", color: "#9599C0", fontSize: 24, marginBottom: 18 }}>
              {hostname}
            </div>
            <div
              style={{
                display: "flex",
                color: "#fff",
                fontSize: 58,
                fontWeight: 800,
                letterSpacing: -1.5,
                lineHeight: 1.1,
              }}
            >
              Landing Score
            </div>
            <div style={{ display: "flex", color: "#C7CBE8", fontSize: 26, marginTop: 18 }}>
              {grade}
            </div>
          </div>

          <div style={{ position: "relative", width: 200, height: 200, display: "flex" }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,.12)"
                strokeWidth="14"
              />
              <circle
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke="#5B6EE8"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={offset}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", color: "#fff", fontSize: 56, fontWeight: 700 }}>
                {score}
              </div>
              <div style={{ display: "flex", color: "#71717A", fontSize: 18 }}>/ 100</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", color: "#71717A", fontSize: 20 }}>
          Audité par l&apos;IA · landingblaze.ai
        </div>
      </div>
    ),
    { ...size },
  );
}
