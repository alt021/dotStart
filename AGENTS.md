# AGENTS.md — dotStart New Tab Extension

Chrome MV3 extension that replaces the default new tab page. Designed for both Chrome and Firefox 109+.

## Project Overview

A minimalist new tab page with a real-time clock, multi-engine search box, configurable background (blank / dot grid / stripes), auto/light/dark theme, up to four user-defined shortcuts in a bottom row, a right-click bottom-sheet settings panel, first-run onboarding, a user-written stylesheet, a toolbar button that clears that stylesheet, and an Easter egg screen.

## Tech Stack

- **Runtime**: Chrome Extension MV3 (Firefox 109+ via `browser_specific_settings.gecko`)
- **Language**: HTML / CSS / vanilla JavaScript (ES2020 module)
- **No build step** — `src/newtab.js` is the human-edited source. Do not introduce npm/bundlers.
- **i18n**: `_locales/<locale>/messages.json` for extension metadata (`extName`, `extDescription`, and `actionTitle` for the toolbar button); in-app UI strings live in the `I18N` and `ONBOARDING_I18N` constants inside `src/newtab.js`. The popup is a second document that cannot reach those constants, so `src/popup.js` carries its own `POPUP_I18N` table — see the Custom CSS section for how the two are held in step.
- **Manifest**: `chrome_url_overrides.newtab` → `newtab.html`; `action.default_popup` → `popup.html`

## Key Files

| File | Role |
| --- | --- |
| `manifest.json` | MV3 manifest. References `newtab.html`, the toolbar `action` (`popup.html`) and the five icon files (16/48/96/128/256). No permission was added for the popup. |
| `newtab.html` | Entry HTML; loads `./src/newtab.css` and `./src/newtab.js` as a module, and declares the favicon. |
| `popup.html` | The toolbar button's popup. Loads `./src/popup.css` and `./src/popup.js`. No inline script (MV3 CSP). |
| `src/popup.js` | The popup's whole behaviour: one button that removes the `customCSS` key. Carries its own two-language string table — see the Custom CSS section. |
| `src/popup.css` | The popup's own stylesheet, deliberately not `newtab.css` (whose `body` is `min-height: 100vh` + flex centring). Restates the four tokens it reads; `test_settings.js` holds them byte-identical to `newtab.css`. |
| `src/newtab.js` | All runtime logic — see module breakdown below. ~1730 lines. |
| `src/newtab.css` | Styles. CSS variables for light/dark theme in `:root` and `[data-theme="dark"]`; the Font Awesome subset `@font-face` and the `.fa-*` rules live at the end. |
| `src/fa-solid-900-subset.woff2` | Font Awesome 7.3.1 Free **Solid**, subset to the 18 glyphs the page uses (119 KB → 2.5 KB). Regenerate with `.workbuddy/fa_subset.py` after editing its `ICONS` list, then add the printed codepoint as a `.fa-<name>` rule in `newtab.css`. The script also stamps `?v=<sha256-prefix>` onto the font url — see the icon conventions below for why that tail is load-bearing. |
| `src/fa-solid-900-subset.LICENSE.txt` | Upstream Font Awesome Free licence (icons CC BY 4.0, fonts SIL OFL 1.1). Must ship with the font — do not delete. |
| `_locales/en/messages.json` | `extDescription` for the Chrome Web Store listing. |
| `_locales/zh_CN/messages.json` | Same, Chinese translation. |
| `icon-16.png` / `icon-48.png` / `icon-96.png` / `icon-128.png` / `icon-256(→icon.png)` | Extension icons. |
| `house-regular-full.svg` | Tab favicon, declared in `newtab.html`. Font Awesome 7.3.1 `house` (regular), recoloured to be theme-aware — see the note below. Keep the Font Awesome attribution comment. |
| `scrshot-light.png` / `scrshot-dark.png` | Onboarding step 3 preview, one per theme (currently 700×385 and 601×390 — the pair deliberately does **not** share an aspect ratio; see the onboarding note below for why that is safe). Shot from the real settings panel, then quantised with Pillow (`convert("RGB").quantize(method=Image.Quantize.FASTOCTREE, colors=256)`, which takes them to about 9 KB each). |
| `LICENSE` | MIT license. Fetched at runtime by the onboarding screen; edit here only. |
| `EASTER.MD` | **Editing working copy only — not read at runtime.** Source of truth for humans; the shipped text is the hard-coded `EASTER_CONTENT` constant in `src/newtab.js`. Change one, change the other. |
| `ASSET_AUDIT.md` | Asset review report + remaining cleanup backlog. |
| `AGENTS.md` / `README.md` | Documentation. |

## Runtime Modules (in `src/newtab.js`)

The script is a single ES module. Top-level `function` and `const` declarations form the architecture:

1. **Constants** — `STORAGE_KEYS`, `SEARCH_URLS`, `SEARCH_ENGINES`, `SEARCH_STYLES`, `SEARCH_LIMITS`, `SHORTCUT_MAX` / `SHORTCUT_WEIGHT` / `SHORTCUT_TITLE_MAX`, `I18N` (en/zh UI strings), `ONBOARDING_I18N` (en/zh onboarding HTML), regex constants.
2. **Storage** — `t(key)`, `fmt(str, vars)` (fills `{min}`-style slots), `getStored(key, valid, fallback)`, `setStored(key, value)`, `readLimit(key, spec)` / `isValidLimit(n, spec)` for the numeric settings, `escapeHTML(str)`, the shortcut model (`normalizeURL`, `isValidWeight`, `sanitizeShortcut`, `sortShortcuts`, `readShortcuts`, `writeShortcuts`, `saveShortcut`, `deleteShortcut`), the custom CSS sheet (`readCustomCSS`, `customCSSEnabled`, `writeCustomCSS`, `updateCustomCSS`, and the first-switch-on confirmation stage `requestCustomCSSApply` / `confirmCSSWarning` / `backToCSSStage`), and `migrateLegacySettings()` (idempotent migrations: the legacy `showDots` key, and the renamed search box styles). All persistence is `localStorage`.
3. **Detection** — `detectBrowserLang()` reads `navigator.language`; `defaultEngineAPI()` returns the namespace that can query the browser's *own* default search engine (`chrome.search` on Chromium 87+, `browser.search` on Firefox 111+), or `null` where there is none.
4. **Theming** — `applyTheme()`, `updateUI()` (master rerender).
5. **UI updates** — one `update*()` function per persisted option: `updatePrompt`, `updateTime`, `updateDots`, `updateClickFx`, `updateGo`, `updateSearchStyle`, `updateCustomCSS`, `updatePlaceholder`, `updateShortcuts`. `updateUI()` calls them in the right order.
6. **Search** — `isURL(text)`, `openURL(text)`, `search(query)`. The `browser` engine is handed to `defaultEngineAPI()` as `api.query({ text })`, so the browser's own default engine answers it on both Chromium and Firefox 111+; `engineOptions()` offers that entry only where the probe succeeds and `search()` falls back to `google` where it does not.
7. **Settings panel & onboarding** — `getSettingsItems(tab)` is the single source of truth for the panel: each setting is one entry (`action`, `icon`, `labelKey`, `kind`, `key`, `fallback`, and for the value kinds an `options` list of `[value, labelKey]`). `cardHTML()` renders one card (icon / name / current status), `getSettingsContentHTML()` the whole strip, and `renderSettingsPanel()` / `openSettingsPanel()` / `closeSettingsPanel()` / `openSettingsDialog()` / `closeSettingsDialog()` drive the UI. Tabs: `appearance` / `searchBoxTab` / `shortcutsTab` (the shortcut manager) / `advanced`. Kinds: `"toggle"` flips a boolean in place, `"cycle"` steps to its other option in place (`cycleCurrent()`), `"select"`, `"number"`, `"shortcut"` and `"css"` open a dialog (a value list, a single field, the three-field shortcut form, or the custom CSS textarea), `"disabled"` is inert. A setting with exactly two options is **always** a `cycle` — a menu for two choices is a needless extra step — and `test_settings.js` enforces both halves of that rule (every `cycle` has 2 options, every `select` has ≥3). `getSettingsItems()` is no longer a pure function of the tab: the Search Box tab reads the *current* `searchStyle` and inserts the numeric settings (radius only for `modern`; border weight, box length and transparency for both) between the style selector and the Search button, so a style switch adds or removes tiles, and the Shortcuts tab builds one tile per stored shortcut plus the add tile. A card therefore carries either a static `labelKey` or a runtime `name` (a shortcut's own title — escaped by `cardHTML()`), and either a computed `itemStatus()` or a literal `statusText`; `disabled` is normally the `"disabled"` kind, while the add tile is disabled at runtime once the cap is reached. `applySetting(action, value)` performs the write plus the matching `update*()`. Dismissal: the panel collapses on a right-click (which toggles it) or on a click outside it, and on nothing else — `Esc` closes the dialog only (`closeSettingsDialog()`, the single exit, which also stops the countdown and drops a pending custom CSS sheet). A `storage` listener on `window` reruns `updateCustomCSS()` + `renderSettingsPanel()` when the `customCSS` key changes, which is how the toolbar popup rescues a page that is already open — see the Custom CSS section. Containment is sampled in the **capture** phase (a `capture: true` listener on `document` sets `clickStartedInside`), never re-tested in the bubble-phase listener, because handlers mutate the DOM in between: flipping a card calls `renderSettingsPanel()`, which rewrites `.settings-content` and detaches the clicked element, so a later `settingsPanelEl.contains(e.target)` would answer "outside" and close the panel on every flip. A dialog click must also count as inside — the dialog is a *sibling* of the panel, not a child (both are children of `<body>`), so picking a dialog option would otherwise tear the panel down too. `showOnboarding()` (async) runs the multi-step first-run flow and pulls the MIT text via `loadLicenseText()`.
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
| `searchTransparency` | `0` | How see-through the whole box is, in percent, both styles. Accepts `1`–`100`, or `0` for the default |
| `backgroundStyle` | `blank` | `blank` / `dots` / `stripes` |
| `showClickFx` | `true` | Click ripple effect |
| `shortcuts` | `[]` | JSON array of at most 4 `{ title, url, weight }` objects. Not a scalar like the rest — see the Shortcuts section |
| `customCSS` | *(absent)* | A user-written stylesheet, injected as the last `<style>` in `<head>`. **Absent means off** — there is no "empty string" state, because `writeCustomCSS()` removes the key when the field is blank. See the Custom CSS section |

> Legacy: versions before v2.1.0 wrote a boolean `showDots` key instead of `backgroundStyle`. `migrateLegacySettings()` runs once at startup, converts `showDots: "true"` into `backgroundStyle: "dots"`, then deletes the old key. New code must not read `showDots`.
>
> Legacy: the search box styles were renamed — `square` and `rounded` both became `modern`, the underline `line` became `geek`. The same function maps them through `LEGACY_SEARCH_STYLES`. Remapping matters rather than letting `getStored()` fall back: an unknown value would silently promote every underline user to the boxed style. Both migrations are idempotent, so they run unconditionally on load.

## Search Box Styles

Two styles, and the sizes are `localStorage` numbers applied by `updateSearchStyle()` as custom properties **on `document.documentElement`** (not on the form — see below):

| Style | Frame | Custom properties |
| --- | --- | --- |
| `modern` | Full box with a blur backdrop | `--search-radius`, `--search-border`, `--search-length`, `--search-transparency` |
| `geek` | Baseline only (`border: none` + `border-bottom`) | `--search-border`, `--search-length`, `--search-transparency` |

- **The transparency is the one numeric setting both styles share a meaning for.** It is applied as `opacity` on `.search-box` — the wrapper around the field, the placeholder *and* the Go button — rather than to either frame, so it behaves identically on a full box and on a bare underline, and fades the whole control as a unit. The radius is the opposite case: meaningless without a frame, so its tile is offered for `modern` alone.
- It is published as a **bare number** (`--search-transparency: 60`), not as `60%`, because the rule does arithmetic on it: `opacity: calc(1 - var(--search-transparency, 0) / 100)`. A `px`/`%` tail would make the `calc()` invalid and the whole declaration would be dropped, leaving the box stuck opaque. `styleValue()` decides this from `spec.unit`: `px` settings travel with their unit attached and are read straight back, `%` ones travel bare. Note the fallback `0` resolves to `opacity: 1`, ie the untouched box.

- **The custom properties belong on the root element.** Custom properties inherit downwards only, and `.main` — an *ancestor* of the form — sizes its own `max-width` from `--search-length`, so the container can hold the box at the configured width. Writing them on `#search-form` (as this originally did) hides the value from `.main`, which then clamps the box to the container and makes the length setting look inert above that ceiling. `.main` uses `max-width: calc(var(--search-length, 500px) + var(--page-pad) * 2)` — with border-box that leaves exactly `--search-length` of content — and centres itself with `margin: 0 auto`. **Never put a flat `max-width` back on `.main`**: it was `600px` before, ie 536px of content. `#app` must keep `width: 100%`: the body is a centring flexbox, so left to itself the app div shrinks to its content's max-content width, which no `--search-length` can ever exceed.
- `SEARCH_LIMITS` in `newtab.js` is the single source of truth for the allowed ranges and the defaults; `readLimit()` resolves anything missing, non-integer, or out of range to `spec.default`, and `isValidLimit()` is what the dialog validates against — the two share the rule so a rejected input and a stored value can never disagree.
- **`0` means "keep the default" for every numeric search box setting**, and is always accepted: `isValidLimit()` returns true for `0` regardless of `min`, and `readLimit()` turns a stored `0` back into `spec.default`. So `0` and the default render identically — the tile reports the resolved value, and the dialog's field is prefilled with it too. There is no per-setting flag for this any more; it is the single rule. Only offer a `min` above 0 because it is the smallest *meaningful* value, not to forbid 0. The transparency is the one setting whose default **is** `0` (no fade at all), which is why its range starts at 1: `transparency` is therefore the single spec where `0 <= default < min` is expected, and `test_settings.js` asserts `min <= default < max` only over the three px specs, keeping the weaker "the default is expressible" form for the whole set.
- The CSS rules carry the same defaults as `var(--x, <default>)` fallbacks, purely so a bare `newtab.html` paints sensibly before JS runs. **Keep the two numbers in step** — `.workbuddy/test_settings.js` asserts that they match.
- The radius is written even for `geek`, where the rule hard-codes `border-radius: 0`. Writing it unconditionally means switching styles back and forth cannot lose the value.
- The range hint in the dialog's placeholder comes from the single `rangeHint` template in `I18N`, filled with `min` / `max` / `default` / `unit` from `SEARCH_LIMITS` — never hard-code a range or a unit in the markup, and never add a second wording selected by a flag: the field must advertise exactly the limits the validator enforces, including what `0` resolves to. `unit` is what the tile's status line prints too (`itemStatus()`), so the panel and the dialog cannot disagree about whether a number means px or percent. `.settings-dialog-number` is widened to fit that hint on one line, because a placeholder cannot wrap.

## Shortcuts

Up to four user-defined links (`SHORTCUT_MAX`) in a bottom row, stored as one JSON array under the single `shortcuts` key. Each entry is `{ title, url, weight }`.

| Field | Rule |
| --- | --- |
| `title` | Required. Trimmed, capped at `SHORTCUT_TITLE_MAX` (60) characters, escaped on render. |
| `url` | Required. Normalised by `normalizeURL()` — see below. |
| `weight` | Whole number 1-4 (`SHORTCUT_WEIGHT`). A **blank field in the dialog** means the default (1), and any missing or unusable stored value falls back to it too. |

- **Order is `weight` descending, ties by `title`.** `sortShortcuts()` runs inside `readShortcuts()`, not only on write: the row, the tiles and every index-addressed edit read through it, so "index 0" is the leftmost shortcut whatever produced the stored array (a hand edit, an import, an interrupted write). Drop that sort and a hand-written list silently renders in storage order even though `writeShortcuts()` had sorted it.
- **`0` is not the default marker here.** This is the one numeric setting where `0` is plain out of range — the weight field asks for the default by being left empty. That is why `isValidWeight()` is separate from `isValidLimit()`, whose `0`-means-default rule belongs to the search box sizes alone.
- `normalizeURL()` prepends `https://` when the input names no protocol and refuses `javascript:` / `data:` / `vbscript:` outright. A colon only counts as a scheme separator when no digit follows it, so `example.com:8080` stays a host:port instead of being read as an `example.com:` protocol. **The urls land in an `<a href>`, so this is the only thing between a stored string and script execution** — do not relax it, and keep `sanitizeShortcut()` filtering on every read rather than trusting what was written.
- Every read is sanitised and truncated to the cap; a corrupted value (a `JSON.parse` throw, or a non-array) degrades to an empty list instead of breaking startup.
- The panel's Shortcuts tab is one tile per shortcut plus an add tile. Clicking a shortcut tile reopens the same dialog prefilled and carrying a Delete button: a hard cap of four with no way to edit or remove would make a typo permanent and lock a user out after four adds. The add tile is a `kind: "shortcut"` item with `index: -1`, disabled (via `item.disabled`, **not** the `"disabled"` kind) while the list is full, so it revives as soon as one is deleted.
- The dialog is the three-field variant (`.settings-dialog-shortcut`): title / url / weight, prefilled through the `value` property rather than through the markup, because a title and a url are user input. Read every field — and the error line — off `.settings-dialog-options`; querying them off the overlay finds nothing in a real browser, and the dialog would then refuse to save in complete silence.
- The bottom row is `.shortcuts`, a **sibling** of `.main` (fixed, bottom-centre, hidden when empty). It is out of the flow, so `#app { width: 100% }` and the search box's own centring are unaffected by it.
- Shortcut titles and urls are the only user-supplied strings in the project. `escapeHTML()` is a pure regex transform for that reason — the familiar textContent/innerHTML round-trip needs a real DOM, so under the smoke tests' stub it would quietly return `""` and every escaping assertion would pass for the wrong reason.

## Custom CSS

One user-written stylesheet, stored as a single trimmed string under `customCSS` and injected as a `<style id="custom-css">` element appended to `<head>`. The Advanced tab's `custom-css` tile opens it; the tile prints `customCSSEnabled` or `customCSSNotSet` in its status line.

- **Blank means off, and there is no third state.** `writeCustomCSS()` removes the key when the trimmed text is empty, so "stored" and "switched on" are the same condition and the tile needs exactly one read to report it. `customCSSEnabled()` still trims on the way in, because `localStorage` is hand-writable and a file of spaces must not read as configured.
- **The placement is the precedence mechanism.** `newtab.css` is linked in `<head>` and declares nothing `!important`, so between two rules of equal specificity the later one wins. Appending the sheet at `DOMContentLoaded` therefore puts it after that link on every load — which is why `updateCustomCSS()` must keep appending to `document.head`, and why `test_settings.js` asserts that `newtab.css` still contains no `!important`. The claim and that assertion stand or fall together.
- **`textContent`, never `innerHTML`.** The sheet is user input and `textContent` is not re-parsed, so a `</style>` written inside the CSS stays inert text instead of ending the element. Same reasoning as `escapeHTML()` for shortcut titles.
- **Off means detached, not blanked.** Switching off removes the element and drops the reference; switching back on builds a fresh one, which re-appends it last and preserves the ordering above. Re-applying while already on must **reuse** the mounted element: a new element per apply would both leak and, on the way out, leave the previous sheet applied.
- The dialog is the textarea variant (`.settings-dialog-css`): one field, prefilled through the `.value` property, with no error line — any CSS at all is acceptable and the parser drops what it cannot use, so there is nothing to refuse. Enter must **not** commit it, because the field is a textarea where Enter means "new line"; the keydown handler filters on kind, and `test_settings.js` fires Enter to hold that open. Confirming empty is how the user turns the feature off.
- **The caveat lives in the action row, not in the error line.** `${t("customCSSWarning")}` rides in `.settings-dialog-actions` as a `.settings-dialog-warning` span to the left of the confirm button — right-aligned, no `margin-right: auto`, so it stays against the button it qualifies instead of being thrown to the far end (that end belongs to the shortcut dialog's Delete, which says something different). `.settings-dialog-error` is not the place for it: that line exists to report a **refused value**, and nothing here is ever refused. It is built only in the `isCSS` branch, and `test_settings.js` holds both directions — present in the CSS dialog, absent from the shortcut dialog.
- `.settings-dialog-warning` is the only rule in the project that uses a colour with a hue: `var(--warn)`, the palette's one non-monochrome token, declared in `:root` (#c0392b) and restated in **both** dark blocks (#ff6b6b, see the CSS-variable pitfall). Keep it that way — an error elsewhere in the panel is still just `--fg` plus the invalid border, and recolouring those would be a design change, not a tidy-up. Both `--warn` counts in `test_settings.js` run on the **comment-stripped** sheet: a comment naming the token is not a reader of it, and counting raw text made the assertion fire on prose that was explaining the rule rather than on a second consumer of it.
- One boundary worth knowing: the search box sizes are published as **inline** custom properties on `document.documentElement`. An inline style outranks a stylesheet rule, so a user sheet cannot retune `--search-length` with a plain `:root { … }` — that needs `!important`, or the user targets the elements rather than the variables. That is a consequence of `updateSearchStyle()`, not of the injection.
- Both languages carry `customCSSHint` (the field's placeholder), `customCSSNotSet` and `customCSSEnabled`. The tile's status is a `statusText` built in `getSettingsItems()`, not an `itemStatus()` case: the state is "is anything stored", which is not one of a list of values. The old `comingSoon` key is gone — do not reintroduce placeholder wording for this tile.

### The first-switch-on confirmation stage

This sheet is the one setting that can break the page it lives on, and the page is the only place to undo it. So the **first** switch-on is split in two: `requestCustomCSSApply()` decides, and only the first enable is diverted.

- **Two of the three outcomes still commit immediately.** A blank field (switches the feature off) and an edit to a sheet that is already on both leave the page exactly as working as it already was, so warning about them would be noise. Only `!customCSSEnabled()` with non-blank text opens the stage.
- **"First switch-on" is derived, never stored.** `customCSSEnabled()` already answers it, so there is no extra key and no third state — consistent with "absent means off". The cost is that clearing the sheet and enabling again warns a second time; that is the right side to err on, because that user has just been bitten.
- **The stage rewrites the dialog's contents, not the dialog.** `openCSSConfirmStage()` replaces `.settings-dialog-options` (and the title) inside the same overlay, so `settings-dialog-css-confirm` is the only geometry it restates — `min(520px, 70vw)`, deliberately using `min()` so it lands inside `.settings-dialog`'s own `max-width: 70vw` instead of overriding it. It does not go through `openSettingsDialog()`, which is driven by a settings item's `labelKey`/`options` that this stage has none of.
- **The body is three paragraphs, and the middle one is the point.** Read in order: what can go wrong (`customCSSConfirmNotice`), the way out (`customCSSConfirmEscape`), then the snag with the way out (`customCSSConfirmPinHint`), with the countdown as a `.settings-dialog-count` line underneath. The escape paragraph gets its own block and `font-weight: 500` rather than a colour: `var(--warn)` has exactly one reader **by assertion**, and a second reader would both fail that check and start a second warning colour the panel's monochrome look has no room for. It names the button by the exact string `actionTitle` carries, in both languages — a promise pointing at a differently-labelled button is worse than no promise. The pin hint is there because an `action` button that was never pinned is not on the toolbar at all, which is the one practical way the promised escape can be missing.
- **What is deliberately absent from this feature.** Three defences were designed and dropped; do not reintroduce them without being asked. (1) Scanning the sheet before storing it — the DOM exposes no parse diagnostics, so that can only ever be a blacklist of patterns, which contradicts the whole point of letting advanced users write CSS. (2) A trial period with automatic rollback (a `customCSSPending` key plus a countdown bar). (3) A self-check fuse that probes whether the settings panel is still reachable. What survives is the pair that was chosen: tell the user before they commit, and give them a way out that does not live on the page.
- **`settingsDialogItem` stays the css item for the whole stage.** Routing is keyed off `cssConfirmPending !== null` instead, in the dialog's click handler. Rewriting `item.kind` to mark the stage would break the invariant that this item is a css item.
- **Eight seconds, enforced in state and shown in the UI.** All eight ticks are scheduled up front into `cssConfirmTimers` rather than one interval rescheduling itself, so the single teardown cannot miss a repeat. `confirmCSSWarning()` re-checks `cssConfirmArmed` — the `disabled` attribute only stops a pointer, so without that check the wait would be advisory. The button is unlocked by the last tick, which also clears the count text and drops the `css-confirm-waiting` class; `.settings-dialog-confirm:disabled` is declared **after** the `:hover` rule so a locked button cannot light up (same specificity, later wins).
- **Back, not Cancel.** `.settings-dialog-back` shares the far end of the action row with the shortcut dialog's Delete (one rule, two selectors — they occupy the same slot, and weighting them differently would imply a difference in consequence that is not there). It returns to the field **with the text intact**: a plain cancel would make typing a long stylesheet riskier than it was before the stage existed.
- **`stopCSSConfirmCountdown()` is the only place that touches `cssConfirmTimers`,** and `closeSettingsDialog()` — the single exit for close button, Escape, backdrop click, finished confirm and Back — is its only caller besides `backToCSSStage()`. So "the countdown is always stopped and a pending sheet is always dropped" holds without repeating that cleanup at five call sites.
- Both keydown handlers are inert here: the dialog's own one filters on kind (`number` / `shortcut` only) and `settingsDialogItem.kind` is `"css"` throughout, so Enter cannot commit the stage either.

### The toolbar popup

`manifest.json` declares `action.default_popup = "popup.html"` — a second document on the **same extension origin**, and that is the whole mechanism: same origin means the same `localStorage`, so clearing `customCSS` there clears the sheet this page reads. No permission, no message passing, no service worker.

- **A `storage` event rescues a page that is already open.** `window.addEventListener("storage", …)` in `newtab.js` reruns `updateCustomCSS()` + `renderSettingsPanel()` for the `customCSS` key (and for `key === null`, which is how `localStorage.clear()` arrives). So a user whose page a bad sheet has already wrecked recovers live, without a reload. A pending confirmation is **dropped**, not committed — they have just asked for the sheet to go away, and landing the pending value afterwards would re-break the page they just rescued.
- **The key filter is load-bearing.** Without it, any unrelated write anywhere in the extension would refresh this page's sheet and tear down an open stage. `test_settings.js` observes it where it is actually visible: refreshing an already-mounted sheet is idempotent, so "the sheet survives an unrelated write" cannot tell a filtered listener from an unfiltered one, but an open stage can.
- **The popup carries its own copy of its two strings** (`POPUP_I18N`) and its own `CUSTOM_CSS_KEY`. It cannot import `I18N` — `newtab.js` exports nothing, there is no build step, and importing it would boot the whole new tab page inside a 200 px popup. `test_settings.js` is what keeps them in step: the key literal must equal `STORAGE_KEYS.customCSS`, and the button label must equal `I18N.actionTitle`, so renaming either side fails the suite instead of leaving the button quietly clearing nothing.
- **The popup does not load `newtab.css`.** That sheet's `body` is `min-height: 100vh` + flex centring — right for a page, wrong for a panel that must hug its content. `src/popup.css` restates only the four tokens it reads (`--bg`, `--fg`, `--border`, `--muted`), and the test asserts every value it names exists verbatim in `newtab.css` so a retheme cannot leave the toolbar panel a shade behind.
- `actionTitle` lives in **both** `_locales/*/messages.json` (for `__MSG_actionTitle__`, which resolves against the browser's UI locale) **and** `I18N` in both languages. The page calls `chrome.action.setTitle()` at `DOMContentLoaded` so the tooltip follows the language chosen *in the app*; the manifest value remains the fallback for the window before a new tab has ever loaded. The confirmation stage's escape paragraph quotes that same string — it is the only thing in the product pointing a panicking user at the button, and `test_settings.js` asserts the two stay word-for-word in sync in both languages.


## Permissions (`manifest.json`)

The only declared permission is `search` — `chrome.search.query()` (Chrome only; Firefox ignores the API but recognises the permission). There are **no** `optional_permissions`: the former `bookmarks` / `history` optional permissions belonged to the old fixed shortcuts row (bookmarks / history / downloads / extensions) and to the bookmarks-history sidebar, both of which were dropped with it.

The shortcuts row is back, but it needs no permission at all: entries are user-supplied http(s) urls rendered as plain `<a href>` links, so nothing reads the browser's bookmarks, history or tabs. The `bookmarks` / `history` permissions must stay gone.

`tabs` is deliberately **not** declared either. Nothing here calls `tabs.create()` — the row is plain links — and `tabs` would only be required to read `url` / `pendingUrl` / `title` / `favIconUrl` off `Tab` objects. Do not add it back.

The custom CSS sheet needs no permission and no CSP relaxation: a `<style>` element built with `createElement()` and filled through `textContent` is same-origin CSS, not inline script, and the MV3 default policy restricts `script-src` alone. Do not add a `content_security_policy` entry on its behalf.

The toolbar `action` needs no permission either. The popup is an extension page — it shares the extension origin, so it reads and writes the very same `localStorage` this page uses, and it renders nothing but a button and a line of text. There is no `background` service worker and no message passing anywhere in this feature; do not add `storage`, `scripting`, `tabs` or a `background` entry for it. `test_settings.js` asserts the permission array is still exactly `["search"]` and that no `optional_permissions` / `background` / `content_scripts` block has appeared.

Manifest permissions cannot be split per browser — there is no `browser_specific_settings` override for `permissions`, so Chrome and Firefox read the same array.

## Firefox Compatibility

`browser_specific_settings.gecko.id = "dotstart@amexe2.github.io"` and `strict_min_version = "109.0"`. Code paths:

- The "browser default" search engine is gated on **capability, not a browser sniff**: `defaultEngineAPI()` probes `chrome.search.query` and `browser.search.query` and returns the first that exists, `browser` first — Firefox publishes that namespace natively and only aliases it as `chrome`, and Chromium has no `browser` at all, so each browser ends up on its native form. Firefox has shipped `browser.search.query` since **111**, so Firefox users get the entry like everyone else — it used to be hidden behind `isFirefox()`, which silently made "跟随浏览器" unsettable there. Firefox 109/110 (the versions below its floor) have the `search` namespace *without* `query()`, which is exactly why the probe checks the method, not the namespace: `search()` then falls back to `google` instead of doing nothing at all. When a future feature needs `chrome://` pages or privileged `about:` URLs, remember that Firefox rejects **both** families in `tabs.create` and has no reachable equivalent — do not try to remap them.

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
- Icons in the settings panel come from **Font Awesome Free (Solid)**, shipped as a local subset font — the extension is offline, so a CDN `<link>` is never acceptable. Adding an icon means: append its name to `ICONS` in `.workbuddy/fa_subset.py`, re-run it (needs `fonttools[woff]` + `brotli` in the managed venv), copy the printed codepoint into `newtab.css`, then run `.workbuddy/fa_verify.py`. Keep `src/fa-solid-900-subset.LICENSE.txt` with the font (OFL requirement). **Pick a glyph whose codepoint is in the PUA**: `fa-plus` is `U+002B`, an ASCII plus, and every codepoint parser here (`.workbuddy/fa_verify.py`, `test_settings.js`) matches 4-6 hex digits, so a 2-digit escape is silently skipped everywhere. `fa-square-plus` (`U+F0FE`) is the same idea in the PUA range, and it matches the panel's square tiles besides.
- **The subset font's url must keep its `?v=<hash>` tail.** An extension resource is cached by the browser under its full url, so regenerating `fa-solid-900-subset.woff2` without changing the url leaves every newly added glyph invisible — that is exactly how the size-setting icons once came up blank, and it looks like a broken `@font-face` rather than a cache. `.workbuddy/fa_subset.py` computes the font's SHA-256 and rewrites the tail in `newtab.css` automatically, so just re-run it and never edit that tail by hand; `.workbuddy/fa_verify.py` fails when the tail no longer matches the font on disk.
- Icon coverage is verified end to end, so a blank tile cannot ship: `fa_verify.py` collects the icon names from **both** the `icon:` fields and the literal `class="fa-solid fa-x"` templates (the dialog's close button comes from the latter), then checks each one against the CSS rule, the font cmap, and — by drawing it through `BoundsPen` — that the glyph actually has contours. It also reports `.fa-*` rules nothing references, and any codepoint in the font the CSS never maps.
- A tile of `kind: "number"` opens the input variant of the dialog: one text field, its placeholder built from `SEARCH_LIMITS` (never hard-coded), an error line that is always present (so revealing an error does not shift the button) and a confirm button that Enter also triggers. Validate with `isValidLimit()`, store the raw integer — a `0` is stored as `0`, not as the default, and `readLimit()` resolves it on every read so the tile and the field both report the default. Then call the matching `applySetting()` case; the tile re-renders and reports the resolved value.
- A setting with **two** values is a `kind: "cycle"` tile: clicking it writes the other value and re-renders. Never route a two-option setting to the dialog — `.workbuddy/test_settings.js` asserts every `cycle` has exactly two options and every `select` at least three, so a two-option `select` cannot sneak back in.
- Icons must be square PNGs and registered in `manifest.json.icons`. Chrome Web Store requires 16/48/128; Firefox requires 48/96.
- The bottom sheet is the **only** rounded surface of the settings UI (`border-radius: 8px 8px 0 0` on its top edge). Everything inside it is right-angled — tiles, the value dialog, its close button and the square `.menu-radio` marker all use `border-radius: 0`. Keep it that way: a matching rounded corner on any inner surface reads as a mistake.
- A tile is a **fixed square** whose side is the single token `--settings-tile` (in `:root`): `flex: 0 0 var(--settings-tile); width/height: var(--settings-tile)`. The panel has **no** `height` of its own — it is sized by the strip, and `.settings-content` carries `min-height: calc(var(--settings-tile) + 2.25rem)` so every tab yields the same panel height, even one holding a single tile (the Shortcuts tab with nothing saved is the current case). Retune the panel by editing that one token; nothing else needs to change.
- The strip is scrollable but shows **no** scrollbar (`scrollbar-width: none` + `.settings-content::-webkit-scrollbar { display: none }`). At the shipped tile size a full tab is narrower than the strip on a normal window, so a visible bar would be dead weight; the wheel handler in `newtab.js` still maps `deltaY` to `scrollLeft` for narrow windows. Do not delete `overflow-x: auto` when hiding the bar.
- The icon inside a tile is scaled to the tile: `1.5rem` for a `125px` tile (≈ one fifth of the side). If you change `--settings-tile`, rescale `.settings-card-icon`, `.settings-card-name` and `.settings-card-status` with it — a full-size icon in a quarter-size tile overflows the plate.
- Inside a tile there is **no** divider between the icon plate and the label, and the glyph sits **slightly below** the plate's centre: `.settings-card-icon` uses `padding-top: 0.75rem`, which drops the centred glyph by 6px (the glyph stays centred in the padding box, so the offset is half the padding). Do not "fix" this by re-centring the icon or by adding a `border-top`, and keep the plate's `background` — it is the only thing separating the two zones.
- The dialog's option list follows the same rule: **no rule between consecutive options**. `.settings-dialog-option:hover`'s fill is the only thing marking the row under the cursor, which is why the rows keep their `0.65rem` vertical padding rather than being tightened once the separator is gone. `test_settings.js` asserts that no `.settings-dialog-option` rule declares a `border-top` or a `border-bottom`.
- The tab favicon (`house-regular-full.svg`) is **theme-aware inside the file**: an embedded `<style>` sets the ink with `@media (prefers-color-scheme: dark)`, matching `--fg` (#000 light / #fff dark). Do not drive it from JS or from `data-theme` — the tab strip follows the browser/OS colour scheme, not the page's theme, so a JS-swapped favicon would go dark on a dark tab strip. Note that Chrome suppresses favicons on the new tab page by design, so this may only be visible in Firefox or when `newtab.html` is opened directly.
- The onboarding screenshots are **framed by CSS, not by their own dimensions**. The pair is shot separately and the two crops need not share an aspect ratio. `.onboarding-img` is a flex item (`flex: 1; min-height: 0`) inside the flex-column `.onboarding-col`, so its **box height** comes from whatever the title and subtitle leave over — the same in both themes, which is what keeps a theme flip from reflowing the panel. It also carries `align-self: center; width: auto; max-width: 100%`: without those the column's default `stretch` would hand both shots a full-width box, and the narrower one would sit inside it with empty strips against its border. To resize the preview, edit the display height (the flex box), never by padding a file up to match its partner.

## Common Pitfalls

- Referring to a missing or non-square icon will block extension load.
- MV3 requires `service_worker` (not `background.scripts`).
- Don't reintroduce `browser.*` direct calls without a Firefox polyfill check.
- Don't gate a browser API on a browser sniff (`isFirefox()`, a UA string) — probe the member you actually call. Firefox's `search.query` arrived in 111, so a sniff would either hide a working feature or offer a dead one.
- `localStorage` is shared across all new-tab pages in the same profile, but each origin has its own. The extension's new tab runs at the extension origin, so values are persistent. **The toolbar popup shares that origin too** — which is the whole reason it can clear the sheet with no permission — and a same-origin write reaches every open copy of the page as a `storage` event.
- CSS variables must be redeclared under both `:root` and `[data-theme="dark"]`; the `@media (prefers-color-scheme: dark)` block only covers `data-theme="auto"`.

## See Also

- `README.md` — user-facing installation + features.
- `ASSET_AUDIT.md` — historical asset review and remaining cleanup tasks.