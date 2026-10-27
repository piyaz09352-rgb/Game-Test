/* VAYRATHEN — tests/allybuff.test.js — support skills also land on the heroes around you; boss clock follows real time */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('a heal and a shield reach the friend next to me, not one far away', { skip, timeout: 240000 }, async () => {
  const { players, close } = await openPlayers(2, { merge: false });
  try {
    for (const [i, p] of players.entries()){
      await enterWorld(p.page, 'Ally' + i);
      await p.page.evaluate(() => { S.lvl = 80; derive(); S.hp = DER.maxhp; loadMap(1); P.x = VSPAWN.x + 40; P.y = VSPAWN.y; });
    }
    const [A, B] = [players[0].page, players[1].page];
    await A.waitForFunction(() => abNear().length === 1, null, { timeout: 30000 });
    await B.evaluate(() => { S.hp = 10; delete P.buffs.goldshield; delete P.buffs.ward; });
    await A.evaluate(() => { S.job = 'physician'; derive(); execSkill('elixir', 6, null); execSkill('goldshield', 5, null); execSkill('ward', 1, null); execSkill('stealth', 5, null); });
    await B.waitForFunction(() => S.hp > 10 && P.buffs.goldshield && P.buffs.ward, null, { timeout: 30000 });
    const b = await B.evaluate(() => ({def:P.buffs.goldshield.def, br:P.buffs.ward.barrier, stealth:!!P.buffs.stealth, hp:S.hp, max:DER.maxhp}));
    assert.equal(b.def, 30); assert.ok(b.br > 0 && b.br <= b.max * 1.25); assert.equal(b.stealth, false, 'self-only buffs stay with the caster');
    // a friend far away gets nothing
    await B.evaluate(() => { P.x += 1500; delete P.buffs.goldshield; });
    await A.waitForFunction(() => abNear().length === 0, null, { timeout: 30000 });
    await A.evaluate(() => execSkill('goldshield', 5, null));
    await B.waitForTimeout(1500);
    assert.equal(await B.evaluate(() => !!P.buffs.goldshield), false);
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});
