/* VAYRATHEN — tests/combatcaps.test.js — (v100) combat caps: no total stat cap, ASPD 190, DEF with diminishing returns, Flee 95%, no crit cap */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
test('combat caps', { skip, timeout: 60000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const out = {iv150:aspdIv(150), iv180:aspdIv(180), iv190:aspdIv(190), iv199:aspdIv(199), back:ivAspd(.4)};
      S.stats.str = 150; S.gear = S.gear || {}; derive(); const s0 = DER.b.str; S.stats.str = 150; DER.bonus.str = 0;
      // gear on top of 150 is not clipped
      const keep = S.slots; S.slots = {}; ITEMS.__t = {st:{str:60}}; S.gear.__t = '__t'; derive(); out.str = DER.b.str; out.s0 = s0; delete S.gear.__t; delete ITEMS.__t; S.slots = keep;
      S.stats.agi = 150; S.stats.dex = 150; derive(); out.aspdStat = DER.aspd;
      out.red = [0, 60, 120, 5000].map(bhRed);
      // Flee: the most anyone dodges is 95%
      const m = mobs.find(x => !x.dead && !x.def.boss); P.roll = 0; DER.pas.dodge = 0; DER.flee = 99999; const hp0 = S.hp = DER.maxhp; let hits = 0;
      const rnd = Math.random; Math.random = () => .02; try { mobAttack(m); } finally { Math.random = rnd; } if (S.hp < hp0) hits++;
      out.fleeHit = hits; S.hp = DER.maxhp;
      // crit is not capped at 50 any more
      DER.crit = 90; let seen = 0; const pd = physDamage; Math.random = () => .7; try { seen = pd(m, 1).crit ? 1 : 0; } finally { Math.random = rnd; }
      out.crit = seen; derive(); return out; });
    assert.strictEqual(r.iv150, 1); assert.strictEqual(r.iv180, .4); assert.strictEqual(r.iv190, .2); assert.strictEqual(r.iv199, .2, 'ASPD stops at 190');
    assert.strictEqual(r.back, 180);
    assert.strictEqual(r.str - r.s0, 60, 'stats are not clipped at a total: ' + r.s0 + ' → ' + r.str);   // (v166) the starter gear can roll a point of STR of its own
    assert.ok(r.aspdStat <= 180, `stats alone stop at 180 (${r.aspdStat})`);
    assert.deepStrictEqual(r.red.map(x => +x.toFixed(2)), [0, .33, .5, .7]);
    assert.strictEqual(r.fleeHit, 1, 'a 2% roll still lands against huge Flee');
    assert.strictEqual(r.crit, 1, '70% roll crits with 90 CRIT');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
test('mobbed Flee, Perfect Dodge from LUK, status resist from stats', { skip, timeout: 60000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const out = {};
      S.stats.luk = 100; derive(); out.pd = DER.pas.dodge;
      out.mul = [1, 2, 3, 5, 20].map(roFleeMul);
      S.stats.vit = 100; S.stats.int = 1; derive(); out.vit = roResOf('stun'); out.int = roResOf('silence'); out.none = roResOf('nope');
      // a stun roll under the VIT resist is shrugged off
      P.stunT = 0; const rnd = Math.random; Math.random = () => .1; const m = mobs.find(x => !x.dead);
      try { applyMobFx(m, 'stun'); } finally { Math.random = rnd; } out.stunned = P.stunT > 0;
      // the Flee seen inside mobAttack drops with 5 monsters on you
      let seen = 0; const f0 = DER.flee; const ms = mobs.filter(x => !x.dead).slice(0, 5);
      ms.forEach(x => { x._sv = [x.x, x.y, x.aggro]; x.x = P.x + 10; x.y = P.y; x.aggro = true; });
      const roll = P.roll; P.roll = 1; const af = DER.flee; Object.defineProperty(DER, 'flee', {configurable:true, get(){ return this._fl; }, set(v){ this._fl = v; seen = Math.min(seen || v, v); }}); DER._fl = af;
      try { mobAttack(ms[0]); } finally { P.roll = roll; delete DER.flee; DER.flee = f0; ms.forEach(x => { [x.x, x.y, x.aggro] = x._sv; delete x._sv; }); }
      out.n = ms.length; out.f0 = f0; out.seen = seen; derive(); return out; });
    assert.ok(r.pd >= .1 && r.pd < .11, `100 LUK = 10% Perfect Dodge (${r.pd})`);
    assert.deepStrictEqual(r.mul.map(x => +x.toFixed(2)), [1, 1, 1, .9, .4], '(v292) −5% per monster past the third, never below 40%');
    assert.strictEqual(r.vit, .4); assert.ok(r.int < .02, `1 INT gives almost nothing (${r.int})`); assert.strictEqual(r.none, 0);
    assert.strictEqual(r.stunned, false, '100 VIT shrugs off a stun roll of 10%');
    assert.ok(r.n < 3 || r.seen < r.f0, `Flee drops when mobbed (${r.f0} → ${r.seen}, ${r.n} on you)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
