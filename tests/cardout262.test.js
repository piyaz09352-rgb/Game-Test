/* VAYRATHEN — tests/cardout262.test.js — (v262) cards come out only at Driller Manee, for a fee, and may crack */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('card out: only at Manee, fee paid, card back or cracked, guard stone saves it', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Cardout');
    const r = await page.evaluate(async () => { const o = {};
      // a socketed weapon with two cards
      const base = GEAR_LIST.find(g => g[1] === 'weapon' && canWield(ITEMS[g[0]]))[0], key = rollGear(base, 'boss');
      const d = sockData(key); d.k = 3; const card = Object.keys(CARDS).find(c => CARDS[c].slot === 'weapon'); d.c = [card, card]; regInst(key, d); S.inv[key] = 1;
      // the ✕ elsewhere does nothing but point to Manee
      sockOut(key, 0); o.blocked = sockCards(key).length === 2;
      // at Manee
      S.bia = 1e7; S.cards[card] = 0; NPC_OPEN.driller(NPCS.find(n => n.id === 'driller') || {id:'driller', name:'ช่างเจาะมณี', en:'Manee', role:'', roleEn:''});
      o.listed = !!document.querySelector(`#dialog [data-coout="${key}|0"]`);
      o.shopGuard = !!document.querySelector('#dialog [data-drshop="cardguard"]');
      CO.crack = 0; const bia0 = S.bia; document.querySelector(`#dialog [data-coout="${key}|0"]`).click();
      o.out = sockCards(key).length === 1 && S.cards[card] === 1 && S.bia === bia0 - coFee(key);
      CO.crack = 1; S.inv.cardguard = 1; CO.guard = true; coRefresh(); document.querySelector(`#dialog [data-coout="${key}|0"]`).click();
      o.guarded = sockCards(key).length === 0 && S.cards[card] === 2 && !S.inv.cardguard;
      d.c = [card]; regInst(key, d); CO.guard = false; coRefresh(); document.querySelector(`#dialog [data-coout="${key}|0"]`).click();
      o.cracked = sockCards(key).length === 0 && S.cards[card] === 2;
      CO.crack = .1; return o; });
    assert.ok(r.blocked, 'the ✕ elsewhere does not take the card out');
    assert.ok(r.listed && r.shopGuard, 'Manee lists the piece and sells the guard stone');
    assert.ok(r.out, 'a card comes out for the fee and goes back to the card tab');
    assert.ok(r.guarded, 'with a guard stone it cannot crack (one stone used)');
    assert.ok(r.cracked, 'without one it can crack and is lost');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
