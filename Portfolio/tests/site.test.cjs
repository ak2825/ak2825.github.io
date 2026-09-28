const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
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

test('skip link targets a focusable main content landmark', () => {
  const html = read('index.html');
  assert.match(html, /<a[^>]+class="skip-link"[^>]+href="#main-content"/);
  assert.match(html, /<main[^>]+id="main-content"[^>]+tabindex="-1"/);
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

test('shell does not force a minimum body width', () => {
  const shellCss = read('assets', 'css', 'shell.css');
  assert.doesNotMatch(shellCss, /body\s*\{[^}]*\bmin-width\s*:/s);
});

test('floating controls reserve a full navigation row above page content', () => {
  const shellCss = read('assets', 'css', 'shell.css');
  assert.match(shellCss, /\.content\s*\{[^}]*padding:\s*6\.5rem\s+var\(--space-page\)\s+4rem/s);
});

test('greeting uses local-time day periods', () => {
  const { greetingForHour } = require('../site/assets/js/site.js');
  assert.equal(greetingForHour(8), 'Good morning, listener.');
  assert.equal(greetingForHour(15), 'Good afternoon, listener.');
  assert.equal(greetingForHour(21), 'Good evening, listener.');
});

test('floating history controls call the browser history API', () => {
  const { initHistoryControls } = require('../site/assets/js/site.js');
  const listeners = {};
  const buttons = {
    back: { addEventListener: (_event, callback) => { listeners.back = callback; } },
    forward: { addEventListener: (_event, callback) => { listeners.forward = callback; } }
  };
  const documentRef = {
    querySelector: (selector) => buttons[selector.match(/"(back|forward)"/)?.[1]] || null
  };
  const calls = [];
  initHistoryControls(documentRef, {
    back: () => calls.push('back'),
    forward: () => calls.push('forward')
  });

  listeners.back();
  listeners.forward();
  assert.deepEqual(calls, ['back', 'forward']);
});

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

test('desktop library covers fill more of the available homepage width', () => {
  const css = read('assets', 'css', 'components.css');
  assert.match(css, /\.library-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*14\.5rem\)\)/s);
});

test('home gives Anna complete academic context at a glance', () => {
  const html = read('index.html');
  const hero = html.match(/<section\b[^>]*class="[^"]*\bhome-hero\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero, 'home identity section should exist');
  assert.match(hero, /Cornell/);
  assert.match(hero, /Biometry and Statistics/);
  assert.match(hero, /minors? in Data Science and Business/);
});

test('media-card copy wrappers permit headings and paragraphs', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /<span\b[^>]*class="[^"]*\bmedia-card-copy\b[^"]*"/);
});

test('Profile is professional and contains no hobby collections', () => {
  const html = read('profile.html');
  for (const text of ['Biometry and Statistics', 'Data Science', 'Business', 'Resume', 'LinkedIn', 'GitHub']) {
    assert.ok(html.includes(text), `profile missing ${text}`);
  }
  for (const id of ['concerts', 'favorite-songs', 'travel', 'at-my-table']) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`));
  }
});

test('Beyond the Data presents four personal albums as compact expandable rows', () => {
  const html = read('beyond-data.html');
  const expected = [
    ['music-made-by-me', 'Music, made by me'],
    ['live-favorites', 'Live Favorites'],
    ['passport-pages', 'Passport Pages'],
    ['at-my-table', 'At My Table']
  ];
  assert.match(html, /<section class="playlist-track-list" aria-label="Personal albums">/);
  assert.equal((html.match(/<details\b[^>]*class="playlist-track"/g) || []).length, 4);
  for (const [id, title] of expected) {
    const album = html.match(new RegExp(`<details[^>]+id="${id}"[\\s\\S]*?<\\/details>`))?.[0];
    assert.ok(album, `${id}: personal album should exist`);
    assert.match(album, new RegExp(`data-track-title="${title}"`));
    const summary = album.match(/<summary>[\s\S]*?<\/summary>/)?.[0];
    assert.ok(summary, `${id}: summary should exist`);
    assert.doesNotMatch(summary, /<img\b/);
  }
  assert.match(html, /spring semester studying abroad in Europe/i);
});

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

test('Passport Pages presents five captioned travel photographs', () => {
  const html = read('beyond-data.html');
  const photos = [
    ['dsc01330.jpeg', 'Sunset over the Douro River in Porto, Portugal.'],
    ['dsc01341.jpeg', 'Another view of the Douro River and Porto’s riverside at dusk.'],
    ['dsc01466.jpeg', 'Beach and lighthouse in Porto, Portugal.'],
    ['img-2821.jpeg', 'Acadia National Park in Maine.'],
    ['img-5477.jpeg', 'Sunset at a beach in Maui, Hawaii.']
  ];
  assert.equal((html.match(/<figure\b[^>]*class="travel-photo(?: travel-photo-featured)?"/g) || []).length, 5);
  assert.equal((html.match(/<figcaption>/g) || []).length, 5);
  assert.doesNotMatch(html, /travel-photo-placeholder/);
  for (const [filename, caption] of photos) {
    assert.ok(fs.existsSync(site('assets', 'images', 'beyond-data', 'travel-gallery', filename)), `${filename}: travel photo should exist`);
    assert.match(html, new RegExp(`src="assets/images/beyond-data/travel-gallery/${filename}"`));
    assert.ok(html.includes(`<figcaption>${caption}</figcaption>`), `${filename}: caption should be visible`);
  }
});

test('At My Table contains linked recommendations and Anna’s Beli profile', () => {
  const html = read('beyond-data.html');
  for (const text of ['Okdongsik', 'Perfect meal for a cold NYC day', 'Daesun Korean Noodle', 'best Korean seafood pancakes', 'Tapabento S. Bento', 'Shoutout the cataplana and razor clams']) assert.ok(html.includes(text));
  for (const href of ['https://www.okdongsik.net/', 'https://daesungkoreannoodleflushing.com/', 'https://www.tapabento.com/', 'https://beliapp.co/app/fabanna']) {
    assert.match(html, new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]+target="_blank"[^>]+rel="noopener noreferrer"`));
  }
  assert.match(html, /Click my Beli to see a list of all my favorites as a foodie from NYC/);
});

test('Beyond the Data actions and gallery have responsive styles', () => {
  const css = read('assets', 'css', 'components.css');
  const mobile = read('assets', 'css', 'responsive.css');
  assert.match(css, /\.album-link\s*\{[^}]*display:\s*inline-flex;[^}]*border-radius:\s*999px;/s);
  assert.match(css, /\.album-link:focus-visible\s*\{[^}]*outline:/s);
  assert.match(css, /\.ranked-meta\s*\{[^}]*color:\s*var\(--color-muted\)/s);
  assert.match(css, /\.travel-gallery\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.travel-photo-featured\s*\{[^}]*grid-column:\s*span 2;[^}]*grid-row:\s*span 2;/s);
  assert.match(css, /\.travel-photo\s+figcaption\s*\{[^}]*color:\s*var\(--color-muted\)/s);
  assert.match(mobile, /\.travel-gallery\s*\{[^}]*grid-template-columns:\s*1fr;/s);
});

test('home uses the approved Beyond the Data four-photo composite', () => {
  const html = read('index.html');
  const card = html.match(/<a[^>]+class="[^"]*library-card[^"]*"[^>]+href="beyond-data\.html"[\s\S]*?<\/a>/)?.[0];
  assert.ok(card, 'Beyond the Data library card should exist');
  assert.match(card, /beyond-data\/beyondthedata-source\.png/);
});

test('Experience uses the approved four-quadrant composite on home and its collection page', () => {
  const home = read('index.html');
  const card = home.match(/<a[^>]+class="[^"]*library-card[^"]*"[^>]+href="experience\.html"[\s\S]*?<\/a>/)?.[0];
  assert.ok(card, 'Experience library card should exist');
  assert.match(card, /experience\/experience-playlist-cover\.png/);
  assert.match(read('experience.html'), /collection-cover[^>]+src="assets\/images\/experience\/experience-playlist-cover\.png"/);

  assert.match(home, /projects\/projects-playlist-cover\.png/);
  assert.match(read('projects.html'), /collection-cover[^>]+src="assets\/images\/projects\/projects-playlist-cover\.png"/);
  assert.match(read('beyond-data.html'), /collection-cover[^>]+src="assets\/images\/beyond-data\/beyondthedata-source\.png"/);
});

test('playlist covers use the approved finished artwork', () => {
  const home = read('index.html');
  const projects = home.match(/<a[^>]+class="[^"]*library-card[^"]*"[^>]+href="projects\.html"[\s\S]*?<\/a>/)?.[0];
  assert.ok(projects);
  assert.match(projects, /projects\/projects-playlist-cover\.png/);

  assert.match(home, /experience\/experience-playlist-cover\.png/);
});

test('Experience and Beyond the Data covers mask stray outer-edge pixels', () => {
  const home = read('index.html');
  assert.match(home, /class="library-cover cover-edge-mask"[^>]+src="assets\/images\/experience\/experience-playlist-cover\.png"/);
  assert.match(home, /class="library-cover cover-edge-mask"[^>]+src="assets\/images\/beyond-data\/beyondthedata-source\.png"/);
  assert.match(read('experience.html'), /class="collection-cover cover-edge-mask"[^>]+src="assets\/images\/experience\/experience-playlist-cover\.png"/);
  assert.match(read('beyond-data.html'), /class="collection-cover cover-edge-mask"[^>]+src="assets\/images\/beyond-data\/beyondthedata-source\.png"/);
  assert.match(read('assets', 'css', 'components.css'), /\.cover-edge-mask\s*\{[^}]*clip-path:\s*inset\(1px round/s);
});

test('profile preserves professional context', () => {
  const html = read('profile.html');
  assert.match(html, /Biometry and Statistics/);
  assert.match(html, /Data Science/);
  assert.match(html, /Business/);
});

test('profile long-form descriptions use readable body typography', () => {
  const html = read('profile.html');
  const css = read('assets', 'css', 'components.css');
  assert.equal((html.match(/class="profile-copy"/g) || []).length, 2);
  assert.match(css, /\.profile-copy\s*\{[^}]*max-width:\s*70ch[^}]*color:\s*var\(--color-muted\)[^}]*line-height:\s*1\.6/s);
});

test('every page uses Anna’s portrait for the sidebar avatar', () => {
  const portrait = 'assets/images/anna-kim-avatar.jpeg';
  assert.ok(fs.existsSync(site(...portrait.split('/'))), 'portrait asset should exist');

  for (const filename of pages) {
    const html = read(filename);
    assert.match(
      html,
      new RegExp(`<a\\b[^>]*class="[^"]*\\bwordmark\\b[^"]*"[^>]*>[\\s\\S]*?<img\\b[^>]*src="${portrait}"[^>]*alt=""[^>]*>`),
      `${filename}: sidebar should use Anna’s portrait`
    );
  }
});

test('profile hero uses Anna’s portrait with descriptive alternative text', () => {
  const html = read('profile.html');
  assert.match(html, /<img\b[^>]*class="[^"]*\bprofile-photo\b[^"]*"[^>]*src="assets\/images\/anna-kim-avatar\.jpeg"[^>]*alt="Anna Kim seated in a restaurant"[^>]*>/);
});

test('profile portrait uses the approved lightly tightened square crop', () => {
  const portrait = fs.readFileSync(site('assets', 'images', 'anna-kim-avatar.jpeg'));
  const jpegSof = portrait.indexOf(Buffer.from([0xff, 0xc0]));
  assert.notEqual(jpegSof, -1, 'portrait should contain JPEG dimensions');
  assert.equal(portrait.readUInt16BE(jpegSof + 5), 2200);
  assert.equal(portrait.readUInt16BE(jpegSof + 7), 2200);
});

const projects = [
  'project-beats-and-beliefs.html',
  'project-froggit.html',
  'project-nba-analytics.html',
  'project-allington-lab.html'
];

const playlists = ['projects.html', 'experience.html', 'beyond-data.html'];
const pages = ['index.html', 'profile.html', ...playlists, ...projects];

test('every page cache-busts the shared shell and interaction assets', () => {
  for (const filename of pages) {
    const html = read(filename);
    assert.match(html, /href="assets\/css\/shell\.css\?v=20260923-3"/, `${filename}: shell CSS should bypass stale browser cache`);
    assert.match(html, /href="assets\/css\/components\.css\?v=20260927-3"/, `${filename}: component CSS should bypass stale browser cache`);
    assert.match(html, /src="assets\/js\/site\.js\?v=20260923-3"/, `${filename}: site JavaScript should bypass stale browser cache`);
  }
});

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

test('top-level playlist heroes show Anna and useful browsing metadata', () => {
  const expected = {
    'projects.html': ['4 case studies', '12 min read'],
    'experience.html': ['3 roles', '6 min read'],
    'beyond-data.html': ['4 personal albums', '8 min browse']
  };

  for (const [filename, details] of Object.entries(expected)) {
    const html = read(filename);
    assert.match(html, /class="collection-meta"/);
    assert.match(html, /src="assets\/images\/anna-kim-avatar\.jpeg"/);
    assert.match(html, />Anna Kim</);
    for (const detail of details) assert.ok(html.includes(detail), `${filename}: missing ${detail}`);
  }
});

test('playlist hero gradients extend behind the history controls without shifting content', () => {
  const css = read('assets', 'css', 'components.css');
  assert.match(css, /\.playlist-page-content\s*\{[^}]*padding-top:\s*0;/s);
  assert.match(css, /\.collection-hero\s*\{[^}]*padding:\s*6rem\s+var\(--space-page\)\s+2rem;/s);
  for (const filename of ['projects.html', 'experience.html', 'beyond-data.html']) {
    assert.match(read(filename), /class="content playlist-page-content"/, `${filename}: should use the continuous playlist hero treatment`);
  }
});

test('Projects presents every case study as an expandable album row', () => {
  const html = read('projects.html');
  const expected = [
    ['beats-and-beliefs', 'Beats and Beliefs', 'project-beats-and-beliefs.html'],
    ['froggit', 'Froggit', 'project-froggit.html'],
    ['nba-analytics', 'NBA Player Performance Analytics', 'project-nba-analytics.html'],
    ['allington-project', 'Allington Lab', 'project-allington-lab.html']
  ];
  assert.equal((html.match(/<details\b[^>]*class="[^"]*playlist-track/g) || []).length, 4);
  for (const [id, title, href] of expected) {
    assert.match(html, new RegExp(`id="${id}"[\\s\\S]*?data-track-title="${title}"[\\s\\S]*?href="${href}"[\\s\\S]*?Open full album`));
  }
  assert.equal((html.match(/<span class="track-duration">4 tracks<\/span>/g) || []).length, 4);
});

test('project pages use text-first heroes and expose case-study sections as tracks', () => {
  for (const filename of projects) {
    const html = read(filename);
    assert.match(html, /class="playlist-hero playlist-hero--text"/);
    assert.match(html, />Project case study</);
    assert.doesNotMatch(html, /<img[^>]+class="playlist-cover"/);
    assert.match(html, /<nav class="case-tracklist" aria-label="Case study sections">/);
    for (const label of ['Context', 'Approach', 'Findings', 'What I learned']) {
      assert.match(html, new RegExp(`class="track-row"[^>]*>[\\s\\S]*?${label}`), `${filename}: missing ${label} track`);
    }
  }
});

test('project text-first heroes balance space above and below the history controls', () => {
  const css = read('assets', 'css', 'components.css');
  assert.match(css, /\.playlist-hero--text\s*\{[^}]*min-height:\s*0;[^}]*padding-top:\s*4\.5rem;/s);
  assert.doesNotMatch(css, /\.playlist-hero--text\s*\{[^}]*min-height:\s*24rem;/s);
});

test('project case-study content aligns with the left project-page gutter', () => {
  const css = read('assets', 'css', 'components.css');
  assert.match(css, /\.case-study\s*\{[^}]*max-width:\s*50rem;[^}]*margin:\s*0;/s);
  assert.doesNotMatch(css, /\.case-study\s*\{[^}]*margin:\s*0\s+auto;/s);
});

test('project case-study tracks use compact vertical spacing', () => {
  const css = read('assets', 'css', 'components.css');
  assert.match(css, /\.case-study section \+ section\s*\{[^}]*margin-top:\s*clamp\(1\.75rem,\s*3vw,\s*2\.5rem\);[^}]*padding-top:\s*clamp\(1\.75rem,\s*3vw,\s*2\.5rem\);/s);
});

test('expanded project rows place the full-album action beside the Inside copy', () => {
  const html = read('projects.html');
  assert.equal((html.match(/class="project-album-inside"/g) || []).length, 4);
  const css = read('assets', 'css', 'components.css');
  assert.match(css, /\.project-album-inside\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/s);
  assert.match(css, /\.project-album-inside\s+\.repository-link\s*\{[^}]*grid-column:\s*2[^}]*grid-row:\s*1\s*\/\s*span\s*2/s);
});

test('project album rows inherit the shared responsive disclosure treatment', () => {
  const components = read('assets', 'css', 'components.css');
  const responsive = read('assets', 'css', 'responsive.css');
  assert.match(components, /\.playlist-track\s*>\s*summary:focus-visible/);
  assert.match(responsive, /\.track-index,\s*\.track-duration,\s*\.playlist-track\s+summary\s+small\s*\{[^}]*display:\s*none/s);
});

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
      const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.match(nav, new RegExp(`href="${escapedHref}"[^>]*>${label}<\\/a>`), `${filename}: missing ${label}`);
    }
  }
});

test('every persistent footer includes the GitHub shortcut', () => {
  for (const filename of pages) {
    const html = read(filename);
    const footer = html.match(/<footer\b[^>]*class="[^"]*\bnow-viewing\b[^"]*"[^>]*>[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer, `${filename}: missing persistent footer`);
    assert.match(footer, /<a\b[^>]*href="https:\/\/github\.com\/ak2825"[^>]*>GitHub<\/a>/, `${filename}: missing footer GitHub`);
  }
});

test('every Resume shortcut downloads Anna’s approved resume PDF', () => {
  const resume = fs.readFileSync(site('Anna_Kim_Resume.pdf'));
  assert.equal(
    crypto.createHash('sha256').update(resume).digest('hex'),
    'c6deae5d1be0e90215a518abcdd7ad09fb3d290b372bfa004d6efb7ef2154c97'
  );
  for (const filename of pages) {
    assert.match(read(filename), /<a href="Anna_Kim_Resume\.pdf\?v=20260923-2">Resume<\/a>/, `${filename}: Resume shortcut should bypass stale browser cache`);
  }
});

test('every page renders the page-aware portfolio player controls', () => {
  for (const filename of pages) {
    const html = read(filename);
    const player = html.match(/<footer\b[^>]*class="[^"]*\bnow-viewing\b[^"]*"[^>]*>[\s\S]*?<\/footer>/)?.[0];
    assert.ok(player, `${filename}: missing portfolio player`);
    assert.match(player, /data-player-track/, `${filename}: missing current track`);
    assert.match(player, /data-player-artist/, `${filename}: missing artist label`);
    assert.match(player, /data-player-progress/, `${filename}: missing progress bar`);
    for (const action of ['shuffle', 'previous', 'play', 'next', 'repeat']) {
      assert.match(player, new RegExp(`data-player-action="${action}"`), `${filename}: missing ${action} control`);
    }
  }
});

test('player navigation follows sequence, repeat, and deterministic shuffle', () => {
  const { pageForDirection } = require('../site/assets/js/site.js');

  assert.equal(pageForDirection('profile.html', 'next', {}, 0), 'project-beats-and-beliefs.html');
  assert.equal(pageForDirection('index.html', 'previous', {}, 0), 'project-allington-lab.html');
  assert.equal(pageForDirection('project-froggit.html', 'next', { repeat: true }, 0), 'project-froggit.html');
  assert.equal(pageForDirection('profile.html', 'next', { shuffle: true }, 0.99), 'project-allington-lab.html');
});

test('player assigns a distinct track to each portfolio page', () => {
  const { trackForPage } = require('../site/assets/js/site.js');
  const expected = {
    'index.html': "Anna's Library",
    'profile.html': 'About Anna',
    'project-beats-and-beliefs.html': 'Beats and Beliefs',
    'project-froggit.html': 'Froggit',
    'project-nba-analytics.html': 'NBA Player Performance Analytics',
    'project-allington-lab.html': 'Allington Lab'
  };

  for (const [filename, title] of Object.entries(expected)) {
    assert.equal(trackForPage(filename).title, title);
    assert.equal(trackForPage(filename).artist, 'Anna Kim');
  }
});

test('experience hash target opens its track and syncs player labels on init', () => {
  const { init } = require('../site/assets/js/site.js');
  const tracks = [
    {
      id: 'vevo',
      open: false,
      dataset: { trackTitle: 'Vevo', trackParent: 'Experience' },
      addEventListener() {}
    },
    {
      id: 'allington-lab',
      open: false,
      dataset: { trackTitle: 'Allington Lab', trackParent: 'Experience' },
      addEventListener() {}
    }
  ];
  const playerTrack = { textContent: '' };
  const playerArtist = { textContent: '' };
  const nowViewing = { textContent: '' };
  const player = {
    querySelector(selector) {
      return {
        '[data-player-track]': playerTrack,
        '[data-player-artist]': playerArtist,
        '[data-player-cover]': { textContent: '' },
        '[data-player-action="play"]': null,
        '[data-player-progress]': null
      }[selector] || null;
    },
    querySelectorAll() { return []; }
  };
  const documentRef = {
    body: { dataset: { pageTitle: 'Experience' } },
    querySelector(selector) {
      return {
        '.now-viewing': player,
        '[data-player-track]': playerTrack,
        '[data-player-artist]': playerArtist,
        '[data-now-viewing]': nowViewing
      }[selector] || null;
    },
    querySelectorAll(selector) {
      return selector === '.playlist-track' ? tracks : [];
    }
  };
  const previousLocation = globalThis.location;
  globalThis.location = { pathname: '/experience.html', hash: '#vevo' };
  try {
    init(documentRef, new Date(2026, 8, 4, 12));
  } finally {
    globalThis.location = previousLocation;
  }

  assert.equal(tracks[0].open, true);
  assert.equal(tracks[1].open, false);
  assert.equal(playerTrack.textContent, 'Vevo');
  assert.equal(playerArtist.textContent, 'Experience · Anna Kim');
  assert.equal(nowViewing.textContent, 'Now viewing: Vevo');
});

test('Beyond the Data hash target opens its track and syncs player labels on init', () => {
  const { init } = require('../site/assets/js/site.js');
  const track = {
    id: 'at-my-table',
    open: false,
    dataset: { trackTitle: 'At my table', trackParent: 'Beyond the Data' },
    addEventListener() {}
  };
  const playerTrack = { textContent: '' };
  const playerArtist = { textContent: '' };
  const nowViewing = { textContent: '' };
  const player = {
    querySelector(selector) {
      return {
        '[data-player-track]': playerTrack,
        '[data-player-artist]': playerArtist,
        '[data-player-cover]': { textContent: '' },
        '[data-player-action="play"]': null,
        '[data-player-progress]': null
      }[selector] || null;
    },
    querySelectorAll() { return []; }
  };
  const documentRef = {
    body: { dataset: { pageTitle: 'Beyond the Data' } },
    querySelector(selector) {
      return {
        '.now-viewing': player,
        '[data-player-track]': playerTrack,
        '[data-player-artist]': playerArtist,
        '[data-now-viewing]': nowViewing
      }[selector] || null;
    },
    querySelectorAll(selector) {
      return selector === '.playlist-track' ? [track] : [];
    }
  };
  const previousLocation = globalThis.location;
  globalThis.location = { pathname: '/beyond-data.html', hash: '#at-my-table' };
  try {
    init(documentRef, new Date(2026, 8, 4, 12));
  } finally {
    globalThis.location = previousLocation;
  }

  assert.equal(track.open, true);
  assert.equal(playerTrack.textContent, 'At my table');
  assert.equal(playerArtist.textContent, 'Beyond the Data · Anna Kim');
  assert.equal(nowViewing.textContent, 'Now viewing: At my table');
});

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

test('every project has concise case-study tracks and repository action', () => {
  for (const filename of projects) {
    const html = read(filename);
    assert.match(html, /id="context"/);
    assert.match(html, /id="approach"/);
    assert.match(html, /id="findings"/);
    assert.match(html, /id="learning"/);
    assert.match(html, /class="[^"]*repository-link/);
    assert.doesNotMatch(html, /id="dataset"|id="result"/);
  }
});

test('project navigation marks Projects as current', () => {
  for (const filename of projects) {
    const html = read(filename);
    const projectLibraryLink = html.match(/<a\b[^>]*href="projects\.html"[^>]*>Projects<\/a>/)?.[0];
    assert.ok(projectLibraryLink, `${filename}: missing Projects link`);
    assert.match(projectLibraryLink, /\baria-current="page"/);
  }
});

test('all local HTML and asset links resolve', () => {
  for (const page of pages) {
    const html = read(page);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const localPath = target.split(/[?#]/)[0];
      assert.ok(fs.existsSync(path.resolve(site(), localPath)), `${page}: missing ${target}`);
    }
  }
});

test('every page has skip navigation, one main, and a descriptive title', () => {
  for (const filename of pages) {
    const html = read(filename);
    assert.match(html, /class="skip-link"/);
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    assert.match(html, /<title>[^<]+Anna Kim[^<]*<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]+"/);
  }
});

test('external anchors are safe', () => {
  for (const filename of pages) {
    const html = read(filename);
    for (const match of html.matchAll(/<a[^>]+href="https?:[^"]+"[^>]*>/g)) {
      assert.match(match[0], /target="_blank"/);
      assert.match(match[0], /rel="noopener noreferrer"/);
    }
  }
});

test('no page contains dead hash links or launch placeholders disguised as links', () => {
  for (const filename of pages) {
    const html = read(filename);
    assert.doesNotMatch(html, /href="#"/);
    assert.doesNotMatch(html, /<a\b[^>]*\bdata-placeholder(?:\s|=|>)/);
  }
});

test('persistent footer uses the shared elevated-surface token', () => {
  const css = read('assets', 'css', 'shell.css');
  const nowViewing = css.match(/\.now-viewing\s*\{([^}]*)\}/s)?.[1];
  assert.ok(nowViewing, 'now-viewing styles should exist');
  assert.match(nowViewing, /background:\s*var\(--color-elevated\);/);
  assert.doesNotMatch(nowViewing, /background:\s*#181818;/i);
});

test('current-page states match static page destinations', () => {
  const home = read('index.html');
  assert.match(home, /<a aria-current="page" href="index\.html">Home<\/a>/);
  assert.doesNotMatch(home, /<a aria-current="page" href="profile\.html">Profile<\/a>/);

  const profile = read('profile.html');
  assert.match(profile, /<a aria-current="page" href="profile\.html">Profile<\/a>/);
  assert.doesNotMatch(profile, /<a aria-current="page" href="index\.html">Home<\/a>/);
});

test('page label helper updates the contextual footer with a fallback', () => {
  const { setCurrentPageLabel } = require('../site/assets/js/site.js');
  const label = { textContent: '' };
  const documentRef = {
    body: { dataset: { pageTitle: 'Froggit' } },
    querySelector(selector) {
      return selector === '[data-now-viewing]' ? label : null;
    }
  };

  setCurrentPageLabel(documentRef);
  assert.equal(label.textContent, 'Now viewing: Froggit');

  documentRef.body.dataset = {};
  setCurrentPageLabel(documentRef);
  assert.equal(label.textContent, 'Now viewing: Portfolio');
});

test('mobile and reduced-motion rules protect responsive access', () => {
  const css = read('assets', 'css', 'responsive.css');
  const mobile = css.match(/@media \(max-width: 48rem\)\s*\{([\s\S]*?)(?=\n@media|$)/)?.[1];
  assert.ok(mobile, '48rem mobile breakpoint should exist');
  assert.match(mobile, /\.app-shell\s*\{[^}]*display:\s*block;[^}]*padding-bottom:\s*var\(--player-height\);/s);
  assert.match(mobile, /\.sidebar\s*\{[^}]*position:\s*static;[^}]*width:\s*auto;/s);
  assert.match(mobile, /\.sidebar nav\s*\{[^}]*display:\s*flex;[^}]*overflow-x:\s*auto;/s);
  assert.match(mobile, /\.main-view\s*\{[^}]*margin-left:\s*0;/s);
  assert.match(mobile, /\.playlist-hero,\s*\.profile-hero\s*\{[^}]*grid-template-columns:\s*1fr;/s);

  const reducedMotion = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*)\n\}/)?.[1];
  assert.ok(reducedMotion, 'reduced-motion query should exist');
  assert.match(reducedMotion, /scroll-behavior:\s*auto !important;/);
  assert.match(reducedMotion, /transition-duration:\s*0\.01ms !important;/);
  assert.match(reducedMotion, /animation-duration:\s*0\.01ms !important;/);
  assert.match(reducedMotion, /animation-iteration-count:\s*1 !important;/);
});

test('playlist architecture has mobile and reduced-motion protections', () => {
  const responsive = read('assets', 'css', 'responsive.css');
  const components = read('assets', 'css', 'components.css');
  const mobile = responsive.match(/@media\s*\(max-width:\s*48rem\)\s*\{([\s\S]*?)(?=\n@media|$)/)?.[1];
  assert.ok(mobile, '48rem mobile breakpoint should contain playlist rules');
  assert.match(mobile, /\.library-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobile, /\.library-card\s*\{[^}]*grid-template-columns:\s*5rem\s+minmax\(0,\s*1fr\)/s);
  assert.match(mobile, /\.library-cover\s*\{[^}]*width:\s*5rem;/s);
  assert.match(mobile, /\.collection-cover\s*\{[^}]*width:\s*min\(12rem,/s);
  assert.match(mobile, /\.track-preview\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobile, /\.restaurant-grid,\s*\.travel-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  const phone390 = responsive.match(/@media\s*\(max-width:\s*24\.375rem\)\s*\{([\s\S]*?)(?=\n@media|$)/)?.[1];
  assert.ok(phone390, '390px breakpoint should exist');
  assert.match(phone390, /\.sidebar nav\s*\{[^}]*scroll-snap-type:\s*x\s+proximity;/s);
  assert.match(phone390, /\.sidebar nav a\s*\{[^}]*scroll-snap-align:\s*start;/s);
  const narrow = responsive.match(/@media\s*\(max-width:\s*22rem\)\s*\{([\s\S]*?)(?=\n@media|$)/)?.[1];
  assert.ok(narrow, '22rem breakpoint should contain narrow-screen rules');
  assert.match(narrow, /\.track-index,\s*\.track-duration,\s*\.playlist-track\s+summary\s+small\s*\{[^}]*display:\s*none;/s);
  assert.match(responsive, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(components, /\.playlist-track\s*>\s*summary:focus-visible/);
});

test('collection heroes establish a desktop grid before collapsing on mobile', () => {
  const components = read('assets', 'css', 'components.css');
  const responsive = read('assets', 'css', 'responsive.css');
  assert.match(components, /\.collection-hero\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:/s);
  assert.match(components, /\.collection-cover\s*\{[^}]*aspect-ratio:\s*1;/s);
  assert.match(responsive, /\.collection-hero\s*\{[^}]*padding-top:\s*6\.5rem;/s);
});

test('compact navigation reserves visible space for its final destination', () => {
  const responsive = read('assets', 'css', 'responsive.css');
  assert.match(responsive, /\.sidebar nav\s*\{[^}]*padding-inline-end:\s*0\.25rem;/s);
});
