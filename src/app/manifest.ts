import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Bookworm",
    short_name: "Bookworm",
    description:
      "Browse and buy hand-picked digital books. Buy once, download instantly, and keep forever.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFDFA",
    theme_color: "#E8B930",
    orientation: "portrait",
    lang: "en",
    icons: [
      {
        src: "/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/pwa-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      }
    ]
  };
}
