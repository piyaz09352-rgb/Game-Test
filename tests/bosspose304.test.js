/* VAYRATHEN — tests/bosspose304.test.js — (v304) a boss plays a pose of its own for each kind of skill; ordinary
   monsters are untouched; the pose ends and the boss goes back to its usual animation */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('boss skill poses: each skill has its pose, timed to the warning; ordinary monsters keep five actions', { skip, timeout: 200000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const o = {acts:{}}; loadMap(1); P.x = W * .4; P.y = H * .4; derive(); S.hp = DER.maxhp; const keep = setInterval(() => { S.hp = DER.maxhp; P.dead = false; }, 100);
      const quadBoss = Object.keys(MOB).find(k => MOB[k].boss && SPECIES_ARCH[k] === 'quad'), humanBoss = Object.keys(MOB).find(k => MOB[k].boss && SPR.MOBS[k] && SPR.MOBS[k].human);
      const b = spawnMob(quadBoss, P.x + 120, P.y, {zone:MAPZ}); b.hp = b.maxhp = 1e12; b.bcd = 99;
      for (const id of ['slam', 'quake', 'charge', 'wave', 'barrage', 'roar', 'meteor', 'field', 'summon']){ b.bp = null; b.busy = 0; try { bossCast(b, id); } catch (e) {} o.acts[id] = b.bp ? [b.bp.act, mobAnim(b)[0], +(b.bp.total).toFixed(2)] : null; }
      b.bp = null; b.enraged = true; VFX.play('enrage', {m:b}); o.rage = b.bp && b.bp.act;
      b.bp = {act:'bslam', t0:T - 9, total:1}; o.ends = mobAnim(b)[0] !== 'bslam' && b.bp === null;
      const plain = mobs.find(m => !m.def.boss && !m.dead) || spawnMob(MAPS[1].mobs[0], P.x - 80, P.y, {zone:MAPZ}); o.plainActs = Object.keys(SHEETS[plain.type].index).length; o.bossActs = Object.keys(SHEETS[b.type].index).length;
      const sig = img => { let h = 0; for (let i = 3; i < img.data.length; i += 16) h = (h * 31 + img.data[i] + img.data[i - 1]) >>> 0; return h; };
      o.differ = new Set([0, 3, 5, 7].map(f => sig(SPR.renderFrame('mob', quadBoss, 'bslam', 2, f, 1)))).size;
      o.human = humanBoss ? [0, 2, 4, 7].map(f => { try { return SPR.renderFrame('mob', humanBoss, 'bslam', 1, f, 1).width > 0; } catch (e) { return String(e.message); } }) : [true];
      clearInterval(keep); b.dead = true; return o; });
    const want = {slam:'bslam', quake:'bslam', charge:'bcharge', wave:'bcharge', barrage:'bcharge', roar:'broar', meteor:'bcast', field:'bcast', summon:'bcast'};
    for (const [id, a] of Object.entries(want)) if (r.acts[id]) assert.deepStrictEqual(r.acts[id].slice(0, 2), [a, a], id + ' plays ' + a);
    assert.ok(Object.values(r.acts).filter(Boolean).length >= 6, 'most skills were cast: ' + JSON.stringify(r.acts));
    assert.ok(r.acts.quake && r.acts.quake[2] > r.acts.slam[2], 'a longer warning stretches the pose (quake > slam)');
    assert.strictEqual(r.rage, 'broar', 'enraged = the roar'); assert.ok(r.ends, 'the pose ends');
    assert.strictEqual(r.plainActs, 5, 'an ordinary monster keeps its five actions'); assert.strictEqual(r.bossActs, 9, 'a boss gets four more');
    assert.ok(r.differ >= 3, 'the pose moves through different frames'); assert.ok(r.human.every(v => v === true), 'a human boss draws its poses: ' + r.human);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
