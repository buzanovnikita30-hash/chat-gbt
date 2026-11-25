import type { MetadataRoute } from "next";
import { getPublicSiteOrigin } from "@/lib/app-url";

const BASE_URL = getPublicSiteOrigin();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/spotify`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guarantee`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
