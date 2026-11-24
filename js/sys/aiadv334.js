/* VAYRATHEN — js/sys/aiadv334.js — (v334) AI adventurers (นักผจญภัย AI)
   The owner: «I don't see any bots in the game» → chose AI adventurers in the game. A few computer-run heroes live in the
   world on your own device (no server, no accounts): in Aren and the towns they stroll, browse the shop doors, sit and
   chat; in the hunting fields they hunt monsters of their level, rest, and talk now and then. Every one carries an
   «นักผจญภัย AI» tag under the name, so nobody mistakes them for real players. They never take a monster you are
   fighting or one chasing you, keep their distance from you, never touch bosses, pack leaders or named monsters,
   and give no EXP, drops or quest progress to anyone. Online maps with other players present: they only stroll.
   Settings: «นักผจญภัย AI ในเกม» (on by default). Off in automated test browsers so the balance runs stay clean. */
'use strict';
const AIA = {map:-1, list:[], say:[], t:0, spawnT:0};
const AIA_NAMES = ['ภูผา', 'ใบเตย', 'ต้นกล้า', 'น้ำฝน', 'เมฆา', 'ดาวเหนือ', 'กิ่งแก้ว', 'ปลายฟ้า', 'สายลม', 'พิมพ์ดาว', 'ข้าวหอม', 'มะปราง', 'ธารา', 'อาทิตย์', 'จันทร์เจ้า', 'ฟ้าใส',
  'Ken', 'Mint', 'Fern', 'Toey', 'Beam', 'Ploy', 'Nut', 'Ice', 'Bank', 'Pim', 'Jay', 'Tar', 'Mew', 'Ohm'];
const AIA_TOWN = [['มีใครไปทุ่งสุวรรณินด้วยกันไหม', 'Anyone heading to the Suwannin fields?'], ['ตีบวก +7 แตกอีกแล้ว ฮือ', 'My +7 refine failed again...'], ['วันนี้ได้การ์ดใบแรกด้วย!', 'Got my first card today!'],
  ['ยาส้มหมดพอดี ต้องไปซื้อก่อน', 'Out of orange potions, need to shop'], ['บอสทุ่งเห็นแล้วรีบถอยเลย เกือบไม่รอด', 'Saw the field boss and backed off, close one'], ['ใครรู้บ้างว่าแร่หาได้ที่ไหน', 'Anyone know where to find ore?'],
  ['หอคอยชั้นสิบยากจัง', 'Tower floor ten is tough'], ['เลเวลอัปแล้ว ไปเปลี่ยนอาชีพดีกว่า', 'Levelled up, off to change job'], ['ชุดแฟชั่นใหม่สวยดีนะ', 'The new fashion set looks nice'], ['ไปดันเจียนกันไหม', 'Dungeon run, anyone?']];
const AIA_FIELD = [['มอนแถวนี้ดรอปดีจัง', 'Good drops around here'], ['ขอพักแป๊บ เลือดใกล้หมด', 'Taking a breather, low HP'], ['อีกนิดเดียวจะเลเวลอัป', 'Almost levelled up'], ['ฝูงนี้มีหัวหน้าฝูง ระวังนะ', 'This pack has a leader, careful'],
  ['ได้ของสีม่วงด้วย!', 'Got a purple drop!'], ['ยาแดงยังพออยู่', 'Still got red potions'], ['ทุ่งนี้สวยดีนะ', 'Pretty field, this one']];
const aiaOn = () => (typeof SETTINGS === 'undefined' || SETTINGS.aiAdv !== false) && (!navigator.webdriver || window.AIA_FORCE) && !(typeof GFX !== 'undefined' && GFX.preset === 'low');
const aiaRng = seed => { let s = seed | 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const aiaMapAvg = id => { const m = MAPS[id]; if (!m) return null; const ls = (m.mobs || []).map(k => MOB[k] && !MOB[k].boss && MOB[k].lvl).filter(Boolean); return ls.length ? ls.reduce((a, b) => a + b, 0) / ls.length : null; };
const aiaTown = id => id === 0 || (typeof tlPlace === 'function' && tlPlace(id) >= 0) || !!(MAPS[id] && MAPS[id].town);
const aiaBusy = () => (typeof TW !== 'undefined' && TW.active) || (typeof DG !== 'undefined' && DG.active) || (typeof SIEGE_MAP !== 'undefined' && MAP_ID === SIEGE_MAP);
const aiaOnline = () => typeof NET !== 'undefined' && NET.mapRoom && NET.ghosts && NET.ghosts.size > 0;
// a hero of a level: its class line, job tier, the shop gear it would wear (three looks per map: every look is a sprite sheet)
function aiaHero(r, lv){
  const LINES = ['blade', 'rune', 'ranger', 'muay', 'healer', 'rogue', 'summoner', 'occult', 'merchant', 'catfolk', 'dogfolk', 'ninja'].filter(k => JOBS[k]);
  const kids = j => Object.keys(JOBS).filter(k => JOBS[k].parent === j); let job = LINES[(r() * LINES.length) | 0];
  const line = job, tier = lv < 15 ? 0 : lv < 40 ? 1 : lv < 70 ? 2 : lv < 100 ? 3 : 4; if (tier === 0) job = 'novice';
  for (let t = 1; t < tier; t++){ const k = kids(job); if (!k.length) break; job = k[(r() * k.length) | 0]; }
  const gear = {}; if (typeof GEAR_LIST !== 'undefined') for (const sl of ['weapon', 'armor', 'head', 'shoes']){
    const ok = GEAR_LIST.filter(g => g[1] === sl && g[4] <= lv && ITEMS[g[0]] && !(ITEMS[g[0]].st && ITEMS[g[0]].st.line && ITEMS[g[0]].st.line !== line)).sort((a, b) => b[4] - a[4]);
    if (ok.length) gear[sl] = ok[Math.min(ok.length - 1, (r() * 2) | 0)][0]; }
  const sex = r() < .5 ? 'm' : 'f', HC = typeof HAIR_COLORS !== 'undefined' ? HAIR_COLORS.filter(Boolean) : ['hairBlack'];
  const look = {sex, hair:(r() * 12) | 0, color:HC[(r() * HC.length) | 0]};
  if (gear.weapon && typeof canWield === 'function'){ const s0 = S.job; try { S.job = job; if (!canWield(ITEMS[gear.weapon])) delete gear.weapon; } finally { S.job = s0; } }
  const wt = (JOBS[job].weapon || {}).type; return {job, gear, look, hlv:lv, ranged:wt === 'bow' || wt === 'staff' || wt === 'shuriken' || /rune|healer|summoner|occult/.test(line)};
}
function aiaPoints(id){
  if (aiaTown(id) && typeof tlPoints === 'function'){ const p = tlPoints(id); if (p.length > 4) return p; }
  const pts = [], r = aiaRng(id * 313 + 5); for (let i = 0; i < 400 && pts.length < 40; i++){ const x = 80 + r() * (W - 160), y = 100 + r() * (H - 180); if (walkable(x, y, 12) && !(typeof inVillage === 'function' && id !== 0 && inVillage({x, y}))) pts.push({x, y}); }
  return pts;
}
function aiaSetup(){
  AIA.map = MAP_ID; AIA.list = []; AIA.say = []; if (!aiaOn() || aiaBusy() || !MAPS[MAP_ID]) return;
  const town = aiaTown(MAP_ID), avg = aiaMapAvg(MAP_ID); if (!town && avg == null) return;
  let n = MAP_ID === 0 ? 5 : town ? 4 : 3; if (typeof NET !== 'undefined' && NET.ghosts) n = Math.max(town ? 1 : 0, n - NET.ghosts.size); if (!n) return;
  const r = aiaRng(MAP_ID * 7919 + (Math.floor(Date.now() / 6e5) % 97)); AIA.pts = aiaPoints(MAP_ID); if (AIA.pts.length < 4) return;
  const looks = [0, 1, 2].map(() => aiaHero(r, town ? 10 + Math.floor(r() * 110) : Math.max(1, Math.round(avg + (r() - .3) * 6))));
  const names = [...AIA_NAMES].sort(() => r() - .5);
  for (let i = 0; i < n; i++){ const p = AIA.pts[(r() * AIA.pts.length) | 0], hero = looks[i % 3];
    const lv = Math.max(1, hero.hlv + Math.round((r() - .5) * 4));
    AIA.list.push({name:names[i % names.length], lv, ...hero, x:p.x, y:p.y, tx:null, ty:null, dir:(r() * 8) | 0, animT:r() * 5, act:'idle', moving:false, state:'idle', wait:1 + r() * 4,
      sayCd:8 + r() * 25, spd:46 + r() * 10, foe:null, hitCd:0, town, fade:0}); }
}
const aiaSay = (a, line) => { AIA.say = AIA.say.filter(s => s.a !== a); AIA.say.push({a, s:L(line[0], line[1]), t:4}); };
const aiaClaimed = m => AIA.list.some(o => o.foe === m);
function aiaPickFoe(a){
  let best = null, bd = 650;
  for (const m of mobs){ if (m.dead || m.vanish || !m.def || m.def.boss || m.elite || m.named || m.nm || m.minion || m.aggro || P.target === m || aiaClaimed(m)) continue;
    if (m.def.lvl > a.lv + 3) continue; if (Math.hypot(m.x - P.x, m.y - P.y) < 260) continue;   // leave the monsters near you to you
    const d = Math.hypot(m.x - a.x, m.y - a.y); if (d < bd){ bd = d; best = m; } }
  return best;
}
function aiaHit(a, m){
  const dmg = Math.max(1, Math.round(m.maxhp * (.14 + Math.random() * .12)));
  m.hp -= dmg; m.flash = .12; m.hurtT = .25; m.wait = Math.max(m.wait || 0, 1.2); m.tx = null;
  if (typeof addText === 'function' && Math.hypot(m.x - P.x, m.y - P.y) < 700) addText(m.x, m.y - (MOB_H[m.type] || 30) - 6, String(dmg), '#e8e2ff', 11);
  if (m.hp <= 0){ m.hp = 0; m.dead = true; m.deadT = 0; if (P.target === m) P.target = null; a.foe = null; a.kills = (a.kills || 0) + 1;   // no EXP, drops or quest credit: it is not your kill
    if (typeof SFX !== 'undefined' && Math.hypot(m.x - P.x, m.y - P.y) < 500) SFX.mob && SFX.mob('die', m);
    if (Math.random() < .35){ a.state = 'rest'; a.wait = 4 + Math.random() * 6; } else a.wait = .6 + Math.random() * 1.2;
    if (a.sayCd <= 0 && Math.random() < .3){ aiaSay(a, AIA_FIELD[(Math.random() * AIA_FIELD.length) | 0]); a.sayCd = 30 + Math.random() * 40; } }
}
function aiaUpd(dt){
  if (AIA.map !== MAP_ID){ aiaSetup(); return; }
  if (!aiaOn() || aiaBusy()){ if (AIA.list.length){ AIA.list = []; AIA.say = []; } return; }
  const fight = !aiaOnline();   // with real players on the map the monsters are shared: AI heroes just stroll
  for (const a of AIA.list){
    a.animT += dt; a.sayCd -= dt; a.hitCd -= dt; a.fade = Math.min(1, a.fade + dt * 1.5);
    const dP = Math.hypot(P.x - a.x, P.y - a.y);
    if (a.state === 'rest'){ a.act = 'sit'; a.moving = false; if ((a.wait -= dt) <= 0){ a.state = 'idle'; a.wait = .5; } continue; }
    // in the fields: hunt
    if (!a.town && fight){
      if (a.foe && (a.foe.dead || a.foe.aggro || P.target === a.foe || Math.hypot(a.foe.x - P.x, a.foe.y - P.y) < 200)) a.foe = null;
      if (!a.foe && a.wait <= 0 && Math.random() < .5) a.foe = aiaPickFoe(a);
      if (a.foe){ const m = a.foe, reach = a.ranged ? 140 : 30, d = Math.hypot(m.x - a.x, m.y - a.y);
        if (d > reach){ const ox = a.x, oy = a.y, there = navTo(a, m.x, m.y, a.spd * 1.1, dt, reach - 4); if (a.navFail){ a.navFail = false; a.foe = null; a.wait = 1; }
          a.moving = Math.hypot(a.x - ox, a.y - oy) > .01; if (a.moving) a.dir = SPR.dirFromVec(a.x - ox, a.y - oy); a.act = a.moving ? 'walk' : 'idle'; void there; continue; }
        a.moving = false; a.dir = SPR.dirFromVec(m.x - a.x, m.y - a.y); m.wait = Math.max(m.wait || 0, 1);
        if (a.hitCd <= 0){ a.hitCd = .9 + Math.random() * .5; a.act = 'attack'; a.animT = 0; aiaHit(a, m); } else if (a.animT > .45) a.act = 'idle';
        continue; }
    }
    // stroll: to a point, wait there, sometimes chat when you come close
    if (dP < 70 && !P.ride && a.town){ a.moving = false; a.act = 'idle'; a.dir = SPR.dirFromVec(P.x - a.x, P.y - a.y);
      if (a.sayCd <= 0){ aiaSay(a, AIA_TOWN[(Math.random() * AIA_TOWN.length) | 0]); a.sayCd = 25 + Math.random() * 30; } continue; }
    if (a.wait > 0){ a.wait -= dt; a.moving = false; a.act = 'idle'; if (a.town && a.sayCd <= 0 && Math.random() < dt * .02){ aiaSay(a, AIA_TOWN[(Math.random() * AIA_TOWN.length) | 0]); a.sayCd = 40 + Math.random() * 40; } continue; }
    if (a.tx == null){ const p = AIA.pts[(Math.random() * AIA.pts.length) | 0]; a.tx = p.x + (Math.random() - .5) * 24; a.ty = p.y + (Math.random() - .5) * 16; a.door = p.door; }
    const ox = a.x, oy = a.y, there = navTo(a, a.tx, a.ty, a.spd * (a.town ? .75 : 1), dt, 4);
    if (a.navFail){ a.navFail = false; a.tx = null; a.wait = 1; continue; }
    if (there){ a.tx = null; a.moving = false; a.act = 'idle'; const sit = a.town && Math.random() < .25; if (sit){ a.state = 'rest'; a.wait = 6 + Math.random() * 10; } else a.wait = a.door ? 3 + Math.random() * 6 : 1.5 + Math.random() * 5; if (a.door) a.dir = 4; continue; }
    a.moving = Math.hypot(a.x - ox, a.y - oy) > .01; if (a.moving) a.dir = SPR.dirFromVec(a.x - ox, a.y - oy); a.act = a.moving ? 'walk' : 'idle';
  }
  for (const s of AIA.say) s.t -= dt; AIA.say = AIA.say.filter(s => s.t > 0);
}
EV.on('tick', dt => { try { aiaUpd(dt); } catch (e) { if (!AIA.err){ AIA.err = true; console.warn('aiadv', e); } } });
EV.on('map', () => { AIA.map = -1; });
// drawn in the depth-sorted list, like other heroes
{ const _dg = typeof drawGhostsInto === 'function' ? drawGhostsInto : null;
  drawGhostsInto = function(ents, g){ if (_dg) _dg.apply(this, arguments); if (AIA.map !== MAP_ID) return;
    for (const a of AIA.list){ const x = a.x - cam.x, y = a.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) continue;
      const sh = heroSheet(a.job, a.gear, a.look); if (!sh) continue; const act = sh.index[a.act] ? a.act : 'idle';
      ents.push({y:a.y, f:() => { g.save(); g.globalAlpha *= a.fade; shadowW(g, x, y, 9); SPR.draw(g, sh, act, a.dir, a.animT, x, y); g.restore(); }}); } }; }
{ const _dt = typeof drawGhostTags === 'function' ? drawGhostTags : null;
  drawGhostTags = function(){ if (_dt) _dt.apply(this, arguments); if (AIA.map !== MAP_ID || SETTINGS.oName === false) return;
    for (const a of AIA.list){ const x = sx(a.x), y = sy(a.y); if (x < -100 || x > SW + 100 || y < -80 || y > SH + 80) continue;
      const z = clamp(PX / 2, .5, 2.6), top = sy(a.y - HEAD_H(false)) - 6 * z;
      nameTag(x, top, `AI · ${a.name} Lv${a.lv}`, '#dff6ff', 'rgba(24,60,96,.82)');   // a small tag of its own: never the player's gold name
      const s = AIA.say.find(q => q.a === a); if (s) nameTag(x, top - 20 * z, s.s, '#fff', 'rgba(30,40,70,.88)'); } }; }
// Settings switch
if (typeof renderSettings === 'function'){ const _rs = renderSettings; renderSettings = function(){ _rs.apply(this, arguments);
  const pane = el('pane-settings'); if (!pane || pane.querySelector('#set-aiAdv')) return;
  const row = document.createElement('label'); row.className = 'set';
  row.innerHTML = `<span><b>${L('นักผจญภัย AI ในเกม', 'AI adventurers')}</b><small>${L('ตัวละครที่คอมพิวเตอร์เล่น เดินเล่นในเมือง ล่ามอนในทุ่ง มีป้าย «นักผจญภัย AI» · ไม่แย่งมอนที่คุณตี ไม่ได้ EXP/ของ · เห็นแค่ในเครื่องคุณ', 'Computer-run heroes who stroll in town and hunt in the fields, tagged «AI adventurer» · never take your monsters, get no EXP or loot · only on your device')}</small></span><input type="checkbox" id="set-aiAdv" data-set="aiAdv" ${SETTINGS.aiAdv !== false ? 'checked' : ''}><i class="sw"></i>`;
  const g = pane.querySelector('#set-guideArrow'); const anchor = g ? g.closest('label') : null; if (anchor) anchor.after(row); else pane.appendChild(row); }; }
document.addEventListener('change', e => { if (e.target && e.target.id === 'set-aiAdv') AIA.map = -1; });
