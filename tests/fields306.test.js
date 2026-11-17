/* VAYRATHEN — tests/fields306.test.js — (v306) no monsters in town
   · Aren has no monsters and no boss, however long you wait; the whole map is the town;
   · the Suwannin Fields (a new map at the end of the list) hold the six starter monsters, the boss, a camp and the first
     story chapter; the road runs Aren ⇄ fields ⇄ Whispering Bamboo;
   · the tutorial leads out of the east gate; Auto switched on in town walks out to the fields; Master Vayra's bounty is
     on a monster of the fields; the world map opens on a town; an old save's chapter is carried over;
   · the crossroad towns are a quarter wider and still have no monsters */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('no monsters in town: the Suwannin Fields, the way out, Auto, bounty, old saves', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const o = {}, F = FIELDS306.id, live = () => mobs.filter(m => !m.dead && !m.dummy).length, adv = n => { for (let i = 0; i < n; i++){ advance(.1, false); if (!P.dead) S.hp = DER.maxhp; } };
      o.last = F === MAPS.length - 1 && MAPS[F].name === 'ทุ่งสุวรรณิน'; o.tutStep = TUT.findIndex(s => s.f306) === TUT.findIndex(s => s.arrow === 'mob') - 1;
      loadMap(0); adv(300); o.aren = [live(), !!boss, MAPS[0].mobs.length, MAPS[0].boss, inVillage({x:150, y:150}), W, H];
      o.gates = [GATES.find(g => g.side === 'e').to === F, MAPS[F].links.w === 0, MAPS[F].links.e === 1, MAPS[1].links.w === F];
      try { o.bounty = MAPS[F].mobs.includes(bountyFor(0).t); } catch (e) { o.bounty = e.message; }
      try { openWin('world'); WM.sel = 0; renderWorld(); WM.sel = 67; renderWorld(); closeWin('world'); o.wm = true; } catch (e) { o.wm = e.message; }
      // the tutorial's «take me there»
      S.tut = {i:TUT.findIndex(s => s.f306), s:{}}; tutShow(); const b = document.querySelector('#tutBox [data-tutgo="fields306"]'); o.goBtn = !!b; if (b) b.click(); const gt = GATES.find(g => g.to === F); o.walks = P.tx === gt.x && P.ty === gt.y; S.tut = {done:true, i:99};
      // Auto in town
      P.x = VSPAWN.x; P.y = VSPAWN.y; P.tx = null; S.lvl = 5; derive(); S.hp = DER.maxhp; setBot(true); for (let i = 0; i < 40 && MAP_ID === 0; i++){ adv(20); await new Promise(res => setTimeout(res, 0)); } o.autoMap = MAP_ID; adv(80); o.autoHunts = BOT.on && (BOT.state === 'hunt' || !!P.target); setBot(false);
      // the fields
      loadMap(F); adv(25); o.f = [live() > 20,   /* (v310) about 80 now: give every spawn slot its first 2.5 s */ MAPS[F].mobs.slice().sort().join(','), !!CAMP, NPCS.some(n => n.id === 'warp'), !!MS_CH[F] && !MS_CH[0], MS_ARCS.some(a => a.maps[0] === F), W, H];
      bossTimer = 0; adv(5); o.boss = !!boss && boss.type === MAPS[F].boss;
      // an old save
      S._f306 = 0; S.ms = {done:{0:1}, cur:null}; f306Fix(); o.save1 = S.ms.done[F] === 1 && !S.ms.done[0]; S._f306 = 0; S.ms = {done:{}, cur:{map:0, step:1, n:2}}; f306Fix(); o.save2 = S.ms.cur.map === F;
      loadMap(67); adv(50); o.town = [live(), W, H]; return o; });
    assert.ok(r.last, 'the new map is added at the end of the list'); assert.ok(r.tutStep, 'the tutorial has a step out to the fields before «attack»');
    assert.deepStrictEqual(r.aren, [0, false, 0, null, true, 2400, 1600], 'Aren: no monsters, no boss, the whole map is the town');
    assert.ok(r.gates.every(Boolean), 'Aren ⇄ Suwannin Fields ⇄ Whispering Bamboo: ' + r.gates);
    assert.strictEqual(r.bounty, true, "Master Vayra's bounty is on a monster of the fields"); assert.strictEqual(r.wm, true, 'the world map opens on a town');
    assert.ok(r.goBtn && r.walks, '«take me there» walks to the east gate');
    assert.ok(r.autoMap !== 0 && r.autoHunts, 'Auto switched on in town walks out and hunts: map ' + r.autoMap);
    assert.deepStrictEqual(r.f, [true, 'boar,dewblob,hare,kaipa,kobna,lantern', true, true, true, true, 5100, 3390], 'the fields hold the six monsters, a camp and the first chapter');
    assert.ok(r.boss, 'and their boss'); assert.ok(r.save1 && r.save2, "an old save's first chapter is carried over");
    assert.deepStrictEqual(r.town, [0, 4250, 2825], 'a crossroad town: no monsters, a quarter wider');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
