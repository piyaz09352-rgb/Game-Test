/* a boss's own song: plays when it fights you, keeps going until it dies; no file → the normal battle music */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

function wav(sec = 3){ const sr = 8000, n = sr * sec, b = Buffer.alloc(44 + n * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i / 10) * 3000), 44 + i * 2); return b; }
const st = page => page.evaluate(() => ({ key: BGM.key, want: BGM.want, boss: boss && !boss.dead ? boss.type : null, on: !!BOSSBGM.on, bad: !!BGM_TRACKS.boss_khankhak.bad }));
async function toBoss(page){
  await page.evaluate(() => { S.lvl = 120; derive(); S.hp = DER.maxhp; const id = MAPS.findIndex(m => m.boss === 'khankhak'); loadMap(id); P.x = W / 2; P.y = H / 2; bossTimer = 0; });
  await page.waitForFunction(() => boss && !boss.dead, null, { timeout: 30000 });
}

for (const withFile of [true, false]){
  test(`boss theme ${withFile ? 'plays until the boss dies' : 'falls back to battle music without the file'}`, { skip, timeout: 120000 }, async () => {
    const { page, errors, close } = await openGame();
    try {
      await page.route('**/audio/boss_khankhak.mp3', r => (withFile ? r.fulfill({ status: 200, contentType: 'audio/wav', body: wav() }) : r.fulfill({ status: 404, body: 'no' })));
      await enterWorld(page);
      await toBoss(page);
      await page.evaluate(() => { musicMood(); });
      assert.strictEqual((await st(page)).key !== 'boss_khankhak', true, 'not yet: the boss has not noticed anybody');   // far away, calm
      await page.evaluate(() => { boss.x = P.x + 150; boss.y = P.y; boss.aggro = true; musicMood(); });
      await page.waitForTimeout(1500);
      let s = await st(page);
      if (withFile){
        assert.strictEqual(s.key, 'boss_khankhak', 'the theme starts when the boss fights: ' + JSON.stringify(s));
        await page.evaluate(() => { boss.aggro = false; boss.x = P.x + 900; musicMood(); });   // lost sight: the song stays
        s = await st(page); assert.strictEqual(s.key, 'boss_khankhak', 'still playing while the boss lives');
        await page.evaluate(() => { const b = boss; b.hp = 1; killMob(b); musicMood(); });
        await page.waitForTimeout(500);
        s = await st(page); assert.ok(s.want === 0 || (s.key && !String(s.key).startsWith('boss_')), 'the boss song ends when the boss dies (the map\'s own song may take over): ' + JSON.stringify(s));
      } else {
        assert.ok(s.bad, 'a missing file is noticed: ' + JSON.stringify(s)); assert.notStrictEqual(s.key, 'boss_khankhak');
      }
    } finally { await close(); }
    assert.deepStrictEqual(errors.filter(e => !/404|Failed to load/.test(e)), [], 'no runtime errors');
  });
}
