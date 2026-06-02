import Link from "next/link";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="text-sm font-medium text-[#86868B] hover:text-[#1D1D1F]">
        &larr; Back to Orders
      </Link>
      <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ed6d00]">Order Detail</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight text-[#1D1D1F]">Order {id}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#86868B]">
          This brand-side detail page is ready for connected order data. It intentionally does not call the operator-only SaaS order API.
        </p>
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[#F5F5F7] p-6">
          <p className="font-semibold text-[#1D1D1F]">No synced order detail available yet</p>
          <p className="mt-2 text-sm text-[#86868B]">Connect your store to populate order items, fulfillment status, and shipping context.</p>
          <Link href="/account/integrations" className="mt-4 inline-flex rounded-full bg-[#ed6d00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#FF8A1F]">
            Connect store
          </Link>
        </div>
      </section>
    </div>
  );
}
