# Live 10-scenario retest

Date: 2026-10-12  
Environment: Chrome against https://encore.nuvixes.studio  
Mode: Live Qloo evidence

## Result

Nine of the ten original scenarios returned three live directions. The broad `Studio Ghibli` query was rejected by Qloo; the more precise film anchor `Spirited Away` succeeded. The run exposed venue-classification, browser-cache, stale-result, casing, and indefinite-wait defects. Those defects were corrected and deployed during the test.

| Scenario | Runtime result | Cultural assessment | Main evidence |
|---|---|---|---|
| Wizkid in Lagos | Completed; major venue withheld | Promising but incomplete | Starboy and Pulse Ng fit the anchor; Qloo supplied no stadium or major event venue. |
| Burna Boy in London | Completed; major venue withheld | Needs local reranking | Mr Eazi is adjacent, but Pulse Ng does not create the requested London bridge. |
| Dune in New York | Completed | Mixed | Hildur Guðnadóttir is strong; Top of the Rock is plausible; Tesla is generic. |
| Nike in Paris | Completed | Mixed | Air Jordan is strong; the hotel and Wiz Khalifa are weak Paris-specific choices. |
| Tems in Accra | Completed | Promising but needs verification | Omah Lay is coherent and Urbano Hotel is local; Pulse Ng is Nigeria-centric. |
| Beyoncé in Houston | Completed; major venue withheld | Mixed | Ivy Park is strong; Britney Spears is weak for the stated homecoming objective. NOTO Houston was rejected after the test exposed its insufficient scale. |
| Studio Ghibli in Tokyo | Rejected by Qloo | Input recovery required | `Spirited Away` succeeded as the precise replacement anchor, returning Broadway Music Theater, Subaru, and Björk. |
| FC Barcelona in Miami | Completed | Reject without human correction | Daddy Yankee supports a Miami and Latin audience; Real Madrid is a direct rival and should not appear as the closest-fit collaborator. |
| Black Panther in Johannesburg | Completed; major venue withheld | Reject without human correction | Tesla and Travis Scott do not express the requested African creative-culture brief. A misleading Culinary Club venue was removed. |
| Spotify in Berlin | Completed | Reject without human correction | Shazam, Toto, and generic hotels do not fit an emerging Berlin electronic-music discovery night. |

## Defects corrected during the run

- Flagship briefs now require a stadium, arena, major event center, convention venue, or comparable large-format place.
- Culinary clubs, restaurants, bars, offices, media stations, and other misleading place types are rejected as venues.
- Previous concept boards are cleared before a new request, preventing stale results from appearing current.
- Exact anchor casing from the submitted brief is preserved.
- Qloo calls use caching, retry limits, per-request timeouts, and an overall server deadline.
- The browser bundle URL is versioned so deployed reliability fixes are not masked by an old cached script.

## Decision

Encore remains suitable for the Qloo hackathon when positioned as an evidence-backed cultural research assistant with explicit human verification. It is not ready to operate as an autonomous production recommendation system.

The next product layer must rerank raw Qloo affinity using the brief's city, audience, scale, emotional intent, collaborator conflicts, and operational venue requirements. It should reject rivals such as Real Madrid for an FC Barcelona closest-fit concept and low-locality matches such as Toto for emerging Berlin electronic music.
