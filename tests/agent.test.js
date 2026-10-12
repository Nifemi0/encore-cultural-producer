import test from "node:test";
import assert from "node:assert/strict";
import { buildDossier, composeConcepts, validateBrief } from "../src/agent.js";
import { createSampleResearch, sampleResearch } from "../src/sample.js";

const input={anchor:"Dune",city:"Lagos",audience:"Design-conscious young professionals",objective:"Create a memorable opening-weekend experience",budget:"Medium",format:"One-night pop-up",sampleMode:true};

test("brief validation preserves the permitted product inputs",()=>{ const brief=validateBrief(input); assert.equal(brief.city,"Lagos"); assert.equal(brief.sampleMode,true); });
test("brief validation rejects incomplete requests",()=>{ assert.throws(()=>validateBrief({anchor:"Dune"}),/Add an anchor/); });
test("agent composes exactly three strategy-distinct concepts",()=>{ const concepts=composeConcepts(validateBrief(input),sampleResearch,"sample"); assert.equal(concepts.length,3); assert.deepEqual(concepts.map(x=>x.strategy),["Closest fit","Cultural bridge","Plot twist"]); });
test("every concept keeps an inspectable evidence ledger",()=>{ const concepts=composeConcepts(validateBrief(input),sampleResearch,"sample"); assert.ok(concepts.every(x=>x.evidence.length===3&&x.evidence.every(e=>e.id&&e.domain))); });
test("selected concept becomes a production dossier with limitations",()=>{ const brief=validateBrief(input); const concept=composeConcepts(brief,sampleResearch,"sample")[0]; const dossier=buildDossier({brief,concept}); assert.equal(dossier.partnerRoles.length,3); assert.match(dossier.limitations,/unverified/); });
test("sample research follows an edited brief without claiming Qloo evidence",()=>{ const brief=validateBrief({...input,anchor:"Nike",city:"Accra"}); const concepts=composeConcepts(brief,createSampleResearch(brief),"sample"); assert.match(concepts[0].title,/Nike/); assert.equal(concepts[0].venueNote,"Accra"); assert.doesNotMatch(concepts[0].whyItWorks,/Qloo connected/); });
