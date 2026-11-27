/* VAYRATHEN — tests/storyboss349.test.js — (v349) a story boss with three AI adventurers
   Chapter 0's card said «แนะนำ Lv 1+» but ends with the Golden Jelly King (Lv 25, a party fight); Auto quest stopped
   there for good. Checked: the chapter card names the boss and its level; near the boss alone, the game offers three AI
   adventurers (not while Auto runs; it closes when you leave); once called they stay on the boss's map only, fight only the boss / its summons / what attacks you (not
   your hunting), and leave once the boss step is done; Auto quest calls them itself and goes for the boss. */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed';

test('story boss: the card says it is a party fight, the offer, AI adventurers on its map only, Auto goes with them', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 1366, height: 768 });
  try {
    await enterWorld(page, 'Sb', 'sb_user');
    const r = await page.evaluate(async () => { const out = {}; S.tut = { done: true, i: 99 }; S.lvl = 22;
      const q = qState(); q.active = null; q.main = 0;
      // the giver's card before the chapter is taken
      out.card = questDialog(NPCS.find(n => n.id === 'job') || {id:'job'}).h.includes('Lv ' + MOB.boss.lvl);
      q.active = 'main0'; q.prog = {}; const ph = aqPlanFor({ kind: 'main' }); out.huntField = ph.mode === 'hunt' && ph.map === FIELDS306.id;   // (v350) chapter 0's monsters live in the fields, not in the city
      q.prog = { 'kill:dewblob': 8, 'kill:hare': 8 }; S.inv.jelly = 5;
      out.goal = !!sbGoal() && sbGoal().map === FIELDS306.id;
      // on the boss's map, next to it: the offer
      loadMap(FIELDS306.id); await new Promise(r => setTimeout(r, 800));
      for (const m of mobs) m.dead = true; mobs = mobs.filter(m => !m.dead);
      const b = spawnMob('boss', P.x + 300, P.y); b.aggro = false; await new Promise(r => setTimeout(r, 1300));
      const d = el('confirm'); out.offer = !d.hidden && !!d.querySelector('[data-sb="ai"]');
      // (v349.1) it closes by itself when you leave the boss's map (left open it sat over the town)
      loadMap(0); await new Promise(r => setTimeout(r, 900)); out.closesAway = d.hidden || JSON.stringify({open:!!SB.open, map:MAP_ID, om:SB.open && SB.open.map, html:d.innerHTML.slice(0, 60)});
      loadMap(FIELDS306.id); await new Promise(r => setTimeout(r, 800)); for (const m of mobs) m.dead = true; mobs = mobs.filter(m => !m.dead);
      // no question over a hero left on plain Auto
      setBot(true); const b0 = spawnMob('boss', P.x + 300, P.y); b0.aggro = false; await new Promise(r => setTimeout(r, 1300)); out.noAskOnAuto = d.hidden; setBot(false); b0.dead = true;
      for (const x of WIN_IDS) if (UIS.open[x]) closeWin(x); closeDialog();
      const b2 = spawnMob('boss', P.x + 300, P.y); b2.aggro = false; await new Promise(r => setTimeout(r, 1300)); out.askAgain = !d.hidden;
      d.querySelector('[data-sb="ai"]').click(); await new Promise(r => setTimeout(r, 400));
      out.party = AIC.on && AIC.list.length === 3 && aicFieldOn();
      // they leave a common monster alone, but take the boss
      const w = spawnMob('dewblob', P.x - 200, P.y); w.aggro = false; out.ignoresHunt = !aicFoeOk(w); out.boss = aicFoeOk(b2);
      // off the boss's map they wait; the boss step done: they go
      loadMap(0); await new Promise(r => setTimeout(r, 600)); out.away = !aicFieldOn() && !AIC.on;
      q.prog['boss:boss'] = 1; out.gone = !aicFieldOn() && AIC.field === null;
      // Auto quest goes for the boss (Lv ≥ boss − 3) with them
      q.prog['boss:boss'] = 0; S.aq = true; const p = aqPlanFor({ kind: 'main' }); out.auto = p.mode === 'hunt' && p.map === FIELDS306.id && p.types[0] === 'boss';
      S.lvl = 10; const p2 = aqPlanFor({ kind: 'main' }); out.tooLow = p2.mode === 'stop';
      return out; });
    assert.deepStrictEqual(r, { card: true, huntField: true, goal: true, offer: true, closesAway: true, noAskOnAuto: true, askAgain: true, party: true, ignoresHunt: true, boss: true, away: true, gone: true, auto: true, tooLow: true });
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
