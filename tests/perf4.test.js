/* VAYRATHEN — tests/perf4.test.js — (v105) the stutter fixes: no repainting HUD animations, frame cap setting, culling */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('perf: HUD animations no longer repaint; fps cap; off-screen things skipped', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      loadMap(1); await new Promise(r => setTimeout(r, 600));
      const loops = new Set(), grab = () => { for (const a of document.getAnimations()) if (a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity) loops.add(a.animationName); };
      grab(); const c = el('confirm'); if (c) c.hidden = true; S.inv.w_sword1 = 1;
      for (const id of ['smith', 'driller']){ loadMap(0); const n = NPCS.find(x => x.id === id); P.x = n.x; P.y = n.y + 40; NPC_OPEN[id](n); await new Promise(r => setTimeout(r, 400)); grab(); closeDialog(); }
      for (const w of ['forge', 'equip', 'inventory', 'achieve']){ try { openWin(w); await new Promise(r => setTimeout(r, 350)); grab(); closeWin(w); } catch (e) {} }
      const st = document.createElement('div'); st.className = 'rfstage hammer'; st.innerHTML = '<i class="rfspark"></i>'; document.body.appendChild(st); const rfflash = getComputedStyle(st.firstChild).animationName; st.remove();
      loadMap(1); await new Promise(r => setTimeout(r, 300));
      const run = [...loops];
      const bar = getComputedStyle(document.querySelector('.thin.bx i')).animationName;
      // a monster far away is not drawn, one beside you is
      let drawn = new Set(); const _d = drawMobW; drawMobW = (g, m) => { drawn.add(m); return _d(g, m); };
      const far = spawnMob(MAPS[1].mobs[0], clamp(P.x + 1500, 30, W - 30), P.y, {zone:MAPZ}), near = spawnMob(MAPS[1].mobs[0], P.x + 40, P.y, {zone:MAPZ});
      render(); drawMobW = _d;
      openWin('settings'); const sel = el('set-fpscap'); sel.value = '30'; sel.dispatchEvent(new Event('change', {bubbles:true}));
      return {loops:run, rfflash, bar, farDrawn:drawn.has(far) && Math.abs(far.x - P.x) > 900, nearDrawn:drawn.has(near), cap:pf4Cap(), saved:SETTINGS.fpsCap};
    });
    assert.deepStrictEqual(r.loops, [], 'nothing loops or blinks anywhere (world, smith, driller, forge, equip, bag)');
    assert.strictEqual(r.rfflash, 'none', 'the refine result does not strobe');
    assert.strictEqual(r.bar, 'none', 'the EXP bar light stands still');
    assert.ok(!r.farDrawn, 'a monster far off screen is skipped'); assert.ok(r.nearDrawn, 'a monster beside you is drawn');
    assert.strictEqual(r.cap, 30); assert.strictEqual(r.saved, '30');
    // the game keeps running at the cap
    const t = await page.evaluate(async () => { const t0 = T; await new Promise(r => setTimeout(r, 1500)); return T - t0; });
    assert.ok(t > .8, 'time still flows at 30 FPS');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
