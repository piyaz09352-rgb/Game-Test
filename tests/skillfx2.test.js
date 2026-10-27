/* VAYRATHEN — tests/skillfx2.test.js — (v116) the skills that shared a look each have their own effect and pose;
   Shadow Clones is replaced by Moon Claws (points refunded) */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('unique effects and poses; Moon Claws replaces Shadow Clones', { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const c = el('confirm'); if (c) c.hidden = true; loadMap(1); P.x = W / 2; P.y = H / 2;
      const out = {fx:{}, pose:{}};
      const sig = id => `${SKILLS[id].fx}|${SKILLS[id].fxDash || ''}|${SKILLS[id].act}`;
      out.distinct = new Set(['spiritburst', 'goldenhong', 'deathmark', 'assassinate', 'shadowlunge', 'tigerpounce', 'moonclaw'].concat(SKILLS.shadowexec ? ['shadowexec'] : []).map(sig)).size;
      out.n = 7 + (SKILLS.shadowexec ? 1 : 0);
      out.noClone = !SKILLS.shadowclone && JOBS.tigershade.skills.includes('moonclaw') && !JOBS.tigershade.skills.includes('shadowclone');
      // refund
      S._sfx2 = 0; S.skills.shadowclone = 4; S.skPts = 0; S.hot[0] = 'shadowclone'; derive(); out.refund = S.skPts; out.hot = S.hot[0];
      for (const [job, ids] of [['sovereign', ['goldenhong']], ['tigershade', ['moonclaw', 'deathmark', 'tigerpounce'].concat(SKILLS.shadowexec ? ['shadowexec'] : [])]]){
        S.job = job; S.lvl = 150; S.jlvl = 70; S.skills = {}; for (const id of ids) S.skills[id] = 5; derive(); S.sp = 1e6; S.hp = DER.maxhp; heroSheet();
        for (const id of ids){
          const m = spawnMob(MAPS[1].mobs[0], P.x + 90, P.y, {zone:MAPZ}); m.hp = m.maxhp = 1e9; P.target = m; P.cds = {}; P.acd = 0; P.cast = null;
          const before = FX2.length; trySkill(id, m); await new Promise(r => setTimeout(r, 1800));
          out.fx[id] = FX2.length > before || out.fx[id] || false;
          const sh = heroSheet(); out.pose[id] = !!(sh && sh.index[SKILLS[id].act]);
          out.fx[id] = out.fx[id] || window.__fxSeen && window.__fxSeen[id];
          m.dead = true; P.x = W / 2; P.y = H / 2; }
      }
      return out;
    });
    assert.strictEqual(r.distinct, r.n, 'each of these skills has its own effect + pose');
    assert.ok(r.noClone, 'Shadow Clones is gone; Moon Claws is in its place');
    assert.strictEqual(r.refund, 4, 'points from Shadow Clones come back'); assert.strictEqual(r.hot, null, 'and it leaves the hotbar');
    for (const [id, ok] of Object.entries(r.pose)) assert.ok(ok, `${id} has its pose in the hero sheet`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
