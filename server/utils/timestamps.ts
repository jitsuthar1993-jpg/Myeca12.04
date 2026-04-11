/**
 * Converts provider timestamp objects or serialized timestamp values to a JS Date.
 * Returns null for missing values, passes through anything else unchanged.
 */
export function convertTimestamp(ts: unknown): Date | null | unknown {
  if (!ts) return null;
  if (typeof (ts as any).toDate === "function") return (ts as any).toDate();
  if (typeof (ts as any)._seconds === "number") return new Date((ts as any)._seconds * 1000);
  return ts;
}
