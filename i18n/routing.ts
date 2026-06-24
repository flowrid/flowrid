import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "es", "de", "fr", "ja"],
  defaultLocale: "en",
  localePrefix: "never",
});
