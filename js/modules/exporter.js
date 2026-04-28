import { state } from "../core/state.js";
import { downloadText, toCSV } from "../core/utils.js";

function updateProgress(name, doneCallback) {
  const text = document.querySelector("#exportStatusText");
  const percent = document.querySelector("#exportPercentText");
  const bar = document.querySelector("#exportProgressBar");
  let current = 0;
  text.textContent = `${name} 准备中`;
  const timer = setInterval(() => {
    current += 20;
    percent.textContent = `${current}%`;
    bar.style.width = `${current}%`;
    text.textContent = current >= 100 ? `${name} 已完成` : `${name} 处理中`;
    if (current >= 100) {
      clearInterval(timer);
      doneCallback();
    }
  }, 160);
}

export function exportHistoryCSV() {
  updateProgress("历史数据导出", () => {
    const csv = toCSV(
      ["日期", "时间", "电价", "负荷", "天气"],
      state.datasets.history.map((item) => [item.date, item.time, item.price, item.load, item.weather])
    );
    downloadText("历史数据.csv", csv, "text/csv;charset=utf-8");
  });
}

export function exportForecastCSV() {
  updateProgress("预测结果导出", () => {
    const csv = toCSV(
      ["日期", "时间", "预测电价", "预测负荷", "峰谷"],
      state.forecast.map((item) => [item.date, item.time, item.price, item.load, item.period])
    );
    downloadText("预测结果.csv", csv, "text/csv;charset=utf-8");
  });
}

export function exportCharts() {
  updateProgress("图表导出", () => {
    ["historyChart", "forecastChart", "priceChart", "loadChart"].forEach((chartId) => {
      const chart = state.charts[chartId];
      if (!chart) return;
      const link = document.createElement("a");
      link.href = chart.toBase64Image();
      link.download = `${chartId}.png`;
      link.click();
    });
  });
}

export function exportDecisionReport() {
  const overview = document.querySelector("#decisionOverview")?.textContent || "";
  const cards = Array.from(document.querySelectorAll("#decisionCards > div")).map((item) => item.innerText.trim());
  const content = `智能电价预测与决策系统决策报告\n\n概览：\n${overview}\n\n详细策略：\n${cards.join("\n\n")}`;
  downloadText("决策报告.txt", content);
}
