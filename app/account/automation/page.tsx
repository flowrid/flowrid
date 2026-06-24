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
        { label: t("account.automation.dataStatus"), value: t("account.automation.notConnected"), tone: "warning" },
      ]}
      actions={[
        { label: t("account.automation.connectData"), href: "/account/integrations", primary: true },
        { label: t("account.automation.viewAudit"), href: "/account/audit" },
      ]}
      emptyTitle={t("account.automation.empty")}
      emptyDescription={t("account.automation.emptyDesc")}
      sections={[
        {
          title: t("account.automation.sections.brandSafeTriggers"),
          description: t("account.automation.sections.brandSafeTriggersDesc"),
          items: [
            t("account.automation.triggersList.orderCreated"),
            t("account.automation.triggersList.lowStock"),
            t("account.automation.triggersList.shipmentDelivered"),
            t("account.automation.triggersList.rfqChanged"),
          ],
        },
        {
          title: t("account.automation.sections.suggestedActions"),
          description: t("account.automation.sections.suggestedActionsDesc"),
          items: [
            t("account.automation.actionsList.sendNotification"),
            t("account.automation.actionsList.createReminder"),
            t("account.automation.actionsList.flagReview"),
          ],
        },
        {
          title: t("account.automation.sections.excludedControls"),
          description: t("account.automation.sections.excludedControlsDesc"),
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
