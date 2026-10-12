# Encore scenario evaluation

## What was tested

- 100 distinct briefs through the production `/api/concepts` flow with sample evidence enabled. This tests validation, copy generation, three-direction rendering, emotional-intent carry-through, and venue classification without consuming Qloo quota.
- 10 distinct live-Qloo briefs across Lagos, Accra, London, New York, Los Angeles, Paris, Nairobi, Johannesburg, Dubai, and Toronto.
- One live Chrome UI scenario for Wizkid in Lagos, verifying the visible research trail and concept board.

## Results

- 100/100 sample-flow requests completed successfully.
- 10/10 diverse live-Qloo requests completed successfully after the upstream rate-limit window cleared.
- The live set produced 6 clean passes and 4 reviews requiring human venue verification.
- The live set did not claim any venue was confirmed or available.

## Findings

1. Large-format briefs need a stricter venue gate. If Qloo returns hotels, lounges, or generic places, Encore now marks them for verification instead of calling them stadiums or event centers.
2. Cultural affinity is useful for partner discovery, but the returned brand and artist names are signals, not confirmed collaborators.
3. The same anchor can produce different city-specific venue and partner signals, but city fit still needs local producer review.
4. Qloo rate limiting is a real operational constraint. The first concurrent 100-request attempt returned 98 upstream 429 responses; that run is preserved separately and was not counted as a cultural-quality failure.

## Evidence files

- `100-scenario-run-sample.json` — detailed 100-brief flow run.
- `100-scenario-summary-sample.json` — aggregate sample-flow results.
- `100-scenario-run-live.json` — detailed diverse live-Qloo run.
- `100-scenario-summary-live.json` — aggregate live results.
