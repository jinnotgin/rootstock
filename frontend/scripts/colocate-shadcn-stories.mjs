import { existsSync, readdirSync, renameSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ─── Anchor to project root ─────────────────────────────────────────────────
// __dirname isn't available in ESM, so we derive it from the script's URL.
// resolve(.., "..") walks up one level from scripts/ to the project root.
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
// ────────────────────────────────────────────────────────────────────────────

// ─── Config ─────────────────────────────────────────────────────────────────
const COMPONENTS_DIR = join(PROJECT_ROOT, "src/components");
const UI_DIR = join(PROJECT_ROOT, "src/components/ui");
// ────────────────────────────────────────────────────────────────────────────

if (!existsSync(COMPONENTS_DIR)) {
  console.error(`❌ Components directory not found: "${COMPONENTS_DIR}"`);
  process.exit(1);
}

if (!existsSync(UI_DIR)) {
  console.error(`❌ UI directory not found: "${UI_DIR}"`);
  process.exit(1);
}

const misplacedStories = readdirSync(COMPONENTS_DIR).filter((f) =>
  f.endsWith(".stories.tsx")
);

if (misplacedStories.length === 0) {
  console.log("✅ No misplaced story files found — nothing to do.");
  process.exit(0);
}

let moved = 0;

for (const file of misplacedStories) {
  const from = join(COMPONENTS_DIR, file);
  const to = join(UI_DIR, file);

  if (existsSync(to)) {
    console.warn(`⚠️  Skipping "${file}" — already exists in ui/`);
    continue;
  }

  renameSync(from, to);
  console.log(`📦 Moved: ${file}`);
  console.log(`   ${from} → ${to}`);
  moved++;
}

console.log(`\n✅ Done — ${moved} file(s) moved to ${UI_DIR}`);
