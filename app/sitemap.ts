import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://matiasgrande.github.io/landing-sigo/",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
