// The toolbar popup: the one way out of a custom stylesheet that has wrecked the
// new tab page. It runs in its own document, but on the extension's own origin --
// and that is the whole trick. Same origin means the same localStorage, so
// clearing the sheet here clears the sheet the page reads: no permission, no
// message passing, no background service worker. A `storage` event then reaches
// any new tab that is already open, so it recovers without a reload.
//
// Copy: this document cannot reach the `I18N` object over in newtab.js. There is
// no build step, newtab.js exports nothing, and importing it would boot the whole
// new tab page inside a 200px popup. So the two strings it needs live here in
// their own two-language table, and test_settings.js holds the tables in step.
const POPUP_I18N = {
  en: {
    clear: "Clear custom CSS",
    done: "Cleared. If the page is still broken, reload it or open a new tab."
  },
  zh: {
    clear: "清除自定义 CSS",
    done: "已清除。若页面仍未恢复，刷新或新开一个标签页。"
  }
};
// Must equal STORAGE_KEYS.customCSS in newtab.js -- test_settings.js asserts it,
// so renaming the key over there fails the suite instead of leaving this button
// quietly clearing nothing.
const CUSTOM_CSS_KEY = "customCSS";
const THEME_KEY = "theme";
const LANG_KEY = "lang";

function pickLang() {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === "en" || stored === "zh") return stored;
  // Nothing recorded yet -- the toolbar button works before a new tab has ever
  // been opened, so fall back the same way the page does.
  return /^zh/i.test(navigator.language || "") ? "zh" : "en";
}

const lang = pickLang();
// The page publishes its theme as an attribute on <html>; mirror it here so the
// popup looks like part of this extension rather than part of the browser.
// Set from script rather than from the markup because MV3 forbids inline script.
document.documentElement.setAttribute("data-theme", localStorage.getItem(THEME_KEY) || "auto");

const btn = document.getElementById("clear-btn");
const result = document.getElementById("popup-result");
btn.textContent = POPUP_I18N[lang].clear;
btn.addEventListener("click", () => {
  localStorage.removeItem(CUSTOM_CSS_KEY);
  // Left open on purpose: the popup closes on focus loss anyway, and this is the
  // only confirmation the user gets that the click did anything.
  result.textContent = POPUP_I18N[lang].done;
  result.hidden = false;
});
