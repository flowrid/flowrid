import Link from "next/link";
import { getBrandAccountItems } from "@/lib/account-menu";
import { getTranslations } from "next-intl/server";

export default async function AccountPage() {
  const t = await getTranslations();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">{t("account.brandAccount")}</h1>
        <p className="text-text-secondary">
          {t("account.desc")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {getBrandAccountItems(t).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-text mb-2">{item.label}</h2>
            <p className="text-sm text-text-secondary">{item.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
