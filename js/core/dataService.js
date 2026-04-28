const dataFiles = {
  realtimeHour: "./data/realtime_hour.json",
  realtimeHalf: "./data/realtime_half_hour.json",
  history: "./data/history_data.json",
  modelMetrics: "./data/model_metrics.json",
  decisionScenes: "./data/decision_scenes.json",
  anomalyEvents: "./data/anomaly_events.json"
};

export const libraryInfo = {
  chartJs: "4.4.1",
  tailwind: "CDN runtime"
};

async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`读取数据失败: ${path}`);
  }
  return response.json();
}

export async function loadAllDatasets() {
  if (window.__EMBEDDED_DATASETS__) {
    return window.__EMBEDDED_DATASETS__;
  }
  const entries = await Promise.all(
    Object.entries(dataFiles).map(async ([key, path]) => [key, await readJson(path)])
  );
  return Object.fromEntries(entries);
}
