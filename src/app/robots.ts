import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const base = appUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Don't index authenticated areas, the redirect endpoint, or the
      // token-gated anonymous stats pages.
      disallow: ["/dashboard", "/go/", "/api/", "/s/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
