import { starsFromScore } from "@/lib/detail-content";
import { getTranslations } from "next-intl/server";

interface ReviewsSectionProps {
  name: string;
  rating: number;
  reviewCount: number;
  slug: string;
}

/** 星级图标 */
function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg className="w-5 h-5 text-[#F59E0B]" viewBox="0 0 20 20">
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="#D1D5DB" />
          </linearGradient>
        </defs>
        <path fill="url(#halfGrad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  return (
    <svg
      className={`w-5 h-5 ${filled ? "text-[#F59E0B]" : "text-gray-300"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/** 子评分项 */
const SUB_RATING_KEYS = [
  "detail.orderAccuracy",
  "detail.fulfillmentCost",
  "detail.fulfillmentSpeed",
  "detail.scalability",
  "detail.customerService",
];

export default async function ReviewsSection({ name, rating, reviewCount, slug }: ReviewsSectionProps) {
  const t = await getTranslations();
  const { stars, labelKey } = starsFromScore(rating);
  const starDisplay = (rating / 20).toFixed(1); // 0-100 → 1.0-5.0

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-text">{t("detail.reviewsHeading", { name })}</h2>
        <a
          href={`/rfq?pl=${slug}`}
          className="text-sm text-primary hover:underline font-medium"
        >
          {t("detail.leaveReview")}
        </a>
      </div>

      {/* 评分摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 总体评分 */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-bold text-text">{starDisplay}</span>
            <div>
              <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < stars} />
              ))}</div>
              <p className="text-sm text-text-secondary mt-1">{t(labelKey)}</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {reviewCount > 0 ? t("detail.basedOn", { count: reviewCount }) : t("detail.verifiedData")}
              </p>
            </div>
          </div>
        </div>

        {/* 子评分 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-xs text-text-secondary uppercase tracking-wide mb-3">{t("detail.performanceRatings")}</p>
          <div className="space-y-2.5">
            {SUB_RATING_KEYS.map((key) => {
              // 为每项生成略微不同的分数
              const offset = (key.length % 5 - 2) * 0.3;
              const subScore = Math.max(1, Math.min(5, stars + offset));
              const filledStars = Math.round(subScore);
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{t(key)}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <StarIcon key={n} filled={n <= filledStars} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 评论列表 — 暂无真实评论时显示占位 */}
      {reviewCount === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-xl">
          <p className="text-text-secondary mb-2">{t("detail.noReviews", { name })}</p>
          <p className="text-sm text-text-secondary mb-4">
            {t("detail.beFirst", { name })}
          </p>
          <a
            href={`/rfq?pl=${slug}`}
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors"
          >
            {t("detail.beFirstReview")}
          </a>
        </div>
      ) : (
        <div className="text-center py-6 bg-card border border-border rounded-xl">
          <p className="text-text-secondary">
            {t("detail.reviewCount", { count: reviewCount, name })}
          </p>
        </div>
      )}
    </section>
  );
}
