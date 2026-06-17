import { createServerClient } from "@/lib/supabase";
import { localBusinessSchema } from "@/lib/jsonld";
import {
  generateOverview,
  generateOverviewSecondary,
  generateFAQItems,
} from "@/lib/detail-content";
import { geocodeCity } from "@/lib/geocode";
import nextDynamic from "next/dynamic";
import HeroSection from "@/components/detail/HeroSection";

const TabNavigation = nextDynamic(() => import("@/components/detail/TabNavigation"), { ssr: false });
import OverviewSection from "@/components/detail/OverviewSection";
import ReviewsSection from "@/components/detail/ReviewsSection";
import LocationsSection from "@/components/detail/LocationsSection";
import SpecialtiesSection from "@/components/detail/SpecialtiesSection";
import AlternativesSection from "@/components/detail/AlternativesSection";
import TeamSection from "@/components/detail/TeamSection";
import CustomersSection from "@/components/detail/CustomersSection";
import TechnologySection from "@/components/detail/TechnologySection";
import AwardsSection from "@/components/detail/AwardsSection";
import AtAGlanceSection from "@/components/detail/AtAGlanceSection";
import DetailFAQ from "@/components/detail/DetailFAQ";
import BottomCTA from "@/components/detail/BottomCTA";
import type { Metadata } from "next";
import type { ThreePL } from "@/types/3pl";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatState(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "reviews", label: "Reviews" },
  { id: "locations", label: "Locations" },
  { id: "specialties", label: "Specialties" },
  { id: "alternatives", label: "Alternatives" },
  { id: "team", label: "Team" },
  { id: "customers", label: "Customers" },
  { id: "technology", label: "Technology" },
  { id: "awards", label: "Awards" },
  { id: "at-a-glance", label: "At a Glance" },
  { id: "faq", label: "FAQ" },
];

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
      <div className="max-w-[1460px] mx-auto px-4 py-16 text-center">
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
      <div className="max-w-[1460px] mx-auto px-4 py-16 text-center">
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

  // 查询同州替代 3PL
  const { data: alternatives } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("state", p.state)
    .neq("slug", p.slug)
    .order("rating", { ascending: false })
    .limit(6);

  const overviewText = generateOverview(p);
  const secondaryText = generateOverviewSecondary(p);

  // 地理编码
  const geo = await geocodeCity(p.city || "", p.state);
  const lat = geo?.lat;
  const lng = geo?.lng;

  return (
    <>
      {/* JSON-LD 结构化数据 */}
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

      {/* 返回链接 */}
      <div className="max-w-[1460px] mx-auto px-4 pt-4">
        <Link
          href={`/3pl/${p.state}`}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {formatState(p.state)} 3PLs
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-[1460px] mx-auto px-4 pt-6 pb-5 md:pb-8">
        <HeroSection
          name={p.name}
          slug={p.slug}
          logo={p.logo}
          heroImage={(p as any).hero_image}
          rating={p.rating || 0}
          reviewCount={p.review_count || 0}
          description={p.description || ""}
          city={p.city || ""}
          state={p.state}
          website={p.website}
          orderCapacity={p.order_capacity || 0}
        />
      </div>

      {/* Tab Navigation */}
      <TabNavigation tabs={TABS} />

      {/* 各 Section */}
      <div className="max-w-[1460px] mx-auto px-4">
        <div className="space-y-14 py-10">
          {/* Overview */}
          <section id="overview">
            <OverviewSection
              name={p.name}
              overviewText={overviewText}
              secondaryText={secondaryText}
            />
          </section>

          {/* Reviews */}
          <section id="reviews">
            <ReviewsSection
              name={p.name}
              rating={p.rating || 0}
              reviewCount={p.review_count || 0}
              slug={p.slug}
            />
          </section>

          {/* Locations */}
          <section id="locations">
            <LocationsSection
              name={p.name}
              city={p.city || ""}
              state={p.state}
              lat={lat}
              lng={lng}
            />
          </section>

          {/* Specialties */}
          <section id="specialties">
            <SpecialtiesSection
              name={p.name}
              state={p.state}
              categories={p.categories || []}
              platforms={p.platforms || []}
              integrations={p.integrations || []}
            />
          </section>

          {/* Alternatives */}
          <section id="alternatives">
            <AlternativesSection
              currentSlug={p.slug}
              currentName={p.name}
              state={p.state}
              alternatives={(alternatives as ThreePL[]) || []}
            />
          </section>

          {/* Team */}
          <section id="team">
            <TeamSection name={p.name} />
          </section>

          {/* Customers */}
          <section id="customers">
            <CustomersSection
              name={p.name}
              categories={p.categories || []}
            />
          </section>

          {/* Technology */}
          <section id="technology">
            <TechnologySection
              name={p.name}
              platforms={p.platforms || []}
              integrations={p.integrations || []}
            />
          </section>

          {/* Awards */}
          <section id="awards">
            <AwardsSection
              name={p.name}
              rating={p.rating || 0}
              state={p.state}
            />
          </section>

          {/* At a Glance */}
          <section id="at-a-glance">
            <AtAGlanceSection
              name={p.name}
              state={p.state}
              city={p.city || ""}
              shippingSpeed={p.shipping_speed || ""}
              costLevel={p.cost_level || "$"}
              orderCapacity={p.order_capacity || 0}
              skuCapacity={p.sku_capacity || 0}
              categories={p.categories || []}
              platforms={p.platforms || []}
              integrations={p.integrations || []}
            />
          </section>

          {/* FAQ */}
          <DetailFAQ threePL={p} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-[1460px] mx-auto px-4 pb-16">
        <BottomCTA slug={p.slug} />
      </div>
    </>
  );
}
