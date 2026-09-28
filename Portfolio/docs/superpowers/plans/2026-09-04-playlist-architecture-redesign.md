# Playlist Architecture Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize Anna Kim’s static portfolio so Projects, Experience, and Beyond the Data are playlists containing individual tracks, while keeping Profile professional and preserving the existing detailed project pages.

**Architecture:** Add three standalone playlist pages to the existing dependency-free HTML/CSS/JavaScript site. Use semantic `<details>` track disclosures for no-JavaScript access, then enhance them with shared JavaScript so only one track remains open and the persistent player follows the selected track. Keep the four existing project pages as full case studies linked from concise project-track previews.

**Tech Stack:** Static HTML5, shared CSS, vanilla JavaScript, SVG assets, Node.js built-in test runner

**Spec:** `docs/superpowers/specs/2026-09-04-playlist-architecture-redesign.md`

## Global Constraints

- The primary destinations are Home, Profile, Projects, Experience, and Beyond the Data.
- The homepage headline is exactly “Welcome to my listening activity.”
- The homepage introduction is exactly “I’m Anna Kim, a Cornell student studying Biometry and Statistics with minors in Data Science and Business. This library brings together my projects, experiences, and interests beyond the data.”
- Profile contains professional introduction, education, analytical interests, motivation, and contact actions; it contains no hobby collections.
- Existing project case-study pages and their GitHub actions remain available.
- Personal entries and playlist covers may use clearly labeled neutral placeholders until Anna supplies final content and artwork.
- The persistent player is a navigation metaphor and does not play copyrighted audio.
- The visitor song queue, moderation, storage, and final cover-art direction are out of scope.
- The site must remain dependency-free and usable without JavaScript.
- Mobile layouts must remain usable at 390px and 320px widths.
- Keyboard focus must remain visible and motion must respect `prefers-reduced-motion`.

---

### Task 1: Create the top-level playlist pages and global navigation

**Files:**
- Create: `site/projects.html`
- Create: `site/experience.html`
- Create: `site/beyond-data.html`
- Modify: `site/index.html`
- Modify: `site/profile.html`
- Modify: `site/project-beats-and-beliefs.html`
- Modify: `site/project-froggit.html`
- Modify: `site/project-nba-analytics.html`
- Modify: `site/project-allington-lab.html`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: the existing `.app-shell`, `.sidebar`, `.main-view`, `.topbar`, `.content`, and `.now-viewing` shell classes.
- Produces: three local routes—`projects.html`, `experience.html`, and `beyond-data.html`—and one identical five-link primary navigation on every HTML page.

- [ ] **Step 1: Write the failing route and navigation tests**

Replace the existing `pages` list and global-navigation expectation with:

```js
const playlists = ['projects.html', 'experience.html', 'beyond-data.html'];
const pages = ['index.html', 'profile.html', ...playlists, ...projects];

test('top-level playlist pages exist with one descriptive heading', () => {
  const expected = {
    'projects.html': 'Projects',
    'experience.html': 'Experience',
    'beyond-data.html': 'Beyond the Data'
  };

  for (const [filename, heading] of Object.entries(expected)) {
    assert.ok(fs.existsSync(site(filename)), `${filename}: route should exist`);
    const html = read(filename);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${filename}: expected one h1`);
    assert.match(html, new RegExp(`<h1[^>]*>${heading}<\\/h1>`));
  }
});

test('every page exposes the five primary destinations', () => {
  const expectedLinks = [
    ['index.html', 'Home'],
    ['projects.html', 'Projects'],
    ['experience.html', 'Experience'],
    ['beyond-data.html', 'Beyond the Data'],
    ['profile.html', 'Profile']
  ];

  for (const filename of pages) {
    const html = read(filename);
    const nav = html.match(/<nav\b[^>]*aria-label="Primary navigation"[^>]*>[\s\S]*?<\/nav>/)?.[0];
    assert.ok(nav, `${filename}: missing primary navigation`);
    assert.equal((nav.match(/<a\b/g) || []).length, 5, `${filename}: primary navigation count`);
    for (const [href, label] of expectedLinks) {
      assert.match(nav, new RegExp(`href="${href}"[^>]*>${label}<\\/a>`), `${filename}: missing ${label}`);
    }
  }
});
```

- [ ] **Step 2: Run the tests and verify the intended failure**

Run: `npm test`

Expected: FAIL because the three playlist pages do not exist and existing navigation still links to the old project anchor and external destinations.

- [ ] **Step 3: Create three complete semantic page shells**

Create each page with the same `<head>`, skip link, sidebar, topbar, main landmark, footer player, and script include used by `profile.html`. Use these exact main headings and body page titles:

```html
<body class="playlist-page" data-page-title="Projects">
  <!-- shared shell -->
  <main class="main-view" id="main-content" tabindex="-1">
    <header class="topbar"><a href="profile.html">Anna Kim</a></header>
    <div class="content playlist-page-content">
      <header class="collection-hero">
        <div class="collection-cover collection-cover--projects" aria-hidden="true">PR</div>
        <div><p>Playlist</p><h1>Projects</h1><p>Selected work in analysis, research, and software.</p></div>
      </header>
    </div>
  </main>
  <!-- shared player -->
</body>
```

Use corresponding values `Experience`/`EX`/“Roles, teams, and contributions.” and `Beyond the Data`/`BD`/“The music, meals, and places that keep Anna curious beyond the spreadsheet.” Do not add empty track containers in this task.

- [ ] **Step 4: Replace the primary navigation on every page**

Use this exact navigation, adding `aria-current="page"` only for the current top-level destination:

```html
<nav aria-label="Primary navigation">
  <a href="index.html">Home</a>
  <a href="projects.html">Projects</a>
  <a href="experience.html">Experience</a>
  <a href="beyond-data.html">Beyond the Data</a>
  <a href="profile.html">Profile</a>
</nav>
```

Project detail pages must mark Projects as current because they belong to that playlist.

- [ ] **Step 5: Run the tests and verify they pass**

Run: `npm test`

Expected: PASS with all local routes resolving and every page exposing the same five destinations.

- [ ] **Step 6: Commit the navigation foundation**

```bash
git add site/*.html tests/site.test.cjs
git commit -m "feat: add portfolio playlist routes"
```

---

### Task 2: Rebuild the homepage as Anna’s library

**Files:**
- Create: `site/assets/images/covers/projects.svg`
- Create: `site/assets/images/covers/experience.svg`
- Create: `site/assets/images/covers/beyond-data.svg`
- Modify: `site/index.html`
- Modify: `site/assets/css/components.css`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: the three playlist routes from Task 1 and existing `.media-card` primitives.
- Produces: `#library` with three `.library-card` links and `#recently-played` with cross-playlist shortcuts.

- [ ] **Step 1: Write the failing homepage hierarchy test**

```js
test('home presents the approved library hierarchy', () => {
  const html = read('index.html');
  assert.match(html, /<h1[^>]*>Welcome to my listening activity\.<\/h1>/);
  assert.match(html, /I’m Anna Kim, a Cornell student studying Biometry and Statistics with minors in Data Science and Business\. This library brings together my projects, experiences, and interests beyond the data\./);
  assert.match(html, /id="library"/);
  assert.match(html, /id="recently-played"/);
  for (const [href, title] of [
    ['projects.html', 'Projects'],
    ['experience.html', 'Experience'],
    ['beyond-data.html', 'Beyond the Data']
  ]) {
    assert.match(html, new RegExp(`<a[^>]+class="[^"]*library-card[^"]*"[^>]+href="${href}"[\\s\\S]*?<h3>${title}<\\/h3>`));
  }
  assert.doesNotMatch(html, /id="made-for-you"|id="experience"|class="experience-grid"/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test`

Expected: FAIL because the homepage still renders individual project cards, inline experience disclosures, and Made for You.

- [ ] **Step 3: Create neutral placeholder playlist covers**

Create three accessible 320×320 SVGs with unique `<title>` elements. Use one background color per cover from the current neutral/taupe palette and a single cream line symbol: stepped chart for Projects, briefcase/document for Experience, and waveform/table/postcard motif for Beyond the Data. Do not reuse the four project-specific SVGs on the homepage.

- [ ] **Step 4: Replace the homepage sections**

Keep the greeting and exact approved headline. Replace the hero paragraph with the exact approved introduction. Replace the current Projects, Recently Played experience grid, and Made for You sections with:

```html
<section id="library" aria-labelledby="library-title">
  <div class="section-heading"><div><p class="eyebrow">Anna’s library</p><h2 id="library-title">Your library</h2></div></div>
  <div class="library-grid">
    <!-- three .library-card links with image, h3, and one-line metadata -->
  </div>
</section>

<section id="recently-played" aria-labelledby="recently-played-title">
  <div class="section-heading"><div><p class="eyebrow">Quick picks</p><h2 id="recently-played-title">Recently played</h2></div></div>
  <div class="recent-track-list">
    <!-- Beats and Beliefs → project detail; Vevo → experience track; At my table → Beyond the Data track; NBA Analytics → project detail -->
  </div>
</section>
```

Use `experience.html#vevo`, `beyond-data.html#at-my-table`, and the existing project detail routes for the shortcut links.

- [ ] **Step 5: Add library and recent-track styling**

Add focused `.library-grid`, `.library-card`, `.library-cover`, `.recent-track-list`, and `.recent-track` rules to `components.css`. Preserve the dark interface, existing spacing tokens, hover elevation, and visible `:focus-visible` states. Do not delete `.media-card` styles yet because project detail and recommendation markup may still reference them during later tasks.

- [ ] **Step 6: Run the test suite**

Run: `npm test`

Expected: PASS, including local-link resolution for all three new cover assets and playlist routes.

- [ ] **Step 7: Commit the library homepage**

```bash
git add site/index.html site/assets/css/components.css site/assets/images/covers/projects.svg site/assets/images/covers/experience.svg site/assets/images/covers/beyond-data.svg tests/site.test.cjs
git commit -m "feat: present portfolio as a music library"
```

---

### Task 3: Build the Projects playlist with concise track previews

**Files:**
- Modify: `site/projects.html`
- Modify: `site/assets/css/components.css`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: the four existing project detail routes and their established titles, descriptions, findings/results, and tool names.
- Produces: four `<details class="playlist-track" data-track-title="…" data-track-parent="Projects">` disclosures, each with a `.full-track-link` to its detail page.

- [ ] **Step 1: Write the failing Projects playlist test**

```js
test('Projects playlist exposes one preview track per case study', () => {
  const html = read('projects.html');
  const expected = [
    ['Beats and Beliefs', 'project-beats-and-beliefs.html'],
    ['Froggit', 'project-froggit.html'],
    ['NBA Player Performance Analytics', 'project-nba-analytics.html'],
    ['Allington Lab', 'project-allington-lab.html']
  ];
  assert.equal((html.match(/<details\b[^>]*class="[^"]*playlist-track/g) || []).length, 4);
  for (const [title, href] of expected) {
    assert.match(html, new RegExp(`data-track-title="${title}"[\\s\\S]*?href="${href}"[^>]*>View full project<\\/a>`));
  }
  for (const label of ['Context', 'Key result', 'Tools']) assert.ok(html.includes(label));
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test`

Expected: FAIL because `projects.html` has no track disclosures.

- [ ] **Step 3: Add the four project tracks**

Use this structure for each project, filling copy only from the corresponding existing case-study page:

```html
<details class="playlist-track" data-track-title="Beats and Beliefs" data-track-parent="Projects">
  <summary>
    <span class="track-index">1</span>
    <span><strong>Beats and Beliefs</strong><small>Python · R · SQL</small></span>
    <span class="track-duration">4 min</span>
  </summary>
  <div class="track-preview">
    <div><h3>Context</h3><p><!-- concise existing context --></p></div>
    <div><h3>Key result</h3><p><!-- concise existing finding --></p></div>
    <div><h3>Tools</h3><p>Python · R · SQL</p></div>
    <a class="full-track-link" href="project-beats-and-beliefs.html">View full project</a>
  </div>
</details>
```

Use existing copy rather than inventing metrics. Reading times are interface labels only and may use `3 min` or `4 min` consistently with content length.

- [ ] **Step 4: Add shared playlist-track styling**

Style `.playlist-track`, its `summary`, `.track-index`, `.track-duration`, `.track-preview`, and `.full-track-link`. Hide the native disclosure marker, retain a visible expanded state, and ensure the summary remains keyboard operable as native `<summary>`.

- [ ] **Step 5: Run the test suite**

Run: `npm test`

Expected: PASS, including the no-JavaScript disclosure checks and all detail-page links.

- [ ] **Step 6: Commit the Projects playlist**

```bash
git add site/projects.html site/assets/css/components.css tests/site.test.cjs
git commit -m "feat: add project playlist previews"
```

---

### Task 4: Build the Experience playlist

**Files:**
- Modify: `site/experience.html`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: shared `.playlist-track` and `.track-preview` styles from Task 3 and existing experience copy from the old homepage.
- Produces: stable anchors `#vevo`, `#allington-lab`, and `#cornell-data-journal` for direct links from Recently Played.

- [ ] **Step 1: Write the failing experience-track test**

```js
test('Experience playlist contains the three resume roles as tracks', () => {
  const html = read('experience.html');
  const expected = {
    vevo: ['Vevo', 'Data Analytics &amp; Research Intern', 'Summer 2026'],
    'allington-lab': ['Allington Lab', 'Undergraduate Research Assistant', 'Jan. 2026–Present'],
    'cornell-data-journal': ['Cornell Data Journal', 'Data Analyst', 'Sept. 2025–Present']
  };
  assert.equal((html.match(/<details\b[^>]*class="[^"]*playlist-track/g) || []).length, 3);
  for (const [id, values] of Object.entries(expected)) {
    assert.match(html, new RegExp(`id="${id}"`));
    for (const value of values) assert.ok(html.includes(value), `${id}: missing ${value}`);
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test`

Expected: FAIL because the Experience playlist is still only a page shell.

- [ ] **Step 3: Move the three role disclosures into Experience**

Create one `.playlist-track` disclosure per role. Each summary must show employer, title, and real date range. Each preview must reuse the existing role description, split into “Contribution” and “Tools” only when the resume/site already provides those tools. Do not invent performance percentages or business outcomes.

- [ ] **Step 4: Run the test suite**

Run: `npm test`

Expected: PASS and `index.html` links to `experience.html#vevo` resolve.

- [ ] **Step 5: Commit the Experience playlist**

```bash
git add site/experience.html tests/site.test.cjs
git commit -m "feat: move resume experience into a playlist"
```

---

### Task 5: Separate the professional Profile from Beyond the Data

**Files:**
- Modify: `site/profile.html`
- Modify: `site/beyond-data.html`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: Anna’s existing portrait, academic description, contact URLs, and shared `.playlist-track` disclosures.
- Produces: a professional-only Profile and five stable Beyond the Data anchors.

- [ ] **Step 1: Replace the old profile hobby tests with failing separation tests**

```js
test('Profile is professional and contains no hobby collections', () => {
  const html = read('profile.html');
  for (const text of ['Biometry and Statistics', 'Data Science', 'Business', 'Resume', 'LinkedIn', 'GitHub']) {
    assert.ok(html.includes(text), `profile missing ${text}`);
  }
  for (const id of ['concerts', 'favorite-songs', 'travel', 'at-my-table']) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`));
  }
});

test('Beyond the Data contains five personal tracks', () => {
  const html = read('beyond-data.html');
  const expected = [
    ['currently-into', 'Currently into'],
    ['my-soundtrack', 'My soundtrack'],
    ['concerts-on-repeat', 'Concerts on repeat'],
    ['at-my-table', 'At my table'],
    ['places-on-repeat', 'Places on repeat']
  ];
  assert.equal((html.match(/<details\b[^>]*class="[^"]*playlist-track/g) || []).length, 5);
  for (const [id, title] of expected) {
    assert.match(html, new RegExp(`id="${id}"[\\s\\S]*?data-track-title="${title}"`));
  }
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npm test`

Expected: FAIL because Profile still contains concerts, favorite songs, and travel, while Beyond the Data has no tracks.

- [ ] **Step 3: Replace Profile’s hobby sections with professional content**

Keep the existing portrait hero. Add three concise sections:

```html
<section id="background" aria-labelledby="background-title">
  <p class="eyebrow">Background</p><h2 id="background-title">Statistics with a wider lens</h2>
  <p>I study Biometry and Statistics at Cornell, with minors in Data Science and Business.</p>
</section>
<section id="interests" aria-labelledby="interests-title">
  <p class="eyebrow">Analytical interests</p><h2 id="interests-title">Questions worth translating</h2>
  <p>I’m interested in connecting rigorous analysis to real-world questions and communicating findings clearly to technical and non-technical audiences.</p>
</section>
<section id="contact" aria-labelledby="contact-title">
  <p class="eyebrow">Keep listening</p><h2 id="contact-title">Continue the conversation</h2>
  <!-- Resume, LinkedIn, GitHub, and mailto:ak2825@cornell.edu links -->
</section>
```

Do not introduce job-seeking claims or personal facts not already present in the site or resume.

- [ ] **Step 4: Add five Beyond the Data disclosures**

Each track uses `data-track-parent="Beyond the Data"` and contains explicit content placeholders rather than fake favorites. Use:

- “Anna is curating a current song, restaurant, and destination.”
- “Favorite songs and the stories behind them are coming soon.”
- “Anna is choosing a few live-music memories to share.”
- Three restaurant entry shells labeled “Restaurant to add · City · Cuisine,” with “Favorite order” and “Why it stays on repeat.”
- Three travel entry shells labeled “Place to add · Memory · Year.”

- [ ] **Step 5: Run the test suite**

Run: `npm test`

Expected: PASS with professional content isolated to Profile and all five personal tracks available in Beyond the Data.

- [ ] **Step 6: Commit the content separation**

```bash
git add site/profile.html site/beyond-data.html tests/site.test.cjs
git commit -m "feat: separate professional and personal playlists"
```

---

### Task 6: Enhance track selection and the page-aware player

**Files:**
- Modify: `site/assets/js/site.js`
- Modify: `site/projects.html`
- Modify: `site/experience.html`
- Modify: `site/beyond-data.html`
- Modify: `tests/site.test.cjs`

**Interfaces:**
- Consumes: `.playlist-track[data-track-title][data-track-parent]` disclosures from Tasks 3–5 and existing player elements `[data-player-track]`, `[data-player-artist]`, and `[data-player-cover]`.
- Produces: `closeSiblingTracks(activeTrack, tracks)` and `trackLabel(track)` as exported pure functions, plus browser-only disclosure listeners.

- [ ] **Step 1: Write failing pure-function tests**

```js
test('trackLabel maps a selected disclosure to player copy', () => {
  const { trackLabel } = require('../site/assets/js/site.js');
  assert.deepEqual(
    trackLabel({ dataset: { trackTitle: 'At my table', trackParent: 'Beyond the Data' } }),
    { title: 'At my table', artist: 'Beyond the Data · Anna Kim' }
  );
});

test('closeSiblingTracks leaves only the selected track open', () => {
  const { closeSiblingTracks } = require('../site/assets/js/site.js');
  const tracks = [{ open: true }, { open: true }, { open: true }];
  closeSiblingTracks(tracks[1], tracks);
  assert.deepEqual(tracks.map((track) => track.open), [false, true, false]);
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npm test`

Expected: FAIL because `trackLabel` and `closeSiblingTracks` are not exported.

- [ ] **Step 3: Extend the page track model**

Add the top-level playlist routes to `PAGE_TRACKS`:

```js
{ page: 'projects.html', title: 'Projects', artist: 'Anna Kim', cover: 'PR' },
{ page: 'experience.html', title: 'Experience', artist: 'Anna Kim', cover: 'EX' },
{ page: 'beyond-data.html', title: 'Beyond the Data', artist: 'Anna Kim', cover: 'BD' }
```

Keep existing detail-page entries so the player still represents an opened project case study.

- [ ] **Step 4: Implement the two pure helpers**

```js
function trackLabel(track) {
  return {
    title: track.dataset.trackTitle,
    artist: `${track.dataset.trackParent} · Anna Kim`
  };
}

function closeSiblingTracks(activeTrack, tracks) {
  tracks.forEach((track) => {
    if (track !== activeTrack) track.open = false;
  });
}
```

Export both beside the existing CommonJS exports.

- [ ] **Step 5: Enhance disclosure behavior in the browser initializer**

```js
const playlistTracks = Array.from(document.querySelectorAll('.playlist-track'));
playlistTracks.forEach((track) => {
  track.addEventListener('toggle', () => {
    if (!track.open) return;
    closeSiblingTracks(track, playlistTracks);
    const label = trackLabel(track);
    document.querySelector('[data-player-track]').textContent = label.title;
    document.querySelector('[data-player-artist]').textContent = label.artist;
    document.querySelector('[data-now-viewing]').textContent = `Now viewing: ${label.title}`;
  });
});
```

Do not remove native `<details>` behavior. Without JavaScript, all tracks remain independently expandable.

- [ ] **Step 6: Add player defaults to each playlist page**

Set the initial player title and cover to Projects/PR, Experience/EX, and Beyond the Data/BD. The artist remains Anna Kim until a child track opens.

- [ ] **Step 7: Run the test suite**

Run: `npm test`

Expected: PASS with the existing player navigation tests and new track-selection tests.

- [ ] **Step 8: Commit the interaction**

```bash
git add site/assets/js/site.js site/projects.html site/experience.html site/beyond-data.html tests/site.test.cjs
git commit -m "feat: sync playlist tracks with portfolio player"
```

---

### Task 7: Complete responsive styling and accessibility verification

**Files:**
- Modify: `site/assets/css/responsive.css`
- Modify: `site/assets/css/components.css`
- Modify: `tests/site.test.cjs`
- Modify: `docs/qa/spotify-portfolio-verification.md`

**Interfaces:**
- Consumes: all new library, playlist, track-preview, profile, and player markup.
- Produces: responsive layouts for desktop, 390px phone, and 320px narrow phone; updated verification evidence.

- [ ] **Step 1: Write the failing responsive-contract test**

```js
test('playlist architecture has mobile and reduced-motion protections', () => {
  const responsive = read('assets', 'css', 'responsive.css');
  const components = read('assets', 'css', 'components.css');
  assert.match(responsive, /@media\s*\(max-width:\s*48rem\)/);
  assert.match(responsive, /\.library-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(responsive, /\.track-preview\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(responsive, /\.track-duration[^}]*display:\s*none/s);
  assert.match(responsive, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(components, /\.playlist-track\s*>\s*summary:focus-visible/);
});
```

- [ ] **Step 2: Run the tests and verify the intended failure**

Run: `npm test`

Expected: FAIL until new playlist classes receive explicit mobile and focus treatment.

- [ ] **Step 3: Add mobile rules**

Within the existing `max-width: 48rem` block:

- Convert `.library-grid` to one column.
- Convert each `.library-card` to a compact row with a 5rem square cover.
- Convert `.track-preview` and restaurant/travel placeholder grids to one column.
- Hide `.track-duration` and nonessential metadata at 320px while retaining title and summary state.
- Ensure `.collection-hero` collapses to one column and its cover stays at or below 12rem.
- Preserve enough bottom padding that expanded content is not covered by `.now-viewing`.

- [ ] **Step 4: Add visible keyboard focus**

Add `:focus-visible` rules for `.library-card`, `.recent-track`, `.playlist-track > summary`, `.full-track-link`, and profile contact links using the existing focus token or a 2px accent outline with at least 2px offset.

- [ ] **Step 5: Run automated verification**

Run: `npm test`

Expected: PASS with zero failing tests.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 6: Perform browser verification**

Verify Home, Profile, Projects, Experience, Beyond the Data, and one project detail page at:

- 1440×900 desktop.
- 390×844 phone.
- 320×700 narrow phone.

For each viewport confirm: no document-level horizontal overflow; the five navigation destinations remain reachable; playlist cards and track disclosures fit; only one enhanced track remains open; the player updates after selecting a track; the final content remains visible above the persistent player; and browser back/forward behavior remains intact for page navigation.

Verify keyboard access by tabbing to each disclosure summary and activating it with Enter or Space. Verify reduced motion through the browser’s reduced-motion setting when available; otherwise record static CSS verification as limited rather than claiming browser evidence.

- [ ] **Step 7: Update the QA record**

Append a dated “Playlist architecture redesign” section to `docs/qa/spotify-portfolio-verification.md` with automated test count, checked routes, viewports, interactions, accessibility checks, defects fixed, and any browser limitations.

- [ ] **Step 8: Commit the responsive and QA pass**

```bash
git add site/assets/css/components.css site/assets/css/responsive.css tests/site.test.cjs docs/qa/spotify-portfolio-verification.md
git commit -m "test: verify playlist portfolio across viewports"
```

---

## Completion check

Run:

```bash
npm test
git diff --check
git status --short
```

Expected: all tests pass, no whitespace errors, and only intentionally uncommitted user-owned files remain. Compare the final implementation line by line with `docs/superpowers/specs/2026-09-04-playlist-architecture-redesign.md`; the visitor queue and final cover-art decisions must remain unimplemented.
