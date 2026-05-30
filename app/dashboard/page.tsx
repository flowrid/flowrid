import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-[1460px] mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header with user greeting */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-1">Welcome to Flowrid</h1>
            <p className="text-text-secondary">Find and compare the best 3PL partners for your business.</p>
          </div>
          <a
            href="/api/auth/signout"
            className="text-sm text-text-secondary hover:text-danger transition-colors px-4 py-2 border border-border rounded-lg hover:border-danger/30"
          >
            Sign out
          </a>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/3pl"
            className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">Find a 3PL</h2>
            <p className="text-sm text-text-secondary mb-4">Search and compare 2,800+ verified 3PL providers across 33 states.</p>
            <span className="text-primary font-medium text-sm group-hover:underline">Browse directory &rarr;</span>
          </Link>

          <Link
            href="/rfq"
            className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">Submit an RFQ</h2>
            <p className="text-sm text-text-secondary mb-4">Get matched with 2-5 vetted 3PLs based on your specific product, volume, and budget.</p>
            <span className="text-primary font-medium text-sm group-hover:underline">Get matched &rarr;</span>
          </Link>

          <Link
            href="/compare"
            className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">Compare 3PLs</h2>
            <p className="text-sm text-text-secondary mb-4">Side-by-side comparison of pricing, speed, integrations, and ratings.</p>
            <span className="text-primary font-medium text-sm group-hover:underline">Start comparing &rarr;</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "3PL Providers", value: "2,818" },
            { label: "States Covered", value: "33" },
            { label: "Platforms", value: "12+" },
            { label: "Categories", value: "25+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity / Getting Started */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Getting Started</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: "Browse the 3PL Directory", desc: "Search by state, category, or platform to find providers that match your needs." },
              { step: 2, title: "Compare Shortlisted 3PLs", desc: "Add providers to your comparison list and evaluate them side by side." },
              { step: 3, title: "Submit an RFQ", desc: "Tell us about your requirements and we will match you with the best-fit 3PLs." },
              { step: 4, title: "Get Matched & Start Fulfilling", desc: "Review proposals, negotiate terms, and launch your fulfillment operations." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{item.step}</span>
                </div>
                <div>
                  <p className="font-medium text-text text-sm">{item.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
