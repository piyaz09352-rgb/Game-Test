/* VAYRATHEN — tests/hands.test.js — one rule for one- and two-handed weapons: every weapon item and every class's
   own weapon follow it, the hero is drawn that way, and shields follow it. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('hands: names, data, pictures and shields agree', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const bad = [];
      const want = (wt, n) => wt === 'fist' || wt === 'bow' ? '2h' : wt === 'dagger' ? (/คู่|twin/i.test(n) ? '2h' : '1h') : wt === 'sword' ? (/สองมือ|greatsword/i.test(n) ? '2h' : '1h') : (/ไม้เท้ายาว|longstaff/i.test(n) ? '2h' : '1h');
      for (const id in ITEMS){ const it = ITEMS[id]; if (!it || it.slot !== 'weapon' || !it.st || !it.st.wtype) continue; const b = (it.base && ITEMS[it.base]) || it;
        if (handsOf(it.st) !== want(it.st.wtype, b.name + ' ' + b.en)) bad.push(id); }
      const jobs = []; for (const k in JOBS){ const w = JOBS[k].weapon; if (w && w.hands !== want(w.type, w.name + ' ' + (w.en || ''))) jobs.push(k); }
      const C = SPR.CHARS;
      return {bad, jobs, bulwark:!!C.bulwark.twoHand, warlord:!!C.warlord.twoHand, rogueTwin:!!C.rogue.twin, tiger:!!C.tigershade.twin,
        kitTwin:SPR.CHARS[SPR.heroKey('rogue', {weapon:'k_rogue_w'})].offWeapon === true, kris:SPR.CHARS[SPR.heroKey('rogue', {weapon:'w_ndagger2'})].offWeapon === false,
        rodShield:(() => { S.job = 'archsage'; S.gear.weapon = 'w_estaff2'; derive(); return shieldOk(); })(),
        bowShield:(() => { S.job = 'ranger'; S.gear.weapon = 'w_bow2'; derive(); return shieldOk(); })(),
        gsShield:(() => { S.job = 'warlord'; S.gear.weapon = 'w_gsword2'; derive(); return shieldOk(); })()};
    });
    assert.deepStrictEqual(r.bad, [], 'every weapon item follows the rule');
    assert.deepStrictEqual(r.jobs, [], 'every class weapon follows the rule');
    assert.ok(!r.bulwark && r.warlord, 'Bulwark one-handed, Warlord two-handed');
    assert.ok(r.rogueTwin && r.tiger && r.kitTwin && r.kris, 'twin daggers in both hands, a kris in one');
    assert.ok(r.rodShield && !r.bowShield && !r.gsShield, 'a rod takes a shield, a bow and a greatsword do not');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
