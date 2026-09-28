# Beyond the Data Content Design

## Purpose

Turn the existing Beyond the Data playlist from a mostly placeholder page into a personal, recruiter-friendly view of Anna's interests. The page should feel casual and specific without becoming overly long or competing with the professional portfolio sections.

## Approved structure

Keep the existing four expandable personal albums and their order:

1. Music, made by me
2. Live Favorites
3. Passport Pages
4. At My Table

The closed rows remain compact and consistent with the Projects and Experience playlists. Each expanded album uses the presentation that best fits its content rather than forcing every album into the same internal layout.

## Album content

### Music, made by me

- Keep a short, clearly editable placeholder for Anna's music background. Anna will write the final story later.
- Replace the inactive link text with two functional external-link buttons:
  - Instagram Covers: `https://www.instagram.com/theoannakim/`
  - YouTube Project: `https://youtu.be/2ogZGOtEnNs?si=xf0BOJmPk3NRJ9VX`
- External links open in a new tab and use safe `rel` attributes.
- The buttons should be visually clear but quieter than the portfolio's primary navigation.

### Live Favorites

Show a ranked list with a casual, personal voice.

1. **Olivia Dean — The Art of Loving Tour**  
   August 14, 2026 · Madison Square Garden  
   Use a casual description in Anna's voice: “She interacted with the audience so much and made everyone feel really present, even in MSG. She connected with the crowd so well, and I loved all the jazz influences in her arrangements.”
2. **grentperez — Backflips in a Restaurant**  
   May 17, 2025 · Terminal 5, Manhattan  
   Use Anna's phrasing: “He was one of my first favorite artists in high school. His voice is perfection live, and I loved being able to sing every song from muscle memory.”
3. **Head in the Clouds**  
   May 20, 2023 · Forest Hills Stadium  
   Use a casual description in Anna's voice: “A lot of the Asian artists I listened to in high school performed that day. It also started pouring at Forest Hills Stadium, which made the whole experience especially memorable.”

The ranking numbers, event metadata, and descriptions should form a clear hierarchy without introducing concert imagery that has not been selected.

### Passport Pages

- Build an asymmetric five-slot photo gallery.
- Use the existing Porto river photograph as the featured image.
- Add four intentional placeholders for future travel photographs.
- Placeholder tiles should read as reserved photo slots, not broken or missing images.
- Preserve the closing line about more places to come during Anna's spring semester studying abroad in Europe.
- On narrow screens, collapse the gallery into a single-column sequence with the featured image first.

### At My Table

Show a ranked restaurant list in the same casual, personal voice as Live Favorites.

1. **Okdongsik** — New York City

   Use Anna's wording: “Perfect meal for a cold NYC day. The Manhattan spot is better than the Bayside one.”
2. **Daesun Korean Noodle** — Northern Boulevard, New York

   Use Anna's wording: “They have the best Korean seafood pancakes. Best on Northern Blvd.”
3. **Tapabento S. Bento** — Porto, Portugal

   Use Anna's wording: “My favorite meal from Portugal. Shoutout the cataplana and razor clams.”

## Visual direction

Use a hybrid layout inside the existing Spotify-inspired shell:

- Album rows retain the shared playlist styling.
- Music uses a short editorial introduction and link actions.
- Concerts use a compact ranked list.
- Travel is photo-forward, with one featured image and four restrained placeholders.
- Restaurants use the same compact ranked-list language as concerts.

The expanded content should use the site's existing near-black surfaces, muted text, green interaction accent, spacing scale, and rounded corners. New styling should be specific to content hierarchy and avoid decorative cards that do not communicate structure.

## Interaction and accessibility

- Keep native `details` and `summary` behavior for expandable albums.
- Preserve keyboard focus styles and the existing one-album-open behavior.
- Give the Porto image descriptive alternative text.
- Future-photo placeholders are decorative and should not be announced as real photographs.
- External-link labels state the destination clearly.
- Ensure the gallery and link row remain usable on mobile.

## Verification

- Automated tests confirm both external URLs, safe external-link attributes, the three ranked concert entries, the five-slot travel gallery, the existing Porto asset, and four photo placeholders.
- Existing navigation, player, responsive, and accessibility tests continue to pass.
- A browser preview is reviewed at desktop size after implementation.

## Out of scope

- Writing Anna's final music-background story.
- Choosing or adding the four future travel photographs.
- Adding new concert photographs or external concert links.
