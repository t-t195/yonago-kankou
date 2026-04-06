# CLAUDE.md

## Project Overview

**yonago-kankou** is a static, single-page tourism infographic for the Yonago area (米子エリア) in Tottori Prefecture, Japan. It showcases 8 tourist attractions with interactive charts and a visual gallery.

## Tech Stack

- **HTML5** — Single `index.html` file, Japanese language (`lang="ja"`)
- **Tailwind CSS** — Loaded via CDN (`https://cdn.tailwindcss.com`)
- **Chart.js** — Loaded via CDN for bar, doughnut, and radar charts
- **Google Fonts** — Noto Sans JP (body), Poppins (headings)
- **Vanilla JavaScript** — No framework; data embedded directly in `<script>` tags

There is **no build process**, no `package.json`, no bundler. The site is fully static and can be served by any web server or opened directly in a browser.

## Repository Structure

```
yonago-kankou/
├── index.html      # Entire application (HTML + CSS + JS)
├── CLAUDE.md       # This file
└── .git/
```

## Architecture

The application is a single HTML file with:

1. **Embedded data** — A JavaScript array of tourist spot objects with properties: `name`, `price`, `priceDisplay`, `purpose`, `feeling`, `rating`, `description`
2. **Inline styles** — Minimal custom CSS in a `<style>` block; Tailwind handles most styling
3. **Chart.js canvases** — Three charts rendered on page load:
   - Horizontal bar chart (admission fee comparison)
   - Doughnut chart (spots by visitor category)
   - Radar chart (emotional keywords analysis)
4. **Static card gallery** — 2-column responsive grid of spot detail cards

### Design System

Color palette ("Energetic & Playful"):
- `#FF6B6B` (red), `#FFD166` (yellow), `#06D6A0` (green), `#118AB2` (blue/primary), `#073B4C` (dark blue/text)

Responsive breakpoint: `md:` (768px) for chart heights and grid layouts.

## Current State

The `index.html` file was deleted in recent commits. The original content exists in git history at commit `5d6ea0c`. To restore:

```bash
git checkout 5d6ea0c -- index.html
```

## Development Workflow

### Running Locally

Open `index.html` directly in a browser, or use any local server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

### Making Changes

- All code lives in `index.html` — edit HTML, CSS, and JS in one file
- No compilation or build step required
- Refresh the browser to see changes
- CDN dependencies require internet access

### Testing

No automated test suite. Verify changes by:
- Opening in a browser and checking all 3 charts render
- Testing responsive layout at mobile and desktop widths
- Confirming Japanese text displays correctly (requires Noto Sans JP font)

## Conventions

- **Language**: All user-facing text is in Japanese; code comments are in English
- **No build tools**: Keep the project as a single static HTML file unless explicitly requested otherwise
- **CDN-only dependencies**: Do not add npm packages or a build pipeline without explicit instruction
- **Inline everything**: CSS and JS stay in `index.html` to keep the single-file simplicity
- **Data format**: Tourist spot data is a JS array of objects — add new spots by appending to the array

## Key Data

8 featured spots: 大山, とっとり花回廊, 水木しげるロード, 足立美術館, 植田正治写真美術館, 皆生温泉, 米子城跡, 夢みなとタワー

Price range: Free to ¥2,300. Ratings: 1-3 stars.
