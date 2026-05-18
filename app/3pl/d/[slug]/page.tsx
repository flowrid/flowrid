import { createServerClient } from "@/lib/supabase";
import ScoreBadge from "@/components/ScoreBadge";
import { StickyCTA } from "@/components/CTAButton";
import FAQ from "@/components/FAQ";
import { localBusinessSchema } from "@/lib/jsonld";
import type { Metadata } from "next";
import type { ThreePL } from "@/types/3pl";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  if (!supabase) return { title: "3PL Details | Flowrid" };

  const { data } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "3PL Not Found | Flowrid" };

  const p = data as ThreePL;
  return {
    title: `${p.name} — ${formatState(p.state)} 3PL Review | Flowrid`,
    description: `${p.name} is a ${p.state} 3PL specializing in ${p.categories?.join(", ")}. ${p.shipping_speed} shipping. Integrates with ${p.platforms?.join(", ")}.`,
  };
}

export default async function ThreePLDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();

  if (!supabase) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Database Not Configured</h1>
      </div>
    );
  }

  const { data } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text">3PL Not Found</h1>
        <p className="mt-2 text-text-secondary">
          <Link href="/3pl" className="text-primary hover:underline">
            Browse all 3PL providers
          </Link>
        </p>
      </div>
    );
  }

  const p = data as ThreePL;
  const score = Math.round((p.rating || 0) * 20);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            localBusinessSchema({
              name: p.name,
              description: p.description || "",
              city: p.city || "",
              state: p.state || "",
              rating: p.rating || 0,
              reviewCount: p.review_count || 0,
              url: `https://www.flowrid.com/3pl/d/${p.slug}`,
            })
          ),
        }}
      />
      {/* Back link */}
      <Link
        href={`/3pl/${p.state}`}
        className="text-sm text-primary hover:underline mb-4 inline-block"
      >
        &larr; Back to {formatState(p.state)} 3PLs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            {p.name}
          </h1>
          <p className="text-text-secondary mt-1">
            {p.city}, {formatState(p.state)}
          </p>
        </div>
        <ScoreBadge score={score} />
      </div>

      {/* Description */}
      <p className="mt-6 text-text-secondary leading-relaxed max-w-3xl">
        {p.description}
      </p>

      {/* Key Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs text-text-secondary uppercase">Shipping Speed</p>
          <p className="text-lg font-bold text-text mt-1">{p.shipping_speed}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs text-text-secondary uppercase">Cost Level</p>
          <p className="text-lg font-bold text-text mt-1">{p.cost_level}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs text-text-secondary uppercase">Rating</p>
          <p className="text-lg font-bold text-text mt-1">{p.rating} / 5.0</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs text-text-secondary uppercase">Capacity</p>
          <p className="text-lg font-bold text-text mt-1">
            {(p.order_capacity || 0).toLocaleString()} orders/mo
          </p>
        </div>
      </div>

      {/* Categories */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-text mb-3">Product Categories</h2>
        <div className="flex flex-wrap gap-2">
          {(p.categories || []).map((c) => (
            <Link
              key={c}
              href={`/3pl/${p.state}/${c}`}
              className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-text hover:bg-gray-200 transition-colors"
            >
              {formatName(c)}
            </Link>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-text mb-3">Platform Integrations</h2>
        <div className="flex flex-wrap gap-2">
          {(p.platforms || []).map((plat) => (
            <Link
              key={plat}
              href={`/3pl/${p.state}/${plat}`}
              className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-text hover:bg-gray-200 transition-colors"
            >
              {plat}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-8 p-6 bg-card border border-border rounded-xl text-center">
        <h2 className="text-xl font-bold text-text">
          Ready to work with {p.name}?
        </h2>
        <p className="mt-2 text-text-secondary">
          Get a personalized quote for your fulfillment needs.
        </p>
        <a
          href={`/rfq?pl=${p.slug}`}
          className="inline-block mt-4 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          Get Quote
        </a>
      </div>

      {/* FAQ */}
      <FAQ
        items={[
          `What types of products does ${p.name} handle?`,
          `How fast is ${p.name}'s fulfillment process?`,
          `Does ${p.name} integrate with my e-commerce platform?`,
        ]}
      />

      <StickyCTA />
    </div>
  );
}

function formatState(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatName(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
