# Title

Encore

## One-line Summary

Encore turns Qloo cultural affinity into three evidence-backed activation concepts and a verification-ready production dossier.

## Problem

Experiential producers need collaborations that feel culturally natural to an audience and specific to a city. Early research is fragmented across venues, artists, brands, audience assumptions, and search results. Generic recommendation tools can surface popular entities without explaining why they belong together or whether they fit the production brief.

## Solution

Encore is a Qloo-powered cultural research and activation-planning agent. A producer enters an artist, film, game, or brand together with a city, audience, objective, budget, format, and constraints. Encore resolves the anchor through Qloo Search, investigates related places, brands, and artists through Qloo Insights, and composes three deliberate routes: closest fit, cultural bridge, and plot twist.

Every route keeps its Qloo research evidence visible. Selecting a route creates an activation dossier containing the guest journey, possible partner roles, production priorities, limitations, and the checks a human producer must complete.

## Why This Matters

Creative teams need more than a list of recommendations. They need a defensible starting hypothesis that can be challenged, refined, and taken into production research. Encore shortens the path from an audience brief to a structured concept while preserving uncertainty and source evidence.

## How We Used AI

Qloo is the grounding layer of Encore's agentic workflow:

1. Qloo Search resolves the submitted cultural anchor across supported entity types.
2. Qloo Insights discovers related places in the requested city and related brands and artists.
3. Encore normalizes and ranks those entities for the requested event scale.
4. The composition agent assigns the evidence to three different creative strategies.
5. The selected strategy becomes a production dossier with explicit human-verification work.

Removing Qloo removes live anchor resolution, cultural affinity discovery, local place research, and the evidence ledger. The integration is central to the product rather than a decorative recommendation call.

## How We Used Codex

Codex helped shape the product thesis, implement the server and interface, integrate the Qloo hackathon API, build the evidence and dossier flow, redesign the landing experience, deploy the application, and run the verification loop. During testing, Codex exercised 100 sample scenarios and ten diverse live scenarios in Chrome, found rate-limit and stale-state failures, detected misleading venue classifications, and implemented caching, bounded retries, request deadlines, browser bundle versioning, and stricter flagship venue rules.

Codex also maintained the public documentation, claims ledger, testing evidence, Notion project record, and this submission draft. Human judgment was used to assess whether the returned collaborations matched the city, audience, scale, cultural context, and emotional intent.

## Key Features

- Structured creative brief covering anchor, city, audience, objective, budget, format, and constraints.
- Live Qloo Search and Insights integration with the event credential kept server-side.
- Three strategy-distinct concepts: closest fit, cultural bridge, and plot twist.
- Evidence ledger preserving entity IDs, domains, addresses, and available affinity fields.
- Venue classification that withholds unsuitable places from flagship briefs.
- Activation dossier with guest journey, research leads, production priorities, and limitations.
- Clearly labeled sample mode for reviewing the product without live Qloo claims.
- Qloo response caching, duplicate-request coalescing, retry handling, and deadlines.
- Responsive editorial interface with an animated three-dimensional hero.

## Architecture

Encore is a Node.js web application deployed on Vercel.

- `server.js` serves the interface and exposes concept, dossier, and status endpoints.
- `src/qloo.js` authenticates with the Qloo hackathon server, resolves anchors, calls Insights, normalizes entities, caches responses, and handles rate limits.
- `src/agent.js` validates briefs, classifies venue suitability, composes three concepts, preserves evidence, and builds the dossier.
- `public/app.js` manages the interactive brief, research trail, concept board, and dossier interface.
- Node's test runner verifies brief validation, evidence preservation, Qloo response shapes, caching, retries, venue rejection, and dossier creation.

The Qloo event credential is read from the server environment and is never sent to the browser.

## Testing Instructions

Requires Node.js 22 or newer.

```sh
git clone https://github.com/Nifemi0/encore-cultural-producer.git
cd encore-cultural-producer
npm install
copy .env.example .env
npm test
npm start
```

Add a valid `QLOO_API_KEY` to `.env` for live mode, then open `http://localhost:4174`. Without a key, select **Use sample evidence**.

The current automated suite passes 15 tests. The public build was also exercised through Chrome with ten live scenarios covering music, film, sport, and consumer platforms across Lagos, London, New York, Paris, Accra, Houston, Tokyo, Miami, Johannesburg, and Berlin.

## Public Demo Link

https://encore.nuvixes.studio

## Public Repository Link

https://github.com/Nifemi0/encore-cultural-producer

## Demo Video

No video has been recorded. The official rules inspected on October 13, 2026 require a functional demo link, public open-source repository, and text description; they do not list a video as a submission requirement. A short video remains optional if time permits.

Optional 90-second outline:

1. Explain why culturally credible collaborations are difficult to research.
2. Enter a live brief for Wizkid in Lagos.
3. Show Qloo resolving the anchor and returning cross-domain evidence.
4. Compare the three creative routes and their evidence.
5. Open the activation dossier and show the human-verification boundaries.
6. Close on the thesis: cultural affinity becomes an inspectable production hypothesis.

## Screenshot Shot List

Chrome captures reviewed on October 12, 2026: landing hero, live Wizkid concept board, and selected activation dossier. These captures are visible in the build session but have not been uploaded to Devpost.

1. Landing hero and Qloo-powered product thesis.
2. Completed creative brief before generation.
3. Three-direction concept board with live Qloo evidence and a major-venue fallback.
4. Activation dossier showing research leads and verification language.
5. Repository test output showing 15 passing tests.

## Submission Readiness Notes

The application and repository are public, Qloo is central to the live workflow, the setup path is documented, and the current test suite passes. The ten-scenario retest showed that raw affinity still needs human cultural judgment: two scenarios were promising, four were partially relevant, three required rejection or correction, and one broad anchor required a more precise film input.

Official Devpost pages were inspected in the authenticated Chrome session on October 13, 2026. Registration is confirmed for the `Nifemi0` account. An Encore project draft now exists at https://devpost.com/software/encore-gzfu9m and is complete through four of Devpost's five steps. The submission period closes October 30, 2026 at 11:45 p.m. ET, displayed locally as October 31, 2026 at 4:45 a.m. WAT. Judging runs from November 2 at 12:00 p.m. ET through November 16 at 11:45 p.m. ET, with winners expected around November 23 at 3:00 p.m. ET.

The official rules require a working Qloo-powered agentic project, functional demo link, public open-source repository containing source, assets, and setup instructions, a visible open-source licence, and a text description of features and functionality. The project must remain free and unrestricted through judging. Submission materials must be in English.

Stage one is a pass/fail check for viability and fit with the theme and Qloo API. Stage two weighs four criteria equally: technological implementation, design, potential impact, and quality of the idea. The current build directly addresses each criterion through its live Qloo workflow, polished interface, production-planning use case, evidence ledger, and explicit verification boundaries.

The project name, elevator pitch, Markdown story, technology tags, live application URL, public repository URL, start date, and new-project explanation are saved in the Devpost draft. The remaining optional quality work is a 3:2 thumbnail and gallery image. The final terms checkbox and **Submit project** button remain untouched pending final review and explicit approval.

## Known Limitations

- Qloo affinity does not prove operational suitability, rights availability, commercial interest, or audience demand.
- Some results are culturally adjacent but insufficiently local to the requested city.
- Competitor conflicts require stronger reranking; one test surfaced Real Madrid for an FC Barcelona brief.
- The deterministic composer can make weak raw evidence sound more coherent than it is, so human verification remains mandatory.
- Venue capacity, access, dates, licensing, price, and partner participation are not verified by Encore.
- Broad organization anchors may need a more precise artist, film, game, or brand entity.

## Remaining Submission Work

- Obtain explicit rules acknowledgement from the entrant.
- Decide whether to capture and upload a 3:2 product image as the thumbnail and gallery media.
- Recheck the saved Devpost preview and required answers.
- Review the completed draft against the four judging criteria.
- Obtain final approval immediately before the irreversible submission action.

### ⏳ Not submitted yet

Nothing has been sent to Devpost.

