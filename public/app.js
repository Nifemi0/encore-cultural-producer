const form = document.querySelector("#briefForm");
const submitButton = form.querySelector("button[type=submit]");
const sampleToggle = document.querySelector("#sampleMode");
const modeBadge = document.querySelector("#modeBadge");
const researchSection = document.querySelector("#researchSection");
const conceptSection = document.querySelector("#conceptSection");
const dossierSection = document.querySelector("#dossierSection");
const conceptGrid = document.querySelector("#conceptGrid");
const template = document.querySelector("#conceptTemplate");
const topbar = document.querySelector(".topbar");
const hero = document.querySelector(".hero");
let latestResult = null;
let latestDossier = null;

function updateScrollScene() {
  topbar.classList.toggle("is-scrolled", window.scrollY > 28);
  const travel = Math.max(hero.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max((window.scrollY - hero.offsetTop) / travel, 0), 1);
  const arrival = Math.min(progress / .42, 1);
  const departure = Math.max((progress - .42) / .58, 0);
  const easeArrival = 1 - Math.pow(1 - arrival, 3);
  hero.style.setProperty("--hero-progress", progress.toFixed(4));
  hero.style.setProperty("--hero-x", `${(18 * (1 - easeArrival) - 13 * departure).toFixed(2)}vw`);
  hero.style.setProperty("--hero-y", `${(8 * (1 - easeArrival) - 8 * departure).toFixed(2)}vh`);
  hero.style.setProperty("--hero-scale", (.78 + .28 * easeArrival + .35 * departure).toFixed(3));
  hero.style.setProperty("--hero-rotate", `${(3.5 * (1 - easeArrival) - 2 * departure).toFixed(2)}deg`);
  hero.style.setProperty("--hero-visual-opacity", (.46 + .54 * easeArrival).toFixed(3));
  hero.style.setProperty("--hero-blur", `${(5 * (1 - easeArrival)).toFixed(2)}px`);
  hero.style.setProperty("--hero-copy-y", `${(-8 * departure).toFixed(2)}vh`);
  hero.style.setProperty("--hero-copy-opacity", Math.max(1 - departure * 1.5, 0).toFixed(3));
}
window.addEventListener("scroll", updateScrollScene, { passive: true });
window.addEventListener("resize", updateScrollScene, { passive: true });
updateScrollScene();

async function json(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

async function loadStatus() {
  try {
    const status = await json("/api/status");
    modeBadge.textContent = status.qlooConfigured ? "Qloo live" : "Sample ready";
    sampleToggle.checked = !status.qlooConfigured;
  } catch { modeBadge.textContent = "Offline"; }
}

function setError(message) {
  form.querySelector(".error")?.remove();
  if (!message) return;
  const error = document.createElement("p"); error.className = "error"; error.textContent = message; form.append(error);
}

function renderConcepts(result) {
  conceptGrid.replaceChildren();
  for (const concept of result.concepts) {
    const node = template.content.cloneNode(true);
    node.querySelector(".strategy").textContent = concept.strategy;
    node.querySelector(".mode-pill").textContent = concept.mode === "live" ? "Qloo live" : "Sample evidence";
    node.querySelector(".evidence-block > p").textContent = concept.mode === "live" ? "Qloo evidence" : "Illustrative evidence";
    node.querySelector("h3").textContent = concept.title;
    node.querySelector(".hook").textContent = concept.hook;
    node.querySelector(".venue").textContent = `${concept.venue} · ${concept.venueNote}`;
    const experience = node.querySelector(".experience");
    concept.experience.forEach(item => { const p=document.createElement("p"); p.textContent=item; experience.append(p); });
    const evidenceList = node.querySelector(".evidence-list");
    concept.evidence.forEach(item => { const chip=document.createElement("span"); chip.className="evidence-chip"; chip.textContent=`${item.name} · ${item.domain}`; evidenceList.append(chip); });
    node.querySelector(".why").textContent = concept.whyItWorks;
    node.querySelector(".select-button").addEventListener("click", () => generateDossier(concept));
    conceptGrid.append(node);
  }
  conceptSection.classList.remove("hidden");
  conceptSection.scrollIntoView({ behavior:"smooth", block:"start" });
}

function renderTrail(result) {
  document.querySelector("#researchTitle").textContent = `${result.anchor.name}, reframed for ${result.brief.city}.`;
  document.querySelector("#researchMode").textContent = result.mode === "live" ? "Live Qloo evidence. Affinity informs the creative direction; feasibility still needs human verification." : "Sample mode demonstrates the product flow. These entities are illustrative and are not Qloo results.";
  const trail = document.querySelector("#trail"); trail.replaceChildren();
  result.trail.forEach((item,index) => { const li=document.createElement("li"); li.dataset.step=String(index+1).padStart(2,"0"); li.textContent=item; trail.append(li); });
  researchSection.classList.remove("hidden");
}

form.addEventListener("submit", async event => {
  event.preventDefault(); setError(""); dossierSection.classList.add("hidden"); conceptSection.classList.add("hidden");
  submitButton.disabled=true; submitButton.querySelector("span").textContent="Encore is investigating…";
  const data=Object.fromEntries(new FormData(form)); data.sampleMode=sampleToggle.checked;
  try { latestResult=await json("/api/concepts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)}); renderTrail(latestResult); renderConcepts(latestResult); }
  catch(error){ setError(error.message); }
  finally { submitButton.disabled=false; submitButton.querySelector("span").textContent="Generate three directions"; }
});

async function generateDossier(concept) {
  try {
    latestDossier=await json("/api/dossier",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({brief:latestResult.brief,concept})});
    const d=latestDossier;
    document.querySelector("#dossierContent").innerHTML=`<h2>${escapeHtml(d.title)}</h2><p class="thesis">${escapeHtml(d.thesis)}</p><div class="dossier-grid"><div><section class="dossier-section"><h4>Status</h4><p>${escapeHtml(d.status)}</p></section><section class="dossier-section"><h4>Brief</h4><p>${escapeHtml(d.brief.city)} · ${escapeHtml(d.brief.format)} · ${escapeHtml(d.brief.budget)}</p><p>${escapeHtml(d.brief.audience)}</p></section><section class="dossier-section"><h4>Limitations</h4><p>${escapeHtml(d.limitations)}</p></section></div><div><section class="dossier-section"><h4>Guest journey</h4><ul>${d.guestJourney.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section><section class="dossier-section"><h4>Partner roles</h4>${d.partnerRoles.map(x=>`<div class="evidence-row"><span>${escapeHtml(x.name)}<br><small>${escapeHtml(x.verification)}</small></span><b>${escapeHtml(x.role)}</b></div>`).join("")}</section><section class="dossier-section"><h4>Production priorities</h4><ul>${d.productionPriorities.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section></div></div>`;
    dossierSection.classList.remove("hidden"); dossierSection.scrollIntoView({behavior:"smooth",block:"start"});
  } catch(error){ setError(error.message); }
}

function escapeHtml(value){ return String(value).replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char])); }
document.querySelector("#copyDossier").addEventListener("click", async()=>{ if(!latestDossier)return; await navigator.clipboard.writeText(JSON.stringify(latestDossier,null,2)); document.querySelector("#copyDossier").textContent="Copied"; setTimeout(()=>document.querySelector("#copyDossier").textContent="Copy brief",1200); });
loadStatus();
