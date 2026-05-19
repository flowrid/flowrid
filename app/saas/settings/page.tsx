"use client";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-8">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Warehouse Profile</h2>
          <div className="grid gap-4">
            <Field label="Company Name" value="FlowX Fulfillment" />
            <Field label="Email" value="ops@flowx-fulfillment.com" />
            <Field label="Address" value="1200 Logistics Dr, Dallas, TX 75201" />
            <Field label="Tax ID" value="XX-XXXXXXX" />
          </div>
        </section>

        {/* Integrations */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Integrations</h2>
          <div className="space-y-3">
            {[
              { name: "Shopify", connected: true },
              { name: "Amazon Seller Central", connected: true },
              { name: "ShipStation", connected: false },
              { name: "QuickBooks", connected: false },
              { name: "NetSuite", connected: false },
            ].map((int) => (
              <div key={int.name} className="flex items-center justify-between py-2">
                <span className="text-sm text-[#1D1D1F]">{int.name}</span>
                <button
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    int.connected
                      ? "bg-[#34C759]/10 text-[#34C759]"
                      : "bg-black/5 text-[#86868B] hover:bg-[#0071E3]/10 hover:text-[#0071E3]"
                  }`}
                >
                  {int.connected ? "Connected" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* API Keys */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">API Keys</h2>
          <div className="space-y-3">
            {[
              { name: "Production API Key", prefix: "fl_prod_", lastUsed: "2 hours ago" },
              { name: "Development API Key", prefix: "fl_dev_", lastUsed: "3 days ago" },
            ].map((key) => (
              <div key={key.name} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#1D1D1F]">{key.name}</p>
                  <p className="text-xs text-[#86868B]">{key.prefix}•••••••• • Last used {key.lastUsed}</p>
                </div>
                <button className="text-xs text-[#FF3B30] hover:underline font-medium">Revoke</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-[#1D1D1F]">{value}</p>
    </div>
  );
}
