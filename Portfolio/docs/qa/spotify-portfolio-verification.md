# Spotify Portfolio Verification

- Automated tests: PASS (`npm test`)
- Desktop 1440 × 900: PASS
- Tablet 768 × 1024: PASS
- Phone 390 × 844: PASS
- Narrow phone 320 × 700: PASS
- Keyboard navigation and visible focus: LIMITED VERIFICATION — DOM focus order and visible focus treatment checked; native Tab/Enter sequence not verified
- Reduced motion: LIMITED VERIFICATION — declarations and computed replay checked; media-query activation not verified
- JavaScript-disabled fallback: PASS
- Resume and supplied external links: PASS
- Repository links: PLACEHOLDER TEXT pending Anna's four URLs
- Hobby content: DEVELOPMENT PLACEHOLDERS pending Anna's selections and images

## Verification setup

- Date: 2026-08-19
- Site server: `python3 -m http.server 8000 --directory site`
- Browser: Codex in-app browser for rendered, responsive, navigation, pointer, history, anchor, and focus checks
- Pages at every viewport: Home, Profile, and Beats and Beliefs
- Screenshots: viewport screenshots were captured and visually inspected during the QA session; they are not committed site assets

## Responsive and visual evidence

The browser reported each requested viewport exactly. Across the 12 page/viewport combinations, document horizontal overflow was `0px`. The fixed bottom bar retained its full clearance (within a subpixel layout tolerance of 1px), and visual inspection found no overlaps, clipped content, unreadable gradients, or content trapped beneath it.

After the global navigation expanded to six destinations, the 320 × 700 rerun showed a `320px`-wide header with `0px` document and body overflow on all six pages. The compact navigation remains an intentional internal scroller: its viewport is `252px`, its content is `398px`, and computed `overflow-x` is `auto`. Scrolling to the `146px` maximum placed the final GitHub link fully inside the navigation viewport from `253.60px` to `308px` without creating page overflow. The fixed footer remained `320px` wide, with all four shortcuts fitting between `16px` and `259.39px`.

## Navigation and interaction evidence

- Home, Your projects, Profile, Resume, LinkedIn, and GitHub are exposed by the labeled primary navigation on all six pages; Your projects targets `index.html#projects`.
- All four project cards reached the matching project title and contextual bottom-bar label.
- Browser back returned from Beats and Beliefs to `index.html#projects`; browser forward returned to Beats and Beliefs.
- Pointer activation opened and closed all three experience disclosures. Their native `summary` elements are in sequential DOM focus order, and the focus rendering was visually captured with a solid `3px` green outline. Native keyboard activation was not verified.
- All 12 case-study track links reached the matching section IDs across the four project pages. The final section remains visible when the document has reached its maximum scroll position.
- Every page displayed `Now viewing: <current page>` and contained no play, pause, audio, or video controls.
- At the local verification time (17:xx America/New_York), Home displayed `Good afternoon, listener.`

## Fallback, motion, and accessibility evidence

A temporary mirror of the site added `Content-Security-Policy: script-src 'none'` and was served separately for the no-JavaScript run. On Home, Profile, and Beats and Beliefs, `window.PortfolioSite` was `undefined`. Static greeting text, primary navigation, four project cards, all three native `details`, profile placeholders, case-study content, track anchors, resume, email, LinkedIn, and GitHub destinations remained present and usable. Opening a disclosure and following `#findings` were also exercised in this script-blocked browser state.

The delegated in-app browser does not expose native reduced-motion emulation. The source media query was therefore checked directly, then its exact declarations were replayed unconditionally in the temporary mirror. Computed transition and animation durations were `0.01ms`, animation iteration count was `1`, and scroll behavior was `auto`. This validates the declarations but not genuine `prefers-reduced-motion` activation, so reduced motion is not marked PASS.

The delegated in-app browser also could not dispatch a native Tab sequence while it remained background-only. Logical order was checked from the rendered DOM instead: every interactive anchor and `summary` on Home, Profile, and Beats and Beliefs had `tabIndex=0`, no interactive control had a negative tab index, and the visible `:focus-visible` treatment was inspected in the browser. This does not establish end-to-end Tab traversal or keyboard disclosure activation, so keyboard navigation is not marked PASS.

Contrast checks used declared colors against the darkest and lightest relevant gradient endpoints. The lowest normal-text ratios were `4.51:1` for profile muted text and `4.79:1` for 82%-white project description text; base text, muted base text, and accent text were all higher.

## Destinations and development placeholders

- Resume: `Anna_Kim_Resume.pdf` opened in the browser's PDF viewer.
- Email: `mailto:ak2825@cornell.edu`
- LinkedIn: `https://www.linkedin.com/in/anna-kim-598942327/`
- GitHub: `https://github.com/ak2825`
- Each project repository placeholder is an inert `span` with no `href` and remains pending Anna's URL.
- Concerts, favorite songs, and travel modules remain explicitly identified development placeholders pending Anna's selections and images.

## Playlist architecture redesign

- Date: 2026-09-04
- Automated tests: PASS — `npm test` completed with 37 passing tests and 0 failures. `git diff --check` completed with no whitespace errors.
- Routes checked: Home, Profile, Projects, Experience, Beyond the Data, and Beats and Beliefs project detail.
- Viewports checked: 1440 × 900, 390 × 844, and 320 × 700. All 18 route/viewport combinations reported `0px` document-level horizontal overflow; all five primary destinations were present. Playlist cards and disclosure rows stayed within the viewport. The 390px and 320px internal navigation scrollers reached the final Profile link without page overflow; at 320px it retained 3.92px of visible clearance at its endpoint.
- Responsive layout: library cards become one-column compact rows with 5rem covers on phones; track previews and placeholder grids stack; collection covers measure 192px or less on phone widths; and track durations plus secondary summary metadata are hidden at 320px while titles and disclosure state remain available. Neutral lettered collection covers were added as placeholders only; final cover art remains deferred.
- Interaction checks: at every requested viewport, selecting Beats and Beliefs then Froggit left exactly one disclosure open and updated the persistent player to the selected track. At maximum scroll, the final expanded project track cleared the fixed player by 64.09px (desktop), 188.06px (390px), and 187.91px (320px). Home → Projects navigation, browser Back, and browser Forward returned the expected routes.
- Accessibility checks: `.library-card`, `.recent-track`, playlist summaries, full-project links, and Profile contact links expose visible accent focus. The in-app browser focused all 12 playlist summaries and reported a solid 3px outline. Native Enter/Space activation could not be verified end-to-end because the available browser control focused the summaries but did not toggle their native `details` state; pointer selection and the static native-summary markup were verified separately. Reduced motion is LIMITED: the `prefers-reduced-motion` CSS query and its transition/animation/scroll declarations are covered by automated source checks, but this browser session did not expose a reduced-motion emulation setting.
- Defects fixed during QA: added the missing desktop grid foundation for collection heroes so the mobile collapse is effective, and added a 0.25rem compact-navigation end inset after detecting a 0.08px clip of the final destination at 320px.
