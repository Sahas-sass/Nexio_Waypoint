/** Extracts a human readable message from an unknown error (Supabase errors, Error, string). */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

/** Throws the Supabase error (if any) and returns the data otherwise. */
export function unwrap<T>(result: { data: T | null; error: unknown }, emptyValue?: T): T {
  if (result.error) throw new Error(errorMessage(result.error));
  if (result.data === null || result.data === undefined) {
    if (emptyValue !== undefined) return emptyValue;
    throw new Error("No data returned");
  }
  return result.data;
}

/** PostgREST can return an embedded one-to-one relation as an object or a 1-element array. */
export function single<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
