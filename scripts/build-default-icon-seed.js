// One-time authoring script: builds data/seed/default-icons.json from the
// 77 bundled PNGs in public/assets/icons/.
//   - compresses each PNG to <=256px via Playwright (headless canvas)
//   - derives category / tags / difficulty / German name via the AI analyze
//     flow (gpt-5.4 through the Copilot wrapper)
// Run once locally with an OpenAI-compatible endpoint reachable, e.g.:
//   OPENAI_API_KEY=dummy OPENAI_BASE_URL=http://192.168.2.177:8080/v1 \
//   OPENAI_MODEL_DEFAULT=gpt-5.4 node scripts/build-default-icon-seed.js
// Regenerate whenever the bundled icons in public/assets/icons/ change.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ServerAIService = require('../src/js/modules/serverAIService');

const ICONS_DIR = path.resolve(__dirname, '../public/assets/icons');
const OUT = path.resolve(__dirname, '../data/seed/default-icons.json');
const MAX_DIM = 256;

// Clean a filename into a human display name (best effort; AI refines later).
function nameFromFile(file) {
  return file
    .replace(/\.png$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

async function compress(page, absPath) {
  const b64 = fs.readFileSync(absPath).toString('base64');
  return page.evaluate(async ({ dataUrl, maxDim }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/png');
  }, { dataUrl: `data:image/png;base64,${b64}`, maxDim: MAX_DIM });
}

(async () => {
  const ai = new ServerAIService();
  if (!ai.isConfigured()) { throw new Error('OPENAI_API_KEY/OPENAI_BASE_URL not set'); }

  const files = fs.readdirSync(ICONS_DIR).filter(f => f.toLowerCase().endsWith('.png')).sort();
  console.log(`Processing ${files.length} icons...`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const seed = [];
  let i = 0;
  for (const file of files) {
    i++;
    const baseName = nameFromFile(file);
    let image;
    try {
      image = await compress(page, path.join(ICONS_DIR, file));
    } catch (e) {
      console.log(`  [${i}/${files.length}] ${file}: compress FAILED (${e.message}), skipping`);
      continue;
    }
    let meta = {};
    try {
      const a = await ai.analyzeIcon({ id: `seed-${i}`, name: baseName });
      meta = {
        category: a.category_suggestion || 'Uncategorized',
        difficulty: a.difficulty_suggestion || 3,
        tags: JSON.parse(a.tags_suggestion || '[]'),
        name_de: a.name_suggestion_de || ''
      };
    } catch (e) {
      console.log(`  [${i}/${files.length}] ${file}: AI FAILED (${e.message}), defaults`);
      meta = { category: 'Uncategorized', difficulty: 3, tags: [], name_de: '' };
    }
    seed.push({ name: baseName, file, image, ...meta });
    console.log(`  [${i}/${files.length}] ${baseName} -> ${meta.category} (d${meta.difficulty}) de:"${meta.name_de}" [${meta.tags.slice(0,3).join(',')}]`);
  }

  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(seed, null, 2));
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(`\nWrote ${seed.length} icons to ${OUT} (${kb} KB)`);

  // Category distribution summary
  const cats = {};
  seed.forEach(s => { cats[s.category] = (cats[s.category] || 0) + 1; });
  console.log('Categories:', JSON.stringify(cats));
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
