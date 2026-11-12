/* a boss fight's music. (v286) the owner removed Phaya Khankhak's own theme: he fights to the same battle music as
   every other boss. The theme mechanism (BOSS_THEMES in js/sys/bgm.js) stays, empty, for themes made later. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('Phaya Khankhak fights to the same music as the other bosses', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const keyIn = async type => {
      await page.evaluate(t => { S.lvl = 120; derive(); S.hp = DER.maxhp; const id = MAPS.findIndex(m => m.boss === t); loadMap(id); P.x = W / 2; P.y = H / 2; bossTimer = 0; }, type);
      await page.waitForFunction(() => boss && !boss.dead, null, { timeout: 30000 });
      return page.evaluate(() => { let mood = null; const _m = SFX.music; SFX.music = m => { mood = m; };
        boss.x = P.x + 150; boss.y = P.y; boss.aggro = true; PAUSED = false; musicMood(); SFX.music = _m;
        return { key: mood, theme: typeof bossTheme === 'function' ? bossTheme() : null }; });
    };
    const other = await page.evaluate(() => MAPS.find(m => m.boss && m.boss !== 'khankhak' && MOB[m.boss]).boss);
    const k = await keyIn('khankhak'), o = await keyIn(other);
    assert.strictEqual(await page.evaluate(() => !!BGM_TRACKS.boss_khankhak || Object.keys(BOSS_THEMES).length > 0), false, 'no boss has its own theme any more');
    assert.strictEqual(k.theme, null);
    assert.ok(k.key === 'battle' && k.key === o.key, `the same battle music: ${JSON.stringify({ khankhak: k, [other]: o })}`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
