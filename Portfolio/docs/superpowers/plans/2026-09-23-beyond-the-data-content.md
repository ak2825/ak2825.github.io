# Beyond the Data Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Beyond the Data placeholders with Anna's approved music links, concert ranking, travel gallery, and restaurant recommendations while preserving the compact Spotify-inspired album interaction.

**Architecture:** Keep the existing native `details` and `summary` album rows and replace only their expanded content. Add focused CSS classes for external actions, ranking metadata, and a five-slot travel gallery; do not add JavaScript or dependencies.

**Tech Stack:** Static HTML5, CSS Grid/Flexbox, Node.js built-in test runner, existing portfolio shell

**Spec:** `docs/superpowers/specs/2026-09-23-beyond-the-data-content-design.md`

## Global Constraints

- Preserve the album order: Music, made by me; Live Favorites; Passport Pages; At My Table.
- Preserve the existing disclosure and one-album-open behavior.
- Use Anna's approved casual wording without inventing facts.
- Open Instagram and YouTube in new tabs with `rel="noopener noreferrer"`.
- Use `assets/images/beyond-data/travel.png` as the real travel image and render exactly four intentional future-photo slots.
- Keep the music-background introduction visibly editable because Anna will write it later.
- Support narrow mobile screens without new dependencies or JavaScript.

## Review Focus

- Exact URLs and safe external-link attributes.
- Anna's phrases, including “voice is perfection live,” “muscle memory,” and “Shoutout.”
- Intentional treatment of unfinished music copy and future travel slots.
- Featured travel image first, followed by a one-column mobile sequence.
- Existing keyboard-operable album summaries remain image-free.

---

### Task 1: Populate the four expanded albums

**Files:**
- Modify: `site/beyond-data.html:44-86`
- Test: `tests/site.test.cjs:119-139`

**Interfaces:**
- Consumes: existing `.personal-album-content`, `.ranked-list`, and `details` album markup
- Produces: `.album-link`, `.ranked-item`, `.ranked-meta`, `.travel-gallery`, `.travel-photo-featured`, and `.travel-photo-placeholder` for Task 2

- [ ] **Step 1: Write failing content tests**

Add tests with these exact assertions:

```js
test('Beyond the Data links safely to Anna music work', () => {
  const html = read('beyond-data.html');
  assert.match(html, /href="https:\/\/www.instagram.com\/theoannakim\/"[^>]+target="_blank"[^>]+rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/youtu.be\/2ogZGOtEnNs\?si=xf0BOJmPk3NRJ9VX"[^>]+target="_blank"[^>]+rel="noopener noreferrer"/);
  assert.match(html, />Instagram Covers<\/a>/);
  assert.match(html, />YouTube Project<\/a>/);
});

test('Live Favorites contains three approved concert memories', () => {
  const html = read('beyond-data.html');
  for (const text of ['Olivia Dean', 'Madison Square Garden', 'grentperez', 'Terminal 5, Manhattan', 'Head in the Clouds', 'Forest Hills Stadium', 'voice is perfection live', 'muscle memory', 'started pouring']) assert.ok(html.includes(text));
  assert.equal((html.match(/class="ranked-item"/g) || []).length, 6);
});

test('Passport Pages has one featured photo and four future slots', () => {
  const html = read('beyond-data.html');
  assert.match(html, /class="travel-photo-featured"[^>]+src="assets\/images\/beyond-data\/travel.png"/);
  assert.equal((html.match(/class="travel-photo-placeholder"/g) || []).length, 4);
});

test('At My Table contains three approved recommendations', () => {
  const html = read('beyond-data.html');
  for (const text of ['Okdongsik', 'Perfect meal for a cold NYC day', 'Daesun Korean Noodle', 'best Korean seafood pancakes', 'Tapabento S. Bento', 'Shoutout the cataplana and razor clams']) assert.ok(html.includes(text));
});
```

- [ ] **Step 2: Run the content tests and verify RED**

```bash
node --test --test-name-pattern="Beyond the Data links safely|Live Favorites contains|Passport Pages has|At My Table contains" tests/site.test.cjs
```

Expected: FAIL because the final links, copy, ranking classes, and gallery slots are absent.

- [ ] **Step 3: Implement the Music album**

Replace inactive link text with:

```html
<p class="editable-note">I’m still writing this part—but this is where I’ll share more about my background with music, the songs I love to sing, and the projects I want to keep making.</p>
<div class="album-link-row">
  <a class="album-link" href="https://www.instagram.com/theoannakim/" target="_blank" rel="noopener noreferrer">Instagram Covers</a>
  <a class="album-link" href="https://youtu.be/2ogZGOtEnNs?si=xf0BOJmPk3NRJ9VX" target="_blank" rel="noopener noreferrer">YouTube Project</a>
</div>
```

- [ ] **Step 4: Implement Live Favorites**

Create three `.ranked-item` articles with `.ranked-meta` date and venue lines. Use the exact approved copy from the spec for Olivia Dean, grentperez, and Head in the Clouds.

- [ ] **Step 5: Implement Passport Pages**

```html
<div class="travel-gallery" aria-label="Anna’s travel photographs">
  <img class="travel-photo-featured" src="assets/images/beyond-data/travel.png" alt="The Douro River and Porto waterfront at sunset">
  <span class="travel-photo-placeholder" aria-hidden="true">Next stop</span>
  <span class="travel-photo-placeholder" aria-hidden="true">Next stop</span>
  <span class="travel-photo-placeholder" aria-hidden="true">Next stop</span>
  <span class="travel-photo-placeholder" aria-hidden="true">Next stop</span>
</div>
```

Keep the approved study-abroad closing line after the gallery.

- [ ] **Step 6: Implement At My Table**

Create three `.ranked-item` articles for Okdongsik, Daesun Korean Noodle, and Tapabento S. Bento. Copy the exact location and description strings from the spec.

- [ ] **Step 7: Run focused and full tests**

```bash
node --test --test-name-pattern="Beyond the Data links safely|Live Favorites contains|Passport Pages has|At My Table contains" tests/site.test.cjs
npm test
```

Expected: all focused tests and the full suite PASS.

- [ ] **Step 8: Commit**

```bash
git add site/beyond-data.html tests/site.test.cjs
git commit -m "feat: populate beyond the data albums"
```

### Task 2: Style links, rankings, and the travel gallery

**Files:**
- Modify: `site/assets/css/components.css:923-980`
- Modify: `site/assets/css/responsive.css:231-241`
- Modify: all nine HTML component stylesheet query versions
- Test: `tests/site.test.cjs`

**Interfaces:**
- Consumes: classes added by Task 1
- Produces: responsive and keyboard-visible presentation with no JavaScript API

- [ ] **Step 1: Write the failing style test**

```js
test('Beyond the Data actions and gallery have responsive styles', () => {
  const css = read('assets', 'css', 'components.css');
  const mobile = read('assets', 'css', 'responsive.css');
  assert.match(css, /\.album-link\s*\{[^}]*display:\s*inline-flex;[^}]*border-radius:\s*999px;/s);
  assert.match(css, /\.album-link:focus-visible\s*\{[^}]*outline:/s);
  assert.match(css, /\.ranked-meta\s*\{[^}]*color:\s*var\(--color-muted\)/s);
  assert.match(css, /\.travel-gallery\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.travel-photo-featured\s*\{[^}]*grid-column:\s*span 2;[^}]*grid-row:\s*span 2;/s);
  assert.match(mobile, /\.travel-gallery\s*\{[^}]*grid-template-columns:\s*1fr;/s);
});
```

- [ ] **Step 2: Run the style test and verify RED**

```bash
node --test --test-name-pattern="Beyond the Data actions and gallery" tests/site.test.cjs
```

Expected: FAIL because the new selectors do not exist.

- [ ] **Step 3: Add component styles**

```css
.album-link { display: inline-flex; min-height: 2.5rem; align-items: center; padding: 0.55rem 0.9rem; color: var(--color-text); font-weight: 700; text-decoration: none; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(246, 246, 246, 0.12); border-radius: 999px; }
.album-link:hover { background: rgba(255, 255, 255, 0.14); }
.album-link:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
.ranked-meta { margin: 0.2rem 0 0.45rem !important; color: var(--color-muted); font-size: 0.84rem; }
.editable-note { max-width: 62ch; }
.travel-gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
.travel-photo-featured, .travel-photo-placeholder { width: 100%; min-height: 8rem; aspect-ratio: 4 / 3; border-radius: var(--radius-card); }
.travel-photo-featured { grid-column: span 2; grid-row: span 2; height: 100%; object-fit: cover; }
.travel-photo-placeholder { display: grid; place-items: center; color: var(--color-muted); font-size: 0.78rem; font-weight: 700; background: linear-gradient(145deg, #302d29, #1c201d); border: 1px dashed rgba(246, 246, 246, 0.16); }
```

Update `.ranked-list > div` selectors to `.ranked-item` and remove obsolete `.travel-album-preview` rules.

- [ ] **Step 4: Add mobile gallery styles**

Inside `@media (max-width: 30rem)`:

```css
.travel-gallery { grid-template-columns: 1fr; }
.travel-photo-featured { grid-column: auto; grid-row: auto; }
```

- [ ] **Step 5: Bump the shared component CSS query version**

Change all nine pages and the existing cache test from `components.css?v=20260923-9` to `components.css?v=20260923-10`.

- [ ] **Step 6: Verify and commit**

```bash
node --test --test-name-pattern="Beyond the Data actions and gallery|every page cache-busts" tests/site.test.cjs
npm test
git diff --check
git add site tests/site.test.cjs
git commit -m "feat: style beyond the data album content"
```

Expected: focused tests and full suite PASS; whitespace check prints nothing.

### Task 3: Browser review and final evidence

**Files:**
- Inspect: `site/beyond-data.html`
- Inspect: `site/assets/css/components.css`
- Inspect: `site/assets/css/responsive.css`

**Interfaces:**
- Consumes: Tasks 1 and 2
- Produces: a verified implementation, with no new interface

- [ ] **Step 1: Run automated verification**

```bash
npm test
git diff --check
git status --short
```

Expected: all tests PASS and no whitespace errors.

- [ ] **Step 2: Review a cache-fresh desktop preview**

Open `http://127.0.0.1:8000/beyond-data.html?content=complete`. Confirm closed rows contain no images; Music has two buttons; both rankings have three entries; Passport Pages has one Porto image and four future slots; and the footer does not cover the last entry.

- [ ] **Step 3: Review a narrow viewport**

At or below `30rem`, confirm the gallery becomes one column with Porto first, buttons wrap, and ranked descriptions do not overflow.

- [ ] **Step 4: Correct only observed regressions**

For each observed overflow, overlap, or accessibility problem, add a focused failing test, make the smallest HTML or CSS correction, and rerun `npm test` plus `git diff --check`.

- [ ] **Step 5: Commit any review correction**

```bash
git add site tests/site.test.cjs
git commit -m "fix: polish beyond the data layout"
```

Skip this commit if browser review requires no changes.

- [ ] **Step 6: Record final evidence**

```bash
npm test
git diff --check
git status --short
```

Expected: full suite PASS, no whitespace errors, and a clean working tree.
