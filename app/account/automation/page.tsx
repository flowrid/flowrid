"use client";

import BrandOperationPage from "@/components/BrandOperationPage";
import { useTranslations } from "next-intl";

export default function AccountAutomationPage() {
  const t = useTranslations();

  return (
    <BrandOperationPage
      ns="account.automation"
      eyebrow={t("account.growth")}
      title={t("account.automation.title")}
      description={t("account.automation.desc")}
      metrics={[
        { label: t("account.automation.activeRules"), value: "0" },
        { label: t("account.automation.draftRules"), value: "0" },
        { label: t("account.automation.triggers"), value: "Brand-safe" },
        { label: t("account.automation.dataStatus"), value: "Not connected", tone: "warning" },
      ]}
      actions={[
        { label: t("account.automation.connectData"), href: "/account/integrations", primary: true },
        { label: t("account.automation.viewAudit"), href: "/account/audit" },
      ]}
      emptyTitle={t("account.automation.empty")}
      emptyDescription={t("account.automation.emptyDesc")}
      sections={[
        {
          title: "Brand-safe triggers",
          description: "Automations should react to brand data events, not warehouse worker tasks.",
          items: [
            t("account.automation.triggersList.orderCreated"),
            t("account.automation.triggersList.lowStock"),
            t("account.automation.triggersList.shipmentDelivered"),
            t("account.automation.triggersList.rfqChanged"),
          ],
        },
        {
          title: "Suggested actions",
          description: "Keep actions focused on visibility and decision support.",
          items: [
            t("account.automation.actionsList.sendNotification"),
            t("account.automation.actionsList.createReminder"),
            t("account.automation.actionsList.flagReview"),
          ],
        },
        {
          title: "Excluded controls",
          description: "Warehouse task automation remains in the operator SaaS system.",
          items: [
            t("account.automation.excludedList.noPickTask"),
            t("account.automation.excludedList.noDockScheduling"),
            t("account.automation.excludedList.noPickerAssignments"),
          ],
        },
      ]}
    />
  );
}
