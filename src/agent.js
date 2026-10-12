import { AppError } from "./errors.js";
import { discoverDomain, resolveAnchor } from "./qloo.js";
import { createSampleResearch } from "./sample.js";

const strategies = [
  { key: "closest", label: "Closest fit", title: "Signal Room", premise: "Turn the anchor’s strongest cultural signals into an intimate, high-confidence experience." },
  { key: "bridge", label: "Cultural bridge", title: "Common Ground", premise: "Connect two adjacent audiences through a shared place, sound, and ritual." },
  { key: "twist", label: "Plot twist", title: "The Beautiful Collision", premise: "Use a less obvious affinity to create a collaboration people will want to explain to someone else." }
];

function clean(value, max = 100) { return String(value || "").trim().slice(0, max); }

export function validateBrief(input) {
  const brief = {
    anchor: clean(input.anchor), city: clean(input.city), audience: clean(input.audience, 160),
    objective: clean(input.objective, 180), budget: clean(input.budget || "Medium"), format: clean(input.format || "One-night pop-up"),
    constraints: clean(input.constraints, 220), sampleMode: Boolean(input.sampleMode)
  };
  if (brief.anchor.length < 2 || brief.city.length < 2 || brief.audience.length < 4 || brief.objective.length < 4) {
    throw new AppError("Add an anchor, city, audience, and objective before generating concepts.");
  }
  return brief;
}

function select(items, index) { return items.length ? items[index % items.length] : null; }
function evidence(entity) { return entity ? { id: entity.id, name: entity.name, domain: entity.domain, affinity: entity.affinity, address: entity.address } : null; }

export function composeConcepts(brief, research, mode) {
  const places = research.domains.place || [];
  const brands = research.domains.brand || [];
  const artists = research.domains.artist || [];
  return strategies.map((strategy, index) => {
    const place = select(places, index);
    const brand = select(brands, index + (strategy.key === "twist" ? 1 : 0));
    const artist = select(artists, index);
    const title = strategy.key === "closest" ? `${research.anchor.name}: ${strategy.title}` : strategy.title;
    return {
      id: `${strategy.key}-${index + 1}`,
      strategy: strategy.label,
      title,
      hook: `${strategy.premise} Built for ${brief.audience} in ${brief.city}.`,
      venue: place?.name || `A character-rich venue in ${brief.city}`,
      venueNote: place?.address || "Venue availability requires verification.",
      partners: [brand?.name, artist?.name].filter(Boolean),
      experience: [
        `Arrival: a designed threshold that introduces the world of ${research.anchor.name}.`,
        `Centerpiece: a ${brief.format.toLowerCase()} combining ${artist?.name || "live culture"} with ${brand?.name || "a local maker"}.`,
        `Exit: a shareable artifact that carries the collaboration beyond the room.`
      ],
      whyItWorks: mode === "live"
        ? `Qloo connected ${research.anchor.name} to the displayed ${[place?.name, brand?.name, artist?.name].filter(Boolean).join(", ")} research leads. Encore used those leads to form a coherent ${strategy.label.toLowerCase()} concept for the stated objective: ${brief.objective}`
        : `Encore combined the illustrative ${[place?.name, brand?.name, artist?.name].filter(Boolean).join(", ")} sample leads into a ${strategy.label.toLowerCase()} concept for the stated objective: ${brief.objective}`,
      evidence: [evidence(place), evidence(brand), evidence(artist)].filter(Boolean),
      caveat: "Affinity supports creative research. Availability, commercial fit, rights, pricing, and partner interest remain unverified.",
      mode
    };
  });
}

export async function createConcepts(input, config, fetcher = fetch) {
  const brief = validateBrief(input);
  let research;
  let mode;
  const trail = ["Brief interpreted", "Anchor resolution planned", "Cross-domain discovery planned"];
  if (brief.sampleMode) {
    research = createSampleResearch(brief);
    mode = "sample";
    trail.push("Loaded clearly labeled sample evidence", "Composed three strategy-distinct concepts");
  } else {
    if (!config.apiKey) throw new AppError("Live Qloo mode needs QLOO_API_KEY. Use sample mode to review the product flow.", 503);
    const anchor = await resolveAnchor(brief.anchor, config, fetcher);
    if (!anchor) throw new AppError(`Qloo could not resolve “${brief.anchor}”. Try a better-known artist, film, game, or brand.`, 422);
    trail.push(`Resolved ${anchor.name} in Qloo`);
    const [place, brand, artist] = await Promise.all([
      discoverDomain(anchor.id, brief.city, "place", config, fetcher),
      discoverDomain(anchor.id, brief.city, "brand", config, fetcher),
      discoverDomain(anchor.id, brief.city, "artist", config, fetcher)
    ]);
    research = { anchor, domains: { place, brand, artist } };
    mode = "live";
    trail.push(`Compared ${place.length + brand.length + artist.length} Qloo entities`, "Composed three strategy-distinct concepts");
  }
  return { brief, anchor: research.anchor, trail, concepts: composeConcepts(brief, research, mode), mode, generatedAt: new Date().toISOString() };
}

export function buildDossier(input) {
  const brief = input?.brief;
  const concept = input?.concept;
  if (!brief || !concept?.id || !Array.isArray(concept.evidence)) throw new AppError("Choose a generated concept before creating a dossier.");
  return {
    title: concept.title,
    thesis: concept.hook,
    status: concept.mode === "live" ? "Qloo-grounded draft" : "Sample-mode draft",
    brief: { city: brief.city, audience: brief.audience, objective: brief.objective, budget: brief.budget, format: brief.format, constraints: brief.constraints || "None supplied" },
    guestJourney: concept.experience,
    partnerRoles: concept.evidence.map((item, index) => ({ name: item.name, role: index === 0 ? "Host environment" : index === 1 ? "Material and product collaborator" : "Sound and performance collaborator", verification: "Research lead — contact and participation unconfirmed" })),
    productionPriorities: ["Verify venue capacity, access, availability, and licensing.", "Confirm the anchor property’s promotional and intellectual-property permissions.", "Contact proposed partners with a tailored collaboration hypothesis.", "Price the centerpiece before expanding secondary programming."],
    promotionAngles: [`${concept.title}: one night in ${brief.city}`, `A local interpretation of ${brief.anchor}`, "The collaboration you would not expect, backed by cultural affinity"],
    evidence: concept.evidence,
    limitations: concept.caveat,
    generatedAt: new Date().toISOString()
  };
}
