/* VAYRATHEN — tests/skills6.test.js — every class has 4 active skills, 1 buff and 1 passive, and the new effects work:
   auto-revive, invulnerability, the flee buff, the unbreakable cast, sacrificing summons and the one-time refund. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('skills: 4 active · 1 buff · 1 passive for every class, and the new effects work', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const shape = await page.evaluate(() => Object.keys(JOBS).filter(j => j !== 'novice').map(j => [j, JOBS[j].skills.map(id => SKILLS[id].kind).join(',')]));
    for (const [j, k] of shape) assert.strictEqual(k, 'active,active,active,active,buff,passive', `${j} has the 4/1/1 shape`);
    await page.evaluate(() => loadMap(1)); await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const out = {}; derive();
      // revive charm: lethal hit → back on your feet
      addBuff('revive', {t:90, revive:.5}); S.hp = 1; playerDie(); out.revived = !P.dead && S.hp >= Math.round(DER.maxhp * .5) - 1 && !P.buffs.revive;
      // invulnerable: a monster hit does nothing
      const m = mobs.find(x => !x.dead && !x.def.boss); S.hp = DER.maxhp; addBuff('sanctuary', {t:3, invuln:1}); mobAttack(m, 5, true); out.immune = S.hp === DER.maxhp; delete P.buffs.sanctuary;
      // flee buff raises flee only while a monster swings
      const f0 = DER.flee; addBuff('thiefsense', {t:45, flee:40}); mobAttack(m, .01, false); out.fleeBack = DER.flee === f0;
      // four-element seal: casts are never broken
      addBuff('elemseal', {t:40, noBreak:1}); out.noBreak = afBreakCast('test', false) === false;
      // the passive merge adds both bonuses
      out.sword = SKILLS.swordmastery.pas(10);
      // the old skill points come back once
      S._s6Done = 0; S.job = 'warlord'; S.skills = {swordmastery:10, ironbody:10, guardheart:3}; S.skPts = 0; derive(); out.refund = S.skPts; out.gone = !('ironbody' in S.skills);
      return out;
    });
    assert.ok(r.revived, 'the revive charm brings you back');
    assert.ok(r.immune, 'invulnerable heroes take no damage');
    assert.ok(r.fleeBack, 'flee goes back to normal after the swing');
    assert.ok(r.noBreak, 'the seal keeps the cast');
    assert.deepStrictEqual([r.sword.atkFlat, r.sword.def, +r.sword.hpPct.toFixed(2)], [30, 10, .3], 'Sword Mastery now carries Iron Body too');
    assert.strictEqual(r.refund, 10); assert.ok(r.gone);
    // sacrifice: summons vanish and the blast lands
    const w = await page.evaluate(() => { S.job = 'himmaemperor'; S.lvl = 120; S.jlvl = 50; S.skills = {emperorgrace:10, emperorwrath:10, kaisorn:10}; derive();
      execSkill('kaisorn', 10, null); const n0 = SUMMONS.filter(s => s.kind === 'beast').length;
      const m = mobs.find(x => !x.dead && !x.def.boss); m.maxhp = m.hp = 1e7; P.x = m.x - 30; P.y = m.y; window.__m = m;
      execSkill('emperorwrath', 10, null); return {n0, n1:SUMMONS.filter(s => s.kind === 'beast').length, n:S6X.n}; });
    await page.waitForTimeout(600);
    assert.strictEqual(w.n0, 1); assert.strictEqual(w.n1, 0); assert.strictEqual(w.n, 1);
    assert.ok(await page.evaluate(() => __m.hp < 1e7), 'the wrath blast hits');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
