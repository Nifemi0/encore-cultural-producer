export function createSampleResearch(brief = { anchor: "Dune", city: "Lagos" }) {
  const anchor = String(brief.anchor || "Dune").trim();
  const city = String(brief.city || "Lagos").trim();
  return {
  anchor: { id: "sample-anchor", name: anchor, domain: "sample", description: "Illustrative anchor used before live Qloo access is configured." },
  domains: {
    place: [
      { id: "sample-p1", name: "The Observatory", domain: "place", address: city },
      { id: "sample-p2", name: "A waterfront warehouse", domain: "place", address: city },
      { id: "sample-p3", name: "A design gallery", domain: "place", address: city }
    ],
    brand: [
      { id: "sample-b1", name: "Sculptural fashion studio", domain: "brand", affinity: 0.88 },
      { id: "sample-b2", name: "Experimental fragrance house", domain: "brand", affinity: 0.81 },
      { id: "sample-b3", name: "Independent tea atelier", domain: "brand", affinity: 0.77 }
    ],
    artist: [
      { id: "sample-a1", name: "Ambient electronic selector", domain: "artist", affinity: 0.87 },
      { id: "sample-a2", name: "Afrofuturist visual artist", domain: "artist", affinity: 0.83 },
      { id: "sample-a3", name: "Percussion ensemble", domain: "artist", affinity: 0.74 }
    ]
  }
};
}

export const sampleResearch = createSampleResearch();
