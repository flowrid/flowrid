import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const t = await getTranslations();
  return (
    <>
      <h1 className="text-2xl font-bold text-text mb-2">{t("saasContent.profile.title")}</h1>
      <p className="text-text-secondary mb-8">{t("saasContent.profile.subtitle")}</p>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <p className="text-text-secondary text-sm">{t("saasContent.profile.comingSoon")}</p>
      </div>
    </>
  );
}
