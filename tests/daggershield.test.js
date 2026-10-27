/* VAYRATHEN — tests/daggershield.test.js — (v139) a one-handed dagger takes a shield; twin daggers (two-handed) do not */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('daggers and shields', { skip, timeout: 90000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Dg');
    const r = await page.evaluate(() => {
      const job = Object.keys(JOBS).find(j => j !== 'novice' && JOBS[j].weapon && JOBS[j].weapon.type === 'dagger' && (JOBS[j].tier || 0) >= 2) || Object.keys(JOBS).find(j => j !== 'novice' && JOBS[j].weapon && JOBS[j].weapon.type === 'dagger'); S.job = job; S.lvl = 200; S.jlvl = 70; derive();
      const daggers = Object.keys(ITEMS).filter(k => ITEMS[k].slot === 'weapon' && ITEMS[k].st && ITEMS[k].st.wtype === 'dagger' && !ITEMS[k].base);
      const one = daggers.find(k => handsOf(ITEMS[k].st) === '1h'), two = daggers.find(k => handsOf(ITEMS[k].st) === '2h');
      const sh = Object.keys(ITEMS).find(k => ITEMS[k].slot === 'shield' && !ITEMS[k].base && (ITEMS[k].lv || 0) <= 200);
      const wear = id => { S.inv[id] = (S.inv[id] || 0) + 1; const b = document.createElement('button'); b.dataset.wear = id; b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); };
      S.gear.shield = null; wear(one); wear(sh); const oneOk = S.gear.shield === sh;
      S.gear.shield = null; wear(two); const w2 = S.gear.weapon; wear(sh); const twoBlocked = S.gear.shield !== sh;
      return {job, one, two, sh, oneOk, twoBlocked, w2, hands:curHands(), twoInfo:JSON.stringify(ITEMS[two].st).slice(0, 120), twoLv:ITEMS[two].lv, twoJob:ITEMS[two].job || ITEMS[two].jobs}; });
    assert.ok(r.one && r.two && r.sh, `found a one-handed dagger, twin daggers and a shield ${JSON.stringify(r)}`);
    assert.ok(r.oneOk, 'a shield goes with a one-handed dagger');
    assert.ok(r.twoBlocked, 'no shield with two-handed twin daggers ' + JSON.stringify(r));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
