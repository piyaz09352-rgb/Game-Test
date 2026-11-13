/* VAYRATHEN — tests/sfx301.test.js — (v301) the moments that had no sound now have one
   every new sound plays; a boss enraged, a boss skill, the hero falling, low HP, a stun, mounting, «not enough SP»,
   a refine result and the three names that were asked for but missing (blink, equip, drop) each call their sound */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('missing sounds: boss rage and warnings, fall, heartbeat, stun, mount, deny, refine, blink/equip/drop', { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page); await page.mouse.click(300, 300);
    const r = await page.evaluate(async () => { const o = {}; SFX.unlock && SFX.unlock(); try { SFX.play('click'); } catch (e) {} await new Promise(res => setTimeout(res, 200)); o.audio = !!(SFX.raw && SFX.raw());
      const names = ['bossRage', 'bossWarn', 'bossCome', 'fall', 'heart', 'stun', 'deny', 'mount', 'dismount', 'refineOk', 'refineFail', 'blink', 'equip', 'drop'];
      o.play = names.filter(n => { SFX3.last = {}; try { return sfx301(n) === true; } catch (e) { return false; } }); o.names = names; o.unknown = sfx301('nope');
      const got = []; const _s = sfx301; sfx301 = function(n){ got.push(n); return true; };
      loadMap(1); P.x = W * .3; P.y = H * .3; await new Promise(res => setTimeout(res, 2600)); const bk = Object.keys(MOB).find(k => MOB[k].boss && (MOB[k].bossSkills || []).includes('enrage')); const b = spawnMob(bk, P.x + 60, P.y, {zone:MAPZ}); b.enraged = true; VFX.play('enrage', {m:b});
      try { const id = b.def.bossSkills.find(s => s !== 'enrage'); if (id) bossCast(b, id); } catch (e) { got.push('castErr:' + e.message); } b.dead = true;
      toast(L('SP ไม่พอ', 'Not enough SP')); log(L('ตีบวกสำเร็จ! +5', 'Refine success! +5'), 'g'); log(L('ตีบวกล้มเหลว อาวุธเหลือ +4', 'Refine failed, weapon is now +4'), 'r');
      SFX.play('blink'); SFX.play('equip'); SFX.play('drop'); toggleRide(); toggleRide();
      derive(); S.hp = Math.max(1, Math.floor(DER.maxhp * .1)); P.stunT = 1; await new Promise(res => setTimeout(res, 400)); P.stunT = 0; S.hp = DER.maxhp;
      GWN.wake = 99; playerDie(); await new Promise(res => setTimeout(res, 200)); sfx301 = _s; o.got = got; return o; });
    if (r.audio) assert.deepStrictEqual(r.play, r.names, 'every new sound plays'); assert.strictEqual(r.unknown, false, 'an unknown name plays nothing');
    for (const n of ['bossRage', 'bossWarn', 'bossCome', 'deny', 'refineOk', 'refineFail', 'blink', 'equip', 'drop', 'mount', 'dismount', 'heart', 'stun', 'fall']) assert.ok(r.got.includes(n), n + ' is heard at its moment: ' + r.got);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
