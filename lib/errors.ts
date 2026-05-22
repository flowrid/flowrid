import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code: string = "BAD_REQUEST",
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super("Validation failed", 422, "VALIDATION_ERROR", details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(message, 503, "DATABASE_ERROR");
  }
}

export function formatZodError(error: ZodError) {
  return error.issues.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
}

/**
 * 返回安全的错误消息 — 生产环境中隐藏内部敏感信息。
 */
export function safeErrorMessage(err: unknown): string {
  if (process.env.NODE_ENV === "development") {
    return (err as any)?.message ?? "Unknown error";
  }
  return "An internal error occurred";
}
