import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { hash, compare } from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "flowrid-saas-secret-change-in-production-2026"
);

export async function POST(req: Request) {
  try {
    const { action, email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    if (action === "register") {
      return handleRegister(supabase, email, password, name);
    }

    if (action === "login") {
      return handleLogin(supabase, email, password);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("Auth error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleRegister(
  supabase: NonNullable<ReturnType<typeof createServerClient>>,
  email: string,
  password: string,
  name?: string
) {
  const cleanEmail = email.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);
  const displayName = name || cleanEmail.split("@")[0];

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      email: cleanEmail,
      name: displayName,
      role: "operator",
      is_active: true,
      password_hash: hashedPassword,
    } as any)
    .select("id, email, name, role")
    .single();

  if (error) {
    if (error.message?.includes("does not exist") || error.code === "42P01") {
      return NextResponse.json({
        success: true,
        demo: true,
        user: { id: "demo-001", name: displayName, email: cleanEmail, role: "operator" },
      });
    }
    console.error("Register DB error:", error);
    return NextResponse.json({ error: "Failed to create account. Is the users table set up?" }, { status: 500 });
  }

  const token = await createToken((user as { id: string }).id, (user as { email: string }).email);
  const response = NextResponse.json({
    success: true,
    user: { id: (user as { id: string }).id, name: (user as { name: string }).name, email: (user as { email: string }).email, role: (user as { role: string }).role },
  });

  response.cookies.set("flowrid_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}

async function handleLogin(
  supabase: NonNullable<ReturnType<typeof createServerClient>>,
  email: string,
  password: string
) {
  const cleanEmail = email.toLowerCase().trim();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (error || !user) {
    // users 表不存在 — demo 登录
    if (error?.message?.includes("does not exist") || error?.code === "42P01") {
      return demoLogin(cleanEmail);
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const userData = user as { id: string; email: string; name: string; role: string; password_hash?: string };

  if (!userData.password_hash) {
    return NextResponse.json({ error: "Account not fully set up. Please register again." }, { status: 401 });
  }

  const valid = await compare(password, userData.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createToken(userData.id, userData.email);
  const response = NextResponse.json({
    success: true,
    user: { id: userData.id, name: userData.name, email: userData.email, role: userData.role },
  });

  response.cookies.set("flowrid_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}

function demoLogin(email: string) {
  const name = email.split("@")[0];
  const response = NextResponse.json({
    success: true,
    demo: true,
    user: { id: "demo-001", name, email, role: "operator" },
  });
  response.cookies.set("flowrid_token", "demo-token", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}

async function createToken(userId: string, email: string) {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}
