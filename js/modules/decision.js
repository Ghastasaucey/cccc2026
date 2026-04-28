import { state } from "../core/state.js";
import { formatPercent, qs } from "../core/utils.js";

function forecastStats() {
  const rows = state.forecast.length ? state.forecast : [];
  if (!rows.length) {
    return { valleyHours: "00:00-06:00", peakHours: "10:00-14:00、18:00-22:00", saving: 15.3 };
  }
  const valley = rows.filter((item) => item.period === "低谷").map((item) => item.time);
  const peak = rows.filter((item) => item.period === "高峰").map((item) => item.time);
  return {
    valleyHours: valley.length ? `${valley[0]}-${valley[Math.min(valley.length - 1, 5)]}` : "00:00-06:00",
    peakHours: peak.length ? `${peak[0]}、${peak[Math.min(peak.length - 1, 7)]}` : "10:00-14:00、18:00-22:00",
    saving: 10 + Math.min(8, peak.length / 6)
  };
}

export function renderDecision() {
  const scenes = state.datasets.decisionScenes;
  const scene = scenes[state.scene];
  if (!scene) return;
  const stats = forecastStats();
  qs("#decisionOverview").textContent = scene.overview
    .replace("{VALLEY}", stats.valleyHours)
    .replace("{PEAK}", stats.peakHours)
    .replace("{SAVE}", formatPercent(stats.saving));

  qs("#decisionCards").innerHTML = scene.cards
    .map(
      (card) => `<div class="rounded-panel border border-line bg-white p-4 shadow-sm">
        <p class="text-[12px] text-slate-400">${card.title}</p>
        <div class="mt-2 text-[22px] font-semibold">${card.value}</div>
        <p class="mt-2 text-[12px] leading-6 text-slate-500">${card.desc}</p>
      </div>`
    )
    .join("");
}
