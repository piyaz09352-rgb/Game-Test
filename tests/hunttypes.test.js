/* VAYRATHEN — tests/hunttypes.test.js — (v150) hold attack → choose several kinds; targets follow the choice */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('fight only the chosen kinds', { skip, timeout: 90000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Hunt');
    const r = await page.evaluate(async () => {
      loadMap(1); for (const m of mobs) m.dead = true; mobs.length = 0; spawnSlots.length = 0; P.x = W / 2; P.y = H / 2;   // no spawn slots: nothing new walks up mid-test
      const kinds = [...new Set(MAPS[1].mobs)].slice(0, 3); if (kinds.length < 2) return {skip:true};
      const a = spawnMob(kinds[0], P.x + 40, P.y, {zone:MAPZ}), b = spawnMob(kinds[1], P.x + 120, P.y, {zone:MAPZ});
      a.hp = a.maxhp = b.hp = b.maxhp = 1e6;
      tpkOpen(); await new Promise(r => setTimeout(r, 100));
      const rows = document.querySelectorAll('#tpick [data-ht]').length;
      const btn = document.querySelector(`#tpick [data-ht="${kinds[1]}"]`); btn.dispatchEvent(new PointerEvent('pointerup', {bubbles:true}));
      const chosen = (S.hunt || []).slice(), badge = document.querySelector('[data-mo="atk"]') && document.querySelector('[data-mo="atk"]').dataset.hunt;
      const bot = pickTarget(), near = nearestEnemy(400), lock = tlkPick(520);
      tpkClose(); S.hunt = []; const free = nearestEnemy(400);
      return {rows, chosen, badge, bot:bot && bot.type, near:near && near.type, lock:lock && lock.type, free:free && free.type, want:kinds[1], other:kinds[0]}; });
    if (r.skip) return;
    assert.ok(r.rows >= 2, 'the list shows kinds');
    assert.deepStrictEqual(r.chosen, [r.want], 'one kind chosen');
    assert.strictEqual(r.badge, '1', 'the attack button shows how many');
    assert.strictEqual(r.bot, r.want, 'Auto goes for the chosen kind');
    assert.strictEqual(r.near, r.want, 'the attack button goes for the chosen kind (even though another is closer)');
    assert.strictEqual(r.lock, r.want, 'the auto lock too');
    assert.strictEqual(r.free, r.other, 'cleared: the closest of any kind again');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
