import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("account");

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="text-sm font-medium text-[#86868B] hover:text-[#1D1D1F]">
        &larr; {t("backToOrders")}
      </Link>
      <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ed6d00]">{t("orderDetail")}</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("orderId", { id })}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#86868B]">
          {t("orderDetailDesc")}
        </p>
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[#F5F5F7] p-6">
          <p className="font-semibold text-[#1D1D1F]">{t("noOrderDetail")}</p>
          <p className="mt-2 text-sm text-[#86868B]">{t("noOrderDetailDesc")}</p>
          <Link href="/account/integrations" className="mt-4 inline-flex rounded-full bg-[#ed6d00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#FF8A1F]">
            {t("connectStore")}
          </Link>
        </div>
      </section>
    </div>
  );
}
