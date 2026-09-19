const STORAGE_KEYS = {
  theme: "theme",
  showTitle: "showTitle",
  showTime: "showTime",
  showGo: "showGo",
  searchEngine: "searchEngine",
  backgroundStyle: "backgroundStyle",
  lang: "lang",
  clockFormat: "clockFormat",
  searchStyle: "searchStyle",
  showClickFx: "showClickFx"
};
const SEARCH_URLS = {
  google: "https://www.google.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
  qwant: "https://www.qwant.com/?q=",
  bing: "https://www4.bing.com/search?q=",
  baidu: "https://www.baidu.com/s?wd="
};
const SEARCH_ENGINES = ["browser", "google", "duckduckgo", "qwant", "bing", "baidu"];
const I18N = {
  en: {
    searchTitle: "Search title",
    timeDisplay: "Time Display",
    showGo: "Search button",
    background: "Background",
    blankBackground: "Blank",
    dotBackground: "Dot Grid",
    stripeBackground: "Stripes",
    clickEffects: "Click Effects",
    theme: "Theme",
    auto: "Auto",
    light: "Light",
    dark: "Dark",
    searchEngine: "Search Engine",
    browserDefault: "Browser Default",
    google: "Google",
    duckduckgo: "DuckDuckGo",
    qwant: "Qwant",
    bing: "Bing",
    baidu: "Baidu",
    language: "Language",
    english: "English",
    chinese: "中文",
    clockFormat: "Clock Format",
    clock12h: "12-hour",
    clock24h: "24-hour",
    placeholder: "Type to search...",
    go: "Go",
    searchStyle: "Search Box Style",
    square: "Square",
    rounded: "Rounded",
    line: "Line",
    appearance: "Appearance",
    searchBoxTab: "Search Box",
    shortcutsTab: "Shortcuts",
    advanced: "Advanced",
    customCSS: "Custom CSS",
    comingSoon: "Coming soon"
  },
  zh: {
    searchTitle: "显示标题",
    timeDisplay: "时间显示",
    showGo: "搜索按钮",
    background: "背景",
    blankBackground: "空白",
    dotBackground: "点阵",
    stripeBackground: "条纹",
    clickEffects: "点击特效",
    theme: "主题",
    auto: "自动",
    light: "浅色",
    dark: "深色",
    searchEngine: "搜索引擎",
    browserDefault: "跟随浏览器",
    google: "Google",
    duckduckgo: "DuckDuckGo",
    qwant: "Qwant",
    bing: "Bing",
    baidu: "百度",
    language: "语言",
    english: "English",
    chinese: "中文",
    clockFormat: "时钟格式",
    clock12h: "12小时制",
    clock24h: "24小时制",
    placeholder: "输入搜索内容...",
    go: "前往",
    searchStyle: "搜索框样式",
    square: "方形",
    rounded: "圆角矩形",
    line: "横线",
    appearance: "外观",
    searchBoxTab: "搜索框",
    shortcutsTab: "快捷方式",
    advanced: "高级",
    customCSS: "自定义 CSS",
    comingSoon: "即将推出"
  }
};
function t(key) {
  return I18N[getLang()][key] || key;
}
function getStored(key, valid, fallback) {
  const v = localStorage.getItem(key);
  return valid.includes(v) ? v : fallback;
}
function setStored(key, value) {
  localStorage.setItem(key, value);
}
// One-time migration: older versions stored "showDots" instead of "backgroundStyle".
function migrateLegacySettings() {
  try {
    if (localStorage.getItem(STORAGE_KEYS.backgroundStyle) === null &&
        localStorage.getItem("showDots") === "true") {
      localStorage.setItem(STORAGE_KEYS.backgroundStyle, "dots");
    }
    localStorage.removeItem("showDots");
  } catch (_) { /* localStorage may be unavailable */ }
}
function detectBrowserLang() {
  const nav = navigator.language || navigator.userLanguage || "";
  return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
}
function isFirefox() {
  return typeof browser !== "undefined" && typeof browser.runtime?.getBrowserInfo === "function";
}
// Keep <html lang> and the document title in sync with the UI language.
// newtab.html ships lang="en"/"New Tab" as a pre-JS fallback only.
function applyDocumentLang() {
  const zh = getLang() === "zh";
  document.documentElement.lang = zh ? "zh-CN" : "en";
  document.title = zh ? "新标签页" : "New tab";
}
function getLang() {
  const stored = localStorage.getItem(STORAGE_KEYS.lang);
  if (stored === "en" || stored === "zh") return stored;
  const detected = detectBrowserLang();
  setStored(STORAGE_KEYS.lang, detected);
  return detected;
}
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  setStored(STORAGE_KEYS.theme, theme);
}
function updatePrompt() {
  const prompt = document.querySelector(".prompt");
  const showTitle = getStored(STORAGE_KEYS.showTitle, ["true", "false"], "true") === "true";
  prompt.classList.toggle("hidden", !showTitle);
}
function updateTime() {
  const el = document.getElementById("time");
  const showTime = getStored(STORAGE_KEYS.showTime, ["true", "false"], "false") === "true";
  if (!el) return;
  el.classList.toggle("hidden", !showTime);
  if (!showTime) return;
  const now = new Date();
  const format = getStored(STORAGE_KEYS.clockFormat, ["12", "24"], "24");
  if (format === "12") {
    const h = now.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    el.textContent = `${String(h12).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${ampm}`;
  } else {
    el.textContent = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
}
function updateDots() {
  const stored = localStorage.getItem(STORAGE_KEYS.backgroundStyle);
  const backgroundStyle = stored === "blank" || stored === "dots" || stored === "stripes" ? stored : "blank";
  document.body.classList.remove("bg-blank", "bg-dots", "bg-stripes");
  document.body.classList.add(`bg-${backgroundStyle}`);
}
let clickFxActive = false;
function updateClickFx() {
  const show = getStored(STORAGE_KEYS.showClickFx, ["true", "false"], "true") === "true";
  if (show && !clickFxActive) {
    document.addEventListener("mousedown", onMouseDown);
    clickFxActive = true;
  } else if (!show && clickFxActive) {
    document.removeEventListener("mousedown", onMouseDown);
    clickFxActive = false;
  }
}
function onMouseDown(e) {
  const colors = ["var(--fg)", "var(--muted)", "var(--border)"];
  for (let i = 0; i < 18; i++) {
    const angle = Math.PI * 2 * i / 18 + (Math.random() - 0.5) * 0.5;
    const speed = 80 + Math.random() * 200;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = 2 + Math.random() * 5;
    const life = 400 + Math.random() * 400;
    const el = document.createElement("div");
    el.className = "px px-burst";
    el.style.left = e.clientX + "px";
    el.style.top = e.clientY + "px";
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.setProperty("--life", life + "ms");
    document.body.appendChild(el);
    const start = performance.now();
    (function anim(now) {
      const t2 = Math.min((now - start) / life, 1);
      const ease = 1 - t2 * t2;
      el.style.left = e.clientX + vx * t2 * ease + "px";
      el.style.top = e.clientY + vy * t2 * ease + 60 * t2 * t2 + "px";
      if (t2 < 1) requestAnimationFrame(anim);
      else el.remove();
    })(start);
  }
}
function updateGo() {
  const goBtn = document.querySelector(".search-go");
  const showGo = getStored(STORAGE_KEYS.showGo, ["true", "false"], "true") === "true";
  if (goBtn) goBtn.classList.toggle("hidden", !showGo);
}
function updateSearchStyle() {
  const form = document.getElementById("search-form");
  const style = getStored(STORAGE_KEYS.searchStyle, ["square", "rounded", "line"], "square");
  if (!form) return;
  form.classList.remove("style-square", "style-rounded", "style-line");
  form.classList.add(`style-${style}`);
}
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
const LICENSE_PLACEHOLDER = "__LICENSE_PLACEHOLDER__";
let cachedLicenseText = null;
async function loadLicenseText() {
  if (cachedLicenseText !== null) return cachedLicenseText;
  try {
    const url = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL("LICENSE")
      : "LICENSE";
    const res = await fetch(url);
    cachedLicenseText = await res.text();
  } catch (e) {
    cachedLicenseText = "";
  }
  return cachedLicenseText;
}
// Easter-egg text, hard-coded on purpose: the shipped extension carries no loose
// data file for this. EASTER.MD in the repository root is the editable working
// copy — when it changes, update this constant to match (keep it a verbatim copy,
// including the {{version}} placeholder, which is substituted at render time).
const EASTER_CONTENT = `**dotStart** {{version}}

一个 现代 · 极简 · 干净 的新标签页
A modern · minimal · clean new tab page


**# 仓库 Repository**

https://github.com/alt021/dotStart


**# 制作者 Creator**

AmeXE2
ChatGPT
Xiaomi MiMO


**# 联系我们 Contact**

alts.tech@hotmail.com


**# 发行日志 Release Notes**

// rel#2.1.0-20260911-Hotfix
  **修复** 解决Firefox和Chrome机制冲突问题
  **Fixed** Resolved Firefox/Chrome mechanism conflict

// rel#2.1.0-20260812
  **修复** 适配Firefox浏览器
  **Fixed** Firefox browser compatibility

// rel#2.0.0-20260730
  **新增** 条纹背景模式
  **Added** Stripe background mode
  **修复** 修改项目主视觉效果
  **Fixed** Modified main visual effect
  **修复** 移除对npm的依赖
  **Fixed** Removed npm dependency
  **修复** 使用引导适配深色模式
  **Fixed** Onboarding adapted for dark mode`;

// Crawl speed of the Easter egg in device pixels per second. The element has to
// travel its own height plus one viewport to fully leave the screen, so
// showEasterEgg() derives the animation duration from that distance.
const EASTER_CRAWL_SPEED = 150;

function getRuntimeVersion() {
  return (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest)
    ? chrome.runtime.getManifest().version
    : "dev";
}
let onboardingStep = 0;
const ONBOARDING_I18N = {
  zh: {
    pages: [
      `<div class="onboarding-center">
         <div class="onboarding-emoji">\u{1F44B}</div>
          <div class="onboarding-title">欢迎使用dotStart</div>
         <div class="onboarding-subtitle">一个现代 \xB7 极简 \xB7 纯净的浏览器主页</div>
       </div>`,
      `<div class="onboarding-col">
         <div class="onboarding-title">开源说明与使用许可</div>
         <div class="onboarding-subtitle">请仔细阅读相关说明</div>
         <div class="onboarding-scroll">
           <h3>扩展说明</h3>
            <ol>
              <li>本项目为Vibe Coding产物，仅供作者自用。代码质量较差，如有需要请自行重构或修改。</li>
              <li>本扩展完全离线运行，不收集、上传或存储任何有关于您的数据或信息。</li>
            </ol>
           <h3>开源说明</h3>
           <pre style="white-space:pre-wrap;font-family:inherit;margin:0.5rem 0">${escapeHTML(LICENSE_PLACEHOLDER)}</pre>
         </div>
       </div>`,
      `<div class="onboarding-col">
         <div class="onboarding-title">使用方法</div>
         <div class="onboarding-subtitle">点按右键打开设置面板</div>
         <img class="onboarding-img onboarding-img-light" src="scrshot-light.png" alt="右键菜单截图">
         <img class="onboarding-img onboarding-img-dark" src="scrshot-dark.png" alt="右键菜单截图">
       </div>`,
      `<div class="onboarding-center">
         <div class="onboarding-emoji">\u{1F389}</div>
         <div class="onboarding-title">欢迎使用</div>
       </div>`
    ],
    btns: ["开始", "同意", "继续", "完成"],
    hint: "滚动阅读至底部后可进行下一步"
  },
  en: {
    pages: [
      `<div class="onboarding-center">
         <div class="onboarding-emoji">\u{1F44B}</div>
          <div class="onboarding-title">Welcome to dotStart</div>
         <div class="onboarding-subtitle">A modern \xB7 minimal \xB7 clean browser homepage</div>
       </div>`,
      `<div class="onboarding-col">
         <div class="onboarding-title">Open Source & License</div>
         <div class="onboarding-subtitle">Please read the following carefully</div>
         <div class="onboarding-scroll">
           <h3>About This Extension</h3>
            <ol>
              <li>This project is a Vibe Coding product, intended for personal use only. Code quality may be poor — feel free to refactor or modify as needed.</li>
              <li>This extension runs entirely offline. It does not collect, upload, or store any of your data or information.</li>
            </ol>
           <h3>Open Source License</h3>
           <pre style="white-space:pre-wrap;font-family:inherit;margin:0.5rem 0">${escapeHTML(LICENSE_PLACEHOLDER)}</pre>
         </div>
       </div>`,
      `<div class="onboarding-col">
         <div class="onboarding-title">How to Use</div>
         <div class="onboarding-subtitle">Right-click to open the settings panel</div>
         <img class="onboarding-img onboarding-img-light" src="scrshot-light.png" alt="Context menu screenshot">
         <img class="onboarding-img onboarding-img-dark" src="scrshot-dark.png" alt="Context menu screenshot">
       </div>`,
      `<div class="onboarding-center">
         <div class="onboarding-emoji">\u{1F389}</div>
         <div class="onboarding-title">Enjoy!</div>
       </div>`
    ],
    btns: ["Start", "Agree", "Continue", "Finish"],
    hint: "Scroll to the bottom to proceed"
  }
};
async function showOnboarding() {
  if (localStorage.getItem("onboardingDone") === "true") return;
  const lang = getLang();
  const ob = ONBOARDING_I18N[lang];
  const licenseText = escapeHTML(await loadLicenseText());
  const overlay = document.createElement("div");
  overlay.className = "onboarding-overlay";
  overlay.id = "onboarding-overlay";
  const dialog = document.createElement("div");
  dialog.className = "onboarding-dialog";
  const slider = document.createElement("div");
  slider.className = "onboarding-slider";
  const panels = [];
  ob.pages.forEach((html, i) => {
    const panel = document.createElement("div");
    panel.className = "onboarding-panel";
    panel.innerHTML = html.split(LICENSE_PLACEHOLDER).join(licenseText);
    panel.style.transform = `translateX(${i * 100}%)`;
    slider.appendChild(panel);
    panels.push(panel);
  });
  const footer = document.createElement("div");
  footer.className = "onboarding-footer";
  const hint = document.createElement("div");
  hint.className = "onboarding-hint hidden";
  hint.textContent = ob.hint;
  const btn = document.createElement("button");
  btn.className = "onboarding-btn";
  btn.textContent = ob.btns[0];
  let scrollReached = false;
  function updateStepUI() {
    btn.textContent = ob.btns[onboardingStep];
    if (onboardingStep === 1) {
      if (scrollReached) {
        btn.disabled = false;
        hint.classList.add("hidden");
        return;
      }
      btn.disabled = true;
      hint.classList.remove("hidden");
      const scroll = panels[1].querySelector(".onboarding-scroll");
      if (scroll) {
        const onScroll = () => {
          if (scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 4) {
            scrollReached = true;
            btn.disabled = false;
            hint.classList.add("hidden");
            scroll.removeEventListener("scroll", onScroll);
          }
        };
        scroll.removeEventListener("scroll", onScroll);
        scroll.addEventListener("scroll", onScroll);
      }
    } else {
      btn.disabled = false;
      hint.classList.add("hidden");
    }
  }
  btn.addEventListener("click", () => {
    onboardingStep++;
    if (onboardingStep > 3) {
      localStorage.setItem("onboardingDone", "true");
      overlay.classList.remove("visible");
      setTimeout(() => overlay.remove(), 300);
      return;
    }
    panels.forEach((p, i) => {
      p.style.transform = `translateX(${(i - onboardingStep) * 100}%)`;
    });
    updateStepUI();
  });
  footer.appendChild(hint);
  footer.appendChild(btn);
  dialog.appendChild(slider);
  dialog.appendChild(footer);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));
}
function updatePlaceholder() {
  const input = document.getElementById("search-input");
  const placeholder = document.querySelector(".search-placeholder");
  if (!input || !placeholder) return;
  placeholder.textContent = t("placeholder");
  placeholder.classList.toggle("hidden", input.value.length > 0);
}
function updateUI() {
  const input = document.getElementById("search-input");
  const goBtn = document.querySelector(".search-go");
  if (input) input.placeholder = "";
  if (goBtn) goBtn.textContent = t("go");
  updatePlaceholder();
}
const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^\[[\da-fA-F:]+\]$/;
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const PORT_RE = /:\d{1,5}$/;
function isURL(query) {
  if (/^https?:\/\//i.test(query)) return true;
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(query)) return true;
  const withoutPort = PORT_RE.test(query) ? query.replace(PORT_RE, "") : query;
  if (IPV4_RE.test(withoutPort)) return true;
  if (IPV6_RE.test(withoutPort)) return true;
  if (DOMAIN_RE.test(withoutPort)) return true;
  return false;
}
function openURL(url) {
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(url)) {
    window.location.href = url;
  } else {
    window.location.href = "https://" + url;
  }
}
function search(query) {
  if (isURL(query)) {
    openURL(query);
    return;
  }
  const engine = getStored(STORAGE_KEYS.searchEngine, SEARCH_ENGINES, "browser");
  if (engine === "browser" && typeof chrome !== "undefined" && chrome.search && typeof chrome.search.query === "function") {
    chrome.search.query({ text: query });
    return;
  }
  // Fallback: "browser" engine has no usable provider here (Firefox, or Chrome <87).
  // Route to google unless another explicit engine is selected.
  const fallback = engine && engine !== "browser" && SEARCH_URLS[engine] ? engine : "google";
  window.location.href = SEARCH_URLS[fallback] + encodeURIComponent(query);
}
// Bottom-sheet settings panel, opened by right-click. Four tabs:
// Appearance / Search Box / Shortcuts (reserved, intentionally empty) / Advanced.
const SETTINGS_TABS = ["appearance", "searchBoxTab", "shortcutsTab", "advanced"];
let settingsTab = "appearance";
let settingsPanelEl = null;

function toggleRow(action, checked, labelKey) {
  return `
    <button class="settings-row" data-action="${action}">
      <span class="menu-label">
        <span class="menu-check ${checked ? "checked" : ""}">${checked ? "&#10003;" : ""}</span>
        ${t(labelKey)}
      </span>
    </button>
  `;
}
function radioRow(action, value, selected, labelKey) {
  return `
    <button class="settings-row settings-row-sub" data-action="${action}" data-value="${value}">
      <span class="menu-label">
        <span class="menu-radio ${selected ? "selected" : ""}"></span>
        ${t(labelKey)}
      </span>
    </button>
  `;
}
function groupTitle(labelKey) {
  return `<div class="settings-group-title">${t(labelKey)}</div>`;
}
function getSettingsContentHTML() {
  const showTitle = getStored(STORAGE_KEYS.showTitle, ["true", "false"], "true") === "true";
  const showTime = getStored(STORAGE_KEYS.showTime, ["true", "false"], "false") === "true";
  const showGo = getStored(STORAGE_KEYS.showGo, ["true", "false"], "true") === "true";
  const showClickFx = getStored(STORAGE_KEYS.showClickFx, ["true", "false"], "true") === "true";
  const backgroundStyle = getStored(STORAGE_KEYS.backgroundStyle, ["blank", "dots", "stripes"], "blank");
  const theme = getStored(STORAGE_KEYS.theme, ["auto", "light", "dark"], "auto");
  const engine = getStored(STORAGE_KEYS.searchEngine, SEARCH_ENGINES, "browser");
  const lang = getLang();
  const clock = getStored(STORAGE_KEYS.clockFormat, ["12", "24"], "24");
  const searchStyle = getStored(STORAGE_KEYS.searchStyle, ["square", "rounded", "line"], "square");

  if (settingsTab === "appearance") {
    return `
      ${toggleRow("toggle-title", showTitle, "searchTitle")}
      ${toggleRow("toggle-time", showTime, "timeDisplay")}
      ${groupTitle("clockFormat")}
      ${radioRow("set-clock", "12", clock === "12", "clock12h")}
      ${radioRow("set-clock", "24", clock === "24", "clock24h")}
      ${groupTitle("background")}
      ${radioRow("set-background", "blank", backgroundStyle === "blank", "blankBackground")}
      ${radioRow("set-background", "dots", backgroundStyle === "dots", "dotBackground")}
      ${radioRow("set-background", "stripes", backgroundStyle === "stripes", "stripeBackground")}
      ${groupTitle("theme")}
      ${radioRow("set-theme", "auto", theme === "auto", "auto")}
      ${radioRow("set-theme", "light", theme === "light", "light")}
      ${radioRow("set-theme", "dark", theme === "dark", "dark")}
      ${toggleRow("toggle-clickfx", showClickFx, "clickEffects")}
    `;
  }
  if (settingsTab === "searchBoxTab") {
    return `
      ${groupTitle("searchEngine")}
      ${isFirefox() ? "" : radioRow("set-engine", "browser", engine === "browser", "browserDefault")}
      ${radioRow("set-engine", "google", engine === "google", "google")}
      ${radioRow("set-engine", "duckduckgo", engine === "duckduckgo", "duckduckgo")}
      ${radioRow("set-engine", "qwant", engine === "qwant", "qwant")}
      ${radioRow("set-engine", "bing", engine === "bing", "bing")}
      ${radioRow("set-engine", "baidu", engine === "baidu", "baidu")}
      ${groupTitle("searchStyle")}
      ${radioRow("set-style", "square", searchStyle === "square", "square")}
      ${radioRow("set-style", "rounded", searchStyle === "rounded", "rounded")}
      ${radioRow("set-style", "line", searchStyle === "line", "line")}
      ${toggleRow("toggle-go", showGo, "showGo")}
    `;
  }
  if (settingsTab === "shortcutsTab") {
    // Reserved for a future shortcuts implementation.
    return "";
  }
  // advanced
  return `
    ${groupTitle("language")}
    ${radioRow("set-lang", "en", lang === "en", "english")}
    ${radioRow("set-lang", "zh", lang === "zh", "chinese")}
    ${groupTitle("customCSS")}
    <button class="settings-row" data-action="custom-css" disabled>
      <span class="menu-label">${t("customCSS")}</span>
      <span class="settings-soon">${t("comingSoon")}</span>
    </button>
  `;
}
function renderSettingsPanel() {
  if (!settingsPanelEl) return;
  settingsPanelEl.querySelectorAll(".settings-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === settingsTab);
    btn.setAttribute("aria-selected", btn.dataset.tab === settingsTab ? "true" : "false");
  });
  settingsPanelEl.querySelector(".settings-content").innerHTML = getSettingsContentHTML();
}
function openSettingsPanel() {
  if (!settingsPanelEl) return;
  renderSettingsPanel();
  settingsPanelEl.classList.add("visible");
}
function closeSettingsPanel() {
  if (settingsPanelEl) settingsPanelEl.classList.remove("visible");
}
function settingsPanelVisible() {
  return !!settingsPanelEl && settingsPanelEl.classList.contains("visible");
}
document.addEventListener("DOMContentLoaded", async () => {
  migrateLegacySettings();
  applyDocumentLang();
  applyTheme(getStored(STORAGE_KEYS.theme, ["auto", "light", "dark"], "auto"));
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `
      <div class="main">
        <div class="prompt"><span>$</span> search</div>
        <div class="time" id="time"></div>
        <form class="search-form" id="search-form">
          <div class="search-box">
            <input type="text" class="search-input" id="search-input" autofocus>
            <span class="search-placeholder">Type to search...</span>
            <button type="submit" class="search-go" title="Go">Go</button>
          </div>
        </form>
      </div>
    `;
    updateDots();
    updateGo();
    updateSearchStyle();
    updatePrompt();
    updateTime();
    updateUI();
    updateClickFx();
    setInterval(updateTime, 1e3);
    showOnboarding().catch((e) => console.error("onboarding failed:", e));
    settingsPanelEl = document.createElement("div");
    settingsPanelEl.className = "settings-panel";
    settingsPanelEl.id = "settings-panel";
    settingsPanelEl.innerHTML = `
      <div class="settings-tabs" role="tablist">
        ${SETTINGS_TABS.map((tab) => `<button class="settings-tab" role="tab" data-tab="${tab}">${t(tab)}</button>`).join("")}
      </div>
      <div class="settings-content"></div>
    `;
    document.body.appendChild(settingsPanelEl);
    renderSettingsPanel();
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openSettingsPanel();
    });
    settingsPanelEl.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".settings-tab");
      if (tabBtn) {
        settingsTab = tabBtn.dataset.tab;
        renderSettingsPanel();
        return;
      }
      const item = e.target.closest("[data-action]:not([disabled])");
      if (!item) return;
      const action = item.dataset.action;
      const value = item.dataset.value || "";
      switch (action) {
        case "toggle-title":
          setStored(STORAGE_KEYS.showTitle, getStored(STORAGE_KEYS.showTitle, ["true", "false"], "true") === "true" ? "false" : "true");
          updatePrompt();
          break;
        case "toggle-time":
          setStored(STORAGE_KEYS.showTime, getStored(STORAGE_KEYS.showTime, ["true", "false"], "false") === "true" ? "false" : "true");
          updateTime();
          break;
        case "set-background":
          setStored(STORAGE_KEYS.backgroundStyle, value);
          updateDots();
          break;
        case "toggle-go":
          setStored(STORAGE_KEYS.showGo, getStored(STORAGE_KEYS.showGo, ["true", "false"], "true") === "true" ? "false" : "true");
          updateGo();
          break;
        case "toggle-clickfx":
          setStored(STORAGE_KEYS.showClickFx, getStored(STORAGE_KEYS.showClickFx, ["true", "false"], "true") === "true" ? "false" : "true");
          updateClickFx();
          break;
        case "set-theme":
          applyTheme(value);
          break;
        case "set-engine":
          setStored(STORAGE_KEYS.searchEngine, value);
          break;
        case "set-clock":
          setStored(STORAGE_KEYS.clockFormat, value);
          updateTime();
          break;
        case "set-style":
          setStored(STORAGE_KEYS.searchStyle, value);
          updateSearchStyle();
          break;
        case "set-lang":
          setStored(STORAGE_KEYS.lang, value);
          applyDocumentLang();
          updateUI();
          // Re-render the tab bar too: the tab labels are translated text.
          settingsPanelEl.querySelectorAll(".settings-tab").forEach((btn) => {
            btn.textContent = t(btn.dataset.tab);
          });
          break;
      }
      renderSettingsPanel();
    });
    document.addEventListener("click", (e) => {
      if (settingsPanelVisible() && !settingsPanelEl.contains(e.target)) closeSettingsPanel();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSettingsPanel();
    });
    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    const placeholder = document.querySelector(".search-placeholder");
    input.addEventListener("focus", () => {
      placeholder.classList.add("hidden");
    });
    input.addEventListener("blur", () => {
      updatePlaceholder();
    });
    input.addEventListener("input", () => {
      updatePlaceholder();
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (query) search(query);
    });

    let searchClickCount = 0;
    let searchClickTimer = null;
    let easterEggActive = false;

    input.addEventListener("click", () => {
      if (easterEggActive) return;
      if (input.value.trim() !== "") {
        searchClickCount = 0;
        return;
      }
      searchClickCount++;
      if (searchClickTimer) clearTimeout(searchClickTimer);
      searchClickTimer = setTimeout(() => {
        searchClickCount = 0;
      }, 2000);
      if (searchClickCount >= 7) {
        searchClickCount = 0;
        showEasterEgg();
      }
    });

    function showEasterEgg() {
      easterEggActive = true;
      const guideContent = EASTER_CONTENT.trim().replaceAll("{{version}}", getRuntimeVersion());
      const overlay = document.createElement("div");
      overlay.className = "easter-egg-overlay";
      overlay.id = "easter-egg-overlay";
      for (let i = 0; i < 50; i++) {
        const star = document.createElement("div");
        star.className = "easter-egg-star";
        star.style.left = Math.random() * 100 + "%";
        star.style.animationDuration = (Math.random() * 3 + 2) + "s";
        star.style.animationDelay = Math.random() * 5 + "s";
        star.style.width = (Math.random() * 2 + 1) + "px";
        star.style.height = star.style.width;
        overlay.appendChild(star);
      }
      const content = document.createElement("div");
      content.className = "easter-egg-content";
      content.innerHTML = guideContent.split("\n").map(line => {
        if (line.trim() === "") {
          return "<br>";
        }
        return `<div>${line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>`;
      }).join("");
      overlay.appendChild(content);
      document.body.appendChild(overlay);
      // Constant crawl speed: the element must travel its own height plus one
      // viewport before it is fully off-screen, so derive the duration from that
      // distance. A fixed duration scrolled long text too fast and left a blank
      // screen while the leftover travel played out.
      const travel = content.offsetHeight + window.innerHeight;
      content.style.animationDuration = `${travel / EASTER_CRAWL_SPEED}s`;
      requestAnimationFrame(() => {
        overlay.classList.add("visible");
      });
      function exitEasterEgg() {
        if (!easterEggActive) return;
        easterEggActive = false;
        overlay.classList.remove("visible");
        setTimeout(() => overlay.remove(), 500);
        document.removeEventListener("keydown", onEsc);
        overlay.removeEventListener("dblclick", onDblClick);
      }
      function onEsc(e) {
        if (e.key === "Escape") exitEasterEgg();
      }
      function onDblClick() {
        exitEasterEgg();
      }
      document.addEventListener("keydown", onEsc);
      overlay.addEventListener("dblclick", onDblClick);
    }
  }
});
