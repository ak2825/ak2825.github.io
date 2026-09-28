# Playlist Architecture Redesign

## Purpose

Reorganize Anna Kim’s portfolio so the music-library metaphor matches the content hierarchy. Major areas of the portfolio become playlists, and the individual items inside them become tracks. The result should be easier for recruiters to scan, simpler to expand, and less dependent on producing unique cover art for every project.

## Approved information architecture

The portfolio has five primary destinations:

1. **Home** — an overview of Anna’s library.
2. **Profile** — Anna’s professional introduction and contact information.
3. **Projects** — a playlist whose tracks are individual projects.
4. **Experience** — a playlist whose tracks are individual roles.
5. **Beyond the Data** — a playlist whose tracks are personal interests.

The Profile remains separate from the playlist system, like an artist profile in a music application.

## Homepage

The approved homepage hierarchy is:

1. A time-aware greeting such as “Good afternoon, listener.”
2. The headline “Welcome to my listening activity.”
3. A concise introduction: “I’m Anna Kim, a Cornell student studying Biometry and Statistics with minors in Data Science and Business. This library brings together my projects, experiences, and interests beyond the data.”
4. A **Your Library** row containing three playlist cards: Projects, Experience, and Beyond the Data.
5. A **Recently Played** section that surfaces selected tracks from across the three playlists.
6. The persistent portfolio player.

The homepage will not contain full project descriptions, full experience descriptions, personal hobby sections, or repeated résumé content. Those details belong inside their relevant destinations.

## Profile

The Profile is professional and introductory. It contains:

- Anna’s portrait and a concise personal statement.
- Cornell education and academic focus.
- Statistics, data science, and business interests.
- A short explanation of what motivates Anna as an analyst.
- Resume, LinkedIn, GitHub, email, and other contact actions.

Music, concerts, restaurants, and travel move out of the Profile and into Beyond the Data.

## Projects playlist

The Projects playlist contains one track per project:

1. Beats and Beliefs.
2. Froggit.
3. NBA Player Performance Analytics.
4. Allington Lab.

Selecting a project track reveals a concise preview containing its context, primary finding or result, and tools. A “View full project” action opens the existing detailed case-study page, where the visitor can read what Anna learned and follow the GitHub link.

Only one project preview is expanded at a time.

## Experience playlist

The Experience playlist contains one track per role or organization. Each track exposes the role, dates, responsibilities, and measurable contribution. Track duration may display the actual length of the experience rather than an invented song duration.

Only one experience track is expanded at a time.

## Beyond the Data playlist

Beyond the Data contains:

1. Currently into.
2. My soundtrack.
3. Concerts on repeat.
4. At my table.
5. Places on repeat.

Selecting a track expands its content directly beneath the track row without leaving the playlist. The selected row remains highlighted, and the player updates to reflect the selected track. Selecting another track closes the current content and opens the new selection.

“At my table” will support restaurant entries with a photo, restaurant name, location and cuisine, favorite order, and a short personal note. The other tracks will follow the same principle: a small number of specific, memorable entries rather than exhaustive lists.

## Recently Played

Recently Played is a shortcut surface, not a duplicate content section. It can link directly to selected tracks such as a featured project, a recent role, or a personal collection. Its purpose is to help a recruiter reach representative content quickly.

## Player behavior

The persistent player remains part of the interface. It displays the active playlist or track and preserves previous and next navigation across the portfolio. On the homepage it displays “Anna’s Library” by Anna Kim. On a selected track, it updates to that track’s title and parent playlist.

The player is a portfolio navigation metaphor and does not play copyrighted audio.

## Responsive behavior

- Desktop presents the library cards in a row and track metadata in columns.
- Mobile converts playlist cards into compact horizontal rows.
- Track metadata collapses to the title and essential status on narrow screens.
- Expanded content stacks vertically beneath the selected track.
- The persistent player reduces to essential track information and navigation controls.
- All controls remain keyboard accessible and expose visible focus states.
- Motion respects `prefers-reduced-motion`.

## Deferred work

The following decisions are outside this redesign and will be handled separately:

- Final playlist cover artwork and whether it uses photography, illustration, or a hybrid.
- The shared visitor song queue, persistent storage, automatic filtering, rate limiting, reporting, and moderation tools.
- Final restaurant, music, concert, and travel content.

The redesigned structure must work with neutral placeholder covers and placeholder personal entries until those assets and details are approved.

## Success criteria

- A recruiter can understand the portfolio’s structure from the homepage without instruction.
- Major sections behave consistently as playlists and their items behave consistently as tracks.
- Projects remain easy to scan while preserving access to full case studies and GitHub repositories.
- Professional and personal content are clearly separated without making the site feel impersonal.
- The architecture can accept additional projects, roles, and interests without redesigning the homepage.
- The experience remains usable on desktop and mobile.
