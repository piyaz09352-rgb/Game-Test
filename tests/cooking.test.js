/* VAYRATHEN — tests/cooking.test.js — the market cook and the herbalist: make N from monster materials for a fee,
   eat / drink one and get the buff; short of materials or Bia shows a message and changes nothing. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

/* stand next to the NPC (the dialog closes beyond 110px) and open it on the given tab */
const visit = (page, id, tab) => page.evaluate(([id, tab]) => { const n = NPCS.find(x => x.id === id); P.x = n.x; P.y = n.y + 30; P.tx = null; CK.tab[id === 'cook' ? 'cook' : 'apo'] = tab; closeDialog(); openNpc(n); }, [id, tab]);
const make = async (page, rid, n) => {
  await page.fill(`#dialog .qty[data-qty="ck:${rid}"] .qn`, String(n));
  await page.click(`#dialog [data-ckmake="${rid}"]`);
};

test('the cook and the herbalist stand by the market, clear of everyone else', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => ['cook', 'herbal'].map(id => { const n = NPCS.find(x => x.id === id);
      const near = NPCS.filter(o => o !== n && Math.hypot(o.x - n.x, o.y - n.y) < 60).map(o => o.id);
      // (v58) their own shop stands right behind them and the low yard fence has its gate beside them: those are fine
      const props = PROPS.filter(p => p.type !== 'grass' && p.type !== 'lowfence' && !(p.type === 'vshop' && p.y < n.y) && Math.hypot(p.x - n.x, p.y - n.y) < 40).map(p => p.type);
      return { id, ok: !!n, near, props, town: inVillage(n), market: n.y > ARC.y + 200 && inVillage(n) /* (v60) the market is the south arc of the round town */ }; }));
    for (const x of r){
      assert.ok(x.ok, `${x.id} is in Aren`); assert.deepStrictEqual(x.near, [], `${x.id} does not crowd another NPC`);
      assert.deepStrictEqual(x.props, [], `${x.id} does not stand in a prop`); assert.ok(x.market, `${x.id} is at the central market`);
    }
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('cook N dishes from monster materials, pay the fee, eat one for the buff', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const rid = 'ck_meat0';
    const before = await page.evaluate(rid => { const r = CK_R[rid], ids = r.need[0].ids; for (const id of ids) delete S.inv[id];
      S.inv[ids[0]] = 10; S.inv[ids[1]] = 5; S.bia = 1e6; delete S.inv[rid]; for (const k of Object.keys(P.buffs)) if (k.startsWith('food')) delete P.buffs[k];
      return { ids, per: r.need[0].n, fee: r.fee }; }, rid);
    await visit(page, 'cook', 0);
    assert.ok(await page.$(`#dialog [data-ckmake="${rid}"]`), 'the dish is on the menu');
    assert.ok(await page.$(`#dialog .ckrow[data-ckr="${rid}"] .ckmob`), 'it shows which monsters drop the materials');
    await make(page, rid, 4);
    const st = await page.evaluate(([rid, ids]) => ({ have: S.inv[rid] || 0, mats: ids.reduce((a, id) => a + (S.inv[id] || 0), 0), bia: S.bia, open: !document.getElementById('dialog').hidden }), [rid, before.ids]);
    assert.strictEqual(st.have, 4, 'four dishes made');
    assert.strictEqual(st.mats, 15 - 4 * before.per, 'materials used: 4 × the recipe');
    assert.strictEqual(st.bia, 1e6 - 4 * before.fee, 'paid 4 × the fee');
    assert.ok(st.open, 'the dialog stays open');
    // MAX = as many as materials and Bia allow
    await page.click(`#dialog [data-ckmax="${rid}"]`);
    const mx = await page.evaluate(rid => +document.querySelector(`#dialog .qty[data-qty="ck:${rid}"] .qn`).value, rid);
    assert.strictEqual(mx, Math.floor((15 - 4 * before.per) / before.per), 'MAX fills what you can make');
    // the dish is in the bag and gives its buff
    const eat = await page.evaluate(rid => { useItem(rid); const b = P.buffs[Object.keys(P.buffs).find(k => k.startsWith('food'))]; return { left: S.inv[rid] || 0, buff: b && b.atkPct, want: ITEMS[rid].food.atkPct, t: b && b.t, inBag: Object.keys(S.inv).includes(rid) }; }, rid);
    assert.strictEqual(eat.left, 3, 'ate one');
    assert.ok(eat.buff > 0 && eat.buff === eat.want, 'the food buff is on');
    assert.ok(eat.t > 200, 'it lasts 5 minutes');
    // Auto eats one when the buff runs out (switch in the Auto window)
    const auto = await page.evaluate(rid => { closeDialog(); openWin('auto'); const sw = !!document.querySelector('#pane-auto [data-aset="food"]');
      botSet().food = true; for (const k of Object.keys(P.buffs)) if (k.startsWith('food')) delete P.buffs[k]; P.itemCd = 0; BOT.on = true; CK_EAT.t = 0; EV.emit('tick', .016); BOT.on = false;
      return { sw, left: S.inv[rid] || 0, fed: Object.keys(P.buffs).some(k => k.startsWith('food')) }; }, rid);
    assert.deepStrictEqual(auto, { sw: true, left: 2, fed: true }, 'Auto ate a dish');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('the herbalist brews tonics and the potions moved from Crafting; a tonic stacks with a dish', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const rid = 'ap_stone1';
    const info = await page.evaluate(rid => { const r = CK_R[rid], ids = r.need[0].ids; for (const id of ids) delete S.inv[id];
      S.inv[ids[0]] = r.need[0].n * 3; S.bia = 1e6; delete S.inv[rid]; P.buffs = {}; S.inv.ck_meat0 = 1; return { per: r.need[0].n, fee: r.fee, ids }; }, rid);
    await visit(page, 'herbal', 1);
    await make(page, rid, 3);
    const st = await page.evaluate(([rid, ids]) => ({ have: S.inv[rid] || 0, mats: ids.reduce((a, id) => a + (S.inv[id] || 0), 0), bia: S.bia }), [rid, info.ids]);
    assert.deepStrictEqual(st, { have: 3, mats: 0, bia: 1e6 - 3 * info.fee }, 'three remedies, materials and fee taken');
    // drink: resistance up, an affliction cured, and the dish buff keeps running beside it
    const dr = await page.evaluate(rid => { const r0 = afRes(); useItem('ck_meat0'); afflict('poison', 5, { dps: 1, force: true }); const pois = afHas('poison'); useItem(rid);
      return { pois, cured: !afHas('poison'), res: afRes() - r0, food: Object.keys(P.buffs).some(k => k.startsWith('food')), tonic: !!P.buffs.tonic, eff: buffEffect(P.buffs.tonic) }; }, rid);
    assert.ok(dr.cured, 'the remedy cures');
    assert.ok(dr.res > .2, 'status resistance goes up');
    assert.ok(dr.food && dr.tonic, 'a dish and a tonic run together');
    assert.ok(/%/.test(dr.eff), 'the buff bar explains the tonic');
    // a potion brew on the Potions tab
    await page.evaluate(() => { S.inv.jelly = 6; S.inv.redpot = 0; S.bia = 1e6; });
    await visit(page, 'herbal', 'pot');
    await make(page, 'ap_brew_redpot', 2);
    const pot = await page.evaluate(() => ({ red: S.inv.redpot || 0, jelly: S.inv.jelly || 0 }));
    assert.deepStrictEqual(pot, { red: 10, jelly: 0 }, '2 batches of 5 red potions from 6 jelly');
    // SP aromatic ticks SP back
    const sp = await page.evaluate(() => { S.inv.ap_ash0 = 1; useItem('ap_ash0'); S.sp = 0; P.buffs.tonic.st = 99; EV.emit('tick', .016); return S.sp; });
    assert.ok(sp > 0, 'the aromatic restores SP');
    // the Crafting window no longer brews potions
    const craft = await page.evaluate(() => RECIPES.filter(r => r.kind === 'use').map(r => r.out));
    assert.deepStrictEqual([...new Set(craft)], ['ore'], 'Crafting only makes ore now');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('short of materials or Bia: a message, and nothing changes', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const rid = 'ck_fowl0';
    const snap = () => page.evaluate(rid => JSON.stringify({ inv: S.inv, z: S.bia, d: S.inv[rid] || 0 }), rid);
    await page.evaluate(rid => { const r = CK_R[rid]; for (const id of r.need[0].ids) delete S.inv[id]; S.inv[r.need[0].ids[0]] = r.need[0].n * 2 - 1; S.bia = 1e6; toastMsg = ''; }, rid);
    await visit(page, 'cook', 0);
    let s0 = await snap();
    await make(page, rid, 2);
    assert.match(await page.evaluate(() => toastMsg), /วัตถุดิบไม่พอ|Not enough materials/, 'says materials are short');
    assert.strictEqual(await snap(), s0, 'nothing taken, nothing made');
    // enough materials, not enough Bia
    await page.evaluate(rid => { S.bia = CK_R[rid].fee - 1; toastMsg = ''; }, rid);
    await visit(page, 'cook', 0);
    s0 = await snap();
    await make(page, rid, 1);
    assert.match(await page.evaluate(() => toastMsg), /เงินไม่พอ|Not enough Bia/, 'says Bia is short');
    assert.strictEqual(await snap(), s0, 'nothing taken, nothing made');
    // made things live in S.inv: they survive a save and reload
    await page.evaluate(() => { S.inv.ck_yum2 = 2; S.inv.ap_charm0 = 1; closeDialog(); save(); });
    await page.reload();
    await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
    await page.click('[data-play]');
    await page.waitForFunction(() => !PAUSED, null, { timeout: 30000 });
    assert.deepStrictEqual(await page.evaluate(() => [S.inv.ck_yum2, S.inv.ap_charm0]), [2, 1], 'dishes and tonics are kept in the bag');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
