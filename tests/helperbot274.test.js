/* VAYRATHEN — tests/helperbot274.test.js — (v274) helper robots at Uncle Boonma's: three free ones (no buff, one item
   every 2 s, kept for good), nine rented for Vayra Coins (EXP/JOB +10% and a small buff, one item a second, the free
   one comes back when the rental ends); the old animal rentals are gone (an old save is refunded). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('helper robots: free and rented, pick-up speed, EXP bonus, old rentals refunded', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    // an old animal rental in the save is ended and refunded in Bia
    const old = await page.evaluate(async () => { S.helper = {k:'ridgeback', left:43200, until:Date.now() + 43200e3}; const z = S.bia; await new Promise(r => setTimeout(r, 300)); return {h:S.helper, z:S.bia - z}; });
    assert.ok(!old.h, 'the old rental is gone'); assert.ok(old.z > 0, 'and refunded: ' + old.z);
    const shop = await page.evaluate(() => { const n = NPCS.find(x => x.id === 'beastkeeper'); P.x = n.x + 30; P.y = n.y + 10; ACC.coins = 30; openNpc(n);
      const d = document.getElementById('dialog'); const free = d.querySelectorAll('[data-botfree]').length, paid = new Set([...d.querySelectorAll('[data-rentpet]')].map(b => b.dataset.rentpet)).size;
      d.querySelector('[data-botfree="byte"]').click(); const h1 = {...S.helper};
      const atk0 = DER.atk; d.querySelector('[data-rentpet="titan"][data-rt="0"]').click();
      return {free, paid, h1, h2:{...S.helper}, coins:ACC.coins, atk0, atk1:DER.atk, pics:[...document.querySelectorAll('#dialog .botic img')].every(i => (i.src.startsWith('data:image/png') || /assets\/helpers\/\w+\.png/.test(i.src))), names:Object.keys(HELPERS)}; });
    assert.strictEqual(shop.free, 3, 'three free robots'); assert.strictEqual(shop.paid, 9, 'nine to rent');
    assert.ok(!shop.names.some(k => ['ridgeback', 'hare', 'hawk', 'elephant'].includes(k)), 'no old animals left');
    assert.deepStrictEqual(shop.h1, {k:'byte', free:1}, 'the free one is taken');
    assert.strictEqual(shop.h2.k, 'titan'); assert.ok(shop.h2.left > 86300, 'rented for a day'); assert.strictEqual(shop.coins, 25, '◈ 5 for a day');
    assert.ok(shop.atk1 > shop.atk0, 'TITAN adds ATK'); assert.ok(shop.pics, 'every robot has a picture');
    // EXP +10% while rented
    const ex = await page.evaluate(() => { const one = () => { const e0 = S.exp, j0 = S.jexp; gainExp(1000, 1000); const r = [S.exp - e0, S.jexp - j0]; S.exp = e0; S.jexp = j0; return r; };
      const paid = one(), h = S.helper; S.helper = {k:'byte', free:1}; const free = one(); S.helper = h; return {paid, free}; });
    assert.ok(ex.paid[0] / ex.free[0] > 1.07 && ex.paid[0] / ex.free[0] < 1.14 && (!ex.free[1] || (ex.paid[1] / ex.free[1] > 1.07 && ex.paid[1] / ex.free[1] < 1.14)), 'EXP and Job EXP +10%: ' + JSON.stringify(ex));
    // pick-up speed: rented one a second
    const t1 = await page.evaluate(async () => { closeDialog(); loadMap(1); const cheap = Object.keys(ITEMS).find(k => ITEMS[k].kind === 'etc' && ITEMS[k].sell > 0);
      LOOT.length = 0; for (let i = 0; i < 3; i++) dropLoot(cheap, P.x + 60 + i * 20, P.y); HLP.cd = 0; HLP.tgt = null; HLP.x = P.x; HLP.y = P.y;
      const t0 = performance.now(); while (LOOT.length && performance.now() - t0 < 9000) await new Promise(r => setTimeout(r, 50)); return performance.now() - t0; });
    assert.ok(t1 > 1700 && t1 < 4500, 'rented: about 1 s an item (' + Math.round(t1) + ' ms for 3)');
    // the rental ends → the free robot comes back, and it is slower (2 s an item)
    await page.evaluate(() => { S.helper.left = .2; S.helper.until = Date.now() + 200; });
    await page.waitForFunction(() => S.helper && S.helper.free, null, { timeout: 5000 });
    const t2 = await page.evaluate(async () => { const cheap = Object.keys(ITEMS).find(k => ITEMS[k].kind === 'etc' && ITEMS[k].sell > 0);
      LOOT.length = 0; for (let i = 0; i < 3; i++) dropLoot(cheap, P.x + 60 + i * 20, P.y); HLP.cd = 0; HLP.tgt = null;
      const t0 = performance.now(); while (LOOT.length && performance.now() - t0 < 12000) await new Promise(r => setTimeout(r, 50)); return {t:performance.now() - t0, h:S.helper}; });
    assert.strictEqual(t2.h.k, 'byte', 'the free robot is back');
    assert.ok(t2.t > 3700, 'free: about 2 s an item (' + Math.round(t2.t) + ' ms for 3)');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('the tutorial sends newcomers to take a free helper robot', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 1366, height: 768 });
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const i = TUT.findIndex(s => s.npc === 'beastkeeper'); S.helper = null; S.helperFree = null; tutGo(i); await new Promise(r => setTimeout(r, 300));
      const box = document.getElementById('tutBox'), out = {i, go:!!box.querySelector('[data-tutgo]')};
      box.querySelector('[data-tutgo]').click(); for (let k = 0; k < 250 && !(el('dialog') && !el('dialog').hidden && el('dialog').dataset.npc === 'beastkeeper'); k++) advance(.1, false);
      out.reached = el('dialog').dataset.npc === 'beastkeeper' && !el('dialog').hidden;
      document.querySelector('#dialog [data-botfree="chip"]').click(); advance(.2, false); out.next = S.tut.i === i + 1; return out; });
    assert.ok(r.i > 0 && r.go, 'a tutorial step with a «take me there» button');
    assert.ok(r.reached, 'it walks you to Uncle Boonma'); assert.ok(r.next, 'taking a free robot finishes the step');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
