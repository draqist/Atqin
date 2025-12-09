import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Reflection on Iqraa";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// 1. Helper to replicate your "GeneratedCover" logic with real Hex codes
// (Satori, the engine behind this, needs explicit styles, not Tailwind classes)
function getGradientStyle(id: string) {
  const gradients = [
    "linear-gradient(to bottom right, #ffe4e6, #ccfbf1)", // rose-100 to teal-100
    "linear-gradient(to bottom right, #ffedd5, #ffe4e6)", // orange-100 to rose-100
    "linear-gradient(to bottom right, #dbeafe, #ede9fe)", // blue-100 to violet-100
    "linear-gradient(to bottom right, #d1fae5, #cffafe)", // emerald-100 to cyan-100
    "linear-gradient(to bottom right, #fef3c7, #ffedd5)", // amber-100 to orange-100
  ];
  const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[index % gradients.length];
}

// 2. The Image Generation Function
export default async function Image({
  params,
}: {
  params: { noteId: string };
}) {
  // Fetch the note data directly from your backend
  // Note: We use the full URL because this runs on the server/edge
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/notes/public/${params.noteId}`
  );
  const note = await response.json();

  const gradient = getGradientStyle(params.noteId);

  return new ImageResponse(
    (
      // Outer Container (The "Card" Background)
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            flexDirection: "column",
            background: gradient,
            borderRadius: "24px",
            padding: "60px",
            justifyContent: "space-between",
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 20px 50px -10px rgba(0,0,0,0.1)",
          }}
        >
          {/* Top: Context Tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.8)",
              padding: "8px 20px",
              borderRadius: "50px",
              width: "fit-content",
              fontSize: "20px",
              fontWeight: 600,
              color: "#475569", // slate-600
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ marginRight: "10px" }}>📖</span>
            {note.book_title || "Islamic Reflection"}
          </div>

          {/* Middle: Title */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{
                fontSize: "70px",
                fontWeight: 900,
                color: "#0f172a", // slate-900
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                // Simulating line-clamp with overflow hidden is hard here,
                // so we just let it flow naturally or slice it
                maxWidth: "900px",
              }}
            >
              {note.title}
            </div>

            <div
              style={{ fontSize: "28px", color: "#64748b", maxWidth: "800px" }}
            >
              {note.description
                ? note.description.slice(0, 120) +
                  (note.description.length > 120 ? "..." : "")
                : ""}
            </div>
          </div>

          {/* Bottom: Author & Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: "40px",
            }}
          >
            {/* Author */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#e0e7ff", // indigo-100
                  color: "#4f46e5", // indigo-600
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginRight: "20px",
                }}
              >
                {note.author_name ? note.author_name[0] : "U"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#1e293b",
                  }}
                >
                  {note.author_name}
                </span>
                <span style={{ fontSize: "18px", color: "#94a3b8" }}>
                  Student on Iqraa
                </span>
              </div>
            </div>

            {/* Logo / Brand */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "28px",
                fontWeight: "bold",
                color: "#0f172a",
              }}
            >
              <span style={{ color: "#059669", marginRight: "8px" }}>✦</span>{" "}
              Iqraa
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // Optional: Load a custom font here if you want it to look perfect
      // fonts: [{ name: 'Inter', data: fontData, style: 'normal', weight: 700 }],
    }
  );
}
