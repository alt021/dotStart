const STORAGE_KEYS = {
  theme: "theme",
  showTitle: "showTitle",
  showTime: "showTime",
  showGo: "showGo",
  searchEngine: "searchEngine",
  showDots: "showDots",
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
    chinese: "\u4E2D\u6587",
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
    extensions: "Extensions"
  },
  zh: {
    searchTitle: "\u663E\u793A\u6807\u9898",
    timeDisplay: "\u65F6\u95F4\u663E\u793A",
    showGo: "\u641C\u7D22\u6309\u94AE",
    background: "\u80CC\u666F",
    blankBackground: "\u7A7A\u767D",
    dotBackground: "\u70B9\u9635",
    stripeBackground: "\u6761\u7EB9",
    showShortcuts: "\u5FEB\u6377\u65B9\u5F0F",
    clickEffects: "\u70B9\u51FB\u7279\u6548",
    theme: "\u4E3B\u9898",
    auto: "\u81EA\u52A8",
    light: "\u6D45\u8272",
    dark: "\u6DF1\u8272",
    searchEngine: "\u641C\u7D22\u5F15\u64CE",
    browserDefault: "\u8DDF\u968F\u6D4F\u89C8\u5668",
    google: "Google",
    duckduckgo: "DuckDuckGo",
    qwant: "Qwant",
    bing: "Bing",
    baidu: "\u767E\u5EA6",
    language: "\u8BED\u8A00",
    english: "English",
    chinese: "\u4E2D\u6587",
    clockFormat: "\u65F6\u949F\u683C\u5F0F",
    clock12h: "12\u5C0F\u65F6\u5236",
    clock24h: "24\u5C0F\u65F6\u5236",
    placeholder: "\u8F93\u5165\u641C\u7D22\u5185\u5BB9...",
    go: "\u524D\u5F80",
    searchStyle: "\u641C\u7D22\u6846\u6837\u5F0F",
    square: "\u65B9\u5F62",
    rounded: "\u5706\u89D2\u77E9\u5F62",
    line: "\u6A2A\u7EBF",
    bookmarks: "\u4E66\u7B7E",
    bookmarksBar: "\u6536\u85CF\u5939\u680F",
    bookmarksMenu: "\u4E66\u7B7E\u83DC\u5355",
    otherBookmarks: "\u5176\u4ED6",
    folder: "\u6587\u4EF6\u5939",
    history: "\u5386\u53F2",
    more: "\u66F4\u591A",
    downloads: "\u4E0B\u8F7D",
    extensions: "\u6269\u5C55"
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
function detectBrowserLang() {
  const nav = navigator.language || navigator.userLanguage || "";
  return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
}
function isFirefox() {
  return typeof browser !== "undefined" && browser.runtime;
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
  const now = /* @__PURE__ */ new Date();
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
  const fallback = getStored(STORAGE_KEYS.showDots, ["true", "false"], "true") === "true" ? "dots" : "blank";
  const backgroundStyle = stored === "blank" || stored === "dots" || stored === "stripes" ? stored : fallback;
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
const MIT_LICENSE = `MIT License

Copyright (c) 2025 AmeXE2

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
let onboardingStep = 0;
const ONBOARDING_I18N = {
  zh: {
    pages: [
      `<div class="onboarding-center">
         <div class="onboarding-emoji">\u{1F44B}</div>
          <div class="onboarding-title">\u6B22\u8FCE\u4F7F\u7528dotStart</div>
         <div class="onboarding-subtitle">\u4E00\u4E2A\u73B0\u4EE3 \xB7 \u6781\u7B80 \xB7 \u7EAF\u51C0\u7684\u6D4F\u89C8\u5668\u4E3B\u9875</div>
       </div>`,
      `<div class="onboarding-col">
         <div class="onboarding-title">\u5F00\u6E90\u8BF4\u660E\u4E0E\u4F7F\u7528\u8BB8\u53EF</div>
         <div class="onboarding-subtitle">\u8BF7\u4ED4\u7EC6\u9605\u8BFB\u76F8\u5173\u8BF4\u660E</div>
         <div class="onboarding-scroll">
           <h3>\u6269\u5C55\u8BF4\u660E</h3>
            <ol>
              <li>\u672C\u9879\u76EE\u4E3AVibe Coding\u4EA7\u7269\uFF0C\u4EC5\u4F9B\u4F5C\u8005\u81EA\u7528\u3002\u4EE3\u7801\u8D28\u91CF\u8F83\u5DEE\uFF0C\u5982\u6709\u9700\u8981\u8BF7\u81EA\u884C\u91CD\u6784\u6216\u4FEE\u6539\u3002</li>
              <li>\u672C\u6269\u5C55\u5B8C\u5168\u79BB\u7EBF\u8FD0\u884C\uFF0C\u4E0D\u6536\u96C6\u3001\u4E0A\u4F20\u6216\u5B58\u50A8\u4EFB\u4F55\u6709\u5173\u4E8E\u60A8\u7684\u6570\u636E\u6216\u4FE1\u606F\u3002</li>
              <li>\u4E3A\u5B9E\u73B0\u5FEB\u6377\u65B9\u5F0F\u529F\u80FD\uFF0C\u672C\u6269\u5C55\u9700\u8981\u60A8\u7684\u5386\u53F2\u8BB0\u5F55\u548C\u4E66\u7B7E\u7684\u8BBF\u95EE\u6743\u9650\uFF0C\u6570\u636E\u4EC5\u5728\u672C\u5730\u5B58\u50A8\uFF0C\u4E0D\u4F1A\u88AB\u4E0A\u4F20\u6216\u6536\u96C6\u3002</li>
              <li>\u4E3A\u4FDD\u8BC1\u517C\u5BB9\u6027\uFF0C\u6269\u5C55\u7533\u8BF7\u4E86\u66F4\u591A\u6570\u636E\u6743\u9650\uFF0C\u4F46\u5BF9\u5E94\u7684\u529F\u80FD\u4E0D\u5728\u6240\u6709\u6D4F\u89C8\u5668\u4E2D\u53EF\u7528\u3002\u6240\u6709\u8BFB\u53D6\u7684\u6570\u636E\u6C38\u8FDC\u4E0D\u4F1A\u79BB\u5F00\u60A8\u7684\u8BA1\u7B97\u673A\uFF0C\u4E5F\u4E0D\u4F1A\u88AB\u4E0A\u4F20\u3002</li>
            </ol>
           <h3>\u5F00\u6E90\u8BF4\u660E</h3>
           <pre style="white-space:pre-wrap;font-family:inherit;margin:0.5rem 0">${escapeHTML(MIT_LICENSE)}</pre>
         </div>
       </div>`,
      `<div class="onboarding-col">
         <div class="onboarding-title">\u4F7F\u7528\u65B9\u6CD5</div>
         <div class="onboarding-subtitle">\u70B9\u6309\u53F3\u952E\u6253\u5F00\u8BBE\u7F6E\u83DC\u5355</div>
         <img class="onboarding-img onboarding-img-light" src="scrshot-light.png" alt="\u53F3\u952E\u83DC\u5355\u622A\u56FE">
         <img class="onboarding-img onboarding-img-dark" src="scrshot-dark.png" alt="\u53F3\u952E\u83DC\u5355\u622A\u56FE">
       </div>`,
      `<div class="onboarding-center">
         <div class="onboarding-emoji">\u{1F389}</div>
         <div class="onboarding-title">\u6B22\u8FCE\u4F7F\u7528</div>
       </div>`
    ],
    btns: ["\u5F00\u59CB", "\u540C\u610F", "\u7EE7\u7EED", "\u5B8C\u6210"],
    hint: "\u6EDA\u52A8\u9605\u8BFB\u81F3\u5E95\u90E8\u540E\u53EF\u8FDB\u884C\u4E0B\u4E00\u6B65"
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
              <li>This project is a Vibe Coding product, intended for personal use only. Code quality may be poor \u2014 feel free to refactor or modify as needed.</li>
              <li>This extension runs entirely offline. It does not collect, upload, or store any of your data or information.</li>
              <li>To enable shortcuts, this extension requires access to your history and bookmarks. Data is stored locally only and is never uploaded or collected.</li>
              <li>For compatibility, this extension requests additional data permissions, but the corresponding features are not available in all browsers. All read data never leaves your computer and is never uploaded.</li>
            </ol>
           <h3>Open Source License</h3>
           <pre style="white-space:pre-wrap;font-family:inherit;margin:0.5rem 0">${escapeHTML(MIT_LICENSE)}</pre>
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
function showOnboarding() {
  if (localStorage.getItem("onboardingDone") === "true") return;
  const lang = getLang();
  const ob = ONBOARDING_I18N[lang];
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
    panel.innerHTML = html;
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
function showSidebar(type) {
  const overlay = document.getElementById("sidebar-overlay");
  const panel = document.getElementById("sidebar-panel");
  const title = panel?.querySelector(".sidebar-header h3");
  const content = panel?.querySelector(".sidebar-content");
  const footerLink = panel?.querySelector(".sidebar-footer-link");
  const moreBtn = document.getElementById("sidebar-more");
  if (!overlay || !panel || !content) return;
  if (title) title.textContent = type === "bookmarks" ? t("bookmarks") : t("history");
  content.innerHTML = "";
  const chromeUrl = type === "bookmarks" ? "chrome://bookmarks" : "chrome://history";
  if (moreBtn) {
    moreBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.25 4.5A1.75 1.75 0 0 0 4.5 6.25v11.5c0 .966.783 1.75 1.75 1.75h11.5a1.75 1.75 0 0 0 1.75-1.75v-4a.75.75 0 0 1 1.5 0v4A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3h4a.75.75 0 0 1 0 1.5h-4ZM13 3.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0V5.56l-5.22 5.22a.75.75 0 0 1-1.06-1.06l5.22-5.22h-4.69a.75.75 0 0 1-.75-.75Z"/></svg>';
    moreBtn.title = t("more");
    moreBtn.onclick = () => {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.create({ url: chromeUrl });
      }
    };
  }
  if (footerLink) {
    footerLink.onclick = () => {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.create({ url: chromeUrl });
      }
    };
  }
  if (type === "bookmarks") {
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
      const bar = findFolder(children, "Bookmarks Toolbar") || findFolder(children, "\u4E66\u7B7E\u5DE5\u5177\u680F");
      const menu = findFolder(children, "Bookmarks Menu") || findFolder(children, "\u4E66\u7B7E\u83DC\u5355");
      const other = findFolder(children, "Unfiled Bookmarks") || findFolder(children, "\u5176\u4ED6\u4E66\u7B7E") || findFolder(children, "Other Bookmarks") || findFolder(children, "\u5176\u4ED6");
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
  if (engine === "browser" && typeof chrome !== "undefined" && chrome.search) {
    chrome.search.query({ text: query });
  } else if (engine in SEARCH_URLS) {
    window.location.href = SEARCH_URLS[engine] + encodeURIComponent(query);
  }
}
function getMenuHTML() {
  const showTitle = getStored(STORAGE_KEYS.showTitle, ["true", "false"], "true") === "true";
  const showTime = getStored(STORAGE_KEYS.showTime, ["true", "false"], "false") === "true";
  const showGo = getStored(STORAGE_KEYS.showGo, ["true", "false"], "true") === "true";
  const showShortcuts = getStored(STORAGE_KEYS.showShortcuts, ["true", "false"], "true") === "true";
  const showClickFx = getStored(STORAGE_KEYS.showClickFx, ["true", "false"], "true") === "true";
  const backgroundStyle = getStored(STORAGE_KEYS.backgroundStyle, ["blank", "dots", "stripes"], getStored(STORAGE_KEYS.showDots, ["true", "false"], "true") === "true" ? "dots" : "blank");
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
        <button class="menu-item" data-action="set-engine" data-value="browser">
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
document.addEventListener("DOMContentLoaded", () => {
  document.title = getLang() === "zh" ? "\u65B0\u6807\u7B7E\u9875" : "New tab";
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
    updateShortcuts();
    updateClickFx();
    setInterval(updateTime, 1e3);
    showOnboarding();
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
        <div class="sidebar-footer">
          <button class="sidebar-footer-link"></button>
        </div>
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
            document.title = value === "zh" ? "\u65B0\u6807\u7B7E\u9875" : "New tab";
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
          showSidebar("bookmarks");
        } else if (url === "chrome://history") {
          showSidebar("history");
        } else if (url && typeof chrome !== "undefined" && chrome.tabs) {
          chrome.tabs.create({ url });
        }
      });
    });

    const GUIDE_CONTENT_ZH = `**dotStart** 2.1.0

一个 现代 · 极简 · 干净 的新标签页


**# 仓库**

https://github.com/alt021/dotStart


**# 制作者**

AmeXE2
ChatGPT
Xiaomi MiMO


**# 联系我们**

alts.tech@hotmail.com


**# 发行日志**

// rel#2.1.0-20260812
  **修复** 适配Firefox浏览器

// rel#2.0.0-20260730
  **新增** 条纹背景模式
  **修复** 修改项目主视觉效果
  **修复** 移除对npm的依赖
  **修复** 使用引导适配深色模式`;

    const GUIDE_CONTENT_EN = `**dotStart** 2.1.0

A modern · minimal · clean new tab page


**# Repository**

https://github.com/alt021/dotStart


**# Creator**

AmeXE2
ChatGPT
Xiaomi MiMO


**# Contact**

alts.tech@hotmail.com


**# Release Note**

// rel#2.1.0-20260812
  **Fixed** Firefox browser compatibility

// rel#2.0.0-20260730
  **Added** Stripe background mode
  **Fixed** Modified main visual effect
  **Fixed** Removed npm dependency
  **Fixed** Onboarding adapted for dark mode`;

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
      const lang = getLang();
      const guideContent = lang === "zh" ? GUIDE_CONTENT_ZH : GUIDE_CONTENT_EN;
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
