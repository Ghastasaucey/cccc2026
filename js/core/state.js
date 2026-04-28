export const state = {
  page: "home",
  side: "realtime",
  grain: "hour",
  historyMetric: "price",
  scene: "industrial",
  theme: "light",
  refreshSeconds: 30,
  fontSize: 16,
  forecast: [],
  charts: {},
  datasets: {
    realtimeHour: [],
    realtimeHalf: [],
    history: [],
    modelMetrics: [],
    decisionScenes: {},
    anomalyEvents: []
  }
};
