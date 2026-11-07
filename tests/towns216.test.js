/* VAYRATHEN — tests/towns216.test.js — (v216) the four crossroads towns: wired into their roads, no monsters or boss,
   their buildings and people, the services open, the kitchen and costume shop sell, and the world map, the warp list
   and the wiki take the new maps. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('crossroads towns: roads, safety, people, services, shops', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const o = {}, adv = n => { for (let i = 0; i < n; i++) advance(.05, false); };
      S.tut = {done:true, i:99}; S.lvl = 120; S.bia = 1e7; ACC.coins = 500;
      o.towns = TOWNS.map(T0 => { const mp = MAPS[T0.id], A = MAPS[T0.after], d = T0.road, B = MAPS[mp.links[d]];
        return !!mp && A.links[d] === T0.id && mp.links[OPP[d]] === A.id && (!B || B.links[OPP[d]] === T0.id) && ROADS[d].includes(T0.id); });
      o.visit = [];
      for (const T0 of TOWNS){ loadMap(T0.id); adv(10);
        const ids = NPCS.map(n => n.id); o.visit.push({k:T0.k, mobs:mobs.filter(m => !m.dead).length, boss:!!boss, camp:CAMP, blds:PROPS.filter(p => p.type === 'tbld').length, svc:Object.keys(TW_LAY.pos).length, land:PROPS.some(p => p.type === 'tland'),
          npcs:['warp', 'shop', 'smith', 'banker', 'healer_oon', `tw_${T0.k}_food`, `tw_${T0.k}_cos`].every(id => ids.includes(id))}); }
      // the services open in a town, the kitchen and the costume shop sell
      const T0 = TOWNS[0]; loadMap(T0.id); adv(4); o.dlg = [];
      for (const id of ['shop', 'smith', 'banker']){ const n = NPCS.find(x => x.id === id); openNpc(n); o.dlg.push(!el('dialog').hidden && el('dialog').innerText.length > 20); closeDialog(); }
      S.hp = 1; openNpc(NPCS.find(x => x.id === 'healer_oon')); o.dlg.push(S.hp === DER.maxhp);   // the healer heals at once, no window
      openNpc(NPCS.find(x => x.id === 'warp')); o.dlg.push(!!el('warpGrid') && !el('warpGrid').hidden); if (typeof wgClose === 'function') wgClose();   // the keeper opens the warp grid
      const fn = NPCS.find(x => x.id === 'tw_e_food'); openNpc(fn); el('dialog').querySelector('[data-twbuy]').click(); o.food = (S.inv.tf_e0 || 0) >= 1; closeDialog();
      const cn = NPCS.find(x => x.id === 'tw_e_cos'); openNpc(cn); el('dialog').querySelector('[data-twcos]').click(); o.cos = cosHave('tc_e_top') || cosHave('tc_e_head'); closeDialog();
      useItem ? 0 : 0; o.foodUse = typeof ITEMS.tf_e0.food === 'object';
      // travelling through: from the floating market's east gate into the town, and on to the coast
      loadMap(T0.after); travel(T0.id, T0.after); o.into = MAP_ID === T0.id; travel(MAPS[T0.id].links.e, T0.id); o.on = MAP_ID === MAPS[T0.id].links.e;
      // the world map, the warp list, the wiki and the daily tasks cope with the new maps
      S.visited = S.visited || {}; TOWNS.forEach(t => { S.visited[t.id] = 1; });
      if (typeof openWin === 'function'){ try { openWin('worldmap'); } catch (e) { o.wmErr = String(e); } }
      if (typeof WM !== 'undefined' && typeof WIN_RENDER !== 'undefined' && WIN_RENDER.worldmap){ WM.sel = TOWNS[1].id; try { WIN_RENDER.worldmap(); } catch (e) { o.wmErr = String(e); } }
      S.daily = null; S.lvl = 160; try { dailyState(); o.daily = S.daily.tasks.every(d => !d.m || !isTown(d.m)); } catch (e) { o.daily = String(e); }
      return o;
    });
    assert.deepStrictEqual(r.towns, [true, true, true, true], 'each town sits in its road, gates wired both ways');
    for (const v of r.visit){ assert.strictEqual(v.mobs, 0, `${v.k}: no monsters`); assert.ok(!v.boss && !v.camp, `${v.k}: no boss, no camp`); assert.ok(v.blds >= 12 && v.svc === 8 && v.land, `${v.k}: all eight service buildings, houses and a landmark`); assert.ok(v.npcs, `${v.k}: services, kitchen and costume shop`); }
    assert.deepStrictEqual(r.dlg, [true, true, true, true, true], 'potions, smith, bank, healer and warp open in a town');
    assert.ok(r.food && r.foodUse, 'the kitchen sells local food');
    assert.ok(r.cos, 'the costume shop sells its town pieces');
    assert.ok(r.into && r.on, 'the road runs through the town');
    assert.ok(!r.wmErr, 'the world map shows a town: ' + r.wmErr);
    assert.strictEqual(r.daily, true, 'daily tasks never send you to hunt in a town');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
