/* VAYRATHEN — tests/loading307.test.js — (v307) a loading screen when you enter a map: through a gate the card shows
   first (land, map, level, a tip), then the map changes and the card goes; the warp keeper uses the same card; a far land
   still asks first; nothing walks into the gate twice */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('loading screen: gates and the warp keeper show the card, then the new map', { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const o = {}, F = FIELDS306.id, card = () => document.getElementById('ldCard'), shown = () => !!card() && !card().hidden, wait = ms => new Promise(res => setTimeout(res, ms));
      S.tut = {done:true, i:99}; loadMap(0); const gt = GATES.find(g => g.to === F); P.x = gt.x; P.y = gt.y; P.gateLock = 0;
      checkGates(); o.cardFirst = shown() && MAP_ID === 0 && card().querySelector('.ldname').textContent === nm(MAPS[F]); checkGates(); o.once = LD.busy;
      for (let i = 0; i < 40 && MAP_ID !== F; i++) await wait(100); o.arrived = MAP_ID === F; for (let i = 0; i < 40 && shown(); i++) await wait(100); o.gone = !shown();
      // the warp keeper
      S.bia = 1e9; S.visited[1] = 1; const b = document.createElement('button'); b.dataset.warp = '1'; document.body.appendChild(b); b.click(); o.warpCard = shown() && card().querySelector('.ldname').textContent === nm(MAPS[1]); for (let i = 0; i < 40 && (MAP_ID !== 1 || shown()); i++) await wait(150); o.warped = MAP_ID === 1 && !shown(); b.remove();
      // a far land asks first, no card
      S.lvl = 5; derive(); loadMap(16); const g2 = GATES.find(g => g.to === 17); P.x = g2.x; P.y = g2.y; P.gateLock = 0; GWN.ok = {}; checkGates(); o.asks = !el('confirm').hidden && !shown(); el('confirm').hidden = true; GWN.asking = false;
      return o; });
    assert.ok(r.cardFirst, 'the card shows before the map changes, with the map name'); assert.ok(r.once, 'the gate is not walked into twice while it loads');
    assert.ok(r.arrived && r.gone, 'then the new map, and the card goes');
    assert.ok(r.warpCard && r.warped, 'the warp keeper shows the same card'); assert.ok(r.asks, 'a far land still asks first');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
