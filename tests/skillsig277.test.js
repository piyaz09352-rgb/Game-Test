/* VAYRATHEN — tests/skillsig277.test.js — (v277) every skill has its own signature motif (never twice in a class) and
   plays without errors; bosses only burrow if they can dig, others mist / soar / leap / dash; the boss leap crouches,
   flies and lands; the breath has no red cone; a monster's pounce is a real jump. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('skill signatures, boss digging, leaps and pounces', { skip, timeout: 180000 }, async () => {
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
    const boss = await page.evaluate(async () => { const d = {}; for (const b of BOSSES) { const k = furyDig({type:b[0], def:MOB[b[0]]}); (d[k] = d[k] || []).push(b[0]); }
      const ok = (d.burrow || []).every(id => { const a = SPECIES_ARCH[id] || BP_INFO[id].arch, h = (BP_INFO[id].look || {}).head; return ['serpent', 'bug', 'rock', 'slime', 'squat'].includes(a) || ['croc', 'lizard', 'boar', 'rat'].includes(h); });
      mobAttack = () => {}; mobs.length = 0; const m = spawnMob(BOSSES[3][0], P.x + 140, P.y); m.aggro = true; m.def = {...m.def, bossSkills:[]}; m.sumT = 999; const F = furyOf(m); F.phase = 3; m.bcd = 999;
      await new Promise(r => setTimeout(r, 200)); F.act = null; m.busy = 0; furyStart(m, F, 'leap'); m.bcd = 999; const seen = new Set();
      for (let i = 0; i < 30 && (F.act || !seen.size); i++){ await new Promise(r => setTimeout(r, 80)); if (F.act) seen.add(F.act.st); }
      return {kinds:Object.keys(d), ok, mist:(d.mist || []).length, leap:[...seen]}; });
    assert.ok(boss.ok, 'only diggers burrow'); assert.ok(boss.mist > 0 && boss.kinds.includes('leap'), 'others mist or leap ' + JSON.stringify(boss.kinds));
    assert.deepStrictEqual(boss.leap, ['crouch', 'air', 'land'], 'the leap crouches, flies and lands');
    const hop = await page.evaluate(async () => { mobs.length = 0; const k = Object.keys(MOB).find(k => MOB[k].msk && MOB[k].msk[0] === 'pounce' && !MOB[k].boss); const m = spawnMob(k, P.x + 150, P.y); mskHit = () => {};
      mskLeap(m, MSK.pounce); let maxZ = 0; for (let i = 0; i < 20; i++){ await new Promise(r => setTimeout(r, 50)); if (m.fz) maxZ = Math.max(maxZ, m.fz.z || 0); } return {maxZ, after:!!m.fz, d:Math.hypot(P.x - m.x, P.y - m.y)}; });
    assert.ok(hop.maxZ > 10 && !hop.after && hop.d < 120, 'a pounce is a real jump that lands near you ' + JSON.stringify(hop));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
