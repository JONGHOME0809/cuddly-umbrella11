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

const countdownTimer = $("countdownTimer");
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

const avoidPool = {
  Money: [
    "충동 구매",
    "예상치 못한 투자",
    "무리한 대출",
    "가치 없는 할인",
    "지인에게 돈 빌려주기"
  ],
  Love: [
    "상대방의 오해",
    "관계에 대한 조급함",
    "과도한 집착",
    "사소한 거짓말",
    "과거 관계 미련"
  ],
  Career: [
    "동료와의 불화",
    "상사의 지시 무시",
    "지나친 경쟁심",
    "새로운 기회에 대한 두려움",
    "현실 안주"
  ],
  Health: [
    "수면 부족",
    "과도한 스트레스",
    "불규칙한 식사",
    "운동 부족",
    "나쁜 자세"
  ]
};

const doPool = {
  Money: [
    "저축 계획 세우기",
    "불필요한 지출 줄이기",
    "재정 상태 점검",
    "현명한 투자처 물색",
    "부수입 창출"
  ],
  Love: [
    "진심으로 소통하기",
    "상대방 존중하기",
    "함께 시간 보내기",
    "서로의 공간 존중",
    "작은 선물로 마음 표현"
  ],
  Career: [
    "새로운 기술 습득",
    "네트워킹 강화",
    "업무 효율성 높이기",
    "멘토 찾기",
    "장기적인 목표 설정"
  ],
  Health: [
    "규칙적인 수면",
    "명상 및 휴식",
    "건강한 식단 유지",
    "꾸준한 운동",
    "정기 건강 검진"
  ]
};

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
  const zodiacInfo = zodiacTeasers[zodiacEnglishName] || zodiacTeasers["Aries"]; // Default to Aries if not found

  let previewText = "유효한 날짜를 입력하여 개인화된 통찰력을 확인하세요."; // Fallback preview
  let zodiacSignDisplay = "알 수 없음 (Unknown)";

  if (zodiacInfo && zodiacInfo.prophecies) { // Ensure prophecies exist
    previewText = zodiacInfo.prophecies.join("\n");
    zodiacSignDisplay = `${zodiacInfo.name_ko} (${zodiacInfo.name_en})`;
  } else {
    // Fallback if zodiac sign is "Unknown" or not found in zodiacTeasers or prophecies missing
    previewText = "유효한 날짜를 입력하여 개인화된 통찰력을 확인하세요.";
  }
  
  // Premium lists
  const avoid = shuffleWithRng([...(avoidPool[trig.k] || [])], rng).slice(0,3); // Ensure trig.k exists or use empty array
  const todo  = shuffleWithRng([...(doPool[trig.k] || [])], rng).slice(0,3); // Ensure trig.k exists or use empty array

  // Premium narrative
  const premium = buildPremiumNarrative(rng, {arche, trig, doom, score, avoid, todo});

  // Unlock code (deterministic but not obvious)
  const code = makeCode(y,m,d);

  return {seedStr, arche, trig, doom, score, riskPercent, preview: previewText, avoid, todo, premium, code, zodiacSignDisplay};
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

function buildPremiumNarrative(rng, ctx, isLocked = false){
  const lines = [];
  // Ensure ctx.doom is a Date object or fallback
  const doomStr = ctx.doom instanceof Date ? formatDate(ctx.doom) : 'Unknown Date';
  // Ensure ctx.trig.k is defined or fallback
  const trigKLower = ctx.trig && ctx.trig.k ? ctx.trig.k.toLowerCase() : 'trigger';

  const dangerLine = [
    `On ${doomStr}, your ${trigKLower} trigger peaks. If you act fast, you lose leverage.`,
    `Your Doom Date (${doomStr}) isn’t “bad luck” — it’s a timing trap. Slow down and you win.`,
    `That week around ${doomStr} is a filter: it punishes shortcuts and rewards calm execution.`
  ][Math.floor(rng()*3)];

  const archeName = ctx.arche && ctx.arche.name ? ctx.arche.name : 'Unknown Archetype';
  const archeVibe = ctx.arche && ctx.arche.vibe ? ctx.arche.vibe : 'unknown vibe';

  const archeLine = [
    `Archetype: ${archeName}. Your advantage is ${archeVibe}.`,
    `${archeName} energy: when you commit, reality moves. But only if you don’t rush.`,
    `You’re ${archeName}. You’re built for late wins, not early panic.`
  ][Math.floor(rng()*3)];

  if (isLocked) {
    // Teaser for locked content
    lines.push(dangerLine);
    lines.push(archeLine);
    lines.push("");
    lines.push("AVOID:");
    // Show only first item of avoid list + suspenseful message
    (ctx.avoid && ctx.avoid.length > 0 ? [ctx.avoid[0]] : ["알 수 없는 위험"])
      .forEach((a,i)=> lines.push(`${i+1}) ${a}`));
    lines.push("   ... 더 많은 피해야 할 것들 (프리미엄 잠금)");
    lines.push("");
    lines.push("DO:");
    // Show only first item of do list + suspenseful message
    (ctx.todo && ctx.todo.length > 0 ? [ctx.todo[0]] : ["알 수 없는 기회"])
      .forEach((t,i)=> lines.push(`${i+1}) ${t}`));
    lines.push("   ... 더 많은 해야 할 것들 (프리미엄 잠금)");
    lines.push("");
    lines.push("🚨 이 문장은 당신의 3개월 후를 설명합니다 🚨"); // Strong hook
    lines.push("   ... 내 운명의 완전한 해제를 원한다면 (프리미엄 잠금)");
  } else {
    // Full narrative for unlocked content
    lines.push(dangerLine);
    lines.push(archeLine);
    lines.push("");
    lines.push("AVOID:");
    // Ensure ctx.avoid is an array
    (ctx.avoid || []).forEach((a,i)=> lines.push(`${i+1}) ${a}`));
    lines.push("");
    lines.push("DO:");
    // Ensure ctx.todo is an array
    (ctx.todo || []).forEach((t,i)=> lines.push(`${i+1}) ${t}`));
    lines.push("");
    lines.push("Micro-rule:");
    lines.push([
      "If you feel urgency, wait 2 hours. Urgency is the trap.",
      "If it feels like ‘now or never’, it’s usually ‘never’.",
      "Your win condition: calm + receipts + one decisive move."
    ][Math.floor(rng()*3)]);
  }

  return lines.join("\n");
}

// --- UI ---
let lastResult = null;
let countdownInterval;
const unlockButton = $("unlockButton"); // Get the unlock button element

function setPremiumLocked(){
  premiumOut.classList.add("hidden");
  avoidListEl.classList.add("blurred");
  doListEl.classList.add("blurred");
  countdownTimer.classList.remove("hidden");
  if (unlockButton) {
    unlockButton.textContent = "내 운명 완전 해제하기 - $9.99"; // Stronger button text
  }
  // When locked, premiumText should show the teaser
  if (lastResult && premiumText) {
    // Regenerate narrative as teaser
    const rng = seededRand(lastResult.seedStr); // Need to re-seed rng for consistent output
    premiumText.textContent = buildPremiumNarrative(rng, lastResult, true) || 'N/A';
  }
}
function setPremiumUnlocked(){
  premiumOut.classList.remove("hidden");
  avoidListEl.classList.remove("blurred");
  doListEl.classList.remove("blurred");
  countdownTimer.classList.add("hidden");
  if (countdownInterval) clearInterval(countdownInterval);
  if (unlockButton) {
    unlockButton.textContent = "프리미엄 해제됨!"; // Indicate unlocked state
  }
  // When unlocked, premiumText should show the full narrative
  if (lastResult && premiumText) {
    // Regenerate narrative as full version
    const rng = seededRand(lastResult.seedStr); // Need to re-seed rng for consistent output
    premiumText.textContent = buildPremiumNarrative(rng, lastResult, false) || 'N/A';
  }
}

// Start countdown if it's locked and not already running
function startCountdown() {
    if (!countdownTimer) return; // Ensure element exists
    if (countdownInterval) clearInterval(countdownInterval); // Clear any existing interval

    let timeLeft = 24 * 60 * 60; // 24 hours in seconds

    const updateCountdown = () => {
        const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
        const seconds = String(timeLeft % 60).padStart(2, '0');
        countdownTimer.textContent = `남은 시간: ${hours}:${minutes}:${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownTimer.textContent = "시간 종료!";
            // Potentially re-lock content or change message
        } else {
            timeLeft--;
        }
    };

    updateCountdown(); // Initial call to display immediately
    countdownInterval = setInterval(updateCountdown, 1000); // Update every second
}

function renderResult(r) {
    lastResult = r;

    // Add console logs as requested
    console.log("Full Result Object:", r); // More comprehensive log for the whole object
    console.log("Score:", r.score);
    console.log("Zodiac:", r.zodiacSignDisplay);
    console.log("Preview:", r.preview);

    // Get elements by their correct ID from the HTML
    const fortuneScoreEl = document.getElementById("scoreNum");
    const scoreDescriptionEl = document.getElementById("scoreDescription");
    const riskPeriodEl = document.getElementById("riskNum");
    const doomDateEl = document.getElementById("doomDate");
    const mainTriggerEl = document.getElementById("trigger");
    const freePreviewTextEl = document.getElementById("previewText");
    const zodiacPreviewEl = document.getElementById("zodiacPreview");

    // Other elements needed for rendering the result card
    const typeLineEl = document.getElementById("typeLine");
    const doomNoteEl = document.getElementById("doomNote");
    const triggerNoteEl = document.getElementById("triggerNote");

    // --- Problem 2: Result screen enhancements ---

    // 1. Result Title: More powerful and personalized
    if (typeLineEl) {
        const archetypePhrase = getArchetypePhrase(r.arche, r.score);
        typeLineEl.textContent = `${archetypePhrase} • ${badgeText(r.arche || {})} • ${r.seedStr || 'N/A'}`;
    }

    // 2. Fortune Score: Emotional evocative description
    if (fortuneScoreEl) {
        fortuneScoreEl.textContent = r.score ?? "N/A";
    }
    if (scoreDescriptionEl) {
        scoreDescriptionEl.textContent = getFortuneScoreDescription(r.score);
    }

    // 3. Danger Period Emphasis: Add visual warning (dynamic class)
    if (riskPeriodEl) {
        riskPeriodEl.textContent = r.riskPercent !== undefined ? `${r.riskPercent}% 위험 구간` : "N/A";
        riskPeriodEl.classList.remove('low-risk', 'medium-risk', 'high-risk'); // Clear previous
        if (r.riskPercent < 30) {
            riskPeriodEl.classList.add('low-risk');
        } else if (r.riskPercent < 70) {
            riskPeriodEl.classList.add('medium-risk');
        } else {
            riskPeriodEl.classList.add('high-risk');
        }
    }

    // Update other elements as before
    if (doomDateEl) {
        doomDateEl.textContent = r.doom instanceof Date ? formatDate(r.doom) : "N/A";
    }
    if (mainTriggerEl) {
        mainTriggerEl.textContent = (r.trig && r.trig.k) ?? "N/A";
    }
    if (freePreviewTextEl) {
        freePreviewTextEl.innerHTML = r.preview ?? "";
    }
    if (zodiacPreviewEl) {
        zodiacPreviewEl.textContent = r.zodiacSignDisplay ?? "N/A";
    }

    if (doomNoteEl) {
        doomNoteEl.textContent = (r.score < 40) ? "낮은 운의 창. 도박하지 마세요."
            : (r.score < 70) ? "혼합된 신호. 정밀함이 필요합니다."
            : "강력한 힘—하지만 자만의 덫을 조심하세요.";
        if (r.score === undefined) doomNoteEl.textContent = 'N/A';
    }
    if (triggerNoteEl) {
        triggerNoteEl.textContent = (r.trig && r.trig.note) || 'N/A';
    }

    // Premium lists (real content but blurred until unlock)
    if (avoidListEl) {
      avoidListEl.innerHTML = (r.avoid || []).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
    }
    if (doListEl) {
      doListEl.innerHTML = (r.todo || []).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
    }
    if (premiumText) {
      premiumText.textContent = r.premium ?? 'N/A';
    }

    // Unlock persistence
    const unlocked = localStorage.getItem("dd_unlocked") === "1";
    if (unlocked) {
        setPremiumUnlocked();
    } else {
        setPremiumLocked();
        startCountdown();
    }
}

// Helper function for Problem 2 - Result Title
function getArchetypePhrase(arche, score) {
    const archeName = (arche && arche.name) || 'Unknown Archetype';
    if (score > 90) return `운명을 지배하는 ${archeName}`;
    if (score > 70) return `숨겨진 잠재력의 ${archeName}`;
    if (score > 50) return `균형을 찾는 ${archeName}`;
    if (score > 30) return `도전을 헤쳐나가는 ${archeName}`;
    return `각성을 기다리는 ${archeName}`;
}

// Helper function for Problem 2 - Fortune Score Description
function getFortuneScoreDescription(score) {
    if (score === undefined) return "당신의 운명을 스캔하는 중입니다...";
    if (score > 90) return `이번 달, 당신은 평범하지 않습니다. 우주가 당신의 편에 서 있습니다.`;
    if (score > 70) return `당신의 에너지가 최고조에 달하고 있습니다. 놓치지 마세요!`;
    if (score > 50) return `변화의 바람이 불고 있습니다. 현명한 선택이 필요해요.`;
    if (score > 30) return `조심스러운 한 달이 될 수 있습니다. 신중하게 움직이세요.`;
    return `지금은 숨을 고르고 다음 기회를 준비할 때입니다.`;
}


function badgeText(arche){
  // Ensure arche is not null/undefined
  if(!arche || typeof arche.name === 'undefined') return "STANDARD";
  if(arche.name.includes("MYTHIC")) return "MYTHIC BADGE ✦";
  if(arche.name.includes("VOID")) return "VOID BADGE ⛧";
  return "STANDARD";
}

function escapeHtml(str){
  // Ensure str is a string
  if (typeof str !== 'string') return String(str);
  return str.replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

async function scan(){
  console.log("Scan initiated.");
  const y = Number(yy.value), m = Number(mm.value), d = Number(dd.value);
  if(!validDate(y,m,d)){
    alert("유효한 생년월일(YYYY / MM / DD)을 입력하세요.");
    console.log("Scan aborted: Invalid date.");
    return;
  }
  console.log("Date validated. Showing loader, hiding result wrap.");
  loader.classList.remove("hidden");
  resultWrap.classList.add("hidden");

  try {
    // fake “AI scan” timing (viral feel)
    await wait(850 + Math.random()*450);
    console.log("Simulated scan time elapsed. Computing result...");

    const r = computeResult(y,m,d);
    console.log("Result computed:", r);
    console.log("Rendering result...");
    renderResult(r);
    console.log("Result rendering complete.");

  } catch (error) {
    console.error("Error during scan process:", error);
  } finally {
    console.log("Hiding loader, showing result wrap.");
    loader.classList.add("hidden");
    resultWrap.classList.remove("hidden");
    // auto-scroll to result
    resultWrap.scrollIntoView({behavior:"smooth", block:"start"});
    console.log("Scroll to result section complete.");
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
  // Ensure all properties are available before using
  const doomFormatted = lastResult.doom instanceof Date ? formatDate(lastResult.doom) : 'N/A';
  const archeName = (lastResult.arche && lastResult.arche.name) || 'N/A';
  const score = lastResult.score !== undefined ? lastResult.score : 'N/A';
  const preview = lastResult.preview || 'N/A';
  
  const msg =
`방금 저의 둠 데이트를 찾았습니다: ${doomFormatted} 😬
타입: ${archeName} (${badgeText(lastResult.arche || {})})
포춘 점수: ${score}/100

${preview}

당신의 둠 데이트를 찾아보세요: ${stripQuery(location.href)}`;
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
  console.log("drawCard received:", r); // Debug log
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
  ctx.fillText(String(r.score !== undefined ? r.score : 'N/A'), 120, 455); // Safely access r.score

  // doom date
  ctx.fillStyle = "#ff4d6d";
  ctx.font = "900 58px ui-sans-serif, system-ui";
  ctx.fillText(r.doom instanceof Date ? formatDate(r.doom) : 'N/A', 120, 590); // Safely access r.doom

  // archetype
  ctx.fillStyle = "rgba(233,236,255,0.65)";
  ctx.font = "800 22px ui-sans-serif, system-ui";
  ctx.fillText("Archetype", 120, 670);

  ctx.fillStyle = "#e9ecff";
  ctx.font = "900 46px ui-sans-serif, system-ui";
  wrapText(ctx, `${(r.arche && r.arche.name) || 'N/A'}`, 120, 720, 820, 52); // Safely access r.arche.name

  // trigger
  ctx.fillStyle = "rgba(233,236,255,0.65)";
  ctx.font = "800 22px ui-sans-serif, system-ui";
  ctx.fillText("Main Trigger", 120, 840);

  ctx.fillStyle = "#00e5ff";
  ctx.font = "900 44px ui-sans-serif, system-ui";
  ctx.fillText((r.trig && r.trig.k && r.trig.k.toUpperCase()) || 'N/A', 120, 895); // Safely access r.trig.k

  ctx.fillStyle = "rgba(233,236,255,0.78)";
  ctx.font = "600 26px ui-sans-serif, system-ui";
  wrapText(ctx, (r.trig && r.trig.note) || 'N/A', 120, 940, 820, 36); // Safely access r.trig.note

  // Free Preview Teaser on Card
  ctx.fillStyle = "rgba(233,236,255,0.65)";
  ctx.font = "800 22px ui-sans-serif, system-ui";
  ctx.fillText(`무료 미리보기 — ${r.zodiacSignDisplay || 'N/A'}`, 120, 1000); // Safely access r.zodiacSignDisplay

  ctx.fillStyle = "rgba(233,236,255,0.78)";
  ctx.font = "600 26px ui-sans-serif, system-ui";
  wrapText(ctx, r.preview || 'N/A', 120, 1035, 820, 36); // Safely access r.preview

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
  // Ensure text is a string
  if (typeof text !== 'string') text = String(text);

  let currentY = y;
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
  if(input === (lastResult && lastResult.code) || input === master){ // Safely access lastResult.code
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
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('paid') === 'true') {
    localStorage.setItem("dd_unlocked", "1");
    alert("결제가 완료되어 프리미엄 콘텐츠가 잠금 해제되었습니다!");
    // Clean the URL for aesthetic and to prevent re-triggering the paid status on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  if(localStorage.getItem("dd_unlocked")==="1"){
    setPremiumUnlocked();
  } else {
    setPremiumLocked();
  }

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
    // Ensure all properties are available before using
    const doomFormatted = lastResult.doom instanceof Date ? formatDate(lastResult.doom) : 'N/A';
    const archeName = (lastResult.arche && lastResult.arche.name) || 'N/A';
    const score = lastResult.score !== undefined ? lastResult.score : 'N/A';
    const preview = lastResult.preview || 'N/A';
    
    const msg =
  \`방금 저의 둠 데이트를 찾았습니다: \${doomFormatted} 😬
타입: \${archeName} (\${badgeText(lastResult.arche || {})})
포춘 점수: \${score}/100

\${preview}

당신의 둠 데이트를 찾아보세요: \${stripQuery(location.href)}\`;
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
    if(input === (lastResult && lastResult.code) || input === master){ // Safely access lastResult.code
      localStorage.setItem("dd_unlocked","1");
      setPremiumUnlocked();
      alert("잠금 해제되었습니다.");
    } else {
      alert("잘못된 코드입니다.");
    }
  });
});
