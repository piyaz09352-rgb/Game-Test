/* VAYRATHEN — tests/nocroc286.test.js — (v286) nothing looks like a crocodile; the fashion mounts are gone
   · every long lizard (monitors, salamander, makara …) is a hog badger now: a furred animal with a pig's snout
   · only the Golden Deer is left to ride: no wardrobe/coin-shop/story/tower mount, and coins spent on one come back once */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('no crocodile look-alikes, only the Golden Deer to ride', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const crocs = Object.keys(MOB).filter(k => /ตะกวด|จระเข้|กิ้งก่า|ซาลาแมนเดอร์/.test(MOB[k].name) || /Monitor|Crocodile|Lizard|Salamander/.test(MOB[k].en || ''));
      const draws = [...NOCROC].slice(0, 6).every(k => { try { SPR.renderFrame('mob', k, 'idle', 1, 0, 1); return true; } catch (e) { return false; } });
      // mounts: none left but the deer; a bought coin mount is refunded once and taken off
      const mounts = Object.keys(XMOUNT), tabs = FW_TABS.map(t => t[0]);
      const anyGone = Object.keys(MOUNT_GONE).find(k => MOUNT_GONE[k].price && MOUNT_GONE[k].price.c > 0), price = MOUNT_GONE[anyGone].price.c;
      ACC.wardrobe = {...(ACC.wardrobe || {}), [anyGone]:1}; ACC.mntGone = {}; S.cos = {...(S.cos || {}), mount:anyGone}; const c0 = ACC.coins || 0;
      mountGoneSweep(); const c1 = ACC.coins || 0; ACC.wardrobe[anyGone] = 1; mountGoneSweep(); const c2 = ACC.coins || 0;
      S.inv.mount1 = 1; P.ride = true; const rideOk = P.ride && !(SPR.CHARS.warlord || {}).mount; P.ride = false;
      // (v290) the rewards that replaced the story / tower mounts: coins, once per account
      ACC.mntRwd = {}; const a0 = MS_ARCS[0]; for (const m of a0.maps) msS().done[m] = 1; twSt().best = 100;
      const r0 = ACC.coins || 0; mountRewardSweep(); const r1 = ACC.coins || 0; mountRewardSweep(); const r2 = ACC.coins || 0;
      return { rwd:r1 - r0, rwdAgain:r2 - r1, crocs, draws, n:NOCROC.size, mounts, tabs, refund:c1 - c0, again:c2 - c1, worn:S.cos.mount || null, rideOk, gone:Object.keys(MOUNT_GONE).length,
        story:(typeof MS_ARCS === 'undefined' ? [] : MS_ARCS.filter(a => a.mount)).length, tower:(typeof TWS_MILE === 'undefined' ? [] : TWS_MILE.filter(m => MOUNT_GONE[m[1]])).length };
    });
    assert.deepStrictEqual(r.crocs, [], 'no monitor, crocodile, lizard or salamander by name');
    assert.ok(r.n >= 15 && r.draws, 'the hog badgers draw: ' + r.n);
    assert.deepStrictEqual(r.mounts, [], 'no fashion mount left'); assert.ok(!r.tabs.includes('mount'), 'no Mounts tab');
    assert.ok(r.gone >= 20, 'all of them were removed: ' + r.gone);
    assert.ok(r.refund > 0 && r.again === 0, 'a bought mount is refunded once: ' + JSON.stringify(r));
    assert.strictEqual(r.worn, null, 'it is taken off');
    assert.ok(r.rideOk, 'the Golden Deer still rides');
    assert.strictEqual(r.story + r.tower, 0, 'no story or tower reward hands one out');
    assert.ok(r.rwd >= 80 + 150 && r.rwdAgain === 0, 'a finished road and floor 100 pay coins instead, once: ' + JSON.stringify([r.rwd, r.rwdAgain]));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
