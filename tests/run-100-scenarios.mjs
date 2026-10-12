import { mkdir, writeFile } from "node:fs/promises";

const endpoint = process.env.ENCORE_URL || "https://encore.nuvixes.studio";
const anchors = ["Wizkid", "Burna Boy", "Dune", "Black Panther", "The Sims", "Nike", "FIFA", "Stranger Things", "Sade", "Afrobeats"];
const cities = ["Lagos", "Accra", "London", "New York", "Los Angeles", "Paris", "Nairobi", "Johannesburg", "Dubai", "Toronto"];
const audiences = [
  { text: "core fans and culture-forward young adults", emotion: "belonging" },
  { text: "premium nightlife guests and tastemakers", emotion: "status" },
  { text: "families looking for a joyful shared experience", emotion: "joy" },
  { text: "design-conscious creatives who want an immersive night out", emotion: "wonder" },
  { text: "diaspora communities reconnecting with home", emotion: "nostalgia" },
  { text: "music discovery fans who want a high-energy crowd", emotion: "energy" },
  { text: "brand community members who want something unexpected", emotion: "surprise" },
  { text: "film and storytelling fans seeking emotional depth", emotion: "awe" },
  { text: "local culture leaders and influential connectors", emotion: "pride" },
  { text: "curious newcomers who want a welcoming first experience", emotion: "welcome" }
];
const objectives = [
  "Create a high-energy opening night people will photograph and share.",
  "Build an intimate, emotionally resonant experience that makes guests feel seen.",
  "Find a headline-scale venue for a major live event.",
  "Create a nostalgic cultural bridge between the anchor and the city.",
  "Introduce the anchor to a new audience through an unexpected local collaboration.",
  "Make a premium experience feel distinctive, cinematic, and worth travelling for.",
  "Turn cultural affinity into a practical launch concept with a clear guest journey.",
  "Create a joyful community moment that families can safely share.",
  "Find a credible partner ecosystem for a city-specific activation.",
  "Design a surprising concept that people will want to explain to someone else."
];
const budget = ["Lean", "Medium", "Flagship"];

function scenario(i) {
  const anchor = anchors[i % anchors.length];
  const city = cities[Math.floor(i / anchors.length) % cities.length];
  const audience = audiences[i % audiences.length];
  const objective = objectives[i % objectives.length];
  return { id: `S${String(i + 1).padStart(3, "0")}`, anchor, city, audience: audience.text, emotion: audience.emotion, objective, budget: budget[i % budget.length], format: i % 3 === 0 ? "One-night pop-up" : i % 3 === 1 ? "Weekend residency" : "Listening session", sampleMode: process.env.SAMPLE_MODE === "1" };
}

function classify(result, brief) {
  const concepts = result?.concepts || [];
  const venueClasses = concepts.map(c => c.evidence?.[0]?.venueClass || "missing");
  const venueNotes = concepts.map(c => c.venueFit || "missing");
  const names = concepts.flatMap(c => c.evidence?.slice(1).map(e => e.name) || []);
  const allCopy = concepts.map(c => `${c.hook} ${c.whyItWorks}`).join(" ").toLowerCase();
  const emotionCovered = ["intimate", "high-energy", "nostalgic", "joyful", "premium", "unexpected", "surprising", "immersive", "cinematic", "welcoming", "community", "awe"].some(word => allCopy.includes(word));
  const largeScaleRequested = /headline-scale|major live event|stadium|arena/i.test(brief.objective);
  const hasLargeVenue = venueClasses.some(c => /stadium|major event|concert|performance/i.test(c));
  const culturalLead = venueClasses.filter(c => c === "cultural lead" || c === "unclassified place").length;
  const duplicateVenues = new Set(concepts.map(c => c.venue)).size < concepts.length;
  const flags = [];
  if (largeScaleRequested && !hasLargeVenue) flags.push("large-scale request lacks stadium/major-event venue");
  if (culturalLead) flags.push(`${culturalLead} location lead(s) need venue verification`);
  if (duplicateVenues) flags.push("duplicate venue across directions");
  if (!emotionCovered) flags.push("emotional intent is not visible in generated copy");
  if (!names.length) flags.push("no partner signals returned");
  return { venueClasses, venueNotes, partnerNames: names, emotionCovered, largeScaleRequested, hasLargeVenue, culturalLeadCount: culturalLead, duplicateVenues, flags, verdict: flags.length ? "review" : "pass" };
}

async function runOne(brief, index) {
  const started = Date.now();
  try {
    let response;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      response = await fetch(`${endpoint}/api/concepts`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(brief) });
      if (response.status !== 429 || attempt === 3) break;
      await new Promise(resolve => setTimeout(resolve, 15000 * (attempt + 1)));
    }
    const body = await response.json();
    const evaluation = response.ok ? classify(body, brief) : { flags: [body?.error || `HTTP ${response.status}`], verdict: "fail" };
    return { ...brief, index, httpStatus: response.status, mode: body?.mode || null, durationMs: Date.now() - started, trail: body?.trail || [], concepts: (body?.concepts || []).map(c => ({ strategy: c.strategy, title: c.title, venue: c.venue, venueNote: c.venueNote, venueFit: c.venueFit, evidence: c.evidence, hook: c.hook, whyItWorks: c.whyItWorks })), evaluation };
  } catch (error) {
    return { ...brief, index, httpStatus: 0, mode: null, durationMs: Date.now() - started, concepts: [], evaluation: { flags: [String(error)], verdict: "fail" } };
  }
}

const scenarioStride = Number(process.env.STRIDE || 1);
const scenarioOffset = Number(process.env.OFFSET || 0);
const scenarios = Array.from({ length: Number(process.env.COUNT || 100) }, (_, i) => scenario(scenarioOffset + (i * scenarioStride)));
const results = [];
let cursor = 0;
const workers = Array.from({ length: process.env.SAMPLE_MODE === "1" ? 5 : 1 }, async () => {
  while (cursor < scenarios.length) {
    const index = cursor++;
    results[index] = await runOne(scenarios[index], index);
    await new Promise(resolve => setTimeout(resolve, 750));
  }
});
await Promise.all(workers);

const summary = {
  endpoint,
  generatedAt: new Date().toISOString(),
  total: results.length,
  httpPass: results.filter(r => r.httpStatus >= 200 && r.httpStatus < 300).length,
  liveMode: results.filter(r => r.mode === "live").length,
  verdictPass: results.filter(r => r.evaluation.verdict === "pass").length,
  review: results.filter(r => r.evaluation.verdict === "review").length,
  failures: results.filter(r => r.evaluation.verdict === "fail").length,
  flagCounts: Object.fromEntries(results.flatMap(r => r.evaluation.flags || []).reduce((m, flag) => m.set(flag, (m.get(flag) || 0) + 1), new Map())),
  averageDurationMs: Math.round(results.reduce((sum, r) => sum + r.durationMs, 0) / results.length)
};
await mkdir("evidence", { recursive: true });
const suffix = process.env.SAMPLE_MODE === "1" ? "sample" : "live";
await writeFile(`evidence/100-scenario-run-${suffix}.json`, JSON.stringify({ summary, results }, null, 2));
await writeFile(`evidence/100-scenario-summary-${suffix}.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
