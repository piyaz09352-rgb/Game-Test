/* VAYRATHEN — tests/bossfx302.test.js — (v302) a boss's skills take the look of its land; Settings can turn the class
   and boss layers off; prop pictures are painted when first needed, and come out the same */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('boss effects by land, the settings switches, lazy prop pictures', { skip, timeout: 200000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const o = {lands:{}, casts:{}};
      for (const [map, want] of [[17, 'sea'], [65, 'lava'], [30, 'sky'], [22, 'wild'], [51, 'ruin'], [21, 'arid'], [10, 'civil'], [31, 'fertile'], [1, null]]){ loadMap(map); o.lands[map] = [bfxLook(null).land, want, typeof CFX_TOK[bfxLook(null).tok]]; }
      loadMap(17); P.x = W * .4; P.y = H * .4; derive(); S.hp = DER.maxhp; const bk = Object.keys(MOB).find(k => MOB[k].boss); const b = spawnMob(bk, P.x + 100, P.y, {zone:MAPZ}); b.hp = b.maxhp * .5;
      for (const id of ['slam', 'quake', 'charge', 'wave', 'barrage', 'meteor', 'summon', 'heal', 'roar', 'field', 'teleport']){ SKFX.fx.length = 0; try { bfxCast(b, id); o.casts[id] = SKFX.fx.length; } catch (e) { o.casts[id] = 'ERR ' + e.message; } }
      SETTINGS.classFx = false; SKFX.fx.length = 0; bfxCast(b, 'quake'); cfxCast('goldshield', 5, null, {x:P.x, y:P.y}); o.off = SKFX.fx.length; SETTINGS.classFx = true; b.dead = true;
      o.heartDefault = SETTINGS.heartbeat === true;
      // lazy props: nothing painted until asked, and the same picture each time
      for (const k in propCache) delete propCache[k]; let painted = 0; const _o = outlinePass; outlinePass = function(){ painted++; return _o.apply(this, arguments); };
      const im = propImg('tree', 2); o.lazy0 = painted; const w = im.w, c1 = im.img; o.lazy1 = painted; const c2 = im.img; o.lazy2 = painted; o.sameObj = c1 === c2 && c1.width > 0 && w > 0;
      const fl = propImg('tree', 1002); o.lazy3 = painted; o.flipW = fl.img.width === c1.width; outlinePass = _o;
      await new Promise(res => setTimeout(res, 800)); return o; });
    for (const [map, [got, want, tok]] of Object.entries(r.lands)){ assert.strictEqual(got, want, 'land of map ' + map); assert.strictEqual(tok, 'function', 'its token draws'); }
    for (const [id, n] of Object.entries(r.casts)) assert.ok(id === 'field' ? n === 0 : n > 0, `boss skill ${id} has its land layer (${n}; the pool's comes when the pool opens)`);
    assert.strictEqual(r.off, 0, 'Settings: class skill effects off silences both layers'); assert.ok(r.heartDefault, 'the heartbeat is on by default');
    assert.deepStrictEqual([r.lazy0, r.lazy1, r.lazy2], [0, 1, 1], 'a prop is painted once, when its picture is first needed'); assert.ok(r.sameObj && r.flipW, 'the picture is kept; the mirrored one matches it');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
