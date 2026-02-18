/**
 * Doom Date™ - Main Logic
 * Rewritten to ensure DOM compliance and event reliability.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js loaded");

  // --- 1. Element Selectors ---
  const scanBtn = document.getElementById("scanBtn");
  const randomBtn = document.getElementById("randomBtn");
  const yy = document.getElementById("yy");
  const mm = document.getElementById("mm");
  const dd = document.getElementById("dd");
  const loader = document.getElementById("loader");
  const resultWrap = document.getElementById("resultWrap");
  
  const scoreNum = document.getElementById("scoreNum");
  const scoreDescription = document.getElementById("scoreDescription");
  const riskNum = document.getElementById("riskNum");
  const doomDate = document.getElementById("doomDate");
  const typeLine = document.getElementById("typeLine");
  const trigger = document.getElementById("trigger");
  const previewText = document.getElementById("previewText");
  const zodiacPreview = document.getElementById("zodiacPreview");

  // --- 2. Verification & Core Events ---
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      console.log("Scan clicked");
      alert("정상 작동 확인"); // Requested verification alert
      handleScan();
    });
  } else {
    console.log("Scan button not found");
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const randomY = 1980 + Math.floor(Math.random() * 40);
      const randomM = 1 + Math.floor(Math.random() * 12);
      const randomD = 1 + Math.floor(Math.random() * 28);
      
      yy.value = randomY;
      mm.value = randomM;
      dd.value = randomD;
      
      handleScan();
    });
  }

  // --- 3. Core Logic Functions ---
  async function handleScan() {
    const y = parseInt(yy.value);
    const m = parseInt(mm.value);
    const d = parseInt(dd.value);

    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
      alert("유효한 날짜를 입력해주세요.");
      return;
    }

    // Show loading state
    loader.classList.remove("hidden");
    resultWrap.classList.add("hidden");

    // Simulate "Scanning"
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = computeDoomData(y, m, d);
    displayResult(result);

    loader.classList.add("hidden");
    resultWrap.classList.remove("hidden");
    resultWrap.scrollIntoView({ behavior: "smooth" });
  }

  function computeDoomData(y, m, d) {
    // Simple deterministic logic based on birthdate
    const score = (y + m * 31 + d) % 100;
    const risk = (y * m + d) % 100;
    const date = new Date();
    date.setDate(date.getDate() + (score % 30) + 7);
    
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const sign = signs[(m - 1 + (d > 20 ? 1 : 0)) % 12];

    return {
      score,
      risk,
      doomDate: date.toISOString().split('T')[0],
      sign,
      archetype: score > 80 ? "The Celestial Architect" : (score > 50 ? "The Silver Voyager" : "The Shadow Weaver"),
      trigger: score % 2 === 0 ? "Social Overload" : "Financial Pulse"
    };
  }

  function displayResult(res) {
    if (scoreNum) scoreNum.textContent = res.score;
    if (riskNum) riskNum.textContent = res.risk + "%";
    if (doomDate) doomDate.textContent = res.doomDate;
    if (typeLine) typeLine.textContent = res.archetype;
    if (trigger) trigger.textContent = res.trigger;
    if (zodiacPreview) zodiacPreview.textContent = res.sign;
    
    if (scoreDescription) {
      scoreDescription.textContent = res.score > 70 
        ? "Your cosmic alignment is strong, yet fragile." 
        : "The stars suggest a period of deep introspection.";
    }

    if (previewText) {
      previewText.textContent = `As a ${res.sign}, your destiny is intertwined with ${res.trigger}. Be wary of the date ${res.doomDate}.`;
    }
  }

  // Handle other UI elements (Copy, Card, Unlock)
  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const text = `My Doom Date: ${doomDate.textContent} | Score: ${scoreNum.textContent}`;
      navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
    });
  }

  const codeBtn = document.getElementById("codeBtn");
  const codeInput = document.getElementById("codeInput");
  if (codeBtn && codeInput) {
    codeBtn.addEventListener("click", () => {
      if (codeInput.value === "DD-2026") {
        alert("Premium Unlocked!");
        document.getElementById("premiumOut")?.classList.remove("hidden");
        document.querySelector(".paywall")?.classList.add("hidden");
      } else {
        alert("Invalid Code");
      }
    });
  }
});
