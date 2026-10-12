# Testing status

| Check | Status | Evidence |
|---|---|---|
| Automated unit and contract tests | Yes — 8 passing | `evidence/test-run.txt` |
| Sample brief → concepts | Yes | `tests/agent.test.js`, `evidence/http-smoke.json`, Chrome review on October 8, 2026 |
| Edited sample brief remains coherent | Yes | Nike + Accra Chrome review and `tests/agent.test.js` |
| Concept → dossier | Yes | `tests/agent.test.js`, `evidence/http-smoke.json`, Chrome review on October 8, 2026 |
| Browser console | Yes | No Encore-origin warnings or errors; installed wallet extensions emitted unrelated errors |
| Live Qloo key | Yes | Authenticated against the hackathon base URL on October 9, 2026 |
| Live anchor search | Yes | Single-request Dune lookup resolved a movie entity; no response data committed |
| Live cross-domain Insights | Yes | Place, brand, and artist results returned for the live brief |
| Live concept → dossier browser flow | Yes | Chrome verification on October 9, 2026 |
| Public production deployment | No | No production URL yet |
| External playtesters | No | No external test recorded yet |
| Public repository | No | Project currently exists only in this workspace |
| Visual browser inspection | Pending | Both available browser automation helpers were unavailable in this session; API and source checks passed |

Sample-mode evidence is illustrative. It is not represented as Qloo output.
