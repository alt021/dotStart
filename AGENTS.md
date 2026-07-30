# AGENTS.md — Chrome MV3 New Tab Extension

## Project Overview

Chrome Manifest V3 extension that replaces the default new tab page.

## Tech Stack

- **Runtime**: Chrome Extension (MV3)
- **Language**: HTML/CSS/JavaScript
- **Manifest**: `chrome_url_overrides.newtab`

## Key Files

- `manifest.json` — Chrome MV3 manifest (requires `search` permission for omnibox search)
- `newtab.html` — Entry HTML loaded as new tab
- `src/newtab.js` — Main script (search + theme toggle logic)
- `src/newtab.css` — Styles with CSS custom properties for theming

## Loading Extension in Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select the project root folder

## Important Notes

- The project root is the loadable extension directory; no build step is required
- Extension icons are optional; if added, use square PNG files and reference them from `manifest.json`
- For MV3, service workers replace background scripts
- Content Security Policy is enforced; no remote code execution
- `chrome_url_overrides.newtab` must point to an HTML file in the extension root
- Theme preference stored in `localStorage` (key: `theme`, values: `auto`/`light`/`dark`)
- `chrome.search.query()` requires the `search` permission in manifest

## Common Pitfalls

- referencing missing or non-square icon files causes extension load errors
- MV3 does not support `background.scripts` — use `service_worker` instead
- Use `chrome.*` APIs, not `browser.*` (unless using polyfill)
