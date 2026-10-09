import { ImageResponse } from "next/og";
import { business, seo } from "@/data/content";

export const alt = seo.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0369A1 0%, #0EA5E9 60%, #06B6D4 100%)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: 34, opacity: 0.9 }}>Odontología · Montevideo</div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          {business.name}
        </div>
        <div style={{ fontSize: 40, marginTop: 32, opacity: 0.95 }}>{business.slogan}</div>
      </div>
    ),
    { ...size },
  );
}
