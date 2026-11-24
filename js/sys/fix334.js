/* VAYRATHEN — js/sys/fix334.js — (v334) after the 100-bot playtest:
   1. pack leaders (หัวหน้าฝูง) in the beginner fields (maps whose top level is 15 or less) hit 30% softer: one blow took
      78 of a new player's 166 HP. Everywhere else they are unchanged.
   2. a guide arrow for new players (Lv 1–20) who play by hand: when nothing their level is close by, a small gold arrow
      beside the hero points to the nearest monster that suits them; in Aren it points to the gate of the right field.
      Off with Auto, while fighting, and in Settings (ลูกศรนำทางมือใหม่). */
'use strict';
const FX334 = {beginner:() => { const m = typeof MAPS !== 'undefined' && MAPS[MAP_ID]; return !!(m && m.lv && m.lv[1] <= 15); }};

// ---- 1. softer pack leaders in the beginner fields ----
if (typeof HK !== 'undefined' && HK.atkMul) HK.atkMul.push((m, mult) => (m && m.elite && FX334.beginner() ? mult * .7 : mult));

// ---- 2. the guide arrow ----
const GUIDE = {t:0, aim:null, a:0, label:''};
const guideOn = () => typeof SETTINGS === 'undefined' || SETTINGS.guideArrow !== false;
const guideMapAvg = id => { const m = MAPS[id]; if (!m) return null; const ls = (m.mobs || []).map(k => MOB[k] && !MOB[k].boss && MOB[k].lvl).filter(Boolean); return ls.length ? ls.reduce((a, b) => a + b, 0) / ls.length : null; };
const guideFits = m => !m.dead && !m.vanish && !m.dummy && m.def && !m.def.boss && !m.elite && m.def.lvl <= S.lvl + 2 && m.def.lvl >= S.lvl - 8;
function guidePick(){
  if (!guideOn() || typeof S === 'undefined' || !S || S.lvl > 20 || P.dead || (typeof BOT !== 'undefined' && BOT.on) || (typeof PAUSED !== 'undefined' && PAUSED)) return null;
  if (S.tut && !S.tut.done) return null;   // the tutorial leads the way itself
  if (P.target && !P.target.dead) return null;
  if (MAP_ID === 0){   // in Aren: the gate to the field that fits this level best
    let best = null, bd = 1e9; for (const g of (typeof GATES !== 'undefined' ? GATES : [])){ const a = guideMapAvg(g.to); if (a == null) continue; const d = Math.abs(a - S.lvl); if (d < bd){ bd = d; best = g; } }
    return best ? {x:best.x, y:best.y, label:(MAPS[best.to] && MAPS[best.to].name) || ''} : null; }
  if (typeof inVillage === 'function' && inVillage(P)) return null;
  let near = null, nd = 1e9;
  for (const m of mobs){ if (!guideFits(m)) continue; const d = Math.hypot(m.x - P.x, m.y - P.y); if (d < nd){ nd = d; near = m; } }
  if (!near || nd < 420) return null;   // something to hit is already on screen
  return {x:near.x, y:near.y, label:`${typeof nm === 'function' ? nm(near.def) : ''} Lv ${near.def.lvl}`};
}
EV.on('tick', dt => { GUIDE.t -= dt; if (GUIDE.t <= 0){ GUIDE.t = .5; const p = guidePick(); GUIDE.aim = p; if (p) GUIDE.label = p.label; } GUIDE.a = Math.max(0, Math.min(1, GUIDE.a + (GUIDE.aim ? dt * 3 : -dt * 4))); });
EV.on('draw', () => {
  if (GUIDE.a <= .01 || !GUIDE.aim || typeof ctx === 'undefined') return;
  const ang = Math.atan2(GUIDE.aim.y - P.y, GUIDE.aim.x - P.x), x0 = sx(P.x), y0 = sy(P.y) - 18 * PX, R = 50 * PX, bob = Math.sin(T * 4) * 3 * PX;
  const x = x0 + Math.cos(ang) * (R + bob), y = y0 + Math.sin(ang) * (R + bob), s = 12 * PX;
  ctx.save(); ctx.globalAlpha = GUIDE.a * .95; ctx.translate(x, y); ctx.rotate(ang);
  ctx.shadowColor = 'rgba(255,200,80,.9)'; ctx.shadowBlur = 10 * PX;
  const g = ctx.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, '#ffe9a8'); g.addColorStop(1, '#ffb43a');
  ctx.fillStyle = g; ctx.strokeStyle = 'rgba(40,20,70,.95)'; ctx.lineWidth = 2 * PX; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(s * 1.1, 0); ctx.lineTo(-s * .7, -s * .85); ctx.lineTo(-s * .25, 0); ctx.lineTo(-s * .7, s * .85); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = .8 * PX; ctx.stroke();
  ctx.restore();
  if (GUIDE.label){ ctx.save(); ctx.globalAlpha = GUIDE.a * .9; ctx.font = `700 ${Math.round(10 * PX)}px Sarabun, "Noto Sans Thai", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tx = x, ty = y + (Math.sin(ang) > .5 ? -1 : 1) * (s + 10 * PX), w = ctx.measureText(GUIDE.label).width + 10 * PX, h = 15 * PX;
    ctx.fillStyle = 'rgba(16,12,40,.72)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(tx - w / 2, ty - h / 2, w, h, h / 2); else ctx.rect(tx - w / 2, ty - h / 2, w, h); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.fillText(GUIDE.label, tx, ty); ctx.restore(); }
});
// Settings switch (next to the other help switches)
if (typeof renderSettings === 'function'){ const _rs = renderSettings; renderSettings = function(){ _rs.apply(this, arguments);
  const pane = el('pane-settings'); if (!pane || pane.querySelector('#set-guideArrow')) return;
  const row = document.createElement('label'); row.className = 'set';
  row.innerHTML = `<span><b>${L('ลูกศรนำทางมือใหม่', 'New-player guide arrow')}</b><small>${L('เลเวล 1–20 · ชี้ไปหามอนที่เหมาะกับเลเวลเมื่อแถวนี้ไม่มี (ในเมืองชี้ไปประตูทุ่งที่เหมาะ)', 'Lv 1–20 · points to monsters of your level when none are near (in town, to the right field gate)')}</small></span><input type="checkbox" id="set-guideArrow" data-set="guideArrow" ${guideOn() ? 'checked' : ''}><i class="sw"></i>`;
  const secs = [...pane.querySelectorAll('.sec')], anchor = secs.find(n => /การควบคุม|^Controls?$/.test(n.textContent.trim()));
  if (anchor && anchor.nextSibling) anchor.parentNode.insertBefore(row, anchor.nextSibling); else pane.appendChild(row); }; }

// ---- 3. field bosses: a warning before they charge, and they give up a long chase ----
/* The high-level playtest (bots starting at Lv 50/100/150): players fighting by hand died again and again to the field
   boss, which spotted them across the screen, ran them down (it speeds up the longer you run: "Frenzy") and hit for
   1,800–3,700 against ~5,600 HP. The owner chose: warn first, and let it give up the chase.
   · Spotted: the boss stops, roars, a red «!» and «บอสเห็นคุณแล้ว!» appear, and you get 2 seconds. Still close after
     that → it charges. Walk away in those 2 seconds → it forgets you.
   · Giving up: once it has chased you 1,100 px from where the chase began, or you have stayed out of its reach for
     6 s, it stops, goes back to roaming and recovers its HP (no wearing it down by running it around).
   Only the map's own field boss; tower floors, dungeons, invasions and the world boss are unchanged. */
const FBOSS = {warn:2, leash:1100, lost:6, far:420};
const fieldBoss = m => m && m.def && m.def.boss && !m.wb && !m.calm && typeof MAPS !== 'undefined' && MAPS[MAP_ID] && MAPS[MAP_ID].boss === m.type
  && !(typeof TW !== 'undefined' && TW.active) && !(typeof DG !== 'undefined' && DG.active);
if (typeof updMob === 'function'){ const _um = updMob; updMob = function(m, dt){
  if (m && !m.dead && fieldBoss(m)){
    m.warnSight = true;   // mobs.js leaves the spotting to this
    const d = m.def, dp = Math.hypot(m.x - P.x, m.y - P.y), sight = (bossSeesYou(m) ? BOSS_SIGHT : 240) * (typeof wxSight === 'function' ? wxSight() : 1);
    const free = P.dead || hideBuff() || inVillage(P);
    if (!m.aggro){
      if (m.warnT > 0){
        m.warnT -= dt; m.moving = false; m.dir = SPR.dirFromVec(P.x - m.x, P.y - m.y);
        if (free || dp > sight * 1.6){ m.warnT = 0; m.spotCd = 4; }   // you got away in time
        else if (m.warnT <= 0){ m.aggro = true; m.chase = {x:m.x, y:m.y}; m.lostT = 0; }
        return;   // stands and stares while it warns
      }
      m.spotCd = Math.max(0, (m.spotCd || 0) - dt);
      if (!free && d.aggro && !m.spotCd && dp < sight){
        m.warnT = FBOSS.warn; m.tx = null;
        addText(m.x, m.y - MOB_H[m.type] - 30, L('! บอสเห็นคุณแล้ว', '! The boss has seen you'), '#ff5a4a', 16);
        if (typeof SFX !== 'undefined') SFX.play('roar'); if (typeof VFX !== 'undefined') VFX.play('roar', {x:m.x, y:m.y, r:90});
        if (typeof sysMsg === 'function') sysMsg(L(`${nm(d)} เห็นคุณแล้ว! ถอยออกไปภายใน 2 วินาที หรือเตรียมสู้`, `${nm(d)} has seen you! Back off within 2 seconds or get ready`), 'warn');
        return; }
    } else {
      if (!m.chase) m.chase = {x:m.x, y:m.y};
      const reach = (d.range || d.reach || d.r + 12) + 60; m.lostT = dp > Math.max(FBOSS.far, reach) ? (m.lostT || 0) + dt : 0;
      if (!free && (Math.hypot(m.x - m.chase.x, m.y - m.chase.y) > FBOSS.leash || m.lostT > FBOSS.lost)){
        m.aggro = false; m.flee = 0; m.charge = null; m.enraged = false; m.furyMsg = false; m.chase = null; m.lostT = 0; m.spotCd = 8; m.hp = m.maxhp;
        m.hx = m.x; m.hy = m.y; m.tx = null; m.wait = 1; m.roamT = 0;
        if (P.target === m){ P.target = null; P.pending = null; }
        addText(m.x, m.y - MOB_H[m.type] - 24, L('บอสเลิกไล่ กลับไปพักฟื้น', 'The boss gave up and went back to rest'), '#ffd27a', 14); }
    }
    if (!m.aggro && m.chase) m.chase = null; if (m.aggro) m.warnT = 0;
  }
  return _um.apply(this, arguments); }; }

// ---- 4. dungeons are party content: a clear warning before going in alone ----
/* The playtest bots cleared the first three waves alone without trouble, but the guardian at the end (×3.3 a field
   boss's HP) beat every solo hero of the dungeon's level in one to two minutes. The owner chose to keep dungeons as
   party content and say so plainly: entering alone (no party members) asks first. */
if (typeof dgOpen === 'function'){ const _dgo = dgOpen; dgOpen = function(did){
  const mates = typeof partyMembers === 'function' ? partyMembers().filter(p => !p.isMe) : [], D = DUNGEONS.find(d => d.id === did);
  if (mates.length || !D || D.tower || did === 'tower' || typeof askConfirm !== 'function' || window.__dgSoloOk) return _dgo.apply(this, arguments);
  const a = arguments, me = this;
  askConfirm(L('ดันเจียนนี้สำหรับปาร์ตี้', 'This dungeon is made for a party'),
    L(`${nm(D)} ออกแบบให้ลงกัน 2–5 คน · คนเดียวผ่าน 3 ด่านแรกได้ แต่ผู้พิทักษ์ท้ายดันเจียนแข็งแกร่งมาก (เลือดราว 3 เท่าของบอสทุ่ง) · ชวนเพื่อนตั้งปาร์ตี้ได้ที่เมนู ปาร์ตี้`,
      `${nm(D)} is meant for 2–5 players · alone you can clear the first three waves, but the guardian at the end is very strong (about 3× a field boss's HP) · invite friends from the Party menu`),
    L('เข้าคนเดียว', 'Go in alone'), () => _dgo.apply(me, a)); }; }
