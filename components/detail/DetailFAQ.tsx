import FAQ from "@/components/FAQ";
import { generateFAQItems } from "@/lib/detail-content";
import type { ThreePL } from "@/types/3pl";

interface DetailFAQProps {
  threePL: ThreePL;
}

export default function DetailFAQ({ threePL }: DetailFAQProps) {
  const items = generateFAQItems(threePL);
  return (
    <section id="faq">
      <FAQ items={items} />
    </section>
  );
}
