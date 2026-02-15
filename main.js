// Doom Date™ — static-only viral astrology generator (no API)

const $ = (id) => document.getElementById(id);

const yy = $("yy"), mm = $("mm"), dd = $("dd");
const scanBtn = $("scanBtn"), randomBtn = $("randomBtn");
const loader = $("loader");
const resultWrap = $("resultWrap");

const typeLine = $("typeLine");
const scoreNum = $("scoreNum");
const riskNum = $("riskNum");
const doomDateEl = $("doomDate");
const countdownTimer = $("countdownTimer");
const doomNoteEl = $("doomNote");
const triggerEl = $("trigger");
const triggerNoteEl = $("triggerNote");
const previewTextEl = $("previewText");

const avoidListEl = $("avoidList");
const doListEl = $("doList");
const premiumOut = $("premiumOut");
const premiumText = $("premiumText");

const copyBtn = $("copyBtn");
const cardBtn = $("cardBtn");
const canvas = $("cardCanvas");
const downloadLink = $("downloadLink");

const codeInput = $("codeInput");
const codeBtn = $("codeBtn");
const payLink = $("payLink");

// --- Simplified Functions (for testing UI transition) ---

// Dummy computeResult for now
function computeResult(y,m,d){
  return {
    seedStr: "TEST-SEED",
    arche: {name: "Test Archetype", vibe: "test vibe"},
    trig: {k: "Test Trigger", note: "Test note for trigger"},
    doom: new Date(),
    score: 50,
    riskPercent: 25,
    preview: "This is a placeholder preview for your personalized insights.",
    avoid: ["Avoid Placeholder 1", "Avoid Placeholder 2", "Avoid Placeholder 3"],
    todo: ["Do Placeholder 1", "Do Placeholder 2", "Do Placeholder 3"],
    premium: "This is a placeholder premium narrative.",
    code: "DD-0000"
  };
}

// Dummy renderResult for now
function renderResult(r){
  typeLine.textContent = `${r.arche.name} • ${r.seedStr}`;
  scoreNum.textContent = r.score;
  riskNum.textContent = `${r.riskPercent}% Risk Window`;
  doomDateEl.textContent = new Date().toLocaleDateString(); // Placeholder date
  doomNoteEl.textContent = r.doomNote || "Placeholder doom note.";

  triggerEl.textContent = r.trig.k;
  triggerNoteEl.textContent = r.trig.note;

  previewTextEl.textContent = r.preview;

  avoidListEl.innerHTML = r.avoid.map(x=>`<li>${x}</li>`).join("");
  doListEl.innerHTML = r.todo.map(x=>`<li>${x}</li>`).join("");
  premiumText.textContent = r.premium;
}

// --- UI ---
let lastResult = null;
let countdownInterval;

function setPremiumLocked(){
  premiumOut.classList.add("hidden");
  avoidListEl.classList.add("blurred");
  doListEl.classList.add("blurred");
  countdownTimer.classList.remove("hidden");
}
function setPremiumUnlocked(){
  premiumOut.classList.remove("hidden");
  avoidListEl.classList.remove("blurred");
  doListEl.classList.remove("blurred");
  countdownTimer.classList.add("hidden");
  if (countdownInterval) clearInterval(countdownInterval);
}

// Simplified scan function
async function scan(){
  loader.classList.remove("hidden");
  resultWrap.classList.add("hidden");

  setTimeout(() => {
    loader.classList.add("hidden");
    resultWrap.classList.remove("hidden");

    // Dummy result for now
    const r = computeResult(1990, 6, 15); // Use dummy date for computeResult

    renderResult(r); // Render dummy result
    resultWrap.scrollIntoView({behavior:"smooth", block:"start"});
  }, 2000); // Exactly 2 seconds delay
}

scanBtn.addEventListener("click", scan);

// Simplified randomBtn and other event listeners (removed complex logic for now)
randomBtn.addEventListener("click", ()=>{
  yy.value = 1990; mm.value = 6; dd.value = 15; // Set dummy date
  scan();
});

copyBtn.addEventListener("click", async ()=>{
  alert("Copy functionality disabled in simplified mode.");
});

cardBtn.addEventListener("click", ()=>{
  alert("Card generation disabled in simplified mode.");
});

codeBtn.addEventListener("click", ()=>{
  alert("Code unlock disabled in simplified mode.");
});

// Auto-unlock removed in simplified mode
// if(localStorage.getItem("dd_unlocked")==="1"){
//   setPremiumUnlocked();
// } else {
//   setPremiumLocked();
// }

// Keeping existing functions that are not directly involved in scan logic, but simplifying their content if they depend on complex astrology.
function xmur3(str){ /* dummy */ return () => 0.5; }
function sfc32(a,b,c,d){ /* dummy */ return () => 0.5; }
function seededRand(seedStr){ /* dummy */ return () => 0.5; }
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function validDate(y,m,d){ return true; } // Always true for simplified version
function shuffleWithRng(arr, rng){ return arr; }
function makeCode(y,m,d){ return "DD-SIMP"; }
function buildPremiumNarrative(rng, ctx){ return "Simplified premium narrative."; }
function badgeText(arche){ return "SIMPLIFIED"; }
function escapeHtml(str){ return str; }
function wait(ms){ return new Promise(res=>setTimeout(res, ms)); }
function drawCard(r){ /* dummy */ alert("Card drawing disabled in simplified mode."); }
function stripQuery(url){ return "simplified.url"; }

// Removed unused constants and logic
// const archetypes = [...];
// const triggers = [...];
// const zodiacTeasers = {...};
// const previewLines = [...];
// const avoidPool = {...};
// const doPool = {...};
