import { qs } from "../core/utils.js";

export function applyTheme(theme) {
  const body = document.body;
  if (theme === "dark") {
    body.classList.remove("from-[#EAF2FF]", "via-bgsoft", "to-[#EEF4F2]", "text-ink");
    body.classList.add("from-[#0B1220]", "via-[#111827]", "to-[#0F172A]", "text-slate-100");
  } else {
    body.classList.remove("from-[#0B1220]", "via-[#111827]", "to-[#0F172A]", "text-slate-100");
    body.classList.add("from-[#EAF2FF]", "via-bgsoft", "to-[#EEF4F2]", "text-ink");
  }
}

export function applyFontSize(value) {
  document.documentElement.style.fontSize = `${value}px`;
}

export function updateClock() {
  qs("#currentTime").textContent = new Date().toLocaleString("zh-CN");
  qs("#updateTime").textContent = new Date().toLocaleTimeString("zh-CN");
}
