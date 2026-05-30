import { createServiceClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { slugs, userId } = await request.json();
  if (!slugs || !userId || !Array.isArray(slugs)) {
    return NextResponse.json({ error: "Missing slugs or userId" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  let ok = 0;
  for (const slug of slugs) {
    const { data: existing } = await supabase.from("saved_3pls").select("id").eq("user_id", userId).eq("slug", slug).maybeSingle();
    if (existing) { ok++; continue; }
    const { error } = await supabase.from("saved_3pls").insert({ user_id: userId, slug });
    if (!error) ok++;
  }
  return NextResponse.json({ saved: ok, total: slugs.length });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ slugs: [], providers: [] });

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ slugs: [], providers: [] });

  const { data: saved } = await supabase.from("saved_3pls").select("slug").eq("user_id", userId).order("created_at", { ascending: false });
  const slugs = (saved || []).map((s: any) => s.slug);

  let providers: any[] = [];
  if (slugs.length > 0) {
    const { data } = await supabase.from("pl_providers").select("*").in("slug", slugs);
    providers = data || [];
    const map = new Map(providers.map((p: any) => [p.slug, p]));
    providers = slugs.map((s: string) => map.get(s)).filter(Boolean);
  }

  return NextResponse.json({ slugs, providers });
}

export async function DELETE(request: Request) {
  const { slug, userId } = await request.json();
  if (!slug || !userId) return NextResponse.json({ error: "Missing slug or userId" }, { status: 400 });

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  await supabase.from("saved_3pls").delete().eq("user_id", userId).eq("slug", slug);
  return NextResponse.json({ ok: true });
}
