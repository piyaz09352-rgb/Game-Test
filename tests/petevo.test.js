/* VAYRATHEN — tests/petevo.test.js — pet bond grows from kills, evolves at 300 / 1200, buffs you, draws without trouble. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('pet evolution: bond, forms, buffs and blessing', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { const out = {}; S.lvl = 30;
      const type = Object.keys(MOB).find(k => !MOB[k].boss && MOB[k].lvl >= 20 && MOB[k].lvl <= 40);
      S.pet = type; S.petd = null; petEnsure(); const p = PD(); PET.down = 0; PET.x = P.x + 20; PET.y = P.y;
      const a0 = p.atk; out.s0 = petStage(p);
      EV.emit('kill', {def:{lvl:30}}); out.bd1 = p.bd;
      EV.emit('kill', {def:{lvl:5}}); out.lowSkip = p.bd === 1;
      p.bd = 299; petBond(1); out.s1 = petStage(p); out.atk1 = p.atk / a0;
      out.out1 = HK.outMul.reduce((m, f) => f(m, 'neutral', 'phys', null), 1);
      p.bd = 1199; petBond(1); out.s2 = petStage(p); out.atk2 = p.atk / a0;
      out.card = petCardHTML().includes('petevo');
      // a fight: Bond Blessing on you
      P.target = {dead:false, x:P.x + 30, y:P.y, def:{lvl:1}}; PEVO.bless = 0; EV.emit('tick', .016); out.bless = !!P.buffs.pet_bless; P.target = null;
      // the swap keeps the bond
      const kept = {...p}; petList().push({...kept, type}); out.kept = petList().some(x => x.bd >= 1200);
      return out; });
    assert.strictEqual(r.s0, 0); assert.strictEqual(r.bd1, 1, 'a kill near your level adds bond'); assert.ok(r.lowSkip, 'low monsters do not count');
    assert.strictEqual(r.s1, 1); assert.ok(Math.abs(r.atk1 - 1.25) < .05, 'Awakened ×1.25');
    assert.ok(r.out1 > 1.04, 'Awakened pet lifts your damage');
    assert.strictEqual(r.s2, 2); assert.ok(Math.abs(r.atk2 - 1.6) < .05, 'Divine ×1.6');
    assert.ok(r.card, 'card'); assert.ok(r.bless, 'bless'); assert.ok(r.kept, 'kept');
    await page.waitForTimeout(600);   // the evolved pet draws for some frames
    const ft = await page.evaluate(() => new Promise(res => { const t = []; let l = performance.now(), n = 0; const f = now => { t.push(now - l); l = now; if (++n < 60) requestAnimationFrame(f); else res(Math.max(...t.slice(5))); }; requestAnimationFrame(f); }));
    assert.ok(ft < 250, `no long frame (${ft.toFixed(0)} ms)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
