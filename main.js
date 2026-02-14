// Doom Date™ — static-only viral astrology generator (no API)

const $ = (id) => document.getElementById(id);

const yy = $("yy"), mm = $("mm"), dd = $("dd");
const scanBtn = $("scanBtn"), randomBtn = $("randomBtn");
const loader = $("loader");
const resultWrap = $("resultWrap");

const typeLine = $("typeLine");
const scoreNum = $("scoreNum");
const doomDateEl = $("doomDate");
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

// TODO: replace with your PayPal / Stripe checkout link
payLink.href = "https://www.paypal.com"; // placeholder

// --- Seeded RNG (deterministic per birthdate) ---
function xmur3(str){
  let h = 1779033703 ^ str.length;
  for (let i=0;i<str.length;i++){
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function(){
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= (h >>> 16)) >>> 0;
  };
}
function sfc32(a,b,c,d){
  return function(){
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}
function seededRand(seedStr){
  const seed = xmur3(seedStr);
  return sfc32(seed(), seed(), seed(), seed());
}
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function validDate(y,m,d){
  if(!y||!m||!d) return false;
  if(m<1||m>12||d<1||d>31) return false;
  const dt = new Date(y, m-1, d);
  return dt.getFullYear()===y && dt.getMonth()===(m-1) && dt.getDate()===d;
}

// --- Archetypes (include rare badges) ---
const archetypes = [
  {name:"Velvet Strategist", vibe:"status + precision", rarity:12},
  {name:"Neon Empath", vibe:"intuition + bonds", rarity:12},
  {name:"Shadow Operator", vibe:"control + timing", rarity:10},
  {name:"Gold Rush Mind", vibe:"money instincts", rarity:10},
  {name:"Silent Dominator", vibe:"calm power", rarity:9},
  {name:"Chaos Alchemist", vibe:"risk → reward", rarity:9},
  {name:"Mirror Charmer", vibe:"social gravity", rarity:8},
  {name:"Cold Reader", vibe:"pattern sniper", rarity:8},
  {name:"Steel Romantic", vibe:"loyal but lethal", rarity:7},
  {name:"Signal Hacker", vibe:"opportunity radar", rarity:7},
  {name:"Ghost Builder", vibe:"long-game creator", rarity:6},
  {name:"Night Guardian", vibe:"protection mode", rarity:6},
  // rare
  {name:"VOID TIER: Black Halo", vibe:"rare anomaly", rarity:2},
  {name:"MYTHIC: Celestial Glitch", vibe:"ultra-rare", rarity:1},
];

const triggers = [
  {k:"Money", note:"high chance of impulse spending or bad terms"},
  {k:"Love", note:"misread signals; jealousy / over-attachment risk"},
  {k:"Career", note:"ego clash; timing mistakes get punished"},
  {k:"Health", note:"sleep debt → mood spiral; don’t overpush"},
];

const previewLines = [
  "Your pattern: you win when you move quietly, then strike publicly.",
  "The universe isn’t blocking you — it’s filtering who deserves access to you.",
  "Your luck spikes after you cut one draining habit (or person).",
  "You’re not unlucky. You’re just early — and early looks like failure.",
  "You have ‘magnet weeks’ where people offer help without asking.",
  "Your biggest enemy isn’t fate. It’s rushing when your timing is wrong."
];

const avoidPool = {
  Money:[
    "Signing anything fast (especially ‘limited time’ deals)",
    "Buying expensive ‘solution’ products when emotional",
    "Lending money / fronting costs for friends"
  ],
  Love:[
    "Double-text spirals / checking phones / testing loyalty",
    "Confessing feelings on a high-stress day",
    "Reopening old drama ‘for closure’"
  ],
  Career:[
    "Arguing with authority in public channels",
    "Launching without a checklist (missing one key detail)",
    "Taking on extra work to ‘prove’ yourself"
  ],
  Health:[
    "Caffeine late afternoon (sleep wrecks your week)",
    "Skipping meals then bingeing at night",
    "Hard workouts when you’re already depleted"
  ]
};

const doPool = {
  Money:[
    "Delay purchases by 24 hours; only buy if still calm",
    "Negotiate: ask for 10% more / 10% less risk",
    "Track 3 days of spending — cut the leak"
  ],
  Love:[
    "Keep messages simple; ask one clear question",
    "Plan one ‘quality’ meetup instead of constant texting",
    "Set a boundary: no emotional talks after midnight"
  ],
  Career:[
    "Ship one small win daily (momentum beats perfection)",
    "Write your ‘no list’ — decline 1 low-value task",
    "Document everything (you’ll need receipts)"
  ],
  Health:[
    "Sleep first: 7.5h for 3 nights = mood reset",
    "20 min walk sunlight + water (fixes your baseline)",
    "Stretch 10 minutes before bed — nervous system downshift"
  ]
};

function pickByWeight(rng, arr){
  const total = arr.reduce((s,a)=>s+a.rarity,0);
  let roll = rng()*total;
  for(const a of arr){
    roll -= a.rarity;
    if(roll<=0) return a;
  }
  return arr[0];
}

function formatDate(d){
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function computeResult(y,m,d){
  const seedStr = `${y}-${m}-${d}`;
  const rng = seededRand(seedStr);

  // Score
  const base = (y*3 + m*11 + d*7) % 100;
  const stability = (m*d + y) % 30;
  const risk = (d*13 + m*9) % 40;
  const score = clamp(Math.round(base + (stability - risk/2)), 0, 100);

  // Archetype (rare possibility)
  const arche = pickByWeight(rng, archetypes);

  // Doom date within next 45 days
  const now = new Date();
  const offset = Math.floor(rng()*45) + 3; // 3..47 days
  const doom = new Date(now.getTime() + offset*24*60*60*1000);

  // Trigger
  const trig = triggers[Math.floor(rng()*triggers.length)];

  // Preview text
  const preview = previewLines[Math.floor(rng()*previewLines.length)];

  // Premium lists
  const avoid = shuffleWithRng([...avoidPool[trig.k]], rng).slice(0,3);
  const todo  = shuffleWithRng([...doPool[trig.k]], rng).slice(0,3);

  // Premium narrative
  const premium = buildPremiumNarrative(rng, {arche, trig, doom, score, avoid, todo});

  // Unlock code (deterministic but not obvious)
  const code = makeCode(y,m,d);

  return {seedStr, arche, trig, doom, score, preview, avoid, todo, premium, code};
}

function shuffleWithRng(arr, rng){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(rng()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeCode(y,m,d){
  // Simple deterministic code: DD + (year sum) + month key
  const ys = String(y).split("").reduce((a,c)=>a+Number(c),0);
  const k = (ys*7 + m*13 + d*11) % 10000;
  return `DD-${String(k).padStart(4,"0")}`;
}

function buildPremiumNarrative(rng, ctx){
  const lines = [];
  const doomStr = formatDate(ctx.doom);

  const dangerLine = [
    `On ${doomStr}, your ${ctx.trig.k.toLowerCase()} trigger peaks. If you act fast, you lose leverage.`,
    `Your Doom Date (${doomStr}) isn’t “bad luck” — it’s a timing trap. Slow down and you win.`,
    `That week around ${doomStr} is a filter: it punishes shortcuts and rewards calm execution.`
  ][Math.floor(rng()*3)];

  const archeLine = [
    `Archetype: ${ctx.arche.name}. Your advantage is ${ctx.arche.vibe}.`,
    `${ctx.arche.name} energy: when you commit, reality moves. But only if you don’t rush.`,
    `You’re ${ctx.arche.name}. You’re built for late wins, not early panic.`
  ][Math.floor(rng()*3)];

  lines.push(dangerLine);
  lines.push(archeLine);
  lines.push("");
  lines.push("AVOID:");
  ctx.avoid.forEach((a,i)=> lines.push(`${i+1}) ${a}`));
  lines.push("");
  lines.push("DO:");
  ctx.todo.forEach((t,i)=> lines.push(`${i+1}) ${t}`));
  lines.push("");
  lines.push("Micro-rule:");
  lines.push([
    "If you feel urgency, wait 2 hours. Urgency is the trap.",
    "If it feels like ‘now or never’, it’s usually ‘never’.",
    "Your win condition: calm + receipts + one decisive move."
  ][Math.floor(rng()*3)]);

  return lines.join("\n");
}

// --- UI ---
let lastResult = null;

function setPremiumLocked(){
  premiumOut.classList.add("hidden");
  avoidListEl.classList.add("blurred");
  doListEl.classList.add("blurred");
}
function setPremiumUnlocked(){
  premiumOut.classList.remove("hidden");
  avoidListEl.classList.remove("blurred");
  doListEl.classList.remove("blurred");
}

function renderResult(r){
  lastResult = r;

  typeLine.textContent = `${r.arche.name} • ${badgeText(r.arche)} • ${r.seedStr}`;
  scoreNum.textContent = r.score;
  doomDateEl.textContent = formatDate(r.doom);
  doomNoteEl.textContent = (r.score < 40)
    ? "Low luck window. Don’t gamble."
    : (r.score < 70) ? "Mixed signals. Precision required." : "High power—but ego traps exist.";

  triggerEl.textContent = r.trig.k;
  triggerNoteEl.textContent = r.trig.note;

  previewTextEl.textContent = r.preview;

  // Premium lists (real content but blurred until unlock)
  avoidListEl.innerHTML = r.avoid.map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  doListEl.innerHTML = r.todo.map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  premiumText.textContent = r.premium;

  // Pay link tweak could include the code in URL fragment for manual tracking (optional)
  // payLink.href = `https://your-pay-link.example/#${encodeURIComponent(r.code)}`;

  // Unlock persistence
  const unlocked = localStorage.getItem("dd_unlocked") === "1";
  if(unlocked){
    setPremiumUnlocked();
  } else {
    setPremiumLocked();
  }
}

function badgeText(arche){
  if(arche.name.includes("MYTHIC")) return "MYTHIC BADGE ✦";
  if(arche.name.includes("VOID")) return "VOID BADGE ⛧";
  return "STANDARD";
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

async function scan(){
  const y = Number(yy.value), m = Number(mm.value), d = Number(dd.value);
  if(!validDate(y,m,d)){
    alert("Enter a valid birth date (YYYY / MM / DD).");
    return;
  }
  loader.classList.remove("hidden");
  resultWrap.classList.add("hidden");

  // fake “AI scan” timing (viral feel)
  await wait(850 + Math.random()*450);

  const r = computeResult(y,m,d);
  loader.classList.add("hidden");
  resultWrap.classList.remove("hidden");
  renderResult(r);

  // auto-scroll to result
  resultWrap.scrollIntoView({behavior:"smooth", block:"start"});
}

function wait(ms){ return new Promise(res=>setTimeout(res, ms)); }

randomBtn.addEventListener("click", ()=>{
  const y = 1980 + Math.floor(Math.random()*35);
  const m = 1 + Math.floor(Math.random()*12);
  const d = 1 + Math.floor(Math.random()*28);
  yy.value = y; mm.value = m; dd.value = d;
  scan();
});
scanBtn.addEventListener("click", scan);

// Copy share text
copyBtn.addEventListener("click", async ()=>{
  if(!lastResult){ alert("Run a scan first."); return; }
  const msg =
`I just found my Doom Date: ${formatDate(lastResult.doom)} 😬
Type: ${lastResult.arche.name} (${badgeText(lastResult.arche)})
Fortune Score: ${lastResult.score}/100

Try yours: ${location.href}`;
  try{
    await navigator.clipboard.writeText(msg);
    alert("Copied. Post it with a screenshot.");
  }catch{
    prompt("Copy this:", msg);
  }
});

// Share card generation
cardBtn.addEventListener("click", ()=>{
  if(!lastResult){ alert("Run a scan first."); return; }
  drawCard(lastResult);
});

function drawCard(r){
  const ctx = canvas.getContext("2d");
  canvas.classList.remove("hidden");
  downloadLink.classList.remove("hidden");

  // seeded RNG for consistent constellation patterns on the card
  const cardRng = seededRand(r.seedStr + "card");

  // background
  ctx.fillStyle = "#07070b";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // glow
  const g1 = ctx.createRadialGradient(220,180,10,220,180,520);
  g1.addColorStop(0,"rgba(138,125,255,0.35)");
  g1.addColorStop(1,"rgba(138,125,255,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const g2 = ctx.createRadialGradient(860,260,10,860,260,520);
  g2.addColorStop(0,"rgba(0,229,255,0.25)");
  g2.addColorStop(1,"rgba(0,229,255,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // --- Draw Constellations ---
  // Helper function to draw a single constellation pattern
  function drawConstellationPattern(patternRng, centerX, centerY, scale, baseColor) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);

    const stars = [
      {x: 0, y: 0, r: 2},
      {x: 20 + patternRng()*10, y: 30 + patternRng()*10, r: 1.5},
      {x: -25 - patternRng()*10, y: 25 + patternRng()*10, r: 1.8},
      {x: 10 + patternRng()*10, y: -40 - patternRng()*10, r: 1.2},
      {x: -30 - patternRng()*10, y: -10 - patternRng()*10, r: 1.3},
      {x: 40 + patternRng()*10, y: 10 + patternRng()*10, r: 1.6},
      {x: -15 - patternRng()*10, y: -35 - patternRng()*10, r: 1.1},
    ];

    ctx.fillStyle = baseColor;
    ctx.shadowBlur = 15; // Enhanced glow
    ctx.shadowColor = baseColor;
    ctx.lineWidth = 1.5; // Thicker lines
    ctx.strokeStyle = baseColor;

    // Draw stars
    for (const star of stars) {
      ctx.beginPath();
      // Vary size and opacity for a twinkling/glowing effect on static image
      ctx.globalAlpha = 0.6 + patternRng() * 0.4; // Random opacity
      ctx.arc(star.x, star.y, star.r * (0.8 + patternRng() * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1; // Reset alpha

    // Connect stars (simple pattern)
    ctx.beginPath();
    ctx.moveTo(stars[0].x, stars[0].y);
    ctx.lineTo(stars[1].x, stars[1].y);
    ctx.lineTo(stars[2].x, stars[2].y);
    ctx.moveTo(stars[0].x, stars[0].y);
    ctx.lineTo(stars[3].x, stars[3].y);
    ctx.lineTo(stars[4].x, stars[4].y);
    ctx.stroke();

    ctx.restore();
  }

  // Draw multiple constellation patterns across the canvas
  drawConstellationPattern(seededRand(cardRng()*1000), canvas.width * 0.2, canvas.height * 0.2, 1.2, "rgba(255,255,255,0.7)");
  drawConstellationPattern(seededRand(cardRng()*1000), canvas.width * 0.7, canvas.height * 0.3, 1.0, "rgba(255,255,255,0.6)");
  drawConstellationPattern(seededRand(cardRng()*1000), canvas.width * 0.4, canvas.height * 0.6, 1.1, "rgba(255,255,255,0.8)");
  drawConstellationPattern(seededRand(cardRng()*1000), canvas.width * 0.8, canvas.height * 0.8, 0.9, "rgba(255,255,255,0.5)");
  drawConstellationPattern(seededRand(cardRng()*1000), canvas.width * 0.1, canvas.height * 0.9, 1.3, "rgba(255,255,255,0.75)");


  // card panel
  roundRect(ctx, 70, 110, 940, 1100, 40, "rgba(15,16,24,0.92)", "rgba(255,255,255,0.10)");

  // title
  ctx.fillStyle = "#e9ecff";
  ctx.font = "900 64px ui-sans-serif, system-ui";
  ctx.fillText("DOOM DATE™", 120, 210);

  ctx.fillStyle = "rgba(233,236,255,0.72)";
  ctx.font = "600 26px ui-sans-serif, system-ui";
  ctx.fillText("Astrology Scan • Screenshot this", 120, 255);

  // score
  ctx.fillStyle = "rgba(233,236,255,0.65)";
  ctx.font = "700 22px ui-sans-serif, system-ui";
  ctx.fillText("Fortune Score", 120, 340);

  ctx.fillStyle = "#e9ecff";
  ctx.font = "900 120px ui-sans-serif, system-ui";
  ctx.fillText(String(r.score), 120, 455);

  // doom date
  ctx.fillStyle = "rgba(233,236,255,0.65)";
  ctx.font = "800 22px ui-sans-serif, system-ui";
  ctx.fillText("Your Doom Date", 120, 525);

  ctx.fillStyle = "#ff4d6d";
  ctx.font = "900 58px ui-sans-serif, system-ui";
  ctx.fillText(formatDate(r.doom), 120, 590);

  // archetype
  ctx.fillStyle = "rgba(233,236,255,0.65)";
  ctx.font = "800 22px ui-sans-serif, system-ui";
  ctx.fillText("Archetype", 120, 670);

  ctx.fillStyle = "#e9ecff";
  ctx.font = "900 46px ui-sans-serif, system-ui";
  wrapText(ctx, `${r.arche.name}`, 120, 720, 820, 52);

  // trigger
  ctx.fillStyle = "rgba(233,236,255,0.65)";
  ctx.font = "800 22px ui-sans-serif, system-ui";
  ctx.fillText("Main Trigger", 120, 840);

  ctx.fillStyle = "#00e5ff";
  ctx.font = "900 44px ui-sans-serif, system-ui";
  ctx.fillText(r.trig.k.toUpperCase(), 120, 895);

  ctx.fillStyle = "rgba(233,236,255,0.78)";
  ctx.font = "600 26px ui-sans-serif, system-ui";
  wrapText(ctx, r.trig.note, 120, 940, 820, 36);

  // footer watermark
  ctx.fillStyle = "rgba(233,236,255,0.55)";
  ctx.font = "700 22px ui-sans-serif, system-ui";
  ctx.fillText(`Try yours: ${stripQuery(location.href)}`, 120, 1160);

  // download
  const url = canvas.toDataURL("image/png");
  downloadLink.href = url;
}

function stripQuery(url){
  try{
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.toString();
  }catch{
    return url;
  }
}

function roundRect(ctx,x,y,w,h,r,fill,stroke){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(" ");
  let line = "";
  for(let n=0;n<words.length;n++){
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if(metrics.width > maxWidth && n > 0){
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// Unlock handling
codeBtn.addEventListener("click", ()=>{
  if(!lastResult){
    alert("Run a scan first.");
    return;
  }
  const input = (codeInput.value || "").trim().toUpperCase();
  if(!input){
    alert("Enter a code.");
    return;
  }

  // Valid if matches deterministic code OR a master code you can rotate
  const master = "DD-2026";
  if(input === lastResult.code || input === master){
    localStorage.setItem("dd_unlocked","1");
    setPremiumUnlocked();
    alert("Unlocked.");
  } else {
    alert("Invalid code.");
  }
});

// Auto-unlock if already saved
if(localStorage.getItem("dd_unlocked")==="1"){
  setPremiumUnlocked();
} else {
  setPremiumLocked();
}
