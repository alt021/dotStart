# AGENTS.md — dotStart New Tab Extension

Chrome MV3 extension that replaces the default new tab page. Designed for both Chrome and Firefox 109+.

## Project Overview

A minimalist new tab page with a real-time clock, multi-engine search box, configurable background (blank / dot grid / stripes), auto/light/dark theme, a right-click bottom-sheet settings panel, first-run onboarding, and an Easter egg screen.

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
| `src/newtab.js` | All runtime logic — see module breakdown below. ~810 lines. |
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
5. **UI updates** — one `update*()` function per persisted option: `updatePrompt`, `updateTime`, `updateDots`, `updateClickFx`, `updateGo`, `updateSearchStyle`, `updatePlaceholder`. `updateUI()` calls them in the right order.
6. **Search** — `isURL(text)`, `openURL(text)`, `search(query)`. Default engine uses `chrome.search.query()` (Chrome 87+ only — see Firefox caveat below).
7. **Settings panel & onboarding** — `getSettingsContentHTML()` renders the active tab of the bottom-sheet settings panel (tabs: `appearance` / `searchBoxTab` / `shortcutsTab` / `advanced`; the Shortcuts tab is reserved and intentionally empty); `renderSettingsPanel()` / `openSettingsPanel()` / `closeSettingsPanel()` drive it. `showOnboarding()` (async) runs the multi-step first-run flow and pulls the MIT text via `loadLicenseText()`.
8. **Easter egg** — `showEasterEgg()`, triggered by clicking the empty search box 7 times. Renders the hard-coded `EASTER_CONTENT` constant (`{{version}}` → `getRuntimeVersion()`), one line per `<div>`, one blank line per `<br>`. After measuring the rendered content it sets the animation duration to `(content height + viewport) / EASTER_CRAWL_SPEED` so the crawl holds 150 px/s and loops the moment the last line clears the screen.

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
| `showClickFx` | `true` | Click ripple effect |

> Legacy: versions before v2.1.0 wrote a boolean `showDots` key instead of `backgroundStyle`. `migrateLegacySettings()` runs once at startup, converts `showDots: "true"` into `backgroundStyle: "dots"`, then deletes the old key. New code must not read `showDots`.

## Permissions (`manifest.json`)

The only declared permission is `search` — `chrome.search.query()` (Chrome only; Firefox ignores the API but recognises the permission). There are **no** `optional_permissions`: the former `bookmarks` / `history` optional permissions belonged to the removed shortcuts row + bookmarks/history sidebar and were dropped with them.

`tabs` is deliberately **not** declared. Nothing here calls `tabs.create()` anymore, and `tabs` would only be required to read `url` / `pendingUrl` / `title` / `favIconUrl` off `Tab` objects. Do not add it back.

Manifest permissions cannot be split per browser — there is no `browser_specific_settings` override for `permissions`, so Chrome and Firefox read the same array.

## Firefox Compatibility

`browser_specific_settings.gecko.id = "dotstart@amexe2.github.io"` and `strict_min_version = "109.0"`. Code paths:

- `isFirefox()` gates the "browser default" search engine option: it is hidden from the Search Box tab on Firefox because `chrome.search.query` is missing there and the `browser` engine would silently fail; the code falls back to `google` at search time. When a future feature needs `chrome://` pages or privileged `about:` URLs, remember that Firefox rejects **both** families in `tabs.create` and has no reachable equivalent — do not try to remap them.

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