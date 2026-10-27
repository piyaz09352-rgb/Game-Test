/* VAYRATHEN — tests/botbuff.test.js — (v108) Auto: buffs and summons are cast again only near their end,
   and a summoned beast that dies is called again at once */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('auto keeps buffs and summons up without recasting them early', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const c = el('confirm'); if (c) c.hidden = true; loadMap(1); P.x = W / 2; P.y = H / 2;
      const m = spawnMob(MAPS[1].mobs[0], P.x + 80, P.y, {zone:MAPZ}); m.hp = m.maxhp = 1e9;
      const only = (job, id) => { S.job = job; S.lvl = 200; S.jlvl = 70; S.skills = {[id]:10}; derive(); S.sp = 1e6; P.cds = {}; P.acd = 0; S.bot = null; const b = botSet(); b.list = [{id, on:true}]; b.spKeep = 0; };
      const out = {};
      // a buff on me: not while plenty is left, yes in its last 10 %
      only('blade', 'warcry'); P.buffs = {}; out.buffFirst = botPick(m);
      addBuff('warcry', {t:60}); out.buffFull = botPick(m);
      P.buffs.warcry.t = 20; out.buffHalf = botPick(m);
      P.buffs.warcry.t = 4; out.buffNearEnd = botPick(m);
      // a summoned beast: not while it is out, yes when nearly over, yes at once when it dies (even with no target)
      only('summoner', 'callsingha'); SUMMONS.length = 0;
      SUMMONS.push({kind:'beast', beast:'singha', t:0, dur:25, x:P.x, y:P.y});
      out.beastOut = botPick(m);
      SUMMONS[0].t = 23.5; out.beastNearEnd = botPick(m);
      SUMMONS.length = 0; out.beastDied = botPick(null);
      // the tiger (summon type) is no longer fired like an attack while it is out
      only('warden', 'tiger'); SUMMONS.length = 0; SUMMONS.push({kind:'tiger', t:0, dur:20, x:P.x, y:P.y});
      out.tigerOut = botPick(m); SUMMONS.length = 0; out.tigerGone = botPick(m);
      return out;
    });
    assert.strictEqual(r.buffFirst, 'warcry', 'a missing buff is cast');
    assert.strictEqual(r.buffFull, null, 'not recast right after');
    assert.strictEqual(r.buffHalf, null, 'not recast with a third left');
    assert.strictEqual(r.buffNearEnd, 'warcry', 'recast in its last 10 %');
    assert.strictEqual(r.beastOut, null, 'no new call while the beast is out');
    assert.strictEqual(r.beastNearEnd, 'callsingha', 'called again when nearly over');
    assert.strictEqual(r.beastDied, 'callsingha', 'called again at once when it died, even with no target');
    assert.strictEqual(r.tigerOut, null, 'the tiger is not spammed while out');
    assert.strictEqual(r.tigerGone, 'tiger', 'the tiger is called when gone');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
