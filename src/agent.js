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
function placeFit(place, brief) {
  const name = `${place?.name || ""}`.toLowerCase();
  const text = `${place?.name || ""} ${place?.description || ""} ${place?.categoryText || ""}`.toLowerCase();
  const nameExclusions = /culinary|kitchen|restaurant|cafe|bistro|brasserie|bar(?:\s|$)|radio|fm(?:\s|$)|clinic|hospital|bank|office|school|university|church|mosque|salon|visa|embassy|consulate|apartment|residence|spa/;
  const exclusions = /radio|fm|broadcast|clinic|hospital|bank|office|investment|school|university|church|mosque|restaurant|cafe|culinary|kitchen|bistro|brasserie|salon|visa|embassy|consulate|apartment|residence|spa|application center|application centre/;
  const large = /stadium|arena|event ?center|event ?centre|convention|expo|exhibition|amphitheatre|amphitheater|coliseum|sports complex|sports ground|festival ground/;
  const music = /concert hall|auditorium|theatre|theater|music hall|live music|performance venue/;
  const flexible = /hotel|rooftop|club|lounge|gallery|cultural center|cultural centre|park|beach/;
  if (nameExclusions.test(name) || exclusions.test(text)) return { class: "cultural lead", score: -20, note: "Cultural or media lead — not classified as an event venue." };
  if (large.test(text)) return { class: "stadium or major event venue", score: 100, note: "Large-format venue lead for headline-scale programming; capacity and availability still require verification." };
  if (music.test(text)) return { class: "concert or performance venue", score: 75, note: "Performance venue lead; capacity, dates, and production requirements require verification." };
  if (flexible.test(text)) return { class: "flexible event space", score: 45, note: "Potential event space; confirm whether it can support the requested audience and production scale." };
  return { class: "unclassified place", score: 0, note: "Qloo cultural place lead; venue type and event suitability require verification." };
}
function rankPlaces(places, brief) {
  return [...places].map(place => ({ place, fit: placeFit(place, brief) })).sort((a, b) => b.fit.score - a.fit.score);
}
function evidence(entity, fit) { return entity ? { id: entity.id, name: entity.name, domain: entity.domain, affinity: entity.affinity, address: entity.address, venueClass: fit?.class || null, venueNote: fit?.note || null } : null; }

export function composeConcepts(brief, research, mode) {
  const rankedPlaces = rankPlaces(research.domains.place || [], brief);
  const requiresLargeVenue = brief.budget === "Flagship" || /headline-scale|major live event|stadium|arena|large concert|concert location/i.test(brief.objective);
  const minimumVenueScore = requiresLargeVenue ? 100 : 40;
  const eligiblePlaces = rankedPlaces.filter(item => item.fit.score >= minimumVenueScore);
  const brands = research.domains.brand || [];
  const artists = research.domains.artist || [];
  return strategies.map((strategy, index) => {
    const ranked = eligiblePlaces[index] || null;
    const place = ranked?.place || null;
    const placeFitResult = ranked?.fit;
    const brand = select(brands, index + (strategy.key === "twist" ? 1 : 0));
    const artist = select(artists, index);
    const title = strategy.key === "closest" ? `${research.anchor.name}: ${strategy.title}` : strategy.title;
    return {
      id: `${strategy.key}-${index + 1}`,
      strategy: strategy.label,
      title,
      hook: `${strategy.premise} Built for ${brief.audience} in ${brief.city}.`,
      venue: place?.name || `${requiresLargeVenue ? "Major venue" : "Venue"} shortlist required in ${brief.city}`,
      venueNote: place?.address || "No suitable venue returned by Qloo",
      venueFit: place ? placeFitResult.note : requiresLargeVenue ? "Source and verify a stadium, arena, concert hall, or major event center before committing." : "Source and verify an event-ready venue before committing.",
      partners: [brand?.name, artist?.name].filter(Boolean),
      experience: [
        `Arrival: a designed threshold that introduces the world of ${research.anchor.name}.`,
        `Centerpiece: a ${brief.format.toLowerCase()} combining ${artist?.name || "live culture"} with ${brand?.name || "a local maker"}.`,
        `Exit: a shareable artifact that carries the collaboration beyond the room.`
      ],
      whyItWorks: mode === "live"
        ? `Qloo connected ${research.anchor.name} to the displayed ${[place?.name, brand?.name, artist?.name].filter(Boolean).join(", ")} research leads. Encore used those leads to form a coherent ${strategy.label.toLowerCase()} concept for the stated objective: ${brief.objective}`
        : `Encore combined the illustrative ${[place?.name, brand?.name, artist?.name].filter(Boolean).join(", ")} sample leads into a ${strategy.label.toLowerCase()} concept for the stated objective: ${brief.objective}`,
      evidence: [evidence(place, placeFitResult), evidence(brand), evidence(artist)].filter(Boolean),
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
    let anchor = await resolveAnchor(brief.anchor, config, fetcher);
    if (!anchor) throw new AppError(`Qloo could not resolve “${brief.anchor}”. Try a better-known artist, film, game, or brand.`, 422);
    if (anchor.name?.toLowerCase() === brief.anchor.toLowerCase()) anchor = { ...anchor, name: brief.anchor };
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
    partnerRoles: concept.evidence.map((item, index) => ({ name: item.name, role: index === 0 ? "Possible host environment" : index === 1 ? "Possible brand collaborator" : "Possible sound collaborator", verification: "Research lead — contact, suitability, and participation unconfirmed" })),
    productionPriorities: ["Verify venue capacity, access, availability, and licensing.", "Confirm the anchor property’s promotional and intellectual-property permissions.", "Contact proposed partners with a tailored collaboration hypothesis.", "Price the centerpiece before expanding secondary programming."],
    promotionAngles: [`${concept.title}: one night in ${brief.city}`, `A local interpretation of ${brief.anchor}`, "The collaboration you would not expect, backed by cultural affinity"],
    evidence: concept.evidence,
    limitations: concept.caveat,
    generatedAt: new Date().toISOString()
  };
}
