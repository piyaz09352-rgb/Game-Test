/* VAYRATHEN — tests/qguide218.test.js — (v218) the quest log shows the four map-story roads, the guide finds the way
   between regions and points at the right gate or NPC, the world map marks waiting chapters and towns, and the
   job-swap list is a grid of cards. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('quest guide: log, route, arrow target, world map marks, job grid', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {}, adv = n => { for (let i = 0; i < n; i++) advance(.05, false); };
      S.tut = {done:true, i:99}; S.lvl = 120; loadMap(0); adv(3);
      openWin('quest'); o.log = document.querySelectorAll('#pane-quest .qgarc').length; closeWin('quest');
      o.hop = qgNextHop(0, 31);
      S.guide = {kind:'arc', id:'east'}; const t0 = qgTarget(); o.npc = !!t0 && Math.hypot(t0.x - NPCS.find(n => n.id === 'ms_khaohom').x, t0.y + 20 - NPCS.find(n => n.id === 'ms_khaohom').y) < 2;
      msS().done[0] = 1; const t1 = qgTarget(); const gt = GATES.find(g => g.to === 1); o.gate = !!t1 && !!gt && t1.x === gt.x && t1.y === gt.y;
      for (let i = 0; i < 3; i++) render();
      S.visited = S.visited || {}; MAPS.forEach((m, i) => { S.visited[i] = 1; }); const h = wmMapHTML(); o.wm = h.includes('wmstory') && h.includes('wmtown');
      S.job = 'tycoon'; S.jlvl = 40; const n = NPCS.find(x => x.id === 'job'); P.x = n.x; P.y = n.y + 40; openNpc(n); if (typeof csAppend === 'function') csAppend(); o.grid = document.querySelectorAll('#dialog .csgrid .cscard').length; closeDialog();
      return o;
    });
    assert.strictEqual(r.log, 4, 'the quest window shows all four roads');
    assert.strictEqual(r.hop, 1, 'from Aren the way to the Sunflower Meadow runs through the bamboo');
    assert.ok(r.npc, 'with the chapter in Aren, the arrow points at Khao Hom');
    assert.ok(r.gate, 'with the next chapter elsewhere, the arrow points at the right gate');
    assert.ok(r.wm, 'the world map marks waiting chapters and towns');
    assert.ok(r.grid >= 12, 'the job swap is a grid of cards');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
