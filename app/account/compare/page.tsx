"use client";

import BrandOperationPage from "@/components/BrandOperationPage";
import { useTranslations } from "next-intl";

export default function AccountComparePage() {
  const t = useTranslations();

  return (
    <BrandOperationPage
      ns="account.compare"
      eyebrow={t("account.compare.eyebrow")}
      title={t("account.compare.title")}
      description={t("account.compare.description")}
      metrics={[
        { label: t("account.compare.selectedProviders"), value: "0" },
        { label: t("account.compare.openRFQs"), value: "0", tone: "warning" },
        { label: t("account.compare.saved3PLs"), value: "0" },
        { label: t("account.compare.decisionStatus"), value: t("account.compare.notStarted") },
      ]}
      actions={[
        { label: t("account.compare.browseDirectory"), href: "/3pl", primary: true },
        { label: t("account.compare.reviewSaved"), href: "/account/saved" },
      ]}
      emptyTitle={t("account.compare.emptyTitle")}
      emptyDescription={t("account.compare.emptyDescription")}
      sections={[
        {
          title: t("account.compare.decisionSignals"),
          description: t("account.compare.decisionSignalsDesc"),
          items: [t("account.compare.categoryFit"), t("account.compare.platformSupport"), t("account.compare.regionalCoverage")],
        },
        {
          title: t("account.compare.nextBestAction"),
          description: t("account.compare.nextBestActionDesc"),
          items: [t("account.compare.saveCandidates"), t("account.compare.compareServiceFit"), t("account.compare.submitRFQ")],
        },
        {
          title: t("account.compare.brandSafeScope"),
          description: t("account.compare.brandSafeScopeDesc"),
          items: [t("account.compare.noSaaSApi"), t("account.compare.noWarehouseMutation"), t("account.compare.noPublicReexport")],
        },
      ]}
    />
  );
}
