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
        { label: t("account.audit.status"), value: "Ready", tone: "success" },
      ]}
      actions={[
        { label: t("account.audit.manageIntegrations"), href: "/account/integrations", primary: true },
        { label: t("account.audit.accountSettings"), href: "/account/settings" },
      ]}
      emptyTitle="No brand audit events yet"
      emptyDescription="Brand account audit events will appear here as integrations, RFQs, saved providers, and settings change."
      sections={[
        {
          title: "Tracked changes",
          description: "The audit log should explain brand account activity in plain language.",
          items: [
            t("account.audit.trackedChanges.integrationConnected"),
            t("account.audit.trackedChanges.rfqSubmitted"),
            t("account.audit.trackedChanges.providerSaved"),
            t("account.audit.trackedChanges.settingsUpdated"),
          ],
        },
        {
          title: "Operational confidence",
          description: "Audit history helps teams understand what changed and when.",
          items: [
            t("account.audit.operational.changeTimeline"),
            t("account.audit.operational.userAttribution"),
            t("account.audit.operational.syncActivity"),
          ],
        },
        {
          title: "Scope boundary",
          description: "This view does not expose internal warehouse staff or operator task logs.",
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
