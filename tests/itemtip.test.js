/* VAYRATHEN — tests/itemtip.test.js — (v94) the item card on every item: pointing at gear in the bag shows this piece
   next to the worn one and what changes; a potion gets its own card; a phone tap on a picture shows it and the next
   touch closes it; pointing at a drop on the ground shows its card but does not send the hero (a click does). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
const tip = async page => { await page.waitForTimeout(400); return page.evaluate(() => ({ shown: !el('itTip').hidden, id: ITIP.id, cols: document.querySelectorAll('#itTip .it-col').length, cmp: !!document.querySelector('#itTip .it-cmp .cmp') })); };

test('mouse: bag gear, a potion, a drop on the ground', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const g = await page.evaluate(() => { const g = Object.keys(ITEMS).find(k => ITEMS[k].kind === 'gear' && ITEMS[k].slot === 'armor' && !ITEMS[k].base && S.gear.armor && k !== S.gear.armor);
      S.inv[g] = 1; S.inv.redpot = 3; BAG.tab = 'all'; openWin('bag'); return g; });
    await page.waitForSelector(`#bagGrid [data-iid="${g}"]`);
    await page.hover(`#bagGrid [data-iid="${g}"]`);
    assert.deepStrictEqual(await tip(page), { shown: true, id: g, cols: 1, cmp: true }, 'gear: this piece and how it compares with the worn one (v115: the worn card is not repeated)');
    await page.hover('#bagGrid [data-iid="redpot"]');
    const p = await tip(page); assert.deepStrictEqual({ ...p, cmp: 0 }, { shown: true, id: 'redpot', cols: 1, cmp: 0 });
    assert.match(await page.textContent('#itTip'), /HP \+60/);
    await page.mouse.move(5, 5); assert.strictEqual((await tip(page)).shown, false, 'leaving hides it');
    // every item picture in any open window says which item it is
    assert.ok(await page.evaluate(() => [...document.querySelectorAll('#bagGrid .sico')].every(s => s.closest('[data-iid]'))), 'all bag pictures carry data-iid');
    await page.evaluate(() => closeWin('equip'));
    await page.evaluate(() => { LOOT.length = 0; LOOT.push({ id: 'redpot', x: P.x + 70, y: P.y, t: 90, born: T }); P.loot = null; });
    await page.waitForTimeout(300);
    const pt = await page.evaluate(() => { const r = brect(cv), l = LOOT[0]; return { x: r.left + (l.x - cam.x) / VW * r.width, y: r.top + (l.y - cam.y) / VH * r.height }; });
    await page.mouse.move(pt.x - 40, pt.y - 40); await page.mouse.move(pt.x, pt.y);
    const s = await page.evaluate(() => ({ shown: !el('itTip').hidden, id: ITIP.id, walking: !!P.loot }));
    assert.deepStrictEqual(s, { shown: true, id: 'redpot', walking: false }, 'a drop shows its card; pointing does not pick it up');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('phone: tap a picture to see its card, the next touch closes it', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame({ width: 390, height: 844, ctx: { isMobile: true, hasTouch: true } });
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.inv.redpot = 3; BAG.tab = 'all'; openWin('bag'); });
    await page.waitForSelector('#bagGrid [data-iid="redpot"]');
    await page.tap('#bagGrid [data-iid="redpot"]');
    assert.strictEqual((await tip(page)).shown, true);
    const fits = await page.evaluate(() => { const r = el('itTip').getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
    assert.ok(fits, 'the card fits on the screen');
    await page.touchscreen.tap(20, 800);
    assert.strictEqual((await tip(page)).shown, false, 'the next touch closes it');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('a two-handed weapon also shows in the shield slot', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const bow = Object.keys(ITEMS).find(k => ITEMS[k].kind === 'gear' && ITEMS[k].st && ITEMS[k].st.wtype === 'bow' && !ITEMS[k].base && !(ITEMS[k].lv > 1));
      S.job = 'ranger'; S.gear.weapon = bow; S.gear.shield = null; derive(); openWin('equip'); renderEquip();
      const s = document.querySelector('.eqsl-shield'); return { bow, twoh: s.classList.contains('twoh'), pic: s.querySelector('[data-iid]') && s.querySelector('[data-iid]').dataset.iid, txt: s.textContent };
    });
    assert.ok(r.twoh, 'the shield slot is marked two-handed'); assert.strictEqual(r.pic, r.bow, 'it shows the bow');
    assert.match(r.txt, /2 มือ|2H/);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
