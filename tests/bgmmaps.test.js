/* VAYRATHEN — tests/bgmmaps.test.js — (v142) every map has a recorded song, and each song file loads */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('every map has a song; the new songs load and play on their maps', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Bgm');
    const r = await page.evaluate(async () => {
      const none = MAPS.map((m, i) => i).filter(i => i !== 0 && !MAP_BGM[i] && !(MAPS[i] && MAPS[i].town));
      const files = [...new Set(Object.values(BGM_TRACKS).map(t => t.src))];
      const bad = []; for (const f of files){ const res = await fetch(f, {method:'HEAD'}).catch(() => null); if (!res || !res.ok) bad.push(f); }
      const played = {}; SETTINGS.musicVol = 30; S.lvl = 300; derive();
      for (const id of [12, 20, 30, 40, 50, 60].filter(i => MAP_BGM[i] && MAP_BGM[i].startsWith('bgm_'))){ loadMap(id); P.x = VSPAWN.x; P.y = VSPAWN.y; S.hp = DER.maxhp; for (const m of mobs) m.dead = true; await new Promise(r => setTimeout(r, 900)); played[id] = [MAP_BGM[id], MAP_ID === id ? BGM.key : 'moved to map ' + MAP_ID + ' (' + MAPS[MAP_ID].name + ')']; }
      return {none, bad, played, n:Object.keys(MAP_BGM).length}; });
    assert.deepStrictEqual(r.none, [], 'no map without a song');
    assert.deepStrictEqual(r.bad, [], 'every song file is there');
    for (const [id, [want, got]] of Object.entries(r.played)) assert.strictEqual(got, want, `map ${id} plays ${want}`);
  } finally { await close(); }
  assert.deepStrictEqual(errors.filter(e => !/play\(\)|autoplay|NotAllowedError/i.test(e)), [], 'no runtime errors');
});
