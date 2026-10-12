# Encore

> Make the collaboration nobody saw coming.

Encore is a Qloo-powered creative producer for agencies, promoters, and experience teams. Give it an artist, film, game, or brand plus a city and objective. Its agent investigates cultural affinity across local places, brands, and artists, returns three distinct pop-up directions, and turns the selected direction into an evidence-backed activation dossier.

## What works

- A complete brief-to-concept-to-dossier product flow.
- Server-side Qloo Search and Insights integration; the event key never reaches the browser.
- Three deliberate strategies: closest fit, cultural bridge, and plot twist.
- An evidence ledger on every concept, preserving Qloo entity IDs, domains, affinity values when supplied, and location context.
- Clearly labeled sample mode for interface review before live event access is configured.
- Honest feasibility boundaries: affinity informs creative research; venue availability, rights, pricing, and partner participation require verification.

## Run locally

Requires Node.js 22 or newer.

```sh
copy .env.example .env
npm start
```

Set `QLOO_API_KEY` in your environment to use live Qloo data. The hackathon key must be used with `https://hackathon.api.qloo.com`. Without a key, choose **Use sample evidence** in the brief studio.

Request the event key through the [official hackathon access form](https://forms.gle/zz12orkLHTAneLGz6). Qloo says keys are manually provisioned and typically arrive by email within a few business days; check spam or junk mail if it has not arrived.

Encore follows the hackathon guide's required request shape:

- `X-Api-Key` request header rather than a bearer token or query-string credential.
- `GET /search` for entity lookup.
- `GET /v2/insights` with documented query parameters for affinity discovery.
- No use of the unsupported legacy `/recs` or `/recommendations` endpoints.

Open `http://localhost:4174`.

## Public demo

- Live app: https://encore.nuvixes.studio
- Vercel fallback: https://encore-cultural-producer.vercel.app
- Public source: https://github.com/Nifemi0/encore-cultural-producer

## Test

```sh
npm test
```

## Qloo architecture

1. `/search` attempts to resolve the anchor across brand, movie, artist, and video-game types.
2. `/v2/insights` discovers affinity-ranked places in the requested city, plus brands and artists related to the resolved anchor.
3. Encore retains the returned Qloo identifiers and evidence fields.
4. The composition agent assigns the research into three distinct creative strategies.
5. The selected concept becomes an activation dossier with an explicit verification checklist.

If Qloo is removed, live anchor resolution, cross-domain partner discovery, local place research, and the evidence ledger all disappear. Qloo is the grounding layer rather than a cosmetic recommendation call.

## Product boundaries

Encore does not claim that a venue is available, a partner has agreed to participate, or cultural affinity predicts revenue. Sample mode is illustrative and never presented as live Qloo output.

## Submission status

See [testing status](docs/submission/TESTING-STATUS.md), [claims](CLAIMS.md), and the [rules ledger](docs/RULES-LEDGER.md).
