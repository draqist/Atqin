import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Iqraa",
    short_name: "Iqraa",
    description: "Your personal library and reading companion",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-5.jpg",
        sizes: "192x192",
        type: "image/jpg",
      },
      {
        src: "/icon-5.jpg",
        sizes: "512x512",
        type: "image/jpg",
      },
    ],
  };
}
