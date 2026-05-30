import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          }));
        },
        setAll() {},
      },
    },
  );

  const { data, error } = await supabase.auth.getSession();

  return NextResponse.json({
    hasSession: !!data?.session,
    email: data?.session?.user?.email ?? null,
    error: error?.message ?? null,
    cookieCount: request.cookies.getAll().length,
    cookieNames: request.cookies.getAll().map((c) => c.name),
  });
}
