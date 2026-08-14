import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const routes = ["", "/login", "/register", "/privacy"];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-01-01"),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
}
