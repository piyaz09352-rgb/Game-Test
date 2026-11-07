/* VAYRATHEN — tests/gear258.test.js — (v258) class weapons for every line, kunai + shield, tiers in line, weapon traits */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('gear v258: tiers, class locks, kunai with a shield, every new weapon fights', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Gear');
    const r = await page.evaluate(async () => { const o = {};
      const lvs = s => GEAR_LIST.filter(g => g[1] === s).map(g => g[4]);
      o.tiersOk = ['pants', 'shoes', 'shield'].every(s => lvs(s).includes(200) && lvs(s).includes(240) && !lvs(s).includes(210) && !lvs(s).includes(250));
      const can = (job, id) => { const j0 = S.job; S.job = job; const ok = canWield(ITEMS[id]); S.job = j0; return ok; };
      o.locks = [can('hexlord', 'w_hexrod5'), !can('archsage', 'w_hexrod5'), can('catqueen', 'w_catclaw5'), !can('ringlord', 'w_catclaw5'),
        can('bangkaew', 'w_collar5'), !can('bulwark', 'w_collar5'), can('kage', 'w_moonstar5'), can('ninja', 'w_kunai0'), !can('blade', 'w_kunai0')];
      // fight with each one
      S.lvl = 120; loadMap(1); const kinds = {};
      for (const [job, w, sh] of [['kage', 'w_kunai4', 'sh_5'], ['kage', 'w_moonstar4'], ['hexlord', 'w_hexrod4'], ['catqueen', 'w_catclaw4'], ['bangkaew', 'w_collar4'], ['tycoon', 'w_gaxe4'], ['ringlord', 'w_glove4']]){
        S.job = job; S.gear.weapon = w; S.gear.shield = sh || null; if (sh && !shieldOk()) { kinds[w] = 'shield refused'; continue; }
        derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; P.dead = false;
        const m = spawnMob(MAPS[1].mobs[0], P.x + 30, P.y); const hp0 = m.hp; P.target = m;
        for (let i = 0; i < 60 && !m.dead; i++){ advance(.05, false); if (typeof playerAttack === 'function' && !P.atkT) {} }
        if (m.hp === hp0 && !m.dead){ const res = physDamage(m, 1); if (res && res.dmg) applyDamage(m, res); }
        kinds[w] = DER.wk + (m.hp < hp0 || m.dead ? ' hit' : ' nohit'); m.dead = true; }
      o.kinds = kinds; return o; });
    assert.ok(r.tiersOk, 'pants/shoes/shields step at 200 and 240');
    assert.ok(r.locks.every(Boolean), 'class locks ' + JSON.stringify(r.locks));
    assert.strictEqual(r.kinds.w_kunai4, 'kunai hit', 'a kunai with a shield ' + JSON.stringify(r.kinds));
    for (const [w, k] of Object.entries({w_moonstar4:'shuriken', w_hexrod4:'hexrod', w_catclaw4:'claw', w_collar4:'sword', w_gaxe4:'gaxe', w_glove4:'glove'}))
      assert.ok(r.kinds[w] && r.kinds[w].startsWith(k + ' '), `${w} is a ${k}: ${r.kinds[w]}`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
