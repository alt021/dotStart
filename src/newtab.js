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
  showShortcuts: "showShortcuts",
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
    showShortcuts: "Shortcuts",
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
    bookmarks: "Bookmarks",
    bookmarksBar: "Bookmarks Bar",
    bookmarksMenu: "Bookmarks Menu",
    otherBookmarks: "Other",
    folder: "Folder",
    history: "History",
    more: "More",
    downloads: "Downloads",
    extensions: "Extensions",
    permissionNeeded: "Permission needed to read your data — allow access and try again"
  },
  zh: {
    searchTitle: "显示标题",
    timeDisplay: "时间显示",
    showGo: "搜索按钮",
    background: "背景",
    blankBackground: "空白",
    dotBackground: "点阵",
    stripeBackground: "条纹",
    showShortcuts: "快捷方式",
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
    bookmarks: "书签",
    bookmarksBar: "收藏夹栏",
    bookmarksMenu: "书签菜单",
    otherBookmarks: "其他",
    folder: "文件夹",
    history: "历史",
    more: "更多",
    downloads: "下载",
    extensions: "扩展",
    permissionNeeded: "需要授权才能读取数据，请允许后重试"
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
// "bookmarks" and "history" live in optional_permissions so that neither Chrome
// nor Firefox asks for them at install time; they are requested the first time
// the user opens the matching sidebar panel. A request that is already granted
// resolves true without prompting, so calling this on every open is cheap.
//
// Both browsers only honour the request while a user gesture is active, so
// callers MUST invoke this synchronously from the event handler and only attach
// .then() afterwards -- awaiting anything first drops the gesture in Firefox.
function requestPermissions(perms) {
  const promiseApi = (typeof browser !== "undefined" && browser.permissions && browser.permissions.request)
    ? browser.permissions
    : null;
  if (promiseApi) {
    try {
      const result = promiseApi.request({ permissions: perms });
      if (result && typeof result.then === "function") {
        return result.then((granted) => !!granted, () => false);
      }
    } catch (_) { /* fall through to the chrome namespace */ }
  }
  if (typeof chrome === "undefined" || !chrome.permissions || !chrome.permissions.request) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (granted) => {
      if (settled) return;
      settled = true;
      resolve(!!granted);
    };
    try {
      const result = chrome.permissions.request({ permissions: perms }, (granted) => {
        if (chrome.runtime && chrome.runtime.lastError) void chrome.runtime.lastError;
        finish(granted);
      });
      if (result && typeof result.then === "function") result.then(finish, () => finish(false));
    } catch (_) {
      finish(false);
    }
  });
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
// Every entry in this row opens a chrome:// page, so the row is Chrome-only:
// Firefox rejects chrome: URLs in tabs.create (and privileged about: URLs too)
// and there is no equivalent page for downloads or extensions to point at, so
// there is no Firefox-side implementation worth shipping. The whole row is
// hidden there rather than reduced to the subset that happens to work -- and
// with it the menu toggle, which would otherwise flip a permanently invisible
// element.
function updateShortcuts() {
  const shortcuts = document.getElementById("shortcuts");
  if (isFirefox()) {
    if (shortcuts) shortcuts.style.display = "none";
    return;
  }
  const showShortcuts = getStored(STORAGE_KEYS.showShortcuts, ["true", "false"], "true") === "true";
  if (shortcuts) shortcuts.classList.toggle("hidden", !showShortcuts);
  const items = document.querySelectorAll(".shortcut-item[data-i18n]");
  items.forEach((item) => {
    const key = item.getAttribute("data-i18n");
    if (key) item.textContent = t(key);
  });
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
              <li>为实现快捷方式功能，本扩展需要您的历史记录和书签的访问权限，数据仅在本地存储，不会被上传或收集。</li>
              <li>为保证兼容性，扩展申请了更多数据权限，但对应的功能不在所有浏览器中可用。所有读取的数据永远不会离开您的计算机，也不会被上传。</li>
            </ol>
           <h3>开源说明</h3>
           <pre style="white-space:pre-wrap;font-family:inherit;margin:0.5rem 0">${escapeHTML(LICENSE_PLACEHOLDER)}</pre>
         </div>
       </div>`,
      `<div class="onboarding-col">
         <div class="onboarding-title">使用方法</div>
         <div class="onboarding-subtitle">点按右键打开设置菜单</div>
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
              <li>To enable shortcuts, this extension requires access to your history and bookmarks. Data is stored locally only and is never uploaded or collected.</li>
              <li>For compatibility, this extension requests additional data permissions, but the corresponding features are not available in all browsers. All read data never leaves your computer and is never uploaded.</li>
            </ol>
           <h3>Open Source License</h3>
           <pre style="white-space:pre-wrap;font-family:inherit;margin:0.5rem 0">${escapeHTML(LICENSE_PLACEHOLDER)}</pre>
         </div>
       </div>`,
      `<div class="onboarding-col">
         <div class="onboarding-title">How to Use</div>
         <div class="onboarding-subtitle">Right-click to open the settings menu</div>
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
function hideSidebar() {
  const overlay = document.getElementById("sidebar-overlay");
  const panel = document.getElementById("sidebar-panel");
  if (overlay) overlay.classList.remove("visible");
  if (panel) panel.classList.remove("visible");
}
// Sidebar data comes from optional permissions, so the grant is requested on
// first open (inside the click handler, see requestPermissions). The panel opens
// either way: a refusal renders an explanation instead of appearing to do nothing.
function openSidebar(type) {
  const requested = requestPermissions([type === "bookmarks" ? "bookmarks" : "history"]);
  requested.then((granted) => showSidebar(type, granted));
}
function showSidebar(type, granted) {
  const overlay = document.getElementById("sidebar-overlay");
  const panel = document.getElementById("sidebar-panel");
  const title = panel?.querySelector(".sidebar-header h3");
  const content = panel?.querySelector(".sidebar-content");
  const moreBtn = document.getElementById("sidebar-more");
  if (!overlay || !panel || !content) return;
  if (title) title.textContent = type === "bookmarks" ? t("bookmarks") : t("history");
  content.innerHTML = "";
  const chromeUrl = type === "bookmarks" ? "chrome://bookmarks" : "chrome://history";
  // The header affordance opens the browser's own manager, which is a chrome://
  // page. Firefox rejects chrome: URLs in tabs.create and has no equivalent
  // page, so it is Chrome-only. (Firefox cannot reach this panel at all --
  // its only entry point, the shortcuts row, is hidden on that engine too.)
  const externalLinks = !isFirefox();
  if (moreBtn) {
    moreBtn.style.display = externalLinks ? "" : "none";
    moreBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.25 4.5A1.75 1.75 0 0 0 4.5 6.25v11.5c0 .966.783 1.75 1.75 1.75h11.5a1.75 1.75 0 0 0 1.75-1.75v-4a.75.75 0 0 1 1.5 0v4A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3h4a.75.75 0 0 1 0 1.5h-4ZM13 3.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0V5.56l-5.22 5.22a.75.75 0 0 1-1.06-1.06l5.22-5.22h-4.69a.75.75 0 0 1-.75-.75Z"/></svg>';
    moreBtn.title = t("more");
    moreBtn.onclick = () => {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.create({ url: chromeUrl });
      }
    };
  }
  if (!granted) {
    content.innerHTML = `<div class="sidebar-empty">${escapeHTML(t("permissionNeeded"))}</div>`;
  } else if (type === "bookmarks") {
    loadBookmarksSidebar(content);
  } else {
    loadHistory(content);
  }
  overlay.classList.add("visible");
  panel.classList.add("visible");
}
async function loadBookmarksSidebar(container) {
  container.innerHTML = "";
  const tabBar = document.createElement("div");
  tabBar.className = "sidebar-tabs";
  const indicator = document.createElement("div");
  indicator.className = "sidebar-tab-indicator";
  tabBar.appendChild(indicator);
  const content = document.createElement("div");
  content.className = "sidebar-bookmark-content";
  let tabs;
  if (isFirefox()) {
    try {
      const result = await chrome.bookmarks.getTree();
      const root = result[0];
      const children = root.children || [];
      const findFolder = (nodes, title) => {
        for (const node of nodes) {
          if (node.title === title) return node;
          if (node.children) {
            const found = findFolder(node.children, title);
            if (found) return found;
          }
        }
        return null;
      };
      const bar = findFolder(children, "Bookmarks Toolbar") || findFolder(children, "书签工具栏");
      const menu = findFolder(children, "Bookmarks Menu") || findFolder(children, "书签菜单");
      const other = findFolder(children, "Unfiled Bookmarks") || findFolder(children, "其他书签") || findFolder(children, "Other Bookmarks") || findFolder(children, "其他");
      tabs = [];
      if (bar) tabs.push({ id: bar.id, label: t("bookmarksBar") });
      if (menu) tabs.push({ id: menu.id, label: t("bookmarksMenu") });
      if (other) tabs.push({ id: other.id, label: t("otherBookmarks") });
    } catch {
      tabs = [
        { id: "1", label: t("bookmarksBar") },
        { id: "2", label: t("bookmarksMenu") },
        { id: "3", label: t("otherBookmarks") }
      ];
    }
  } else {
    tabs = [
      { id: "1", label: t("bookmarksBar") },
      { id: "2", label: t("otherBookmarks") }
    ];
  }
  const tabBtns = [];
  let currentFolderId = tabs[0]?.id;
  function moveIndicator(activeBtn) {
    const tabRect = tabBar.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    indicator.style.left = btnRect.left - tabRect.left + "px";
    indicator.style.width = btnRect.width + "px";
  }
  function switchTab(folderId, btn) {
    if (folderId === currentFolderId) return;
    currentFolderId = folderId;
    tabBtns.forEach((b) => b.classList.toggle("active", b === btn));
    moveIndicator(btn);
    content.style.animation = "none";
    content.offsetHeight;
    content.style.animation = "fadeIn 0.2s ease";
    loadBookmarksContent(content, folderId);
  }
  for (const tab of tabs) {
    const btn = document.createElement("button");
    btn.className = "sidebar-tab" + (tab.id === currentFolderId ? " active" : "");
    btn.textContent = tab.label;
    btn.addEventListener("click", () => switchTab(tab.id, btn));
    tabBar.appendChild(btn);
    tabBtns.push(btn);
  }
  container.appendChild(tabBar);
  container.appendChild(content);
  requestAnimationFrame(() => {
    const activeBtn = tabBtns.find((b) => b.classList.contains("active"));
    if (activeBtn) moveIndicator(activeBtn);
  });
  if (currentFolderId) loadBookmarksContent(content, currentFolderId);
}
async function loadBookmarksContent(container, folderId) {
  container.innerHTML = "";
  if (typeof chrome === "undefined" || !chrome.bookmarks) {
    container.innerHTML = '<div class="sidebar-empty">Chrome API not available</div>';
    return;
  }
  try {
    const result = await chrome.bookmarks.getSubTree(folderId);
    const root = result[0];
    if (!root || !root.children || root.children.length === 0) {
      const empty = document.createElement("div");
      empty.className = "sidebar-empty";
      empty.textContent = "EMPTY";
      container.appendChild(empty);
      return;
    }
    renderBookmarkFolder(container, root.children);
  } catch {
    const empty = document.createElement("div");
    empty.className = "sidebar-empty";
    empty.textContent = "EMPTY";
    container.appendChild(empty);
  }
}
function renderBookmarkFolder(container, nodes) {
  for (const node of nodes) {
    if (node.children) {
      const folder = document.createElement("div");
      folder.className = "bookmark-folder";
      const header = document.createElement("button");
      header.className = "bookmark-folder-header";
      header.innerHTML = `
        <span class="bookmark-folder-arrow-cell">
          <svg class="bookmark-folder-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5L8 6L4.5 9.5"/></svg>
        </span>
        <div class="bookmark-folder-info">
          <div class="bookmark-folder-name">${escapeHTML(node.title || "Untitled")}</div>
          <div class="bookmark-folder-type">${t("folder")}</div>
        </div>
      `;
      const children = document.createElement("div");
      children.className = "bookmark-folder-children";
      header.addEventListener("click", () => {
        const isOpen = folder.classList.toggle("open");
        const arrow = header.querySelector(".bookmark-folder-arrow");
        if (arrow) arrow.style.transform = isOpen ? "rotate(90deg)" : "";
      });
      renderBookmarkFolder(children, node.children);
      folder.appendChild(header);
      folder.appendChild(children);
      container.appendChild(folder);
    } else if (node.url) {
      const btn = document.createElement("button");
      btn.className = "sidebar-item";
      btn.innerHTML = `
        <div class="sidebar-item-title">${escapeHTML(node.title || node.url)}</div>
        <div class="sidebar-item-url">${escapeHTML(node.url)}</div>
      `;
      btn.addEventListener("click", () => {
        window.location.href = node.url;
      });
      container.appendChild(btn);
    }
  }
}
async function loadHistory(container) {
  if (typeof chrome === "undefined" || !chrome.history) {
    container.innerHTML = '<div class="sidebar-empty">Chrome API not available</div>';
    return;
  }
  try {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1e3;
    const results = await chrome.history.search({
      text: "",
      startTime: oneWeekAgo,
      maxResults: 80
    });
    if (!results || results.length === 0) {
      container.innerHTML = '<div class="sidebar-empty">No history</div>';
      return;
    }
    for (const item of results) {
      if (!item.url) continue;
      const btn = document.createElement("button");
      btn.className = "sidebar-item";
      const timeStr = item.lastVisitTime ? new Date(item.lastVisitTime).toLocaleString() : "";
      btn.innerHTML = `
        <div class="sidebar-item-title">${escapeHTML(item.title || item.url)}</div>
        <div class="sidebar-item-url">${escapeHTML(item.url)}</div>
        ${timeStr ? `<div class="sidebar-item-time">${escapeHTML(timeStr)}</div>` : ""}
      `;
      btn.addEventListener("click", () => {
        window.location.href = item.url;
      });
      container.appendChild(btn);
    }
  } catch {
    container.innerHTML = '<div class="sidebar-empty">Failed to load history</div>';
  }
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
  updateShortcuts();
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
function getMenuHTML() {
  const showTitle = getStored(STORAGE_KEYS.showTitle, ["true", "false"], "true") === "true";
  const showTime = getStored(STORAGE_KEYS.showTime, ["true", "false"], "false") === "true";
  const showGo = getStored(STORAGE_KEYS.showGo, ["true", "false"], "true") === "true";
  const showShortcuts = getStored(STORAGE_KEYS.showShortcuts, ["true", "false"], "true") === "true";
  const showClickFx = getStored(STORAGE_KEYS.showClickFx, ["true", "false"], "true") === "true";
  const backgroundStyle = getStored(STORAGE_KEYS.backgroundStyle, ["blank", "dots", "stripes"], "blank");
  const theme = getStored(STORAGE_KEYS.theme, ["auto", "light", "dark"], "auto");
  const engine = getStored(STORAGE_KEYS.searchEngine, SEARCH_ENGINES, "browser");
  const lang = getLang();
  const clock = getStored(STORAGE_KEYS.clockFormat, ["12", "24"], "24");
  const searchStyle = getStored(STORAGE_KEYS.searchStyle, ["square", "rounded", "line"], "square");
  return `
    <button class="menu-item" data-action="toggle-title">
      <span class="menu-label">
        <span class="menu-check ${showTitle ? "checked" : ""}">${showTitle ? "&#10003;" : ""}</span>
        ${t("searchTitle")}
      </span>
    </button>
    <button class="menu-item" data-action="toggle-time">
      <span class="menu-label">
        <span class="menu-check ${showTime ? "checked" : ""}">${showTime ? "&#10003;" : ""}</span>
        ${t("timeDisplay")}
      </span>
    </button>
    <button class="menu-item" data-action="toggle-go">
      <span class="menu-label">
        <span class="menu-check ${showGo ? "checked" : ""}">${showGo ? "&#10003;" : ""}</span>
        ${t("showGo")}
      </span>
    </button>
    <button class="menu-item" data-action="toggle-shortcuts" ${isFirefox() ? 'style="display:none"' : ""}>
      <span class="menu-label">
        <span class="menu-check ${showShortcuts ? "checked" : ""}">${showShortcuts ? "&#10003;" : ""}</span>
        ${t("showShortcuts")}
      </span>
    </button>
    <button class="menu-item" data-action="toggle-clickfx">
      <span class="menu-label">
        <span class="menu-check ${showClickFx ? "checked" : ""}">${showClickFx ? "&#10003;" : ""}</span>
        ${t("clickEffects")}
      </span>
    </button>
    <div class="menu-separator"></div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t("background")}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
        <button class="menu-item" data-action="set-background" data-value="blank">
          <span class="menu-label">
            <span class="menu-radio ${backgroundStyle === "blank" ? "selected" : ""}"></span>
            ${t("blankBackground")}
          </span>
        </button>
        <button class="menu-item" data-action="set-background" data-value="dots">
          <span class="menu-label">
            <span class="menu-radio ${backgroundStyle === "dots" ? "selected" : ""}"></span>
            ${t("dotBackground")}
          </span>
        </button>
        <button class="menu-item" data-action="set-background" data-value="stripes">
          <span class="menu-label">
            <span class="menu-radio ${backgroundStyle === "stripes" ? "selected" : ""}"></span>
            ${t("stripeBackground")}
          </span>
        </button>
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t("theme")}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
        <button class="menu-item" data-action="set-theme" data-value="auto">
          <span class="menu-label">
            <span class="menu-radio ${theme === "auto" ? "selected" : ""}"></span>
            ${t("auto")}
          </span>
        </button>
        <button class="menu-item" data-action="set-theme" data-value="light">
          <span class="menu-label">
            <span class="menu-radio ${theme === "light" ? "selected" : ""}"></span>
            ${t("light")}
          </span>
        </button>
        <button class="menu-item" data-action="set-theme" data-value="dark">
          <span class="menu-label">
            <span class="menu-radio ${theme === "dark" ? "selected" : ""}"></span>
            ${t("dark")}
          </span>
        </button>
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t("searchEngine")}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
        <button class="menu-item" data-action="set-engine" data-value="browser" ${isFirefox() ? 'style="display:none"' : ""}>
          <span class="menu-label">
            <span class="menu-radio ${engine === "browser" ? "selected" : ""}"></span>
            ${t("browserDefault")}
          </span>
        </button>
        <button class="menu-item" data-action="set-engine" data-value="google">
          <span class="menu-label">
            <span class="menu-radio ${engine === "google" ? "selected" : ""}"></span>
            ${t("google")}
          </span>
        </button>
        <button class="menu-item" data-action="set-engine" data-value="duckduckgo">
          <span class="menu-label">
            <span class="menu-radio ${engine === "duckduckgo" ? "selected" : ""}"></span>
            ${t("duckduckgo")}
          </span>
        </button>
        <button class="menu-item" data-action="set-engine" data-value="qwant">
          <span class="menu-label">
            <span class="menu-radio ${engine === "qwant" ? "selected" : ""}"></span>
            ${t("qwant")}
          </span>
        </button>
        <button class="menu-item" data-action="set-engine" data-value="bing">
          <span class="menu-label">
            <span class="menu-radio ${engine === "bing" ? "selected" : ""}"></span>
            ${t("bing")}
          </span>
        </button>
        <button class="menu-item" data-action="set-engine" data-value="baidu">
          <span class="menu-label">
            <span class="menu-radio ${engine === "baidu" ? "selected" : ""}"></span>
            ${t("baidu")}
          </span>
        </button>
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t("clockFormat")}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
        <button class="menu-item" data-action="set-clock" data-value="12">
          <span class="menu-label">
            <span class="menu-radio ${clock === "12" ? "selected" : ""}"></span>
            ${t("clock12h")}
          </span>
        </button>
        <button class="menu-item" data-action="set-clock" data-value="24">
          <span class="menu-label">
            <span class="menu-radio ${clock === "24" ? "selected" : ""}"></span>
            ${t("clock24h")}
          </span>
        </button>
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t("searchStyle")}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
        <button class="menu-item" data-action="set-style" data-value="square">
          <span class="menu-label">
            <span class="menu-radio ${searchStyle === "square" ? "selected" : ""}"></span>
            ${t("square")}
          </span>
        </button>
        <button class="menu-item" data-action="set-style" data-value="rounded">
          <span class="menu-label">
            <span class="menu-radio ${searchStyle === "rounded" ? "selected" : ""}"></span>
            ${t("rounded")}
          </span>
        </button>
        <button class="menu-item" data-action="set-style" data-value="line">
          <span class="menu-label">
            <span class="menu-radio ${searchStyle === "line" ? "selected" : ""}"></span>
            ${t("line")}
          </span>
        </button>
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t("language")}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
        <button class="menu-item" data-action="set-lang" data-value="en">
          <span class="menu-label">
            <span class="menu-radio ${lang === "en" ? "selected" : ""}"></span>
            ${t("english")}
          </span>
        </button>
        <button class="menu-item" data-action="set-lang" data-value="zh">
          <span class="menu-label">
            <span class="menu-radio ${lang === "zh" ? "selected" : ""}"></span>
            ${t("chinese")}
          </span>
        </button>
      </div>
    </div>
  `;
}
function refreshMenu() {
  const menu = document.getElementById("context-menu");
  if (menu) menu.innerHTML = getMenuHTML();
}
let menuVisible = false;
document.addEventListener("DOMContentLoaded", async () => {
  migrateLegacySettings();
  document.title = getLang() === "zh" ? "新标签页" : "New tab";
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
      <div class="shortcuts" id="shortcuts">
        <a class="shortcut-item" data-url="chrome://bookmarks" data-i18n="bookmarks"></a>
        <a class="shortcut-item" data-url="chrome://history" data-i18n="history"></a>
        <a class="shortcut-item" data-url="chrome://downloads" data-i18n="downloads"></a>
        <a class="shortcut-item" data-url="chrome://extensions" data-i18n="extensions"></a>
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
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.id = "context-menu";
    menu.innerHTML = getMenuHTML();
    document.body.appendChild(menu);
    const sidebarHTML = `
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <div class="sidebar-panel" id="sidebar-panel">
        <div class="sidebar-header">
          <h3></h3>
          <button class="sidebar-more" id="sidebar-more"></button>
        </div>
        <div class="sidebar-content"></div>
      </div>
    `;
    const sidebarTemp = document.createElement("div");
    sidebarTemp.innerHTML = sidebarHTML;
    while (sidebarTemp.firstChild) {
      document.body.appendChild(sidebarTemp.firstChild);
    }
    document.getElementById("sidebar-overlay").addEventListener("click", hideSidebar);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideSidebar();
    });
    menu.addEventListener("mouseover", (e) => {
      const sub = e.target.closest(".menu-has-sub");
      if (!sub) return;
      const submenu = sub.querySelector(".menu-submenu");
      if (!submenu) return;
      submenu.style.left = "";
      submenu.style.right = "";
      submenu.style.top = "";
      submenu.style.bottom = "";
      requestAnimationFrame(() => {
        const rect = submenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
          submenu.style.left = "auto";
          submenu.style.right = "100%";
        }
        if (rect.bottom > window.innerHeight) {
          submenu.style.top = "auto";
          submenu.style.bottom = "0";
        }
      });
    });
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      menu.classList.add("visible");
      const menuRect = menu.getBoundingClientRect();
      const menuW = menuRect.width;
      const menuH = menuRect.height;
      const x = Math.min(e.clientX, window.innerWidth - menuW - 8);
      const y = Math.min(e.clientY, window.innerHeight - menuH - 8);
      menu.style.left = `${Math.max(0, x)}px`;
      menu.style.top = `${Math.max(0, y)}px`;
      menuVisible = true;
    });
    document.addEventListener("click", () => {
      if (menuVisible) {
        menu.classList.remove("visible");
        menuVisible = false;
      }
    });
    menu.addEventListener("click", (e) => {
      const item = e.target.closest("[data-action]");
      if (item) {
        const action = item.dataset.action;
        const value = item.dataset.value || "";
        switch (action) {
          case "toggle-title":
            setStored(STORAGE_KEYS.showTitle, getStored(STORAGE_KEYS.showTitle, ["true", "false"], "true") === "true" ? "false" : "true");
            updatePrompt();
            refreshMenu();
            break;
          case "toggle-time":
            setStored(STORAGE_KEYS.showTime, getStored(STORAGE_KEYS.showTime, ["true", "false"], "false") === "true" ? "false" : "true");
            updateTime();
            refreshMenu();
            break;
          case "set-background":
            setStored(STORAGE_KEYS.backgroundStyle, value);
            updateDots();
            refreshMenu();
            break;
          case "toggle-go":
            setStored(STORAGE_KEYS.showGo, getStored(STORAGE_KEYS.showGo, ["true", "false"], "true") === "true" ? "false" : "true");
            updateGo();
            refreshMenu();
            break;
          case "toggle-shortcuts":
            setStored(STORAGE_KEYS.showShortcuts, getStored(STORAGE_KEYS.showShortcuts, ["true", "false"], "true") === "true" ? "false" : "true");
            updateShortcuts();
            refreshMenu();
            break;
          case "toggle-clickfx":
            setStored(STORAGE_KEYS.showClickFx, getStored(STORAGE_KEYS.showClickFx, ["true", "false"], "true") === "true" ? "false" : "true");
            updateClickFx();
            refreshMenu();
            break;
          case "set-theme":
            applyTheme(value);
            refreshMenu();
            break;
          case "set-engine":
            setStored(STORAGE_KEYS.searchEngine, value);
            refreshMenu();
            break;
          case "set-clock":
            setStored(STORAGE_KEYS.clockFormat, value);
            updateTime();
            refreshMenu();
            break;
          case "set-style":
            setStored(STORAGE_KEYS.searchStyle, value);
            updateSearchStyle();
            refreshMenu();
            break;
          case "set-lang":
            setStored(STORAGE_KEYS.lang, value);
            document.title = value === "zh" ? "新标签页" : "New tab";
            updateUI();
            refreshMenu();
            break;
        }
      }
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
    document.querySelectorAll(".shortcut-item[data-url]").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const url = item.getAttribute("data-url");
        if (url === "chrome://bookmarks") {
          openSidebar("bookmarks");
        } else if (url === "chrome://history") {
          openSidebar("history");
        } else if (url && typeof chrome !== "undefined" && chrome.tabs) {
          chrome.tabs.create({ url });
        }
      });
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
