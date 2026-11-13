/* VAYRATHEN — tests/classfx301.test.js — (v301) every class line has its own signature on its skills, tied to the pose
   · the twelve lines each have a token and a seal of their own; a rune or ninja spell takes its element's token;
   · every active skill of every line casts with the class layer and draws for a second without an error;
   · a pose puts its own piece on the body (a guard = a shield arc, a hand sign = an upright sigil…);
   · a skill's first hit and a normal attack leave the line's mark; no skill's numbers change */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('class skill effects: a look per line, every skill draws, poses and hits have their piece', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const o = {}; loadMap(1); P.x = W * .3; P.y = H * .32; SETTINGS.hitStop = false;
      const lines = ['blade', 'rune', 'ranger', 'muay', 'healer', 'rogue', 'summoner', 'occult', 'merchant', 'catfolk', 'dogfolk', 'ninja'];
      o.toks = new Set(lines.map(l => CFX_LINETOK[l])).size; o.drawn = lines.every(l => typeof CFX_TOK[CFX_LINETOK[l]] === 'function') && Object.values(CFX_ELTOK).every(k => typeof CFX_TOK[k] === 'function');
      o.elem = [cfxLook(SKILLS.firebolt).tok, cfxLook(SKILLS.icebolt).tok, cfxLook(SKILLS.katon).tok, cfxLook(SKILLS.quickslash).tok, cfxLook(SKILLS.waveslash).tok];
      const dmg0 = SKILLS.waveslash.dmg(5);
      // every active skill: cast it, let it draw
      let n = 0, withFx = 0; const bad = []; const ids = Object.keys(SKILLS).filter(id => SKILLS[id].type !== 'passive' && JOBS[SKILLS[id].job]);
      for (const id of ids){ const sk = SKILLS[id]; for (const m of mobs) m.dead = true; S.job = sk.job; S.lvl = 150; S.jlvl = 70; S.skills = {[id]:Math.min(5, sk.max || 5)}; try { derive(); } catch (e) { continue; } S.sp = 1e6; S.hp = DER.maxhp; P.dead = false; P.x = W * .3; P.y = H * .32; P.cds = {}; P.cast = null;
        const m = spawnMob(MAPS[1].mobs[0], P.x + 70, P.y, {zone:MAPZ}); m.hp = m.maxhp = 1e9; const f0 = SKFX.fx.length; SKFX.fx.length = 0;
        try { execSkill(id, S.skills[id], m); n++; if (SKFX.fx.length > 0) withFx++; } catch (e) { bad.push(id + ': ' + e.message); }
        if (n % 12 === 0) await new Promise(res => setTimeout(res, 120)); }
      await new Promise(res => setTimeout(res, 900)); o.n = n; o.withFx = withFx; o.bad = bad; o.same = SKILLS.waveslash.dmg(5) === dmg0;
      // poses
      const count = f => { SKFX.fx.length = 0; f(); return SKFX.fx.length; };
      const L = cfxLook(SKILLS.goldshield); o.pose = ['guard', 'seal', 'shout', 'slam', 'kick', 'invoke', 'wai', 'crossslash', 'whirl'].map(a => count(() => cfxPose({act:a, type:'melee', job:'swordsman'}, L, 1, 2, 0, .5)));
      // hits
      for (const m of mobs) m.dead = true; const m = spawnMob(MAPS[1].mobs[0], P.x + 40, P.y, {zone:MAPZ}); m.hp = m.maxhp = 1e9;
      o.skillHit = count(() => { CFX.cur = {id:'waveslash', t:T, n:0}; applyDamage(m, {dmg:10}, SKILLS.waveslash); });
      CFX.lastBasic = -9; o.basicHit = count(() => applyDamage(m, {dmg:10}));
      await new Promise(res => setTimeout(res, 500)); return o; });
    assert.strictEqual(r.toks, 12, 'twelve lines, twelve tokens'); assert.ok(r.drawn, 'every token has a drawing');
    assert.deepStrictEqual(r.elem, ['flame', 'shard', 'flame', 'shuriken', 'sword'], 'element spells take the element token; the rest keep the class token');
    assert.deepStrictEqual(r.bad, [], 'no skill throws'); assert.ok(r.n > 200 && r.withFx === r.n, `every active skill casts with effects (${r.withFx}/${r.n})`);
    assert.ok(r.same, 'numbers unchanged'); assert.ok(r.pose.every(v => v > 0), 'each pose has its piece: ' + r.pose);
    assert.ok(r.skillHit >= 2, 'a skill hit leaves the mark and a seal: ' + r.skillHit); assert.ok(r.basicHit >= 1, 'a normal attack leaves a small mark');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
