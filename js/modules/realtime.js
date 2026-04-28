import { renderLineChart } from "../core/charts.js";
import { state } from "../core/state.js";
import { classifyPeriod, formatPercent, formatPrice, qs } from "../core/utils.js";

function renderEmptyChart(wrapId, message) {
  const wrap = qs(`#${wrapId}`);
  if (wrap) {
    wrap.innerHTML = `<div class="flex h-full items-center justify-center rounded-panel border border-dashed border-line bg-bgsoft/70 px-6 text-center text-sm text-slate-500">${message}</div>`;
  }
}

export function renderRealtime() {
  const source = state.grain === "hour" ? state.datasets.realtimeHour : state.datasets.realtimeHalf;
  if (!source.length) {
    qs("#realtimeCards").innerHTML = `<div class="col-span-4 rounded-panel border border-dashed border-line bg-white p-6 text-center text-sm text-slate-500">暂无实时监控数据，请检查 data/realtime_*.json 文件。</div>`;
    renderEmptyChart("priceChartWrap", "暂无电价曲线数据");
    renderEmptyChart("loadChartWrap", "暂无负荷曲线数据");
    return;
  }
  if (!qs("#priceChart")) {
    qs("#priceChartWrap").innerHTML = `<canvas id="priceChart"></canvas>`;
  }
  if (!qs("#loadChart")) {
    qs("#loadChartWrap").innerHTML = `<canvas id="loadChart"></canvas>`;
  }

  const latest = source[source.length - 1];
  const avgPrice = source.reduce((sum, item) => sum + item.price, 0) / source.length;
  const avgLoad = Math.round(source.reduce((sum, item) => sum + item.load, 0) / source.length);
  const period = classifyPeriod(Number(latest.hour), latest.price);

  const cards = [
    { title: "当前电价", value: formatPrice(latest.price), desc: "元/千瓦时", tone: "primary" },
    { title: "今日平均电价", value: formatPrice(avgPrice), desc: "日均水平", tone: "default" },
    { title: "当前负荷", value: latest.load, desc: `平均 ${avgLoad}`, tone: "default" },
    { title: "预测准确率", value: formatPercent(91.7), desc: period, tone: period === "高峰" ? "alert" : period === "低谷" ? "mint" : "primary" }
  ];

  qs("#realtimeCards").innerHTML = cards
    .map((item) => {
      const palette = {
        primary: "border-primary/20 text-primary bg-primary/5",
        mint: "border-mint/20 text-mint bg-mint/5",
        alert: "border-alert/20 text-alert bg-alert/5",
        default: "border-line text-slate-900 bg-white"
      };
      return `<div class="rounded-panel border ${palette[item.tone]} p-4">
        <p class="text-[12px] text-slate-400">${item.title}</p>
        <div class="mt-2 text-[26px] font-semibold">${item.value}</div>
        <p class="mt-2 text-[12px] text-slate-500">${item.desc}</p>
      </div>`;
    })
    .join("");

  renderLineChart(
    "priceChart",
    source.map((item) => item.label),
    [
      {
        label: "实时电价",
        data: source.map((item) => item.price),
        borderColor: "#165DFF",
        backgroundColor: "rgba(22,93,255,0.10)",
        fill: true,
        tension: 0.28,
        pointRadius: 2
      }
    ]
  );

  renderLineChart(
    "loadChart",
    source.map((item) => item.label),
    [
      {
        label: "实时负荷",
        data: source.map((item) => item.load),
        borderColor: "#36D399",
        backgroundColor: "rgba(54,211,153,0.10)",
        fill: true,
        tension: 0.28,
        pointRadius: 2
      }
    ]
  );
}
