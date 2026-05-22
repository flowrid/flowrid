import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { AppError, formatZodError } from "@/lib/errors";

type HandlerFn = (req: Request, context: any) => Promise<Response>;

interface HandlerOptions {
  bodySchema?: ZodSchema;
  querySchema?: ZodSchema;
}

export function apiHandler(fn: HandlerFn, options: HandlerOptions = {}): (...args: any[]) => Promise<Response> {
  return async (req: Request, context: any) => {
    try {
      if (options.bodySchema && ["POST", "PATCH", "PUT"].includes(req.method)) {
        const body = await req.json().catch(() => ({}));
        const parsed = options.bodySchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Validation failed", details: formatZodError(parsed.error) },
            { status: 422 }
          );
        }
        (req as any).validatedBody = parsed.data;
      }

      if (options.querySchema) {
        const url = new URL(req.url);
        const raw: Record<string, string> = {};
        url.searchParams.forEach((v, k) => { raw[k] = v; });
        const parsed = options.querySchema.safeParse(raw);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid query parameters", details: formatZodError(parsed.error) },
            { status: 422 }
          );
        }
        (req as any).validatedQuery = parsed.data;
      }

      return await fn(req, context);
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json(
          { error: err.message, code: err.code, details: err.details },
          { status: err.status }
        );
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: formatZodError(err) },
          { status: 422 }
        );
      }
      if (process.env.NODE_ENV === "development") {
        console.error("[API Handler] Unhandled error:", err);
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
