"use client";

import ShippingContent from "@/components/saas/ShippingContent";
import ToolRecommendationBar from "@/components/tools/ToolRecommendationBar";

export default function SaasShippingPage() {
  return (
    <>
      <ShippingContent />
      <div className="p-6 md:p-8 max-w-[1280px]">
        <ToolRecommendationBar
          title="Optimizing your shipping operations?"
          description="Compare carrier rates, automate label printing, and integrate with 200+ ecommerce platforms."
          tools={[
            { label: "Shipping Tools", href: "/tools/shipping-rates", description: "Compare Shippo, Easyship, Freightos & more" },
            { label: "Rate Calculator", href: "/tools/shipping-calculator", description: "Compare USPS/UPS/FedEx rates" },
            { label: "Integrations", href: "/saas/integrations", description: "Connect your shipping platforms" },
          ]}
        />
      </div>
    </>
  );
}
