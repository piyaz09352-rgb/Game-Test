/* VAYRATHEN — js/sys/towerfloors226.js — (v226) floors that are not all the same
   Every tower floor used to be "beat every monster". Now each floor between the guardians has one of five kinds,
   fixed by the floor number (so a party, a re-climb and the weekly board all meet the same floor):
     ⚔ ล่าล้าง (hunt)       — beat them all, as before
     ⏳ เอาตัวรอด (survive)  — 40 seconds; new monsters keep rising round the seal; the floor is cleared when time is up
     ★ ล่าหัวหน้า (elite)    — a ★ leader with its pack; beat the leader and the pack flees
     ☠ ชั้นคำสาป (curse)     — beat them all under a curse (frenzy: monsters hit harder and move faster · drought: no
                              potions on this floor); pays double Bia
     💰 ห้องสมบัติ (treasure) — no monsters: six chests round the hall, 25 seconds to open them (walk onto one)
   Floors 1–2 are always hunts; guardian floors (every 5th) are unchanged. The floor's kind shows on arrival (banner),
   in the map label and in the quest card. Auto handles every kind (it walks to the chests). */
'use strict';
const TWF = {kind:'hunt', f:0, elite:null, curse:null, chests:[], topT:0, potT:0};
const TWF_INFO = {
  hunt:['⚔', 'ล่าล้าง', 'Hunt', 'ปราบมอนให้หมด', 'Beat them all'],
  survive:['⏳', 'เอาตัวรอด', 'Survive', 'อยู่รอดให้ครบ 40 วินาที มอนจะเกิดเพิ่มเรื่อย ๆ', 'Last 40 seconds while more keep rising'],
  elite:['★', 'ล่าหัวหน้า', 'Leader hunt', 'ปราบหัวหน้าฝูงแล้วลูกฝูงจะหนีไป', 'Beat the leader and its pack flees'],
  curse:['☠', 'ชั้นคำสาป', 'Cursed floor', 'ปราบให้หมดภายใต้คำสาป · เบี้ย ×2', 'Beat them all under a curse · Bia ×2'],
  treasure:['💰', 'ห้องสมบัติ', 'Treasure room', 'เปิดหีบให้ได้มากที่สุดใน 25 วินาที', 'Open as many chests as you can in 25 s']
};
const TWF_CURSE = {frenzy:['คลุ้มคลั่ง: มอนตีแรงและเร็วขึ้น', 'Frenzy: monsters hit harder and move faster'], drought:['แห้งแล้ง: ใช้ยาไม่ได้ในชั้นนี้', 'Drought: no potions on this floor']};
function twfKind(f){
  if (f % 5 === 0) return 'guard'; if (f < 3) return 'hunt';
  const h = ((f * 2654435761) >>> 0) % 100;
  return h < 38 ? 'hunt' : h < 58 ? 'survive' : h < 76 ? 'elite' : h < 91 ? 'curse' : 'treasure';
}
const twfOn = () => typeof TW !== 'undefined' && TW.active && TW.phase === 'fight' && TWF.f === TW.f;
const twfKinds = () => { const mp = MAPS[TW.theme] || {}; return (mp.mobs || []).filter(t => MOB[t] && !MOB[t].night && !MOB[t].boss); };
const twfRing = (i, n, k = .62) => { const c = typeof twmC === 'function' ? twmC() : {x:P.x, y:P.y}; const a = i / n * 6.283 + .3; return {x:Math.round(c.x + Math.cos(a) * TWM_RX * k), y:Math.round(c.y + Math.sin(a) * TWM_RY * k)}; };
function twfLabel(){ const k = TWF.f === TW.f ? TWF.kind : twfKind(TW.f); if (k === 'guard') return ''; const I = TWF_INFO[k]; return `${I[0]} ${L(I[1], I[2])}${k === 'curse' && TWF.curse ? ` (${L(...TWF_CURSE[TWF.curse]).split(':')[0]})` : ''}`; }

/* ---------- a floor begins ---------- */
{ const _sp = twSpawn; twSpawn = function(){
    const f = TW.f, kind = twfKind(f); Object.assign(TWF, {kind, f, elite:null, curse:null, chests:[], topT:6});
    if (kind === 'treasure' && twHost()){
      TWF.chests = [0, 1, 2, 3, 4, 5].map(i => ({...twfRing(i, 6), open:false}));
      Object.assign(TW, {spawned:true, mine:true, phase:'fight', t:25}); DG.lv = twLvC(f); if (typeof dgLabel === 'function') dgLabel();
      banner(L(`ชั้น ${f} · 💰 ห้องสมบัติ · เปิดหีบใน 25 วินาที`, `Floor ${f} · 💰 Treasure room · 25 s to open the chests`)); SFX.play('quest'); return; }
    const r = _sp.apply(this, arguments); if (kind === 'guard' || kind === 'hunt'){ if (typeof dgLabel === 'function') dgLabel(); return r; }
    const mine = mobs.filter(m => m.tw === f && !m.dead), I = TWF_INFO[kind];
    if (kind === 'survive') TW.t = 40;
    if (kind === 'elite' && mine.length){ const e = mine[0]; if (typeof dgElite === 'function') dgElite(e, L('หัวหน้า', '')); TWF.elite = e; for (const m of mine.slice(4)){ m.dead = true; m.vanish = true; } }
    if (kind === 'curse'){ TWF.curse = f % 2 ? 'frenzy' : 'drought';
      if (TWF.curse === 'frenzy') for (const m of mine){ m.def = {...m.def, atk:m.def.atk.map(v => Math.round(v * 1.3)), speed:(m.def.speed || 50) * 1.25}; } }
    banner(L(`ชั้น ${f} · ${I[0]} ${I[1]} · ${kind === 'curse' ? TWF_CURSE[TWF.curse][0] : I[3]}`, `Floor ${f} · ${I[0]} ${I[2]} · ${kind === 'curse' ? TWF_CURSE[TWF.curse][1] : I[4]}`));
    if (typeof dgLabel === 'function') dgLabel(); return r; }; }

/* ---------- while a floor runs ---------- */
EV.on('tick', dt => {
  if (!twfOn() || PAUSED || !twHost()) return;
  if (TWF.kind === 'survive'){
    if (TW.t < 1){ for (const m of mobs) if (m.tw === TW.f && !m.dead){ m.dead = true; m.vanish = true; } TW.t = 99; return; }   // time is up: the floor is won (the tower sees it empty and clears it)
    if ((TWF.topT -= dt) <= 0){ TWF.topT = 6; const kinds = twfKinds(), alive = mobs.filter(m => m.tw === TW.f && !m.dead).length;
      for (let i = alive; i < 6 && kinds.length; i++){ const p = twfRing(i + Math.random() * 6, 6, .3 + Math.random() * .3); twMob(kinds[(i + TW.f) % kinds.length], p.x, p.y, TW.f); VFX.play('bossSummon', p); } } }
  if (TWF.kind === 'elite' && TWF.elite && TWF.elite.dead){ for (const m of mobs) if (m.tw === TW.f && !m.dead){ m.dead = true; m.vanish = true; } TWF.elite = null; }
  if (TWF.kind === 'treasure'){
    for (const c of TWF.chests) if (!c.open && Math.hypot(P.x - c.x, P.y - c.y) < 34){ c.open = true; const z = twLvC(TW.f) * 8; S.bia += z; TW.gain.z += z;
      addText(c.x, c.y - 40, `+${fmtN(z)} ${L('เบี้ย', 'Bia')}`, '#ffd34a', 15); VFX.play('coins', {x:c.x, y:c.y - 20}); SFX.play('drop2'); dirty = true; }
    const left = TWF.chests.filter(c => !c.open);
    if (!left.length || TW.t < 1){ TWF.chests = []; TW.t = 99; twClear(); return; }
    if (typeof BOT !== 'undefined' && BOT.on && !(BOT.pause > 0)){ const n = left.sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0]; P.tx = n.x; P.ty = n.y; P.target = null; } }
});
// the treasure room has no monsters: the tower must not call it cleared before the chests are done
{ const _tc = twClear; twClear = function(){
    if (TWF.f === TW.f && TWF.kind === 'treasure' && TWF.chests.some(c => !c.open) && TW.t > 1) return;
    if (TWF.f === TW.f && TWF.kind === 'survive' && TW.phase === 'fight' && TW.t > 1 && TW.t < 98){ TWF.topT = 0; return; }   // survive: an empty hall just fills again until time is up
    const cursed = TWF.f === TW.f && TWF.kind === 'curse', z0 = S.bia; const r = _tc.apply(this, arguments);
    if (cursed){ const extra = S.bia - z0 > 0 ? Math.round(twLvC(TW.f - 1) * 25) : 0; if (extra){ S.bia += extra; TW.gain.z += extra; addText(P.x, P.y - 92, L(`คำสาปสลาย! +${fmtN(extra)} เบี้ย`, `Curse lifted! +${fmtN(extra)} Bia`), '#d8a0ff', 15); } }
    return r; }; }
// drought: no potions
{ const _u = useItem; useItem = function(id){ const it = ITEMS[id];
    if (twfOn() && TWF.kind === 'curse' && TWF.curse === 'drought' && it && (it.heal || it.spheal)){ if (T - TWF.potT > 3){ TWF.potT = T; toast(L('คำสาปแห้งแล้ง: ใช้ยาไม่ได้ในชั้นนี้', 'Drought curse: no potions on this floor')); } return; }
    return _u.apply(this, arguments); }; }

/* ---------- drawing: the chests, and the floor's kind in the label and the quest card ---------- */
function twfChest(g, x, y, open, t){
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y, 17, 5, 0, 0, 7); g.fill();
  g.fillStyle = '#7a4a1e'; g.fillRect(x - 15, y - 18, 30, 18); g.fillStyle = '#e3b04b'; g.fillRect(x - 15, y - 11, 30, 3); g.fillRect(x - 2, y - 14, 4, 7);
  if (open){ g.fillStyle = '#5a3414'; g.fillRect(x - 15, y - 30, 30, 8); g.fillStyle = '#ffe9a0'; g.globalAlpha = .6 + Math.sin(t * 6) * .2; g.fillRect(x - 12, y - 22, 24, 4); g.globalAlpha = 1; }
  else { g.fillStyle = '#8f5a26'; g.beginPath(); g.moveTo(x - 15, y - 18); g.quadraticCurveTo(x, y - 30, x + 15, y - 18); g.closePath(); g.fill(); g.fillStyle = '#e3b04b'; g.fillRect(x - 15, y - 19, 30, 2.5);
    const b = Math.sin(t * 3 + x) * 3; g.fillStyle = `rgba(255,230,120,${.55 + Math.sin(t * 4 + x) * .25})`; g.beginPath(); g.moveTo(x, y - 46 + b); g.lineTo(x + 5, y - 38 + b); g.lineTo(x, y - 30 + b); g.lineTo(x - 5, y - 38 + b); g.closePath(); g.fill(); }
}
{ const _dg = typeof drawGhostsInto === 'function' ? drawGhostsInto : null;
  drawGhostsInto = function(ents, g){ if (_dg) _dg.apply(this, arguments); if (!twfOn() || TWF.kind !== 'treasure') return;
    for (const c of TWF.chests) ents.push({y:c.y, f:() => twfChest(g, c.x - cam.x, c.y - cam.y, c.open, T)}); }; }
{ const _l = dgLabel; dgLabel = function(){ const r = _l.apply(this, arguments); if (typeof TW === 'undefined' || !TW.active) return r; const e = document.getElementById('mapName'), t = twfLabel(); if (e && t && !e.textContent.includes(t)) e.textContent += ` · ${t}`; return r; }; }
{ const _qt = questTracker; questTracker = function(){ const h = _qt.apply(this, arguments); if (typeof TW === 'undefined' || !TW.active || TW.phase !== 'fight') return h; const t = twfLabel(); if (!t) return h;
    const k = TWF.kind, extra = k === 'treasure' ? ` · ${L('หีบ', 'chests')} ${TWF.chests.filter(c => c.open).length}/6` : k === 'elite' ? ` · ${L('ปราบหัวหน้า', 'beat the leader')}` : k === 'survive' ? ` · ${L('อยู่รอดจนหมดเวลา', 'last until time runs out')}` : '';
    return h.replace('<br>', ` · ${t}${extra}<br>`); }; }
