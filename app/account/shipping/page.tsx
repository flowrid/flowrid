import ShippingContent from "@/components/saas/ShippingContent";
import ToolRecommendationBar from "@/components/tools/ToolRecommendationBar";

export default function BrandShippingPage() {
  return (
    <>
      <ShippingContent />
      <ToolRecommendationBar
        title="Building your shipping stack?"
        description="Compare carriers, automate labels, and save 20-40% per shipment with the right tools."
        tools={[
          { label: "Shipping Tools", href: "/tools/shipping-rates", description: "Compare Shippo, Easyship, Freightos & more" },
          { label: "Rate Calculator", href: "/tools/shipping-calculator", description: "Compare USPS/UPS/FedEx rates instantly" },
        ]}
      />
    </>
  );
}
