import { createClient } from "@supabase/supabase-js";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const updates = [
  ["Federation Logistics LLC", "https://www.fedlogistics.com"],
  ["Fidelis Logistics", "https://www.fidelislogistics.com"],
  ["Flexhubus", "https://flexhubus.com"],
  ["ShipBob", "https://www.shipbob.com"],
  ["Smart 3PL", "https://www.smart3plwarehouse.com/"],
  ["Proven Prep Center", "https://www.provenprepcenter.com/"],
  ["eWorld Fulfillment", "https://eworldfulfillment.com"],
  ["The Fulfillment House", "https://thefulfillmenthouse.org"],
  ["365 Couriers LLC", "https://go365couriers.net"],
  ["Evri Fulfilment", "https://www.evri.com/fulfilment-faqs"],
];

let ok = 0;
for (const [name, url] of updates) {
  const { error } = await s.from("pl_providers").update({ website: url }).eq("name", name);
  if (!error) { ok++; console.log("OK:", name); }
  else { console.log("ERR:", name, error.message); }
}
console.log("Done:", ok, "/", updates.length);
