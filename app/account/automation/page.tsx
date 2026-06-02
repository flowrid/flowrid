import BrandOperationPage from "@/components/BrandOperationPage";

export default function AccountAutomationPage() {
  return (
    <BrandOperationPage
      eyebrow="Growth"
      title="Automations"
      description="Prepare brand-side automation rules for order notifications, low-stock alerts, and RFQ readiness workflows."
      metrics={[
        { label: "Active rules", value: "0" },
        { label: "Draft rules", value: "0" },
        { label: "Triggers", value: "Brand-safe" },
        { label: "Data status", value: "Not connected", tone: "warning" },
      ]}
      actions={[
        { label: "Connect data", href: "/account/integrations", primary: true },
        { label: "View audit log", href: "/account/audit" },
      ]}
      emptyTitle="No brand automations configured"
      emptyDescription="Once your store is connected, create brand-side rules for notifications and decision workflows without touching warehouse execution automations."
      sections={[
        {
          title: "Brand-safe triggers",
          description: "Automations should react to brand data events, not warehouse worker tasks.",
          items: ["Order created", "Low stock", "Shipment delivered", "RFQ status changed"],
        },
        {
          title: "Suggested actions",
          description: "Keep actions focused on visibility and decision support.",
          items: ["Send notification", "Create RFQ reminder", "Flag provider review"],
        },
        {
          title: "Excluded controls",
          description: "Warehouse task automation remains in the operator SaaS system.",
          items: ["No pick task creation", "No dock scheduling", "No picker assignments"],
        },
      ]}
    />
  );
}
