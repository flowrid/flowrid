import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Join Flowrid",
  description: "Create your Flowrid account.",
};

export default async function JoinPage() {
  const t = await getTranslations();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl mx-auto text-center">
        <a href="/">
          <img src="/flowrid-logo.png" alt="Flowrid" className="h-8 mx-auto mb-8" />
        </a>
        <h1 className="text-2xl font-bold text-text mb-2">{t('auth.joinTitle')}</h1>
        <p className="text-text-secondary mb-8">
          {t('auth.joinDesc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {/* Brand Card */}
          <Link
            href="/join/brand"
            className="group block bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">{t('auth.imBrand')}</h2>
            <p className="text-sm text-text-secondary mb-4">
              {t('auth.brandDesc')}
            </p>
            <span className="text-primary font-medium text-sm group-hover:underline">
              {t('auth.find3PL')}
            </span>
          </Link>

          {/* 3PL Card */}
          <Link
            href="/join/3pl"
            className="group block bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">{t('auth.im3PL')}</h2>
            <p className="text-sm text-text-secondary mb-4">
              {t('auth.threePLDesc')}
            </p>
            <span className="text-primary font-medium text-sm group-hover:underline">
              {t('auth.becomePartner')}
            </span>
          </Link>
        </div>

        <p className="mt-8 text-sm text-text-secondary">
          {t('auth.alreadyHave')}{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t('auth.logIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
