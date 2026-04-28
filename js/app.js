import { libraryInfo, loadAllDatasets } from "./core/dataService.js";
import { state } from "./core/state.js";
import { nowTimeString, qs, qsa } from "./core/utils.js";
import { renderRealtime } from "./modules/realtime.js";
import { renderHistory } from "./modules/history.js";
import { resetPredictForm, renderPredictResults, runPrediction } from "./modules/predict.js";
import { renderDecision } from "./modules/decision.js";
import { renderCompare } from "./modules/compare.js";
import { exportCharts, exportDecisionReport, exportForecastCSV, exportHistoryCSV } from "./modules/exporter.js";
import { applyFontSize, applyTheme, updateClock } from "./modules/settings.js";
import { clearLogs, log } from "./modules/logger.js";

const topNavItems = [
  ["home", "首页"],
  ["data", "数据管理"],
  ["predict", "预测分析"],
  ["decision", "决策建议"],
  ["compare", "模型对比"],
  ["about", "关于系统"]
];

const sideNavItems = [
  ["realtime", "实时数据监控"],
  ["history", "历史数据查询"],
  ["params", "预测参数设置"],
  ["strategy", "决策策略生成"],
  ["export", "数据导出"],
  ["settings", "系统设置"]
];

function readLaunchOptions() {
  const params = new URLSearchParams(window.location.search);
  return {
    page: params.get("page"),
    autostart: params.get("autostart") === "1",
    scene: params.get("scene")
  };
}

function renderTopNav() {
  qs("#topNav").innerHTML = topNavItems
    .map(
      ([key, label]) =>
        `<button data-page="${key}" class="top-nav-btn rounded-panel px-4 py-2 text-[14px] font-medium transition hover:bg-primary/8 hover:text-primary">${label}</button>`
    )
    .join("");
}

function showOverlay(title, message, mode = "loading") {
  qs("#appStateOverlay").classList.remove("hidden");
  qs("#appStateOverlay").classList.add("flex");
  qs("#overlayTitle").textContent = title;
  qs("#overlayMessage").textContent = message;
  qs("#overlayBadge").textContent = mode === "error" ? "加载失败" : mode === "empty" ? "暂无数据" : "系统加载中";
  qs("#overlayActions").classList.toggle("hidden", mode !== "error");
  qs("#overlayActions").classList.toggle("flex", mode === "error");
}

function hideOverlay() {
  qs("#appStateOverlay").classList.add("hidden");
  qs("#appStateOverlay").classList.remove("flex");
}

function renderSideNav() {
  qs("#sideNav").innerHTML = sideNavItems
    .map(
      ([key, label]) =>
        `<button data-side="${key}" class="side-nav-btn flex w-full items-center gap-3 rounded-panel px-3 py-3 text-left text-[14px] font-medium text-slate-600 transition hover:bg-primary/8 hover:text-primary">
          <span class="text-primary">•</span>
          <span class="side-text">${label}</span>
        </button>`
    )
    .join("");
}

function pageTitle(page) {
  return Object.fromEntries(topNavItems)[page];
}

function activateTopNav(page) {
  qsa(".top-nav-btn").forEach((button) => {
    if (button.dataset.page === page) {
      button.className =
        "top-nav-btn rounded-panel bg-primary px-4 py-2 text-[14px] font-medium text-white shadow-soft";
    } else {
      button.className =
        "top-nav-btn rounded-panel px-4 py-2 text-[14px] font-medium text-slate-600 transition hover:bg-primary/8 hover:text-primary";
    }
  });
}

function activateSideNav(side) {
  qsa(".side-nav-btn").forEach((button) => {
    if (button.dataset.side === side) {
      button.className =
        "side-nav-btn flex w-full items-center gap-3 rounded-panel bg-primary px-3 py-3 text-left text-[14px] font-medium text-white shadow-soft";
    } else {
      button.className =
        "side-nav-btn flex w-full items-center gap-3 rounded-panel px-3 py-3 text-left text-[14px] font-medium text-slate-600 transition hover:bg-primary/8 hover:text-primary";
    }
  });
}

function renderPage(page) {
  state.page = page;
  qsa(".page-section").forEach((section) => {
    section.classList.toggle("hidden", section.id !== `page-${page}`);
  });
  activateTopNav(page);

  if (page === "home") renderRealtime();
  if (page === "data") renderHistory();
  if (page === "predict" && state.forecast.length) renderPredictResults(state.forecast);
  if (page === "decision") renderDecision();
  if (page === "compare") renderCompare();

  log(`切换到${pageTitle(page)}页面。`);
}

function routeBySide(side) {
  state.side = side;
  activateSideNav(side);
  const routeMap = {
    realtime: "home",
    history: "data",
    params: "predict",
    strategy: "decision",
    export: "about",
    settings: "about"
  };
  renderPage(routeMap[side] || "home");
}

function toggleSidebar() {
  const sidebar = qs("#sidebar");
  const main = qs("#mainContent");
  const title = qs("#sidebarTitle");
  const collapsed = sidebar.classList.toggle("w-[88px]");
  sidebar.classList.toggle("w-[250px]", !collapsed);
  main.style.left = collapsed ? "88px" : "250px";
  qsa(".side-text").forEach((element) => element.classList.toggle("hidden", collapsed));
  title.classList.toggle("hidden", collapsed);
  qs("#toggleSidebar").innerHTML = collapsed ? "▶" : "◀";
}

function bindRealtime() {
  qsa(".grain-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.grain = button.dataset.grain;
      qsa(".grain-btn").forEach((item) => {
        item.className =
          item === button
            ? "grain-btn rounded-panel bg-primary px-3 py-1 text-[12px] font-medium text-white"
            : "grain-btn rounded-panel bg-bgsoft px-3 py-1 text-[12px] text-slate-500";
      });
      renderRealtime();
      log(`切换到${button.textContent}粒度监控。`);
    });
  });
}

function bindHistory() {
  qs("#historyKeyword").addEventListener("input", renderHistory);
  qs("#historyPageSize").addEventListener("change", renderHistory);
  qs("#reloadHistoryBtn").addEventListener("click", () => {
    renderHistory();
    log("历史数据已重新加载。");
  });
  qsa(".history-metric-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.historyMetric = button.dataset.historyMetric;
      qsa(".history-metric-btn").forEach((item) => {
        item.className =
          item === button
            ? "history-metric-btn rounded-panel bg-primary px-3 py-1 text-[12px] font-medium text-white"
            : "history-metric-btn rounded-panel bg-bgsoft px-3 py-1 text-[12px] text-slate-500";
      });
      renderHistory();
    });
  });
}

function bindPredict() {
  const defaultDate = new Date().toISOString().slice(0, 10);
  qs("#predictStartDate").value = defaultDate;
  qs("#resetPredictBtn").addEventListener("click", () => {
    resetPredictForm();
    log("预测参数已重置。");
  });
  qs("#saveTemplateBtn").addEventListener("click", () => {
    log("当前参数模板已保存到前端状态。");
  });
  qs("#runPredictBtn").addEventListener("click", () => {
    runPrediction(() => {
      renderDecision();
      renderPage("decision");
      log("预测完成并已生成场景化决策建议。");
    });
  });
}

function bindDecision() {
  qsa(".scene-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.scene = button.dataset.scene;
      qsa(".scene-btn").forEach((item) => {
        item.className =
          item === button
            ? "scene-btn rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
            : "scene-btn rounded-full bg-bgsoft px-4 py-2 text-sm text-slate-500";
      });
      renderDecision();
      log(`切换到${button.textContent}决策场景。`);
    });
  });
  qs("#exportDecisionBtn").addEventListener("click", exportDecisionReport);
}

function bindExportAndSettings() {
  qs("#exportHistoryBtn").addEventListener("click", exportHistoryCSV);
  qs("#exportForecastBtn").addEventListener("click", exportForecastCSV);
  qs("#exportChartsBtn").addEventListener("click", exportCharts);

  qs("#themeSelect").addEventListener("change", (event) => {
    state.theme = event.target.value;
    applyTheme(state.theme);
    log(`主题已切换为${state.theme === "dark" ? "深色" : "浅色"}。`);
  });
  qs("#fontSizeRange").addEventListener("input", (event) => {
    state.fontSize = Number(event.target.value);
    applyFontSize(state.fontSize);
  });
  qs("#refreshSelect").addEventListener("change", (event) => {
    state.refreshSeconds = Number(event.target.value);
    log(`实时刷新频率已设置为 ${state.refreshSeconds} 秒。`);
  });
}

function bindGlobalActions() {
  qsa(".jump-btn").forEach((button) => {
    button.addEventListener("click", () => renderPage(button.dataset.jump));
  });
  qs("#quickStartBtn").addEventListener("click", () => {
    renderPage("predict");
    runPrediction(() => {
      renderDecision();
      renderPage("decision");
      log("快速开始已完成预测与决策生成。");
    });
  });
  qs("#clearLogsBtn").addEventListener("click", () => {
    clearLogs();
    log("系统日志已清空。");
  });
  qs("#toggleSidebar").addEventListener("click", toggleSidebar);
  qs("#retryLoadBtn").addEventListener("click", () => initialize(true));

  qsa(".top-nav-btn").forEach((button) => {
    button.addEventListener("click", () => renderPage(button.dataset.page));
  });
  qsa(".side-nav-btn").forEach((button) => {
    button.addEventListener("click", () => routeBySide(button.dataset.side));
  });
}

async function initialize(isRetry = false) {
  const launchOptions = readLaunchOptions();
  showOverlay("正在加载数据资源", "系统正在读取本地数据集、模块配置和可视化资源，请稍候。", "loading");
  renderTopNav();
  renderSideNav();
  bindRealtime();
  bindHistory();
  bindPredict();
  bindDecision();
  bindExportAndSettings();
  bindGlobalActions();

  state.datasets = await loadAllDatasets();
  qs("#chartVersionLabel").textContent = libraryInfo.chartJs;
  if (!state.datasets.realtimeHour?.length || !state.datasets.history?.length) {
    showOverlay("数据集为空", "系统没有读取到有效的数据内容，请检查 data 目录中的 JSON/CSV 文件。", "empty");
    return;
  }
  renderRealtime();
  renderHistory();
  renderCompare();
  renderDecision();
  routeBySide("realtime");
  if (launchOptions.scene && ["industrial", "residential", "storage"].includes(launchOptions.scene)) {
    state.scene = launchOptions.scene;
    renderDecision();
  }
  if (launchOptions.autostart) {
    await new Promise((resolve) => {
      runPrediction(() => {
        renderDecision();
        resolve();
      });
    });
  }
  if (launchOptions.page && topNavItems.some(([key]) => key === launchOptions.page)) {
    renderPage(launchOptions.page);
  }
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(() => {
    qs("#updateTime").textContent = nowTimeString();
    renderRealtime();
  }, state.refreshSeconds * 1000);
  hideOverlay();
  log("系统初始化完成，数据集和模块源码已加载。");
}

initialize().catch((error) => {
  console.error(error);
  showOverlay("加载失败", `系统初始化失败：${error.message}。请确认通过本地服务运行页面，或检查 data 目录是否完整。`, "error");
  log(`初始化失败：${error.message}`, "ERROR");
});
