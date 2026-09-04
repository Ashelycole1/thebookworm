import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-book-worm.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/keep-forever", "/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
