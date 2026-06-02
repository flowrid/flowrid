import BrandOperationPage from "@/components/BrandOperationPage";

export default function AccountAuditPage() {
  return (
    <BrandOperationPage
      eyebrow="Growth"
      title="Audit Log"
      description="Review brand account changes such as integrations, RFQs, saved providers, and future synced data events."
      metrics={[
        { label: "Recent events", value: "0" },
        { label: "Integration changes", value: "0" },
        { label: "RFQ updates", value: "0" },
        { label: "Status", value: "Ready", tone: "success" },
      ]}
      actions={[
        { label: "Manage integrations", href: "/account/integrations", primary: true },
        { label: "Account settings", href: "/account/settings" },
      ]}
      emptyTitle="No brand audit events yet"
      emptyDescription="Brand account audit events will appear here as integrations, RFQs, saved providers, and settings change."
      sections={[
        {
          title: "Tracked changes",
          description: "The audit log should explain brand account activity in plain language.",
          items: ["Integration connected", "RFQ submitted", "Provider saved", "Settings updated"],
        },
        {
          title: "Operational confidence",
          description: "Audit history helps teams understand what changed and when.",
          items: ["Change timeline", "User attribution", "Sync activity"],
        },
        {
          title: "Scope boundary",
          description: "This view does not expose internal warehouse staff or operator task logs.",
          items: ["No picker IDs", "No warehouse-only entities", "No SaaS operator audit API"],
        },
      ]}
    />
  );
}
