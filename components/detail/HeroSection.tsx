import { starsFromScore } from "@/lib/detail-content";
import { formatState } from "@/lib/detail-content";
import Link from "next/link";

interface HeroSectionProps {
  name: string;
  slug: string;
  logo?: string;
  heroImage?: string;
  rating: number;
  reviewCount: number;
  description: string;
  city: string;
  state: string;
  website?: string;
  orderCapacity: number;
}

/** 渲染星级 */
function StarRating({ rating }: { rating: number }) {
  const { stars, label } = starsFromScore(rating);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-5 h-5 ${n <= stars ? "text-[#F59E0B]" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-text-secondary ml-1">{stars}.0 — {label}</span>
    </div>
  );
}

export default function HeroSection({
  name,
  slug,
  logo,
  heroImage,
  rating,
  reviewCount,
  description,
  city,
  state,
  website,
  orderCapacity,
}: HeroSectionProps) {
  const stateFormatted = formatState(state);

  // 徽章
  const badges: { label: string; color: string }[] = [];
  if (rating >= 75) badges.push({ label: "Verified 3PL", color: "bg-green-100 text-green-800" });
  if (orderCapacity >= 50000) badges.push({ label: "Enterprise 3PL", color: "bg-blue-100 text-blue-800" });
  else if (orderCapacity >= 10000) badges.push({ label: "Midmarket 3PL", color: "bg-blue-100 text-blue-800" });
  else badges.push({ label: "Growing 3PL", color: "bg-blue-100 text-blue-800" });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* 左侧文字区 (占3/5) */}
      <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
        {/* Logo + 名称 */}
        <div className="flex items-center gap-4">
          {logo ? (
            <img
              src={logo}
              alt={name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-contain bg-[#F5F5F7]"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#86868B] font-bold text-2xl md:text-3xl select-none">
              {name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text">{name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-text-secondary">
                {city ? `${city}, ${stateFormatted}` : stateFormatted}
              </span>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 评分 */}
        <div className="flex items-center gap-3 flex-wrap">
          <StarRating rating={rating} />
          <span className="text-sm text-text-secondary">
            ({reviewCount > 0 ? `${reviewCount} review${reviewCount > 1 ? "s" : ""}` : "No reviews yet"})
          </span>
        </div>

        {/* 徽章 */}
        <div className="flex flex-wrap items-center gap-2">
          <img src="/flowrid-verified.png" alt="Flowrid Verified" className="w-[52px] h-[52px] shrink-0" />
          {badges.map((b) => (
            <span key={b.label} className={`px-3 py-1 rounded-full text-xs font-medium ${b.color}`}>
              {b.label}
            </span>
          ))}
        </div>

        {/* 描述 */}
        <p className="text-text-secondary leading-relaxed max-w-2xl text-sm md:text-base">
          {description || `${name} is a ${stateFormatted}-based fulfillment provider offering comprehensive warehousing and logistics services for e-commerce brands.`}
        </p>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={`/rfq?pl=${slug}`}
            className="inline-flex w-full md:w-auto items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl font-semibold text-sm md:text-base hover:bg-primary-dark transition-colors"
          >
            Get Matched With {name}
          </a>
        </div>
      </div>

      {/* 右侧仓库/品牌大图 (占2/5) */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="rounded-2xl aspect-[4/3] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm">
          {heroImage ? (
            <img
              src={heroImage}
              alt={`${name} warehouse facility`}
              className="w-full h-full object-cover"
            />
          ) : logo ? (
            <img
              src={logo}
              alt={name}
              className="max-w-[70%] max-h-[70%] object-contain opacity-80"
            />
          ) : (
            <div className="text-center text-primary/30">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm mt-3 font-medium">{name}</p>
              <p className="text-xs mt-1">{city ? `${city}, ${stateFormatted}` : stateFormatted}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
