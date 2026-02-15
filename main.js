// Doom Date™ — static-only viral astrology generator (no API)

window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error:", message, source, lineno, colno, error);
  // Ensure the loading screen is dismissed and result screen is shown
  const loader = document.getElementById("loader");
  const resultWrap = document.getElementById("resultWrap");
  if (loader) loader.classList.add("hidden");
  if (resultWrap) resultWrap.classList.remove("hidden");
  alert("치명적인 오류가 발생했습니다. 개발자 콘솔을 확인해주세요."); // User-friendly alert
  return true; // Prevent default browser error handling
};

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
const zodiacPreviewEl = $("zodiacPreview"); // Added by Gemini

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
  const currentYear = new Date().getFullYear();
  if (y < 1900 || y > currentYear) return false; // Year validation
  if(m<1||m>12||d<1||d>31) return false; // Month and Day basic validation
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

const zodiacTeasers = {
  Aries: {
    name_ko: "양자리", name_en: "Aries",
    prophecies: [
      "새로운 시작, 돈의 기회가 눈앞에 있습니다.",
      "관계의 충돌. 성급한 결정은 피하세요.",
      "다가올 불안: 모든 것을 통제할 수 없습니다."
    ]
  },
  Taurus: {
    name_ko: "황소자리", name_en: "Taurus",
    prophecies: [
      "재정적 안정, 그러나 새로운 투자는 신중하게.",
      "오랜 관계에서 숨겨진 불안이 드러날 수 있습니다.",
      "안정된 타이밍이 중요합니다. 서두르지 마세요."
    ]
  },
  Gemini: {
    name_ko: "쌍둥이자리", name_en: "Gemini",
    prophecies: [
      "새로운 아이디어가 돈으로 이어집니다.",
      "관계의 오해가 깊어질 수 있습니다. 소통이 중요.",
      "결정의 순간, 과도한 정보는 불안을 키웁니다."
    ]
  },
  Cancer: {
    name_ko: "게자리", name_en: "Cancer",
    prophecies: [
      "돈과 관련된 감정적인 결정은 피하세요.",
      "가족 관계에서 예상치 못한 불안이 생길 수 있습니다.",
      "다가올 타이밍: 마음의 준비가 필요합니다."
    ]
  },
  Leo: {
    name_ko: "사자자리", name_en: "Leo",
    prophecies: [
      "재정적 리더십, 그러나 과시욕은 독입니다.",
      "관계에서 인정받으려는 욕구가 불안을 만듭니다.",
      "중요한 결정, 당신의 본능을 믿으세요."
    ]
  },
  Virgo: {
    name_ko: "처녀자리", name_en: "Virgo",
    prophecies: [
      "돈 관리의 세부 사항, 작은 실수가 커집니다.",
      "관계에서 비판적인 태도는 불안을 증폭시킵니다.",
      "완벽한 타이밍은 없습니다. 시작이 중요합니다."
    ]
  },
  Libra: {
    name_ko: "천칭자리", name_en: "Libra",
    prophecies: [
      "공정한 거래가 돈의 흐름을 만듭니다.",
      "관계의 균형이 깨지면 불안이 찾아옵니다.",
      "중요한 결정, 모든 면을 고려하는 지혜."
    ]
  },
  Scorpio: {
    name_ko: "전갈자리", name_en: "Scorpio",
    prophecies: [
      "숨겨진 돈의 비밀, 재정적 재평가가 필요합니다.",
      "관계에서 깊은 불신이 불안을 초래할 수 있습니다.",
      "위기 속에서 결정을 내릴 타이밍을 잡으세요."
    ]
  },
  Sagittarius: {
    name_ko: "사수자리", name_en: "Sagittarius",
    prophecies: [
      "돈에 대한 새로운 관점, 그러나 과도한 낙관은 금물.",
      "관계에서 자유를 쫓다 소중한 것을 놓칠 수 있습니다.",
      "다가올 불안: 모든 질문에 답할 필요는 없습니다."
    ]
  },
  Capricorn: {
    name_ko: "염소자리", name_en: "Capricorn",
    prophecies: [
      "재정적 목표 달성, 그러나 고독을 경계하세요.",
      "관계에서 책임감이 불안으로 변할 수 있습니다.",
      "중요한 결정, 당신의 인내심이 시험대에 오릅니다."
    ]
  },
  Aquarius: {
    name_ko: "물병자리", name_en: "Aquarius",
    prophecies: [
      "돈과 관련된 혁신, 그러나 현실성을 잃지 마세요.",
      "관계에서 독립성이 오해를 부를 수 있습니다.",
      "불안한 타이밍: 기존 규칙을 깰 용기가 필요합니다."
    ]
  },
  Pisces: {
    name_ko: "물고기자리", name_en: "Pisces",
    prophecies: [
      "돈에 대한 환상, 현실과 이상을 구분하세요.",
      "관계에서 과도한 희생은 불안을 키웁니다.",
      "중요한 결정: 직관과 현실 사이의 균형."
    ]
  }
};

function getZodiacSign(month, day) {
  if (month === 3 && day >= 21 || month === 4 && day <= 19) return "Aries";
  if (month === 4 && day >= 20 || month === 5 && day <= 20) return "Taurus";
  if (month === 5 && day >= 21 || month === 6 && day <= 20) return "Gemini";
  if (month === 6 && day >= 21 || month === 7 && day <= 22) return "Cancer";
  if (month === 7 && day >= 23 || month === 8 && day <= 22) return "Leo";
  if (month === 8 && day >= 23 || month === 9 && day <= 22) return "Virgo";
  if (month === 9 && day >= 23 || month === 10 && day <= 22) return "Libra";
  if (month === 10 && day >= 23 || month === 11 && day <= 21) return "Scorpio";
  if (month === 11 && day >= 22 || month === 12 && day <= 21) return "Sagittarius";
  if (month === 12 && day >= 22 || month === 1 && day <= 19) return "Capricorn";
  if (month === 1 && day >= 20 || month === 2 && day <= 18) return "Aquarius";
  if (month === 2 && day >= 19 || month === 3 && day <= 20) return "Pisces";
  return "Unknown";
}


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
  const riskRaw = (d*13 + m*9) % 40; // 0-39
  const riskPercent = Math.min(100, Math.round((riskRaw / 39) * 100));
  const score = clamp(Math.round(base + (stability - riskRaw/2)), 0, 100);

  // Archetype (rare possibility)
  const arche = pickByWeight(rng, archetypes);

  // Doom date within next 45 days
  const now = new Date();
  const offset = Math.floor(rng()*45) + 3; // 3..47 days
  const doom = new Date(now.getTime() + offset*24*60*60*1000);

  // Trigger
  const trig = triggers[Math.floor(rng()*triggers.length)];

  // Zodiac-based personality teaser
  const zodiacEnglishName = getZodiacSign(m, d);
  console.log("getZodiacSign returned:", zodiacEnglishName, "for month:", m, "day:", d); // Debug log

  const zodiacInfo = zodiacTeasers[zodiacEnglishName] || zodiacTeasers["Aries"]; // Default to Aries if not found
  console.log("zodiacInfo after fallback:", zodiacInfo); // Debug log

  let preview = "유효한 날짜를 입력하여 개인화된 통찰력을 확인하세요."; // Fallback preview
  let zodiacSignDisplay = "알 수 없음 (Unknown)";

  if (zodiacInfo && zodiacInfo.prophecies) { // Ensure prophecies exist
    preview = zodiacInfo.prophecies.join("\n");
    zodiacSignDisplay = `${zodiacInfo.name_ko} (${zodiacInfo.name_en})`;
  } else {
    // Fallback if zodiac sign is "Unknown" or not found in zodiacTeasers or prophecies missing
    console.warn("Invalid zodiacInfo or missing prophecies. Using generic fallback."); // Debug warn
    preview = "유효한 날짜를 입력하여 개인화된 통찰력을 확인하세요.";
  }
  
  // Premium lists
  const avoid = shuffleWithRng([...avoidPool[trig.k]], rng).slice(0,3);
  const todo  = shuffleWithRng([...doPool[trig.k]], rng).slice(0,3);

  // Premium narrative
  const premium = buildPremiumNarrative(rng, {arche, trig, doom, score, avoid, todo});

  // Unlock code (deterministic but not obvious)
  const code = makeCode(y,m,d);

  return {seedStr, arche, trig, doom, score, riskPercent, preview, avoid, todo, premium, code, zodiacSignDisplay};
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
let countdownInterval;

function setPremiumLocked(){
  premiumOut.classList.add("hidden");
  avoidListEl.classList.add("blurred");
  doListEl.classList.add("blurred");
  // previewTextEl.classList.add("blurred"); // Removed blur
  countdownTimer.classList.remove("hidden");
}
function setPremiumUnlocked(){
  premiumOut.classList.remove("hidden");
  avoidListEl.classList.remove("blurred");
  doListEl.classList.remove("blurred");
  // previewTextEl.classList.remove("blurred"); // Removed blur
  countdownTimer.classList.add("hidden");
  if (countdownInterval) clearInterval(countdownInterval);
}

function renderResult(r){
  console.log("renderResult received:", r); // Debug log
  lastResult = r;

  typeLine.textContent = `${r.arche.name} • ${badgeText(r.arche)} • ${r.seedStr}`;
  console.log("Updating typeLine with:", typeLine.textContent); // Debug log

  scoreNum.textContent = r.score;
  console.log("Updating scoreNum with:", scoreNum.textContent); // Debug log

  riskNum.textContent = `${r.riskPercent}% Risk Window`;
  console.log("Updating riskNum with:", riskNum.textContent); // Debug log

  doomDateEl.textContent = formatDate(r.doom);
  console.log("Updating doomDateEl with:", doomDateEl.textContent); // Debug log

  doomNoteEl.textContent = (r.score < 40)
    ? "Low luck window. Don’t gamble."
    : (r.score < 70) ? "Mixed signals. Precision required." : "High power—but ego traps exist.";
  console.log("Updating doomNoteEl with:", doomNoteEl.textContent); // Debug log

  triggerEl.textContent = r.trig.k;
  console.log("Updating triggerEl with:", triggerEl.textContent); // Debug log

  triggerNoteEl.textContent = r.trig.note;
  console.log("Updating triggerNoteEl with:", triggerNoteEl.textContent); // Debug log

  previewTextEl.textContent = r.preview; // Now uses zodiac teaser
  console.log("Updating previewTextEl with:", previewTextEl.textContent); // Debug log

  zodiacPreviewEl.textContent = r.zodiacSignDisplay; // Update zodiac name in preview title
  console.log("Updating zodiacPreviewEl with:", zodiacPreviewEl.textContent); // Debug log

  // Premium lists (real content but blurred until unlock)
  avoidListEl.innerHTML = r.avoid.map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  console.log("Updating avoidListEl with:", avoidListEl.innerHTML); // Debug log

  doListEl.innerHTML = r.todo.map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  console.log("Updating doListEl with:", doListEl.innerHTML); // Debug log

  premiumText.textContent = r.premium;
  console.log("Updating premiumText with:", premiumText.textContent); // Debug log

  // Unlock persistence
  const unlocked = localStorage.getItem("dd_unlocked") === "1";
  if(unlocked){
    setPremiumUnlocked();
  } else {
    setPremiumLocked();
    startCountdown();
  }
  console.log("Unlock state updated."); // Debug log
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
    alert("유효한 생년월일(YYYY / MM / DD)을 입력하세요.");
    return;
  }
  loader.classList.remove("hidden");
  resultWrap.classList.add("hidden");

  try {
    // fake “AI scan” timing (viral feel)
    await wait(850 + Math.random()*450);

    const r = computeResult(y,m,d);
    console.log("computeResult returned:", r); // Debug log
    renderResult(r);

  } catch (error) {
    console.error("Error during scan process:", error); // Use console.error instead of alert
    // alert("스캔 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."); // Removed alert
    // Optionally, render a basic error message to the user
  } finally {
    loader.classList.add("hidden");
    resultWrap.classList.remove("hidden");
    // auto-scroll to result
    resultWrap.scrollIntoView({behavior:"smooth", block:"start"});
  }
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
  if(!lastResult){ alert("먼저 스캔을 실행하세요."); return; }
  const msg =
`방금 저의 둠 데이트를 찾았습니다: ${formatDate(lastResult.doom)} 😬
타입: ${lastResult.arche.name} (${badgeText(lastResult.arche)})
포춘 점수: ${lastResult.score}/100

${lastResult.preview}

당신의 둠 데이트를 찾아보세요: ${location.href}`;
  try{
    await navigator.clipboard.writeText(msg);
    alert("복사되었습니다. 스크린샷과 함께 게시하세요.");
  }catch{
    prompt("다음을 복사하세요:", msg);
  }
});

// Share card generation
cardBtn.addEventListener("click", ()=>{
  if(!lastResult){ alert("먼저 스캔을 실행하세요."); return; }
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
    ctx.shadowBlur = 15;
    ctx.shadowColor = baseColor;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = baseColor;

    // Draw stars
    for (const star of stars) {
      ctx.beginPath();
      ctx.globalAlpha = 0.6 + patternRng() * 0.4;
      ctx.arc(star.x, star.y, star.r * (0.8 + patternRng() * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

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

  // Free Preview Teaser on Card
  ctx.fillStyle = "rgba(233,236,255,0.65)";
  ctx.font = "800 22px ui-sans-serif, system-ui";
  ctx.fillText(`무료 미리보기 — ${r.zodiacSignDisplay}`, 120, 1000); // Title for teaser

  ctx.fillStyle = "rgba(233,236,255,0.78)";
  ctx.font = "600 26px ui-sans-serif, system-ui";
  wrapText(ctx, r.preview, 120, 1035, 820, 36); // Prophecy lines

  // footer watermark
  ctx.fillStyle = "rgba(233,236,255,0.55)";
  ctx.font = "700 22px ui-sans-serif, system-ui";
  ctx.fillText(`Try yours: ${stripQuery(location.href)}`, 120, 1250); // Adjusted footer position

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
  let currentY = y; // Use a local variable for Y position
  const lines = text.split('\n'); // Handle multiline input

  for(const l of lines) {
    const wordsInLine = l.split(" ");
    let buffer = "";
    for(let n=0; n<wordsInLine.length; n++){
      const testLine = buffer + wordsInLine[n] + " ";
      const metrics = ctx.measureText(testLine);
      if(metrics.width > maxWidth && n > 0){
        ctx.fillText(buffer.trim(), x, currentY);
        buffer = wordsInLine[n] + " ";
        currentY += lineHeight;
      } else {
        buffer = testLine;
      }
    }
    ctx.fillText(buffer.trim(), x, currentY);
    currentY += lineHeight;
  }
}

// Unlock handling
codeBtn.addEventListener("click", ()=>{
  if(!lastResult){
    alert("먼저 스캔을 실행하세요.");
    return;
  }
  const input = (codeInput.value || "").trim().toUpperCase();
  if(!input){
    alert("코드를 입력하세요.");
    return;
  }

  // Valid if matches deterministic code OR a master code you can rotate
  const master = "DD-2026";
  if(input === lastResult.code || input === master){
    localStorage.setItem("dd_unlocked","1");
    setPremiumUnlocked();
    alert("잠금 해제되었습니다.");
  } else {
    alert("잘못된 코드입니다.");
  }
});


// Auto-unlock if already saved
if(localStorage.getItem("dd_unlocked")==="1"){
  setPremiumUnlocked();
} else {
  setPremiumLocked();
}

// Initial scan on page load if parameters are present (e.g. from paid redirect)
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('paid') === 'true') {
    localStorage.setItem("dd_unlocked", "1");
    alert("결제가 완료되어 프리미엄 콘텐츠가 잠금 해제되었습니다!");
    // Clean the URL for aesthetic and to prevent re-triggering the paid status on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  if(localStorage.getItem("dd_unlocked")==="1"){
    setPremiumUnlocked();
  }
});
