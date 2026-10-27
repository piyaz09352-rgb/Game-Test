/* VAYRATHEN — tests/party.test.js — the party system to the MMO standard (js/sys/partyplus.js on top of party.js):
   invite by tapping a hero, decline / busy / expired invites, the party frame updating in place (no rebuild),
   Even Share only near the kill, Take Turns loot, offline members and reconnect, disband and the last-member rule */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

async function until(page, what, fn, arg, ms = 20000){
  const t0 = Date.now();
  while (Date.now() - t0 < ms){ if (await page.evaluate(fn, arg)) return; await page.waitForTimeout(250); }
  const st = await page.evaluate(() => JSON.stringify({party:NET.party, lead:PTY.lead, me:ptyMe(), list:ptyList().map(p => [p.peer, p.presence.n, p.presence.pl]), rs:PPX.rs, roster:[...PPX.roster.keys()], decl:PPX.decl}));
  throw new Error('timed out waiting for: ' + what + ' · ' + st);
}

test('party: invite, decline, frame, sharing, offline, reconnect, disband', { skip, timeout: 360000 }, async () => {
  const { players, close } = await openPlayers(3, { merge: false });
  try {
    const names = ['Alpha', 'Beta', 'Gamma'];
    for (const [i, p] of players.entries()){ await enterWorld(p.page, names[i]); await p.page.evaluate(() => { S.lvl = 60; derive(); S.hp = DER.maxhp; loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; NET.lobbyT = 0; }); }
    const [A, B, C] = players.map(p => p.page);
    const lobbyPeer = (pg, n) => pg.evaluate(n => { const p = NET.room.peers().find(x => x.presence && x.presence.n === n); return p ? p.peer : null; }, n);
    await until(A, 'A sees Beta and Gamma in the lobby and on the map', () => ['Beta', 'Gamma'].every(n => NET.room.peers().some(p => p.presence && p.presence.n === n) && [...NET.ghosts.values()].some(g => g.q && g.q.n === n)));

    // 1. tap Beta's hero → "Party invite": the map id is turned into Beta's lobby id, so the invite arrives
    const ids = await A.evaluate(() => { const gh = [...NET.ghosts.values()].find(g => g.q && g.q.n === 'Beta'); playerMenu(gh); document.querySelector('#pcard [data-pcact="party"]').click(); return {map:gh.peer}; });
    const bLobby = await lobbyPeer(A, 'Beta');
    assert.notStrictEqual(ids.map, bLobby, 'the hero on the map and the lobby player have different ids');
    await until(B, 'Beta gets the invite', () => !!NET.invite);
    await B.evaluate(() => document.querySelector('[data-ivyes]').click());
    await until(A, 'A sees a party of two', () => ptyList().length === 2 && ptyIsLead());
    await until(B, 'B sees a party of two led by A', () => ptyList().length === 2 && !!PTY.lead && !ptyIsLead());

    // 2. the party frame does not rebuild itself: same row element, HP bar updated in place
    await until(A, 'the frame shows two members', () => { const b = el('ptyHud'); return b && !b.hidden && b.querySelectorAll('.phm[data-ptyfocus]').length === 2; });
    await A.waitForTimeout(1200);
    await A.evaluate(p => { window.__row = el('ptyHud').querySelector(`.phm[data-ptyfocus="${p}"]`); window.__hud = el('ptyHud').innerHTML.length; }, bLobby);
    await B.evaluate(() => { S.hp = Math.round(DER.maxhp * .37); NET.lobbyT = 0; });
    await until(A, 'Beta\'s HP reaches A', p => { const m = ptyList().find(x => x.peer === p); return m && m.presence.h < 60; }, bLobby);
    // the HUD refreshes every half second of game time (slower than the wall clock on a slow test machine)
    await A.waitForFunction(p => { const m = ptyList().find(x => x.peer === p), row = el('ptyHud').querySelector(`.phm[data-ptyfocus="${p}"]`);
      return m && row && row.querySelector('.ptb:not(.sp) i').style.width === m.presence.h + '%'; }, bLobby, { timeout: 6000 }).catch(() => {});
    const fr = await A.evaluate(p => { const m = ptyList().find(x => x.peer === p), row = el('ptyHud').querySelector(`.phm[data-ptyfocus="${p}"]`);
      return {same:row === window.__row && window.__row.isConnected, bar:row.querySelector('.ptb:not(.sp) i').style.width, h:m.presence.h}; }, bLobby);
    assert.ok(fr.same, 'the member row was not rebuilt');
    assert.strictEqual(fr.bar, fr.h + '%', 'the HP bar follows the member\'s HP');

    // 3. Gamma declines → Alpha is told
    const cLobby = await lobbyPeer(A, 'Gamma');
    await A.evaluate(p => partyInvite(p), cLobby);
    await until(C, 'Gamma gets the invite', () => !!NET.invite);
    await C.evaluate(() => document.querySelector('[data-ivno]').click());
    await until(A, 'Alpha hears the decline', () => PPX.decl === 'Gamma:no');

    // 4. Gamma in another party: refused on the inviter's side, and on Gamma's side when an invite still arrives
    await C.evaluate(() => { partyCreate(); NET.lobbyT = 0; });
    await until(A, 'A sees Gamma in a party', p => { const x = NET.room.peers().find(q => q.peer === p); return !!(x && x.presence && x.presence.pt); }, cLobby);
    const refused = await A.evaluate(p => { toastMsg = ''; partyInvite(p); return toastMsg; }, cLobby);
    assert.match(refused, /another party|ปาร์ตี้อื่น/, 'the inviter is told Gamma is in another party');
    await A.evaluate(p => { PPX.decl = ''; NET.room.emit('party', {k:'invite', to:p, pt:NET.party, n:netName()}); }, cLobby);
    await until(A, 'Gamma answers "already in a party"', () => PPX.decl === 'Gamma:party');
    assert.strictEqual(await C.evaluate(() => NET.invite), null, 'Gamma never sees that invite');

    // 5. an unanswered invite expires and tells the inviter
    await C.evaluate(() => { partyLeave(); PPX.INV_T = 1; NET.lobbyT = 0; });
    await until(A, 'Gamma is out of any party', p => { const x = NET.room.peers().find(q => q.peer === p); return !!(x && x.presence && !x.presence.pt); }, cLobby);
    await A.evaluate(p => { PPX.decl = ''; partyInvite(p); }, cLobby);
    await until(C, 'Gamma gets the invite', () => !!NET.invite);
    await until(A, 'the invite times out', () => PPX.decl === 'Gamma:time');
    assert.strictEqual(await C.evaluate(() => NET.invite), null, 'the invite box is gone');

    // 6. Even Share reaches only members near the kill
    await A.evaluate(() => partySet('exp', 'even'));
    const near = await A.evaluate(p => { const g = paGhost(p), n1 = ptyShareMates().length, x0 = g.x; g.x = P.x + 2000; const n2 = ptyShareMates().length; g.x = x0; return [n1, n2]; }, bLobby);
    assert.deepStrictEqual(near, [1, 0], 'near: shared · far: not shared');

    // 7. Take Turns: you, then Beta, then you, then Beta
    await A.evaluate(() => partySet('item', 'turn'));
    await until(B, 'Beta learns the Take Turns rule', () => PTY.opts.item === 'turn');
    const id = await A.evaluate(() => Object.keys(ITEMS).find(k => ITEMS[k].kind !== 'gear' && !ITEMS[k].base && /pot|herb/.test(k)) || Object.keys(ITEMS).find(k => ITEMS[k].kind !== 'gear' && !ITEMS[k].base));
    const before = await B.evaluate(i => S.inv[i] || 0, id);
    const turns = await A.evaluate(i => { PPX.turn = 0; return [1, 2, 3, 4].map(() => ptyShareItem(i, P.x, P.y)); }, id);
    assert.deepStrictEqual(turns, [false, true, false, true], 'drops alternate between the members');
    await until(B, 'Beta gets two drops', ([i, b]) => (S.inv[i] || 0) === b + 2, [id, before]);

    // 8. Beta drops off (no leave message): shown offline; coming back restores the party and the leader
    const pt = await B.evaluate(() => { ppxStore(); const pt = NET.party; NET.party = null; PTY.lead = null; NET.lobbyT = 0; return pt; });
    await until(A, 'Beta shows as offline on the frame', () => { const b = el('ptyHud'); return !!b && [...b.querySelectorAll('.phm.off .pn')].some(x => x.textContent === 'Beta'); });
    assert.strictEqual(await A.evaluate(() => NET.party), pt, 'the party stays while Beta is offline');
    await B.evaluate(() => { PPX.tried = false; });
    await until(B, 'Beta is back in the party under Alpha', p => NET.party === p.pt && !PPX.rs && PTY.lead === p.lead, { pt, lead: await lobbyPeer(B, 'Alpha') });
    await until(A, 'Alpha sees Beta online again', () => ptyList().length === 2 && !el('ptyHud').querySelector('.phm.off'));

    // 9. the leader disbands: everyone is out
    await A.evaluate(() => ppxDisband());
    await until(B, 'Beta is out of the party', () => !NET.party);
    assert.strictEqual(await A.evaluate(() => NET.party), null);

    // 10. a new party of two; the last other member leaves → the party disbands itself
    await A.evaluate(p => partyInvite(p), bLobby);
    await until(B, 'Beta gets the invite', () => !!NET.invite);
    await B.evaluate(() => partyAccept());
    await until(A, 'a party of two again', () => ptyList().length === 2 && PPX.had);
    await B.evaluate(() => partyLeave());
    await until(A, 'Alpha\'s party disbands by itself', () => !NET.party);
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});
