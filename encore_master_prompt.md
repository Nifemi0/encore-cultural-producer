# Encore — Master Build Prompt

## Context

Encore is a cultural collaboration agent built for the Qloo Agentic Hackathon, which closes October 30, 2026 at 11:45 p.m. Eastern Time (October 31 at 4:45 a.m. WAT) and offers $25,000 in cash prizes.

> **Make the collaboration nobody saw coming.**

## Problem

Creative producers spend days moving between cultural research, local discovery, and concept writing. Generic language models can make attractive pitches but cannot ground local partner choices in a cultural affinity graph. The result is often polished but interchangeable.

## What we ship

1. **Concept board** — A producer supplies an anchor property, city, audience, and objective. Encore uses Qloo to investigate places, brands, and artists, then creates three distinct collaboration directions with inspectable evidence.
2. **Activation dossier** — The producer selects one direction and receives a production brief covering the guest journey, partner roles, production priorities, promotional angles, evidence, and unresolved feasibility work.

## Why this wins

- Qloo asks for the use case where cultural intelligence separates “technically functional” from “actually good.” Encore makes cultural evidence determine the collaborators and the experience.
- Qloo is central: removing it removes resolution, discovery, local grounding, and evidence.
- The product maps directly to technological implementation, design, potential impact, and quality of idea.

## Stack

- Node.js 22 HTTP server with no runtime packages.
- Server-side Qloo Search and Insights requests.
- Responsive HTML, CSS, and JavaScript product interface.
- Node test runner with fixture-based contract tests.

## Acceptance criteria

- [x] Brief-to-three-concepts flow works in labeled sample mode.
- [x] Selected concept becomes an activation dossier.
- [x] Qloo credentials remain server-side.
- [x] Every concept retains an evidence ledger.
- [x] Automated tests cover validation, strategy diversity, evidence retention, dossier creation, and Qloo normalization.
- [ ] Live Qloo event key tested end-to-end.
- [ ] Public deployment responds without private access.
- [ ] Public repository has an About-visible open-source license.

## Hard rules

- Two primary features only.
- Sample evidence is always labeled.
- Never present affinity as demand prediction.
- Never claim that venues or partners are available or participating without verification.
