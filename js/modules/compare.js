import { renderBarChart, renderRadarChart } from "../core/charts.js";
import { state } from "../core/state.js";
import { formatPrice, qs } from "../core/utils.js";

export function renderCompare() {
  const rows = state.datasets.modelMetrics;
  if (!rows.length) {
    qs("#compareTableBody").innerHTML = `<tr><td colspan="6" class="px-3 py-8 text-center text-sm text-slate-500">暂无模型对比数据。</td></tr>`;
    const barWrap = qs("#compareBarChartWrap");
    const radarWrap = qs("#compareRadarChartWrap");
    if (barWrap) barWrap.innerHTML = `<div class="flex h-full items-center justify-center rounded-panel border border-dashed border-line bg-bgsoft/70 px-6 text-center text-sm text-slate-500">暂无柱状图数据</div>`;
    if (radarWrap) radarWrap.innerHTML = `<div class="flex h-full items-center justify-center rounded-panel border border-dashed border-line bg-bgsoft/70 px-6 text-center text-sm text-slate-500">暂无雷达图数据</div>`;
    return;
  }
  if (!qs("#compareBarChart")) {
    qs("#compareBarChartWrap").innerHTML = `<canvas id="compareBarChart"></canvas>`;
  }
  if (!qs("#compareRadarChart")) {
    qs("#compareRadarChartWrap").innerHTML = `<canvas id="compareRadarChart"></canvas>`;
  }

  renderBarChart("compareBarChart", rows.map((item) => item.name), [
    {
      label: "R²",
      data: rows.map((item) => item.r2),
      backgroundColor: ["#165DFF", "#36D399", "#FFB020", "#94A3B8"]
    }
  ]);

  renderRadarChart("compareRadarChart", ["准确率", "稳定性", "速度", "可解释性", "部署便捷性"], [
    {
      label: "LSTM",
      data: rows[0].radar,
      borderColor: "#165DFF",
      backgroundColor: "rgba(22,93,255,0.10)"
    },
    {
      label: "XGBoost",
      data: rows[1].radar,
      borderColor: "#36D399",
      backgroundColor: "rgba(54,211,153,0.10)"
    }
  ]);

  qs("#compareTableBody").innerHTML = rows
    .map(
      (item) => `<tr>
        <td class="px-3 py-3 font-medium">${item.name}</td>
        <td class="px-3 py-3">${formatPrice(item.mae)}</td>
        <td class="px-3 py-3">${formatPrice(item.rmse)}</td>
        <td class="px-3 py-3">${item.r2.toFixed(3)}</td>
        <td class="px-3 py-3">${item.speed}</td>
        <td class="px-3 py-3 text-slate-500">${item.description}</td>
      </tr>`
    )
    .join("");
}
