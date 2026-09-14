import "server-only";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const buckets = new Map<string, { count: number; reset: number }>();

export function allowRequest(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  }
  return bucket.count <= MAX_PER_WINDOW;
}
