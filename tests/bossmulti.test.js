/* 3 players, one map (v27: world clock, no host): everybody must see the SAME boss (same id, place, HP) — also when one of them leaves the map and comes back */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
const info = page => page.evaluate(() => ({ role: NM.mode === 'world' ? 'world' : NM.host ? 'host' : NM.slave ? 'slave' : 'alone', n: mobs.filter(m => !m.dead && m.def.boss && !m.wb).length,
  b: boss && !boss.dead ? { nid: boss.nid || null, x: Math.round(boss.x), y: Math.round(boss.y), f: +(boss.hp / boss.maxhp).toFixed(3) } : null }));
const all = ps => Promise.all(ps.map(p => info(p.page)));
async function settle(ps, ms = 4000){ await ps[0].page.waitForTimeout(ms); return all(ps); }
function same(rs, what){
  for (const r of rs){ assert.ok(r.b, `${what}: everyone has a boss ${JSON.stringify(rs)}`); assert.strictEqual(r.n, 1, `${what}: exactly one boss each ${JSON.stringify(rs)}`); }
  assert.ok(rs.every(r => r.b.nid === rs[0].b.nid), `${what}: same boss id ${JSON.stringify(rs)}`);
  assert.ok(rs.every(r => Math.abs(r.b.f - rs[0].b.f) < .03), `${what}: same HP ${JSON.stringify(rs)}`);
  // (v130) bosses are drawn ×1.8–2.6 now with a body radius ~45: "the same place" is within about two body widths
  assert.ok(rs.every(r => Math.hypot(r.b.x - rs[0].b.x, r.b.y - rs[0].b.y) < 130), `${what}: same place ${JSON.stringify(rs)}`);
}
test('3 players see one identical boss, also after one leaves and comes back', { skip, timeout: 300000 }, async () => {
  const { players, close } = await openPlayers(3, { merge: false });
  try {
    for (const [i, p] of players.entries()){ await enterWorld(p.page, 'Hero' + i);
      await p.page.evaluate(() => { S.lvl = 80; derive(); S.hp = DER.maxhp; loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; }); }
    await players[0].page.waitForTimeout(3000);
    for (const p of players) await p.page.evaluate(() => { bossTimer = 0; });
    let rs = await settle(players, 5000); same(rs, 'start');
    // someone damages it
    assert.ok(rs.every(r => r.role === 'world'), `nobody hosts: ${JSON.stringify(rs)}`);
    const hitter = players[1];
    for (let k = 0; k < 3; k++){ await hitter.page.evaluate(() => { const b = boss, d = Math.round(b.maxhp * .2); b.hp -= d; nmHit(b, d); nmFlushHits(); }); await hitter.page.waitForTimeout(400); }   // real hits arrive in small shares (the game clamps one message to 35%)
    rs = await settle(players, 3000); same(rs, 'after damage');
    // a slave leaves and returns
    const si = 1; await players[si].page.evaluate(() => loadMap(0));
    rs = await settle(players.filter((_, i) => i !== si), 3000); same(rs, 'one follower away');
    await players[si].page.evaluate(() => loadMap(1));
    rs = await settle(players, 8000); same(rs, 'follower came back');
    // the HOST leaves and returns
    const hi = 0; await players[hi].page.evaluate(() => loadMap(0));
    rs = await settle(players.filter((_, i) => i !== hi), 6000); same(rs, 'another one away (the world goes on)');
    await players[hi].page.evaluate(() => loadMap(1));
    rs = await settle(players, 6000); same(rs, 'that one came back');
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});
