/* VAYRATHEN — tests/skillsig277.test.js — (v277) every skill has its own signature motif (never twice in a class) and
   plays without errors; bosses only burrow if they can dig, others mist / soar / dash; the breath has no red cone.
   (v283) the owner removed every jump at the hero: no boss leap, no monster pounce or dive, and the signature
   "pounce" (vanish and land behind you) became a ground rush along a warned line. This test now guards that. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('skill signatures, boss digging, no leaps or pounces', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const sig = await page.evaluate(async () => { sigAssign(); const act = Object.keys(SKILLS).filter(k => SKILLS[k].type !== 'passive');
      const missing = act.filter(k => !SIGFX.of[k] || !SIG_DRAW[SIGFX.of[k].mo]);
      const dupClasses = Object.entries(JOBS).filter(([, j]) => { const ms = (j.skills || []).filter(id => SIGFX.of[id]).map(id => SIGFX.of[id].mo); return new Set(ms).size !== ms.length; }).map(([k]) => k);
      const kinds = new Set(Object.values(SIGFX.of).map(v => v.mo)).size;
      loadMap(1); await new Promise(r => setTimeout(r, 300)); const m = mobs.find(o => !o.dead) || spawnMob(MAPS[1].mobs[0], P.x + 80, P.y);
      for (const id of act.slice(0, 60)) grandFx(id, 5, m); await new Promise(r => setTimeout(r, 900));
      return {missing, dupClasses, kinds, live:SIGFX.list.length}; });
    assert.deepStrictEqual(sig.missing, [], 'every active skill has a motif'); assert.deepStrictEqual(sig.dupClasses, [], 'no class repeats a motif');
    assert.ok(sig.kinds >= 16, 'the motifs are spread over the realm: ' + sig.kinds); assert.ok(sig.live > 0, 'signatures play');
    // bosses: diggers burrow, spirits mist, fliers soar, the rest dash — nobody leaps
    const boss = await page.evaluate(async () => { const d = {}; for (const b of BOSSES) { const k = furyDig({type:b[0], def:MOB[b[0]]}); (d[k] = d[k] || []).push(b[0]); }
      const ok = (d.burrow || []).every(id => { const a = SPECIES_ARCH[id] || BP_INFO[id].arch, h = (BP_INFO[id].look || {}).head; return ['serpent', 'bug', 'rock', 'slime', 'squat'].includes(a) || ['croc', 'lizard', 'boar', 'rat'].includes(h); });
      mobAttack = () => {}; mobs.length = 0; const m = spawnMob(BOSSES[3][0], P.x + 140, P.y); m.aggro = true; m.def = {...m.def, bossSkills:[]}; m.sumT = 999; const F = furyOf(m); F.phase = 3; m.bcd = 999;
      await new Promise(r => setTimeout(r, 200)); F.act = null; m.busy = 0; furyStart(m, F, 'dash'); m.bcd = 999; const seen = new Set(); let maxZ = 0;
      for (let i = 0; i < 30 && (F.act || !seen.size); i++){ await new Promise(r => setTimeout(r, 80)); if (F.act) seen.add(F.act.st); maxZ = Math.max(maxZ, F.z || 0); }
      return {kinds:Object.keys(d), ok, mist:(d.mist || []).length, dash:[...seen], maxZ, leapName:typeof FURY_SK !== 'undefined' && !!FURY_SK.leap}; });
    assert.ok(boss.ok, 'only diggers burrow'); assert.ok(boss.mist > 0 && boss.kinds.includes('dash') && !boss.kinds.includes('leap'), 'others mist or dash, never leap ' + JSON.stringify(boss.kinds));
    assert.ok(boss.dash.includes('aim') && boss.dash.includes('go') && boss.maxZ === 0 && !boss.leapName, 'the dash aims and runs along the ground ' + JSON.stringify(boss));
    // ordinary monsters: the pounce and the dive are gone; the maul is a melee strike that never lifts the monster
    const hop = await page.evaluate(async () => { mobs.length = 0; const left = Object.keys(MOB).filter(k => Array.isArray(MOB[k].msk) && MOB[k].msk.some(s => s === 'pounce' || s === 'dive'));
      const k = Object.keys(MOB).find(k => MOB[k].msk && MOB[k].msk[0] === 'maul' && !MOB[k].boss); const m = spawnMob(k, P.x + 40, P.y); m.aggro = true; mskHit = () => {};
      mskCast(m, 'maul'); let maxZ = 0; for (let i = 0; i < 12; i++){ await new Promise(r => setTimeout(r, 50)); if (m.fz) maxZ = Math.max(maxZ, m.fz.z || 0); }
      return {left, k, maxZ, noLeapFn:typeof mskLeap === 'undefined', noTable:!MSK.pounce && !MSK.dive && !!MSK.maul && !!MSK.gale}; });
    assert.deepStrictEqual(hop.left, [], 'no monster keeps a pounce or a dive'); assert.ok(hop.k && hop.maxZ === 0 && hop.noLeapFn && hop.noTable, 'the maul stays on the ground ' + JSON.stringify(hop));
    // the signature pounce became a rush along the ground: the boss is never hidden, and it closes on the hero
    const rush = await page.evaluate(async () => { mobs.length = 0; const noPounce = Object.values(SIG).every(s => s[2] !== 'pounce') && SIG_ELEM.neutral === 'rush';
      const k = Object.keys(SIG).find(k => SIG[k][2] === 'rush' && MOB[k]); const m = spawnMob(k, P.x + 260, P.y); m.aggro = true; const d0 = Math.hypot(P.x - m.x, P.y - m.y);
      sigStart(m); let hidden = false; for (let i = 0; i < 28; i++){ await new Promise(r => setTimeout(r, 50)); if (m.hiddenSig) hidden = true; }
      return {noPounce, k, kind:m.sig && m.sig.kind, hidden, d0, d1:Math.hypot(P.x - m.x, P.y - m.y)}; });
    assert.ok(rush.noPounce && rush.k && !rush.hidden && rush.d1 < rush.d0 - 60, 'the rush runs in along the ground, never vanishing ' + JSON.stringify(rush));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
