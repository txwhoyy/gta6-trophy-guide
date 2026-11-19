# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/txwhoyy/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/txwhoyy/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — a trophy guide and tracker for Grand Theft Auto VI on PlayStation 5, covering the complete official list of 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden).

Every trophy gets a real guide written for this app from its official description: what to do, where to do it, and when timing matters. Four trophies are flagged **potentially missable**, with the reasoning shown on the card — a specific airport moment, an early-game cocktail, and two hidden trophies built on choices and retries. Where a hidden trophy's description is deliberately cryptic, the guide says so and stays honest instead of inventing "confirmed" steps.

What the app does:

- **Checklist for all 55 trophies** — tick them off and progress is saved in your browser automatically.
- **A platinum roadmap** — five ordered phases built from the official descriptions, from "play the story, catch the moments" to the 100% completion sweep, each with its own live progress.
- **Filters by tier and by kind** — story, missable, collectibles, activities, online/co-op — plus a text search and a hide-earned toggle.
- **A spoiler shield** — unearned story trophies show as "Hidden story trophy" with their descriptions and guides blurred until you earn them (or switch the shield off).
- **Progress everywhere** — an overall completion ring, per-tier counts, and per-category progress bars, plus a warning while any missable trophy is still unearned.
- **Export / import** — download your progress as JSON and bring it back on another browser or device.
- **Fully offline, zero dependencies** — plain HTML, CSS and JavaScript written by hand for this guide; no build step, no network calls, no trackers. The neon sunset look is pure CSS: no game artwork, logos, fonts or screenshots.

Trophy names, tiers and descriptions are the official PS5 list as published by Exophase and PSNProfiles (frozen 2026-11-18); the guides and the app are original. Unofficial and fan-made — not affiliated with Rockstar Games or Take-Two Interactive.

## Run it

Start the tiny built-in server and open the guide in any desktop browser:

```sh
node serve.ts
```

then visit http://localhost:8080 (pass `--port <n>` to `serve.ts` for a different port). Or skip the server entirely and open `app/index.html` straight from disk — the guide, the tracker and your saved progress all work without a network connection.

---

<sub>Entered on [make.fun](https://make.fun/?ref=1paa8b6t&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
