import { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * 动态 Sitemap 生成
 *
 * Google 通过 sitemap.xml 发现所有 SEO 页面
 */
export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://flowrid.com";

  // 静态核心页面
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/3pl`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/rfq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // 工具聚合平台
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tools/tracking-visibility`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/tools/order-management`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/tools/shipping-rates`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/tools/inventory-warehouse`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/tools/automation-integration`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/tools/compliance-documents`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/tools/shipping-calculator`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/tools/rfq-generator`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/tools/fulfillment-cost-estimator`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    // AI 可读数据层
    { url: `${baseUrl}/llms.txt`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/api/knowledge`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    const supabase = createServerClient();
    if (!supabase) return staticPages;

    // 从数据库获取所有 state + category + platform 组合
    const { data: providers } = await supabase
      .from("pl_providers")
      .select("state, categories, platforms");

    if (!providers) return staticPages;

    // 去重并生成所有 SEO 页面 URL
    const urlSet = new Set<string>();

    for (const p of providers) {
      const state = p.state?.toLowerCase();
      if (state) {
        urlSet.add(`${baseUrl}/3pl/${state}`);

        if (p.categories) {
          for (const cat of p.categories) {
            const category = cat.toLowerCase();
            urlSet.add(`${baseUrl}/3pl/${state}/${category}`);

            if (p.platforms) {
              for (const plat of p.platforms) {
                const platform = plat.toLowerCase();
                urlSet.add(
                  `${baseUrl}/3pl/${state}/${category}/${platform}`
                );
              }
            }
          }
        }
      }
    }

    const dynamicPages: MetadataRoute.Sitemap = Array.from(urlSet).map(
      (url) => ({
        url,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })
    );

    return [...staticPages, ...dynamicPages];
  } catch {
    return staticPages;
  }
}
