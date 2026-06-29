import InventoryContent from "@/components/saas/InventoryContent";
import ToolRecommendationBar from "@/components/tools/ToolRecommendationBar";

export default function BrandInventoryPage() {
  return (
    <>
      <InventoryContent />
      <ToolRecommendationBar
        title="Managing inventory across channels?"
        description="Prevent overselling and stockouts with real-time inventory sync tools."
        tools={[
          { label: "Inventory Tools", href: "/tools/inventory-warehouse", description: "Compare Cin7, ShipHero, Extensiv & more" },
          { label: "Automation Tools", href: "/tools/automation-integration", description: "Connect your inventory stack" },
        ]}
      />
    </>
  );
}
