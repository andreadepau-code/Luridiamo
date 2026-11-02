export type Coordinates = [number, number];

const cache = new Map<string, Coordinates | null>();
let queue: Promise<unknown> = Promise.resolve();
let lastRequest = 0;

// Completed address lookups only: never use the public service for autocomplete.
export function locateAddress(address: string): Promise<Coordinates | null> {
  const query = address.trim();
  if (!query) return Promise.resolve(null);
  const key = query.toLocaleLowerCase("it");
  const lookup = queue.then(async () => {
    if (cache.has(key)) return cache.get(key) ?? null;
    const wait = Math.max(0, 1100 - (Date.now() - lastRequest));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequest = Date.now();
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "1",
      countrycodes: "it",
      viewbox: "8.9,45.7,9.4,45.2",
      "accept-language": "it",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Ricerca indirizzo non disponibile");
    const results: unknown = await response.json();
    const first = Array.isArray(results) ? results[0] : null;
    const latitude = Number(first?.lat);
    const longitude = Number(first?.lon);
    const position: Coordinates | null =
      first &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
        ? [latitude, longitude]
        : null;
    cache.set(key, position);
    return position;
  });
  queue = lookup.catch(() => undefined);
  return lookup;
}
