/* VAYRATHEN — js/sys/events274.js — (v274) two more things to turn up for
   · ก็อบลินขนสมบัติ · THE TREASURE GOBLIN: at minute 15 and 35 of every hour (Thai time) a goblin with a sack of gold
     turns up on one hunting map (the same for everyone) and runs from whoever comes near. It never fights back. Every
     hit knocks Bia out of its sack (and now and then something else); bring it down and the sack bursts — lots of Bia,
     Vayra Coins and a chance at gear. It is gone after 2 minutes. Auto chases it like any monster.
   · ชั่วโมงทอง · GOLDEN HOUR: 12:00–13:00 and 16:00–17:00 (Thai time) EXP, Job EXP and drops ×2 (outside the evening
     event, 17:00–02:00, so the two never stack). Made for heroes who leave Auto running.
   A strip under the invasion bar tells both, with a «ไป» button to the goblin's map. */
'use strict';
const GOB_MIN = [15, 35], GOB_LEN = 2, GOLD_HOURS = [12, 16], GOLD_MUL = 2;
const GOB = {key:null, mob:null, hitT:0, done:{}, bar:null, forced:null};
const GOLD = {forced:null, was:false};
/* ---------- when ---------- */
function gobWindow(){
  if (GOB.forced && Date.now() < GOB.forced.until) return {key:GOB.forced.key, active:true, left:(GOB.forced.until - Date.now()) / 6e4};
  if (globalThis.__VTEST__) return null;
  const c = thaiClock(), now = c.m + c.s / 60;
  for (const m0 of GOB_MIN) if (now >= m0 && now < m0 + GOB_LEN) return {key:`${dayKey()}-${c.h}-${m0}`, active:true, left:m0 + GOB_LEN - now};
  return null;
}
function goldWindow(){
  if (GOLD.forced && Date.now() < GOLD.forced.until) return {active:true, left:(GOLD.forced.until - Date.now()) / 6e4};
  if (globalThis.__VTEST__) return null;
  const c = thaiClock(); if (GOLD_HOURS.includes(c.h)) return {active:true, left:60 - c.m - c.s / 60};
  return null;
}
const goldOn = () => { const w = goldWindow(); return !!(w && w.active); };
function gobMap(key){
  const ids = MAPS.map((m, i) => i).filter(i => i > 0 && MAPS[i] && MAPS[i].mobs && MAPS[i].mobs.length && MAPS[i].boss && !(typeof isTown === 'function' && isTown(i)) && (MAPS[i].lv || [99])[0] <= 60 && !(typeof invMap === 'function' && typeof INV !== 'undefined' && INV.key && i === invMap(INV.key)));
  let h = 2166136261; for (const ch of 'gob' + key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ids.length ? ids[(h >>> 0) % ids.length] : -1;
}
/* ---------- the goblin ---------- */
if (MOB.hare && !MOB.tgoblin){ MOB.tgoblin = {...MOB.hare, name:'ก็อบลินขนสมบัติ', en:'Treasure Goblin', drops:[], card:null, cardRate:0, exp:0, jexp:0, aggro:false, gob:true, inv:true, race:'demihuman', speed:62, r:12};
  if (typeof MOB_H !== 'undefined') MOB_H.tgoblin = MOB_H.hare || 40;
}
/* drawn by drawGoblin; anything asking for its sheet gets the hare's (SHEETS is filled after the files load) */
const gobSheet = () => { if (typeof SHEETS !== 'undefined' && SHEETS && typeof SHEETS === 'object' && !Object.getOwnPropertyDescriptor(SHEETS, 'tgoblin')) Object.defineProperty(SHEETS, 'tgoblin', {get:() => SHEETS.hare, set(){}, configurable:true}); };
const gobLv = () => clamp(S.lvl, 1, 300);
function gobSpawn(key){
  gobSheet();
  const at = (typeof invSpot === 'function' && invSpot(260, 420)) || {x:clamp(P.x + 300, 80, W - 80), y:P.y};
  const m = spawnMob('tgoblin', at.x, at.y, {zone:MAPZ}); if (!m) return;
  const Lv = gobLv(), ref = typeof invRef === 'function' ? invRef(Lv, false) : {hp:Lv * 60, def:Lv};
  if (m.elite){ m.elite = false; m.eSk = null; } m.fam = null;
  m.def = {...m.def, lvl:Lv, hp:Math.round(ref.hp * (Lv / Math.max(1, ref.lvl || Lv)) * 4), atk:[0, 0], def:Math.round((ref.def || 0) * 1.2), aggro:false, exp:0, jexp:0, drops:[]};
  m.maxhp = m.hp = m.def.hp; m.gob = key; m.aggro = false; m.tagTxt = ['ก็อบลินขนสมบัติ', 'Treasure Goblin']; m.split = true; GOB.mob = m;
  banner(L('💰 ก็อบลินขนสมบัติโผล่มาแล้ว! ตีให้เหรียญหล่น ล้มได้ให้ถุงแตก', '💰 A Treasure Goblin! Hit it to knock gold out, bring it down to burst the sack'));
  if (VFX && VFX.play) VFX.play('mapArrive', {x:m.x, y:m.y}); if (typeof sfx272 === 'function') try { sfx272('chime'); } catch (e) {}
}
/* it runs from you, never fights back */
function gobRun(m, dt){
  m.aggro = false; m.atkCd = 9; const dx = m.x - P.x, dy = m.y - P.y, d = Math.hypot(dx, dy) || 1;
  if (d < 300 || (m.hurtT > 0)){ const ux = dx / d, uy = dy / d; let best = null;
    for (const a of [0, .5, -.5, 1, -1, 1.6, -1.6]){ const c = Math.cos(a), s = Math.sin(a), tx = clamp(m.x + (ux * c - uy * s) * 180, 70, W - 70), ty = clamp(m.y + (ux * s + uy * c) * 180, 80, H - 70);
      if (walkable(tx, ty, 12)){ best = {x:tx, y:ty}; break; } }
    if (best){ m.gtx = best.x; m.gty = best.y; } }
  // it moves itself (calm monsters may be held by their idle behaviours): a little slower than a hero on foot
  if (m.gtx != null && !(m.stunT > 0) && !(typeof mobRooted === 'function' && mobRooted(m))){ const ex = m.gtx - m.x, ey = m.gty - m.y, ed = Math.hypot(ex, ey);
    if (ed < 4){ m.gtx = null; m.moving = false; } else { const st = Math.min(ed, 105 * dt), nx = m.x + ex / ed * st, ny = m.y + ey / ed * st;
      if (walkable(nx, ny, 10)){ m.x = nx; m.y = ny; m.moving = true; m.dir = SPR.dirFromVec(ex, ey); m.tx = null; } else { m.gtx = null; m.moving = false; } } }
  else m.moving = false;
}
EV.on('tick', dt => {
  if (PAUSED || !S || !S.lvl) return; const w = gobWindow();
  if (!w || w.key !== GOB.key){ if (GOB.mob && !GOB.mob.dead && mobs.includes(GOB.mob)){ GOB.mob.dead = true; GOB.mob.deadT = 0; GOB.mob.vanish = true; toast(L('💨 ก็อบลินขนสมบัติหนีไปแล้ว!', '💨 The Treasure Goblin got away!')); }
    GOB.mob = null; GOB.key = w ? w.key : null; if (w) GOB.announced = false; }
  gobBar(w);
  if (!w || !w.active) return;
  const id = gobMap(w.key);
  if (!GOB.announced){ GOB.announced = true; if (id >= 0) log(L(`💰 ก็อบลินขนสมบัติโผล่ที่${nm(MAPS[id])} · อยู่แค่ ${GOB_LEN} นาที`, `💰 A Treasure Goblin at ${nm(MAPS[id])} · only ${GOB_LEN} minutes`), 'g'); }
  if (MAP_ID !== id || (typeof DG !== 'undefined' && DG.active) || (typeof TW !== 'undefined' && TW.active)) return;
  if (S.gobDone && S.gobDone[w.key]) return;
  const m = GOB.mob && mobs.includes(GOB.mob) ? GOB.mob : mobs.find(q => q.type === 'tgoblin' && !q.dead);
  if (m){ GOB.mob = m; if (!m.dead && !(typeof nmSlave === 'function' && nmSlave())) gobRun(m, dt); return; }   // the host moves it; others see it through the room
  if (!(typeof nmSlave === 'function' && nmSlave())) gobSpawn(w.key);   // the room's host brings it (online); everyone sees it
});
/* Auto goes after the goblin while it is about (it is worth more than anything else on the map) */
{ const _pt = pickTarget; pickTarget = function(){ const g = mobs.find(m => m.type === 'tgoblin' && !m.dead); if (g && Math.hypot(g.x - P.x, g.y - P.y) < 1400) return g; return _pt.apply(this, arguments); }; }
EV.on('tick', () => { if (typeof BOT === 'undefined' || !BOT.on || P.dead) return; const g = mobs.find(m => m.type === 'tgoblin' && !m.dead);
  if (g && P.target !== g && Math.hypot(g.x - P.x, g.y - P.y) < 1400 && !(P.target && P.target.aggro && Math.hypot(P.target.x - P.x, P.target.y - P.y) < 120)){ P.target = g; P.pending = null; } });
/* every hit knocks gold out of the sack */
{ const _ad = applyDamage; applyDamage = function(m){ const h0 = m && m.type === 'tgoblin' ? m.hp : 0; const r = _ad.apply(this, arguments);
    if (m && m.type === 'tgoblin' && h0 > m.hp && T - GOB.hitT > .35){ GOB.hitT = T; const z = Math.round(gobLv() * 14 * (.7 + Math.random() * .6)); S.bia += z; dirty = true;
      addText(m.x, m.y - 46, `+${fmtN(z)} ${CUR()}`, '#ffd84a', 13); if (VFX && VFX.play) VFX.play('pickup', {x:m.x, y:m.y});
      if (Math.random() < .08){ const pool = ['ore', 'whitepot', 'bluepot', 'orangepot', 'ore_a'].filter(k => ITEMS[k]); if (pool.length) dropLoot(pool[(Math.random() * pool.length) | 0], m.x + rand(-14, 14), m.y + rand(-8, 8)); } }
    return r; }; }
EV.on('kill', m => {
  if (!m || m.type !== 'tgoblin') return; const key = m.gob || GOB.key; S.gobDone = S.gobDone || {}; if (S.gobDone[key]) return; S.gobDone[key] = 1;
  const Lv = gobLv(), z = Lv * 400; S.bia += z; if (typeof coinAdd === 'function') coinAdd(2, L('ก็อบลินขนสมบัติ', 'Treasure Goblin'));
  let gear = ''; if (Math.random() < .25 && typeof invChest === 'function') gear = invChest(Lv, 1);
  for (let i = 0; i < 3; i++){ const pool = ['ore', 'ore_a', 'whitepot', 'elixirpot', 'bluepot'].filter(k => ITEMS[k]); if (pool.length) dropLoot(pool[(Math.random() * pool.length) | 0], m.x + rand(-24, 24), m.y + rand(-12, 12)); }
  banner(L(`💰 ถุงสมบัติแตก! +${fmtN(z)} เบี้ย · ◈ 2${gear ? ' · ' + gear : ''}`, `💰 The sack bursts! +${fmtN(z)} Bia · ◈ 2${gear ? ' · ' + gear : ''}`));
  if (VFX && VFX.play) VFX.play('conjure', {x:m.x, y:m.y, col:'auraGold'}); if (typeof sfx272 === 'function') try { sfx272('fanfare'); } catch (e) {}
  if (typeof bump === 'function') bump('goblins'); dirty = true; save();
});
/* it looks like a goblin: green, big ears, a bulging sack of gold on its back */
function drawGoblin(g, m){
  const x = m.x - cam.x, y = m.y - cam.y, t = T * 9 + (m.id || 0), run = m.moving ? Math.abs(Math.sin(t)) * 3 : 0, face = (m.gtx != null ? m.gtx < m.x : m.x < P.x) ? -1 : 1;
  if (typeof shadowW === 'function') shadowW(g, x, y, 11);
  g.save(); g.translate(x, y - run); g.scale(face, 1);
  if (m.dead) g.globalAlpha = Math.max(0, 1 - (m.deadT || 0) * 2);
  // gold glow
  const gl = g.createRadialGradient(-6, -26, 2, -6, -26, 30); gl.addColorStop(0, 'rgba(255,220,90,.45)'); gl.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = gl; g.beginPath(); g.arc(-6, -26, 30, 0, 7); g.fill();
  // sack
  g.fillStyle = '#b07a3a'; g.strokeStyle = '#5a3a14'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(-10, -26, 13, 15, -.2, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#ffd84a'; for (const [cx, cy] of [[-14, -40], [-8, -42], [-3, -39]]){ g.beginPath(); g.arc(cx, cy, 2.6, 0, 7); g.fill(); }
  g.strokeStyle = '#5a3a14'; g.beginPath(); g.moveTo(-17, -37); g.quadraticCurveTo(-10, -33, -3, -37); g.stroke();
  // legs
  const s = Math.sin(t) * (m.moving ? 4 : 0); g.strokeStyle = '#3e6a1e'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-1, -8); g.lineTo(-3 + s, 0); g.moveTo(4, -8); g.lineTo(6 - s, 0); g.stroke();
  // body (vest) and head
  g.fillStyle = '#7a4a2a'; g.beginPath(); g.ellipse(2, -14, 7, 8, 0, 0, 7); g.fill();
  g.fillStyle = '#6fbf3a'; g.strokeStyle = '#2e5a14'; g.lineWidth = 1.3; g.beginPath(); g.ellipse(4, -27, 8, 7.5, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(10, -30); g.lineTo(19, -35); g.lineTo(11, -25); g.closePath(); g.fill(); g.stroke();   // ear
  g.beginPath(); g.moveTo(-2, -30); g.lineTo(-8, -36); g.lineTo(-3, -25); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(7, -28, 2.4, 2.8, 0, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(7.8, -28, 1.2, 0, 7); g.fill();
  g.strokeStyle = '#2e5a14'; g.lineWidth = 1.2; g.beginPath(); g.arc(6, -23, 3, .2, 2.6); g.stroke();   // grin
  g.restore();
  if (m.flash > 0 && !m.dead){ g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(.5, m.flash * 4); g.fillStyle = '#ffe680'; g.beginPath(); g.arc(x, y - 24, 18, 0, 7); g.fill(); g.restore(); }
}
{ const _dm = drawMobW; drawMobW = function(g, m){ if (m && m.type === 'tgoblin') return drawGoblin(g, m); return _dm.apply(this, arguments); }; }
/* ---------- golden hour: EXP, Job EXP and drops ×2 ---------- */
{ const _ge = gainExp; gainExp = function(b, j){ if (goldOn()){ b = Math.round(b * GOLD_MUL); j = Math.round((j || 0) * GOLD_MUL); } return _ge.call(this, b, j); }; }
EV.on('kill', m => { if (!goldOn() || !m || !m.def || m.minion || m.wb || m.type === 'tgoblin' || !Array.isArray(m.def.drops)) return;
  for (const [id, ch] of m.def.drops) if (Math.random() < ch) dropLoot(id, m.x + rand(-10, 10), m.y + rand(-6, 6)); });   // a second roll of the monster's drops = ×2
EV.on('tick', () => { const on = goldOn(); if (on && !GOLD.was && S && S.lvl){ banner(L('✨ ชั่วโมงทอง! EXP JOB และดรอป ×2 นาน 1 ชั่วโมง', '✨ Golden hour! EXP, Job EXP and drops ×2 for an hour')); log(L('✨ ชั่วโมงทองเริ่มแล้ว: EXP JOB และดรอป ×2', '✨ Golden hour: EXP, Job EXP and drops ×2'), 'g'); }
  if (!on && GOLD.was) toast(L('ชั่วโมงทองจบแล้ว', 'Golden hour is over')); GOLD.was = on; });
/* ---------- the strip under the invasion bar ---------- */
function gobBar(w){
  let b = GOB.bar; if (!b){ const host = document.getElementById('wrap'); if (!host) return; b = GOB.bar = document.createElement('div'); b.id = 'evBar274'; host.appendChild(b);
    const st = document.createElement('style'); st.textContent = `#evBar274{position:absolute;top:calc(env(safe-area-inset-top,0px) + 40px);left:50%;transform:translateX(-50%);z-index:29;display:flex;gap:6px;pointer-events:none}
      #evBar274[hidden]{display:none}#evBar274 .eb{display:flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font:700 clamp(10px,1.4vw,13px)/1.2 Sarabun,"Noto Sans Thai",sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.3);white-space:nowrap}
      #evBar274 .eb.gold{background:linear-gradient(#fff2b0,#e8b030);color:#4a2a00;border:1px solid #fff6d0}#evBar274 .eb.gob{background:rgba(30,50,10,.82);color:#e8ffc0;border:1px solid #9ad84a}
      #evBar274 .eb button{pointer-events:auto;padding:1px 9px;border-radius:999px;border:1px solid #ffd27a;background:linear-gradient(#ffcf6a,#e08a20);color:#3a1a04;font:800 inherit;cursor:pointer}`; document.head.appendChild(st); }
  const fmt = m => `${Math.floor(m)}:${String(Math.floor((m % 1) * 60)).padStart(2, '0')}`, gw = goldWindow(); let h = '';
  if (gw && gw.active) h += `<span class="eb gold">✨ ${L('ชั่วโมงทอง EXP/ดรอป ×2', 'Golden hour EXP/drops ×2')} · ${fmt(gw.left)}</span>`;
  if (w && w.active && !(S.gobDone && S.gobDone[w.key])){ const id = gobMap(w.key);
    if (id >= 0) h += `<span class="eb gob">💰 ${L('ก็อบลินขนสมบัติ', 'Treasure Goblin')} · ${MAP_ID === id ? L('อยู่ในแผนที่นี้!', 'on this map!') : nm(MAPS[id])} · ${fmt(w.left)}${MAP_ID !== id ? ` <button data-gobgo="${id}">${L('ไป', 'Go')}</button>` : ''}</span>`; }
  if (b._h !== h){ b._h = h; b.innerHTML = h; } b.hidden = !h;
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-gobgo]'); if (!b) return; const id = +b.dataset.gobgo; if (id < 0 || id === MAP_ID) return;
  if (typeof DG !== 'undefined' && DG.active){ toast(L('ออกจากดันเจี้ยนก่อนนะ', 'Leave the dungeon first')); return; }
  if (typeof TW !== 'undefined' && TW.active){ toast(L('ออกจากหอคอยก่อนนะ', 'Leave the tower first')); return; }
  warpTo(id); dirty = true; });
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'events274', t:['ก็อบลินขนสมบัติ · ชั่วโมงทอง', 'Treasure Goblin · Golden hour'], b:() => L(
  `<p><b>ก็อบลินขนสมบัติ</b>: ทุกชั่วโมงนาทีที่ ${GOB_MIN.join(' และ ')} (เวลาไทย) โผล่ที่แผนที่ล่าหนึ่งแห่ง (ทุกคนเห็นแผนที่เดียวกัน) อยู่ ${GOB_LEN} นาที · วิ่งหนีไม่สู้ · ตีทุกครั้งได้เบี้ย บางทีได้ของ · ล้มได้เบี้ยก้อนใหญ่ เหรียญวายรา 2 และลุ้นอุปกรณ์ · กด «ไป» ที่แถบด้านบนเพื่อวาร์ปไป</p><p><b>ชั่วโมงทอง</b>: ${GOLD_HOURS.map(h => `${h}:00–${h + 1}:00`).join(' และ ')} EXP JOB และดรอป ×2 (ไม่ซ้อนกับกิจกรรมหลังเลิกงาน 17:00–02:00)</p>`,
  `<p><b>Treasure Goblin</b>: at minute ${GOB_MIN.join(' and ')} of every hour (Thai time) it turns up on one hunting map (the same for everyone) for ${GOB_LEN} minutes · it runs and never fights · every hit knocks Bia out, sometimes an item · bring it down for a pile of Bia, 2 Vayra Coins and a chance at gear · «Go» on the top strip warps you there</p><p><b>Golden hour</b>: ${GOLD_HOURS.map(h => `${h}:00–${h + 1}:00`).join(' and ')} EXP, Job EXP and drops ×2 (never on top of the evening event, 17:00–02:00)</p>`)});
