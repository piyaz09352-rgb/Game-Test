/* VAYRATHEN — tests/bossrange242.test.js — (v242) caster and archer bosses: they shoot from range, never leap onto a
   hero who stands back, blink away when you stand next to them, and casters' bolts land on MDEF. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('ranged bosses keep their distance and cast on MDEF', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const o = {}, wait = ms => new Promise(res => setTimeout(res, ms)); S.tut = {done:true, i:99};
      o.count = Object.values(MOB).filter(d => d.boss && d.bossRanged).length;
      o.noMelee = Object.values(MOB).filter(d => d.boss && d.bossRanged).every(d => !d.bossSkills.includes('charge') && !d.bossSkills.includes('bladestorm'));
      playerDie = () => { S.hp = DER.maxhp; }; S.job = 'blade'; S.lvl = 170; derive(); S.hp = DER.maxhp;
      const mid = Object.keys(MAPS).find(i => MAPS[i].boss === 'agnilord'); loadMap(+mid); mobs.length = 0; P.x = 1400; P.y = 900;
      const b = spawnMob('agnilord', P.x + 150, P.y); b.aggro = true; b.bcd = 99;
      // a caster's bolt reads MDEF, not DEF (armour takes 70% off at most)
      const hit = (def, mdef) => { DER.def = def; DER.mdef = mdef; S.hp = DER.maxhp * 10; const h = S.hp, keep = Math.random; Math.random = () => .5; try { mobAttack(b, 1, true); } finally { Math.random = keep; } return h - S.hp; };
      const base = hit(0, 0); o.defNoEffect = hit(9999, 0) / base; o.mdefCut = hit(0, 9999) / base; derive(); S.hp = DER.maxhp;
      P.x = b.x + 40; P.y = b.y; await wait(500); o.blink = Math.round(Math.hypot(b.x - P.x, b.y - P.y));
      P.x = b.x + 700; P.y = b.y; b.leapT = 0; await wait(1500); o.far = Math.round(Math.hypot(b.x - P.x, b.y - P.y)); o.leapt = o.far < 100;
      return o; });
    assert.ok(r.count >= 14, 'fourteen bosses fight from range: ' + r.count);
    assert.ok(r.noMelee, 'no charge or blade whirl among their moves');
    assert.ok(r.defNoEffect > .9 && r.mdefCut < .4, 'a caster bolt lands on MDEF, not DEF: ' + r.defNoEffect + ' / ' + r.mdefCut);
    assert.ok(r.blink > 120, 'stand next to it and it blinks away: ' + r.blink);
    assert.ok(!r.leapt, 'no leap onto a hero who stands back: ' + r.far);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
