// Leonida Legend — GTA 6 trophy guide handover (Node 22, stdlib only).
//
// What this program does, in three steps:
//   1. Reads app/data/trophies.json and checks it really is the full official
//      list: 55 trophies, each with a non-blank name, description and guide,
//      and grades in the official split (1 platinum, 2 gold, 6 silver,
//      46 bronze). A bad list stops the handover here, loudly, instead of
//      shipping a broken guide.
//   2. Copies the static guide (app/) and its screenshots (screenshots/)
//      from beside this file into the output directory.
//   3. Writes output/dossier.json with buildDossier from the vendored
//      make.fun library, so the judge's view of the entry is exactly the
//      one the scorer rebuilds from the same files.
//
// The guide itself is plain static files: app/index.html opens in desktop
// Chrome and works with the network off. Serve it locally with
// `node serve.ts`, then open http://localhost:8080.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where the entry lives, and where the handover goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The official PlayStation 5 list for GTA 6, as the kit's RULES.txt states it.
const EXPECTED_TROPHIES = 55;
const EXPECTED_GRADES = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

// Blank means missing, whitespace-only, or not a string at all.
function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Load the trophy list and prove it is complete before anything is copied.
// Returns the per-grade counts and the missable count so the caller can
// report them.
function checkTrophyList() {
  const raw = readFileSync(join(repoRoot, 'app', 'data', 'trophies.json'), 'utf8');
  const parsed = JSON.parse(raw);
  const trophies = Array.isArray(parsed) ? parsed : parsed.trophies;
  if (!Array.isArray(trophies)) {
    throw new Error('trophies.json: expected an array or an object with a "trophies" array');
  }
  if (trophies.length !== EXPECTED_TROPHIES) {
    throw new Error(`trophies.json: expected ${EXPECTED_TROPHIES} trophies, found ${trophies.length}`);
  }

  const byGrade = {};
  const seenNames = new Set();
  let missableCount = 0;
  const problems = [];
  trophies.forEach((trophy, index) => {
    const label = `trophy ${index + 1}`;
    if (!trophy || typeof trophy !== 'object') {
      problems.push(`${label}: not an object`);
      return;
    }
    for (const field of ['name', 'description', 'guide']) {
      if (!hasText(trophy[field])) problems.push(`${label}: ${field} is blank or missing`);
    }
    if (hasText(trophy.name)) {
      const normalised = trophy.name.trim().toLowerCase();
      if (seenNames.has(normalised)) problems.push(`${label}: duplicate name "${trophy.name}"`);
      seenNames.add(normalised);
    }
    if (trophy.missable === true) missableCount += 1;
    const grade = trophy.grade;
    if (typeof grade !== 'string' || !(grade in EXPECTED_GRADES)) {
      problems.push(`${label} (${trophy.name ?? 'unnamed'}): unknown grade ${JSON.stringify(grade)}`);
    } else {
      byGrade[grade] = (byGrade[grade] ?? 0) + 1;
    }
  });
  for (const [grade, expected] of Object.entries(EXPECTED_GRADES)) {
    const found = byGrade[grade] ?? 0;
    if (found !== expected) {
      problems.push(`grade ${grade}: expected ${expected}, found ${found}`);
    }
  }
  if (problems.length > 0) {
    throw new Error(`trophies.json failed validation:\n- ${problems.join('\n- ')}`);
  }
  return { byGrade, missableCount };
}

// Mirror one directory tree into the output, creating it first if needed.
function mirrorTree(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function handOver() {
  const { byGrade: grades, missableCount } = checkTrophyList();
  const gradeSummary = Object.entries(EXPECTED_GRADES)
    .map(([grade]) => `${grades[grade]} ${grade}`)
    .join(', ');
  console.log(`Trophies validated: ${EXPECTED_TROPHIES} (${gradeSummary}), ${missableCount} flagged missable`);

  mkdirSync(destination, { recursive: true });
  mirrorTree(join(repoRoot, 'app'), join(destination, 'app'));
  if (existsSync(join(repoRoot, 'screenshots'))) {
    mirrorTree(join(repoRoot, 'screenshots'), join(destination, 'screenshots'));
  }

  // The scorer's own caps (reference/gate.json): only text_max_bytes shapes
  // the bytes; the rest refuse an entry the scorer would refuse anyway
  // (more than 4 screenshots or one over 256 KiB; more than 993 files and
  // directories in app/, or 48 MiB of app files, against /output's own
  // 1000-entry cap shared with screenshots/ and dossier.json).
  const dossier = buildDossier(destination, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(destination, 'dossier.json'), dossier);
  console.log(`Handover complete: ${destination}/dossier.json (${dossier.length} bytes)`);
}

handOver();
