import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0A0B12 0%, #12142E 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              display: "flex",
              background: "linear-gradient(135deg, #7C89F5, #5B6EE8 55%, #3F4FC4)",
            }}
          />
          <div style={{ display: "flex", color: "#fff", fontSize: 32, fontWeight: 700 }}>
            LandingBlaze
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div
            style={{
              display: "flex",
              color: "#fff",
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.12,
            }}
          >
            Votre landing page mérite un blaze honnête.
          </div>
          <div style={{ display: "flex", color: "#9599C0", fontSize: 26, marginTop: 28 }}>
            Audit de conversion propulsé par l&apos;IA — résultat en 30 secondes.
          </div>
        </div>

        <div style={{ display: "flex", color: "#71717A", fontSize: 20 }}>landingblaze.ai</div>
      </div>
    ),
    { ...size },
  );
}
