/* VAYRATHEN — tests/oldsaves346.test.js — (v346) heroes saved by older versions still play
   The owner's rule: an old save must keep working. tests/fixtures/saves/vNNN.json are real browser saves made by running
   that version of the game (tools: a git worktree of the version, a hero levelled to 42 with a job, stats, skills, gear,
   potions, money and a quest — the whole of that browser's storage, offline test account, test password). Each version:
   the save is put into a fresh browser, the game signs in, the hero is played, and checked:
   · the hero comes back: level, job, money, weapon, armour, potions
   · the world opens and runs a few seconds with no error
   · saved again by this version and loaded again, still the same hero
   When a version changes the save format, add its own fixture (see the maker in the v346 notes, docs/UPDATES.md). */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const { chromium, openGame, signIn } = require('./browser');
const skip = !chromium && 'playwright not installed';
const DIR = path.join(__dirname, 'fixtures', 'saves');
const FIX = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort() : [];

for (const f of FIX) test(`a hero saved by ${f.replace('.json', '')} comes back whole and plays`, { skip, timeout: 180000 }, async () => {
  const fx = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const { page, errors, close } = await openGame({ width: 1280, height: 720 });
  try {
    await page.evaluate(st => { localStorage.clear(); for (const k in st) localStorage.setItem(k, st[k]); }, fx.storage);
    await page.reload(); await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
    const play = async () => {
      await signIn(page, fx.acc);
      await page.waitForSelector('[data-play]', { timeout: 30000 });
      await page.click('[data-play]');
      await page.waitForFunction(() => !PAUSED && document.getElementById('title').hidden, null, { timeout: 30000 });
      await page.evaluate(() => { const c = el('confirm'); if (c) c.hidden = true; });
      return page.evaluate(() => ({lvl:S.lvl, job:S.job, bia:S.bia, weapon:S.gear.weapon, armor:S.gear.armor, red:S.inv.redpot | 0, ok:!!JOBS[S.job] && S.hp > 0 && typeof MAP_ID === 'number'})); };
    const a = await play(), e = fx.expect;
    for (const k of ['lvl', 'job', 'bia', 'weapon', 'armor']) assert.strictEqual(a[k], e[k], `${k} after loading`);
    assert.ok(a.red >= e.red, 'potions kept'); assert.ok(a.ok, 'a playable hero in a map');
    // play a little in a hunting map, save with this version, and load it again
    await page.evaluate(async () => { loadMap(1); await new Promise(r => setTimeout(r, 3000)); save(); });
    await page.reload(); await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
    const b = await play();
    for (const k of ['lvl', 'job', 'weapon', 'armor']) assert.strictEqual(b[k], e[k], `${k} after saving with this version`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
