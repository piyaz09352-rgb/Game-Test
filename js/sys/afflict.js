/* VAYRATHEN — js/sys/afflict.js — what monsters and bosses do TO you
   Afflictions on the player (icons in the buff bar, effects drawn on the hero):
     poison (พิษ) · burn (ไฟลวก) · bleed (เลือดไหล, worse while moving) — damage over time (DoT)
     slow (ช้า) · freeze (แช่แข็ง: cannot act) · root (ตรึง: cannot walk) · silence (ใบ้: no skills)
     blind (ตาพร่า: 35% of your attacks miss) · curse (คำสาป: you deal 25% less)
   Rules: you can always try to cast, even poisoned or burning. A hit may break the cast, a DoT tick less often (35%);
     Cast Resistance (DEX × 0.15% + INT × 0.1% + skills, at most 90%) is the chance to keep casting. A no-flinch passive never breaks. Big hits knock you back and flash the screen.
   Sources: every monster's hits can carry its element/kind (poisonous creatures poison, fire burns, water slows, wind cuts...),
     bosses more often; every boss skill carries its own status (slam stuns, meteor burns, field poisons, roar silences...).
   Cures: Green Potion (ยาเขียว, sold by the potion seller) clears everything · rolling puts out burns · Heal skills only restore HP but shorten every affliction by 40% ·
     Elixir of Life clears DoTs. */
'use strict';

const AF_INFO = {
  poison:['พิษ', 'Poison', '#7fe05a', 'ติด HP ทุกวิ · อาจขัดการร่าย', 'HP drain · may break casts'],
  burn:['ไฟลวก', 'Burn', '#ff8a3a', 'ไฟไหม้ HP ทุกวิ · อาจขัดการร่าย · กลิ้งเพื่อดับ', 'Burning · may break casts · roll to put it out'],
  bleed:['เลือดไหล', 'Bleed', '#ff4a5a', 'เสีย HP ทุกวิ (เดินแล้วหนักขึ้น) · อาจขัดการร่าย', 'HP loss (worse while moving) · may break casts'],
  slow:['เชื่องช้า', 'Slow', '#8ab8ff', 'เดินช้าลง', 'Slower movement'],
  freeze:['แช่แข็ง', 'Frozen', '#bff0ff', 'ขยับไม่ได้', 'Cannot act'],
  root:['ตรึง', 'Rooted', '#c8a060', 'เดินไม่ได้ (ยังโจมตีได้)', 'Cannot walk (can still attack)'],
  silence:['ใบ้', 'Silence', '#e8e0ff', 'ใช้สกิลไม่ได้', 'No skills'],
  blind:['ตาพร่า', 'Blind', '#8a8a9a', 'โจมตีพลาดง่าย', 'Attacks often miss'],
  curse:['คำสาป', 'Curse', '#b07aff', 'ดาเมจที่ทำลดลง 25%', 'You deal 25% less damage']};
const AF_IC = {
  poison:'<path d="M10 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z"/><circle cx="8.5" cy="12" r="1"/><circle cx="11.5" cy="14" r=".8"/>',
  burn:'<path d="M10 2c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1.5.8 2.5 1.6 2.5C10 7 9 5 10 2z"/>',
  bleed:'<path d="M7 4c2 3 3 4.5 3 6a3 3 0 0 1-6 0c0-1.5 1-3 3-6zM14 9c1.4 2 2 3 2 4a2 2 0 0 1-4 0c0-1 .6-2 2-4z"/>',
  slow:'<path d="M4 15c2-6 10-6 12-1"/><path d="M6 11c1-3 6-3 7 0"/><circle cx="15" cy="15" r="1.4"/>',
  freeze:'<path d="M10 2v16M3 6l14 8M17 6L3 14"/><path d="M8 3.5l2 1.5 2-1.5M8 16.5l2-1.5 2 1.5"/>',
  root:'<path d="M10 3v8M10 11c-3 1-5 3-6 6M10 11c3 1 5 3 6 6M10 11v6"/>',
  silence:'<path d="M4 8h3l4-3v10l-4-3H4z"/><path d="M14 7l4 6M18 7l-4 6"/>',
  blind:'<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><path d="M4 16L16 4"/>',
  curse:'<path d="M10 3a5 5 0 0 1 5 5c0 2-1 3-2 3.5V14H7v-2.5C6 11 5 10 5 8a5 5 0 0 1 5-5z"/><path d="M8 17h4"/><circle cx="8" cy="8" r=".9"/><circle cx="12" cy="8" r=".9"/>'};
const AF_DOT = ['poison', 'burn', 'bleed'];
const AF_CAP = {poison:['พิษ', 'PSN'], burn:['ไฟ', 'BRN'], bleed:['เลือด', 'BLD'], slow:['ช้า', 'SLW'], freeze:['แข็ง', 'FRZ'], root:['ตรึง', 'ROOT'], silence:['ใบ้', 'SIL'], blind:['มืด', 'BLND'], curse:['สาป', 'CRS']};
const afOf = () => P.af || (P.af = {});
/* status resistance: the 'Status Resist' option on gear (and any passive), up to 60% */
function afRes(){ let r = (DER && DER.pas && DER.pas.statusRes) || 0; const g = S.gear || {}; for (const sl in g) if (g[sl] && ITEMS[g[sl]] && ITEMS[g[sl]].st) r += ITEMS[g[sl]].st.resPct || 0;
  for (const sl in (S.slots || {})) { const c = CARDS[S.slots[sl]]; if (c && c.bonus && c.bonus.resPct) r += c.bonus.resPct; } return Math.min(.6, r); }
const afHas = k => !!(P.af && P.af[k] && P.af[k].t > 0);
const afDot = () => AF_DOT.some(afHas);
const afMoveMul = () => (afHas('root') || afHas('freeze') ? 0 : afHas('slow') ? 1 - P.af.slow.amt : 1);

/* give the player an affliction. power: DoT damage per second; stacks: poison up to 3 */
function afflict(k, dur, opt = {}){
  if (P.dead || !AF_INFO[k]) return;
  if (P.roll && !opt.force) return;
  if (Math.random() < afRes()){ if (T - (P.afResT || 0) > 1){ P.afResT = T; afText('Resist!', '#e8f0ff'); } return; }
  const A = afOf(), cur = A[k], fresh = !(cur && cur.t > 0);
  if (k === 'poison'){ const st = fresh ? 1 : Math.min(3, cur.st + 1); A[k] = {t:Math.max(dur, fresh ? 0 : cur.t), max:dur, dps:(opt.dps || 1) * (fresh ? 1 : 1), base:opt.dps || 1, st, tick:fresh ? 1 : cur.tick}; A[k].dps = A[k].base * st; }
  else if (AF_DOT.includes(k)) A[k] = {t:Math.max(dur, fresh ? 0 : cur.t), max:dur, dps:Math.max(opt.dps || 1, fresh ? 0 : cur.dps), tick:fresh ? 1 : cur.tick};
  else if (k === 'slow') A[k] = {t:Math.max(dur, fresh ? 0 : cur.t), max:dur, amt:Math.max(opt.amt || .35, fresh ? 0 : cur.amt)};
  else A[k] = {t:Math.max(dur, fresh ? 0 : cur.t), max:dur};
  if (k === 'freeze'){ P.stunT = Math.max(P.stunT || 0, dur); P.cast = null; }
  if (k === 'silence' && P.cast){ P.cast = null; afText('Interrupted!', '#e8e0ff'); }
  if (fresh || k === 'poison') afText(`${L(AF_INFO[k][0], AF_INFO[k][1])}${k === 'poison' && A[k].st > 1 ? ' ×' + A[k].st : ''}`, AF_INFO[k][2]);
  if (typeof renderBuffs === 'function') renderBuffs();
}
function afShorten(k){
  const A = P.af; if (!A) return 0; let n = 0;
  for (const key in A){ const a = A[key]; if (!(a.t > 0)) continue; a.t = Math.max(.1, a.t * (1 - k)); n++; if (key === 'freeze') P.stunT = Math.min(P.stunT || 0, a.t); }
  if (n){ afText(L('อาการทุเลาลง', 'Afflictions ease'), '#c8ffd0'); if (typeof renderBuffs === 'function') renderBuffs(); }
  return n;
}
function afCure(list, why){
  const A = afOf(); let n = 0; for (const k of list || Object.keys(A)) if (A[k] && A[k].t > 0){ A[k].t = 0; n++; if (k === 'freeze') P.stunT = Math.min(P.stunT || 0, .05); }
  if (n){ afText(why || L('หายจากอาการ', 'Cured'), '#c8ffd0'); VFX.play('heal', {x:P.x, y:P.y}); if (typeof renderBuffs === 'function') renderBuffs(); }
  return n;
}
let afTextT = 0;
function afText(s, col){ addText(P.x, P.y - 66 - (T - afTextT < .5 ? 12 : 0), s, col, 13); afTextT = T; }
const castResPct = () => (!DER ? 0 : Math.min(90, DER.b.dex * .15 + DER.b.int * .1 + ((DER.pas && DER.pas.castRes) || 0)));
function afBreakCast(why, dot){
  if (!P.cast || (DER.pas && DER.pas.noFlinch)) return false;
  // the chance to be interrupted: 100% for a hit, 35% for a DoT tick, cut by Cast Resistance
  if (Math.random() * 100 >= (dot ? 35 : 100) * (1 - castResPct() / 100)){ if (T - (P.crT || 0) > 1.2){ P.crT = T; afText('Kept casting!', '#bfe4ff'); } return false; }
  P.cast = null; afText(why || 'Interrupted!', '#ffd0a0'); SFX.play('hurt'); return true;
}

/* ---------- what each attack carries ---------- */
const VENOM = /viper|cobra|snake|scorpion|spider|krait|millipede|jelly|leech|toad|centipede|wasp|serpent/;
function mobAfflict(m){
  const d = m.def, id = m.type;
  if (d.race === 'insect' || VENOM.test(id)) return 'poison';
  return {fire:'burn', water:'slow', wind:'bleed', earth:'stun', holy:'silence', shadow:d.race === 'undead' ? 'blind' : 'curse', neutral:d.race === 'brute' ? 'bleed' : null}[d.elem || 'neutral'];
}
const afDps = (m, pct) => Math.max(1, Math.round(DER.maxhp * pct * (m.def.boss ? 1.5 : .6) + (m.def.atk ? m.def.atk[0] * .04 : 0)));
function applyMobFx(m, k, power = 1){
  if (!k) return;
  if (k === 'stun'){ if (!(P.stunT > 0)){ P.stunT = .5 * power; P.cast = null; VFX.play('stunStars', {}); afText('Stun', '#ffd56a'); } return; }
  const dur = {poison:5, burn:4, bleed:6, slow:3, freeze:1.2, root:2, silence:3, blind:4, curse:6}[k] * (m.def.boss ? 1.2 : 1) * power;
  afflict(k, dur, {dps:afDps(m, {poison:.012, burn:.02, bleed:.01}[k] || 0), amt:k === 'slow' ? (m.def.boss ? .45 : .3) : 0});
}
/* each boss skill's own status (on top of its damage) */
const SKILL_FX = {slam:['stun', 1.4], quake:['slow', 1.2], charge:['stun', 1.2], wave:['elem', 1], barrage:['elem', .7], meteor:['burn', 1], roar:['silence', 1], field:['poison', 1],
  leap:['slow', 1], dash:['bleed', 1], burrow:['bleed', 1.2], soar:['bleed', 1.2], spin:['bleed', .6], ring:['slow', .8], pull:['curse', 1], breath:['elem', 1.2], miasma:['poison', 1]};
const ELEM_DOT = m => { const k = mobAfflict(m); return k === 'stun' || !k ? 'bleed' : k; };

/* ---------- hooks ---------- */
{
  // hits: knockback, flinch, broken casts and the statuses they carry
  HK.atkAfter.push((m, mult, noDodge, dmg, dead0) => {
    if (P.dead && dead0 || !(dmg > 0)) return;
    const big = dmg / DER.maxhp;
    // a normal hit or a skill breaks a spell
    afBreakCast();
    // heavy hits shove you back and flash the edges of the screen red
    AF_FLASH.t = .35; AF_FLASH.a = Math.min(.55, .12 + big * 2.5);
    if ((mult >= 1.4 || big > .12) && !P.dead && !(DER.pas && DER.pas.noFlinch)){ const dx = P.x - m.x, dy = P.y - m.y, l = Math.hypot(dx, dy) || 1, k = Math.min(36, 10 + big * 120);
      P.kb = {vx:dx / l * k * 6, vy:dy / l * k * 4, t:.16}; VFX.shake(Math.min(6, 2 + big * 20)); }
    // statuses
    const fxId = m._fx || (noDodge && m.lastSk && T - m.lastSkT < 6 ? m.lastSk : null);
    if (fxId && SKILL_FX[fxId]){ const [k, p] = SKILL_FX[fxId]; const kk = k === 'elem' ? ELEM_DOT(m) : k; if (Math.random() < Math.min(1, .55 + .45 * p)) applyMobFx(m, kk, Math.max(.6, p)); }
    else if (Math.random() < (m.def.boss ? .15 : .07)) applyMobFx(m, mobAfflict(m), m.def.boss ? 1 : .8);
  });
  // the boss's own skill list: remember which one is landing
  const _cast = bossCast;
  bossCast = function(m, id){ m.lastSk = id; m.lastSkT = T; return _cast(m, id); };
  // casting rules
  const _try = trySkill;
  trySkill = function(id){
    const sk = SKILLS[id], lv = skl(id);
    if (sk && lv && sk.type !== 'passive' && !P.dead){
      if (afHas('silence')){ if (T - (P.afWarn || 0) > 1){ P.afWarn = T; toast(L('ติดใบ้ · ใช้สกิลไม่ได้', 'Silenced · no skills')); } return; }
    }
    return _try(id);
  };
  // healing spells only restore HP, but they shorten every affliction still running by 40% (they never remove one outright)
  const _fire = fireSkill;
  fireSkill = function(id, lv, t){ const r = _fire(id, lv, t); const sk = SKILLS[id]; if (sk && sk.type === 'heal') afShorten(.4); return r; };
  // blind and curse weaken your hits
  HK.physGuard.push(() => (afHas('blind') && Math.random() < .35 ? {miss:true} : null));
  HK.outMul.push(mult => (afHas('curse') ? mult * .75 : mult));
  // the cure potion
  ITEMS.greenpot = {name:'ยาเขียว', en:'Green Potion', buy:120, kind:'use', cure:true, desc:['รักษาพิษ ไฟลวก เลือดไหล ใบ้ ตาพร่า คำสาป ช้า', 'Cures poison, burns, bleeding, silence, blindness, curses and slow']};
  if (typeof IA_POT !== 'undefined') IA_POT.greenpot = [['#e0ffb8', '#5ac83a', '#1e5a14'], 'round'];
  const _use = useItem;
  useItem = function(id){
    const it = ITEMS[id];
    if (it && it.cure){ if (!S.inv[id] || P.dead || P.itemCd > 0) return; if (!afCure(null, L('ยาเขียว · หายจากอาการ', 'Green Potion · cured'))){ toast(L('ไม่มีอาการผิดปกติ', 'Nothing to cure')); return; }
      S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; P.itemCd = .3; dirty = true; SFX.play('pot_hp', {tier:1}); return; }
    const r = _use(id); if (id === 'elixirpot') afCure(AF_DOT); return r;
  };
  // afflictions show in the buff bar
  const _bl = buffList;
  buffList = function(){ const list = _bl(); if (P.af) for (const k in P.af){ const a = P.af[k]; if (!(a.t > 0)) continue;
    list.push({k:'af_' + k, ic:[AF_INFO[k][2], AF_IC[k]], t:a.t, max:a.max, name:`${L(AF_INFO[k][0], AF_INFO[k][1])}${a.st > 1 ? ' ×' + a.st : ''}`, eff:L(AF_INFO[k][3], AF_INFO[k][4]), neg:true, cap:`${L(AF_CAP[k][0], AF_CAP[k][1])}${a.st > 1 ? '×' + a.st : ''}`}); } return list; };
}
const AF_FLASH = {t:0, a:0};

/* ---------- ticking ---------- */
EV.on('tick', dt => {
  if (P.kb){ P.kb.t -= dt; const k = Math.max(0, P.kb.t) / .16; P.x = clamp(P.x + P.kb.vx * dt * k, 30, W - 30); P.y = clamp(P.y + P.kb.vy * dt * k, 40, H - 30); pushOut(P, 10); if (P.kb.t <= 0) P.kb = null; }
  if (AF_FLASH.t > 0) AF_FLASH.t -= dt;
  const A = P.af; if (!A) return;
  if (P.dead){ for (const k in A) A[k].t = 0; return; }
  let changed = false;
  for (const k in A){ const a = A[k]; if (!(a.t > 0)) continue;
    a.t -= dt; if (a.t <= 0){ a.t = 0; changed = true; continue; }
    if (k === 'burn' && P.roll){ a.t = 0; changed = true; afText(L('ดับไฟแล้ว', 'Fire out'), '#ffd0a0'); continue; }
    if (AF_DOT.includes(k)){ a.tick -= dt; if (a.tick <= 0){ a.tick = 1;
      const dmg = Math.max(1, Math.round(a.dps * (k === 'bleed' && P.moving ? 2 : 1)));
      S.hp -= dmg; addText(P.x + rand(-8, 8), P.y - 44, String(dmg), AF_INFO[k][2], 12); P.hurtTint = .25;
      afBreakCast('Cast broken!', true);
      if (S.hp <= 0){ S.hp = 0; playerDie(); return; } } }
  }
  if (changed && typeof renderBuffs === 'function') renderBuffs();
  // the auto battle drinks a Green Potion when a DoT or silence bites
  if (typeof BOT !== 'undefined' && BOT.on && S.inv.greenpot && (afDot() || afHas('silence')) && T - (P.afPot || 0) > 3){ P.afPot = T; useItem('greenpot'); }
});

/* ---------- drawing on the hero ---------- */
EV.on('draw', () => {
  if (false && AF_FLASH.t > 0){ const a = AF_FLASH.a * AF_FLASH.t / .35; const g = ctx.createRadialGradient(SW / 2, SH / 2, Math.min(SW, SH) * .35, SW / 2, SH / 2, Math.max(SW, SH) * .7);
    g.addColorStop(0, 'rgba(200,0,0,0)'); g.addColorStop(1, `rgba(200,10,10,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH); }
  const A = P.af; if (!A || P.dead) return;
  const x = sx(P.x), y = sy(P.y), z = typeof TAG_Z === 'function' ? TAG_Z() : 1, H0 = 44 * PX;
  ctx.save();
  const tint = (col, a) => { ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(x, y - H0 * .5, 0, x, y - H0 * .5, H0 * .6); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y - H0 * .5, H0 * .45, H0 * .6, 0, 0, 7); ctx.fill(); };
  if (afHas('poison')){ tint('90,220,60', .18 + .06 * Math.sin(T * 5));
    for (let i = 0; i < 6; i++){ const ph = (T * .8 + i / 6) % 1; ctx.globalAlpha = 1 - ph; ctx.fillStyle = '#8ff05a'; ctx.beginPath(); ctx.arc(x + Math.sin(i * 2.3 + T) * H0 * .25, y - H0 * (.2 + ph * .9), (1.5 + ph * 2) * z, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  if (afHas('burn')){ tint('255,120,30', .2);
    for (let i = 0; i < 7; i++){ const ph = (T * 2.2 + i / 7) % 1, fx = x + (i - 3) * H0 * .09, fy = y - ph * H0 * .7; ctx.globalAlpha = (1 - ph) * .9; ctx.fillStyle = ph < .4 ? '#ffe070' : '#ff6a20';
      ctx.beginPath(); ctx.ellipse(fx, fy, (3.2 - ph * 2) * z, (5 - ph * 3) * z, 0, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  if (afHas('bleed')) for (let i = 0; i < 4; i++){ const ph = (T * 1.3 + i / 4) % 1; ctx.globalAlpha = 1 - ph * .6; ctx.fillStyle = '#d0202a'; const dx = x + (i - 1.5) * H0 * .14, dy = y - H0 * .55 + ph * H0 * .55;
    ctx.beginPath(); ctx.moveTo(dx, dy - 3 * z); ctx.quadraticCurveTo(dx + 2.2 * z, dy + 1 * z, dx, dy + 2.2 * z); ctx.quadraticCurveTo(dx - 2.2 * z, dy + 1 * z, dx, dy - 3 * z); ctx.fill(); }
  ctx.globalAlpha = 1;
  if (afHas('slow')){ ctx.strokeStyle = 'rgba(150,190,255,.6)'; ctx.lineWidth = 1.5 * z; for (let i = 0; i < 2; i++){ ctx.beginPath(); ctx.ellipse(x, y - 2, H0 * (.3 + i * .1), H0 * (.1 + i * .04), 0, T * 2 + i, T * 2 + i + 3.5); ctx.stroke(); } }
  if (afHas('freeze')){ ctx.fillStyle = 'rgba(190,240,255,.42)'; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(x - H0 * .3, y); ctx.lineTo(x - H0 * .36, y - H0 * .7); ctx.lineTo(x - H0 * .1, y - H0 * 1.05); ctx.lineTo(x + H0 * .25, y - H0 * .9); ctx.lineTo(x + H0 * .34, y - H0 * .3); ctx.lineTo(x + H0 * .28, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (afHas('root')){ ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2 * z; for (let i = 0; i < 4; i++){ const a = i * 1.6; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * H0 * .35, y + 2); ctx.quadraticCurveTo(x + Math.cos(a) * H0 * .1, y - H0 * .2, x + Math.cos(a + 1) * H0 * .12, y - H0 * .35); ctx.stroke(); } }
  const hy = (P.tagTop != null ? P.tagTop : y - H0) - 4 * z;
  if (afHas('blind')){ ctx.fillStyle = 'rgba(30,30,40,.55)'; for (let i = 0; i < 5; i++){ ctx.beginPath(); ctx.arc(x + Math.sin(T * 1.5 + i * 1.3) * H0 * .25, y - H0 * .78 + Math.cos(T + i) * 3, (6 + i % 2 * 3) * z, 0, 7); ctx.fill(); } }
  if (afHas('curse')){ for (let i = 0; i < 3; i++){ const ph = (T * .6 + i / 3) % 1, a = T * 2 + i * 2.1; ctx.globalAlpha = Math.sin(ph * Math.PI) * .8; ctx.fillStyle = '#b07aff'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * H0 * .4, y - H0 * .5 - ph * H0 * .4, 2.6 * z, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  // little icons over the name plate
  const act = Object.keys(A).filter(k => A[k].t > 0 && (k === 'silence' || k === 'blind' || k === 'curse' || k === 'freeze' || AF_DOT.includes(k)));
  act.forEach((k, i) => { const ix = x + (i - (act.length - 1) / 2) * 15 * z, s = 6 * z; ctx.fillStyle = 'rgba(10,6,14,.8)'; ctx.beginPath(); ctx.arc(ix, hy - s, s + 1.5 * z, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(ix - s, hy - 2 * s); ctx.scale(s / 10, s / 10); ctx.strokeStyle = AF_INFO[k][2]; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(new Path2D(AF_IC[k].replace(/<[^>]*d="([^"]*)"[^>]*>/g, ' $1').replace(/<circle[^>]*>/g, ''))); ctx.restore(); });
  ctx.restore();
});

WIKI_SYS.push({id:'afflict', t:['อาการผิดปกติ', 'Afflictions'], b:() => `<p>${L('การโจมตีของมอนและสกิลบอสติดสถานะได้ (ไอคอนขึ้นที่แถบบัฟและเหนือหัว) · ระหว่างติด<b>พิษ ไฟลวก เลือดไหล</b> (ดาเมจต่อเนื่อง) <b>ร่ายเวทไม่ได้</b> และทุกครั้งที่เสีย HP จากอาการจะขัดการร่าย · โดนตีปกติระหว่างร่ายก็ถูกขัดเช่นกัน · โดนแรงจะกระเด็นถอย', 'Monster hits and boss skills carry statuses (icons in the buff bar and over your head) · while <b>poisoned, burning or bleeding</b> (damage over time) you <b>cannot cast</b>, and every tick breaks a cast · a normal hit also breaks your cast · heavy hits knock you back')}</p>
  <table class="wkt"><tr><th>${L('อาการ', 'Status')}</th><th>${L('ผล', 'Effect')}</th><th>${L('มาจาก', 'From')}</th></tr>
  ${[['poison', L('สัตว์มีพิษ แมลง · บ่อพิษ · หมอกพิษ', 'venomous beasts, insects · cursed pool · miasma')], ['burn', L('ธาตุไฟ · ฝนอุกกาบาต', 'fire · meteor rain')], ['bleed', L('ธาตุลม สัตว์ป่า · พุ่งทะลวง มุดดิน พายุหมุน', 'wind, wild beasts · dash, burrow, spin')], ['slow', L('ธาตุน้ำ · แผ่นดินไหว กระโจน คลื่นกระแทก', 'water · quake, leap, shock rings')], ['freeze', L('ลมหายใจธาตุน้ำ', 'water breath')], ['silence', L('ธาตุศักดิ์สิทธิ์ · คำรามสะท้าน', 'holy · roar')], ['blind', L('ผีดิบ', 'undead')], ['curse', L('ธาตุความมืด · ดูดกลืนวิญญาณ', 'shadow · soul vortex')]].map(([k, f]) => `<tr><td style="color:${AF_INFO[k][2]}"><b>${L(AF_INFO[k][0], AF_INFO[k][1])}</b></td><td>${L(AF_INFO[k][3], AF_INFO[k][4])}</td><td>${f}</td></tr>`).join('')}</table>
  <p>${L('รักษา: <b>ยาเขียว</b> (ร้านยา 120 เบี้ย) หายทุกอาการ · กลิ้งเพื่อดับไฟ · สกิลฮีลเพิ่มแค่ HP แต่ทำให้ทุกอาการหมดเร็วขึ้น (ลดเวลาที่เหลือ 40%) · ยาอายุวัฒนะล้างพิษ/ไฟ/เลือด · ระบบ Auto ใช้ยาเขียวเอง', 'Cures: <b>Green Potion</b> (potion seller, 120) clears everything · roll to put out burns · Heal skills only restore HP but cut the time left on every affliction by 40% · Elixir clears DoTs · Auto battle drinks Green Potions itself')}</p>`});

/* other players see your afflictions: a short list in presence, small icons over their name */
const afPres = () => ({af:P.af ? Object.keys(P.af).filter(k => P.af[k].t > 0).join(',').slice(0, 60) : ''});
function afDrawGhost(x, top, list){
  if (typeof list !== 'string' || !list || top == null) return; const ks = list.split(',').filter(k => AF_IC[k]).slice(0, 5); if (!ks.length) return;
  const z = typeof TAG_Z === 'function' ? TAG_Z() : 1, s = 5.5 * z, hy = top - 4 * z;
  ctx.save(); ks.forEach((k, i) => { const ix = x + (i - (ks.length - 1) / 2) * 14 * z; ctx.fillStyle = 'rgba(10,6,14,.8)'; ctx.beginPath(); ctx.arc(ix, hy - s, s + 1.4 * z, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(ix - s, hy - 2 * s); ctx.scale(s / 10, s / 10); ctx.strokeStyle = AF_INFO[k][2]; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.stroke(new Path2D(AF_IC[k].replace(/<[^>]*d="([^"]*)"[^>]*>/g, ' $1').replace(/<circle[^>]*>/g, ''))); ctx.restore(); });
  ctx.restore();
}
