import { renderLineChart } from "../core/charts.js";
import { state } from "../core/state.js";
import { formatPrice, qs } from "../core/utils.js";

function filteredHistory() {
  const keyword = qs("#historyKeyword").value.trim();
  let list = [...state.datasets.history];
  if (keyword) {
    list = list.filter(
      (item) =>
        item.date.includes(keyword) ||
        item.time.includes(keyword) ||
        String(item.price).includes(keyword)
    );
  }
  return list;
}

export function renderHistory() {
  const list = filteredHistory();
  const pageSize = Number(qs("#historyPageSize").value || 20);
  const view = list.slice(0, pageSize);
  const avgPrice = list.length ? list.reduce((sum, item) => sum + item.price, 0) / list.length : 0;

  qs("#historyCount").textContent = String(list.length);
  qs("#historyAvgPrice").textContent = formatPrice(avgPrice);

  if (!list.length) {
    qs("#historyTableBody").innerHTML = `<tr><td colspan="5" class="px-3 py-8 text-center text-sm text-slate-500">没有匹配到历史数据，请调整筛选条件或检查数据集。</td></tr>`;
    const wrap = qs("#historyChartWrap");
    if (wrap) {
      wrap.innerHTML = `<div class="flex h-full items-center justify-center rounded-panel border border-dashed border-line bg-bgsoft/70 px-6 text-center text-sm text-slate-500">暂无可绘制的历史趋势数据</div>`;
    }
    return;
  }

  const chartWrap = qs("#historyChartWrap");
  if (chartWrap && !qs("#historyChart")) {
    chartWrap.innerHTML = `<canvas id="historyChart"></canvas>`;
  }

  qs("#historyTableBody").innerHTML = view
    .map(
      (item, index) => `<tr class="${index % 2 ? "bg-slate-50/60" : ""} hover:bg-primary/5">
        <td class="px-3 py-3">${item.date}</td>
        <td class="px-3 py-3">${item.time}</td>
        <td class="px-3 py-3 font-medium text-primary">${formatPrice(item.price)}</td>
        <td class="px-3 py-3">${item.load}</td>
        <td class="px-3 py-3">${item.weather}</td>
      </tr>`
    )
    .join("");

  const tail = list.slice(-24);
  const metricKey = state.historyMetric;
  renderLineChart(
    "historyChart",
    tail.map((item) => `${item.date.slice(5)} ${item.time}`),
    [
      {
        label: metricKey === "price" ? "历史电价" : "历史负荷",
        data: tail.map((item) => item[metricKey]),
        borderColor: metricKey === "price" ? "#165DFF" : "#36D399",
        backgroundColor: metricKey === "price" ? "rgba(22,93,255,0.10)" : "rgba(54,211,153,0.10)",
        fill: true,
        tension: 0.28,
        pointRadius: 2
      }
    ]
  );
}
