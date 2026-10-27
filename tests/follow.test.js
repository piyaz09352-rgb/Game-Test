/* VAYRATHEN — tests/follow.test.js — follow any player (v27): tap them → Follow, walk behind them, a chip shows it,
   and walking yourself ends it */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
test('follow a player outside the party, the standard way', { skip, timeout: 240000 }, async () => {
  const { players, close } = await openPlayers(2, { merge: false });
  try {
    for (const [i, p] of players.entries()){ await enterWorld(p.page, 'Walker' + i); await p.page.evaluate(() => { S.lvl = 60; derive(); loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; }); }
    const [a, b] = players.map(p => p.page);
    const t0 = Date.now(); while (Date.now() - t0 < 20000 && !(await a.evaluate(() => [...NET.ghosts.values()].some(g => g.q && g.q.n)))) await a.waitForTimeout(300);
    await a.evaluate(() => { const gh = [...NET.ghosts.values()].find(g => g.q && g.q.n); playerMenu(gh); document.querySelector('#pcard [data-pcact="follow"]').click(); });
    assert.strictEqual(await a.evaluate(() => PFW.any), 'Walker1', 'following Walker1 by name');
    await b.evaluate(() => { P.x += 500; P.y += 80; });
    await a.waitForTimeout(5000);
    const st = await a.evaluate(() => { const g = [...NET.ghosts.values()].find(x => x.q && x.q.n === 'Walker1'); const c = el('followChip'); return {d:Math.round(Math.hypot(g.x - P.x, g.y - P.y)), chip:c && !c.hidden ? c.textContent : null}; });
    assert.ok(st.d < 200, `walked behind them (distance ${st.d})`);
    assert.match(st.chip || '', /Walker1/, 'the chip names who you follow');
    await a.evaluate(() => { JOY.active = true; }); await a.waitForTimeout(300); await a.evaluate(() => { JOY.active = false; });
    assert.strictEqual(await a.evaluate(() => PFW.peer), null, 'walking yourself ends the follow');
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});

test('party bar: no follow button; tapping a name opens a menu with Follow and Assist', { skip, timeout: 120000 }, async () => {
  const { openGame } = require('./browser');
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Menu', 'menu_user');
    const r = await page.evaluate(() => {
      let box = el('ptyHud'); if (!box){ box = document.createElement('div'); box.id = 'ptyHud'; el('ui').appendChild(box); }
      box.hidden = false; box.innerHTML = '<div class="phm" data-ptyfocus="peerX"><div class="phn"><b class="pn">Friend</b></div></div>';
      const out = {btn:!!box.querySelector('.pfb')};
      box.querySelector('.pn').click(); const m = el('pfMenu'); out.menu = !!m && !m.hidden && /Friend/.test(m.textContent);
      out.items = [...m.querySelectorAll('[data-pfmenu]')].map(b => b.dataset.pfmenu).join(',');
      m.querySelector('[data-pfmenu="follow"]').click(); out.following = PFW.peer === 'peerX'; out.closed = m.hidden;
      return out; });
    assert.deepStrictEqual(r, { btn: false, menu: true, items: 'follow,assist', following: true, closed: true });
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
