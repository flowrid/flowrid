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
                <NavUser />
                <LanguageSwitcher />
              </div>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-card mt-16">
            <div className="max-w-[1460px] mx-auto px-4 py-8 text-sm text-text-secondary">
              <div className="flex flex-wrap gap-6 justify-between">
                <div>
                  <img src="/images/flowrid-logo-footer.png?v=2" alt="Flowrid" className="h-6 w-auto mb-[30px]" />
                  <p>{t("footer.tagline")}</p>
                </div>
                <div className="flex gap-6">
                  <a href="/privacy-policy" className="hover:text-text transition-colors">
                    {t("footer.privacyPolicy")}
                  </a>
                  <a href="/terms-of-service" className="hover:text-text transition-colors">
                    {t("footer.termsOfService")}
                  </a>
                </div>
              </div>
              <p className="mt-4 text-xs">
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
