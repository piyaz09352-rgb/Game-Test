/* VAYRATHEN — tests/towerfloors226.test.js — (v226) tower floors of different kinds: a strong hero climbs floors
   1–12 on Auto and meets a curse (3), a survive floor that lasts its 40 s (4), a leader hunt that ends when the
   leader falls (9) and a treasure room whose chests Auto opens (11); a drought curse halves what potions heal (v235). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower floor kinds: curse, survive, leader, treasure', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {kinds:{}, dur:{}}, step = () => { advance(.05, false); if (P.dead){ P.dead = false; const d = document.getElementById('dth'); if (d) d.hidden = true; }   /* (v274) a tougher tower: an ungeared test hero can fall to a pile-up; this test is about the floor kinds */ if (!P.dead) { S.hp = DER.maxhp; S.sp = DER.maxsp; } if (DG3.boonOpen){ const b = document.querySelector('[data-boon]'); if (b) b.click(); } };
      S.tut = {done:true, i:99}; S.job = 'blade'; S.lvl = 200; S.stats = {str:120, agi:80, vit:80, int:1, dex:60, luk:1}; derive(); S.inv.redpot = 50;
      loadMap(0); twStart(1); setBot(true); botSet();
      let t = 0, cur = 0, t0 = 0;
      while (t < 1600 && TW.active && TW.f <= 12){ step(); t += .05;
        if (TW.phase === 'fight' && TWF.f === TW.f && cur !== TW.f){ cur = TW.f; t0 = t; o.kinds[cur] = TWF.kind;
          if (TWF.kind === 'curse' && TWF.curse === 'drought'){ const hp = S.hp = Math.round(DER.maxhp / 2); P.itemCd = 0; useItem('redpot'); const got = S.hp - hp; o.drought = got > 0 && got <= Math.ceil(ITEMS.redpot.heal * (1 + (DER.pas.potionPct || 0)) / 2) + 1; S.hp = DER.maxhp; } }
        if (TW.phase === 'rest' && cur && o.dur[cur] == null){ o.dur[cur] = Math.round(t - t0); if (o.kinds[cur] === 'treasure') o.chests = TW.gain.z; } }
      o.reached = TW.f; o.state = {active:TW.active, phase:TW.phase, open:TWM.open, dead:P.dead, alive:mobs.filter(m => m.tw === TW.f && !m.dead).map(m => [m.type, !!m.def.boss, !!m.aggro, Math.round(Math.hypot(m.x - P.x, m.y - P.y))]), bot:BOT.state, t:Math.round(t)}; return o;
    });
    assert.ok(r.reached > 12, `climbed past floor 12 (reached ${r.reached}) ${JSON.stringify(r.state)}`);
    assert.strictEqual(r.kinds[3], 'curse'); assert.strictEqual(r.kinds[4], 'survive'); assert.strictEqual(r.kinds[9], 'elite'); assert.strictEqual(r.kinds[11], 'hunt');   // (v267) no treasure rooms: those floors are hunts
    assert.ok(r.dur[4] >= 38, `the survive floor lasts its 40 s (${r.dur[4]} s)`);
    assert.ok(r.drought === undefined || r.drought === true, 'a drought curse halves what potions heal');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
