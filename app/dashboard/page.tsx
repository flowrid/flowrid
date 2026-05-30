import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-[1460px] mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Welcome to Flowrid</h1>
          <p className="text-text-secondary">
            We connect you with the right 3PL from 2,800+ vetted partners.
          </p>
        </div>

        {/* Main CTA */}
        <Link
          href="/3pl"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 mb-12"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find Your 3PL Match
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "3PL Providers", value: "2,818" },
            { label: "States Covered", value: "33" },
            { label: "Platforms", value: "12+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Getting Started */}
        <div className="bg-card border border-border rounded-2xl p-6 text-left">
          <h2 className="text-lg font-semibold text-text mb-4">How it works</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: "Search by state, category, or platform", desc: "Browse 2,800+ 3PLs filtered to your exact needs." },
              { step: 2, title: "Compare pricing, speed, and integrations", desc: "Check the box on any card to compare providers side by side." },
              { step: 3, title: "Submit an RFQ to get matched", desc: "Tell us your requirements and receive proposals from the best-fit 3PLs." },
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

        {/* Footer actions */}
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <a href="/rfq" className="text-primary hover:underline">Submit an RFQ</a>
          <span className="text-border">|</span>
          <a href="/compare" className="text-primary hover:underline">View Compare List</a>
          <span className="text-border">|</span>
          <a href="/api/auth/signout" className="text-text-secondary hover:text-danger transition-colors">Sign out</a>
        </div>
      </div>
    </div>
  );
}
