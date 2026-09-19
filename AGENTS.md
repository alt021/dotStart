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
| `src/newtab.js` | All runtime logic — see module breakdown below. ~1080 lines. |
| `src/newtab.css` | Styles. CSS variables for light/dark theme in `:root` and `[data-theme="dark"]`; the Font Awesome subset `@font-face` and the `.fa-*` rules live at the end. |
| `src/fa-solid-900-subset.woff2` | Font Awesome 7.3.1 Free **Solid**, subset to the 15 glyphs the panel uses (119 KB → 2.1 KB). Regenerate with `.workbuddy/fa_subset.py` after editing its `ICONS` list, then add the printed codepoint as a `.fa-<name>` rule in `newtab.css`. The script also stamps `?v=<sha256-prefix>` onto the font url — see the icon conventions below for why that tail is load-bearing. |
| `src/fa-solid-900-subset.LICENSE.txt` | Upstream Font Awesome Free licence (icons CC BY 4.0, fonts SIL OFL 1.1). Must ship with the font — do not delete. |
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

1. **Constants** — `STORAGE_KEYS`, `SEARCH_URLS`, `SEARCH_ENGINES`, `SEARCH_STYLES`, `SEARCH_LIMITS`, `I18N` (en/zh UI strings), `ONBOARDING_I18N` (en/zh onboarding HTML), regex constants.
2. **Storage** — `t(key)`, `fmt(str, vars)` (fills `{min}`-style slots), `getStored(key, valid, fallback)`, `setStored(key, value)`, `readLimit(key, spec)` / `isValidLimit(n, spec)` for the numeric settings, `migrateLegacySettings()` (idempotent migrations: the legacy `showDots` key, and the renamed search box styles). All persistence is `localStorage`.
3. **Detection** — `detectBrowserLang()` reads `navigator.language`; `isFirefox()` checks `browser.runtime?.getBrowserInfo`.
4. **Theming** — `applyTheme()`, `updateUI()` (master rerender).
5. **UI updates** — one `update*()` function per persisted option: `updatePrompt`, `updateTime`, `updateDots`, `updateClickFx`, `updateGo`, `updateSearchStyle`, `updatePlaceholder`. `updateUI()` calls them in the right order.
6. **Search** — `isURL(text)`, `openURL(text)`, `search(query)`. Default engine uses `chrome.search.query()` (Chrome 87+ only — see Firefox caveat below).
7. **Settings panel & onboarding** — `getSettingsItems(tab)` is the single source of truth for the panel: each setting is one entry (`action`, `icon`, `labelKey`, `kind`, `key`, `fallback`, and for the value kinds an `options` list of `[value, labelKey]`). `cardHTML()` renders one card (icon / name / current status), `getSettingsContentHTML()` the whole strip, and `renderSettingsPanel()` / `openSettingsPanel()` / `closeSettingsPanel()` / `openSettingsDialog()` / `closeSettingsDialog()` drive the UI. Tabs: `appearance` / `searchBoxTab` / `shortcutsTab` (reserved, intentionally empty) / `advanced`. Kinds: `"toggle"` flips a boolean in place, `"cycle"` steps to its other option in place (`cycleCurrent()`), `"select"` and `"number"` open a dialog (a value list, or a single field), `"disabled"` is inert. A setting with exactly two options is **always** a `cycle` — a menu for two choices is a needless extra step — and `test_settings.js` enforces both halves of that rule (every `cycle` has 2 options, every `select` has ≥3). `getSettingsItems()` is no longer a pure function of the tab: the Search Box tab reads the *current* `searchStyle` and inserts the size settings (radius only for `modern`; border weight and box length for both) between the style selector and the Search button, so a style switch adds or removes tiles. `applySetting(action, value)` performs the write plus the matching `update*()`. Dismissal: the panel collapses on a right-click (which toggles it) or on a click outside it, and on nothing else — `Esc` closes the dialog only. Containment is sampled in the **capture** phase (a `capture: true` listener on `document` sets `clickStartedInside`), never re-tested in the bubble-phase listener, because handlers mutate the DOM in between: flipping a card calls `renderSettingsPanel()`, which rewrites `.settings-content` and detaches the clicked element, so a later `settingsPanelEl.contains(e.target)` would answer "outside" and close the panel on every flip. A dialog click must also count as inside — the dialog is a *sibling* of the panel, not a child (both are children of `<body>`), so picking a dialog option would otherwise tear the panel down too. `showOnboarding()` (async) runs the multi-step first-run flow and pulls the MIT text via `loadLicenseText()`.
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
| `searchStyle` | `modern` | `modern` (boxed) / `geek` (underline) |
| `searchRadius` | `8` | Corner radius in px, `modern` only. Accepts `1`–`60`, or `0` for the default |
| `searchBorder` | `1` | Border weight in px, both styles. Accepts `1`–`10`, or `0` for the default |
| `searchLength` | `500` | Search box width in px, both styles. Accepts `200`–`1200`, or `0` for the default |
| `backgroundStyle` | `blank` | `blank` / `dots` / `stripes` |
| `showClickFx` | `true` | Click ripple effect |

> Legacy: versions before v2.1.0 wrote a boolean `showDots` key instead of `backgroundStyle`. `migrateLegacySettings()` runs once at startup, converts `showDots: "true"` into `backgroundStyle: "dots"`, then deletes the old key. New code must not read `showDots`.
>
> Legacy: the search box styles were renamed — `square` and `rounded` both became `modern`, the underline `line` became `geek`. The same function maps them through `LEGACY_SEARCH_STYLES`. Remapping matters rather than letting `getStored()` fall back: an unknown value would silently promote every underline user to the boxed style. Both migrations are idempotent, so they run unconditionally on load.

## Search Box Styles

Two styles, and the sizes are `localStorage` numbers applied as custom properties on `#search-form` by `updateSearchStyle()`:

| Style | Frame | Sizes |
| --- | --- | --- |
| `modern` | Full box with a blur backdrop | `--search-radius`, `--search-border`, `--search-length` |
| `geek` | Baseline only (`border: none` + `border-bottom`) | `--search-border`, `--search-length` |

- `SEARCH_LIMITS` in `newtab.js` is the single source of truth for the allowed ranges and the defaults; `readLimit()` resolves anything missing, non-integer, or out of range to `spec.default`, and `isValidLimit()` is what the dialog validates against — the two share the rule so a rejected input and a stored value can never disagree.
- **`0` means "keep the default" for every numeric search box setting**, and is always accepted: `isValidLimit()` returns true for `0` regardless of `min`, and `readLimit()` turns a stored `0` back into `spec.default`. So `0` and the default render identically — the tile reports the resolved value, and the dialog's field is prefilled with it too. There is no per-setting flag for this any more; it is the single rule. Only offer a `min` above 0 because it is the smallest *meaningful* value, not to forbid 0.
- The CSS rules carry the same defaults as `var(--x, <default>)` fallbacks, purely so a bare `newtab.html` paints sensibly before JS runs. **Keep the two numbers in step** — `.workbuddy/test_settings.js` asserts that they match.
- The radius is written even for `geek`, where the rule hard-codes `border-radius: 0`. Writing it unconditionally means switching styles back and forth cannot lose the value.
- The range hint in the dialog's placeholder comes from the single `rangeHint` template in `I18N`, filled with `min` / `max` / `default` from `SEARCH_LIMITS` — never hard-code a range in the markup, and never add a second wording selected by a flag: the field must advertise exactly the limits the validator enforces, including what `0` resolves to. `.settings-dialog-number` is widened to fit that hint on one line, because a placeholder cannot wrap.

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
4. Then open a new tab. If an icon ever comes up blank while the rest of a change is visible, suspect a cached resource rather than the CSS: the subset font is the only file loaded as a font, and its `?v=` tail (see the icon conventions) is what makes a regenerated copy take effect. A hard reload of the page settles anything else.

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
- Icons in the settings panel come from **Font Awesome Free (Solid)**, shipped as a local subset font — the extension is offline, so a CDN `<link>` is never acceptable. Adding an icon means: append its name to `ICONS` in `.workbuddy/fa_subset.py`, re-run it (needs `fonttools[woff]` + `brotli` in the managed venv), copy the printed codepoint into `newtab.css`, then run `.workbuddy/fa_verify.py`. Keep `src/fa-solid-900-subset.LICENSE.txt` with the font (OFL requirement).
- **The subset font's url must keep its `?v=<hash>` tail.** An extension resource is cached by the browser under its full url, so regenerating `fa-solid-900-subset.woff2` without changing the url leaves every newly added glyph invisible — that is exactly how the size-setting icons once came up blank, and it looks like a broken `@font-face` rather than a cache. `.workbuddy/fa_subset.py` computes the font's SHA-256 and rewrites the tail in `newtab.css` automatically, so just re-run it and never edit that tail by hand; `.workbuddy/fa_verify.py` fails when the tail no longer matches the font on disk.
- Icon coverage is verified end to end, so a blank tile cannot ship: `fa_verify.py` collects the icon names from **both** the `icon:` fields and the literal `class="fa-solid fa-x"` templates (the dialog's close button comes from the latter), then checks each one against the CSS rule, the font cmap, and — by drawing it through `BoundsPen` — that the glyph actually has contours. It also reports `.fa-*` rules nothing references, and any codepoint in the font the CSS never maps.
- A tile of `kind: "number"` opens the input variant of the dialog: one text field, its placeholder built from `SEARCH_LIMITS` (never hard-coded), an error line that is always present (so revealing an error does not shift the button) and a confirm button that Enter also triggers. Validate with `isValidLimit()`, store the raw integer — a `0` is stored as `0`, not as the default, and `readLimit()` resolves it on every read so the tile and the field both report the default. Then call the matching `applySetting()` case; the tile re-renders and reports the resolved value.
- A setting with **two** values is a `kind: "cycle"` tile: clicking it writes the other value and re-renders. Never route a two-option setting to the dialog — `.workbuddy/test_settings.js` asserts every `cycle` has exactly two options and every `select` at least three, so a two-option `select` cannot sneak back in.
- Icons must be square PNGs and registered in `manifest.json.icons`. Chrome Web Store requires 16/48/128; Firefox requires 48/96.
- The bottom sheet is the **only** rounded surface of the settings UI (`border-radius: 8px 8px 0 0` on its top edge). Everything inside it is right-angled — tiles, the value dialog, its close button and the square `.menu-radio` marker all use `border-radius: 0`. Keep it that way: a matching rounded corner on any inner surface reads as a mistake.
- A tile is a **fixed square** whose side is the single token `--settings-tile` (in `:root`): `flex: 0 0 var(--settings-tile); width/height: var(--settings-tile)`. The panel has **no** `height` of its own — it is sized by the strip, and `.settings-content` carries `min-height: calc(var(--settings-tile) + 2.25rem)` so every tab, including the empty Shortcuts one, yields the same panel height. Retune the panel by editing that one token; nothing else needs to change.
- The strip is scrollable but shows **no** scrollbar (`scrollbar-width: none` + `.settings-content::-webkit-scrollbar { display: none }`). At the shipped tile size a full tab is narrower than the strip on a normal window, so a visible bar would be dead weight; the wheel handler in `newtab.js` still maps `deltaY` to `scrollLeft` for narrow windows. Do not delete `overflow-x: auto` when hiding the bar.
- The icon inside a tile is scaled to the tile: `1.5rem` for a `125px` tile (≈ one fifth of the side). If you change `--settings-tile`, rescale `.settings-card-icon`, `.settings-card-name` and `.settings-card-status` with it — a full-size icon in a quarter-size tile overflows the plate.
- Inside a tile there is **no** divider between the icon plate and the label, and the glyph sits **slightly below** the plate's centre: `.settings-card-icon` uses `padding-top: 0.75rem`, which drops the centred glyph by 6px (the glyph stays centred in the padding box, so the offset is half the padding). Do not "fix" this by re-centring the icon or by adding a `border-top`, and keep the plate's `background` — it is the only thing separating the two zones.
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