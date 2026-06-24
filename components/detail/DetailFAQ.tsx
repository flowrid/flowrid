import FAQ from "@/components/FAQ";
import { generateFAQItems, generateFAQItemsI18n } from "@/lib/detail-content";
import type { ThreePL } from "@/types/3pl";
import { getTranslations } from "next-intl/server";

interface DetailFAQProps {
  threePL: ThreePL;
}

export default async function DetailFAQ({ threePL }: DetailFAQProps) {
  const t = await getTranslations();
  const items = generateFAQItemsI18n(threePL, t as (key: string, values?: Record<string, unknown>) => string);
  return (
    <section id="faq">
      <FAQ items={items} />
    </section>
  );
}
