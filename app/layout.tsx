import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { websiteSchema, organizationSchema } from "@/lib/jsonld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Flowrid — Find the Best 3PL for Your E-commerce Brand",
    template: "%s | Flowrid",
  },
  description:
    "Compare top third-party logistics (3PL) providers in the US. Search by state, category, and platform. AI-powered matching for Shopify, TikTok, and Amazon sellers.",
  keywords: ["3PL", "fulfillment", "logistics", "warehouse", "ecommerce", "Shopify", "TikTok", "Amazon", "RFQ", "warehouse comparison"],
  other: {
    "google-site-verification": "zS1-Muod3xXvewJwS1MW2s9HEAvT5PWDVXTtSHFBgZ8",
  },
  openGraph: {
    title: "Flowrid — Find the Best 3PL for Your E-commerce Brand",
    description: "Compare top third-party logistics (3PL) providers in the US.",
    url: "https://www.flowrid.com",
    siteName: "Flowrid",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
          <nav className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
            <a
              href="/"
              className="text-lg font-bold text-primary tracking-tight"
            >
              Flowrid
            </a>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <a href="/3pl" className="hover:text-text transition-colors">
                Directory
              </a>
              <a href="/compare" className="hover:text-text transition-colors">
                Compare
              </a>
              <a
                href="/rfq"
                className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Get Quote
              </a>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-card mt-16">
          <div className="max-w-[1200px] mx-auto px-4 py-8 text-sm text-text-secondary">
            <div className="flex flex-wrap gap-6 justify-between">
              <div>
                <p className="font-semibold text-text mb-1">Flowrid</p>
                <p>Find & compare the best 3PL providers for your brand.</p>
              </div>
              <div className="flex gap-6">
                <a href="/3pl" className="hover:text-text transition-colors">
                  Directory
                </a>
                <a href="/compare" className="hover:text-text transition-colors">
                  Compare
                </a>
                <a href="/rfq" className="hover:text-text transition-colors">
                  Get Quote
                </a>
              </div>
            </div>
            <p className="mt-4 text-xs">
              &copy; {new Date().getFullYear()} Flowrid. All rights reserved.
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
