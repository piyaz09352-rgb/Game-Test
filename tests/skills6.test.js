/* VAYRATHEN — tests/skills6.test.js — every class has 4 active skills, 1 buff and 1 passive, and the new effects work:
   auto-revive, invulnerability, the flee buff, the unbreakable cast, sacrificing summons and the one-time refund. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('skills: eight a tier, each in a style, and the new effects work', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    // (v159) the 4/1/1 shape became eight skills a tier in three play styles (skills8.js)
    const shape = await page.evaluate(() => Object.keys(SK8).map(j => [j, JOBS[j].skills.length, JOBS[j].skills.every(id => SKILLS[id] && SK8_OF[id])]));
    // (v193) the hunter line was reworked by the owner: some of its skills were removed on purpose (6 · 4 · 6)
    const RG = {ranger:6, warden:4, sylvan:6, ninja:5, shinobi:4, kage:6};   // (v195) the ninja line too (5 · 4 · 6)
    for (const [j, n, styled] of shape) assert.ok(n === (RG[j] || 8) && styled, `${j} has ${RG[j] || 8} skills, each in a style`);
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
    assert.ok(r.refund >= 10, 'the old points come back (v162: and a line never has fewer than its Job Levels gave)'); assert.ok(r.gone);
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
