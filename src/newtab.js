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
  searchRadius: "searchRadius",
  searchBorder: "searchBorder",
  searchLength: "searchLength",
  searchTransparency: "searchTransparency",
  showClickFx: "showClickFx",
  shortcuts: "shortcuts",
  customCSS: "customCSS"
};
const SEARCH_URLS = {
  google: "https://www.google.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
  qwant: "https://www.qwant.com/?q=",
  bing: "https://www4.bing.com/search?q=",
  baidu: "https://www.baidu.com/s?wd="
};
const SEARCH_ENGINES = ["browser", "google", "duckduckgo", "qwant", "bing", "baidu"];
// Search box styles. "modern" replaced the old square + rounded pair, "geek"
// replaced the old underline ("line") style.
const SEARCH_STYLES = ["modern", "geek"];
// Old value -> new value. getStored() would fall back to "modern" for any
// unknown value, which would silently promote underline users, so map instead.
const LEGACY_SEARCH_STYLES = { square: "modern", rounded: "modern", line: "geek" };
// Allowed ranges for the numeric search box settings. `default` is both what is
// used when nothing is stored and what a stored 0 means: 0 is the documented
// "keep the default" entry for every one of these settings. `unit` is what the
// panel prints beside the value, and also what the stylesheet gets handed --
// except for the transparency, which travels as a bare number (see styleValue).
// Keep each `default` in step with the fallback in newtab.css.
const SEARCH_LIMITS = {
  radius: { min: 1, max: 60, default: 8, unit: "px" },
  border: { min: 1, max: 10, default: 1, unit: "px" },
  length: { min: 200, max: 1200, default: 500, unit: "px" },
  // How see-through the whole box is, in percent: 100 hides it entirely, 1 is a
  // barely perceptible fade. The default is 0 -- no transparency at all, ie the
  // box as it has always been drawn. This is the one setting whose default is
  // not a value inside its own range: the range starts at 1 because 0 is the
  // reserved "keep the default" token, and here the default *is* 0 percent.
  // Applies to both styles, so it means the same thing to a full box and to a
  // bare underline.
  transparency: { min: 1, max: 100, default: 0, unit: "%" }
};
// User-defined shortcuts shown in the bottom row. Four is the cap: it keeps the
// row on one line at any window width, and matches the 1-4 weight scale below.
const SHORTCUT_MAX = 4;
// Shortcut weight decides the left-to-right order (heaviest first). Unlike the
// search box sizes there is no "0 = keep the default" here -- an EMPTY weight
// field is how the dialog asks for the default, and 0 is simply out of range.
const SHORTCUT_WEIGHT = { min: 1, max: 4, default: 1 };
// Longest title the field accepts. A title longer than this would not fit a tile
// or the bottom row without being cut off mid-word.
const SHORTCUT_TITLE_MAX = 60;
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
    modern: "Modern",
    geek: "Geek",
    searchRadius: "Corner Radius",
    searchBorder: "Border Weight",
    searchLength: "Box Length",
    searchTransparency: "Box Transparency",
    rangeHint: "Range {min}-{max}{unit} · 0 = default ({default}{unit})",
    invalidNumber: "Enter a whole number from {min} to {max}, or 0",
    confirm: "OK",
    appearance: "Appearance",
    searchBoxTab: "Search Box",
    shortcutsTab: "Shortcuts",
    advanced: "Advanced",
    customCSS: "Custom CSS",
    customCSSHint: "Write CSS here. It overrides the built-in styles.",
    customCSSWarning: "Edit with care — this can stop the extension from working.",
    customCSSNotSet: "Not set",
    customCSSEnabled: "Enabled",
    on: "On",
    off: "Off",
    addShortcut: "Add shortcut",
    editShortcut: "Edit shortcut",
    shortcutTitle: "Title",
    shortcutUrl: "URL",
    weight: "Weight",
    weightHint: "Weight {min}-{max} · blank = {default}",
    errorTitle: "Enter a title",
    errorUrl: "Enter a web address",
    errorWeight: "Weight must be a whole number from {min} to {max}",
    delete: "Delete",
    close: "Close"
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
    modern: "现代",
    geek: "极客",
    searchRadius: "圆角大小",
    searchBorder: "框线粗细",
    searchLength: "搜索框长度",
    searchTransparency: "搜索框透明度",
    rangeHint: "范围 {min}–{max}{unit} · 0 = 默认（{default}{unit}）",
    invalidNumber: "请输入 {min}–{max} 之间的整数，或 0",
    confirm: "确定",
    appearance: "外观",
    searchBoxTab: "搜索框",
    shortcutsTab: "快捷方式",
    advanced: "高级",
    customCSS: "自定义 CSS",
    customCSSHint: "在此写入 CSS，将覆盖内置样式。",
    customCSSWarning: "请谨慎修改 这可能会导致扩展无法工作",
    customCSSNotSet: "未配置",
    customCSSEnabled: "已启用",
    on: "已启用",
    off: "已停用",
    addShortcut: "添加快捷方式",
    editShortcut: "编辑快捷方式",
    shortcutTitle: "标题",
    shortcutUrl: "网址",
    weight: "权重",
    weightHint: "权重 {min}–{max} · 留空 = {default}",
    errorTitle: "请输入标题",
    errorUrl: "请输入网址",
    errorWeight: "权重需为 {min}–{max} 之间的整数",
    delete: "删除",
    close: "关闭"
  }
};
function t(key) {
  return I18N[getLang()][key] || key;
}
// Fills {name} slots in an I18N string (range hints, validation messages).
function fmt(str, vars) {
  return str.replace(/\{(\w+)\}/g, (whole, key) => (key in vars ? vars[key] : whole));
}
function getStored(key, valid, fallback) {
  const v = localStorage.getItem(key);
  return valid.includes(v) ? v : fallback;
}
function setStored(key, value) {
  localStorage.setItem(key, value);
}
// Migrations. Both are idempotent and cheap enough to run on every load: older
// versions stored "showDots" instead of "backgroundStyle", and the search box
// styles were renamed (see LEGACY_SEARCH_STYLES).
function migrateLegacySettings() {
  try {
    if (localStorage.getItem(STORAGE_KEYS.backgroundStyle) === null &&
        localStorage.getItem("showDots") === "true") {
      localStorage.setItem(STORAGE_KEYS.backgroundStyle, "dots");
    }
    localStorage.removeItem("showDots");
    const style = localStorage.getItem(STORAGE_KEYS.searchStyle);
    if (style !== null && Object.prototype.hasOwnProperty.call(LEGACY_SEARCH_STYLES, style)) {
      localStorage.setItem(STORAGE_KEYS.searchStyle, LEGACY_SEARCH_STYLES[style]);
    }
  } catch (_) { /* localStorage may be unavailable */ }
}
function detectBrowserLang() {
  const nav = navigator.language || navigator.userLanguage || "";
  return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
}
// The namespace that can run a query through the browser's OWN default search
// engine, or null where there is none to be had. Chrome (>= 87) exposes
// chrome.search, Firefox (>= 111) browser.search; both are probed so callers
// never have to know which browser this is, with `browser` first -- Firefox
// publishes that one natively (promise-based) and only aliases it as `chrome`,
// so the native form is the safer call there.
//
// Capability, not sniffing: the probe asks for the METHOD, because Firefox
// 109/110 -- the versions before its search.query shipped -- have the `search`
// namespace without it, and must not be offered an engine that does nothing.
function defaultEngineAPI() {
  const namespaces = [];
  if (typeof browser !== "undefined") namespaces.push(browser);
  if (typeof chrome !== "undefined") namespaces.push(chrome);
  const found = namespaces.find((ns) => ns.search && typeof ns.search.query === "function");
  return found ? found.search : null;
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
// The bottom row -- the shortcut placement this page has always used. Rendered
// in display order, as plain anchors: no click handler is needed, and every href
// has been through normalizeURL(), so a script url cannot reach the attribute.
function updateShortcuts() {
  const row = document.getElementById("shortcuts");
  if (!row) return;
  const items = readShortcuts();
  row.innerHTML = items.map((s) =>
    `<a class="shortcut-item" href="${escapeHTML(s.url)}">${escapeHTML(s.title)}</a>`).join("");
  row.classList.toggle("hidden", items.length === 0);
}
// A value is acceptable when it is a whole number inside the range -- or the
// documented "keep the default" zero, which every numeric search box setting
// accepts. Single source of truth for both the dialog's validation and
// readLimit() below, so a rejected input and a stored value can never disagree
// about what 0 means.
function isValidLimit(n, spec) {
  if (!Number.isInteger(n)) return false;
  return n === 0 || (n >= spec.min && n <= spec.max);
}
// Resolves a stored numeric setting to the value actually in use: anything
// missing, non-integer, or out of range -- and the "keep the default" 0 --
// becomes the default from SEARCH_LIMITS. So a stored 0 and a stored default
// render identically, which is what the panel reports too.
function readLimit(key, spec) {
  const raw = localStorage.getItem(key);
  const n = raw === null || raw.trim() === "" ? NaN : Number(raw.trim());
  if (n === 0) return spec.default;
  return isValidLimit(n, spec) ? n : spec.default;
}
// Serialises a resolved numeric setting for the stylesheet. A px setting is
// published with its unit attached and read straight back by the rule that uses
// it; the transparency is published as a bare number, because its rule does
// arithmetic on it (opacity: calc(1 - n / 100)).
function styleValue(key, spec) {
  const n = readLimit(key, spec);
  return spec.unit === "%" ? String(n) : `${n}${spec.unit}`;
}
function updateSearchStyle() {
  const form = document.getElementById("search-form");
  if (!form) return;
  const style = getStored(STORAGE_KEYS.searchStyle, SEARCH_STYLES, "modern");
  form.classList.remove("style-modern", "style-geek");
  form.classList.add(`style-${style}`);
  // Sizes travel to CSS as custom properties (see newtab.css). They go on the
  // ROOT element, not on the form: custom properties only inherit downwards, and
  // `.main` -- an ancestor of the form -- sizes its own max-width from
  // --search-length so the box can actually reach the configured width. A
  // variable set on the form would be invisible there. The radius is written for
  // both styles -- it is inert on the underline style, and writing it
  // unconditionally keeps a style switch from losing the value. The transparency
  // could live on the form (its rule, `.search-box`, is a descendant) but rides
  // along here so all four settings are published in one place.
  const root = document.documentElement.style;
  root.setProperty("--search-radius", styleValue(STORAGE_KEYS.searchRadius, SEARCH_LIMITS.radius));
  root.setProperty("--search-border", styleValue(STORAGE_KEYS.searchBorder, SEARCH_LIMITS.border));
  root.setProperty("--search-length", styleValue(STORAGE_KEYS.searchLength, SEARCH_LIMITS.length));
  root.setProperty("--search-transparency", styleValue(STORAGE_KEYS.searchTransparency, SEARCH_LIMITS.transparency));
}
// Custom CSS: one string under STORAGE_KEYS.customCSS, injected into a <style>
// element appended to <head>. The placement IS the priority mechanism --
// newtab.css is linked in <head> and declares nothing `!important`, so between
// two rules of equal specificity the one later in document order wins. Appending
// at DOMContentLoaded therefore puts the user's sheet after that link, on every
// load, without needing `!important` anywhere.
//
// The text reaches the element through `textContent`, never through innerHTML:
// the sheet is user input, and textContent is not re-parsed, so a stray
// "</style>" inside the CSS stays inert text rather than ending the element.
//
// No content means OFF, and a sheet that is entirely whitespace counts as no
// content: writeCustomCSS() normalises that down to a removed key, so "stored"
// and "non-blank" are the same state -- which is exactly what the tile reports.
let customStyleEl = null;
function readCustomCSS() {
  try {
    return localStorage.getItem(STORAGE_KEYS.customCSS) || "";
  } catch (_) {
    return "";
  }
}
function customCSSEnabled() {
  return readCustomCSS().trim() !== "";
}
function writeCustomCSS(text) {
  const value = String(text).trim();
  try {
    if (value === "") localStorage.removeItem(STORAGE_KEYS.customCSS);
    else localStorage.setItem(STORAGE_KEYS.customCSS, value);
  } catch (_) { /* storage may be unavailable */ }
  return value;
}
function updateCustomCSS() {
  if (!customCSSEnabled()) {
    // Drop the element rather than blanking it, so a disabled feature leaves no
    // trace in the document; nulling the handle re-creates it on the way back
    // in, which re-appends it last and keeps the precedence above intact.
    if (customStyleEl) {
      customStyleEl.remove();
      customStyleEl = null;
    }
    return;
  }
  if (!customStyleEl) {
    customStyleEl = document.createElement("style");
    customStyleEl.id = "custom-css";
    document.head.appendChild(customStyleEl);
  }
  customStyleEl.textContent = readCustomCSS();
}
// Escapes the characters that are special in markup, quote included: shortcut
// titles and urls are user input and land in element text and in an href
// attribute. Written as a pure string transform rather than the usual
// textContent/innerHTML round-trip -- that trick needs a real DOM, so it would
// silently produce "" everywhere a DOM stub stands in (the smoke tests).
const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}
// Shortcuts are one JSON array under a single key, capped at SHORTCUT_MAX
// entries: { title, url, weight }. Every read goes through the sanitiser --
// localStorage is hand-writable, and a half-written array must not be able to
// break the page or slip a script url into an href.
//
// A colon only introduces a scheme when it is not followed by a digit, so
// "example.com:8080" stays a host:port instead of being read as an
// "example.com:" protocol. Script-bearing schemes are refused outright: the url
// ends up in an <a href>, where javascript: would run as code.
const SHORTCUT_SCHEME_RE = /^[a-z][a-z0-9+.-]*:(?!\d)/i;
const UNSAFE_SHORTCUT_RE = /^(?:javascript|data|vbscript):/i;
// Returns the url to store, or null when it cannot be used. A bare host gets
// https:// prepended; anything that already names a protocol is kept verbatim.
function normalizeURL(raw) {
  const s = String(raw === null || raw === undefined ? "" : raw).trim();
  if (s === "") return null;
  if (!SHORTCUT_SCHEME_RE.test(s)) return "https://" + s;
  return UNSAFE_SHORTCUT_RE.test(s) ? null : s;
}
// A weight is a whole number in [min, max]. Deliberately not isValidLimit():
// that one carries the "0 keeps the default" rule of the search box sizes,
// which does not apply here -- an empty field is how the weight asks for the
// default, so 0 is plain out of range.
function isValidWeight(n, spec) {
  return Number.isInteger(n) && n >= spec.min && n <= spec.max;
}
// Coerces one stored entry into a usable shortcut, or null if it is unusable.
function sanitizeShortcut(entry) {
  if (!entry || typeof entry !== "object") return null;
  const title = typeof entry.title === "string" ? entry.title.trim() : "";
  const url = normalizeURL(entry.url);
  if (title === "" || url === null) return null;
  const n = Number(entry.weight);
  return {
    title: title.slice(0, SHORTCUT_TITLE_MAX),
    url,
    weight: isValidWeight(n, SHORTCUT_WEIGHT) ? n : SHORTCUT_WEIGHT.default
  };
}
// Display order: heaviest weight first, ties broken by title. This is the ONLY
// order in the project -- readShortcuts() sorts on the way out and
// writeShortcuts() sorts on the way in -- so a tile's index in the panel, its
// position in the bottom row and its place in storage all agree.
function sortShortcuts(list) {
  return list.slice().sort((a, b) =>
    (b.weight - a.weight) ||
    a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }));
}
// Returns the shortcuts in DISPLAY order -- sorted, always, not just when they
// happen to have been written by writeShortcuts(). The row, the tiles and every
// index-addressed edit all read through here, so "index 0" means the leftmost
// shortcut no matter how the stored array was produced (a hand-edit, a partial
// write, an older version). Leave the sort in.
function readShortcuts() {
  let parsed;
  try {
    parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.shortcuts) || "[]");
  } catch (_) {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out = [];
  for (const entry of parsed) {
    if (out.length >= SHORTCUT_MAX) break;
    const shortcut = sanitizeShortcut(entry);
    if (shortcut) out.push(shortcut);
  }
  return sortShortcuts(out);
}
function writeShortcuts(list) {
  setStored(STORAGE_KEYS.shortcuts, JSON.stringify(sortShortcuts(list.slice(0, SHORTCUT_MAX))));
}
// index -1 appends a new shortcut. Saving past the cap is dropped rather than
// silently trimming an existing entry.
function saveShortcut(index, entry) {
  const list = readShortcuts();
  if (index < 0) {
    if (list.length >= SHORTCUT_MAX) return;
    list.push(entry);
  } else if (index < list.length) {
    list[index] = entry;
  } else {
    return;
  }
  writeShortcuts(list);
}
function deleteShortcut(index) {
  const list = readShortcuts();
  if (index < 0 || index >= list.length) return;
  list.splice(index, 1);
  writeShortcuts(list);
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
         <img class="onboarding-img onboarding-img-light" src="scrshot-light.png" alt="设置面板截图">
         <img class="onboarding-img onboarding-img-dark" src="scrshot-dark.png" alt="设置面板截图">
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
         <img class="onboarding-img onboarding-img-light" src="scrshot-light.png" alt="Settings panel screenshot">
         <img class="onboarding-img onboarding-img-dark" src="scrshot-dark.png" alt="Settings panel screenshot">
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
  if (engine === "browser") {
    // Hand the query to the browser so its own default engine answers it. The
    // provider is resolved per search rather than cached: a panel render and a
    // submit can happen in either order, and this keeps one source of truth.
    const api = defaultEngineAPI();
    if (api) {
      api.query({ text: query });
      return;
    }
  }
  // Fallback: nothing can answer for "browser" here (Chrome < 87, Firefox < 111),
  // or the stored engine is unusable. Route to google unless another explicit
  // engine is selected.
  const fallback = engine && engine !== "browser" && SEARCH_URLS[engine] ? engine : "google";
  window.location.href = SEARCH_URLS[fallback] + encodeURIComponent(query);
}
// Bottom-sheet settings panel, opened by right-click. Four tabs:
// Appearance / Search Box / Shortcuts (reserved, intentionally empty) / Advanced.
//
// Each setting renders as a square tile in a strip: an icon plate on top (Font
// Awesome Free Solid -- the shipped font is subset, see newtab.css), then the
// name and its current value below it, all centred and without a divider.
//
// Kinds: "toggle" flips a boolean, "cycle" steps through its two options, and
// "select" (three or more options) or "number" opens a dialog. A two-option
// setting is always a "cycle": a menu for two choices is a needless extra step.
const SETTINGS_TABS = ["appearance", "searchBoxTab", "shortcutsTab", "advanced"];
let settingsTab = "appearance";
let settingsPanelEl = null;
let settingsDialogEl = null;
let settingsDialogItem = null;

function engineOptions() {
  const options = [];
  // Offered only where it can actually run: a browser without the API drops the
  // entry rather than showing one that would be silently ignored.
  if (defaultEngineAPI()) options.push(["browser", "browserDefault"]);
  options.push(["google", "google"], ["duckduckgo", "duckduckgo"], ["qwant", "qwant"],
    ["bing", "bing"], ["baidu", "baidu"]);
  return options;
}
function getSettingsItems(tab) {
  if (tab === "appearance") {
    return [
      { action: "toggle-title", icon: "fa-heading", labelKey: "searchTitle", kind: "toggle", key: STORAGE_KEYS.showTitle, fallback: "true" },
      { action: "toggle-time", icon: "fa-clock", labelKey: "timeDisplay", kind: "toggle", key: STORAGE_KEYS.showTime, fallback: "false" },
      { action: "set-clock", icon: "fa-stopwatch", labelKey: "clockFormat", kind: "cycle", key: STORAGE_KEYS.clockFormat, fallback: "24",
        options: [["12", "clock12h"], ["24", "clock24h"]] },
      { action: "set-background", icon: "fa-fill-drip", labelKey: "background", kind: "select", key: STORAGE_KEYS.backgroundStyle, fallback: "blank",
        options: [["blank", "blankBackground"], ["dots", "dotBackground"], ["stripes", "stripeBackground"]] },
      { action: "set-theme", icon: "fa-circle-half-stroke", labelKey: "theme", kind: "select", key: STORAGE_KEYS.theme, fallback: "auto",
        options: [["auto", "auto"], ["light", "light"], ["dark", "dark"]] },
      { action: "toggle-clickfx", icon: "fa-hand-pointer", labelKey: "clickEffects", kind: "toggle", key: STORAGE_KEYS.showClickFx, fallback: "true" }
    ];
  }
  if (tab === "searchBoxTab") {
    const style = getStored(STORAGE_KEYS.searchStyle, SEARCH_STYLES, "modern");
    const items = [
      { action: "set-engine", icon: "fa-magnifying-glass", labelKey: "searchEngine", kind: "select", key: STORAGE_KEYS.searchEngine, fallback: "browser",
        options: engineOptions() },
      { action: "set-style", icon: "fa-shapes", labelKey: "searchStyle", kind: "cycle", key: STORAGE_KEYS.searchStyle, fallback: "modern",
        options: SEARCH_STYLES.map((s) => [s, s]) }
    ];
    // The numeric settings are sandwiched between the style selector and the
    // Search button. Only the corner radius depends on the style -- it means
    // nothing on an underline, so it is offered for "modern" alone; the border
    // weight, the box length and the transparency are common to both.
    if (style === "modern") {
      items.push({ action: "set-radius", icon: "fa-border-top-left", labelKey: "searchRadius", kind: "number",
        key: STORAGE_KEYS.searchRadius, spec: SEARCH_LIMITS.radius });
    }
    items.push(
      { action: "set-border", icon: "fa-border-all", labelKey: "searchBorder", kind: "number",
        key: STORAGE_KEYS.searchBorder, spec: SEARCH_LIMITS.border },
      { action: "set-length", icon: "fa-text-width", labelKey: "searchLength", kind: "number",
        key: STORAGE_KEYS.searchLength, spec: SEARCH_LIMITS.length },
      // Transparency is the one extra that both styles get: the fade wraps the
      // whole box rather than its frame, so it reads the same on a full box and
      // on a bare underline.
      { action: "set-transparency", icon: "fa-droplet", labelKey: "searchTransparency", kind: "number",
        key: STORAGE_KEYS.searchTransparency, spec: SEARCH_LIMITS.transparency },
      { action: "toggle-go", icon: "fa-arrow-right", labelKey: "showGo", kind: "toggle", key: STORAGE_KEYS.showGo, fallback: "true" }
    );
    return items;
  }
  if (tab === "shortcutsTab") {
    const list = readShortcuts();
    // One tile per shortcut -- click to edit or delete -- then the add tile. The
    // list is already in display order, so a tile's `index` is its stored index.
    const items = list.map((s, index) => ({
      action: `shortcut-${index}`,
      icon: "fa-link",
      kind: "shortcut",
      index,
      name: s.title,
      url: s.url,
      weight: s.weight,
      statusText: `${t("weight")} ${s.weight}`
    }));
    items.push({
      action: "add-shortcut",
      icon: "fa-square-plus",
      labelKey: "addShortcut",
      kind: "shortcut",
      index: -1,
      // Not the "disabled" kind: this tile is inert only while the cap is
      // reached, and it has to come back to life the moment one is deleted.
      disabled: list.length >= SHORTCUT_MAX,
      statusText: `${list.length} / ${SHORTCUT_MAX}`
    });
    return items;
  }
  return [
    { action: "set-lang", icon: "fa-language", labelKey: "language", kind: "cycle", key: STORAGE_KEYS.lang, fallback: "en",
      options: [["en", "english"], ["zh", "chinese"]] },
    // The status line is built here rather than in itemStatus(): the enabled
    // state is "is anything stored at all", not one of a list of values.
    { action: "custom-css", icon: "fa-code", labelKey: "customCSS", kind: "css",
      statusText: t(customCSSEnabled() ? "customCSSEnabled" : "customCSSNotSet") }
  ];
}
function itemValue(item) {
  // Numeric settings resolve through readLimit(), so the panel reports the
  // value in force (the default, when 0 or nonsense is stored).
  if (item.kind === "number") return String(readLimit(item.key, item.spec));
  return getStored(item.key, itemValues(item), item.fallback);
}
// The values a setting can hold, in the order its options declare them. "cycle"
// is included here, which is why a two-value list needs no special case.
function itemValues(item) {
  if (item.kind === "toggle") return ["true", "false"];
  return (item.options || []).map((o) => o[0]);
}
function itemStatus(item) {
  if (item.kind === "toggle") return t(itemValue(item) === "true" ? "on" : "off");
  if (item.kind === "number") return `${itemValue(item)} ${item.spec.unit}`;
  const option = item.options.find((o) => o[0] === itemValue(item));
  return option ? t(option[1]) : "";
}
// A card carries either a static `labelKey` or a runtime `name` (a shortcut's
// own title), and either a computed `itemStatus()` or a literal `statusText`.
// `disabled` is normally the "disabled" kind, but a shortcut tile can also be
// disabled at runtime -- the add tile once the list is full.
function cardHTML(item) {
  const disabled = item.kind === "disabled" || item.disabled === true;
  const name = item.name === undefined ? t(item.labelKey) : escapeHTML(item.name);
  let status;
  if (item.statusText !== undefined) status = item.statusText;
  else if (disabled) status = t(item.statusKey);
  else status = itemStatus(item);
  return `
    <button class="settings-card${disabled ? " settings-card-disabled" : ""}"
            data-action="${item.action}"${disabled ? " disabled" : ""}>
      <span class="settings-card-icon"><i class="fa-solid ${item.icon}" aria-hidden="true"></i></span>
      <span class="settings-card-name">${name}</span>
      <span class="settings-card-status">${status}</span>
    </button>
  `;
}
function findSettingsItem(action) {
  for (const tab of SETTINGS_TABS) {
    const found = getSettingsItems(tab).find((item) => item.action === action);
    if (found) return found;
  }
  return null;
}
function getSettingsContentHTML() {
  return getSettingsItems(settingsTab).map(cardHTML).join("");
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
// Placeholder for the number dialog: it states the range the field accepts and
// what the "keep the default" entry resolves to, so the field never asks for a
// value the validation would then refuse.
function numberHint(spec) {
  return fmt(t("rangeHint"), { min: spec.min, max: spec.max, default: spec.default, unit: spec.unit });
}
// Same contract for the shortcut weight field: the accepted range, and what an
// empty field resolves to. Built from SHORTCUT_WEIGHT, never hard-coded.
function weightHint(spec) {
  return fmt(t("weightHint"), { min: spec.min, max: spec.max, default: spec.default });
}
// Reports why a dialog field was refused and puts the caret back in it.
function flagDialogError(errorEl, inputEl, message) {
  errorEl.textContent = message;
  inputEl.classList.add("invalid");
  inputEl.focus();
  if (typeof inputEl.select === "function") inputEl.select();
}
function openSettingsDialog(item) {
  if (!settingsDialogEl) return;
  settingsDialogItem = item;
  const titleEl = settingsDialogEl.querySelector(".settings-dialog-title");
  const body = settingsDialogEl.querySelector(".settings-dialog-options");
  const dialog = settingsDialogEl.querySelector(".settings-dialog");
  const isNumber = item.kind === "number";
  const isShortcut = item.kind === "shortcut";
  const isCSS = item.kind === "css";
  dialog.classList.toggle("settings-dialog-number", isNumber);
  dialog.classList.toggle("settings-dialog-shortcut", isShortcut);
  dialog.classList.toggle("settings-dialog-css", isCSS);
  if (isShortcut) {
    const isNew = item.index < 0;
    titleEl.textContent = t(isNew ? "addShortcut" : "editShortcut");
    // Three fields over the number dialog's error line, action row and styling.
    // They are prefilled through the `value` property, never through the markup:
    // a title and a url are user input and would be parsed as HTML there.
    body.innerHTML = `
      <div class="settings-dialog-field">
        <input class="settings-dialog-input" data-field="title" type="text" autocomplete="off"
               spellcheck="false" maxlength="${SHORTCUT_TITLE_MAX}" aria-label="${t("shortcutTitle")}"
               placeholder="${t("shortcutTitle")}">
      </div>
      <div class="settings-dialog-field">
        <input class="settings-dialog-input" data-field="url" type="text" autocomplete="off"
               spellcheck="false" aria-label="${t("shortcutUrl")}"
               placeholder="${t("shortcutUrl")}">
      </div>
      <div class="settings-dialog-field">
        <input class="settings-dialog-input" data-field="weight" type="text" inputmode="numeric"
               autocomplete="off" spellcheck="false" aria-label="${t("weight")}"
               placeholder="${weightHint(SHORTCUT_WEIGHT)}">
      </div>
      <div class="settings-dialog-error" aria-live="polite"></div>
      <div class="settings-dialog-actions">
        ${isNew ? "" : `<button class="settings-dialog-delete" type="button">${t("delete")}</button>`}
        <button class="settings-dialog-confirm" type="button">${t("confirm")}</button>
      </div>
    `;
    const fields = {
      title: body.querySelector('[data-field="title"]'),
      url: body.querySelector('[data-field="url"]'),
      weight: body.querySelector('[data-field="weight"]')
    };
    if (!isNew) {
      fields.title.value = item.name;
      fields.url.value = item.url;
      fields.weight.value = String(item.weight);
    }
    const errorEl = body.querySelector(".settings-dialog-error");
    Object.keys(fields).forEach((key) => {
      const el = fields[key];
      el.addEventListener("input", () => {
        el.classList.remove("invalid");
        errorEl.textContent = "";
      });
    });
    settingsDialogEl.classList.add("visible");
    fields.title.focus();
    return;
  }
  if (isCSS) {
    titleEl.textContent = t(item.labelKey);
    // A textarea, not an input: the sheet is source, so it wraps and keeps its
    // newlines. Prefilled through `.value`, never through the markup -- this is
    // user input and would be parsed as HTML there. No error line: any CSS at
    // all is acceptable, and invalid rules are dropped by the parser, so there
    // is nothing to refuse. A blank field is how the user turns the feature off.
    // The action row does carry a caveat, though: a sheet can hide or unmount the
    // panel that would undo it, so the warning sits in the row rather than in an
    // error line, which only ever reports a refused value.
    body.innerHTML = `
      <div class="settings-dialog-field">
        <textarea class="settings-dialog-input settings-dialog-textarea" spellcheck="false"
                  autocomplete="off" aria-label="${t(item.labelKey)}"
                  placeholder="${t("customCSSHint")}"></textarea>
      </div>
      <div class="settings-dialog-actions">
        <span class="settings-dialog-warning">${t("customCSSWarning")}</span>
        <button class="settings-dialog-confirm" type="button">${t("confirm")}</button>
      </div>
    `;
    const area = body.querySelector(".settings-dialog-textarea");
    area.value = readCustomCSS();
    settingsDialogEl.classList.add("visible");
    area.focus();
    return;
  }
  const current = itemValue(item);
  titleEl.textContent = t(item.labelKey);
  if (isNumber) {
    // Prefilled with the value in force; the hint lives in the placeholder, and
    // the error line is always present so showing one never shifts the button.
    body.innerHTML = `
      <div class="settings-dialog-field">
        <input class="settings-dialog-input" type="text" inputmode="numeric" autocomplete="off"
               spellcheck="false" aria-label="${t(item.labelKey)}"
               placeholder="${numberHint(item.spec)}" value="${current}">
      </div>
      <div class="settings-dialog-error" aria-live="polite"></div>
      <div class="settings-dialog-actions">
        <button class="settings-dialog-confirm" type="button">${t("confirm")}</button>
      </div>
    `;
    const input = body.querySelector(".settings-dialog-input");
    const errorEl = body.querySelector(".settings-dialog-error");
    input.addEventListener("input", () => {
      input.classList.remove("invalid");
      errorEl.textContent = "";
    });
    settingsDialogEl.classList.add("visible");
    input.focus();
    input.select();
    return;
  }
  body.innerHTML = item.options.map(([value, labelKey]) => `
    <button class="settings-dialog-option" data-value="${value}">
      <span class="menu-radio ${value === current ? "selected" : ""}"></span>
      ${t(labelKey)}
    </button>
  `).join("");
  settingsDialogEl.classList.add("visible");
}
// Reads the number dialog's field and either applies it or reports why not. A
// valid 0 is stored as-is: readLimit() turns it back into the default, which is
// what the tile then shows.
function confirmNumberSetting() {
  const item = settingsDialogItem;
  if (!item || item.kind !== "number" || !settingsDialogEl) return;
  const input = settingsDialogEl.querySelector(".settings-dialog-input");
  const errorEl = settingsDialogEl.querySelector(".settings-dialog-error");
  if (!input || !errorEl) return;
  const spec = item.spec;
  const raw = input.value.trim();
  const n = raw === "" ? NaN : Number(raw);
  if (!isValidLimit(n, spec)) {
    flagDialogError(errorEl, input, fmt(t("invalidNumber"), { min: spec.min, max: spec.max }));
    return;
  }
  applySetting(item.action, String(n));
  closeSettingsDialog();
  renderSettingsPanel();
}
// Reads the custom CSS dialog's textarea. Nothing to validate: whatever the
// field holds becomes the sheet, and clearing it is the documented way to turn
// the feature back off. Read the field off `.settings-dialog-options`, like
// every other dialog field -- see the note in confirmShortcutDialog().
function confirmCustomCSSDialog() {
  const item = settingsDialogItem;
  if (!item || item.kind !== "css" || !settingsDialogEl) return;
  const body = settingsDialogEl.querySelector(".settings-dialog-options");
  if (!body) return;
  const area = body.querySelector(".settings-dialog-textarea");
  if (!area) return;
  applySetting(item.action, area.value);
  closeSettingsDialog();
  renderSettingsPanel();
}
// Reads the shortcut dialog's three fields and either saves or reports the first
// problem. A blank weight means the default; a blank title or an unusable url is
// refused rather than guessed at.
function confirmShortcutDialog() {
  const item = settingsDialogItem;
  if (!item || item.kind !== "shortcut" || !settingsDialogEl) return;
  const body = settingsDialogEl.querySelector(".settings-dialog-options");
  // The error line lives INSIDE the options container. Querying it off the
  // overlay instead finds nothing in a real browser and the dialog would then
  // refuse to save in total silence -- so keep every field lookup on `body`.
  const errorEl = body.querySelector(".settings-dialog-error");
  const titleEl = body.querySelector('[data-field="title"]');
  const urlEl = body.querySelector('[data-field="url"]');
  const weightEl = body.querySelector('[data-field="weight"]');
  if (!titleEl || !urlEl || !weightEl || !errorEl) return;
  const title = titleEl.value.trim();
  if (title === "") {
    flagDialogError(errorEl, titleEl, t("errorTitle"));
    return;
  }
  const url = normalizeURL(urlEl.value);
  if (url === null) {
    flagDialogError(errorEl, urlEl, t("errorUrl"));
    return;
  }
  const rawWeight = weightEl.value.trim();
  const weight = rawWeight === "" ? SHORTCUT_WEIGHT.default : Number(rawWeight);
  if (!isValidWeight(weight, SHORTCUT_WEIGHT)) {
    flagDialogError(errorEl, weightEl,
      fmt(t("errorWeight"), { min: SHORTCUT_WEIGHT.min, max: SHORTCUT_WEIGHT.max }));
    return;
  }
  saveShortcut(item.index, { title: title.slice(0, SHORTCUT_TITLE_MAX), url, weight });
  closeSettingsDialog();
  renderSettingsPanel();
  updateShortcuts();
}
// Deleting is offered while editing an existing shortcut, never on the add tile.
function confirmDeleteShortcut() {
  const item = settingsDialogItem;
  if (!item || item.kind !== "shortcut" || item.index < 0) return;
  deleteShortcut(item.index);
  closeSettingsDialog();
  renderSettingsPanel();
  updateShortcuts();
}
function closeSettingsDialog() {
  if (settingsDialogEl) settingsDialogEl.classList.remove("visible");
  settingsDialogItem = null;
}
function settingsDialogVisible() {
  return !!settingsDialogEl && settingsDialogEl.classList.contains("visible");
}
// Applies one setting and refreshes whatever the page shows, so a card flip is
// visible immediately without re-rendering the whole panel.
function applySetting(action, value) {
  switch (action) {
    case "toggle-title":
      setStored(STORAGE_KEYS.showTitle, value);
      updatePrompt();
      break;
    case "toggle-time":
      setStored(STORAGE_KEYS.showTime, value);
      updateTime();
      break;
    case "toggle-go":
      setStored(STORAGE_KEYS.showGo, value);
      updateGo();
      break;
    case "toggle-clickfx":
      setStored(STORAGE_KEYS.showClickFx, value);
      updateClickFx();
      break;
    case "set-background":
      setStored(STORAGE_KEYS.backgroundStyle, value);
      updateDots();
      break;
    case "set-clock":
      setStored(STORAGE_KEYS.clockFormat, value);
      updateTime();
      break;
    case "set-theme":
      applyTheme(value);
      break;
    case "set-engine":
      setStored(STORAGE_KEYS.searchEngine, value);
      break;
    case "set-style":
      setStored(STORAGE_KEYS.searchStyle, value);
      updateSearchStyle();
      break;
    case "set-radius":
      setStored(STORAGE_KEYS.searchRadius, value);
      updateSearchStyle();
      break;
    case "set-border":
      setStored(STORAGE_KEYS.searchBorder, value);
      updateSearchStyle();
      break;
    case "set-length":
      setStored(STORAGE_KEYS.searchLength, value);
      updateSearchStyle();
      break;
    case "set-transparency":
      setStored(STORAGE_KEYS.searchTransparency, value);
      updateSearchStyle();
      break;
    case "set-lang":
      setStored(STORAGE_KEYS.lang, value);
      applyDocumentLang();
      updateUI();
      // Tab labels and every card are translated text, so retranslate in place.
      settingsPanelEl.querySelectorAll(".settings-tab").forEach((btn) => {
        btn.textContent = t(btn.dataset.tab);
      });
      break;
    case "custom-css":
      writeCustomCSS(value);
      updateCustomCSS();
      break;
  }
}
function toggleCurrent(action) {
  const item = findSettingsItem(action);
  if (!item) return;
  applySetting(action, itemValue(item) === "true" ? "false" : "true");
}
// Steps a two-option setting to the other option, in the order the options are
// declared, so the flip alternates in a fixed direction. Written against
// itemValues() rather than hard-coding the pair: it stays correct if a list ever
// grows a third entry (it would simply become a rotation).
function cycleCurrent(action) {
  const item = findSettingsItem(action);
  if (!item) return;
  const values = itemValues(item);
  const next = values[(values.indexOf(itemValue(item)) + 1) % values.length];
  applySetting(action, next);
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
      <div class="shortcuts" id="shortcuts"></div>
    `;
    updateDots();
    updateGo();
    updateSearchStyle();
    updateCustomCSS();
    updatePrompt();
    updateTime();
    updateUI();
    updateShortcuts();
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
    settingsDialogEl = document.createElement("div");
    settingsDialogEl.className = "settings-dialog-overlay";
    settingsDialogEl.id = "settings-dialog";
    settingsDialogEl.innerHTML = `
      <div class="settings-dialog" role="dialog" aria-modal="true">
        <div class="settings-dialog-header">
          <div class="settings-dialog-title"></div>
          <button class="settings-dialog-close" type="button" aria-label="${t("close")}" title="${t("close")}">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div class="settings-dialog-options"></div>
      </div>
    `;
    document.body.appendChild(settingsDialogEl);
    renderSettingsPanel();
    // Right-click toggles the panel: it opens when closed and collapses when
    // already open. A right-click fires `contextmenu`, never `click`, so this
    // can't double-fire with the outside-click handler below.
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (settingsPanelVisible()) {
        closeSettingsDialog();
        closeSettingsPanel();
      } else {
        openSettingsPanel();
      }
    });
    settingsPanelEl.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".settings-tab");
      if (tabBtn) {
        settingsTab = tabBtn.dataset.tab;
        renderSettingsPanel();
        return;
      }
      const card = e.target.closest(".settings-card:not([disabled])");
      if (!card) return;
      const item = findSettingsItem(card.dataset.action);
      if (!item) return;
      if (item.kind === "toggle") {
        toggleCurrent(item.action);
        renderSettingsPanel();
      } else if (item.kind === "cycle") {
        cycleCurrent(item.action);
        renderSettingsPanel();
      } else if (item.kind === "select" || item.kind === "number" ||
                 item.kind === "shortcut" || item.kind === "css") {
        // All four open a dialog: a list of values, one field, the shortcut form
        // (title / url / weight) or the custom CSS sheet. The add tile is a
        // "shortcut" item with index -1, so it lands here too.
        openSettingsDialog(item);
      }
    });
    // Vertical wheel scrolls the card strip sideways -- it is the only overflow
    // axis, so without this the wheel would do nothing over the panel.
    settingsPanelEl.querySelector(".settings-content").addEventListener("wheel", (e) => {
      const strip = e.currentTarget;
      if (e.deltaY === 0 || strip.scrollWidth <= strip.clientWidth) return;
      e.preventDefault();
      strip.scrollLeft += e.deltaY;
    }, { passive: false });
    settingsDialogEl.addEventListener("click", (e) => {
      if (e.target.closest(".settings-dialog-close")) {
        closeSettingsDialog();
        return;
      }
      if (e.target.closest(".settings-dialog-confirm")) {
        const kind = settingsDialogItem && settingsDialogItem.kind;
        if (kind === "shortcut") confirmShortcutDialog();
        else if (kind === "css") confirmCustomCSSDialog();
        else confirmNumberSetting();
        return;
      }
      if (e.target.closest(".settings-dialog-delete")) {
        confirmDeleteShortcut();
        return;
      }
      const option = e.target.closest(".settings-dialog-option");
      if (option && settingsDialogItem) {
        applySetting(settingsDialogItem.action, option.dataset.value);
        closeSettingsDialog();
        renderSettingsPanel();
        return;
      }
      // Clicking the backdrop (but not the dialog itself) dismisses it.
      if (!e.target.closest(".settings-dialog")) closeSettingsDialog();
    });
    // Enter confirms the open dialog. Escape (handled on document) closes it.
    // The custom CSS variant is deliberately absent from this list: its field is
    // a textarea, where Enter has to insert a newline. That dialog commits on the
    // confirm button alone.
    settingsDialogEl.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const kind = settingsDialogItem && settingsDialogItem.kind;
      if (kind !== "number" && kind !== "shortcut") return;
      e.preventDefault();
      if (kind === "shortcut") confirmShortcutDialog();
      else confirmNumberSetting();
    });
    // The panel collapses on an outside click -- and on nothing else.
    //
    // Where the click *started* has to be sampled during the capture phase,
    // before any handler touches the DOM. Flipping a card calls
    // renderSettingsPanel(), which rewrites .settings-content and thereby
    // detaches the element that was clicked; by the time the bubble-phase
    // handler below runs, that node is no longer a descendant of the panel, so
    // contains() would answer "outside" and a plain toggle would tear the panel
    // down. (Tab clicks escape this because the tab bar is never rewritten.)
    //
    // The dialog needs the same treatment for a different reason: it is a
    // *sibling* of the panel (both are children of <body>), so a click on a
    // dialog option is not "inside the panel" either.
    let clickStartedInside = false;
    document.addEventListener("click", (e) => {
      clickStartedInside = settingsPanelEl.contains(e.target) ||
        (!!settingsDialogEl && settingsDialogEl.contains(e.target));
    }, true);
    document.addEventListener("click", () => {
      if (settingsPanelVisible() && !clickStartedInside) closeSettingsPanel();
    });
    // Escape dismisses the dialog only. The panel itself collapses on a
    // right-click or an outside click, never on a keystroke.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && settingsDialogVisible()) closeSettingsDialog();
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
