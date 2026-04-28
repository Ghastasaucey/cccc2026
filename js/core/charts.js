import { state } from "./state.js";

function ensureChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return null;
  if (state.charts[canvasId]) {
    state.charts[canvasId].destroy();
  }
  state.charts[canvasId] = new Chart(canvas, config);
  return state.charts[canvasId];
}

export function renderLineChart(canvasId, labels, datasets, extraOptions = {}) {
  return ensureChart(canvasId, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { usePointStyle: true } }
      },
      scales: {
        x: {
          grid: { color: "#EEF2F8" },
          ticks: { color: "#64748B" }
        },
        y: {
          grid: { color: "#EEF2F8" },
          ticks: { color: "#64748B" }
        }
      },
      ...extraOptions
    }
  });
}

export function renderBarChart(canvasId, labels, datasets, extraOptions = {}) {
  return ensureChart(canvasId, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { usePointStyle: true } }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#64748B" }
        },
        y: {
          grid: { color: "#EEF2F8" },
          ticks: { color: "#64748B" }
        }
      },
      ...extraOptions
    }
  });
}

export function renderRadarChart(canvasId, labels, datasets, extraOptions = {}) {
  return ensureChart(canvasId, {
    type: "radar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: "#E2E8F0" },
          grid: { color: "#E2E8F0" },
          pointLabels: { color: "#475569" },
          ticks: { backdropColor: "transparent", color: "#94A3B8" }
        }
      },
      ...extraOptions
    }
  });
}
