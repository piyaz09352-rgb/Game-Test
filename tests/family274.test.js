/* VAYRATHEN — tests/family274.test.js — (v274) animal families: a parent (bigger, tougher) with young (small, weak)
   that follow it; hit one and the whole family comes for you; never on a non-animal or a boss. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('monster families: parents and young, sizes and strength, the family defends itself', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const id = MAPS.findIndex((m, i) => i > 0 && m && m.mobs && m.mobs.some(t => MOB[t] && MOB[t].race === 'brute' && !MOB[t].boss) && !(typeof isTown === 'function' && isTown(i)));
      warpTo(id); const type = MAPS[id].mobs.find(t => MOB[t] && MOB[t].race === 'brute' && !MOB[t].boss), base = MOB[type].hp;
      FAM.chance = 1; const n0 = mobs.length, lead = spawnMob(type, P.x + 200, P.y, {zone:MAPZ}); FAM.chance = .25;
      const fam = mobs.filter(m => m.fam === lead.fam), young = fam.filter(m => m.famRole === 'young'), par = fam.filter(m => m.famRole !== 'young');
      const out = {n:fam.length, young:young.length, par:par.length, parHp:par[0].maxhp > base * 1.3, youngHp:young[0].maxhp < base * .6, sz:[par[0].famSz, young[0].famSz], tags:fam.map(m => m.tagTxt[0])};
      for (const m of fam) m.aggro = false; applyDamage(young[0], {dmg:1, crit:false}); out.all = fam.every(m => m.aggro);
      // a non-animal never makes a family
      const other = Object.keys(MOB).find(k => MOB[k].race && MOB[k].race !== 'brute' && !MOB[k].boss); FAM.chance = 1; const o = spawnMob(other, P.x + 260, P.y, {zone:MAPZ}); FAM.chance = .25; out.other = !o.fam;
      return out; });
    assert.ok(r.n >= 2 && r.young >= 1 && r.par >= 1, 'a parent and young: ' + JSON.stringify(r));
    assert.ok(r.parHp && r.youngHp, 'parents tougher, young weaker'); assert.ok(r.sz[0] > 1 && r.sz[1] < 1, 'parents bigger, young smaller');
    assert.ok(r.tags.includes('ลูก') && (r.tags.includes('พ่อ') || r.tags.includes('แม่')), 'named father / mother / young');
    assert.ok(r.all, 'hit one, the whole family turns on you'); assert.ok(r.other, 'only animals live in families');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
