/**
 * JSON-LD 结构化数据生成器
 *
 * 帮助 Google 理解页面结构，可能拿到富文本搜索结果
 */

// Organization — 首页用
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flowrid",
    url: "https://www.flowrid.com",
    description:
      "Find and compare top third-party logistics (3PL) providers in the US.",
    logo: "https://www.flowrid.com/favicon.ico",
    sameAs: [],
  };
}

// WebSite + SearchAction — 全局用，在 Google 搜索结果中显示站内搜索框
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Flowrid",
    url: "https://www.flowrid.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.flowrid.com/3pl?state={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ItemList — SEO 列表页用
export function itemListSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: item.name,
        url: item.url,
      },
    })),
  };
}

// LocalBusiness — 3PL 详情页用
export function localBusinessSchema(data: {
  name: string;
  description: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.name,
    description: data.description,
    url: data.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: data.city,
      addressRegion: data.state,
      addressCountry: "US",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: data.rating,
      reviewCount: data.reviewCount,
    },
  };
}
