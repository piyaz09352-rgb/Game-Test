/* VAYRATHEN — tests/sovbond274.test.js — (v274) Royal Bond is back for the Sovereign, with limits: only a region boss
   at or below your level, called on demand for 45 s then 90 s of rest, and it takes one of the two beast places. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('Royal Bond: learnable, bind limits, call on demand, time limit and rest, counts toward the beast limit', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const adv = s => { for (let i = 0; i < s * 10; i++) advance(.1, false); };
      S.job = 'sovereign'; S.lvl = 150; S.jlvl = 50; S.skills = {sovlore:5, royalbond:1, callgaruda:5, callerawan:5}; derive(); S.bound = null;
      const out = {listed:JOBS.sovereign.skills.includes('royalbond'), kept:skl('royalbond') === 1};
      const id = MAPS.findIndex((m, i) => i > 0 && m && m.boss && MOB[m.boss] && MOB[m.boss].lvl < 140); warpTo(id); adv(1);
      // a boss above your level cannot be bound
      const big = spawnMob(MAPS[id].boss, P.x + 80, P.y, {zone:MAPZ}); big.def = {...big.def, lvl:S.lvl + 10}; big.hp = big.maxhp * .2; P.target = big; P.cds = {};
      bondCast(SKILLS.royalbond, 1, big); out.bigRefused = !S.bound; big.dead = true;
      const b = spawnMob(MAPS[id].boss, P.x + 80, P.y, {zone:MAPZ}); b.hp = b.maxhp * .2; P.cds = {}; bondCast(SKILLS.royalbond, 1, b); adv(1);
      out.bound = !!(S.bound && S.bound.type === b.type);
      out.firstOut = SUMMONS.some(s => s.beast === 'bound');   // binding calls it out once
      // call two beasts, then the bound boss: still two summons at most
      SUMMONS = SUMMONS.filter(s => s.beast !== 'bound'); adv(.3); out.noComeback = !SUMMONS.some(s => s.beast === 'bound'); S.bound.restUntil = 0; conjure(SKILLS.callgaruda, 5); conjure(SKILLS.callerawan, 5);
      P.cds = {}; bondCast(SKILLS.royalbond, 1, null); const beasts = SUMMONS.filter(s => s.kind === 'beast');
      out.cap = beasts.length; out.max = beastMax(); out.boundOut = beasts.some(s => s.beast === 'bound'); out.dur = (beasts.find(s => s.beast === 'bound') || {}).dur;
      // time up → it rests, and cannot be called again until then
      const bs = SUMMONS.find(s => s.beast === 'bound'); bs.t = bs.dur + 1; adv(1);
      out.gone = !SUMMONS.some(s => s.beast === 'bound'); out.rest = bondRest();
      P.cds = {}; bondCast(SKILLS.royalbond, 1, null); adv(1); out.restBlocks = !SUMMONS.some(s => s.beast === 'bound');
      S.bound.restUntil = Date.now() - 1; P.cds = {}; bondCast(SKILLS.royalbond, 1, null); out.afterRest = SUMMONS.some(s => s.beast === 'bound');
      return out; });
    assert.ok(r.listed && r.kept, 'the Sovereign can learn Royal Bond again');
    assert.ok(r.bigRefused, 'a boss above your level cannot be bound'); assert.ok(r.bound, 'a boss at 30% HP and your level or lower is bound');
    assert.ok(r.firstOut && r.noComeback, 'bound and called once; it does not come back by itself');
    assert.ok(r.boundOut && r.cap <= r.max, `the bound boss counts toward the beast limit: ${r.cap} of ${r.max}`);
    assert.strictEqual(r.dur, 45, '45 seconds on the field'); assert.ok(r.gone && r.rest > 80, 'then it rests about 90 s: ' + r.rest);
    assert.ok(r.restBlocks, 'it cannot be called while resting'); assert.ok(r.afterRest, 'after its rest it comes again');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
