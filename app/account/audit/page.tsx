"use client";

import BrandOperationPage from "@/components/BrandOperationPage";
import { useTranslations } from "next-intl";

export default function AccountAuditPage() {
  const t = useTranslations();

  return (
    <BrandOperationPage
      ns="account.audit"
      eyebrow={t("account.growth")}
      title={t("account.audit.title")}
      description={t("account.audit.desc")}
      metrics={[
        { label: t("account.audit.recentEvents"), value: "0" },
        { label: t("account.audit.integrationChanges"), value: "0" },
        { label: t("account.audit.rfqUpdates"), value: "0" },
        { label: t("account.audit.status"), value: t("account.audit.ready"), tone: "success" },
      ]}
      actions={[
        { label: t("account.audit.manageIntegrations"), href: "/account/integrations", primary: true },
        { label: t("account.audit.accountSettings"), href: "/account/settings" },
      ]}
      emptyTitle={t("account.audit.empty")}
      emptyDescription={t("account.audit.emptyDesc")}
      sections={[
        {
          title: t("account.audit.sections.trackedChanges"),
          description: t("account.audit.sections.trackedChangesDesc"),
          items: [
            t("account.audit.trackedChanges.integrationConnected"),
            t("account.audit.trackedChanges.rfqSubmitted"),
            t("account.audit.trackedChanges.providerSaved"),
            t("account.audit.trackedChanges.settingsUpdated"),
          ],
        },
        {
          title: t("account.audit.sections.operationalConfidence"),
          description: t("account.audit.sections.operationalConfidenceDesc"),
          items: [
            t("account.audit.operational.changeTimeline"),
            t("account.audit.operational.userAttribution"),
            t("account.audit.operational.syncActivity"),
          ],
        },
        {
          title: t("account.audit.sections.scopeBoundary"),
          description: t("account.audit.sections.scopeBoundaryDesc"),
          items: [
            t("account.audit.scope.noPickerIds"),
            t("account.audit.scope.noWarehouseOnly"),
            t("account.audit.scope.noSaaSAuditApi"),
          ],
        },
      ]}
    />
  );
}
