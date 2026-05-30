export default function Saved3PLsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-text mb-2">Saved 3PLs</h1>
      <p className="text-text-secondary mb-8">Your shortlisted fulfillment providers.</p>
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <svg className="w-12 h-12 mx-auto text-text-secondary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-text-secondary mb-2">No saved 3PLs yet</p>
        <p className="text-sm text-text-secondary mb-6">Browse the directory and save providers to compare later.</p>
        <a href="/3pl" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
          Browse 3PL Directory
        </a>
      </div>
    </>
  );
}
