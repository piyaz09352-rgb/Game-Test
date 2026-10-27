/* VAYRATHEN — tests/compare.test.js — automatic gear comparison (js/sys/compare.js):
   the predicted stat changes must equal what really happens when the piece is worn, trying a piece on must not
   change the hero, and the bag shows ▲ on upgrades and ▼ on downgrades. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('gear comparison predicts exactly what wearing does', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const res = await page.evaluate(() => {
      const out = { checked: 0, wrong: [], sideEffects: [] };
      for (const job of ['blade', 'rune', 'ranger', 'muay']){
        S.job = job; S.lvl = 120; S.gear = {}; derive(); S.hp = DER.maxhp; S.sp = DER.maxsp;
        // a mix of pieces for every slot this class can use, worn one after another
        const pool = Object.keys(ITEMS).filter(id => ITEMS[id].kind === 'gear' && !ITEMS[id].base && !id.includes('~') && ITEMS[id].slot && canWield(ITEMS[id]) && (ITEMS[id].lv || 0) <= S.lvl);
        for (let i = 0; i < pool.length; i += Math.max(1, Math.floor(pool.length / 40))){
          const id = typeof makeInst === 'function' ? makeInst(pool[i], i % 4) : pool[i];   // a real dropped piece, with random options
          const g0 = JSON.stringify(S.gear), hp0 = S.hp, D0 = DER;
          const c = cmpTry(id);
          if (JSON.stringify(S.gear) !== g0 || S.hp !== hp0 || DER !== D0) out.sideEffects.push(id);
          if (!c) continue;
          // really wear it (the same way the game does) and measure
          const before = cmpPick(DER), slot = c.slot, g = { ...S.gear, [slot]: id };
          S.gear = g; derive();
          const after = cmpPick(DER);
          for (const [k] of CMP_STATS){ const real = +(after[k] - before[k]).toFixed(k === 'crit' || k === 'move' ? 2 : 0), said = c.d[k] || 0;
            if (Math.abs(real - said) > 1e-9) out.wrong.push(`${job} ${id} ${k}: predicted ${said}, real ${real}`); }
          out.checked++;
        }
      }
      return out;
    });
    assert.ok(res.checked > 40, `compared enough pieces (${res.checked})`);
    assert.deepStrictEqual(res.sideEffects, [], 'trying a piece on leaves the hero untouched');
    assert.deepStrictEqual(res.wrong.slice(0, 10), [], 'predictions match real wearing');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('bag and equipment window mark upgrades and downgrades', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const ids = await page.evaluate(() => {
      S.job = 'blade'; S.lvl = 120; derive();
      const armors = Object.keys(ITEMS).filter(id => ITEMS[id].kind === 'gear' && !id.includes('~') && ITEMS[id].slot === 'armor' && ITEMS[id].st && ITEMS[id].st.def && !ITEMS[id].st.all && (ITEMS[id].lv || 0) <= 120)
        .sort((a, b) => ITEMS[a].st.def - ITEMS[b].st.def);
      const mk = b => (typeof makeInst === 'function' ? makeInst(b, 0) : b);
      const lo = mk(armors[0]), mid = mk(armors[Math.floor(armors.length / 2)]), hi = mk(armors[armors.length - 1]);
      S.gear.armor = mid; S.inv[lo] = 1; S.inv[hi] = 1; derive(); dirty = true;
      return { lo, mid, hi };
    });
    await page.evaluate(() => { BAG.tab = 'all'; openWin('bag'); });
    await page.waitForTimeout(500);
    const mark = id => page.evaluate(i => { const b = document.querySelector(`#bagGrid [data-bagsel="${i}"] .cmpB`); return b ? (b.classList.contains('up') ? 'up' : 'dn') : null; }, id);
    assert.strictEqual(await mark(ids.hi), 'up', 'stronger armour is marked ▲');
    assert.strictEqual(await mark(ids.lo), 'dn', 'weaker armour is marked ▼');
    await page.click(`#bagGrid [data-bagsel="${ids.hi}"]`, { force: true });
    const info = await page.textContent('#bagInfo');
    assert.match(info, /DEF \+\d+/, 'details list the DEF gain: ' + info);
    await page.evaluate(() => { closeWin('bag'); openWin('equip'); });
    await page.waitForTimeout(500);
    assert.ok(await page.$('.eqbag .cmpB.up'), 'equipment window marks the upgrade too');
    await page.evaluate(() => setLang('en')); await page.evaluate(() => { closeWin('equip'); openWin('bag'); });
    await page.click(`#bagGrid [data-bagsel="${ids.hi}"]`, { force: true });
    assert.match(await page.textContent('#bagInfo'), /Upgrade/, 'English text');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
