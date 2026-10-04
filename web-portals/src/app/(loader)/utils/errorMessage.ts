/**
 * Extracts a readable message from thrown values (Error, Supabase PostgrestError, strings).
 */
export function errorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}
