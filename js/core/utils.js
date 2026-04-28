export const qs = (selector) => document.querySelector(selector);
export const qsa = (selector) => Array.from(document.querySelectorAll(selector));

export function formatPrice(value) {
  return Number(value).toFixed(3);
}

export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

export function classifyPeriod(hour, price) {
  if (hour <= 5 || price <= 0.42) return "低谷";
  if ((hour >= 10 && hour <= 14) || (hour >= 18 && hour <= 21) || price >= 0.72) return "高峰";
  return "平段";
}

export function downloadText(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function toCSV(headers, rows) {
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function nowTimeString() {
  return new Date().toLocaleString("zh-CN");
}

export function chunk(list, count) {
  const result = [];
  for (let i = 0; i < list.length; i += count) {
    result.push(list.slice(i, i + count));
  }
  return result;
}
