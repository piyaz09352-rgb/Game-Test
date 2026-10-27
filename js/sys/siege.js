/* VAYRATHEN — js/sys/siege.js — Guild War: the siege of the Khmer sanctuary (สงครามปราสาท)
   · Every SATURDAY and SUNDAY 20:00–20:30 (Thai time) the CROWN CRYSTAL rises in the Ancient Khmer Sanctuary
     (map 10). It does not fight back, but waves of alpha guardians spawn around it every minute.
   · Every hit on the crystal counts for your guild (the live scoreboard is shared with everyone on the map).
     The guild whose member BREAKS the crystal takes the castle; the crystal reforms with full strength 10 seconds
     later and the others can take it back. Whoever holds it when the bell rings at 20:30 keeps it for the week.
   · The castle's guild: a golden crown and aura that everyone sees, and its members collect a daily tribute
     (10 Vayra Coins + 20,000 Bia) from General Chaiyan in Aren.
   · Practice any time: General Chaiyan raises a training crystal next to you (3 minutes, with guardians).
   Online it lives in the shared database (guilds/_siege) and room events ('gw'); everything received is checked. */
'use strict';

MOB.crowncrystal = {name:'ผลึกจักรพรรดิ', en:'Crown Crystal', lvl:90, hp:90000, atk:[0, 0], def:40, defPct:.25, elem:'holy', race:'formless', size:'l', exp:0, jexp:0, speed:0, delay:999, r:20, drops:[], card:null, cardRate:0};
MOB_H0.crowncrystal = 74;
const SIEGE_MAP = 10, SIEGE_DUR = 30;
const SG = {owner:null, tally:{}, my:0, sendT:0, waveT:0, respT:0, emp:null, prac:null, unsub:null, wasLive:false, spot:null};
function siegeLive(){ const c = thaiClock(); return (c.dow === 6 || c.dow === 0) && c.h === 20 && c.m < SIEGE_DUR; }
function siegeNext(){
  const now = Date.now(), d = new Date(now + 7 * 3600e3);
  for (let i = 0; i < 8; i++){ const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + i, 20, 0) - 7 * 3600e3), dow = new Date(x.getTime() + 7 * 3600e3).getUTCDay();
    if ((dow === 6 || dow === 0) && x.getTime() + SIEGE_DUR * 60e3 > now) return x.getTime(); }
  return now;
}
const siegeOwnerMe = () => !!(S.guild && SG.owner && SG.owner.gid === S.guild.id);
const siegePres = () => ({sg:siegeOwnerMe() ? 1 : 0});
/* a fixed spot for the crystal (the same for every player) */
function siegeSpot(){
  if (SG.spot && SG.spot.map === MAP_ID) return SG.spot;
  const cx = (MAPZ.x0 + MAPZ.x1) / 2, cy = (MAPZ.y0 + MAPZ.y1) / 2;
  for (let i = 0; i < 200; i++){ const a = i * 2.4, r = i * 6, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .7; if (walkable(x, y, 34)) return (SG.spot = {x, y, map:MAP_ID}); }
  return (SG.spot = {x:cx, y:cy, map:MAP_ID});
}
/* ---------- the crystal: never moves, never fights, drawn by hand ---------- */
HK.mobPre.unshift(m => (m.type === 'crowncrystal' ? (m.aggro = false, true) : undefined));
HK.spawn.push(m => { if (m.type !== 'crowncrystal') return; m.tagTxt = ['เป้าหมายสงคราม', 'War objective']; m.dir = 0; });
function drawCrownCrystal(g, m, x, y){
  const k = m.dead ? Math.max(0, 1 - m.deadT * 1.5) : 1, hpk = m.hp / m.maxhp, t = T, bob = Math.sin(t * 1.8) * 3, cy = y - 40 + bob;
  g.save(); g.globalAlpha = k;
  shadowW(g, x, y, 22);
  // the dais
  g.fillStyle = '#5a5248'; g.beginPath(); g.ellipse(x, y, 30, 11, 0, 0, 7); g.fill(); g.fillStyle = '#8a8070'; g.beginPath(); g.ellipse(x, y - 3, 26, 9, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,220,140,.55)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 3, 20, 6.5, 0, 0, 7); g.stroke();
  // glow
  g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, cy, 2, x, cy, 46); gr.addColorStop(0, `rgba(150,220,255,${.55 * k})`); gr.addColorStop(1, 'rgba(80,140,255,0)'); g.fillStyle = gr; g.fillRect(x - 46, cy - 46, 92, 92);
  g.globalCompositeOperation = 'source-over';
  // crystal body: a tall octahedron, facets lit from the upper left
  const w = 13, h = 30, sh = m.flash > 0 ? 1 : 0, f = (a, b, c, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c); g.closePath(); g.fill(); };
  const top = [x, cy - h], bot = [x, cy + h * .7], L_ = [x - w, cy], R_ = [x + w, cy], F_ = [x + Math.sin(t) * 3, cy + 2];
  f(top, L_, F_, sh ? '#ffffff' : '#bfeaff'); f(top, F_, R_, sh ? '#f0faff' : '#6ec0f0'); f(bot, L_, F_, sh ? '#e8f6ff' : '#4a98d8'); f(bot, F_, R_, sh ? '#d8eeff' : '#2a64b0');
  g.strokeStyle = 'rgba(230,250,255,.9)'; g.lineWidth = .8; g.beginPath(); g.moveTo(...top); g.lineTo(...F_); g.lineTo(...bot); g.stroke();
  // cracks as it weakens
  if (hpk < .66){ g.strokeStyle = 'rgba(20,40,80,.7)'; g.lineWidth = .9; g.beginPath(); g.moveTo(x - 4, cy - 14); g.lineTo(x + 1, cy - 5); g.lineTo(x - 3, cy + 4); if (hpk < .33){ g.moveTo(x + 6, cy - 6); g.lineTo(x + 2, cy + 6); g.lineTo(x + 7, cy + 12); } g.stroke(); }
  // orbiting runes
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++){ const a = t * 1.2 + i * 1.047, px = x + Math.cos(a) * 24, py = cy + 6 + Math.sin(a) * 8; g.fillStyle = `rgba(255,230,150,${(.5 + .5 * Math.sin(a)) * k})`; g.fillRect(px - 1, py - 1, 2, 2); }
  g.restore();
}
{ const _d = drawMobW; drawMobW = function(g, m){ if (m.type !== 'crowncrystal') return _d(g, m); const x = m.x - cam.x, y = m.y - cam.y; if (x < -80 || x > VW + 80 || y < -100 || y > VH + 60) return; drawCrownCrystal(g, m, x, y); }; }
/* ---------- damage tally (your guild's share) ---------- */
HK.dmgAfter.push((m, res, sk, hp0) => {
  if (!m || m.type !== 'crowncrystal' || !S.guild) return; const d = Math.max(0, (hp0 || 0) - Math.max(0, m.hp)); if (!d) return;
  SG.my += d; const t = SG.tally[S.guild.id] || (SG.tally[S.guild.id] = {gn:S.guild.name, d:0}); t.d += d;
});
function siegeSend(){ if (!SG.my || !S.guild || !NET.room || !NET.on) { SG.my = 0; return; } NET.room.emit('gw', {k:'d', g:S.guild.id, gn:S.guild.name, d:Math.round(SG.my)}).catch(() => {}); SG.my = 0; }
function onGw(msg){
  const d = msg.data || {}; if (msg.isMe) return; const gid = typeof d.g === 'string' && /^g[a-z0-9]{4,30}$/.test(d.g) ? d.g : null; if (!gid) return; const gn = clean(d.gn, 16);
  if (d.k === 'd' && siegeLive()){ const t = SG.tally[gid] || (SG.tally[gid] = {gn, d:0}); t.d += clamp(+d.d || 0, 0, 2e6); reWin('siege'); }
  if (d.k === 'win'){ SG.owner = {gid, gn, at:Date.now()}; siegeWonFx(gn); }
}
function siegeWonFx(gn){ banner(L(`⚔ กิลด์ ⟨${gn}⟩ ทำลายผลึกจักรพรรดิ ยึดปราสาทได้!`, `⚔ ⟨${gn}⟩ broke the Crown Crystal and took the castle!`)); SFX.play('quest'); log(L(`กิลด์ ${gn} ยึดปราสาทหินขอม`, `${gn} took the Khmer castle`), 'g'); reWin('siege'); if (typeof NET !== 'undefined') NET.presT = 0; }
EV.on('kill', m => {
  if (!m || m.type !== 'crowncrystal') return;
  if (m.prac){ SG.prac = null; S.bia += 1000; banner(L('ฝึกซ้อมสำเร็จ! ทำลายผลึกฝึกได้ · +1,000 เบี้ย', 'Training crystal broken! +1,000 Bia')); SFX.play('quest'); return; }
  if (!siegeLive() || !S.guild) { if (!S.guild) toast(L('ต้องมีกิลด์จึงจะยึดปราสาทได้', 'You need a guild to take the castle')); return; }
  SG.owner = {gid:S.guild.id, gn:S.guild.name, at:Date.now()}; siegeWonFx(S.guild.name); bump('siege');
  if (NET.db) NET.db.doc('guilds/_siege').set({gid:S.guild.id, gn:S.guild.name, by:netName(), at:Date.now()}).catch(() => {});
  if (NET.room && NET.on) NET.room.emit('gw', {k:'win', g:S.guild.id, gn:S.guild.name}).catch(() => {});
});
EV.on('netready', () => {
  if (NET.room) NET.room.on('gw', onGw, () => {});
  if (NET.db){ try { SG.unsub = NET.db.doc('guilds/_siege').onSnapshot(d => { const v = d.exists ? d.data() : null;
    SG.owner = v && typeof v.gid === 'string' && /^g[a-z0-9]{4,30}$/.test(v.gid) ? {gid:v.gid, gn:clean(v.gn, 16), at:+v.at || 0} : null; reWin('siege'); }, () => {}); } catch (e) {} }
});
/* ---------- the war itself: crystal, guardian waves, bells ---------- */
function siegeGuard(at, n, prac){
  const pool = (MAPS[MAP_ID].mobs || []).filter(t => MOB[t] && !MOB[t].boss); if (!pool.length) return;
  for (let i = 0; i < n; i++){ const a = Math.random() * 6.28, x = at.x + Math.cos(a) * 90, y = at.y + Math.sin(a) * 60; if (!walkable(x, y, 14)) continue;
    const m = spawnMob(pool[(Math.random() * pool.length) | 0], x, y, {zone:MAPZ}); if (typeof makeElite === 'function') makeElite(m); m.tagTxt = ['ผู้พิทักษ์ปราสาท', 'Castle Guardian']; m.aggro = true; m.sgd = 1; if (prac) m.prac = 1; }
}
function siegeCrystal(at, prac){
  const m = spawnMob('crowncrystal', at.x, at.y, {zone:MAPZ}); m.elite = false;
  const hp = prac ? Math.round(1500 + S.lvl * 60) : MOB.crowncrystal.hp; m.maxhp = m.hp = hp; if (prac) m.prac = 1; VFX.play('bossArrive', {x:at.x, y:at.y}); return m;
}
EV.on('tick', dt => {
  const live = siegeLive();
  if (live !== SG.wasLive){ SG.wasLive = live;
    if (live){ SG.tally = {}; banner(L('⚔ สงครามปราสาทเริ่มแล้ว! ผลึกจักรพรรดิปรากฏที่ปราสาทหินขอมโบราณ (20:00–20:30)', '⚔ The castle siege has begun! The Crown Crystal rises in the Ancient Khmer Sanctuary (20:00–20:30)')); SFX.play('quest'); }
    else if (SG.owner){ banner(L(`🔔 สงครามปราสาทจบแล้ว · ⟨${SG.owner.gn}⟩ ครองปราสาทสัปดาห์นี้`, `🔔 The siege is over · ⟨${SG.owner.gn}⟩ holds the castle this week`)); for (const m of mobs) if ((m.type === 'crowncrystal' && !m.prac) || (m.sgd && !m.prac)){ m.dead = true; m.deadT = 1; m.vanish = true; } }
    reWin('siege'); }
  SG.sendT -= dt; if (SG.sendT <= 0){ SG.sendT = 2; siegeSend(); }
  const slave = typeof nmSlave === 'function' && nmSlave();
  // the real war on map 10 (the room's host runs the crystal and the waves for everyone)
  if (live && MAP_ID === SIEGE_MAP && !slave){
    const at = siegeSpot(); let e = mobs.find(m => m.type === 'crowncrystal' && !m.prac && !m.dead);
    if (!e){ SG.respT -= dt; if (SG.respT <= 0){ SG.emp = siegeCrystal(at, false); SG.respT = 10; } }
    else SG.respT = 10;
    SG.waveT -= dt; if (SG.waveT <= 0 && e){ SG.waveT = 60; if (mobs.filter(m => m.sgd && !m.dead && !m.prac).length < 12) siegeGuard(at, 4, false); }
  }
  // practice
  if (SG.prac){ SG.prac.t -= dt; const pm = SG.prac.m;
    if (SG.prac.t <= 0 || MAP_ID !== SG.prac.map || P.dead){ if (pm && !pm.dead){ pm.dead = true; pm.deadT = 1; pm.vanish = true; } for (const m of mobs) if (m.prac && m.sgd && !m.dead){ m.dead = true; m.deadT = 1; m.vanish = true; } toast(L('หมดเวลาฝึกซ้อม', 'Training over')); SG.prac = null; }
    else { SG.prac.w -= dt; if (SG.prac.w <= 0){ SG.prac.w = 45; siegeGuard(pm, 3, true); } } }
});
function siegePractice(){
  if (SG.prac) return toast(L('กำลังฝึกซ้อมอยู่', 'Already training'));
  if (MAP_ID === 0) return toast(L('ออกไปฝึกนอกหมู่บ้านนะ (แผนที่ล่าไหนก็ได้)', 'Train outside the village (any field map)'));
  if (typeof nmActive === 'function' && nmActive()) return toast(L('ฝึกซ้อมได้เมื่ออยู่คนเดียวในแผนที่', 'Training works when you are alone on the map'));
  let at = null; for (let i = 0; i < 30 && !at; i++){ const a = Math.random() * 6.28, x = P.x + Math.cos(a) * 150, y = P.y + Math.sin(a) * 100; if (walkable(x, y, 34)) at = {x, y}; }
  if (!at) return toast(L('ไม่มีที่ว่างพอ ลองขยับไปที่โล่ง', 'No room here, try an open spot'));
  const m = siegeCrystal(at, true); SG.prac = {t:180, w:3, m, map:MAP_ID}; closeDialog(); banner(L('ฝึกซ้อมสงครามปราสาท: ทำลายผลึกใน 3 นาที!', 'Siege training: break the crystal within 3 minutes!'));
}
/* ---------- crown and aura of the castle's guild ---------- */
function siegeAura(g, x, y, t){
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++){ const r = 15 + i * 4; g.strokeStyle = `rgba(255,${200 - i * 30},80,${.5 - i * .12 + .1 * Math.sin(t * 3 + i)})`; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, r, r * .38, 0, 0, 7); g.stroke(); }
  for (let i = 0; i < 5; i++){ const ph = (t * .5 + i / 5) % 1, a = i * 1.257 + t * .4; g.fillStyle = `rgba(255,220,120,${Math.sin(ph * Math.PI) * .9})`; g.fillRect(x + Math.cos(a) * 16, y + Math.sin(a) * 6 - ph * 26, 1.4, 1.4); }
  g.restore();
}
function siegeCrown(x, y){
  const z = typeof TAG_Z === 'function' ? TAG_Z() : 1; ctx.save(); ctx.translate(x, y); ctx.scale(z, z);
  ctx.fillStyle = '#ffd34a'; ctx.strokeStyle = 'rgba(90,50,0,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-8, 3); ctx.lineTo(-9, -5); ctx.lineTo(-4, -1); ctx.lineTo(0, -7); ctx.lineTo(4, -1); ctx.lineTo(9, -5); ctx.lineTo(8, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e8403a'; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
}
{
  const _ents = LIVE.ents;
  LIVE.ents = function(list, g){ _ents(list, g);
    if (siegeOwnerMe() && !P.dead) list.push({y:P.y - .5, f:() => siegeAura(g, P.x - cam.x, P.y - cam.y, T)});
    if (typeof NET !== 'undefined' && NET.ghosts) for (const gh of NET.ghosts.values()){ const q = gh.q || {}; if (q.sg === 1 && !q.dead) list.push({y:gh.y - .5, f:() => siegeAura(g, gh.x - cam.x, gh.y - cam.y, T + 1)}); } };
}
EV.on('draw', () => {
  if (siegeOwnerMe() && !P.dead && P.tagTop != null) siegeCrown(sx(P.x), P.tagTop - 12);
  if (typeof NET !== 'undefined' && NET.ghosts) for (const gh of NET.ghosts.values()){ const q = gh.q || {}; if (q.sg === 1 && !q.dead && gh.tagTop != null) siegeCrown(sx(gh.x), gh.tagTop - 12); }
});
/* ---------- window + General Chaiyan ---------- */
mkWin('siege', 'สงครามปราสาท', 'Castle Siege', '', '<path d="M4 17V8l2-1v2h2V6l2-2 2 2v3h2V7l2 1v9z"/><path d="M8.5 17v-3.5h3V17"/>', false);
WIN_RENDER.siege = function(){
  const pane = el('pane-siege'); if (!pane) return; const live = siegeLive(), nx = siegeNext(), left = Math.max(0, nx - Date.now()), own = SG.owner;
  const hh = Math.floor(left / 3600e3), mm = Math.floor(left % 3600e3 / 60e3);
  const rows = Object.entries(SG.tally).sort((a, b) => b[1].d - a[1].d).slice(0, 8);
  const tribute = siegeOwnerMe() && (S.sgDay || 0) !== dayKey();
  pane.innerHTML = `<div class="sgcard${live ? ' live' : ''}"><div class="sgcrest">🏯</div><div><b>${L('ปราสาทหินขอมโบราณ', 'Ancient Khmer Sanctuary')}</b>
      <small>${live ? `<em class="sglive">${L('กำลังรบ!', 'War is ON!')}</em> ${L('จบ 20:30', 'ends 20:30')}` : `${L('รอบถัดไป', 'Next war')}: ${new Date(nx + 7 * 3600e3).toISOString().slice(5, 10).split('-').reverse().join('/')} 20:00 · ${L('อีก', 'in')} ${hh}${L('ชม.', 'h')} ${mm}${L('น.', 'm')}`}</small>
      <small>${L('ผู้ครอง', 'Held by')}: ${own ? `<b class="sgown">👑 ⟨${escH(own.gn)}⟩</b>` : L('— ยังไม่มี —', '— nobody —')}</small></div></div>
    ${live ? `<div class="sec">${L('คะแนนดาเมจต่อผลึก (สด)', 'Damage on the crystal (live)')}</div><div class="list">${rows.map(([g, r], i) => `<div class="item"><b class="sgrk">${i + 1}</b><div class="nm"><b>⟨${escH(r.gn)}⟩</b><small>${fmtN(r.d)}</small></div></div>`).join('') || `<p class="hint">${L('ยังไม่มีใครโจมตีผลึก', 'Nobody has hit the crystal yet')}</p>`}</div>
      ${MAP_ID !== SIEGE_MAP ? `<button class="btn gold wide" data-sggo="1">${L('ไปสนามรบ (ปราสาทหินขอม)', 'Go to the battlefield')}</button>` : ''}` : ''}
    <div class="sec">${L('กติกา', 'Rules')}</div>
    <p class="hint">${L('ทุกเสาร์–อาทิตย์ 20:00–20:30 (เวลาไทย) ผลึกจักรพรรดิปรากฏกลางปราสาทหินขอมโบราณ มีผู้พิทักษ์ (หัวหน้าฝูง) เกิดทุก 1 นาที · กิลด์ที่ทำลายผลึกได้ยึดปราสาท ผลึกจะฟื้นใน 10 วินาทีให้กิลด์อื่นแย่งต่อ · ใครครองตอน 20:30 ได้ครองทั้งสัปดาห์', 'Every Saturday and Sunday 20:00–20:30 (Thai time) the Crown Crystal rises in the Khmer Sanctuary, guarded by alphas that spawn every minute · the guild that breaks it takes the castle; it reforms in 10 seconds for the others to take back · whoever holds it at 20:30 keeps it for the week')}</p>
    <div class="sec">${L('สิทธิ์ของผู้ครองปราสาท', 'Castle rewards')}</div>
    <p class="hint">${L('มงกุฎทองเหนือชื่อและออร่าทองใต้เท้าสมาชิกทุกคน (ผู้เล่นอื่นเห็น) · บรรณาการรายวัน 10 เหรียญวายรา + 20,000 เบี้ย', 'A golden crown over the name and a gold aura for every member (others see it) · daily tribute: 10 Vayra Coins + 20,000 Bia')}</p>
    ${siegeOwnerMe() ? `<button class="btn gold wide" data-sgtrib="1" ${tribute ? '' : 'disabled'}>${tribute ? L('รับบรรณาการวันนี้', "Collect today's tribute") : L('รับบรรณาการวันนี้แล้ว', 'Tribute collected today')}</button>` : ''}
    <button class="btn wide" data-sgprac="1">${L('ฝึกซ้อม: เรียกผลึกฝึก (3 นาที)', 'Practice: raise a training crystal (3 min)')}</button>
    ${S.guild ? '' : `<p class="hint">${L('ยังไม่มีกิลด์: ตั้งหรือเข้ากิลด์ก่อน (G) จึงจะยึดปราสาทได้', 'No guild yet: found or join one (G) to take the castle')}</p>`}`;
};
EV.on('tick', () => { if (siegeLive() && winOpen('siege')){ SG.rw = (SG.rw || 0) + 1; if (SG.rw % 60 === 0) reWin('siege'); } });
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-sggo],[data-sgtrib],[data-sgprac]'); if (!b || b.disabled) return; const d = b.dataset;
  if (d.sggo){ if (P.dead) return; warpTo(SIEGE_MAP); closeWin('siege'); }
  else if (d.sgtrib){ if (!siegeOwnerMe() || S.sgDay === dayKey()) return; S.sgDay = dayKey(); S.bia += 20000; coinAdd(10, L('บรรณาการปราสาท', 'Castle tribute')); SFX.play('coin'); save(); reWin('siege'); }
  else if (d.sgprac){ closeWin('siege'); siegePractice(); }
});
addTownNpc({id:'general', name:'แม่ทัพไชยันต์', en:'General Chaiyan', role:'สงครามปราสาท', roleEn:'Castle Siege', x:560, y:960},
  {job:'warlord', look:{sex:'m', hair:1, color:''}, gear:{armor:'c_dragon', head:'hc_mala'}});
NPC_OPEN.general = n => npcFrame(n, siegeLive() ? L('ศึกเริ่มแล้ว! รีบไปปราสาทหินขอม ทำลายผลึกให้ได้!', 'The war is on! To the Khmer castle, break that crystal!')
  : siegeOwnerMe() ? L('ท่านคือเจ้าปราสาท! รับบรรณาการประจำวันได้ที่ข้า', 'Hail, lord of the castle! Your daily tribute awaits.') : L('ทุกเสาร์–อาทิตย์สองทุ่ม กิลด์ทั้งหลายจะแย่งชิงปราสาทหินขอม อยากฝึกก่อนไหม?', 'Every Saturday and Sunday at 8 pm the guilds fight for the Khmer castle. Care to train first?'),
  `<button class="btn gold wide" data-win-open="siege">${L('เปิดหน้าสงครามปราสาท', 'Open Castle Siege')}</button><button class="btn wide" data-sgprac="1">${L('ฝึกซ้อมตอนนี้', 'Train now')}</button>`);
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'siege', t:['สงครามปราสาท (กิลด์วอร์)', 'Castle Siege (guild war)'], b:() => `<p>${L('ทุกเสาร์–อาทิตย์ 20:00–20:30 (เวลาไทย) ที่ปราสาทหินขอมโบราณ · โจมตีผลึกจักรพรรดิ คะแนนดาเมจของแต่ละกิลด์ขึ้นสด · กิลด์ที่ทำลายผลึกได้ยึดปราสาท และใครครองตอนจบได้ครองทั้งสัปดาห์ · ผู้ครอง: มงกุฎ ออร่าทอง และบรรณาการรายวัน · คุยกับแม่ทัพไชยันต์ในอาเรนเพื่อดูตาราง เข้าสนามรบ หรือฝึกซ้อมได้ทุกเวลา', 'Every Saturday and Sunday 20:00–20:30 (Thai time) at the Ancient Khmer Sanctuary · hit the Crown Crystal, each guild\'s damage shows live · the guild that breaks it takes the castle, and whoever holds it at the end keeps it for the week · holders get a crown, a gold aura and a daily tribute · General Chaiyan in Aren shows the schedule, sends you to the battle, and runs practice any time')}</p>`});
