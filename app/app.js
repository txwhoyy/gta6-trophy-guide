// Leonida Legend — GTA VI trophy guide & tracker.
// Hand-written, dependency-free, fully offline. Progress lives in
// localStorage; the trophy data (with a guide for each of the 55) is
// app/data/trophies.json, fetched relative to this file.

const STORE_KEY = 'leonida-legend-progress-v1';
const SPOILER_KEY = 'leonida-legend-spoiler-shield';

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online / co-op',
};

// The platinum roadmap: ordered phases built from the official trophy
// descriptions. `ids` are trophy ids from data/trophies.json.
const ROADMAP = [
  {
    title: 'Phase 1 — Play the story, catch the moments',
    text: 'Run the campaign from Gone Fishing to the final mission. Story trophies cannot be missed, but three description-flagged trophies belong to moments that pass: make the unscheduled VCIA departure when the airport mission puts you there, take the Ocean Beach cocktail early, and engage with choices whenever the game offers them.',
    ids: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 37, 44, 48],
  },
  {
    title: 'Phase 2 — Finish the finale and the stranger strands',
    text: 'Complete the final mission for the gold, then close out every stranger strand — Andy, Kenton, Billy, Randy and Tyrone each have their own trophy, and any 8 finished strands earn the silver. Bret\u2019s unique-animal hunt belongs to this phase too.',
    ids: [7, 22, 23, 24, 25, 26, 27, 29],
  },
  {
    title: 'Phase 3 — Sample everything, then master the activities',
    text: 'Try each of the 9 activity types once, then work the mastery list: gold in all 42 Shooting Range challenges, a Top Fun drone-race win at all 14 locations, 20 different race wins, Cal beaten at fishing, one arcade game finished, and 50 challenges completed along the way.',
    ids: [16, 17, 18, 19, 20, 21, 32],
  },
  {
    title: 'Phase 4 — Crime, cash and the open world',
    text: 'The free-roam grind: robberies (jewelry store undetected, 5 bank vaults, an armored truck, one illegal operation per gang), partner heat trophies, 250 stunts, the Combat Focus five-for-one, $250,000 laundered, $100,000 spent and all 8 garages bought.',
    ids: [15, 33, 34, 36, 39, 40, 41, 43, 51, 52, 53, 54],
  },
  {
    title: 'Phase 5 — The Leonida sweep and 100%',
    text: 'Explore all 52 areas while collecting the rest: 18 meditation spots, 100 WAiNK locations, 3 full card sets, 100 vehicles discovered and 10 registered on Scooter Bros. When the tracker reads 100%, the gold for A Long Road lands — and with it, the platinum.',
    ids: [1, 14, 28, 30, 31, 35, 38, 42, 45, 46, 47, 49, 50, 55],
  },
];

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');

let doc;
let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]'));
} catch { earned = new Set(); }

const state = {
  tier: 'all',
  kind: 'all',
  query: '',
  spoiler: localStorage.getItem(SPOILER_KEY) !== 'off',
  hideEarned: false,
};

// Screenshots/repro links can deep-link a view: ?grade=silver, ?kind=story,
// ?scroll=1400 (the kit's shots.json uses grade + scroll).
const params = new URLSearchParams(location.search);
if (params.get('grade')) state.tier = params.get('grade');
if (params.get('kind')) state.kind = params.get('kind');

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

function kindsOf(t) {
  const kinds = [...(t.kinds ?? [])];
  if (t.missable && !kinds.includes('missable')) kinds.push('missable');
  return kinds;
}

function isSpoilerHidden(t) {
  return state.spoiler && !earned.has(t.id) && (t.kinds ?? []).includes('story');
}

function pct(done, total) {
  return total === 0 ? 100 : Math.round((done / total) * 100);
}

function renderProgress() {
  const all = doc.trophies;
  const done = all.filter((t) => earned.has(t.id)).length;
  const p = pct(done, all.length);
  $('earnedCount').textContent = String(done);
  $('ringPct').textContent = `${p}%`;
  $('barFill').style.width = `${p}%`;
  const circumference = 326.7;
  $('ringFill').style.strokeDashoffset = String(circumference * (1 - p / 100));

  const tiers = ['platinum', 'gold', 'silver', 'bronze'];
  $('tierCounts').replaceChildren(...tiers.map((tier) => {
    const inTier = all.filter((t) => t.grade === tier);
    const got = inTier.filter((t) => earned.has(t.id)).length;
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = `${got}/${inTier.length}`;
    li.append(b, ` ${tier}`);
    return li;
  }));

  const remainingMissable = all.filter((t) => t.missable && !earned.has(t.id));
  const hint = $('nextHint');
  if (done === all.length) {
    hint.textContent = 'Platinum earned — you are a Leonida Legend.';
  } else if (remainingMissable.length > 0) {
    hint.textContent = `Watch out: ${remainingMissable.length} potentially missable ${remainingMissable.length === 1 ? 'trophy' : 'trophies'} still unearned — check the Missable filter before pushing the story further.`;
  } else {
    hint.textContent = 'All potentially missable trophies are safe. The rest is clean-up at your own pace.';
  }
}

function renderRoadmap() {
  const byId = new Map(doc.trophies.map((t) => [t.id, t]));
  $('roadmap').replaceChildren(...ROADMAP.map((phase, i) => {
    const trophies = phase.ids.map((id) => byId.get(id)).filter(Boolean);
    const done = trophies.filter((t) => earned.has(t.id)).length;
    const li = document.createElement('li');
    const badge = document.createElement('div');
    badge.className = 'phase-badge';
    badge.textContent = String(i + 1);
    const body = document.createElement('div');
    body.className = 'phase-body';
    const h = document.createElement('h3');
    h.textContent = phase.title;
    const p = document.createElement('p');
    p.textContent = phase.text;
    const prog = document.createElement('p');
    prog.className = 'phase-progress';
    prog.textContent = `${done} of ${trophies.length} done (${pct(done, trophies.length)}%)`;
    const names = document.createElement('p');
    names.className = 'phase-names';
    names.textContent = trophies.map((t) => t.name).join(' · ');
    body.append(h, p, prog, names);
    li.append(badge, body);
    return li;
  }));
}

function renderCategories() {
  const cats = ['story', 'missable', 'collectibles', 'activities', 'online'];
  $('catGrid').replaceChildren(...cats.map((cat) => {
    const inCat = doc.trophies.filter((t) => kindsOf(t).includes(cat));
    const done = inCat.filter((t) => earned.has(t.id)).length;
    const card = document.createElement('div');
    card.className = 'cat-card';
    const h = document.createElement('h3');
    h.textContent = KIND_LABELS[cat];
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${pct(done, inCat.length)}%`;
    bar.append(fill);
    const p = document.createElement('p');
    p.textContent = `${done} of ${inCat.length} earned · ${pct(done, inCat.length)}%`;
    card.append(h, bar, p);
    return card;
  }));
}

function matches(t) {
  if (state.tier !== 'all' && t.grade !== state.tier) return false;
  if (state.kind !== 'all' && !kindsOf(t).includes(state.kind)) return false;
  if (state.hideEarned && earned.has(t.id)) return false;
  if (state.query) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function renderCards() {
  const visible = doc.trophies.filter(matches);
  $('showingLine').textContent = `Showing ${visible.length} of ${doc.trophies.length} trophies.`;
  if (visible.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-note';
    p.textContent = 'No trophies match those filters — loosen a filter or clear the search.';
    cardsEl.replaceChildren(p);
    return;
  }
  cardsEl.replaceChildren(...visible.map((t) => {
    const hidden = isSpoilerHidden(t);
    const card = document.createElement('article');
    card.className = `card${earned.has(t.id) ? ' earned' : ''}${hidden ? ' spoiler-hidden' : ''}`;
    card.dataset.grade = t.grade;

    const top = document.createElement('div');
    top.className = 'card-top';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      save();
      renderAll();
    });
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = hidden ? 'Hidden story trophy' : t.name;
    const badges = document.createElement('div');
    badges.className = 'badges';
    const tierBadge = document.createElement('span');
    tierBadge.className = `badge ${t.grade}`;
    tierBadge.textContent = t.grade;
    badges.append(tierBadge);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'badge missable';
      m.textContent = 'Potentially missable';
      badges.append(m);
    }
    for (const kind of kindsOf(t)) {
      if (kind === 'missable') continue;
      const k = document.createElement('span');
      k.className = 'badge kind';
      k.textContent = KIND_LABELS[kind] ?? kind;
      badges.append(k);
    }
    top.append(box, name, badges);

    const desc = document.createElement('p');
    desc.className = 'official-desc';
    desc.textContent = hidden ? 'Story trophy — earn it or lift the spoiler shield to read this.' : t.description;

    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = hidden ? 'The guide for this trophy is hidden by the spoiler shield so the story stays a surprise.' : t.guide;

    card.append(top, desc, guide);
    if (hidden) {
      const note = document.createElement('p');
      note.className = 'spoiler-note';
      note.textContent = 'Spoiler shield on — story details hidden until earned.';
      card.append(note);
    }
    return card;
  }));
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderCategories();
  renderCards();
}

/* ---------- controls ---------- */
function wireChips(containerId, attr, key) {
  const container = $(containerId);
  for (const chip of container.querySelectorAll('.chip')) {
    if (chip.dataset[attr] === state[key]) {
      container.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    }
    chip.addEventListener('click', () => {
      state[key] = chip.dataset[attr];
      container.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
      renderCards();
    });
  }
}
wireChips('tierChips', 'tier', 'tier');
wireChips('kindChips', 'kind', 'kind');

$('search').addEventListener('input', (e) => {
  state.query = e.target.value.trim().toLowerCase();
  renderCards();
});

const spoilerToggle = $('spoilerToggle');
spoilerToggle.checked = state.spoiler;
spoilerToggle.addEventListener('change', () => {
  state.spoiler = spoilerToggle.checked;
  localStorage.setItem(SPOILER_KEY, state.spoiler ? 'on' : 'off');
  renderCards();
});

$('hideEarned').addEventListener('change', (e) => {
  state.hideEarned = e.target.checked;
  renderCards();
});

$('exportBtn').addEventListener('click', () => {
  const payload = JSON.stringify({ app: 'leonida-legend', version: 1, earned: [...earned] }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const list = Array.isArray(parsed) ? parsed : parsed.earned;
    const valid = new Set(doc.trophies.map((t) => t.id));
    earned = new Set(list.filter((id) => valid.has(id)));
    save();
    renderAll();
  } catch {
    $('showingLine').textContent = 'That import file could not be read as trophy progress.';
  }
  e.target.value = '';
});

$('resetBtn').addEventListener('click', () => {
  earned = new Set();
  save();
  renderAll();
});

/* ---------- boot ---------- */
doc = await (await fetch('data/trophies.json')).json();
$('sourceList').replaceChildren(...(doc.sources ?? []).map((s) => {
  const li = document.createElement('li');
  li.textContent = s;
  return li;
}));
renderAll();

const scrollTarget = Number(params.get('scroll'));
if (Number.isFinite(scrollTarget) && scrollTarget > 0) {
  requestAnimationFrame(() => window.scrollTo(0, scrollTarget));
}
