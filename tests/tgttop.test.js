/* VAYRATHEN — tests/tgttop.test.js — (v109) a phone held sideways: the monster card stays near the top when Auto is on */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

for (const [W, H] of [[780, 360], [720, 340], [844, 390]]){
  test(`target card ${W}×${H} with Auto on stays at the very top`, { skip, timeout: 120000 }, async () => {
    const { page, errors, close } = await openGame({ width:W, height:H, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:3 } });
    try {
      await enterWorld(page, 'Tg');
      const r = await page.evaluate(async () => {
        const c = el('confirm'); if (c) c.hidden = true;
        SETTINGS.control = 'joy'; applyControlMode(); renderMoba();
        loadMap(1); P.x = W / 2; P.y = H / 2; const m = spawnMob(MAPS[1].mobs[0], P.x + 60, P.y, {zone:MAPZ}); m.hp = m.maxhp = 1e9;
        BOT.on = true; if (typeof renderBotChip === 'function') renderBotChip(); P.target = m;
        await new Promise(r => setTimeout(r, 1200)); BOT.on = false; P.target = m; await new Promise(r => setTimeout(r, 300)); BOT.on = true; renderBotChip && renderBotChip(); layoutHud();
        const t = el('target').getBoundingClientRect(), u = el('ui').getBoundingClientRect(); BOT.on = false;
        return {top:(t.top - u.top) / u.height, mid:(t.left + t.width / 2 - u.left) / u.width, vis:!el('target').hidden};
      });
      assert.ok(r.vis, 'the card shows');
      assert.ok(r.top < .06, `the card sits at the very top (at ${(r.top * 100).toFixed(0)}% of the height)`);
      assert.ok(Math.abs(r.mid - .5) < .05, 'centred');
    } finally { await close(); }
    assert.deepStrictEqual(errors, [], 'no runtime errors');
  });
}
