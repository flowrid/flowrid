import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CATEGORIES } from "@/lib/tools-data";
import CategoryPlaceholder from "@/components/tools/CategoryPlaceholder";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("tools.categories.compliance"),
    description: t("tools.categories.complianceDesc"),
  };
}

export default async function Page() {
  const t = await getTranslations();
  const cat = CATEGORIES.find((c) => c.slug === "compliance-documents")!;
  return (
    <CategoryPlaceholder
      icon={cat.icon}
      color={cat.color}
      title={t(cat.titleKey)}
      description={t(cat.descriptionKey)}
      question={t(cat.questionKey)}
    />
  );
}
