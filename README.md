# Personal Website

Static website for showcasing content, hosted on GitHub Pages. It uses shared header and footer partials injected dynamically across pages to keep navigation consistent.

## Features
- Shared header and footer loaded into pages automatically via partials
- Simple, cache-safe include loader for cross-page reuse from any folder depth
- Lightweight structure suitable for GitHub Pages
- Social links in the footer (GitHub, CodePen)

## Quick start (local)
- Serve the site:
  - python3 -m http.server 8000
  - or install PHP and run: sudo apt-get update && sudo apt-get install -y php && php -S 0.0.0.0:8080
- Open in browser:
  - $BROWSER http://localhost:8000
  - or $BROWSER http://localhost:8080

## File structure
- Root entry: `index.html`
- Pages: `pages/` (e.g., `pages/page2.html`, `pages/projects.html`, `pages/page3.html`, `pages/page4.html`, `pages/resume.html`, `pages/survey.html`)
- Partials: `partials/`
  - `partials/header.html`
  - `partials/footer.html`
- Assets: `assets/`
  - CSS: `assets/css/style.css`
  - JS: `assets/js/include.js` (injects header/footer), `assets/js/script.js` (site logic), `assets/js/survey-data.js` (survey helpers and image database)
- Media:
  - `images/` (icons, screenshots, assets for pages)
  - `audio/`, `videos/`
- API:
  - `api/survey-api.php` (handles survey change submissions; stores `pending_changes.json`, `denied_changes.json` in `api/`)
- Favicons & manifest: `favicon-*.png`, `apple-touch-icon.png`, `manifest.json`, `site.webmanifest`

Notes:
- All internal links and asset references use root-absolute paths (e.g., `/assets/css/style.css`, `/partials/header.html`) so they work from any nested page under `/pages/`.
  

## How includes work
- Place these containers in any page:
  - <div id="header-placeholder"></div>
  - <div id="footer-placeholder"></div>
- Load the include loader (near the end of body):
  - <script src="/assets/js/include.js"></script>
- The script fetches `/partials/header.html` and `/partials/footer.html` and injects them into the placeholders on DOMContentLoaded.

## Footer
- Uses anchor links for reliability (no JS required)
- Icons from `/images/` (e.g., `/images/github logo.png`, `/images/codepen-min.png`)

## Development notes
- Keep navigation consistent via `partials/header.html`
- Prefer semantic HTML and accessible labels
- Use root-absolute paths for assets and pages
- Include loader fetches from `/partials/*` so it works from any nested page

### Survey system
- UI: `pages/survey.html`
- Data/Helpers: `assets/js/survey-data.js`
- Backend: `api/survey-api.php` (only works when served with PHP; not available on static GitHub Pages)
- Pending/Denied change JSON files are stored in `api/` alongside the PHP script.

## Deployment
- Push to your repository’s default branch
- Enable GitHub Pages in repository settings
- If using a custom domain, configure CNAME and DNS

If you need the survey API locally, serve with PHP:
- php -S 0.0.0.0:8080
- Then open http://localhost:8080/pages/survey.html

## Cleanup and legacy stubs

This repository has been reorganized to use `/assets`, `/partials`, `/pages`, and `/api`. Legacy root files that previously duplicated content now exist only as tiny stubs (or are safe to delete). They’re not used by the site:

- header.html → use `/partials/header.html`
- footer.html → use `/partials/footer.html`
- include.js → use `/assets/js/include.js` (stub fetches partials from `/partials`)
- style.css → use `/assets/css/style.css`
- script.js → use `/assets/js/script.js` (stub dynamically loads canonical script)
- page2.html, page3.html, page4.html, projects.html, resume.html, survey.html → use `/pages/*`
- survey-api.php → use `/api/survey-api.php`

Additionally, `site.webmanifest` was added to satisfy existing page references.
