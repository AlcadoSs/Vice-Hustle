# VICE HUSTLE — Art Bible v0.1 · Era I "1986"

Style guide for all Seedream (still) and SeedDance (motion) generation. One sentence: **airbrushed 80s Miami crime poster — neon, grain, chrome.**

---

## 1. North star & references

Moodboard anchors: GTA Vice City cover art (palette + airbrush), *Miami Vice* (wardrobe, backlight), outrun/synthwave posters (banded sun, grid), *Far Cry Blood Dragon* (CRT glow), *Kung Fury* (playful pulp).

Every asset must feel like it could hang in a video store window in 1986.

## 2. Palette (locked tokens)

| Token | Hex | Usage | Share |
|---|---|---|---|
| `hot-pink` | `#FF2E88` | primary neon, accents, UI fills | 20% |
| `sunset-orange` | `#FF6A3D` | sun, sky gradient, warmth | 15% |
| `teal` | `#16E0BD` | secondary neon, water, shadow light | 15% |
| `chrome-cyan` | `#58F7FF` | chrome highlights, glass | 10% |
| `gold` | `#FFC94A` | Clean Money, premium, wanted stars | 10% |
| `deep-purple` | `#1A0B2E` | sky base, backgrounds | 20% |
| `asphalt` | `#14101C` | ground, UI base | 10% |

**Rules:** every asset uses ≥4 tokens · sky is always `deep-purple → sunset-orange` · a scene's dominant neon is either pink *or* teal, never equal parts · gold only where wealth is the subject.

## 3. Light & texture

- Backlit subjects, long shadows, halation bloom around every neon source.
- Film grain 8–12% on everything; CRT scanlines (4%) on UI only.
- Banded synthwave sun allowed in skies, never in UI.

## 4. Composition

Scenes 16:9, low horizon (bottom third), center sun or sign, foreground silhouettes (palms, struts, fences) framing the subject. **Wealth arc across districts:** grime (D1) → glow (D2–D3) → gold (D6).

## 5. Subjects

- **Characters:** airbrushed poster style, never photoreal. Pastel blazers with rolled sleeves, tank tops, gold chains, aviators. Faces half-lit or in shadow. Confident, weight-shifted poses.
- **Vehicles:** chrome-finned classics, wedge supercars, cigarette boats. Wet-paint reflections mandatory.
- **Props:** CRT TVs, boomboxes, arcade cabinets, car phones, briefcases.

## 6. Icon spec (rackets/upgrades)

Square 1:1 · single object on `deep-purple` · 3/4 view · thick pink + teal rim light · readable at 64px · no text ever.

## 7. UI skin

Chrome bezels on cards, `hot-pink` LED numerals, `teal` progress fills, `gold` wanted stars, `asphalt` base, optional leather-grain panel texture, 4% scanlines.

## 8. Typography (web)

Display/logo: **Righteous** · LED numerals: **VT323** · body: **Rubik**. (All Google Fonts.)

## 9. Motion spec (SeedDance)

- **Ambient loops:** 4–6s · locked camera or very slow dolly · only loop-safe motion (waves, sign flicker, light streaks, palm sway, steam) · no cuts · no subject enters/exits frame · no people, no text.
- **Heist cinematics:** 6–10s · three beats (setup → action → payoff) · end on a hold frame the UI can take over from.
- **Raid sting:** 2s red/blue light wash, fast.
- All video generated from the winning Seedream still as reference/first frame for palette consistency.

## 10. Prompt templates

**Scene:**
```
{subject action}, {location}, 1980s retro neon Miami crime aesthetic,
airbrushed 80s movie poster illustration, deep purple sky fading to sunset
orange, hot pink and teal neon with halation glow, chrome cyan highlights,
film grain, low horizon, backlit silhouettes, no text, no logos
```

**Icon:**
```
single {object}, 3/4 view, thick neon pink and teal rim light, deep purple
background, 80s airbrush style, centered, bold readable silhouette, no text
```

**Portrait:**
```
80s airbrush poster portrait of {character}, {wardrobe}, half-lit face,
neon pink and teal backlight, film grain, dark background, confident pose, no text
```

**Video loop:**
```
seamless ambient loop, {scene}, locked camera / very slow dolly, only
{loop-safe motions}, 1980s retro neon palette, halation, film grain,
no people, no text, no cuts
```

## 11. Asset manifest — M2 complete (all generated)

| File | Type | Status |
|---|---|---|
| `art/keyart/vice-hustle-keyart.jpg` | title/cover | ✅ QA pass |
| `art/keyart/prestige.jpg` | The Big Score illustration | ✅ |
| `art/districts/d1…d6-*.jpg` | 6 backdrops | ✅ |
| `art/icons/*.jpg` | 30 racket icons | ✅ in-game, verified rendering |
| `art/portraits/*.jpg` | 8 lieutenant portraits | ✅ |
| `art/queens/*.jpg` | 6 Queen portraits (M3) | ✅ |
| `art/ui/ui-mockup-main.jpg` | UI mock (style ref only) | ✅ |
| `videos/title-loop.mp4` + `d1…d6-loop.mp4` | 7 ambient loops | ✅ |
| `videos/heist-casino/container/gallery.mp4` | 3 first-clear cinematics | ✅ |

**Generation notes:** SeedDance rejects the word "crime" in prompts (moderation error 3703) — reword instead. The image service occasionally 500s in parallel bursts; retry in smaller batches. Generator saves everything as `.jpg` regardless of requested extension. In-game, district videos fade in only on the `playing` event with the painted still always underneath (autoplay-gated environments fall back cleanly).

**Era II style (added M3 polish):** modern sunny Florida — glossy painterly posters, turquoise/coral/gold palette, humid golden light, bright skies replace neon night. Assets in `art/era2/d1..d6.jpg` (6 backdrops ✅). Era II runs painted stills with Ken Burns only (no video loops).

**M3 polish manifest:** `art/era2/*.jpg` (6) ✅ · `videos/heist-{grab,motel,vault,board,cage,tower,run,customs,still,drop,safe,gallery}.mp4` (12 cinematics — all ✅) · `videos/raid-sting.mp4` ✅.

**M4 candidates:** Era III art (synth-future), era-specific radio stations, era UI skins.

**Full M2 manifest (later):** d4/d5 backdrops · 30 racket icons · 8 lieutenant portraits · 6 district loops · 12 heist cinematics · raid sting · prestige cinematic.

## 12. QA log (vision-pass verdicts)

- **Key art — PASS.** Genre-perfect synthwave triad (magenta/cyan/orange), strong focal hierarchy, left-center clear for the logo drop. Notes: clasped hands slightly mushy (fine at title-screen scale); ambiguous neon "A" glyph on the motel sign — keep, reads as a monogram; bottom-left road is dark, mind menu-text contrast there.
- **UI mock — PASS as style reference, NOT as layout spec.** Palette, chrome bezels, neon icon frames, LED counters and background all excellent and reproducible. Card labels are AI glyph soup; real HUD gets built in HTML wearing this skin. Multiplier cluster cramped; cards lack buy affordances — fix in the real UI.

## 13. Consistency checklist

- [ ] ≥4 palette tokens present, sky rule respected
- [ ] grain present, halation on neon
- [ ] no text/logos in art
- [ ] horizon low (scenes), rim light thick (icons)
- [ ] generated 2 variants, kept the better, winning prompt copied into the manifest
