# Spotify-Inspired Portfolio Redesign

**Date:** August 19, 2026  
**Status:** Approved after written-spec review  
**Owner:** Anna Kim

## Purpose

Redesign Anna Kim's portfolio as a recognizable Spotify-inspired experience that helps recruiters understand both her analytical ability and her personality. The site should feel like Anna's own personal version of Spotify, communicate "analyst with personality" within the first ten seconds, support quick professional scanning, and invite deeper exploration of projects and personal interests.

The site will use Anna's current resume as the factual source for education, experience, projects, and technical skills. Personal material will initially focus on music, concerts, favorite songs, and travel, with a structure that supports more hobbies later.

## Audience and Primary Job

The primary audience is recruiters and hiring managers reviewing Anna for data analytics, data science, research, and related internships. The site's primary job is to turn a brief LinkedIn or resume visit into a memorable, credible understanding of Anna's work and personality.

The interface may borrow Spotify's recognizable interaction patterns and proportions, but it must use Anna's name, content, and original project artwork. It must not present itself as Spotify or use Spotify's logo.

## Technical Direction

The redesign will remain a multi-page static website built with semantic HTML, shared CSS, and lightweight vanilla JavaScript. It will not require React, a backend, a database, or a build pipeline.

The existing static site in `/Users/annakim/PROJECTS/portfolio website/` will be treated as source material. Implementation will take place in the writable portfolio workspace, preserving the source folder unless Anna separately requests replacement.

Shared site behavior and visual tokens will live in common CSS and JavaScript files. Repeated navigation and player-bar markup may remain duplicated across pages because the site is small and must work when opened directly from the filesystem as well as when hosted.

## Information Architecture

### Home

The home page is the primary recruiter-facing view and will contain:

1. A Spotify-style application shell with desktop sidebar, top navigation controls, profile control, and persistent bottom bar.
2. A time-aware greeting addressed to the visitor, such as "Good afternoon, listener."
3. A concise identity statement presenting the site as Anna's personal Spotify: a library of the projects, experiences, skills, and interests that define her. It will also identify her as a Cornell Biometry and Statistics student with Data Science and Business minors and an analyst who connects technical work to real-world questions.
4. A featured projects area presented as playlists.
5. A "Recently played" experience area featuring Vevo, Allington Lab, and Cornell Data Journal.
6. A "Made for you" area that naturally curates Anna's strongest skills, resume, and professional links without addressing recruiters explicitly.

Project and experience content should be visible through ordinary scrolling. The page must not depend on hidden carousels for essential information.

### Profile

The profile page will resemble a Spotify profile page and include:

- A profile header with Anna's photo, name, short personal introduction, and professional context.
- "Top concerts" cards styled after Spotify's top-artist presentation.
- A favorite-songs track list. Each song opens its official Spotify destination in a new tab; the portfolio will not implement or embed music playback.
- A travel section titled in the site's vocabulary, such as "Places on repeat," using personal photos and short notes.
- Modular content sections so future hobbies can be added without restructuring the page.

Concerts, favorite songs, travel destinations, and supporting images will initially use clearly marked placeholders. The placeholder structure must make later content replacement straightforward. Before public launch, Anna can either provide the final material or choose to hide any incomplete section; the site must not present dead links or broken cards.

### Project Pages

Each primary project opens as a Spotify-style playlist detail page with custom cover artwork, a project summary, tools, a prominent GitHub link to the code used for the project, and concise case-study content presented as a track list. The initial project set is:

- Beats and Beliefs
- Froggit
- NBA Player Performance Analytics
- Allington Lab research

Each case study will use three primary sections:

1. Context
2. Findings or result
3. What Anna learned

The Context section may briefly cover the question, inputs, and approach when relevant, without splitting them into separate tracks. Track rows act as in-page navigation to readable content sections. Important case-study content must remain visible and indexable rather than existing only in popovers or animation states. Where a project does not naturally have a quantitative finding, "Findings" will become "Result" instead of forcing inaccurate content. GitHub links will open in a new tab with safe external-link attributes. During development, unavailable repository URLs may be marked as placeholders, but no dead GitHub link may remain in the launch version.

### Experiences

Experience cards appear on the home page as "Recently played." Each card includes role, organization, date range, and a concise impact statement. Selecting a card expands or reveals additional resume-backed detail in place. Separate pages for every job are intentionally out of scope.

### Global Navigation

Desktop navigation will include:

- Home
- Browse Projects, linking to the project library on the home page
- Your Projects
- Profile
- Resume
- LinkedIn
- GitHub

External professional links open in new tabs. Internal links use normal URLs so browser back and forward behavior works correctly. Mobile navigation will condense the sidebar into a compact header or bottom navigation while preserving access to every primary destination.

## Visual System

### Palette

The initial palette, spacing, proportions, hierarchy, navigation chrome, card treatments, playlist headers, track rows, hover states, and responsive behavior will follow Spotify's current frontend design as closely as practical while retaining Anna's own identity and content. The core palette is:

- Ink: `#000000`
- Base surface: `#121212`
- Elevated surface: `#181818`
- Primary text: `#F6F6F6`
- Secondary text: `#B3B3B3`
- Provisional accent green: `#1ED760`

All colors will be stored as CSS custom properties. The accent can be replaced later without rewriting component styles. Project detail headers will use restrained gradients derived from their custom cover artwork.

### Typography

The site will use a geometric sans-serif stack with bold, compact display headings, readable body copy, and smaller metadata labels. Typography should evoke Spotify's hierarchy without attempting to redistribute proprietary fonts. The final font choice must load reliably from an allowed public source or degrade cleanly to system sans-serif.

### Components

- Square project covers replace generic coding illustrations.
- Dark cards use modest corner radii and brighter elevated hover states.
- Green circular action buttons appear on relevant card hover and keyboard focus.
- Playlist pages use compact track rows with clear numbering, labels, and metadata.
- Gradient headers create page identity without adding unrelated decoration.

### Signature

Anna's work is organized as her own personal Spotify library: projects are playlists, professional experiences are recently played, professional highlights are "Made for you," and personal interests are on repeat. This metaphor should clarify the content rather than rename every conventional control with a music joke.

## Interaction Design

- The home greeting changes based on local time and addresses the visitor as "listener," for example, "Good afternoon, listener."
- Project cards use subtle elevation and action-button reveals on hover and focus.
- Project track rows navigate to Context, Findings or Result, and What Anna Learned. A separate GitHub action opens the project's source repository.
- Experience cards reveal additional detail without navigating to separate pages.
- Favorite songs link to Spotify in new tabs with safe external-link attributes.
- Browser back and forward controls continue to work through ordinary navigation.
- The persistent bottom bar displays the current page or project and provides explicit Resume, Email, and LinkedIn actions. Its controls must not resemble active music playback or imply that copyrighted music plays on the site.
- Page transitions and reveals remain restrained. Reduced-motion preferences disable nonessential motion.

## Content Principles

Professional claims, dates, tools, and results must be traceable to Anna's updated resume or to project materials she provides. Copy should be concise, conversational, and specific. The interface should foreground outcomes and questions instead of long technology lists.

The home page should reveal enough professional substance without requiring recruiters to understand the Spotify metaphor. Music-related labels may add personality, but conventional meaning must remain obvious from the visible copy and accessible labels.

## Accessibility and Responsive Behavior

- Use semantic landmarks, headings, links, buttons, and lists.
- Provide visible keyboard focus and full keyboard access.
- Give icon-only controls accessible names.
- Maintain sufficient text and control contrast on all gradients and surfaces.
- Respect `prefers-reduced-motion`.
- Provide meaningful alternative text for personal and project imagery.
- Do not rely on hover to expose essential information.
- Support narrow mobile screens without horizontal scrolling.
- On mobile, prioritize readable case-study content over an exact desktop Spotify replica.

## Error and Incomplete-Content Handling

- Hide optional personal sections when their content is not ready rather than displaying broken cards.
- Use deliberate development placeholders only while building; production pages must not contain `TBD`, `TODO`, or dead links.
- If JavaScript is unavailable, primary navigation, project pages, resume access, and external links must remain usable.
- Missing images receive a designed fallback based on project initials or section identity.

## Testing and Acceptance Criteria

Before delivery:

1. Every page loads directly from a local file and through a local HTTP server.
2. All internal navigation, browser back/forward behavior, resume access, and external links are verified.
3. Project track links reach the correct case-study sections.
4. Experience reveal controls work with pointer and keyboard input.
5. The layout is visually checked at representative desktop, tablet, and phone widths.
6. No text overlaps, clips, or creates horizontal scrolling at supported widths.
7. Keyboard focus is visible and logical.
8. Reduced-motion mode removes nonessential animation.
9. The site remains navigable when JavaScript is disabled.
10. Resume facts shown on the site match the provided August 2026 resume.
11. Optional personal sections do not appear broken when content is incomplete.

## Initial Scope

Included:

- Complete visual and structural rebuild of the static site, closely matching Spotify's current frontend patterns
- Home, profile, and four project pages
- Shared Spotify-inspired navigation and contextual bottom bar
- Resume, LinkedIn, GitHub profile, project repository, email, and Spotify song links once supplied
- Responsive and accessible behavior
- Original project-cover treatments using available content

Initially represented by development placeholders until content is supplied:

- Final concert selections and imagery
- Final favorite-song list and Spotify links
- Final travel places, photos, and captions
- Additional hobby categories
- A future replacement for the provisional green accent

Explicitly out of scope:

- Actual music playback
- Spotify authentication or API integration
- A backend, database, CMS, or admin interface
- React or another JavaScript application framework
- Separate detail pages for every professional experience
- Use of Spotify's logo or an implication that the portfolio is an official Spotify product
