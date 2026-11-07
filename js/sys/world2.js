/* VAYRATHEN — js/sys/world2.js — a living world, part 2
   · Weather on real time (changes every 15 minutes, the same for everyone on a map): clear · rain · storm · fog.
       rain: fire skills −20%, water +15% · storm: heavy rain, wind/lightning +20%, lightning strikes (a red circle first)
       fog: monsters (and bosses) notice you from 40% less far, the edges of the screen fade into mist.
       Deserts, volcanoes and snowfields get haze instead of rain; caves have no weather.
   · Alpha monsters (หัวหน้าฝูง): ~4% of spawns — bigger, golden, ×4 HP, hit ×1.5, two skills, rally their pack.
       Worth ×3 EXP and often a piece of gear.
   · Ecosystem: hunters chase prey (tiger → deer, jackal → hare …) and may catch it; day creatures sleep at night
       (you can sneak past: they wake when you come close or hit them).
   · NPCs speak up as you pass: the time of day, the weather, how you look, and what you did lately
       (the boss you beat, the alpha you felled, your last fall).
   · Boss reward for ferocity: extra EXP, an extra gear roll with better odds, more for killing it mid-rampage.
   · "Status Resist" random option on armour, headgear and accessories.
   · First-time tips for every new danger (poison, silence, a boss's fury, an alpha, a storm …).
   · Network: alpha / boss-fury state rides along in the shared monster snapshot. */
'use strict';

const H1w = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const onScr = (o, m = 40) => o.x > cam.x - m && o.x < cam.x + VW + m && o.y > cam.y - m && o.y < cam.y + VH + m;
const isSlave = () => typeof nmSlave === 'function' && nmSlave();

/* ================= weather ================= */
const WXS = {cur:'clear', k:0, seg:-1, map:-1, strikeT:8, flash:0, bolts:[], drops:[]};
const WX_TH = {clear:['', ''], rain:['ฝน', 'Rain'], storm:['พายุ', 'Storm'], fog:['หมอก', 'Fog'], haze:['ฝุ่น', 'Haze']};
function wxBiome(){ return MAP_ID ? MAPS[MAP_ID].biome : 'fields'; }
function wxRoll(){
  const B = MAP_ID ? BIOME[wxBiome()] : null;
  if (B && B.fx === 'dark') return 'clear';
  const seg = Math.floor(Date.now() / 9e5), u = H1w(seg * 31.7 + MAP_ID * 7.3);
  const dry = /desert|canyon|lava|crater|ash|dryplain/.test(wxBiome()), cold = B && (B.fx === 'snow' || (B.floor && B.floor.kind === 'ice'));
  if (u < .5) return 'clear';
  if (dry || cold) return u < .78 ? 'haze' : 'clear';
  return u < .72 ? 'rain' : u < .86 ? 'fog' : 'storm';
}
const wxNow = () => (WXS.k > .3 ? WXS.cur : 'clear');
const wxLabel = () => (WXS.cur !== 'clear' && WXS.k > .3 ? ` · ${L(...WX_TH[WXS.cur])}` : '');
const wxSight = () => (WXS.k > .3 && (WXS.cur === 'fog' || WXS.cur === 'haze') ? .6 : 1);
function wxDmgMul(elem){ const w = wxNow(); if (w === 'rain' || w === 'storm'){ if (elem === 'fire') return .8; if (elem === 'water') return 1.15; if (w === 'storm' && elem === 'wind') return 1.2; } return 1; }
{
  HK.outMul.push((mult, elem) => mult * wxDmgMul(elem));
}
EV.on('tick', dt => {
  if (WXS.map !== MAP_ID){ WXS.map = MAP_ID; WXS.cur = wxRoll(); WXS.k = WXS.cur === 'clear' ? 0 : 1; WXS.seg = Math.floor(Date.now() / 9e5); }
  const seg = Math.floor(Date.now() / 9e5); if (seg !== WXS.seg){ WXS.seg = seg; WXS.next = wxRoll(); }
  if (WXS.next && WXS.next !== WXS.cur){ WXS.k -= dt / 4; if (WXS.k <= 0){ WXS.cur = WXS.next; WXS.next = null; WXS.k = 0; if (WXS.cur !== 'clear') tip('wx_' + WXS.cur); } }
  else if (WXS.cur !== 'clear') WXS.k = Math.min(1, WXS.k + dt / 4);
  if (WXS.flash > 0) WXS.flash -= dt;
  // storm: lightning, telegraphed by a red circle
  if (wxNow() === 'storm' && !P.dead && !inVillage(P)){ WXS.strikeT -= dt; if (WXS.strikeT <= 0){ WXS.strikeT = rand(5, 12);
    const x = P.x + rand(-180, 180), y = P.y + rand(-110, 110); VFX.play('warnCircle', {x, y, r:40, t:.9});
    later(.9, () => { WXS.flash = .25; VFX.play('thunder', {x, y, r:40}); VFX.shake(4); if (typeof AMB !== 'undefined') AMB.thunder(); else SFX.play('boom');
      for (const m of mobs) if (!m.dead && Math.hypot(m.x - x, m.y - y) < 40 + m.def.r){ const dmg = Math.max(1, Math.round(m.maxhp * .06)); m.hp -= dmg; m.flash = .2; addText(m.x, m.y - MOB_H[m.type] - 6, String(dmg), '#bfe0ff', 13); if (m.hp <= 0 && !isSlave()) killMob(m); }
      if (Math.hypot(P.x - x, (P.y - y) * 1.6) < 40 && !P.roll && !P.dead){ const dmg = Math.max(1, Math.round(DER.maxhp * .06)); S.hp -= dmg; addText(P.x, P.y - 48, String(dmg), '#bfe0ff'); P.stunT = Math.max(P.stunT || 0, .35); P.cast = null; if (S.hp <= 0) playerDie(); } }); } }
});
EV.on('draw', () => {
  const w = WXS.cur, k = WXS.k; if (w === 'clear' || k <= 0) return;
  const Lq = Math.max(0, (typeof GFX !== 'undefined' ? GFX.fx : 1) - (typeof PERF !== 'undefined' && PERF.fps < 28 && PERF.fps > 0 ? 1 : 0));
  ctx.save();
  if (w === 'rain' || w === 'storm'){
    ctx.fillStyle = `rgba(20,30,50,${(w === 'storm' ? .22 : .12) * k})`; ctx.fillRect(0, 0, SW, SH);
    const n = Math.round((w === 'storm' ? 220 : 130) * k * (Lq ? (Lq > 1 ? 1 : .7) : .35)), sl = w === 'storm' ? .35 : .18, len = (w === 'storm' ? 26 : 18) * Math.min(2, PX / 2 + .4);
    ctx.strokeStyle = `rgba(200,220,255,${.42 * k})`; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < n; i++){ const sp = 900 + H1w(i) * 500, x = (H1w(i + .3) * (SW + 200) + T * sp * sl) % (SW + 200) - 100, y = (H1w(i + .7) * (SH + 100) + T * sp) % (SH + 100) - 50; ctx.moveTo(x, y); ctx.lineTo(x - len * sl, y - len); }
    ctx.stroke();
    // splashes on the ground
    ctx.fillStyle = `rgba(220,235,255,${.5 * k})`;
    for (let i = 0; i < n * .25; i++){ const ph = (((T * 2 + H1w(i + 9)) % 1) + 1) % 1, x = H1w(i * 3.1 + Math.floor(T * 2 + H1w(i + 9))) * SW, y = H1w(i * 5.7 + Math.floor(T * 2 + H1w(i + 9))) * SH; if (ph > .3 || ph < 0) continue; ctx.globalAlpha = (1 - ph / .3) * k; ctx.beginPath(); ctx.ellipse(x, y, 2 + ph * 10, (2 + ph * 10) * .35, 0, 0, 7); ctx.strokeStyle = 'rgba(220,235,255,.6)'; ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  if (w === 'fog' || w === 'haze'){
    const col = w === 'haze' ? '214,190,150' : '226,232,238', px = sx(P.x), py = sy(P.y - 20), R0 = Math.min(SW, SH) * .22, R1 = Math.max(SW, SH) * .62;
    const g = ctx.createRadialGradient(px, py, R0, px, py, R1); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${.62 * k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
    ctx.fillStyle = `rgba(${col},${.1 * k})`; ctx.fillRect(0, 0, SW, SH);
    if (Lq) for (let i = 0; i < 5; i++){ const x = ((H1w(i) * SW + T * (12 + i * 4)) % (SW + 400)) - 200, y = H1w(i + 2) * SH; const gg = ctx.createRadialGradient(x, y, 0, x, y, 220); gg.addColorStop(0, `rgba(${col},${.16 * k})`); gg.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gg; ctx.fillRect(x - 220, y - 220, 440, 440); }
  }
  if (false && WXS.flash > 0){ ctx.fillStyle = `rgba(235,240,255,${WXS.flash * 2})`; ctx.fillRect(0, 0, SW, SH); }
  ctx.restore();
});

/* ================= alpha monsters ================= */
const ELITE_SK = {fire:['field', 'barrage'], water:['wave', 'slam'], wind:['barrage', 'wave'], earth:['slam', 'wave'], holy:['wave', 'barrage'], shadow:['field', 'slam'], neutral:['slam', 'barrage']};
function makeElite(m){
  if (m.elite) return; m.elite = true; const f = m.maxhp ? m.hp / m.maxhp : 1; m.maxhp = Math.round(m.maxhp * 4); m.hp = Math.max(1, Math.round(m.maxhp * f));
  m.eSk = (ELITE_SK[m.def.elem] || ELITE_SK.neutral).concat('rally'); m.eCd = 3;
}
function eliteAura(g, m, x, y){
  const r = m.def.r * 2 + Math.sin(T * 5 + m.id) * 2, gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(255,200,80,${m.rallyT > 0 ? .5 : .32})`); gr.addColorStop(1, 'rgba(255,170,40,0)');
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * .42, 0, 0, 7); g.fill();
  g.strokeStyle = `rgba(255,215,110,${.5 + Math.sin(T * 3) * .2})`; g.lineWidth = 1; g.setLineDash([3, 3]); g.lineDashOffset = -T * 8; g.beginPath(); g.ellipse(x, y, m.def.r * 1.4, m.def.r * .55, 0, 0, 7); g.stroke(); g.restore();
}
{
  HK.spawn.push((m, opt) => { if (!m.def.boss && !opt.minion && !isSlave() && !(typeof DG !== 'undefined' && DG.active) && MAP_ID > 0 && Math.random() < .04) makeElite(m); });
  HK.atkMul.push((m, mult) => (m.elite ? mult * 1.5 * (m.rallyT > 0 ? 1.15 : 1) : mult));
}
function eliteCast(m){
  const id = m.eSk[Math.floor(Math.random() * m.eSk.length)];
  if (id === 'rally'){ m.rallyT = 7; m.atkT = 0; m.lunge = .3; addText(m.x, m.y - MOB_H[m.type] * 1.3 - 26, L('ปลุกฝูง!', 'Rally!'), '#ffc870', 15); VFX.play('roar', {x:m.x, y:m.y, r:120}); SFX.play('roar');
    for (const o of mobs) if (!o.dead && o !== m && o.type === m.type && dist(o, m) < 240){ o.aggro = true; o.rallyT = 7; o.enraged = true; }
    if (typeof emote === 'function') emote(m, 'anger'); return 1; }
  return bossCast(m, id) || 1;
}

/* ================= monster brain additions: alpha skills, hunting, sleeping ================= */
const PRED = /tiger|leopard|jackal|wolf|cobra|viper|monitor|croc|bear|saming|python|vulture|crow|eagle|hawk|scorpion/;
const PREY = /hare|deer|serow|fowl|squirrel|frog|rat|gecko|shrimp|crab|egret|grub|monkey|buffalo|banteng|kaipa|kobna|goldfrog/;
{
  HK.mobPre.push((m, dt) => {
    const d = m.def;
    if (m.rallyT > 0){ m.rallyT -= dt; if (m.rallyT <= 0 && !(m.fz && m.fz.berserk > 0)) m.enraged = false; }
    // alpha: casts while fighting
    if (m.elite){
      if (m.eBusy > 0){ m.eBusy -= dt; m.atkT += dt; m.moving = false; return true; }
      if (m.aggro && !P.dead && (m.eCd -= dt) <= 0 && dist(m, P) < 300){ m.eCd = rand(6, 9); m.eBusy = eliteCast(m); if (!m._eSeen){ m._eSeen = true; tip('elite'); } return true; }
      if (m.aggro && !m._ePack){ m._ePack = true; for (const o of mobs) if (!o.dead && o !== m && o.type === m.type && dist(o, m) < 220) o.aggro = true; }
      if (!m.aggro) m._ePack = false;
    }
    if (!d.boss && !m.aggro && !isSlave()){
      // hunting: chase the prey, catch it
      const h = m.hunt;
      if (h){ if (h.dead || dist(m, h) > 420 || (m.huntT -= dt) <= 0){ m.hunt = null; if (h && !h.dead) h.preyOf = null; }
        else { moveTo(m, h.x, h.y, d.speed * 1.7, dt); m.moving = true; m.dir = SPR.dirFromVec(h.x - m.x, h.y - m.y); pushOut(m, d.r * .6);
          if (dist(m, h) < d.r + h.def.r + 4){ m.atkT = 0; m.lunge = .3; VFX.play('clawHit', {x:h.x, y:h.y - MOB_H[h.type] * .5}); h.dead = true; h.deadT = 0; h.vanish = true; if (P.target === h) P.target = null;
            m.hunt = null; m.huntCd = 45; m.restT = 6; if (typeof emote === 'function') emote(m, 'music'); if (onScr(m)) tip('hunt'); }
          return true; } }
      if (h === undefined || !h){ if (m.restT > 0){ m.restT -= dt; m.moving = false; return true; } }
      // prey runs from its hunter
      if (m.preyOf && !m.preyOf.dead && m.preyOf.hunt === m){ const p = m.preyOf, dx = m.x - p.x, dy = m.y - p.y, l = Math.hypot(dx, dy) || 1;
        moveTo(m, m.x + dx / l * 40, m.y + dy / l * 40, d.speed * 1.15, dt); m.moving = true; m.dir = SPR.dirFromVec(dx, dy); pushOut(m, d.r * .6); return true; }
      // day creatures sleep at night (you can sneak by)
      if (isNight() && !d.night && !m.elite && !m.hitT0 && dist(m, P) > 70){ m.moving = false; m.sleeping = true; m.atkT += dt; return true; }
      if (m.sleeping){ m.sleeping = false; if (typeof emote === 'function') emote(m, 'alert'); }
    }
  });
  // being hit wakes it (and ends any hunt)
  HK.dmgGuard.push(m => { if (m && !m.pvp && m.def){ m.hitT0 = 1; m.hunt = null; if (m.preyOf) m.preyOf = null; } });
}
// start hunts now and then (host only, near the player so it is seen)
let ecoT = 0;
EV.on('tick', dt => {
  if (isSlave() || (ecoT -= dt) > 0) return; ecoT = 1;
  for (const m of mobs){
    if (m.dead || m.aggro || m.hunt || m.def.boss || m.elite || (m.huntCd = (m.huntCd ?? 10) - 1) > 0 || !PRED.test(m.type) || dist(m, P) > 650) continue;
    if (isNight() && !m.def.night) continue;
    const prey = mobs.find(o => !o.dead && !o.aggro && o !== m && !o.preyOf && PREY.test(o.type) && dist(o, m) < 240 && o.def.lvl <= m.def.lvl + 8);
    if (prey){ m.hunt = prey; m.huntT = 8; prey.preyOf = m; if (typeof emote === 'function'){ emote(m, 'alert'); } m.huntCd = 30; }
    else m.huntCd = 6;
  }
});

/* ================= rewards ================= */
RAR_ODDS.fury = [.15, .4, .3, .15]; RAR_ODDS.rampage = [0, .3, .45, .25];
EV.on('kill', m => {
  if (!m || !m.def) return; const d = m.def;
  if (m.elite){ gainExp(Math.round(d.exp * RATE * 2), Math.round(d.jexp * JRATE * 2)); if (typeof sysMsg === 'function') sysMsg(L('ล้มหัวหน้าฝูง! EXP ×3', 'Alpha down! EXP ×3'), 'exp');
    if (Math.random() < .5){ const g0 = gearDrop(m), g = g0 && rollGear(g0, 'boss', m.x, m.y - MOB_H[m.type]); if (g) dropLoot(g, m.x + rand(-10, 10), m.y + rand(-6, 6)); }
    NPCMEM('elite', nm(d)); }
  if (d.boss && !d.wb && m.fz){
    const rp = m.fz.berserk > 0, n = m.fz.rampages || 0, bonus = Math.round(d.exp * RATE * (.7 + n * .15) * (rp ? 1.3 : 1));
    gainExp(bonus, Math.round(d.jexp * JRATE * (.7 + n * .15)));
    for (let i = 0; i < (rp ? 2 : 1); i++){ const g0 = gearDrop(m), g = g0 && rollGear(g0, rp ? 'rampage' : 'fury', m.x, m.y - MOB_H[m.type]); if (g) dropLoot(g, m.x + rand(-16, 16), m.y + rand(-8, 8)); }
    if (rp && d.card && Math.random() < (d.cardRate || 0) * 2){ S.cards[d.card] = (S.cards[d.card] || 0) + 1; if (typeof cardPop === 'function') cardPop(d.card); }
    banner(L(`โบนัสความโหด · EXP +${bonus.toLocaleString()}${rp ? ' · ปราบขณะอาละวาด!' : ''}`, `Ferocity bonus · EXP +${bonus.toLocaleString()}${rp ? ' · slain mid-rampage!' : ''}`));
    NPCMEM('boss', nm(d));
  }
});
EV.on('tick', () => { for (const m of mobs){ const F = m.fz; if (!F || m.dead) continue; if (F.berserk > 0 && !m._rpc){ m._rpc = true; F.rampages = (F.rampages || 0) + 1; tip('rampage'); if (typeof AMB !== 'undefined') AMB.roar(m); } if (!(F.berserk > 0)) m._rpc = false;
  if (F.phase >= 2 && !m._tp2){ m._tp2 = true; tip('bossPhase'); } if (F.phase !== m._rph){ if (m._rph && typeof AMB !== 'undefined') AMB.roar(m); m._rph = F.phase; }
  if (F.act && F.act.id !== m._lact){ m._lact = F.act.id; if (F.act.id === 'burrow' || F.act.id === 'soar') tip('burrow'); if (F.act.id === 'breath' || F.act.id === 'miasma') tip('breath'); } if (!F.act) m._lact = null;
  if (m.aggro && !m._agr){ m._agr = true; if (typeof AMB !== 'undefined') AMB.roar(m); } if (!m.aggro) m._agr = false; } });

/* ================= status resist option ================= */
if (typeof AFFIX !== 'undefined') AFFIX.push(['resPct', [0, 2, 2, 2], L => .03 + Math.min(.05, L / 2500)]);
{
  const _gst = gearStatText;
  gearStatText = function(st){ const t = _gst(st); return st && st.resPct ? (t ? t + ' · ' : '') + `Status Resist +${Math.round(st.resPct * 100)}%` : t; };
}

/* ================= network: alpha / fury state in the monster snapshot ================= */
function mobEx(m){
  const F = m.fz; if (!m.elite && !F) return '';
  const a = F && F.act;
  return [m.elite ? 1 : 0, F ? F.phase : 0, F && F.berserk > 0 ? 1 : 0, F && F.hidden ? 1 : 0, F ? Math.round(F.z || 0) : 0, a ? a.id : '', a && a.ang != null ? Math.round(a.ang * 100) : '', a && a.wind != null && a.t < a.wind ? 1 : 0].join(':');
}
function mobExApply(m, s){
  if (!s) return; const e = s.split(':'); if (e.length < 5) return;
  if (e[0] === '1' && !m.elite) makeElite(m);
  if (m.def.boss && typeof furyOf === 'function'){ const F = furyOf(m); const ph = clamp(+e[1] || 1, 1, 4);
    F.phase = ph; F.berserk = e[2] === '1' ? 1 : 0; F.hidden = e[3] === '1'; F.z = clamp(+e[4] || 0, 0, 200); F.remote = true;
    const id = (e[5] || '').replace(/[^a-z]/g, '').slice(0, 10);
    if (id){ if (!F.act || F.act.id !== id) F.act = {id, t:0, dur:99, remote:true, wind:.75, len:190, half:.6, r:120};
      if (e[6] !== '') F.act.ang = (+e[6] || 0) / 100; F.act.t = e[7] === '1' ? 0 : 1; }
    else if (F.act && F.act.remote) F.act = null; }
}

/* ================= NPCs talk ================= */
function NPCMEM(k, v){ S.mem = S.mem || {}; S.mem[k] = {v, t:Date.now()}; }
EV.on('level', () => NPCMEM('lvl', S.lvl)); EV.on('job', () => NPCMEM('job', nm(JOBS[S.job])));
HK.diePre.push(() => NPCMEM('death', MAP_ID ? nm(MAPS[MAP_ID]) : ''));
const NPCT = {who:null, s:'', end:0, cd:{}};
const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 2 ? L('เมื่อกี้', 'just now') : m < 60 ? L(`${m} นาทีก่อน`, `${m} minutes ago`) : m < 1440 ? L(`${Math.round(m / 60)} ชั่วโมงก่อน`, `${Math.round(m / 60)} hours ago`) : L('เมื่อวันก่อน', 'the other day'); };
function npcLine(n){
  const h = thHour(), M = S.mem || {}, out = [], recent = k => M[k] && Date.now() - M[k].t < 6 * 3600e3;
  if (h >= 22 || h < 5) out.push(L('หาว… ดึกแล้วนะ ระวังผีโคมลอยล่ะ', 'Yawn… it is late, watch out for lantern ghosts'));
  else if (h < 10) out.push(L('อรุณสวัสดิ์ วันนี้อากาศดีนะ', 'Good morning! Lovely day'), L('ร้านเพิ่งเปิดเลย', 'Just opened up for the day'));
  else if (h >= 17) out.push(L('เย็นแล้ว จุดตะเกียงกันเถอะ', 'Evening already, time to light the lamps'));
  const w = wxNow(); if (w === 'rain') out.push(L('ฝนตกแบบนี้ เวทไฟอ่อนลงนะ ใช้น้ำดีกว่า', 'In rain like this fire spells weaken, water is better'));
  if (w === 'storm') out.push(L('ฟ้าผ่าแรง ระวังวงแดงบนพื้นนะ', 'The lightning is fierce, mind the red circles'));
  if (w === 'fog' || w === 'haze') out.push(L('หมอกหนา มอนมองไม่ค่อยเห็นเจ้าหรอก', 'Thick fog, the monsters can hardly see you'));
  if (S.hp < DER.maxhp * .4) out.push(L('แผลเต็มตัวเลย ดื่มยาก่อนเถอะ', 'You are covered in wounds, drink a potion'));
  if (typeof afDot === 'function' && afDot()) out.push(L('หน้าเขียวเชียว ไปซื้อยาเขียวที่ป้าบัวคำนะ', 'You look green, get a Green Potion from Auntie Buakham'));
  if (recent('boss')) out.push(L(`ได้ข่าวว่าเจ้าล้ม${M.boss.v}ได้ ${ago(M.boss.t)} เก่งมาก!`, `I heard you felled ${M.boss.v} ${ago(M.boss.t)}. Well done!`));
  if (recent('elite')) out.push(L(`ล้มหัวหน้าฝูง${M.elite.v}ได้ด้วยรึ ฝีมือไม่เบา`, `You brought down an alpha ${M.elite.v}? Not bad at all`));
  if (recent('death')) out.push(L(`เห็นว่าเจ้าล้มที่${M.death.v || 'ทุ่ง'} ${ago(M.death.t)} พักให้หายก่อนนะ`, `They say you fell at ${M.death.v || 'the fields'} ${ago(M.death.t)}. Rest up first`));
  if (recent('lvl')) out.push(L(`ถึงเลเวล ${M.lvl.v} แล้วรึ โตเร็วจริง`, `Level ${M.lvl.v} already? You grow fast`));
  if (recent('job')) out.push(L(`ชุด${M.job.v}เข้ากับเจ้านะ`, `The ${M.job.v} look suits you`));
  return out[Math.floor(Math.random() * out.length)] || '';
}
EV.on('tick', () => {
  if (T < NPCT.end || P.dead) return;
  for (const n of NPCS){ if (dist(n, P) > 110 || T < (NPCT.cd[n.id] || 0)) continue; const s = npcLine(n); NPCT.cd[n.id] = T + 45; if (!s) continue; NPCT.who = n; NPCT.s = s; NPCT.end = T + 4.5; break; }
});
EV.on('draw', () => {
  const n = NPCT.who; if (!n || T > NPCT.end || !NPCS.includes(n)) return; const x = sx(n.x), y = sy(n.y - 56);
  ctx.save(); ctx.globalAlpha = Math.min(1, (NPCT.end - T) / .4, (T - NPCT.end + 4.5) / .2); nameTag(x, y, NPCT.s, '#3a2410', 'rgba(255,248,230,.95)'); ctx.restore();
});

/* ================= first-time tips ================= */
const TIPS = {
  poison:['ติดพิษ/ไฟ/เลือดไหล!', 'Damage over time!', 'ยังร่ายเวทได้ แต่อาจโดนขัดการร่าย (ค่าต้านทานการร่ายช่วยได้) · ดื่มยาเขียว (ร้านยา) หรือรอให้หมด · กลิ้งเพื่อดับไฟ', 'You can still cast, but ticks may break a cast (Cast Resistance helps) · drink a Green Potion (potion seller) or wait it out · roll to put out fire'],
  silence:['ติดใบ้!', 'Silenced!', 'ใช้สกิลไม่ได้ชั่วคราว ตีปกติยังได้ · ยาเขียวแก้ได้', 'No skills for a while, basic attacks still work · a Green Potion cures it'],
  bossPhase:['บอสเข้าระยะใหม่!', 'The boss changed phase!', 'ทุกระยะบอสจะแรงขึ้นและมีท่าใหม่ · ดูวงสีแดงบนพื้นแล้วกด "กลิ้ง" หลบ', 'Each phase it hits harder and learns new moves · watch for red circles and Dodge-roll out'],
  rampage:['บอสอาละวาด!', 'Rampage!', 'แถบความคลั่งเต็ม 7 วิต่อจากนี้บอสเร็วและแรงมาก · ถอยห่างหรือป้องกันไว้ · ฆ่าตอนอาละวาดได้รางวัลพิเศษ', 'For 7 seconds it is very fast and strong · back off or guard · slaying it now pays extra'],
  burrow:['บอสหายไป!', 'It vanished!', 'บอสมุดดินหรือบินขึ้นฟ้า ตีไม่เข้า · เมื่อวงแดงขึ้นใต้เท้า รีบกลิ้งออก', 'It dug under or took to the sky and cannot be hit · when a red circle appears under you, roll away'],
  breath:['ระวังกรวยพ่น!', 'Breath attack!', 'อยู่นอกกรวยสีแดง หรือออกจากหมอกพิษให้เร็ว · ติดสถานะตามธาตุของบอส', 'Stay out of the red cone or the poison cloud · it carries the boss\'s element'],
  elite:['หัวหน้าฝูง!', 'An alpha!', 'มอนตัวใหญ่สีทอง HP ×4 ใช้สกิลและปลุกฝูงได้ · ฆ่าได้ EXP ×3 และมีโอกาสได้อุปกรณ์', 'A big golden monster with ×4 HP, skills and a pack call · worth ×3 EXP and often gear'],
  hunt:['ห่วงโซ่อาหาร', 'The food chain', 'สัตว์นักล่าไล่จับเหยื่อได้เอง · กลางคืนสัตว์กลางวันจะหลับ เดินผ่านเงียบๆ ได้', 'Hunters chase and catch prey on their own · at night day creatures sleep, you can sneak by'],
  wx_rain:['ฝนตก', 'Rain', 'เวทไฟอ่อนลง 20% · เวทน้ำแรงขึ้น 15%', 'Fire −20% · water +15%'],
  wx_storm:['พายุฝน', 'Storm', 'ฟ้าผ่าลงเป็นระยะ (วงแดงก่อน) · ลม/สายฟ้าแรงขึ้น 20% · ไฟอ่อนลง', 'Lightning strikes (red circle first) · wind +20% · fire weaker'],
  wx_fog:['หมอกลง', 'Fog', 'มอนและบอสมองเห็นเจ้าได้ใกล้ลง 40% · ใช้แอบผ่านได้', 'Monsters and bosses notice you 40% closer · good for sneaking'],
  wx_haze:['ฝุ่นหมอก', 'Haze', 'มองเห็นได้ใกล้ลงทั้งเจ้าและมอน', 'Everyone sees less far'],
  resist:['ต้านทานสถานะ', 'Status Resist', 'ออปชัน "ต้านทานสถานะ" บนอุปกรณ์ช่วยกันพิษ ไฟ ใบ้ ฯลฯ (รวมสูงสุด 60%)', 'The "Status Resist" option on gear blocks poison, burns, silence… (up to 60% in total)']};
function tip(id){
  if (!S || !TIPS[id]) return; S.tips = S.tips || {}; if (S.tips[id]) return;
  if (typeof tutOn === 'function' && tutOn()) return;
  S.tips[id] = 1; dirty = true; const t = TIPS[id];
  let c = el('tipCard'); if (!c){ c = document.createElement('div'); c.id = 'tipCard'; c.className = 'tipcard'; el('ui').appendChild(c); }
  c.innerHTML = `<i class="tipic"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 2.5a5 5 0 0 1 3 9v2.5H7V11.5a5 5 0 0 1 3-9zM8 16.5h4M8.5 18.5h3"/></svg></i><div><b>${L(t[0], t[1])}</b><small>${L(t[2], t[3])}</small></div><button class="ibtn" data-tipx="1" aria-label="${L('ปิด', 'Close')}">✕</button>`;
  c.classList.remove('show'); void c.offsetWidth; c.classList.add('show'); clearTimeout(c._t); c._t = setTimeout(() => c.classList.remove('show'), 11000);
  SFX.play('tut');
}
document.addEventListener('click', e => { if (e.target.closest('[data-tipx]')){ const c = el('tipCard'); if (c) c.classList.remove('show'); } });
EV.on('tick', () => { if (typeof afHas !== 'function' || !P.af) return; if (afDot()) tip('poison'); if (afHas('silence')) tip('silence'); });
EV.on('pickup', id => { if (ITEMS[id] && ITEMS[id].opts && ITEMS[id].opts.some(o => o[0] === 'resPct')) tip('resist'); });

WIKI_SYS.push({id:'world2', t:['โลกมีชีวิต', 'A living world'], b:() => `<p>${L('<b>สภาพอากาศ</b> เปลี่ยนตามเวลาจริงเป็นระยะ (ทุกคนในแผนที่เห็นเหมือนกัน): ฝน = ไฟอ่อนลง น้ำแรงขึ้น · พายุ = ฟ้าผ่า (วงแดงก่อน) ลมแรงขึ้น · หมอก = มอนมองเห็นได้ใกล้ลง · ทะเลทราย/ภูเขาไฟ/หิมะเป็นฝุ่นหมอกแทนฝน · ในถ้ำไม่มีอากาศ', '<b>Weather</b> changes every so often in real time (the same for everyone on the map): rain = fire weaker, water stronger · storm = lightning (red circle first), wind stronger · fog = monsters notice you only up close · deserts, volcanoes and snow get haze · caves have none')}</p>
  <p>${L('<b>หัวหน้าฝูง</b> (★ สีทอง) เกิดนาน ๆ ครั้ง ตัวใหญ่ เลือดหนา ตีแรง มีสกิล 2 อย่าง + ปลุกฝูง · ฆ่าได้ EXP มากกว่าปกติและมีลุ้นได้อุปกรณ์', '<b>Alphas</b> (golden ★) turn up now and then: bigger, tougher, harder-hitting, with two skills and a pack call · more EXP and a good chance of gear')}</p>
  <p>${L('<b>ห่วงโซ่อาหาร</b>: นักล่า (เสือ หมาจิ้งจอก งู เหี้ย…) ไล่จับเหยื่อ (กระต่าย กวาง ไก่ป่า กบ…) · กลางคืนสัตว์กลางวันหลับ แอบผ่านได้ถ้าไม่เข้าใกล้เกินไป', '<b>Food chain</b>: hunters (tigers, jackals, snakes, monitors…) chase prey (hares, deer, fowl, frogs…) · at night day creatures sleep, you can pass if you keep your distance')}</p>
  <p>${L('<b>รางวัลความโหดของบอส</b>: EXP โบนัส (ยิ่งรอดการอาละวาดมาได้ยิ่งเยอะ) และดรอปอุปกรณ์เพิ่มที่หายากขึ้น · ฆ่าตอนอาละวาด: รางวัลมากขึ้นอีก อุปกรณ์เพิ่มอีกชิ้น และลุ้นการ์ด', '<b>Boss ferocity reward</b>: bonus EXP (more for every rampage survived) and an extra, rarer gear drop · slain mid-rampage: even more, a second extra piece and a card chance')}</p>
  <p>${L('NPC ทักเจ้าตามเวลา อากาศ สภาพร่างกาย และเรื่องที่เจ้าทำล่าสุด · ออปชันสุ่ม "ต้านทานสถานะ" บนอุปกรณ์', 'NPCs greet you by the time, the weather, how you look and what you did lately · random option "Status Resist" on gear')}</p>`});
