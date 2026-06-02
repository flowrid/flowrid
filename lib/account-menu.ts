export type BrandAccountItem = {
  label: string;
  description: string;
  href: string;
  icon: string;
  accent: "primary" | "success" | "warning" | "neutral";
};

export type BrandAccountMenuGroup = {
  label: string;
  items: BrandAccountItem[];
};

export const BRAND_ACCOUNT_MENU_GROUPS: BrandAccountMenuGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Overview",
        description: "Review your brand operations workspace and next actions.",
        href: "/account",
        icon: "/icons/dashboard.png",
        accent: "primary",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Orders",
        description: "Track ecommerce orders and fulfillment status.",
        href: "/account/orders",
        icon: "/icons/orders.png",
        accent: "primary",
      },
      {
        label: "Products",
        description: "Manage SKUs, product attributes, and catalog signals.",
        href: "/account/products",
        icon: "/icons/inventory.png",
        accent: "neutral",
      },
      {
        label: "Inventory",
        description: "Monitor stock levels and inventory health.",
        href: "/account/inventory",
        icon: "/icons/inventory.png",
        accent: "success",
      },
      {
        label: "Inbound",
        description: "Plan inbound shipments and ASN activity.",
        href: "/account/receiving",
        icon: "/icons/receiving.png",
        accent: "warning",
      },
      {
        label: "Returns",
        description: "Manage RMAs and return outcomes.",
        href: "/account/returns",
        icon: "/icons/receiving.png",
        accent: "warning",
      },
      {
        label: "Shipping",
        description: "Compare rates and manage outbound shipping actions.",
        href: "/account/shipping",
        icon: "/icons/shipping.png",
        accent: "primary",
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Analytics",
        description: "Review order, inventory, and warehouse performance trends.",
        href: "/account/analytics",
        icon: "/icons/analytics.png",
        accent: "primary",
      },
      {
        label: "Reports",
        description: "Generate brand-side operational reports.",
        href: "/account/reports",
        icon: "/icons/analytics.png",
        accent: "neutral",
      },
      {
        label: "Billing",
        description: "Review invoices, usage, and fulfillment costs.",
        href: "/account/billing",
        icon: "/icons/billing.png",
        accent: "success",
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        label: "Store Integrations",
        description: "Connect Shopify and ecommerce data sources for better matching.",
        href: "/account/integrations",
        icon: "/icons/settings.png",
        accent: "success",
      },
      {
        label: "Automations",
        description: "Configure brand-side order, inventory, and notification rules.",
        href: "/account/automation",
        icon: "/icons/settings.png",
        accent: "warning",
      },
      {
        label: "Audit Log",
        description: "Review account, order, inventory, and integration changes.",
        href: "/account/audit",
        icon: "/icons/settings.png",
        accent: "neutral",
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        label: "Compare Providers",
        description: "Open the provider comparison workspace.",
        href: "/account/compare",
        icon: "/icons/analytics.png",
        accent: "warning",
      },
      {
        label: "My RFQs",
        description: "Track requests for quotation and matched 3PL proposals.",
        href: "/account/rfqs",
        icon: "/icons/orders.png",
        accent: "primary",
      },
      {
        label: "Saved 3PL",
        description: "Review your shortlisted fulfillment providers.",
        href: "/account/saved",
        icon: "/icons/dashboard.png",
        accent: "neutral",
      },
      {
        label: "Account Settings",
        description: "Manage your profile, email, password, and preferences.",
        href: "/account/settings",
        icon: "/icons/settings.png",
        accent: "neutral",
      },
    ],
  },
];

export const BRAND_ACCOUNT_ITEMS: BrandAccountItem[] = BRAND_ACCOUNT_MENU_GROUPS.flatMap(
  (group) => group.items
);
