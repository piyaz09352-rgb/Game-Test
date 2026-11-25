/* VAYRATHEN — tests/newbie346.test.js — (v346) a brand-new hero survives the first field
   tools/first-play.js found three ways a Lv 1 newcomer died in the tutorial: the hero started with 40 of 80 HP; the
   tutorial's gold arrow pointed at the nearest monster (sometimes a Lv 9 boar); and the Loy Krathong festival spirit —
   any monster of the map made an alpha — was set down beside the newcomer (a Lv 13 lantern by the field gate). Checked:
   · a new hero starts with full HP and SP
   · the arrow shows a monster the hero can beat (no more than 2 levels above)
   · no festival spirit during the tutorial; afterwards one near the hero's level, and calm (it waits to be challenged)
   · the first kill leaves loot for the «pick up» step (a kill that dropped nothing left the newcomer stuck)
   · a newcomer led out by «พาไป» who fights what the arrow shows for 45 s is still alive */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed';

test('a brand-new hero: full HP, a beatable arrow target, no alpha beside them, alive after 45 s in the first field', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame({ width: 844, height: 390, ctx: { hasTouch: true, isMobile: true, deviceScaleFactor: 1 } });
  try {
    await enterWorld(page, 'Newbie', 'newbie_user_346'); await page.waitForTimeout(800);
    const r = await page.evaluate(async () => { const out = {hp:S.hp, maxhp:DER.maxhp, sp:S.sp, maxsp:DER.maxsp, tut:!!tutOn()};
      // the festival is on (as in November); during the tutorial no spirit comes
      EV_FORCE = 'loykrathong'; EVB.slot = -1; EVB.m = null;
      S.tut.i = TUT.findIndex(s => s.f306); tutShow(); document.querySelector('#tutBox [data-tutgo]').click();
      for (let k = 0; k < 160 && MAP_ID === 0; k++) await new Promise(r => setTimeout(r, 250));
      await new Promise(r => setTimeout(r, 1500)); out.inField = MAP_ID === FIELDS306.id; out.spiritInTut = !!EVB.m;
      // the arrow
      S.tut.i = TUT.findIndex(s => s.arrow === 'mob'); tutShow(); const a = tutMob(); out.arrowLv = a ? a.def.lvl : -1;
      // the first kill always leaves something to pick up (the next step), even from a monster that dropped nothing
      for (const l of LOOT.splice(0)) {}
      { const m = spawnMob('dewblob', P.x + 30, P.y, {zone:MAPZ}); m.def = {...m.def, drops:[]}; applyDamage(m, {dmg:1e7, crit:false}); await new Promise(r => setTimeout(r, 400)); out.lootAfterKill = !!nearestLoot(500); out.stepNow = S.tut.i; }
      // fight what the arrow shows for 45 s
      let t = 0; while (t < 45 && !P.dead){ const m = tutMob(); if (m && (!P.target || P.target.dead)) P.target = m; await new Promise(r => setTimeout(r, 500)); t += .5; }
      out.alive = !P.dead; out.lvl = S.lvl;
      // after the tutorial: the next spirit is near the hero's level and calm
      S.tut.done = true; tutShow(); EVB.slot = -1; EVB.m = null; await new Promise(r => setTimeout(r, 600));
      out.spirit = EVB.m ? {lv:EVB.m.def.lvl, calm:!!EVB.m.calm, aggro:!!EVB.m.aggro} : null; out.lvlNow = S.lvl;
      return out; });
    assert.strictEqual(r.hp, r.maxhp, 'full HP at the start'); assert.strictEqual(r.sp, r.maxsp, 'full SP at the start');
    assert.ok(r.tut && r.inField, 'the tutorial led into the first field');
    assert.ok(!r.spiritInTut, 'no festival spirit during the tutorial');
    assert.ok(r.arrowLv >= 1 && r.arrowLv <= 3, 'the arrow shows a monster a Lv 1 hero can beat: Lv ' + r.arrowLv);
    assert.ok(r.lootAfterKill, 'the first kill leaves something for the «pick up loot» step');
    assert.ok(r.alive, `alive after 45 s of fighting (reached Lv ${r.lvl})`);
    assert.ok(r.spirit, 'a festival spirit comes once the tutorial is over');
    assert.ok(r.spirit.lv <= r.lvlNow + 3, `the spirit is near the hero's level (Lv ${r.spirit.lv} for a Lv ${r.lvlNow} hero)`);
    assert.ok(r.spirit.calm && !r.spirit.aggro, 'and it waits to be challenged');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
