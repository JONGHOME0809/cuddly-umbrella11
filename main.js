/**
 * Doom Date™ - Main Logic (Conversion-Optimized)
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

  const unlockButton = document.getElementById("unlockButton");
  const avoidList = document.getElementById("avoidList");
  const doList = document.getElementById("doList");
  const premiumText = document.getElementById("premiumText");
  const premiumOut = document.getElementById("premiumOut");
  const paywall = document.querySelector(".paywall");

  // --- 2. Data & Templates ---
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  
  const zodiacDetails = {
    "Aries": { ko: "양자리", trait: "불타는 개척자", shadow: "충동적인 분노" },
    "Taurus": { ko: "황소자리", trait: "고집스러운 수호자", shadow: "변화에 대한 거부" },
    "Gemini": { ko: "쌍둥이자리", trait: "두 얼굴의 전령", shadow: "산만한 불안" },
    "Cancer": { ko: "게자리", trait: "달의 보호자", shadow: "감정적 방어기제" },
    "Leo": { ko: "사자자리", trait: "태양의 왕", shadow: "인정 욕구의 갈증" },
    "Virgo": { ko: "처녀자리", trait: "완벽의 설계자", shadow: "지나친 비판" },
    "Libra": { ko: "천칭자리", trait: "균형의 중재자", shadow: "결정 장애의 늪" },
    "Scorpio": { ko: "전갈자리", trait: "심연의 추적자", shadow: "집착과 복수심" },
    "Sagittarius": { ko: "사수자리", trait: "자유의 사냥꾼", shadow: "현실 도피" },
    "Capricorn": { ko: "염소자리", trait: "시간의 지배자", shadow: "냉혹한 계산" },
    "Aquarius": { ko: "물병자리", trait: "미래의 혁명가", shadow: "사회적 단절" },
    "Pisces": { ko: "물고기자리", trait: "꿈의 유영자", shadow: "경계 없는 혼란" }
  };

  // --- 3. Core Logic Functions ---
  function computeDoomData(y, m, d) {
    const seed = (y + m * 31 + d);
    const score = seed % 100;
    const risk = (y * m + d) % 40 + 50; // High risk 50-90
    const doomDateObj = new Date();
    doomDateObj.setDate(doomDateObj.getDate() + (seed % 20) + 14);
    const doomDateStr = doomDateObj.toISOString().split('T')[0];
    
    const signIdx = (m - 1 + (d > 20 ? 1 : 0)) % 12;
    const signKey = signs[signIdx];
    const zodiac = zodiacDetails[signKey];

    // [1] Expansion: Free Preview (8-10 lines)
    const preview = [
      `당신은 ${zodiac.ko}(${signKey}), '${zodiac.trait}'의 기운을 타고났습니다.`,
      `현재 포춘 점수는 ${score}점입니다. 이는 당신의 에너지가 ${score > 50 ? '외부로 발산' : '내부로 수렴'}되는 시기임을 뜻합니다.`,
      `다가오는 ${doomDateStr} 전후, 행성의 배열이 당신의 '${zodiac.shadow}'을 자극하고 있습니다.`,
      `특히 이 시기에는 주변의 '가까운 관계' 혹은 '금전적 선택'에서 예상치 못한 균열이 감지됩니다.`,
      `위험 지수는 ${risk}%로, 평소보다 감각이 무뎌지거나 판단이 흐려질 확률이 매우 높습니다.`,
      `과거의 유사한 패턴이 반복되려 하고 있으며, 이번에는 그 결과가 더 장기적일 수 있습니다.`,
      `우주는 당신에게 명확한 경고를 보내고 있지만, 당신은 아직 그 신호의 본질을 보지 못하고 있습니다.`,
      `이대로 방치할 경우, 향후 3개월간의 운 흐름이 급격히 하락할 가능성이 큽니다.`,
      `지금 이 순간의 선택이 당신의 'Doom Date'를 '기회의 날'로 바꿀 유일한 열쇠입니다.`,
      `⚠️ 전체 분석의 40%만 공개되었습니다. 나머지 60%에 결정적인 회피 전략이 담겨 있습니다.`
    ].join('\n');

    // [2] Expansion: Premium Content (12-15+ lines)
    const premium = [
      `🚨 [프리미엄 전체 분석 보고서]`,
      `📍 결정적 시각: ${doomDateStr} 오후 11시 15분 경`,
      `- 이 시간대에 발생하는 '제안'이나 '연락'은 반드시 거절하십시오.`,
      ``,
      `🚫 피해야 할 행동 3가지:`,
      `1. 야간에 내리는 즉흥적인 결제나 투자 결정 (손실률 85%)`,
      `2. 과거 인연과의 불필요한 감정 소모 (에너지 고갈의 원인)`,
      `3. 타인에게 본인의 약점이나 계획을 성급하게 발설하는 것`,
      ``,
      `✅ 반드시 해야 할 선택 3가지:`,
      `1. ${doomDateStr} 당일 오전, 물을 평소보다 2배 섭취하여 순환을 돕고 명상하십시오.`,
      `2. 모든 계약서와 메시지는 세 번 이상 검토 후 답변하십시오.`,
      `3. 본인의 직관이 '아니오'라고 말하는 지점에서 즉시 멈추십시오.`,
      ``,
      `📅 3개월 후 시나리오:`,
      `위의 지침을 따를 경우: ${score + 20}점대로 운이 상승하며, 뜻밖의 귀인이 나타나 문제를 해결합니다.`,
      `지침을 무시할 경우: 재정적 압박과 인간관계의 단절이 겹치며 ${Math.max(0, score - 30)}점대로 추락합니다.`,
      ``,
      `🔥 기회 폭발 구간:`,
      `${doomDateStr}로부터 정확히 22일 후, 당신의 '${zodiac.trait}' 에너지가 극대화되는 황금기가 찾아옵니다.`,
      `이때를 위해 지금의 리스크를 완벽히 통제해야 합니다.`,
      ``,
      `🛠️ 회피 전략 요약:`,
      `침묵은 금입니다. 행동보다 관찰에 집중하며 폭풍이 지나가길 기다리십시오. 당신은 이길 수 있습니다.`
    ].join('\n');

    return {
      score,
      risk,
      doomDate: doomDateStr,
      sign: `${zodiac.ko} (${signKey})`,
      archetype: `${zodiac.trait}`,
      trigger: score % 2 === 0 ? "인간관계의 균열" : "금전적 판단 착오",
      preview,
      premium,
      avoid: ["충동적인 선택", "타인에 대한 과한 신뢰", "밤늦은 시간의 연락"],
      todo: ["자신만의 공간 확보", "재정 상태 재점검", "철저한 기록 습득"]
    };
  }

  let currentResult = null;

  function displayResult(res) {
    currentResult = res;
    if (scoreNum) scoreNum.textContent = res.score;
    if (riskNum) riskNum.textContent = res.risk + "%";
    if (doomDate) doomDate.textContent = res.doomDate;
    if (typeLine) typeLine.textContent = res.archetype;
    if (trigger) trigger.textContent = res.trigger;
    if (zodiacPreview) zodiacPreview.textContent = res.sign;
    
    if (scoreDescription) {
      scoreDescription.textContent = res.score > 70 
        ? "당신의 우주적 배열은 강력하지만, 그만큼 작은 충격에도 깨지기 쉬운 상태입니다." 
        : "별들은 당신에게 깊은 성찰의 시기를 요구하고 있습니다. 외부가 아닌 내부를 보십시오.";
    }

    if (previewText) {
      previewText.style.whiteSpace = "pre-line";
      previewText.textContent = res.preview;
    }

    // Update Premium Content
    if (avoidList) {
      avoidList.innerHTML = res.avoid.map(item => `<li>${item}</li>`).join('');
    }
    if (doList) {
      doList.innerHTML = res.todo.map(item => `<li>${item}</li>`).join('');
    }
    if (premiumText) {
      premiumText.style.whiteSpace = "pre-line";
      premiumText.textContent = res.premium;
    }

    // [3] Psychological Triggers
    if (unlockButton) {
      unlockButton.textContent = "내 운명 전체 분석 보기 (3개월 후 결과 포함)";
      
      // Add psychological trigger text near button if not exists
      let triggerMsg = document.getElementById("psychTrigger");
      if (!triggerMsg) {
        triggerMsg = document.createElement("div");
        triggerMsg.id = "psychTrigger";
        triggerMsg.style.color = "#ff4d6d";
        triggerMsg.style.fontSize = "0.85rem";
        triggerMsg.style.marginTop = "10px";
        triggerMsg.style.textAlign = "center";
        triggerMsg.style.fontWeight = "bold";
        unlockButton.parentNode.insertBefore(triggerMsg, unlockButton.nextSibling);
      }
      triggerMsg.textContent = "⚠️ 결정을 미루면 손해 구간입니다. 이 정보는 오늘 단 한 번만 공개됩니다.";
    }

    // Reset unlock state if it's a new scan
    localStorage.setItem("dd_unlocked", "0");
    paywall.classList.remove("hidden");
    premiumOut.classList.add("hidden");
  }

  async function handleScan() {
    const y = parseInt(yy.value);
    const m = parseInt(mm.value);
    const d = parseInt(dd.value);

    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
      alert("유효한 날짜를 입력해주세요.");
      return;
    }

    loader.classList.remove("hidden");
    resultWrap.classList.add("hidden");

    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = computeDoomData(y, m, d);
    displayResult(result);

    loader.classList.add("hidden");
    resultWrap.classList.remove("hidden");
    resultWrap.scrollIntoView({ behavior: "smooth" });
  }

  // --- 4. Event Listeners ---
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      console.log("Scan clicked");
      handleScan();
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      yy.value = 1980 + Math.floor(Math.random() * 40);
      mm.value = 1 + Math.floor(Math.random() * 12);
      dd.value = 1 + Math.floor(Math.random() * 28);
      handleScan();
    });
  }

  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const text = `내 둠 데이트: ${doomDate.textContent} | 포춘 점수: ${scoreNum.textContent}\n당신도 확인해보세요: ${window.location.href}`;
      navigator.clipboard.writeText(text).then(() => alert("복사되었습니다!"));
    });
  }

  const cardBtn = document.getElementById("cardBtn");
  if (cardBtn) {
    cardBtn.addEventListener("click", async () => {
      if (!currentResult) {
        alert("먼저 스캔을 진행해주세요.");
        return;
      }

      // Populate hidden card
      document.getElementById("card-zodiac").textContent = currentResult.sign;
      document.getElementById("card-score").textContent = currentResult.score;
      document.getElementById("card-risk").textContent = currentResult.risk + "%";
      document.getElementById("card-date").textContent = "Doom Date: " + currentResult.doomDate;
      document.getElementById("card-phrase").textContent = `"${currentResult.archetype}로서 당신의 운명을 조심하십시오."`;

      try {
        const previewEl = document.getElementById("share-card-preview");
        const canvas = await html2canvas(previewEl, {
          backgroundColor: "#07070b",
          scale: 2
        });

        const dataUrl = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "doom-date.png", { type: "image/png" });

        console.log("Share card generated");

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Doom Date",
            text: `내 둠 데이트 결과: ${currentResult.doomDate}. 당신의 운명은?`
          });
        } else {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "my-doom-date.png";
          link.click();
          alert("카드가 생성되었습니다. 이미지를 저장해 공유하세요!");
        }
      } catch (err) {
        console.error("Card generation failed:", err);
        alert("카드 생성에 실패했습니다.");
      }
    });
  }

  const codeBtn = document.getElementById("codeBtn");
  const codeInput = document.getElementById("codeInput");
  if (codeBtn && codeInput) {
    codeBtn.addEventListener("click", () => {
      if (codeInput.value.toUpperCase() === "DD-2026") {
        alert("운명이 해제되었습니다.");
        localStorage.setItem("dd_unlocked", "1");
        premiumOut.classList.remove("hidden");
        paywall.classList.add("hidden");
        premiumOut.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("잘못된 코드입니다.");
      }
    });
  }

  // Handle "paid" status from redirect
  if (new URLSearchParams(window.location.search).get('paid') === 'true') {
    localStorage.setItem("dd_unlocked", "1");
    // If results already exist, show them
    if (resultWrap.classList.contains("hidden") === false) {
        premiumOut.classList.remove("hidden");
        paywall.classList.add("hidden");
    }
  }
});
