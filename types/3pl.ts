// Flowrid 核心 TypeScript 类型定义

export interface ThreePL {
  id: string;
  name: string;
  slug: string;

  country: string;
  state: string;
  city: string;

  categories: string[];
  platforms: string[];

  shipping_speed: string;
  cost_level: string;

  rating: number;
  review_count: number;

  order_capacity: number;
  sku_capacity: number;

  integrations: string[];

  description: string;
  website?: string;
  logo?: string;

  created_at: string;
}

export interface ThreePLCardData extends ThreePL {
  score: number;
}

export interface PageParams {
  state: string;
  category?: string;
  platform?: string;
}

export interface RFQRequest {
  name: string;
  email: string;
  company?: string;
  state: string;
  category: string;
  platform: string;
  message?: string;
}

export interface AISummary {
  summary: string;
  why_section: string;
  faq: string[];
}

export interface SEOData {
  title: string;
  description: string;
}
