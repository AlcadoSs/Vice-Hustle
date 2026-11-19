# VICE HUSTLE — Game Design Document

**v0.1 · 2026-11-19 · Status: art bible phase**
*A fan homage to the GTA6 release. Not affiliated with Rockstar Games — original names, characters and art throughout.*

---

## 1. Pitch

**One-liner:** *Build a neon-soaked crime empire while the money is still hot.*

Vice Hustle is an idle/tycoon game about going from motel-strip nobody to kingpin of Palmetto City. The twist that separates it from every mafia idle clone: **your money is a liability.** Rackets pay fast in Dirty Cash, but every dollar raises Heat, and Heat brings raids that confiscate the cash you didn't launder. Managing the pendulum between risky dirty money and safe clean money *is* the game.

**Pillars**
1. **Money that matters** — two currencies + Heat makes passive income feel alive and risky.
2. **A living city** — every district is a painting that moves (Seedream stills + SeedDance ambient loops).
3. **Always one more score** — timed heists for active players, The Big Score prestige for the long game.

---

## 2. Fantasy & tone

You're a nobody with rented shoes and a borrowed crowbar, six blocks and one bad decision away from owning the skyline. Tone: playful 80s crime pulp — sun-rotted motels, chrome cars, pastel blazers, a radio station (WPLM 103.5, "Palm City's smoothest grooves") delivering deadpan one-liners about your crimes in the event ticker. Parody-safe humor, no real brands, no gore.

---

## 3. Core loop

**Minute-to-minute:** buy/upgrade rackets → watch Dirty Cash flow in → watch Heat climb → spend on more rackets or dump into laundering → tap the heist alert when it pulses.

**Session (5–15 min):** push toward a district unlock, re-balance heat (buy bribes, idle the hot racket), assign a lieutenant, run a heist, bank a wave of Dirty through the launderers.

**Multi-day:** prestige cycle via The Big Score, spend Respect in the Legacy tree, unlock the next Era.

```
Tap boost → Dirty Cash → buy rackets → more Dirty + more Heat
    → laundering → Clean Money → empire upgrades / districts / heat control
    → The Big Score (prestige) → Respect → Legacy tree → next Era → repeat
```

---

## 4. Currencies & meters

| Resource | Source | Spent on | At risk? |
|---|---|---|---|
| **Dirty Cash** ($D) | rackets, heists | racket purchases, cheap upgrades, bribes | **Yes — raids steal it** |
| **Clean Money** ($C) | laundering only | districts, lieutenants, premium upgrades | No |
| **Respect** | prestige (The Big Score) | Legacy tree, Era gates | No |
| **Heat** (0–100) | side-effect of income | (managed, not spent) | — |

---

## 5. Heat & raids

- `heat/s = Σ racket heat rate − decay`. Each racket's heat scales with **√owned** (stacking one racket heats sublinearly). Decay = `0.5 + 0.5 per Bent Lawyer + 2.5% of current Heat` — self-balancing, so every racket load finds an equilibrium instead of pegging instantly.
- **Tiers:** *(M3 polish: Wanted/Task-Force raids are timer-based — 45–90s at Wanted, 45s at Task Force — no longer cooldown-capped at ~26s.)*
  - **0–39 Clean Air** — nothing happens.
  - **40–69 Suspicious** — raids enabled; raid chance `(heat−40)/2500 per second` → expected every ~1.5–3 min near the top of the band.
  - **70–99 Wanted** — raid every 45–90s, steals 20–40% of current Dirty Cash and locks 1 random racket for 60s.
  - **100 Task Force** — raids every 30s **and** all income −25% until Heat < 50.
- **Raid feedback:** red/blue screen wash, siren stab, 2s SeedDance raid sting, stolen amount ticker.
- **Mitigations:** bribes (consumable, −20 Heat), bent lawyer upgrades (+decay), police scanner (30s raid warning), "low-heat by design" rackets in each district.
- **Offline rule:** Heat freezes offline, no raids offline — "your lawyer answered the phone."

**Design intent:** time-to-first-raid at a full District-1 build ≈ 4 minutes. That raid is the tutorial for laundering.

---

## 6. Laundering

- Each district has one **front** (laundering business): converts Dirty → Clean at rate `L` while Dirty > 0. Capacity upgrades on a ×1.12 cost curve.
- **Conversion fee:** 0% early; an "IRS tick" of 5–10% appears at higher tiers so Clean stays premium.
- **The pendulum is the game:** early on `L` is tiny → Dirty is king, risk-on. Late in each district most income is Clean → risk-off, until the next district's hotter rackets restart the swing.

---

## 7. Rackets

**Global rules**
- Cost: `base × 1.15^owned`. Buy ×1 / ×10 / max.
- Income: `base × owned × milestone mult` (×2 @ 25, ×4 @ 50, ×10 @ 100, ×100 @ 500).
- Next racket unlocks when previous reaches 10 owned or a total-spend threshold.

**District 1 — Motel Strip (exact launch numbers)**

| Racket | Base cost | Income/s | Heat/s |
|---|---|---|---|
| Boosting Cars | $50 | $1 | 0.05 |
| Petty Scams | $600 | $8 | 0.15 |
| Cigarette Boat Runs | $7,200 | $70 | 0.40 |
| Fenced Electronics | $87,000 | $600 | 1.20 |
| Palm Court Motel *(front)* | $600,000 | Launder L +10/s | 0 |

**District scaling:** per district tier — costs ×~14, income ×~12, heat ×~8.

**Roster D2–D6** — implemented in M2 (source of truth: `RACKETS` in `game.js`; costs continue the ×~11.6/tier curve, heat bases taper to ×~2/district so equilibria stay in the Suspicious–Wanted band):
- **D2 Neon Beach:** beach parking racket, arcade skimming, "companionship" services, steroid imports, boardwalk kiosks *(front)*.
- **D3 Downtown:** protection racket, underground casino, high-end car theft, chop shop 2.0, bail bonds "front" *(front)*.
- **D4 Docks:** container "misplacement", dockworkers union, smuggling tunnels, yacht charters, fish market front *(front)*.
- **D5 Swamp Glades:** moonshine stills, buried cargo pickup, exotic animal trade, swamp gambling den, gator farm tourism *(front)*.
- **D6 Star Island:** rap label, crypto exchange, nightclub empire, art gallery front *(front)*, **Private Security Firm** (endgame, global −30% Heat).

---

## 8. Districts

| # | District | Unlock (Clean) | Theme | Role |
|---|---|---|---|---|
| 1 | Motel Strip | free | seedy dusk neon, thunderstorm brewing | tutorial + first raid lesson |
| 2 | Neon Beach | $150K | sunset beach, arcades, synthwave sun | first "wow" loop change |
| 3 | Downtown | $4M | night skyline, rooftop helipad | money gets serious |
| 4 | Docks | $120M | cranes, containers, fog | industrial heat |
| 5 | Swamp Glades | $4B | airboats, fireflies, murky green | eerie detour |
| 6 | Star Island | $150B | causeway, mansion, yacht, fireworks | endgame glow-up |

Each unlock: full-bleed background swap (SeedDance loop w/ Seedream poster fallback), UI accent recolor, new radio jingle, 2 new heists.

---

## 9. Lieutenants (hires)

| Name | Role | Unlock | Effect |
|---|---|---|---|
| Ray "Chrome" Delgado | Wheelman | first heist | heist interaction timer +25% |
| Miss Betty | Launder Queen | Motel ×25 owned | laundering speed +25% |
| DJ KRM | 103.5 FM host | unlock D2 | Heat decay +0.5/s |
| "Suit" Sal Marchetti | Fixer | survive first raid | first raid each hour refunds 50% |
| Capitana Rosa | Dock Boss | unlock D4 | Docks rackets +50% |
| Dr. Ana Peligro | Wildlife "vet" | unlock D5 | exotic trade rackets +40% |
| Tangerine Dream | Art forger | unlock D6 | conversion fee −5% |
| The Ghost | Legend | 500 Respect (permanent) | raids never lock rackets |

---

## 10. Heists (active layer)

- **Cadence:** every 20 min of active play; offline queues up to 2. *(M1 prototype tuning: first at 3 min, then every 5 min, so the loop is testable in one sitting.)*
- **Flow:** pulsing alert → pick 1 of 3 risk/reward cards → 30s interaction → payout.
- **Interaction types:** **Drill** (rhythm taps on a safe), **Boost** (steer/dodge dragnet), **Con** (memory pick — which briefcase).
- **Reward:** instant Dirty = 90s of current income × risk mult (×2 easy / ×4 medium / ×8 hard) + 60s Frenzy (×2 all income). **Fail:** +25 Heat, no cash.
- **Cinematic carrot:** first clear of each heist type unlocks its SeedDance payoff cinematic, replayable in **The Vault**.
- 12 heist types total (2 per district), e.g. Jewelry Smash & Grab, Gallery Swap, Casino Cage, Container Run, Gator Pit Drop, Mansion Safe.

---

## 11. Prestige — The Big Score

- **Available** after first D3 unlock. Confirm flow: sunset-drive cinematic → reset.
- **Respect earned:** `floor(√(total Clean earned / 10,000))` (tuning target).
- **Resets:** Dirty, Clean, rackets, districts, Heat. **Keeps:** lieutenants, Vault cinematics, Legacy tree, Era.
- **Legacy tree (Respect):** Empire (+25%/pt income) · Laundromats (+15%/pt launder) · Whisper (−8%/pt heat) · Kickstart (start with $ per pt) · Era gates.

---

## 12. Eras

| Era | Setting | Unlock | Effect |
|---|---|---|---|
| I — "1986" | retro neon (launch art) | default | — |
| II — "Present Day" | sunny modern Florida | **100 Respect (spend) — LIVE in M3 polish** | ×5 income, full art reskin (`art/era2/`), video loops off (Ken Burns stills) |
| III — "2049" | synth-future chrome | 400 Respect (teaser) | ×25 income, full art reskin (next milestone) |

Same mechanics each era; era-specific heist remixes. Era II art: modern sunny Florida — glossy painterly posters, turquoise/coral palette, humid golden light.

---

## 13. Balance targets

- Session length 7–12 min; prestige cycle 2–4 days early → 6–8h once optimized.
- Dirty:Clean income ratio curve: 90:10 (D1) → 40:60 (D3) → 15:85 (D6).
- The player should experience **1 raid they'll remember** in the first 30 minutes, and never a raid that feels like a wipe (max loss 40% of Dirty only).

---

## 14. UI/UX

**Screens:** Title (video loop + logo + Continue/New Game) · Main · Heist · The Vault · Legacy · Lieutenants · Settings · Raid overlay.

**Main layout** (desktop 16:9 first, mobile stacks to vertical):
- Background: full-bleed district loop.
- Top-left: wanted stars + Heat bar.
- Top-center: radio ticker (flavor one-liners).
- Right panel (~40%): racket cards (icon, owned, income/s, buy ×1/×10/max).
- Bottom: LED ledger strip — Dirty / Clean / income/s / launder/s.
- Left edge: district map strip.
- Bottom-right: pulsing HEIST button.

**Accessibility:** reduced-motion mode swaps loops for stills; Heat bar has pattern + color; videos always muted with poster fallback.

---

## 15. Art & asset pipeline

- **Seedream (stills):** key art, 6 district backdrops, 30 racket icons, 8 lieutenant portraits, era UI skins, prestige illustration.
- **SeedDance (motion):** title loop, 6 district ambient loops (4–6s, webm ≤1.5MB each), 12 heist cinematics (6–10s, 720p), raid sting (2s), prestige sunset-drive cinematic.
- Full style rules, palette tokens and prompt templates: **[ART_BIBLE.md](ART_BIBLE.md)**.
- Perf rule: only the active district's loop plays; all others swap to their still.

## 16. Audio — WPLM Radio Network (implemented M3)

Six **procedural synthwave stations** (one per district), synthesized live via Web Audio in `radio.js` — zero audio files. Station switcher widget bottom-left; districts auto-tune their station; station + mute persist. SFX suite: raid siren, buy cha-ching, heist win fanfare / bust sting, UI ticks — all synthesized. Audio starts on the first user interaction (autoplay policy).

**M3 additions:**
- **The Queens of Palmetto City** — 6 companions with portrait art, unlock conditions (districts, race wins, first prestige) and wired buffs: Solana (bribes half price), Camille (heist takes +25%), Roxy (street race ×2), Yara (gator race ×2), Destiny (frenzies 2× duration), Vivienne (offline +50%). **Night on the Town**: spend dirty → 60s Inspired ×2 income, 10-min cooldown, flavor line per queen.
- **Side Hustles** — Street Races (5-gear shift timing, ×2.2), Gator Races (4 gators, ×1.9–×8 odds), Scratch Cards (3×3, ×2.5/×10/×50).
- **Milestones** — 16 achievements tracked in the Legacy panel.

## 17. Tech

Vanilla JS + DOM (no build step), localStorage save + export/import string, all assets local. Target: runs from a folder or any static host.

## 18. Homage & legal

Original title, city, characters and art. No Rockstar trademarks, logos, names or assets. The reference is the 80s Miami crime *genre*, not GTA content. Splash line: *"A fan homage. Not affiliated with Rockstar Games."*

## 19. Roadmap

- **M1 — Playtest prototype:** ✅ done 2026-11-19.
- **M2 — Vertical slice:** ✅ done 2026-11-19 — all 6 districts (full Seedream set: 30 icons, 8 portraits, 6 backdrops, prestige art), 12 heists across 3 minigames (Drill/Boost/Con) with first-clear Vault cinematics, The Big Score prestige + 4-track Legacy tree, 8 lieutenants, 6 district loops + 3 heist cinematics + title loop (SeedDance).
- **M3 — Polish:** ✅ core delivered 2026-11-19 — WPLM radio (6 procedural stations + SFX), The Queens (6 companions + Night on the Town), Side Hustles (street/gator races, scratch cards), 16 milestones. *Remaining:* balance pass, Era II art, remaining 9 heist cinematics, raid sting video.
