# VICE HUSTLE — Balance Report (M3 pass, 2026-11-19)

**Tool:** `sim/balance.js` — 24h active-play simulator. Extracts `RACKETS`/`DISTRICTS` live from `game.js` via `vm` (numbers can't drift), mirrors the exact economy math (×1.15 cost curve, milestones, √n heat, 2.5%-of-heat decay, raid tiers, laundering, auto-hire lieutenants/queens, heists, side hustles), and races four playstyles at 1s steps. Run: `node sim/balance.js`.

## Exploits found & fixed

| Issue | Before | After |
|---|---|---|
| **Scratch cards were a money printer** | 6 symbols, 3-match paid → EV **×7.03** per card | 8 symbols, 4-match ×2.5 / 5+ ×30 → EV **×0.93** (P(4)=12.6%, P(5+)=2.0%) |
| **Street races had no cooldown** | stake=120s income, ×2.2, instant re-entry → race-spam tripled income | stake=60s income, ×2.0, **60s cooldown** → ≈ +10%/s income for skilled active play (Roxy ×2 → +20%) |
| **Gator longshot was +EV** | odds ×8 at exponent .6 → Noodle EV ×1.165 | odds ×1.8/2.6/4.2/7 at exponent **.65** → EV .66/.74/.86/**1.02** — favorites are house edge, Noodle is break-even lottery. Yara trimmed ×2 → **×1.5** |
| **D1 first-front wall** | Palm Court Motel $1M — thin bank vs early raids | **$600K** (escape hatch ~40% sooner; still the "one raid you'll remember") |

## Playstyle results (post-tune, 24h active)

| Strategy | Outcome |
|---|---|
| **GRINDER** (fronts + bribes + heists + hustles) — reference | D2 @ **95min**, D3 @ **4.8h**, D4 @ **5.6h**, D5 @ **9.5h**; D6 ≈ 1.5–2 active days. End income $2.1B/s, laundering $464K/s. Heists ≈ **+20–25% of total production** (right for the flagship active feature). Races ≈ modest trickle; scratch ≈ −7% house edge as designed. Heat pegs at 100 in late D4+ — authentic endgame pressure pushing prestige (Whisper + Security + lean builds counter it). |
| **GREEDY** (no fronts ever) | **Hard dead-end at D1 by design** — district unlocks cost Clean, Clean only comes from fronts. $22.5K/s ceiling, raids every ~27s eat everything. Documented as the trap playstyle; intended. |
| **BALANCED / LAUNDERER (sim bots)** | Bot policies never deliberately bank, so they stall in D1 in the sim — **a policy limitation, not a game wall**: a human stacking tv×10 (~$6K/s) banks the $600K motel in ~5–10min even through raid bleed. Their profiles still show the intended early-game tension (Suspicious band + bribe economy). |

## GDD target check
- Prestige cadence target 2–4 days (early): D3 (prestige gate) at ~5h active / ~1 idle day ✓; D6 ≈ 2 active days ✓.
- Dirty:Clean ratio swings pendulum-style per district ✓ (GRINDER late-game clean share ≈ 60%+).
- Task Force = late-district reality, not a bug: full-stack heat ≈ 2,000/s vs max decay ~5/s. Relief stack: Whisper ×0.66, Security ×0.7, lean builds, prestige.

## Next levers (if needed after live playtests)
1. Heist share of income (currently +20–25%) — if it overshadows idling, raise cadence to 10min in later districts.
2. D4–D6 unlock costs ($120M/$4B/$150B) held fine vs GRINDER pacing; revisit only if idle-only players report a wall.
3. Raid sting at heat 100 every ~30s is intense — candidate: 45s at Task Force.

*Sim limitations: bots can't bank deliberately; race model assumes 55% win rate (decent player); gator races not simulated (EV computed analytically); offline progress not modeled (active-play sims).*
