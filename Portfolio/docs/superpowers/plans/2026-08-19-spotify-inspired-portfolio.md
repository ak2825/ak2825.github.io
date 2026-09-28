# Spotify-Inspired Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, accessible, multi-page static portfolio that closely follows Spotify's current interface while presenting Anna Kim as an analyst with personality.

**Architecture:** Create a self-contained static site under `site/` with semantic HTML pages, shared CSS organized by responsibility, and one dependency-free JavaScript controller for progressive enhancements. Essential content and navigation are server-rendered in the HTML so the site remains usable from `file://`, over HTTP, and without JavaScript.

**Tech Stack:** HTML5, CSS custom properties and media queries, vanilla JavaScript, Node.js built-in test runner, Python static HTTP server, browser-based visual QA

**Spec:** `docs/superpowers/specs/2026-08-19-spotify-inspired-portfolio-design.md`

## Global Constraints

- The site must feel like Anna's personal version of Spotify and communicate "analyst with personality" within ten seconds.
- Use a multi-page static architecture with no React, backend, database, CMS, build pipeline, or Spotify API.
- Use CSS tokens for `#000000`, `#121212`, `#181818`, `#F6F6F6`, `#B3B3B3`, and provisional accent `#1ED760`.
- Follow Spotify's current layout, spacing, hierarchy, navigation chrome, card treatments, playlist headers, track rows, hover states, and responsive behavior as closely as practical without using Spotify's logo or claiming affiliation.
- Use "Good morning, listener," "Good afternoon, listener," or "Good evening, listener" based on local time.
- Use "Made for you" rather than recruiter-explicit language.
- Every project page contains Context, Findings or Result, What Anna Learned, and a prominent repository action.
- Music links open Spotify externally; the site does not play or embed music.
- Profile hobbies begin as explicit development placeholders that are easy to replace or hide before launch.
- Essential navigation and content must remain usable without JavaScript.
- Support keyboard navigation, visible focus, reduced motion, sufficient contrast, descriptive alternative text, and narrow screens without horizontal scrolling.
- The source website at `/Users/annakim/PROJECTS/portfolio website/` remains untouched; build the redesign in `/Users/annakim/Documents/ChatGPT/Portfolio/site/`.
- The workspace is not currently a Git repository. Record task checkpoints in the plan; run Git commits only if the user initializes a repository before execution.

## File Structure

```text
site/
├── index.html                         # Recruiter-facing home and experience library
├── profile.html                       # Personal profile and hobby placeholders
├── project-beats-and-beliefs.html     # Project playlist case study
├── project-froggit.html               # Project playlist case study
├── project-nba-analytics.html         # Project playlist case study
├── project-allington-lab.html         # Project/research playlist case study
├── Anna_Kim_Resume.pdf                # August 2026 resume
└── assets/
    ├── css/
    │   ├── tokens.css                 # Color, type, spacing, radius, and motion tokens
    │   ├── shell.css                  # App shell, sidebar, top bar, main pane, player bar
    │   ├── components.css             # Cards, track rows, buttons, chips, expandable experiences
    │   └── responsive.css             # Tablet/mobile adaptations and reduced motion
    ├── js/
    │   └── site.js                    # Greeting, disclosures, current-page label, safe enhancements
    └── images/
        └── covers/
            ├── beats-and-beliefs.svg
            ├── froggit.svg
            ├── nba-analytics.svg
            └── allington-lab.svg
tests/
└── site.test.cjs                      # Node tests for structure, links, content, and JS helpers
package.json                           # Dependency-free test scripts
```

The four CSS files have distinct responsibilities and load in the order shown. HTML owns content and fallback behavior. `site.js` enhances rather than creates essential content.

---

### Task 1: Establish the Tested Static-Site Foundation

**Files:**
- Create: `package.json`
- Create: `tests/site.test.cjs`
- Create: `site/assets/css/tokens.css`
- Create: `site/assets/css/shell.css`
- Create: `site/assets/css/components.css`
- Create: `site/assets/css/responsive.css`
- Create: `site/assets/js/site.js`
- Create: `site/index.html`
- Copy: `/Users/annakim/Downloads/Anna_Kim_Resume.pdf` to `site/Anna_Kim_Resume.pdf`

**Interfaces:**
- Produces: `PortfolioSite.greetingForHour(hour: number): string`
- Produces: `PortfolioSite.init(documentRef: Document, date?: Date): void`
- Produces: shared CSS classes `.app-shell`, `.sidebar`, `.main-view`, `.topbar`, `.content`, `.media-card`, `.track-row`, `.experience-disclosure`, and `.now-viewing`
- Consumes: the approved specification and August 2026 resume

- [ ] **Step 1: Write the initial failing structural and greeting tests**

Create `package.json`:

```json
{
  "name": "anna-kim-portfolio",
  "private": true,
  "scripts": {
    "test": "node --test tests/site.test.cjs"
  }
}
```

Create `tests/site.test.cjs` with helpers and initial assertions:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const site = (...parts) => path.join(root, 'site', ...parts);
const read = (...parts) => fs.readFileSync(site(...parts), 'utf8');

test('home includes semantic shell and no Spotify logo', () => {
  const html = read('index.html');
  assert.match(html, /<aside[^>]+class="[^"]*sidebar/);
  assert.match(html, /<main[^>]+class="[^"]*main-view/);
  assert.match(html, /<footer[^>]+class="[^"]*now-viewing/);
  assert.doesNotMatch(html, /Spotify logo/i);
});

test('all shared stylesheets exist and are loaded in order', () => {
  const html = read('index.html');
  const expected = ['tokens.css', 'shell.css', 'components.css', 'responsive.css'];
  let previous = -1;
  for (const filename of expected) {
    assert.ok(fs.existsSync(site('assets', 'css', filename)));
    const position = html.indexOf(filename);
    assert.ok(position > previous, `${filename} should load in order`);
    previous = position;
  }
});

test('greeting uses local-time day periods', () => {
  const { greetingForHour } = require('../site/assets/js/site.js');
  assert.equal(greetingForHour(8), 'Good morning, listener.');
  assert.equal(greetingForHour(15), 'Good afternoon, listener.');
  assert.equal(greetingForHour(21), 'Good evening, listener.');
});
```

- [ ] **Step 2: Run the tests and confirm the foundation is absent**

Run: `npm test`

Expected: FAIL because `site/index.html` and `site/assets/js/site.js` do not exist.

- [ ] **Step 3: Create the shared token system and application shell**

Define exact root tokens in `tokens.css`:

```css
:root {
  --color-ink: #000000;
  --color-base: #121212;
  --color-elevated: #181818;
  --color-text: #f6f6f6;
  --color-muted: #b3b3b3;
  --color-accent: #1ed760;
  --color-accent-hover: #3be477;
  --sidebar-width: 17.5rem;
  --player-height: 5.5rem;
  --radius-panel: 0.5rem;
  --radius-card: 0.5rem;
  --space-page: clamp(1rem, 2.5vw, 2rem);
  --font-ui: "Inter", "Helvetica Neue", Arial, sans-serif;
  --motion-fast: 160ms;
}
```

Implement `shell.css` so `.app-shell` uses a fixed-width desktop sidebar, a scrollable main region, and a bottom `.now-viewing` bar. Implement component primitives in `components.css`, leaving page-specific content for later tasks. Implement tablet/mobile layout and reduced-motion overrides in `responsive.css`.

- [ ] **Step 4: Create a semantic home shell with working fallback navigation**

Create `site/index.html` with:

```html
<body data-page-title="Home">
  <div class="app-shell">
    <aside class="sidebar" aria-label="Primary navigation">
      <a class="wordmark" href="index.html" aria-label="Anna Kim home">AK</a>
      <nav>
        <a aria-current="page" href="index.html">Home</a>
        <a href="index.html#projects">Browse projects</a>
        <a href="profile.html">Profile</a>
      </nav>
    </aside>
    <main class="main-view" id="main-content">
      <header class="topbar"><a href="profile.html">Anna Kim</a></header>
      <div class="content">
        <p class="greeting" data-greeting>Good afternoon, listener.</p>
        <h1>Anna's personal listening library</h1>
      </div>
    </main>
  </div>
  <footer class="now-viewing" aria-label="Portfolio shortcuts">
    <span data-now-viewing>Now viewing: Home</span>
    <a href="Anna_Kim_Resume.pdf">Resume</a>
    <a href="mailto:ak2825@cornell.edu">Email</a>
    <a href="https://www.linkedin.com/in/anna-kim-598942327/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
  </footer>
  <script src="assets/js/site.js"></script>
</body>
```

Include a skip link and the four CSS files before the body. Do not use Spotify's logo.

- [ ] **Step 5: Implement the dependency-free enhancement interface**

Create `site/assets/js/site.js` as a browser-safe and Node-testable module:

```js
(function (root) {
  function greetingForHour(hour) {
    if (hour < 12) return 'Good morning, listener.';
    if (hour < 18) return 'Good afternoon, listener.';
    return 'Good evening, listener.';
  }

  function init(documentRef, date = new Date()) {
    const greeting = documentRef.querySelector('[data-greeting]');
    if (greeting) greeting.textContent = greetingForHour(date.getHours());
    const label = documentRef.querySelector('[data-now-viewing]');
    if (label) label.textContent = `Now viewing: ${documentRef.body.dataset.pageTitle || 'Portfolio'}`;
  }

  const api = { greetingForHour, init };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PortfolioSite = api;
  if (root.document) root.document.addEventListener('DOMContentLoaded', () => init(root.document));
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 6: Copy the current resume and run the tests**

Run: `cp '/Users/annakim/Downloads/Anna_Kim_Resume.pdf' 'site/Anna_Kim_Resume.pdf'`

Run: `npm test`

Expected: PASS for the shell, CSS ordering, and greeting tests.

- [ ] **Step 7: Record the foundation checkpoint**

Confirm `git status --short` reports that no repository exists. Record completion in this plan. If the user has initialized Git by execution time, commit with:

```bash
git add package.json tests site
git commit -m "feat: establish portfolio site foundation"
```

---

### Task 2: Build the Spotify-Style Home Library

**Files:**
- Modify: `site/index.html`
- Modify: `site/assets/css/components.css`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: shell classes and `PortfolioSite.init` from Task 1
- Produces: anchors `#projects`, `#experience`, and `#made-for-you`
- Produces: `.media-grid`, `.media-card`, `.experience-grid`, and native `details.experience-disclosure`

- [ ] **Step 1: Add failing tests for home content and resume-backed facts**

Append:

```js
test('home presents projects, experiences, and Made for you', () => {
  const html = read('index.html');
  for (const id of ['projects', 'experience', 'made-for-you']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const text of ['Beats and Beliefs', 'Froggit', 'NBA Player Performance Analytics', 'Allington Lab', 'Vevo', 'Cornell Data Journal', 'Made for you']) {
    assert.ok(html.includes(text), `missing ${text}`);
  }
  assert.doesNotMatch(html, /Made for recruiters/i);
});

test('experiences use no-JavaScript disclosures', () => {
  const html = read('index.html');
  assert.ok((html.match(/<details class="experience-disclosure"/g) || []).length >= 3);
});
```

- [ ] **Step 2: Run the targeted tests and verify failure**

Run: `node --test --test-name-pattern="home presents|experiences" tests/site.test.cjs`

Expected: FAIL because the three sections and disclosures are absent.

- [ ] **Step 3: Implement the identity hero and featured project playlists**

Replace the temporary content with a hero containing the dynamic greeting and copy equivalent to:

```html
<section class="home-hero" aria-labelledby="home-title">
  <p class="greeting" data-greeting>Good afternoon, listener.</p>
  <h1 id="home-title">Welcome to my personal Spotify.</h1>
  <p>I’m Anna, a Cornell statistics and data science student turning real-world questions into clear, useful stories.</p>
</section>
<section id="projects" aria-labelledby="projects-title">
  <div class="section-heading"><h2 id="projects-title">Your projects</h2></div>
  <div class="media-grid"><!-- four complete project links --></div>
</section>
```

Each `.media-card` must be one full anchor containing cover image, project title, short plain-language description, and an action glyph marked `aria-hidden="true"`. Link to the four filenames defined in the file structure.

- [ ] **Step 4: Implement resume-backed Recently played experiences**

Use native `details` elements so disclosure works without JavaScript:

```html
<details class="experience-disclosure">
  <summary>
    <span>Vevo</span>
    <span>Data Analytics &amp; Research Intern · Summer 2026</span>
  </summary>
  <div class="experience-detail">
    <p>Built and maintained KPI-driven Looker dashboards, validated large-scale viewership data with PostgreSQL and AWS, and translated analysis into recommendations for cross-functional teams.</p>
  </div>
</details>
```

Add equivalent resume-faithful summaries for Allington Lab and Cornell Data Journal.

- [ ] **Step 5: Implement Made for you**

Create compact recommendation tiles for Resume, Technical Toolkit, LinkedIn, and GitHub. Use these verified links:

```html
<a href="Anna_Kim_Resume.pdf">Resume</a>
<a href="https://www.linkedin.com/in/anna-kim-598942327/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
<a href="https://github.com/ak2825" target="_blank" rel="noopener noreferrer">GitHub</a>
```

The toolkit tile lists Python, SQL, R, Looker, Power BI, AWS, QGIS, PyTorch, Pandas, and NumPy without turning the section into a keyword wall.

- [ ] **Step 6: Complete card, disclosure, and section styling**

Implement card grids with `repeat(auto-fit, minmax(...))`, square artwork, Spotify-like dark hover elevation, and green action buttons visible on hover and `:focus-visible`. Essential titles and descriptions remain visible at rest.

- [ ] **Step 7: Run the tests and record the home checkpoint**

Run: `npm test`

Expected: all tests PASS.

If Git is available:

```bash
git add site/index.html site/assets/css/components.css tests/site.test.cjs
git commit -m "feat: build home portfolio library"
```

---

### Task 3: Build the Modular Personal Profile

**Files:**
- Create: `site/profile.html`
- Modify: `site/assets/css/components.css`
- Modify: `site/assets/css/responsive.css`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: global shell, navigation, and bottom-bar classes
- Produces: profile sections `#concerts`, `#favorite-songs`, and `#travel`
- Produces: `.placeholder-card[data-placeholder]` and `.placeholder-track[data-placeholder]`

- [ ] **Step 1: Add failing profile tests**

Append:

```js
test('profile provides modular hobby placeholders without dead links', () => {
  const html = read('profile.html');
  for (const id of ['concerts', 'favorite-songs', 'travel']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.ok((html.match(/data-placeholder/g) || []).length >= 6);
  assert.doesNotMatch(html, /href="#"/);
});

test('profile preserves professional context', () => {
  const html = read('profile.html');
  assert.match(html, /Biometry and Statistics/);
  assert.match(html, /Data Science/);
  assert.match(html, /Business/);
});
```

- [ ] **Step 2: Run the profile tests and verify failure**

Run: `node --test --test-name-pattern="profile" tests/site.test.cjs`

Expected: FAIL because `profile.html` does not exist.

- [ ] **Step 3: Create the Spotify-style profile header**

Use the shared shell and mark Profile as current. The page must include:

```html
<header class="profile-hero">
  <div class="profile-photo-fallback" role="img" aria-label="Profile photo placeholder for Anna Kim">AK</div>
  <div>
    <p>Profile</p>
    <h1>Anna Kim</h1>
    <p>Analyst, lifelong listener, and Cornell student studying Biometry and Statistics with minors in Data Science and Business.</p>
  </div>
</header>
```

The fallback is intentional until Anna supplies a preferred profile image.

- [ ] **Step 4: Add honest, inert hobby placeholders**

Create Top concerts as circular or square artist-style cards, Favorite songs as track rows, and Places on repeat as travel-album cards. Placeholder controls must be non-links:

```html
<article class="placeholder-card" data-placeholder>
  <div class="placeholder-art" aria-hidden="true">01</div>
  <h3>Concert to add</h3>
  <p>Artist · venue · year</p>
</article>
```

Favorite-song placeholders use `<div class="placeholder-track" data-placeholder>` instead of anchors. Include concise visible text explaining that Anna is curating these selections.

- [ ] **Step 5: Style the profile responsively**

Match Spotify's profile header proportions on desktop, move the identity stack beneath the photo on small screens, and ensure placeholder content looks intentional but visually secondary. Do not use shimmer or motion that implies loading.

- [ ] **Step 6: Run tests and record the profile checkpoint**

Run: `npm test`

Expected: all tests PASS.

If Git is available:

```bash
git add site/profile.html site/assets/css tests/site.test.cjs
git commit -m "feat: add modular personal profile"
```

---

### Task 4: Build Four Playlist-Style Project Case Studies

**Files:**
- Create: `site/project-beats-and-beliefs.html`
- Create: `site/project-froggit.html`
- Create: `site/project-nba-analytics.html`
- Create: `site/project-allington-lab.html`
- Create: `site/assets/images/covers/beats-and-beliefs.svg`
- Create: `site/assets/images/covers/froggit.svg`
- Create: `site/assets/images/covers/nba-analytics.svg`
- Create: `site/assets/images/covers/allington-lab.svg`
- Modify: `site/assets/css/components.css`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: shared shell, `.track-row`, navigation, and bottom bar
- Produces per page: `#context`, `#findings` or `#result`, and `#learning`
- Produces: `.repository-link[data-placeholder-link]` until a repository URL is supplied

- [ ] **Step 1: Add failing project-page contract tests**

Append:

```js
const projects = [
  'project-beats-and-beliefs.html',
  'project-froggit.html',
  'project-nba-analytics.html',
  'project-allington-lab.html'
];

test('every project has concise case-study tracks and repository action', () => {
  for (const filename of projects) {
    const html = read(filename);
    assert.match(html, /id="context"/);
    assert.match(html, /id="(?:findings|result)"/);
    assert.match(html, /id="learning"/);
    assert.match(html, /class="[^"]*repository-link/);
    assert.doesNotMatch(html, /id="dataset"|id="approach"/);
  }
});

test('all local HTML and asset links resolve', () => {
  const pages = ['index.html', 'profile.html', ...projects];
  for (const page of pages) {
    const html = read(page);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      assert.ok(fs.existsSync(path.resolve(site(), target)), `${page}: missing ${target}`);
    }
  }
});
```

- [ ] **Step 2: Run project tests and verify failure**

Run: `node --test --test-name-pattern="project|links resolve" tests/site.test.cjs`

Expected: FAIL because the four project pages and cover assets do not exist.

- [ ] **Step 3: Create the shared playlist-page structure on all four pages**

Each page uses this exact semantic pattern with project-specific content:

```html
<header class="playlist-hero">
  <img class="playlist-cover" src="assets/images/covers/PROJECT.svg" alt="Original cover artwork for PROJECT">
  <div><p>Portfolio playlist</p><h1>PROJECT</h1><p>SUMMARY</p><p>Anna Kim · TOOLS</p></div>
</header>
<div class="playlist-actions">
  <span class="repository-link" data-placeholder-link aria-disabled="true">GitHub repository link coming soon</span>
</div>
<nav class="case-tracklist" aria-label="Case study sections">
  <a class="track-row" href="#context"><span>1</span><span>Context</span></a>
  <a class="track-row" href="#findings"><span>2</span><span>Findings</span></a>
  <a class="track-row" href="#learning"><span>3</span><span>What I learned</span></a>
</nav>
```

Use `#result` and label "Result" for Froggit and Allington Lab if that reads more accurately. Replace the inert repository element with an external anchor only when Anna supplies that project's URL.

- [ ] **Step 4: Write concise, source-faithful project content**

Use the existing project pages and updated resume as sources. Preserve these factual anchors:

- Beats and Beliefs: Spotify Top 50 data, democracy indices, Python/R/SQL, multivariate regression, and globalization bias in charts.
- Froggit: Python, object-oriented programming, event-driven logic, state management, collision detection, and modular design.
- NBA Analytics: linear and nonlinear regression, PCA via SVD, NumPy, and player-performance variation.
- Allington Lab: active agricultural parcels in Uttarakhand, satellite imagery, QGIS, PyTorch preprocessing, and LSTM/Conv-LSTM land-use classification support.

Do not invent quantitative outcomes absent from the source files. Write each visible section as two to four short paragraphs or a paragraph plus a compact evidence list.

- [ ] **Step 5: Create four original SVG covers**

Each SVG must be code-native, contain a meaningful `<title>`, use the shared green only as an accent, and visually encode its subject:

- Beats and Beliefs: chart bars intersecting a waveform/globe grid.
- Froggit: modular pixel-grid path with a frog-like geometric marker.
- NBA Analytics: court geometry intersecting a regression curve.
- Allington Lab: parcel-grid geometry with layered satellite bands.

Do not include Spotify's logo, third-party album art, team logos, or copyrighted artist imagery.

- [ ] **Step 6: Style playlist headers, actions, track rows, and reading sections**

Use responsive gradient headers derived from each cover, a sticky-safe action row, compact track list, and a readable case-study column. Track rows must expose their section label at rest and receive a visible `:focus-visible` state.

- [ ] **Step 7: Run tests and record the project checkpoint**

Run: `npm test`

Expected: all tests PASS, including all local link resolution.

If Git is available:

```bash
git add site/project-*.html site/assets/images/covers site/assets/css/components.css tests/site.test.cjs
git commit -m "feat: add playlist project case studies"
```

---

### Task 5: Complete Progressive Enhancements and Accessibility Contracts

**Files:**
- Modify: `site/assets/js/site.js`
- Modify: `site/assets/css/responsive.css`
- Modify: all six `site/*.html` pages
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: `PortfolioSite.init(documentRef, date)`
- Produces: `PortfolioSite.setCurrentPageLabel(documentRef): void`
- Produces: native `details` disclosure behavior requiring no JavaScript
- Produces: active navigation through static `aria-current="page"`

- [ ] **Step 1: Add failing cross-page accessibility and enhancement tests**

Append:

```js
test('every page has skip navigation, one main, and a descriptive title', () => {
  for (const filename of ['index.html', 'profile.html', ...projects]) {
    const html = read(filename);
    assert.match(html, /class="skip-link"/);
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    assert.match(html, /<title>[^<]+Anna Kim[^<]*<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]+"/);
  }
});

test('external anchors are safe', () => {
  for (const filename of ['index.html', 'profile.html', ...projects]) {
    const html = read(filename);
    for (const match of html.matchAll(/<a[^>]+href="https?:[^"]+"[^>]*>/g)) {
      assert.match(match[0], /target="_blank"/);
      assert.match(match[0], /rel="noopener noreferrer"/);
    }
  }
});

test('no page contains dead hash links or launch placeholders disguised as links', () => {
  for (const filename of ['index.html', 'profile.html', ...projects]) {
    const html = read(filename);
    assert.doesNotMatch(html, /href="#"/);
    assert.doesNotMatch(html, /<a[^>]+data-placeholder/);
  }
});
```

- [ ] **Step 2: Run accessibility tests and verify failures reveal missing contracts**

Run: `node --test --test-name-pattern="skip navigation|external anchors|dead hash" tests/site.test.cjs`

Expected: FAIL for any page missing a title, description, skip link, safe external attributes, or correct placeholder semantics.

- [ ] **Step 3: Normalize shell markup across all pages**

Ensure every page has the same skip link, shared CSS order, sidebar destinations, profile control, contextual bottom bar, and script. Set `aria-current="page"` statically to the correct destination and set `data-page-title` to the visible page or project name.

- [ ] **Step 4: Finish responsive and reduced-motion behavior**

In `responsive.css`, implement:

```css
@media (max-width: 48rem) {
  .app-shell { display: block; padding-bottom: var(--player-height); }
  .sidebar { position: static; width: auto; }
  .sidebar nav { display: flex; overflow-x: auto; }
  .main-view { margin-left: 0; }
  .playlist-hero, .profile-hero { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Also ensure 320px layouts have no horizontal page overflow; allow only the compact mobile navigation row to scroll internally.

- [ ] **Step 5: Keep JavaScript narrowly progressive**

Factor page-label behavior into an exported helper and call it from `init`:

```js
function setCurrentPageLabel(documentRef) {
  const label = documentRef.querySelector('[data-now-viewing]');
  if (!label) return;
  label.textContent = `Now viewing: ${documentRef.body.dataset.pageTitle || 'Portfolio'}`;
}
```

Do not add custom disclosure logic, client-side routing, fake audio controls, or JavaScript-rendered essential content.

- [ ] **Step 6: Run the complete automated suite**

Run: `npm test`

Expected: all tests PASS with no warnings or unhandled rejections.

- [ ] **Step 7: Record the accessibility checkpoint**

If Git is available:

```bash
git add site tests/site.test.cjs
git commit -m "feat: complete responsive accessible interactions"
```

---

### Task 6: Perform Browser and No-JavaScript Verification

**Files:**
- Modify only if verification finds defects: `site/*.html`, `site/assets/css/*.css`, `site/assets/js/site.js`
- Create: `docs/qa/spotify-portfolio-verification.md`

**Interfaces:**
- Consumes: complete static site from Tasks 1-5
- Produces: a repeatable verification record with exact viewport and behavior results

- [ ] **Step 1: Run automated tests from a clean command**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 2: Start the local site server**

Run from the workspace root:

```bash
python3 -m http.server 8000 --directory site
```

Expected: server listens on `http://localhost:8000/` and `index.html` returns HTTP 200.

- [ ] **Step 3: Verify all pages at representative widths**

Inspect and capture screenshots at:

- Desktop: 1440 × 900
- Tablet: 768 × 1024
- Phone: 390 × 844
- Narrow phone: 320 × 700

For each width, open Home, Profile, and one representative project page. Confirm no clipping, overlaps, unreadable gradients, horizontal page scrolling, or content hidden beneath the bottom bar.

- [ ] **Step 4: Verify navigation and interactions**

Manually verify:

1. Home, Browse Projects, Profile, all four project cards, and browser back/forward navigation.
2. All three experience disclosures by pointer and keyboard.
3. Each project track row reaches the correct section.
4. Resume opens `Anna_Kim_Resume.pdf`.
5. Email, LinkedIn, and GitHub destinations are correct.
6. Repository placeholders are inert text, not dead links.
7. The greeting matches the current local time period.
8. The bottom bar shows the current page name and does not imply playback.

- [ ] **Step 5: Verify the non-JavaScript fallback**

Disable JavaScript in the browser and reload Home, Profile, and a project page. Confirm navigation, static greeting fallback, project content, track anchors, experience `details`, resume, and external professional links remain usable.

- [ ] **Step 6: Verify keyboard, contrast, and reduced motion**

Tab through every interactive control, confirm visible focus and logical order, emulate `prefers-reduced-motion: reduce`, and inspect text contrast on base surfaces and gradient headers. Fix any defect and rerun `npm test` after each change.

- [ ] **Step 7: Write the verification record**

Create `docs/qa/spotify-portfolio-verification.md` with this completed structure:

```markdown
# Spotify Portfolio Verification

- Automated tests: PASS (`npm test`)
- Desktop 1440 × 900: PASS
- Tablet 768 × 1024: PASS
- Phone 390 × 844: PASS
- Narrow phone 320 × 700: PASS
- Keyboard navigation and visible focus: PASS
- Reduced motion: PASS
- JavaScript-disabled fallback: PASS
- Resume and supplied external links: PASS
- Repository links: PLACEHOLDER TEXT pending Anna's four URLs
- Hobby content: DEVELOPMENT PLACEHOLDERS pending Anna's selections and images
```

Do not mark a row PASS until it has actually been checked. Repository and hobby rows remain explicit development-state notes until Anna supplies final content.

- [ ] **Step 8: Record the final implementation checkpoint**

If Git is available:

```bash
git add site tests docs/qa
git commit -m "test: verify spotify-inspired portfolio"
```

Stop the local server after verification. Do not modify or delete the original source website folder.
