"use client";

import BrandOperationPage from "@/components/BrandOperationPage";
import { useTranslations } from "next-intl";

export default function AccountComparePage() {
  const t = useTranslations();

  return (
    <BrandOperationPage
      ns="account.compare"
      eyebrow="Provider decisions"
      title="Compare Providers"
      description="Keep shortlisted 3PL providers in a brand-owned comparison workspace before sending RFQs or syncing operational data."
      metrics={[
        { label: "Selected providers", value: "0" },
        { label: "Open RFQs", value: "0", tone: "warning" },
        { label: "Saved 3PLs", value: "0" },
        { label: "Decision status", value: "Not started" },
      ]}
      actions={[
        { label: "Browse directory", href: "/3pl", primary: true },
        { label: "Review saved 3PL", href: "/account/saved" },
      ]}
      emptyTitle="No providers selected for comparison yet"
      emptyDescription="Use the public 3PL directory to shortlist providers, then return here to compare fit, RFQ readiness, and brand-side decision notes."
      sections={[
        {
          title: "Decision signals",
          description: "Compare providers using the inputs that matter most to ecommerce brands.",
          items: ["Category fit", "Platform support", "Regional coverage"],
        },
        {
          title: "Next best action",
          description: "Build a shortlist before requesting quotes so provider outreach stays focused.",
          items: ["Save candidate 3PLs", "Compare service fit", "Submit RFQ when ready"],
        },
        {
          title: "Brand-safe scope",
          description: "This page stays inside the account workspace and does not reuse warehouse operator workflows.",
          items: ["No SaaS operator API calls", "No warehouse task mutation", "No public compare page re-export"],
        },
      ]}
    />
  );
}
