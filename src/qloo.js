import { AppError } from "./errors.js";

const DEFAULT_BASE = "https://hackathon.api.qloo.com";

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
  };
}

async function request(pathname, params, config, fetcher = fetch) {
  if (!config.apiKey) throw new AppError("Qloo is not configured.", 503);
  const url = new URL(pathname, config.baseUrl || DEFAULT_BASE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  let response;
  try {
    response = await fetcher(url, {
      headers: { "X-Api-Key": config.apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000)
    });
  } catch {
    throw new AppError("Qloo could not be reached. Try again shortly.", 502);
  }
  if (!response.ok) throw new AppError(`Qloo returned ${response.status}. Check the event key and inputs.`, 502);
  return response.json();
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
