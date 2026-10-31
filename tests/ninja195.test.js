/* VAYRATHEN — tests/ninja195.test.js — (v195) the ninja line as the owner laid it out: removed skills give their
   points back, the normal throw ricochets, the elemental stars leave their marks, the smoke bomb dodges everything,
   the shadow clones copy your hits and Four Elements strikes everything in its circle. (v196) no mouth cloth of its own. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('ninja: reworked skills, ricochet, clones, smoke, four elements', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => loadMap(3)); await page.waitForTimeout(1000);
    const r = await page.evaluate(async () => {
      const out = {}, wait = s => new Promise(res => setTimeout(res, s * 1000));
      const until = async (fn, max = 6) => { for (let i = 0; i < max * 10 && !fn(); i++) await wait(.1); return fn(); };   // game time can lag the clock under load
      S.job = 'kage'; S.lvl = 110; S.jlvl = 50; S.skPts = 0;
      S.skills = {shinobiway:10, quickslash:10, katon:10, suiton:10, smokescreen:10, bladeart:10, fuuton:10, kagebunshin:10, shurikenstorm:10, kagemastery:10, shadowflash:10, kirin:10, thousandshadows:10, silentkill:10, ninjadash:5, iai:3};
      derive(); out.refund = S.skPts; out.gone = !('iai' in S.skills) && !('ninjadash' in S.skills);
      out.counts = ['ninja', 'shinobi', 'kage'].map(j => JOBS[j].skills.length);
      out.mask = !SPR.CHARS.ninja.ninjaMask && !!SPR.GEAR_LOOK.f_njmask;
      const ms = mobs.filter(m => !m.dead && !m.def.boss).slice(0, 5);
      ms.forEach((m, i) => { m.maxhp = m.hp = 1e7; m.x = P.x + 60 + i * 40; m.y = P.y; m.aggro = false; m.st = {stop:999}; });
      const m = ms[0], dmg = () => ms.map(x => 1e7 - x.hp);
      execSkill('quickslash', 10, m); execSkill('katon', 10, m); execSkill('suiton', 10, m); await wait(1);
      out.marks = {blind:m.st.blind > 0, burn:m.burnT > T, mres:m._mresP > 0};
      addItem('s_iron', 100); S.gear.ammo = 's_iron';
      let d0 = dmg(); basicAttack(m); await until(() => dmg()[2] - d0[2] > 0); await wait(.3); out.bounce = dmg().map((v, i) => v - d0[i]);
      execSkill('kagebunshin', 10, null); d0 = dmg(); basicAttack(m); await until(() => dmg()[0] - d0[0] > out.bounce[0] * 1.4); out.clone = dmg()[0] - d0[0];
      d0 = dmg(); execSkill('kirin', 10, m); await until(() => dmg().filter((v, i) => v - d0[i] > 0).length >= 3); out.kirin = dmg().map((v, i) => v - d0[i]);
      execSkill('smokescreen', 10, null); S.hp = DER.maxhp; mobAttack(m, 5, true); out.smoke = S.hp === DER.maxhp;
      return out;
    });
    assert.ok(r.refund >= 8 && r.gone, 'removed skills give their points back');
    assert.deepStrictEqual(r.counts, [5, 4, 6], 'ninja 5 · shinobi 4 · kage 6 skills');
    assert.ok(r.mask, 'the mouth cloth is a wardrobe piece, not part of the class');
    assert.ok(r.marks.blind && r.marks.burn && r.marks.mres, 'twin stars blind, fire burns, water lowers magic resistance');
    assert.ok(r.bounce[0] > 0 && r.bounce[1] > 0 && r.bounce[2] > 0, 'the normal throw ricochets on to the next monsters');
    assert.ok(r.clone > r.bounce[0] * 1.4, 'the shadow clones add their own hits');
    assert.ok(r.kirin.filter(v => v > 0).length >= 3, 'Four Elements strikes everything in its circle');
    assert.ok(r.smoke, 'the smoke bomb dodges every attack');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
