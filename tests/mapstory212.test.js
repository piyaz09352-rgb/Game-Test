/* VAYRATHEN — tests/mapstory212.test.js — (v212) map stories: Khao Hom starts the east road in Aren, a chapter runs
   hunt → find → gather and pays its wardrobe piece, the next map has its own NPC with Khao Hom beside it, the elite
   step spawns a named monster, and every chapter's monsters, items and pieces exist. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('map stories: east road chapters, NPCs, rewards', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {}, adv = n => { for (let i = 0; i < n; i++) advance(.05, false); };
      o.bad = [];
      for (const [m, ch] of Object.entries(MS_CH)){ for (const st of ch.steps){ if ((st.k === 'kill' || st.k === 'elite') && !(MOB[st.t] && MAPS[m].mobs.includes(st.t))) o.bad.push(m + ':' + st.t); if (st.k === 'item' && !ITEMS[st.t]) o.bad.push(m + ':' + st.t); }
        if (!(COSTUME[ch.cos] || WINGS[ch.cos] || XCOS[ch.cos])) o.bad.push('cos ' + ch.cos); }
      o.chapters = MS_ARCS[0].maps.every(m => MS_CH[m]);
      S.lvl = 20; S.tut = {done:true, i:99}; loadMap(0); adv(4);
      const kh = NPCS.find(n => n.id === 'ms_khaohom'); o.kh = !!kh && npcMark(kh) === '!';
      msAccept(0); const lan = spawnMob('lantern', P.x + 300, P.y); for (let i = 0; i < 6; i++) EV.emit('kill', lan); o.r1 = msReady(); msHandIn();
      for (const p of MS.spots){ P.x = p.x; P.y = p.y; adv(2); } o.r2 = msReady(); msHandIn();
      addItem('wick', 3); o.r3 = msReady(); const bia = S.bia; msHandIn(); o.paid = S.bia > bia; o.done = !!msS().done[0]; o.bow = cosHave('ms_h_khaohom');
      loadMap(1); adv(4); o.npcs = ['ms_khlui', 'ms_khaohom'].every(id => NPCS.some(n => n.id === id));
      msAccept(1); const mk = spawnMob('bamboomonkey', P.x + 300, P.y); for (let i = 0; i < 10; i++) EV.emit('kill', mk); msHandIn();
      for (const p of MS.spots){ P.x = p.x; P.y = p.y; adv(2); } msHandIn(); adv(3);
      const e = MS.eliteM; o.elite = !!(e && e.msElite && e.tagTxt && e.maxhp > MOB.bamboomonkey.hp * 3);
      if (e) EV.emit('kill', e); o.r6 = msReady(); msHandIn(); o.wrap = cosHave('ms_h_bamboo');
      o.tracker = !questTracker().includes('📖');
      const t = NPCS_HOME.find(n => n.id === 'tailor'); if (t){ loadMap(0); adv(2); openNpc(NPCS.find(n => n.id === 'tailor')); o.tailor = !el('dialog').innerHTML.includes('ms_b_'); el('dialog').hidden = true; } else o.tailor = true;
      return o;
    });
    assert.deepStrictEqual(r.bad, [], 'every chapter names real monsters of its map, real items and pieces');
    assert.ok(r.chapters, 'all 16 east-road maps have a chapter');
    assert.ok(r.kh, 'Khao Hom waits in Aren with a quest mark');
    assert.ok(r.r1 && r.r2 && r.r3 && r.paid && r.done && r.bow, 'hunt → find → gather, paid, chapter done, her bow given');
    assert.ok(r.npcs, 'the bamboo map has its own NPC and Khao Hom beside it');
    assert.ok(r.elite && r.r6 && r.wrap, 'the elite step spawns a named strong monster; the chapter pays its head wrap');
    assert.ok(r.tracker, 'no story line left on the tracker after the chapter');
    assert.ok(r.tailor, 'story pieces are not sold by the tailor');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
