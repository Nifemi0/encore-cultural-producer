import test from "node:test";
import assert from "node:assert/strict";
import { clearQlooCache, entityList, normalizeEntity, resolveAnchor } from "../src/qloo.js";

test("entityList supports wrapped Qloo payloads",()=>{ assert.equal(entityList({data:{results:[{id:"1"}]}}).length,1); });
test("entityList supports live Insights payloads",()=>{ assert.equal(entityList({results:{entities:[{entity_id:"1"}]}}).length,1); });
test("normalizeEntity retains evidence fields",()=>{ const item=normalizeEntity({entity_id:"abc",name:"Venue",properties:{geocode:{name:"Lagos"}},query:{affinity:.91}},"place"); assert.deepEqual({id:item.id,name:item.name,address:item.address,affinity:item.affinity},{id:"abc",name:"Venue",address:"Lagos",affinity:.91}); });
test("anchor resolution selects an exact cross-domain match",async()=>{
  clearQlooCache();
  let calls=0;
  const fakeFetch=async()=>{ calls+=1; return {ok:true,json:async()=>({results:[{entity_id:"dune",name:"Dune",types:["urn:entity:movie"]}]})}; };
  const anchor=await resolveAnchor("Dune",{apiKey:"test",baseUrl:"https://example.test"},fakeFetch);
  assert.equal(anchor.id,"dune"); assert.equal(anchor.domain,"movie"); assert.equal(calls,1);
});

test("Qloo requests are cached by their complete URL",async()=>{
  clearQlooCache();
  let calls=0;
  const fakeFetch=async()=>{ calls+=1; return {ok:true,status:200,json:async()=>({results:[{entity_id:"wiz",name:"Wizkid",types:["urn:entity:artist"]}]})}; };
  const config={apiKey:"test",baseUrl:"https://cache.example.test",cacheTtlMs:60_000};
  await resolveAnchor("Wizkid",config,fakeFetch);
  await resolveAnchor("Wizkid",config,fakeFetch);
  assert.equal(calls,1);
});

test("Qloo retries a rate-limited request before succeeding",async()=>{
  clearQlooCache();
  let calls=0;
  const fakeFetch=async()=>{
    calls+=1;
    if(calls===1) return {ok:false,status:429,headers:{get:()=>"0"}};
    return {ok:true,status:200,json:async()=>({results:[{entity_id:"dune-retry",name:"Dune",types:["urn:entity:movie"]}]})};
  };
  const anchor=await resolveAnchor("Dune",{apiKey:"test",baseUrl:"https://retry.example.test",retryDelayMs:0},fakeFetch);
  assert.equal(anchor.id,"dune-retry");
  assert.equal(calls,2);
});
