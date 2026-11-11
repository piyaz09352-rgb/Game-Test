/* VAYRATHEN — tests/family274.test.js — (v274) pack leaders bring their families: a mate (bigger, tougher) and young
   (small, weak) that follow the leader; hit one and the whole family comes for you; ordinary monsters have none. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('monster families: parents and young, sizes and strength, the family defends itself', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const id = MAPS.findIndex((m, i) => i > 0 && m && m.mobs && m.mobs.some(t => MOB[t] && MOB[t].race === 'brute' && !MOB[t].boss) && !(typeof isTown === 'function' && isTown(i)));
      warpTo(id); const type = MAPS[id].mobs.find(t => MOB[t] && MOB[t].race === 'brute' && !MOB[t].boss), base = MOB[type].hp;
      // an ordinary monster never brings a family
      const plain = spawnMob(type, P.x + 260, P.y, {zone:MAPZ}); await new Promise(r => setTimeout(r, 30));
      const out = {plain:!plain.fam};
      FAM.mate = 1; const lead = spawnMob(type, P.x + 200, P.y, {zone:MAPZ}); if (!lead.elite) makeElite(lead); await new Promise(r => setTimeout(r, 30)); FAM.mate = .5;
      const fam = mobs.filter(m => m.fam && m.fam === lead.fam), young = fam.filter(m => m.famRole === 'young'), par = fam.filter(m => m.famRole === 'father' || m.famRole === 'mother');
      Object.assign(out, {n:fam.length, young:young.length, par:par.length, lead:!!lead.famLead && lead.elite, parHp:par[0] && par[0].maxhp > base * 1.3, youngHp:young[0] && young[0].maxhp < base * .6, sz:[par[0] && par[0].famSz, young[0] && young[0].famSz], tags:fam.filter(m => m.tagTxt).map(m => m.tagTxt[0]), noElite:young.every(m => !m.elite)});
      for (const m of fam) m.aggro = false; applyDamage(young[0], {dmg:1, crit:false}); out.all = fam.every(m => m.aggro);
      const copy = spawnMob(type, P.x + 320, P.y, {zone:MAPZ}); mobExApply(copy, mobEx(young[0])); out.net = copy.famRole === 'young' && copy.famSz < 1 && copy.tagTxt[0] === 'ลูก';   // what other players in the room see
      return out; });
    assert.ok(r.plain, 'an ordinary monster has no family'); assert.ok(r.lead, 'the pack leader heads the family'); assert.ok(r.noElite, 'the young are never leaders themselves');
    assert.ok(r.n >= 3 && r.young >= 1 && r.par >= 1, 'the leader, its mate and young: ' + JSON.stringify(r));
    assert.ok(r.parHp && r.youngHp, 'parents tougher, young weaker'); assert.ok(r.sz[0] > 1 && r.sz[1] < 1, 'parents bigger, young smaller');
    assert.ok(r.tags.includes('ลูก') && (r.tags.includes('พ่อ') || r.tags.includes('แม่')), 'named father / mother / young');
    assert.ok(r.all, 'hit one, the whole family turns on you'); assert.ok(r.net, 'online, the others in the room see the family too');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
