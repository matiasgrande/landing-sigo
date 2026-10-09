import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const URL_SITIO = "https://matiasgrande.github.io/landing-sigo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${URL_SITIO}/sitemap.xml`,
  };
}
