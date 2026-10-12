import { AppError } from "./errors.js";

const DEFAULT_BASE = "https://hackathon.api.qloo.com";
const CACHE_TTL_MS = 10 * 60 * 1000;
const responseCache = new Map();
const inFlight = new Map();

function pause(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export function clearQlooCache() {
  responseCache.clear();
  inFlight.clear();
}

export function entityList(payload) {
  const candidates = [payload?.results, payload?.results?.entities, payload?.entities, payload?.data?.results, payload?.data?.results?.entities, payload?.data?.entities];
  return candidates.find(Array.isArray) || [];
}

export function normalizeEntity(item, domain = "entity") {
  const entity = item?.entity || item;
  const properties = entity?.properties || item?.properties || {};
  return {
    id: entity?.entity_id || entity?.id || item?.entity_id || item?.id || "",
    name: entity?.name || item?.name || "Untitled",
    domain,
    address: properties?.address || properties?.geocode?.address || properties?.geocode?.name || "",
    description: properties?.description || "",
    image: properties?.image?.url || properties?.image || properties?.images?.[0]?.url || null,
    affinity: item?.query?.affinity ?? item?.affinity ?? null,
    popularity: properties?.popularity ?? null,
    url: properties?.website || properties?.url || null
    ,categoryText: [entity?.name, properties?.description, properties?.category, properties?.categories, properties?.type, properties?.subtype].flat().filter(Boolean).join(" ")
  };
}

async function request(pathname, params, config, fetcher = fetch) {
  if (!config.apiKey) throw new AppError("Qloo is not configured.", 503);
  const url = new URL(pathname, config.baseUrl || DEFAULT_BASE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  const cacheKey = url.toString();
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (cached) responseCache.delete(cacheKey);
  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);

  const pending = (async () => {
    let response;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await fetcher(url, {
          headers: { "X-Api-Key": config.apiKey, Accept: "application/json" },
          signal: AbortSignal.timeout(8_000)
        });
      } catch {
        if (attempt === 1) throw new AppError("Qloo could not be reached. Try again shortly.", 502);
        await pause((config.retryDelayMs ?? 800) * (attempt + 1));
        continue;
      }
      if (response.status !== 429) break;
      if (attempt === 1) throw new AppError("Qloo is temporarily rate-limited. Wait a moment and try again.", 429);
      const retryAfter = Number(response.headers?.get?.("retry-after"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 5000) : (config.retryDelayMs ?? 800) * (attempt + 1);
      await pause(delay);
    }
    if (!response.ok) {
      if (response.status === 401) throw new AppError("Qloo authorization failed. Check the event key.", 502);
      if (response.status === 400) throw new AppError("Qloo could not interpret this anchor or location. Try a specific artist, film, game, or brand.", 422);
      throw new AppError(`Qloo returned ${response.status}. Try again shortly.`, 502);
    }
    const value = await response.json();
    responseCache.set(cacheKey, { value, expiresAt: Date.now() + (config.cacheTtlMs ?? CACHE_TTL_MS) });
    return value;
  })();
  inFlight.set(cacheKey, pending);
  try { return await pending; }
  finally { inFlight.delete(cacheKey); }
}

export async function resolveAnchor(query, config, fetcher) {
  const response = await request("/search", { query, take: 12 }, config, fetcher);
  const supported = new Set(["brand", "movie", "artist", "video_game"]);
  const matches = entityList(response).map(item => {
    const entity = item?.entity || item;
    const rawTypes = entity?.types || entity?.type || item?.types || item?.type || [];
    const firstType = (Array.isArray(rawTypes) ? rawTypes : [rawTypes]).find(type => supported.has(String(type).split(":").pop()));
    return firstType ? normalizeEntity(item, String(firstType).split(":").pop()) : null;
  }).filter(item => item?.id);
  return matches.find(item => item.name.toLowerCase() === query.toLowerCase()) || matches[0] || null;
}

export async function discoverDomain(anchorId, city, domain, config, fetcher) {
  const payload = await request("/v2/insights", {
    "filter.type": `urn:entity:${domain}`,
    "filter.location.query": domain === "place" ? city : undefined,
    "signal.interests.entities": anchorId,
    "feature.explainability": "true",
    take: 8
  }, config, fetcher);
  return entityList(payload).map(item => normalizeEntity(item, domain)).filter(item => item.id).slice(0, 8);
}
