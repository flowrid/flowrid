import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // 直接从 cookie 读取，requestLocale 在没有 middleware 时可能不生效
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  const requested = cookieLocale ?? (await requestLocale);
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  console.log(`[i18n] cookie=${cookieLocale} requestLocale=${await requestLocale} → resolved=${locale}`);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
