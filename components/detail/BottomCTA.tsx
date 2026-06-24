import { getTranslations } from "next-intl/server";

interface BottomCTAProps {
  slug: string;
}

export default async function BottomCTA({ slug }: BottomCTAProps) {
  const t = await getTranslations();

  return (
    <section className="-mx-4 md:-mx-0">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-16 md:px-12 md:py-20 text-center"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        }}
      >
        {/* 装饰图案 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-32 opacity-10"
          style={{
            background:
              "linear-gradient(to top, rgba(237,109,0,0.3), transparent)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t("detail.bottomCTAHeading")}
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-8 max-w-lg mx-auto">
            {t("detail.bottomCTADesc")}
          </p>
          <a
            href={`/rfq?pl=${slug}`}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            {t("detail.bottomCTABtn")}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
