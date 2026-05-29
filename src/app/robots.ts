import type { MetadataRoute } from "next";

const baseUrl = "https://www.the-new-spark.es";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}