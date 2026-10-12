import test from "node:test";
import assert from "node:assert/strict";
import { buildDossier, composeConcepts, validateBrief } from "../src/agent.js";
import { createSampleResearch, sampleResearch } from "../src/sample.js";

const input={anchor:"Dune",city:"Lagos",audience:"Design-conscious young professionals",objective:"Create a memorable opening-weekend experience",budget:"Medium",format:"One-night pop-up",sampleMode:true};

test("brief validation preserves the permitted product inputs",()=>{ const brief=validateBrief(input); assert.equal(brief.city,"Lagos"); assert.equal(brief.sampleMode,true); });
test("brief validation rejects incomplete requests",()=>{ assert.throws(()=>validateBrief({anchor:"Dune"}),/Add an anchor/); });
test("agent composes exactly three strategy-distinct concepts",()=>{ const concepts=composeConcepts(validateBrief(input),sampleResearch,"sample"); assert.equal(concepts.length,3); assert.deepEqual(concepts.map(x=>x.strategy),["Closest fit","Cultural bridge","Plot twist"]); });
test("every concept keeps an inspectable evidence ledger",()=>{ const concepts=composeConcepts(validateBrief(input),sampleResearch,"sample"); assert.ok(concepts.every(x=>x.evidence.length>=2&&x.evidence.every(e=>e.id&&e.domain))); });
test("selected concept becomes a production dossier with limitations",()=>{ const brief=validateBrief(input); const concept=composeConcepts(brief,sampleResearch,"sample")[0]; const dossier=buildDossier({brief,concept}); assert.equal(dossier.partnerRoles.length,3); assert.match(dossier.limitations,/unverified/); });
test("sample research follows an edited brief without claiming Qloo evidence",()=>{ const brief=validateBrief({...input,anchor:"Nike",city:"Accra"}); const concepts=composeConcepts(brief,createSampleResearch(brief),"sample"); assert.match(concepts[0].title,/Nike/); assert.equal(concepts[0].venueNote,"Accra"); assert.doesNotMatch(concepts[0].whyItWorks,/Qloo connected/); });
test("flagship briefs do not promote cultural leads as venues",()=>{
  const brief=validateBrief({...input,budget:"Flagship",objective:"Find a headline-scale concert location"});
  const research={anchor:{id:"a",name:"Wizkid",domain:"artist"},domains:{place:[{id:"p",name:"Beat 99.9FM",domain:"place",address:"26 Keffi Street"}],brand:[{id:"b",name:"Pulse",domain:"brand"}],artist:[{id:"r",name:"Starboy",domain:"artist"}]}};
  const concepts=composeConcepts(brief,research,"live");
  assert.ok(concepts.every(concept=>concept.venue.startsWith("Major venue shortlist required")));
  assert.ok(concepts.every(concept=>concept.evidence.every(item=>item.name!=="Beat 99.9FM")));
});
test("flagship briefs reject culinary clubs even when metadata calls them performance venues",()=>{
  const brief=validateBrief({...input,budget:"Flagship",objective:"Design a flagship premiere"});
  const research={anchor:{id:"a",name:"Black Panther",domain:"movie"},domains:{place:[{id:"p",name:"SA Culinary Club",domain:"place",description:"Performance venue for private events",address:"Johannesburg"}],brand:[],artist:[]}};
  const concepts=composeConcepts(brief,research,"live");
  assert.ok(concepts.every(concept=>concept.venue.startsWith("Major venue shortlist required")));
  assert.ok(concepts.every(concept=>concept.evidence.every(item=>item.name!=="SA Culinary Club")));
});
test("headline-scale briefs reject nightclubs and ordinary performance venues",()=>{
  const brief=validateBrief({...input,budget:"Flagship",objective:"Plan a headline-scale homecoming concert"});
  const research={anchor:{id:"a",name:"Beyoncé",domain:"artist"},domains:{place:[{id:"p",name:"NOTO Houston",domain:"place",description:"Live music performance venue",address:"Houston"}],brand:[],artist:[]}};
  const concepts=composeConcepts(brief,research,"live");
  assert.ok(concepts.every(concept=>concept.venue.startsWith("Major venue shortlist required")));
});
