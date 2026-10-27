/* VAYRATHEN — tests/netsummon.test.js — a Summoner's beasts (and the Warden's spirit tiger) are visible to the other player */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('other players see my summoned beasts, bound boss and spirit tiger — and they vanish when mine do', { skip, timeout: 240000 }, async () => {
  const { players, close } = await openPlayers(2, { merge: false });
  try {
    for (const [i, p] of players.entries()){
      await enterWorld(p.page, 'Hero' + i);
      await p.page.evaluate(() => { S.lvl = 80; derive(); S.hp = DER.maxhp; loadMap(1); P.x = VSPAWN.x + 40; P.y = VSPAWN.y; });
    }
    const [A, B] = [players[0].page, players[1].page];
    await A.evaluate(() => {
      S.job = 'sovereign'; S.skills = {...S.skills, royalbond:1}; derive(); S.sp = DER.maxsp;
      conjure(SKILLS.callsingha, 3); conjure(SKILLS.callnaga, 2);
      SUMMONS.push({kind:'tiger', x:P.x - 20, y:P.y + 8, t:0, dur:30, lv:1, atkCd:.4, dir:0, target:null});
      S.bound = {type:Object.keys(MOB).find(k => MOB[k].boss), hp:1}; spawnBound();
    });
    const seen = () => B.evaluate(() => { const g = [...NET.ghosts.values()].find(x => x.sums); return g ? [...g.sums.keys()].sort() : []; });
    await B.waitForFunction(() => [...NET.ghosts.values()].some(g => g.sums && g.sums.size >= 4), null, { timeout: 30000 });
    const keys = await seen();
    assert.ok(keys.includes('b:singha') && keys.includes('b:naga') && keys.includes('t:tiger') && keys.some(k => k.startsWith('o:')), 'all four kinds arrive: ' + keys);
    // they are drawn on B's screen next to the caster, without errors
    const near = await B.evaluate(() => { const g = [...NET.ghosts.values()].find(x => x.sums); return [...g.sums.values()].every(o => Math.hypot(o.x - g.x, o.y - g.y) < 260); });
    assert.ok(near, 'beasts stand around their caster');
    const drew = await B.evaluate(() => { const l = []; LIVE.ents(l, ctx); const n = l.length; l.forEach(e => e.f()); return n; });
    assert.ok(drew >= 4, 'beasts are queued for drawing: ' + drew);
    // renewing / losing them clears them for the other player
    await A.evaluate(() => { SUMMONS.length = 0; S.bound = null; });
    await B.waitForFunction(() => ![...NET.ghosts.values()].some(g => g.sums), null, { timeout: 30000 });
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});
