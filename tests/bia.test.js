/* VAYRATHEN — tests/bia.test.js — (v111) the money is เบี้ย: old saves keep every unit, the screen never says บาท */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
const OLD = 'ze' + 'ny';

test('old saves move to เบี้ย 1:1, banks too; prices show เบี้ย and the shell icon', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async OLD => {
      const c = el('confirm'); if (c) c.hidden = true;
      // a save and a bank written by the old version
      const o = JSON.parse(JSON.stringify(S)); delete o.bia; o[OLD] = 12345; localStorage.setItem(slotKey(9), JSON.stringify(o));
      const s = load(9); localStorage.removeItem(slotKey(9));
      const bank = Object.assign({inv:{}, inst:{}, bia:0}, biaMig({inv:{}, inst:{}, [OLD]:777}));
      S.bia = 5000; S.lvl = 30; derive(); openWin('equip'); await new Promise(r => setTimeout(r, 300));
      const panel = document.body.innerText;
      const n = NPCS.find(x => x.id === 'smith'); P.x = n.x; P.y = n.y + 40; NPC_OPEN.smith(n); await new Promise(r => setTimeout(r, 400));
      closeDialog(); const t = document.createElement('i'); t.className = 'biaI'; document.body.appendChild(t); const ico = /svg/.test(getComputedStyle(t).backgroundImage) && t.offsetWidth > 0; t.remove();
      return {bia:s && s.bia, hasOld:s && OLD in s, bank:bank.bia, bankOld:OLD in bank, saysBaht:/บาท(?!หลวง)|Baht/.test(panel.replace(/บทบาท|กากบาท/g, '')), saysBia:/เบี้ย/.test(panel), ico, cur:CUR()};
    }, OLD);
    assert.strictEqual(r.bia, 12345, 'an old save keeps every unit as เบี้ย');
    assert.strictEqual(r.hasOld, false, 'the old field is gone');
    assert.strictEqual(r.bank, 777, 'the account bank moves over too'); assert.strictEqual(r.bankOld, false);
    assert.strictEqual(r.cur, 'เบี้ย');
    assert.ok(r.saysBia && !r.saysBaht, 'the screen says เบี้ย, never บาท');
    assert.ok(r.ico, 'the shell icon is drawn');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
