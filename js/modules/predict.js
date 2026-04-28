import { renderLineChart } from "../core/charts.js";
import { state } from "../core/state.js";
import { classifyPeriod, formatPercent, formatPrice, qs } from "../core/utils.js";

function getModelProfile(modelName) {
  const profiles = {
    LSTM: { accuracy: 91.7, drift: 0.0, label: "LSTM" },
    XGBoost: { accuracy: 89.4, drift: 0.012, label: "XGBoost" },
    LightGBM: { accuracy: 90.1, drift: 0.008, label: "LightGBM" },
    RandomForest: { accuracy: 86.8, drift: 0.02, label: "随机森林" }
  };
  return profiles[modelName] || profiles.LSTM;
}

function validatePredictInputs() {
  const temperature = Number(qs("#predictTemp").value);
  const humidity = Number(qs("#predictHumidity").value);
  const peakLoad = Number(qs("#predictPeakLoad").value);
  return temperature >= -10 && temperature <= 40 && humidity >= 30 && humidity <= 90 && peakLoad > 0;
}

function buildForecastRows() {
  const days = Number(qs("#predictDays").value);
  const startDate = qs("#predictStartDate").value ? new Date(qs("#predictStartDate").value) : new Date();
  const temp = Number(qs("#predictTemp").value);
  const humidity = Number(qs("#predictHumidity").value);
  const peakLoad = Number(qs("#predictPeakLoad").value);
  const holiday = qs("#predictHoliday").value === "true";
  const model = getModelProfile(qs("#predictModel").value);
  const anomalyLevel = (state.datasets.anomalyEvents || []).length;
  const rows = [];

  for (let day = 0; day < days; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      const base = 0.42 + Math.sin((hour + day) / 2.9) * 0.11;
      const weekday = (startDate.getDay() + day) % 7;
      const weekdayImpact = weekday === 0 || weekday === 6 ? -0.018 : 0.012;
      const weatherImpact = (temp - 20) * 0.0025 + (humidity - 55) * 0.001;
      const peakImpact = peakLoad / 10000;
      const holidayImpact = holiday ? -0.015 : 0;
      const anomalyImpact = anomalyLevel >= 4 && hour >= 18 && hour <= 21 ? 0.02 : 0;
      const peakFlag = (hour >= 10 && hour <= 14) || (hour >= 18 && hour <= 21);
      const valleyFlag = hour <= 5;
      const price =
        base +
        weekdayImpact +
        weatherImpact +
        peakImpact +
        holidayImpact +
        anomalyImpact +
        (peakFlag ? 0.19 : 0) -
        (valleyFlag ? 0.05 : 0) +
        model.drift;
      const load =
        Math.round(
          580 +
            Math.sin((hour + day) / 3.2) * 55 +
            peakLoad * 0.2 +
            (temp >= 30 ? 32 : 0) +
            (holiday ? -38 : 0) +
            (peakFlag ? 140 : 0) -
            (valleyFlag ? 90 : 0)
        );
      rows.push({
        date: new Date(startDate.getTime() + day * 86400000).toISOString().slice(0, 10),
        hour,
        time: `${String(hour).padStart(2, "0")}:00`,
        price: Number(price.toFixed(3)),
        load,
        period: classifyPeriod(hour, price)
      });
    }
  }
  return rows;
}

export function resetPredictForm() {
  qs("#predictDays").value = "3";
  qs("#predictTemp").value = "26";
  qs("#predictHumidity").value = "60";
  qs("#predictPeakLoad").value = "860";
  qs("#predictHoliday").value = "false";
  qs("#predictModel").value = "LSTM";
  qs("#predictError").classList.add("hidden");
}

function renderForecastCards(rows, accuracy) {
  if (!rows.length) {
    qs("#forecastSummaryCards").innerHTML = `<div class="col-span-4 rounded-panel border border-dashed border-line bg-white p-6 text-center text-sm text-slate-500">暂无预测结果，请先执行参数预测。</div>`;
    return;
  }
  const max = rows.reduce((prev, current) => (current.price > prev.price ? current : prev), rows[0]);
  const min = rows.reduce((prev, current) => (current.price < prev.price ? current : prev), rows[0]);
  const avg = rows.reduce((sum, item) => sum + item.price, 0) / rows.length;

  const cards = [
    { label: "预测周期", value: `${Number(qs("#predictDays").value)} 天`, desc: "按日滚动输出" },
    { label: "平均电价", value: formatPrice(avg), desc: "元/千瓦时" },
    { label: "最高电价", value: `${formatPrice(max.price)} (${max.time})`, desc: max.period },
    { label: "最低电价", value: `${formatPrice(min.price)} (${min.time})`, desc: min.period }
  ];

  qs("#forecastSummaryCards").innerHTML = cards
    .map(
      (card) => `<div class="rounded-panel border border-line bg-white p-4">
        <p class="text-[12px] text-slate-400">${card.label}</p>
        <div class="mt-2 text-[22px] font-semibold">${card.value}</div>
        <p class="mt-2 text-[12px] text-slate-500">${card.desc}</p>
      </div>`
    )
    .join("");

  qs("#resultModel").textContent = qs("#predictModel").value;
  qs("#resultAccuracy").textContent = formatPercent(accuracy);
}

function renderForecastTable(rows) {
  if (!rows.length) {
    qs("#forecastTableBody").innerHTML = `<tr><td colspan="5" class="px-3 py-8 text-center text-sm text-slate-500">暂无预测明细数据。</td></tr>`;
    qs("#forecastMetricCards").innerHTML = "";
    return;
  }
  qs("#forecastTableBody").innerHTML = rows
    .slice(0, 42)
    .map(
      (row, index) => `<tr class="${index % 2 ? "bg-slate-50/60" : ""} hover:bg-primary/5">
        <td class="px-3 py-3">${row.date}</td>
        <td class="px-3 py-3">${row.time}</td>
        <td class="px-3 py-3 font-medium text-primary">${formatPrice(row.price)}</td>
        <td class="px-3 py-3">${row.load}</td>
        <td class="px-3 py-3">${row.period}</td>
      </tr>`
    )
    .join("");

  const peakCount = rows.filter((row) => row.period === "高峰").length;
  const valleyCount = rows.filter((row) => row.period === "低谷").length;
  const metricCards = [
    { label: "预测记录数", value: `${rows.length} 条`, tone: "text-slate-900" },
    { label: "高峰占比", value: formatPercent((peakCount / rows.length) * 100), tone: "text-alert" },
    { label: "低谷占比", value: formatPercent((valleyCount / rows.length) * 100), tone: "text-mint" }
  ];
  qs("#forecastMetricCards").innerHTML = metricCards
    .map(
      (item) => `<div class="rounded-panel border border-line bg-bgsoft p-4">
        <p class="text-[11px] text-slate-400">${item.label}</p>
        <div class="mt-2 text-[22px] font-semibold ${item.tone}">${item.value}</div>
      </div>`
    )
    .join("");
}

function renderForecastChart(rows) {
  if (!rows.length) {
    const wrap = qs("#forecastChartWrap");
    if (wrap) {
      wrap.innerHTML = `<div class="flex h-full items-center justify-center rounded-panel border border-dashed border-line bg-bgsoft/70 px-6 text-center text-sm text-slate-500">暂无预测图表数据</div>`;
    }
    return;
  }
  const wrap = qs("#forecastChartWrap");
  if (wrap && !qs("#forecastChart")) {
    wrap.innerHTML = `<canvas id="forecastChart"></canvas>`;
  }
  const history = state.datasets.realtimeHour.slice(0, 24);
  const forecast = rows.slice(0, 24);
  renderLineChart(
    "forecastChart",
    [...history.map((item) => `历史 ${item.label}`), ...forecast.map((item) => `预测 ${item.time}`)],
    [
      {
        label: "历史电价",
        data: [...history.map((item) => item.price), ...Array(forecast.length).fill(null)],
        borderColor: "#165DFF",
        tension: 0.28,
        pointRadius: 2
      },
      {
        label: "预测电价",
        data: [...Array(history.length).fill(null), ...forecast.map((item) => item.price)],
        borderColor: "#36D399",
        borderDash: [8, 6],
        tension: 0.28,
        pointRadius: 2
      }
    ]
  );
}

function appendPredictLog(message) {
  qs("#predictLogPanel").insertAdjacentHTML(
    "afterbegin",
    `<div class="rounded-panel border border-line bg-white px-3 py-2 shadow-sm">${message}</div>`
  );
}

export function renderPredictResults(rows) {
  const profile = getModelProfile(qs("#predictModel").value);
  state.forecast = rows;
  renderForecastCards(rows, profile.accuracy);
  renderForecastTable(rows);
  renderForecastChart(rows);
}

export function runPrediction(onDone) {
  if (!validatePredictInputs()) {
    qs("#predictError").classList.remove("hidden");
    return;
  }
  qs("#predictError").classList.add("hidden");
  qs("#predictLogPanel").innerHTML = "";
  qs("#predictProgressBar").style.width = "0%";
  qs("#predictPercentText").textContent = "0%";

  const steps = [
    "正在读取历史电价、负荷和天气数据...",
    "正在执行多源特征融合与归一化处理...",
    "正在构建时空联合预测输入序列...",
    "异常事件感知模块已接入天气、节假日和样例风险事件...",
    "正在生成未来电价与负荷预测结果...",
    "正在组织峰谷标记与策略建议..."
  ];

  let index = 0;
  const timer = setInterval(() => {
    index += 1;
    const percent = Math.min(index * 18, 100);
    const message = steps[Math.min(index - 1, steps.length - 1)];
    qs("#predictStatusText").textContent = percent === 100 ? "预测完成" : message;
    qs("#predictPercentText").textContent = `${percent}%`;
    qs("#predictProgressBar").style.width = `${percent}%`;
    appendPredictLog(message);

    if (percent === 100) {
      clearInterval(timer);
      const rows = buildForecastRows();
      renderPredictResults(rows);
      if (onDone) onDone(rows);
    }
  }, 220);
}
