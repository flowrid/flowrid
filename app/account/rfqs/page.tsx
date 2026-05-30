export default function RFQsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-text mb-2">My RFQs</h1>
      <p className="text-text-secondary mb-8">Track your requests for quotation and matched 3PL proposals.</p>
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <svg className="w-12 h-12 mx-auto text-text-secondary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-text-secondary mb-2">No RFQs yet</p>
        <p className="text-sm text-text-secondary mb-6">Submit your first RFQ to get matched with the best 3PLs for your needs.</p>
        <a href="/rfq" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
          Submit an RFQ
        </a>
      </div>
    </>
  );
}
