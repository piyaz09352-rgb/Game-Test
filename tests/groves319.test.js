/* VAYRATHEN — tests/groves319.test.js — (v319) hunting-map trees stand in groves with glades between and a wood along the
   edge (not spread evenly); pack leaders act their skills with a pose */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('groves on hunting maps; pack leaders act their skills', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const out = {maps:{}};
      for (const id of [1, 3, 7, 71]){ loadMap(id); await new Promise(res => setTimeout(res, 50));
        const t = PROPS.filter(p => GRV.trees.has(p.type)), edge = t.filter(p => Math.min(p.x, W - p.x, p.y, H - p.y) < 280).length / t.length;
        const grouped = t.filter(p => t.filter(q => q !== p && Math.hypot(q.x - p.x, q.y - p.y) < 170).length >= 3).length / t.length;
        const onTrail = t.filter(p => trailD(p.x, p.y) < 40).length;
        out.maps[id] = {n:t.length, edge:+edge.toFixed(2), grouped:+grouped.toFixed(2), onTrail}; }
      loadMap(1); derive(); S.hp = DER.maxhp; const m = spawnMob(MAPS[1].mobs[0], P.x + 120, P.y, {zone:MAPZ}); makeElite(m); m.aggro = true;
      out.elite = []; for (let i = 0; i < 10; i++){ m.bp = null; m.rallyT = 0; eliteCast(m); out.elite.push(m.bp ? m.bp.act : null); }
      const plain = spawnMob(MAPS[1].mobs[0], P.x - 120, P.y, {zone:MAPZ}); out.plainBp = plain.bp || null; m.dead = plain.dead = true;
      return out; });
    for (const [id, v] of Object.entries(r.maps)){
      assert.ok(v.n > 30, `map ${id}: has its trees: ${v.n}`);
      assert.ok(v.edge >= .3, `map ${id}: a wood along the edge: ${v.edge}`);
      assert.ok(v.grouped >= .5, `map ${id}: most trees stand in groves: ${v.grouped}`);
      assert.strictEqual(v.onTrail, 0, `map ${id}: no tree on the trail`); }
    assert.ok(r.elite.every(a => ['broar', 'bslam', 'bcharge', 'bbreath', 'bcast'].includes(a)), 'a pack leader poses every skill: ' + r.elite);
    assert.strictEqual(r.plainBp, null, 'an ordinary monster plays no skill pose');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
