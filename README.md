# 🌴 VICE HUSTLE

<p align="center">
  <img src="art/keyart/vice-hustle-keyart.jpg" alt="Vice Hustle key art" width="860">
</p>

<p align="center">
  <em>Build a neon-soaked empire while the money is still hot.</em>
</p>

<p align="center">
  <a href="https://alcadoss.github.io/Vice-Hustle/"><strong>▶ PLAY NOW</strong></a> — hosted on GitHub Pages, no install
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-JavaScript-f06292?style=flat-square" alt="HTML5 + JS">
  <img src="https://img.shields.io/badge/audio-Web%20Audio%20API-16e0bd?style=flat-square" alt="Web Audio">
  <img src="https://img.shields.io/badge/art-Seedream%20(AI)-ff2e88?style=flat-square" alt="Seedream">
  <img src="https://img.shields.io/badge/motion-SeedDance%20(AI)-58f7ff?style=flat-square" alt="SeedDance">
  <img src="https://img.shields.io/badge/build-none-ffc94a?style=flat-square" alt="No build step">
</p>

---

**Vice Hustle** is a fan-made idle/tycoon game — an homage to the GTA VI hype and the 80s Miami-crime genre it resurrects. Start as a nobody with a borrowed Slim Jim on a seedy motel strip, and end up owning Star Island. The twist: **your money is a liability.** Rackets pay fast in *Dirty Cash*, but every dollar raises *Heat*, and Heat brings raids that confiscate everything you didn't launder.

Built as a no-framework, no-build, single-tab web game. All 121 illustrations are AI-generated with **Seedream**, all 20 videos (living district backgrounds, heist cinematics) with **SeedDance**, and the entire soundtrack is **synthesized live in your browser** with the Web Audio API — no audio files, eighteen procedural radio stations across three eras.

## 🕹️ Play

No install, no build:

```
open index.html          # or double-click it — that's the whole game
```

or serve it (recommended, for video autoplay policies):

```
python -m http.server 8123
# → http://localhost:8123
```

…or just play the hosted build: **https://alcadoss.github.io/Vice-Hustle/**

## 🎯 The core loop

```
run rackets ──▶ DIRTY CASH ──▶ buy more rackets
                   │                │
                   │           raises HEAT ──▶ RAIDS steal your dirty cash
                   │                │
                   └──▶ LAUNDER (fronts) ──▶ CLEAN MONEY
                                                │
                          districts · crew · upgrades ◀─┘
                                                │
                             THE BIG SCORE (prestige) ──▶ RESPECT ──▶ LEGACY ──▶ ERA II ──▶ ERA III
```

- **Dirty Cash** — fast, spendable, *raidable*. **Clean Money** — laundered, safe, buys the empire.
- **Heat 0–100** with four tiers; at 100 a Task Force taxes your income 25% until you cool off. Bribes, bent lawyers, and leaning on the right people help.
- **The Big Score** — cash the whole empire out, retire to the Keys, come back with permanent Legacy multipliers and eventually change the decade itself. Twice.

## ✨ What's inside

| | |
|---|---|
| 📱 **The Vice Phone** | The whole game menu lives in a slide-in chrome phone — ten apps with live badges, a TODAY challenge strip, and a synthwave radio dock |
| 🗺️ **6 districts** | Motel Strip → Neon Beach → Downtown → The Docks → Swamp Glades → Star Island, each with 5 rackets and a living AI-animated backdrop — under rolling weather: neon rain, thunderstorms and heatwaves with real gameplay bite |
| 📻 **THE KRM TAPES** | A five-chapter radio-drama campaign — DJ KRM's rise from pirate van to the voice of the city — a new tape with every district, replayable in the Vault, finishing with an exclusive ride |
| 🎬 **12 heist scores** | Three hand-played minigames — crack the **Vault Dial** (timing), survive the **Getaway Chase** (driving), track the **Card Table** (memory, with dealer-style arc shuffles) — each with an intro card and a first-clear cinematic in The Vault |
| 🎲 **Side hustles** | **Night Drag** (drag racing on a tach and a prayer), **Highway Run** (endless traffic dodge in YOUR car), **Swamp Track** (bet on Noodle the gator), **The Ticket** (a real canvas scratch-off) |
| 🚗 **The Garage** | 15 collectible rides won from races, streaks, casinos, heists and the story itself — pick one and it becomes your sprite on the strip, the highway and every getaway |
| 🂡 **The Casino** | Blackjack at Camille's table — dealer stands on 17, blackjack pays 3:2, and hiring Camille improves the odds |
| 👑 **The Queens** | Six companions with painted portraits, unlock conditions and real gameplay perks — take one for a *Night on the Town* and she'll text you about it |
| 💬 **PULSE** | A live message feed from the Queens and the crew — ~200 lines of praise, warnings and trash talk, 24 candid photos (four per Queen, one consistent face each), and reply-right texts that grant temp buffs |
| 🧑‍🤝‍🧑 **8 lieutenants** | Auto-hired at milestones, from a bent lawyer to The Ghost — deploy them (and the Queens) to districts for income bonuses |
| 📻 **Radio, three eras deep** | Every era gets its own six-station dial — 1986 synthwave, *Present Day* glass-smooth, **2049** chrome-edged — all synthesized live with Web Audio, plus sirens, cha-chings and fanfares |
| ⚡ **Random events** | Police crackdowns, tourist seasons and payday rushes roll in on DJ KRM's broadcast — heat spikes and income surges you can see coming |
| 📅 **Daily challenges** | Three dated tasks a day on the phone's TODAY strip, paying bonus Respect |
| 🎼 **3 eras** | 1986 neon → *Present Day* (×5 income, sunny-Florida reskin, 100 RP) → **2049** (×25 income, full chrome-city reskin, 400 RP) |
| 🛠️ **Polish** | Neon-styled tooltips everywhere explain every perk, milestone and daily; a STILLS ONLY mode for battery-friendly play; every minigame animation runs on compositor CSS so throttled tabs can't break it |
| ⚖️ **Balance-tested** | Headless simulators (`sim/balance.js`, `sim/heist-interval.js`) race playstyles against the live game math — see `docs/BALANCE.md` |

## 🖼️ The city

| Motel Strip | Neon Beach | Downtown |
|---|---|---|
| ![](art/districts/d1-motel-strip.jpg) | ![](art/districts/d2-neon-beach.jpg) | ![](art/districts/d3-downtown.jpg) |

| The Docks | Swamp Glades | Star Island |
|---|---|---|
| ![](art/districts/d4-docks.jpg) | ![](art/districts/d5-swamp.jpg) | ![](art/districts/d6-star-island.jpg) |

*Era II reskins all six in modern daylight, Era III in 2049 chrome — earn them.*

## 🗂️ Project structure

```
index.html · game.css · game.js    the game (no build step)
radio.js                           18 procedural stations (3 eras × 6) + SFX
sim/balance.js                     24h playstyle balance simulator
sim/heist-interval.js              heist-cadence economy A/B
prototypes/                        standalone UI prototypes (Vice Phone)
docs/GDD.md                        full game design document
docs/ART_BIBLE.md                  style guide + prompt library
docs/BALANCE.md                    balance findings & tuning log
art/                               121 Seedream illustrations
videos/                            20 SeedDance loops & cinematics
saves/endgame.json                 god-mode test save (Settings → Import)
```

## 🎨 Asset pipeline

Every still was generated with **Seedream** using a locked palette and prompt templates from the [art bible](docs/ART_BIBLE.md); every ambient loop and cinematic with **SeedDance**, generated *from* the district stills for palette continuity. District videos fade in only once actually playing, with the painted still always underneath — so the game looks right even where autoplay is blocked.

## ⚠️ Disclaimer

Vice Hustle is a **fan homage** and is **not affiliated with, endorsed by, or connected to Rockstar Games or Take-Two Interactive**. All names, characters, places and art are original. Please don't sue — we're just leaning on a car in front of a motel.

---

*Palmetto City, 1986. The neon's on. The cops are counting.*
