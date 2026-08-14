import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    { ok: false, error: message, ...extra },
    { status },
  );
}

export function handleZodError(error: ZodError) {
  const first = error.errors[0];
  return jsonError(first?.message ?? "Invalid input.", 422, {
    fieldErrors: error.flatten().fieldErrors,
  });
}

export function jsonUnauthorized() {
  return jsonError("You must be signed in.", 401);
}

export function jsonForbidden() {
  return jsonError("You do not have access to this resource.", 403);
}

export function jsonNotFound(what = "Resource") {
  return jsonError(`${what} not found.`, 404);
}
