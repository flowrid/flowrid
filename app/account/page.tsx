import Link from "next/link";
import { getBrandAccountItems } from "@/lib/account-menu";
import { getTranslations } from "next-intl/server";

const accentClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-background text-text-secondary",
} as const;

export default async function AccountPage() {
  const t = await getTranslations();

  // Let the parent layout render the translated heading
  // Individual menu items already use translated text from getBrandAccountItems(t)

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
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accentClasses[item.accent]}`}>
              <span className="text-sm font-bold">{item.label.charAt(0)}</span>
            </div>
            <h2 className="text-lg font-semibold text-text mb-2">{item.label}</h2>
            <p className="text-sm text-text-secondary">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-card border border-border rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text mb-1">{t("account.signOut")}</h2>
          <p className="text-sm text-text-secondary">{t("account.signOutDesc")}</p>
        </div>
        <a
          href="/api/auth/signout"
          className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-text-secondary hover:border-danger/30 hover:text-danger transition-colors"
        >
          {t("account.signOut")}
        </a>
      </div>
    </>
  );
}
