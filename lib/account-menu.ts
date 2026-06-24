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

type TranslationFn = (key: string, vars?: Record<string, string | number>) => string;

export function getBrandAccountMenuGroups(
  t: TranslationFn
): BrandAccountMenuGroup[] {
  return [
    {
      label: t("account.workspace"),
      items: [
        {
          label: t("account.overview"),
          description: t("account.menuItems.overview"),
          href: "/account",
          icon: "/icons/dashboard.png",
          accent: "primary",
        },
      ],
    },
    {
      label: t("account.operations"),
      items: [
        {
          label: t("account.orders"),
          description: t("account.menuItems.orders"),
          href: "/account/orders",
          icon: "/icons/orders.png",
          accent: "primary",
        },
        {
          label: t("account.products"),
          description: t("account.menuItems.products"),
          href: "/account/products",
          icon: "/icons/products.png",
          accent: "neutral",
        },
        {
          label: t("account.inventory"),
          description: t("account.menuItems.inventory"),
          href: "/account/inventory",
          icon: "/icons/inventory.png",
          accent: "success",
        },
        {
          label: t("account.inbound"),
          description: t("account.menuItems.inbound"),
          href: "/account/receiving",
          icon: "/icons/receiving.png",
          accent: "warning",
        },
        {
          label: t("account.returnsLabel"),
          description: t("account.menuItems.returns"),
          href: "/account/returns",
          icon: "/icons/returns.png",
          accent: "warning",
        },
        {
          label: t("account.shippingLabel"),
          description: t("account.menuItems.shipping"),
          href: "/account/shipping",
          icon: "/icons/shipping.png",
          accent: "primary",
        },
      ],
    },
    {
      label: t("account.insights"),
      items: [
        {
          label: t("account.analyticsLabel"),
          description: t("account.menuItems.analytics"),
          href: "/account/analytics",
          icon: "/icons/analytics.png",
          accent: "primary",
        },
        {
          label: t("account.reportsLabel"),
          description: t("account.menuItems.reports"),
          href: "/account/reports",
          icon: "/icons/reports.png",
          accent: "neutral",
        },
        {
          label: t("account.billingLabel"),
          description: t("account.menuItems.billing"),
          href: "/account/billing",
          icon: "/icons/billing.png",
          accent: "success",
        },
      ],
    },
    {
      label: t("account.growth"),
      items: [
        {
          label: t("account.integrationsLabel"),
          description: t("account.menuItems.integrations"),
          href: "/account/integrations",
          icon: "/icons/store-integrations.png",
          accent: "success",
        },
        {
          label: t("account.automationLabel"),
          description: t("account.menuItems.automations"),
          href: "/account/automation",
          icon: "/icons/automation.png",
          accent: "warning",
        },
        {
          label: t("account.auditLabel"),
          description: t("account.menuItems.auditLog"),
          href: "/account/audit",
          icon: "/icons/audit.png",
          accent: "neutral",
        },
      ],
    },
    {
      label: t("account.admin"),
      items: [
        {
          label: t("account.compareProvidersLabel"),
          description: t("account.menuItems.compareProviders"),
          href: "/account/compare",
          icon: "/icons/compare-providers.png",
          accent: "warning",
        },
        {
          label: t("account.rfqs.title"),
          description: t("account.menuItems.myRFQs"),
          href: "/account/rfqs",
          icon: "/icons/my-rfqs.png",
          accent: "primary",
        },
        {
          label: t("account.saved.title"),
          description: t("account.menuItems.saved3PL"),
          href: "/account/saved",
          icon: "/icons/saved-3pl.png",
          accent: "neutral",
        },
        {
          label: t("account.settings.title"),
          description: t("account.menuItems.settings"),
          href: "/account/settings",
          icon: "/icons/settings.png",
          accent: "neutral",
        },
      ],
    },
  ];
}

export function getBrandAccountItems(t: TranslationFn): BrandAccountItem[] {
  return getBrandAccountMenuGroups(t).flatMap((group) => group.items);
}

// Keep static fallback for non-React contexts
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
        icon: "/icons/products.png",
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
        icon: "/icons/returns.png",
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
        icon: "/icons/reports.png",
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
        icon: "/icons/store-integrations.png",
        accent: "success",
      },
      {
        label: "Automations",
        description: "Configure brand-side order, inventory, and notification rules.",
        href: "/account/automation",
        icon: "/icons/automation.png",
        accent: "warning",
      },
      {
        label: "Audit Log",
        description: "Review account, order, inventory, and integration changes.",
        href: "/account/audit",
        icon: "/icons/audit.png",
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
        icon: "/icons/compare-providers.png",
        accent: "warning",
      },
      {
        label: "My RFQs",
        description: "Track requests for quotation and matched 3PL proposals.",
        href: "/account/rfqs",
        icon: "/icons/my-rfqs.png",
        accent: "primary",
      },
      {
        label: "Saved 3PL",
        description: "Review your shortlisted fulfillment providers.",
        href: "/account/saved",
        icon: "/icons/saved-3pl.png",
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
