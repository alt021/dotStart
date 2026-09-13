# AGENTS.md — dotStart New Tab Extension

Chrome MV3 extension that replaces the default new tab page. Designed for both Chrome and Firefox 109+.

## Project Overview

A minimalist new tab page with a real-time clock, multi-engine search box, configurable background (blank / dot grid / stripes), auto/light/dark theme, right-click context menu, bookmarks + history sidebar, first-run onboarding, and an Easter egg screen.

## Tech Stack

- **Runtime**: Chrome Extension MV3 (Firefox 109+ via `browser_specific_settings.gecko`)
- **Language**: HTML / CSS / vanilla JavaScript (ES2020 module)
- **No build step** — `src/newtab.js` is the human-edited source. Do not introduce npm/bundlers.
- **i18n**: `_locales/<locale>/messages.json` for extension metadata (`extDescription`); in-app UI strings live in the `I18N` and `ONBOARDING_I18N` constants inside `src/newtab.js`.
- **Manifest**: `chrome_url_overrides.newtab` → `newtab.html`

## Key Files

| File | Role |
| --- | --- |
| `manifest.json` | MV3 manifest. References `newtab.html` and the five icon files (16/48/96/128/256). |
| `newtab.html` | Entry HTML; loads `./src/newtab.css` and `./src/newtab.js` as a module, and declares the favicon. |
| `src/newtab.js` | All runtime logic — see module breakdown below. ~1230 lines. |
| `src/newtab.css` | Styles. CSS variables for light/dark theme in `:root` and `[data-theme="dark"]`. |
| `_locales/en/messages.json` | `extDescription` for the Chrome Web Store listing. |
| `_locales/zh_CN/messages.json` | Same, Chinese translation. |
| `icon-16.png` / `icon-48.png` / `icon-96.png` / `icon-128.png` / `icon-256(→icon.png)` | Extension icons. |
| `house-regular-full.svg` | Tab favicon, declared in `newtab.html`. Font Awesome 7.3.1 `house` (regular), recoloured to be theme-aware — see the note below. Keep the Font Awesome attribution comment. |
| `scrshot-light.png` / `scrshot-dark.png` | Onboarding step 3 preview. Keep these at the same dimensions (currently 960×540). |
| `LICENSE` | MIT license. Fetched at runtime by the onboarding screen; edit here only. |
| `EASTER.MD` | **Editing working copy only — not read at runtime.** Source of truth for humans; the shipped text is the hard-coded `EASTER_CONTENT` constant in `src/newtab.js`. Change one, change the other. |
| `ASSET_AUDIT.md` | Asset review report + remaining cleanup backlog. |
| `AGENTS.md` / `README.md` | Documentation. |

## Runtime Modules (in `src/newtab.js`)

The script is a single ES module. Top-level `function` and `const` declarations form the architecture:

1. **Constants** — `STORAGE_KEYS`, `SEARCH_URLS`, `SEARCH_ENGINES`, `I18N` (en/zh UI strings), `ONBOARDING_I18N` (en/zh onboarding HTML), regex constants.
2. **Storage** — `t(key)`, `getStored(key, valid, fallback)`, `setStored(key, value)`, `migrateLegacySettings()` (one-shot migration of the legacy `showDots` key). All persistence is `localStorage`.
3. **Detection** — `detectBrowserLang()` reads `navigator.language`; `isFirefox()` checks `browser.runtime?.getBrowserInfo`.
4. **Theming** — `applyTheme()`, `updateUI()` (master rerender).
5. **UI updates** — one `update*()` function per persisted option: `updatePrompt`, `updateTime`, `updateDots`, `updateClickFx`, `updateGo`, `updateSearchStyle`, `updatePlaceholder`, `updateShortcuts`. `updateUI()` calls them in the right order.
6. **Search** — `isURL(text)`, `openURL(text)`, `search(query)`. Default engine uses `chrome.search.query()` (Chrome 87+ only — see Firefox caveat below).
7. **Menu & onboarding** — `getMenuHTML()`, `refreshMenu()` build the right-click settings; `showOnboarding()` (async) runs the multi-step first-run flow and pulls the MIT text via `loadLicenseText()`.
8. **Sidebar** — `showSidebar()` / `hideSidebar()` toggle a panel of `loadBookmarksSidebar()` (recurses via `renderBookmarkFolder`) and `loadHistory()`.
9. **Easter egg** — `showEasterEgg()`, triggered by clicking the empty search box 7 times. Renders the hard-coded `EASTER_CONTENT` constant (`{{version}}` → `getRuntimeVersion()`), one line per `<div>`, one blank line per `<br>`. After measuring the rendered content it sets the animation duration to `(content height + viewport) / EASTER_CRAWL_SPEED` so the crawl holds 150 px/s and loops the moment the last line clears the screen.

Shared helpers: `loadLicenseText()` reads the bundled `LICENSE` through `chrome.runtime.getURL()` and caches it; `getRuntimeVersion()` wraps `chrome.runtime.getManifest().version`.

`DOMContentLoaded` registers the initial paint. Settings changes call `setStored` then `updateUI`.

## Storage Keys (`STORAGE_KEYS`)

| Key | Default | Description |
| --- | --- | --- |
| `theme` | `auto` | `auto` / `light` / `dark` |
| `lang` | `en` | `en` / `zh` |
| `showTitle` | `true` | Show search box title |
| `showTime` | `true` | Show clock |
| `showGo` | `true` | Show search button |
| `clockFormat` | `24h` | `12h` / `24h` |
| `searchEngine` | `browser` | `browser` / `google` / `duckduckgo` / `qwant` / `bing` / `baidu` |
| `searchStyle` | `rounded` | `square` / `rounded` / `line` |
| `backgroundStyle` | `blank` | `blank` / `dots` / `stripes` |
| `showShortcuts` | `true` | Sidebar shortcuts |
| `showClickFx` | `true` | Click ripple effect |

> Legacy: versions before v2.1.0 wrote a boolean `showDots` key instead of `backgroundStyle`. `migrateLegacySettings()` runs once at startup, converts `showDots: "true"` into `backgroundStyle: "dots"`, then deletes the old key. New code must not read `showDots`.

## Permissions (`manifest.json`)

Install-time `permissions`:

- `search` — `chrome.search.query()` (Chrome only; Firefox ignores the API but recognises the permission).

Runtime `optional_permissions`, requested on first use:

- `bookmarks` — bookmarks sidebar.
- `history` — recent history sidebar.

`tabs` is deliberately **not** declared. The extension only calls `chrome.tabs.create()`, which needs no permission; `tabs` would only be required to read `url` / `pendingUrl` / `title` / `favIconUrl` off `Tab` objects, which nothing here does. Do not add it back.

Manifest permissions cannot be split per browser — there is no `browser_specific_settings` override for `permissions`, so Chrome and Firefox read the same array. Keeping the sidebar permissions optional is what lets a single manifest avoid install-time prompts on both. `requestPermissions(perms)` in `src/newtab.js` wraps the two API shapes (`browser.*` promise / `chrome.*` callback) and degrades to "granted" when the API is absent, so the panel still opens with an explanatory message instead of failing silently. Callers must invoke it **synchronously from the event handler** and only chain `.then()` — Firefox drops the user gesture if an `await` happens first.

## Firefox Compatibility

`browser_specific_settings.gecko.id = "dotstart@amexe2.github.io"` and `strict_min_version = "109.0"`. Code paths:

- `isFirefox()` gates the UI differences (the shortcuts row, the "browser default" search engine, the sidebar's external links). When `chrome.search.query` is missing in Firefox, the `browser` engine silently fails — handle by either hiding it or falling back to `google` when `isFirefox()`.
- The sidebar's "More" / footer links open `chrome://bookmarks` and `chrome://history`. All four shortcuts in `.shortcuts` are `chrome://` pages too. Firefox rejects **both** `chrome:` URLs and privileged `about:` URLs (`about:addons`, `about:config`, …) in `tabs.create`, and has no reachable equivalent — its library lives at `chrome://browser/content/places/places.xhtml`, which is still a `chrome:` URL. So on Firefox `updateShortcuts()` hides the whole shortcuts row (plus its menu toggle) and `showSidebar()` hides the two external-link affordances. Do **not** try to remap these to a Firefox URL; there is nowhere to point them. The consequence is that the bookmarks / history sidebar is unreachable on Firefox, so its optional-permission flow is Chrome-only in practice.
- `chrome.*` works in Firefox via the polyfilled namespace, but not all APIs do. The `chrome` namespace there also *returns promises* for async calls (Firefox implements every async API with promises; callbacks are only accepted as a porting aid), so `await chrome.bookmarks.getTree()` is valid on both engines.

## Loading the Extension

Chrome:

1. Open `chrome://extensions/`, enable Developer mode.
2. "Load unpacked" → pick the project root.
3. After changes, click the refresh icon on the extension card.

Firefox:

1. Open `about:debugging#/runtime/this-firefox`.
2. "Load Temporary Add-on…" → pick `manifest.json`.
3. Re-load after each change (temporary add-ons don't persist).

## Editing Conventions

- **Do not** add a build step. Keep `src/newtab.js` directly loadable by the browser.
- **Do not** introduce \uXXXX escapes in source files. Write Chinese as actual characters; the previous bundler output has been replaced with literal text.
- All user-visible strings must live in `I18N` or `ONBOARDING_I18N`, with parallel `en` and `zh` keys. Use `t(key)` to read them.
- Long-form text: `LICENSE` ships as a file and is read with `loadLicenseText()`. The Easter-egg text is the opposite — it is **hard-coded** in `EASTER_CONTENT` so the extension needs no loose data file for it. `EASTER.MD` in the repo root is the human-editable working copy: when it changes, re-sync the constant byte for byte (including the `{{version}}` placeholder). Keep the two identical.
- `EASTER_CONTENT` is one **bilingual** text shared by all languages. Section headings stay inline (`**# 仓库 Repository**`); the tagline and release-note entries stack the two languages on separate lines (`**修复** …` then `**Fixed** …`) so no line mixes zh and en. Blank lines are meaningful — each one becomes a `<br>` in the scroll, so they control the vertical rhythm. Do not add HTML comments to the constant; they would be injected as-is.
- The Easter-egg crawl runs at a fixed `EASTER_CRAWL_SPEED` (150 px/s). The keyframe ends at `translateY(calc(-100% - 100vh))` and the duration is computed from the measured content height in `showEasterEgg()`. If you change the text length, nothing else needs touching — but do not go back to a fixed duration or a fixed `-200%`, which made speed depend on text length and left a blank screen at the end of each loop.
- Version numbers live in `manifest.json`. Read them at runtime via `getRuntimeVersion()` (wraps `chrome.runtime.getManifest().version`) rather than hard-coding in source or in `EASTER.MD`, which uses a `{{version}}` placeholder instead.
- Icons must be square PNGs and registered in `manifest.json.icons`. Chrome Web Store requires 16/48/128; Firefox requires 48/96.
- The tab favicon (`house-regular-full.svg`) is **theme-aware inside the file**: an embedded `<style>` sets the ink with `@media (prefers-color-scheme: dark)`, matching `--fg` (#000 light / #fff dark). Do not drive it from JS or from `data-theme` — the tab strip follows the browser/OS colour scheme, not the page's theme, so a JS-swapped favicon would go dark on a dark tab strip. Note that Chrome suppresses favicons on the new tab page by design, so this may only be visible in Firefox or when `newtab.html` is opened directly.
- Onboarding screenshots (`scrshot-light.png`, `scrshot-dark.png`) must share dimensions to avoid layout jumps during theme switch.

## Common Pitfalls

- Referring to a missing or non-square icon will block extension load.
- MV3 requires `service_worker` (not `background.scripts`).
- Don't reintroduce `browser.*` direct calls without a Firefox polyfill check.
- Don't read `chrome.search.query` on Firefox — gate via `isFirefox()`.
- `localStorage` is shared across all new-tab pages in the same profile, but each origin has its own. The extension's new tab runs at the extension origin, so values are persistent.
- CSS variables must be redeclared under both `:root` and `[data-theme="dark"]`; the `@media (prefers-color-scheme: dark)` block only covers `data-theme="auto"`.

## See Also

- `README.md` — user-facing installation + features.
- `ASSET_AUDIT.md` — historical asset review and remaining cleanup tasks.