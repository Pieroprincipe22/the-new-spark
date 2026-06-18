import type { MetadataRoute } from "next";

const baseUrl = "https://www.the-new-spark.es";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
  url: `${baseUrl}/sorteo`,
  lastModified: new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.8,
},
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/reservar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/promociones`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}