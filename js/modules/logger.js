import { qs } from "../core/utils.js";

export function log(message, type = "INFO") {
  const panel = qs("#logPanel");
  if (!panel) return;
  panel.insertAdjacentHTML(
    "afterbegin",
    `<div class="rounded-panel border border-line bg-white p-3 shadow-sm">
      <div class="flex justify-between">
        <span class="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">${type}</span>
        <span class="text-[11px] text-slate-400">${new Date().toLocaleTimeString("zh-CN")}</span>
      </div>
      <p class="mt-2 text-xs leading-6 text-slate-600">${message}</p>
    </div>`
  );
}

export function clearLogs() {
  const panel = qs("#logPanel");
  if (panel) {
    panel.innerHTML = "";
  }
}
