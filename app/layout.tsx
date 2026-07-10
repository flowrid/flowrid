import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { websiteSchema, organizationSchema } from "@/lib/jsonld";
import NavUser from "@/components/auth/NavUser";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: {
      default: t("home.heroTitle") + " — " + t("home.heroHighlight"),
      template: `%s | Flowrid`,
    },
    description: t("home.heroDesc"),
    keywords: ["3PL", "fulfillment", "logistics", "warehouse", "ecommerce", "Shopify", "TikTok", "Amazon", "RFQ", "warehouse comparison"],
    other: {
      "google-site-verification": "zS1-Muod3xXvewJwS1MW2s9HEAvT5PWDVXTtSHFBgZ8",
    },
    openGraph: {
      title: "Flowrid — " + t("home.heroHighlight"),
      description: t("home.heroDesc"),
      url: "https://www.flowrid.com",
      siteName: "Flowrid",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteSchema()),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema()),
            }}
          />
          <header className="border-b border-border bg-card">
            <nav className="max-w-[1460px] mx-auto px-4 h-20 flex items-center justify-between">
              <a href="/">
                <img src="/flowrid-logo.png" alt="Flowrid" className="h-8 w-auto" />
              </a>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <a href="/3pl" className="hover:text-text transition-colors">
                  {t("nav.3plDirectory")}
                </a>
                <a href="/tools" className="hover:text-text transition-colors">
                  {t("nav.tools")}
                </a>
                <a href="/rfq" className="hover:text-text transition-colors">
                  {t("nav.rfq")}
                </a>
                <NavUser />
                <LanguageSwitcher />
              </div>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-card mt-16">
            <div className="max-w-[1460px] mx-auto px-4 py-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Brand */}
                <div>
                  <img src="/images/flowrid-logo-footer.png?v=2" alt="Flowrid" className="h-6 w-auto mb-3" />
                  <p className="text-sm text-text-secondary leading-relaxed">{t("footer.tagline")}</p>
                </div>
                {/* Product links */}
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">{t("footer.productLinks")}</p>
                  <div className="flex flex-col gap-2">
                    <a href="/3pl" className="text-sm text-text-secondary hover:text-text transition-colors">{t("nav.3plDirectory")}</a>
                    <a href="/tools" className="text-sm text-text-secondary hover:text-text transition-colors">{t("nav.tools")}</a>
                    <a href="/rfq" className="text-sm text-text-secondary hover:text-text transition-colors">{t("nav.rfq")}</a>
                    <a href="/compare" className="text-sm text-text-secondary hover:text-text transition-colors">{t("footer.compare")}</a>
                  </div>
                </div>
                {/* Company links */}
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">{t("footer.companyLinks")}</p>
                  <div className="flex flex-col gap-2">
                    <a href="/privacy-policy" className="text-sm text-text-secondary hover:text-text transition-colors">{t("footer.privacyPolicy")}</a>
                    <a href="/terms-of-service" className="text-sm text-text-secondary hover:text-text transition-colors">{t("footer.termsOfService")}</a>
                  </div>
                </div>
              </div>
              <p className="mt-8 pt-6 border-t border-border text-xs text-text-secondary/60">
                {t("footer.copyright", { year: new Date().getFullYear() })}
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
