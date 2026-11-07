/* VAYRATHEN — js/sys/towersquad260.js — (v260) the tower fights back: mixed squads and affixed monsters
   The owner: the tower was far too easy — "mix the monster sets: close-range, long-range, skills; make the player
   work for it". Before, a floor took every monster from one region (about six kinds), stood them round the seal and
   they all walked in.
   1. SQUADS. Every ordinary wave is a team drawn from every region near the floor's level, by role:
      · melee   — rush you (pounce, rend, slam, coil, bite…)
      · ranged  — keep back and shoot (spit, volley, snare, bolt)
      · casters — area magic, curses, silence, slows (nova, hex, hush, frost, blind)
      · support — heal and rally the others (mend, rally, harden)
      Ranged, casters and support take the back of the hall (toward the gate), melee comes at you from the middle. The
      mix leans harder as you climb (more ranged and casters, a healer from floor 11).
   2. AFFIXES. Some monsters carry one (shown before their name), more of them higher up:
      เกราะเวท a shield of 30% of its HP soaks damage first · ว่องไว moves 50% faster and attacks 30% faster ·
      ดูดเลือด heals 30% of what it deals · ระเบิดตาย a red circle when it dies, then a blast (20% of your HP) ·
      แยกร่าง splits into two smaller copies when it dies · ผู้นำฝูง its squad hits 20% harder while it lives.
   3. Guardian floors bring two back-line adds (ranged or casters) with the guardian.
   4. Part of v256's easing comes back (it had made the high floors soft): monsters keep more HP and hit harder, the
      halls hold more of them, the red blasts come a little more often. Measured with tools/tower-report.js. */
'use strict';
const TWSQ = {pool:null, raw:false};
/* ---------- roles ---------- */
const TWSQ_ROLE_SK = {melee:['pounce', 'rend', 'slam', 'coil', 'bite', 'dive'], ranged:['spit', 'volley', 'snare', 'bolt', 'web'], caster:['nova', 'hex', 'hush', 'frost', 'blind'], support:['mend', 'rally', 'harden']};
function twsqRole(k){ const d = MOB[k], sk = d.msk || [];
  if (sk.some(s => TWSQ_ROLE_SK.support.includes(s))) return 'support';
  if (sk.some(s => TWSQ_ROLE_SK.caster.includes(s)) && (d.range || 0) > 0) return 'caster';
  if ((d.range || 0) > 0 || sk.some(s => TWSQ_ROLE_SK.ranged.includes(s))) return 'ranged';
  return 'melee'; }
function twsqPool(){
  if (TWSQ.pool) return TWSQ.pool;
  TWSQ.pool = Object.keys(MOB).filter(k => { const d = MOB[k]; return d && !d.boss && !d.night && d.lvl && d.msk && d.atk && k !== 'dummy' && k !== 'crowncrystal' && !/^tw_|_lord$/.test(k); }).map(k => ({k, lv:MOB[k].lvl, role:twsqRole(k)}));
  return TWSQ.pool; }
/* the mix by floor: [melee, ranged, caster, support] */
const twsqMix = f => (f < 11 ? [.6, .3, .1, 0] : f < 41 ? [.45, .3, .15, .1] : f < 71 ? [.4, .3, .2, .1] : [.35, .3, .23, .12]);
function twsqPick(f, role){
  const lv = twLvC(f), near = twsqPool().filter(o => Math.abs(o.lv - lv) <= 18), list = near.length >= 8 ? near : twsqPool().filter(o => Math.abs(o.lv - lv) <= 40);
  const of = role ? list.filter(o => o.role === role) : list; const src = of.length ? of : list;
  return src[(Math.random() * src.length) | 0].k; }
function twsqRoleFor(f){ const m = twsqMix(f), r = Math.random(); let a = 0; const R = ['melee', 'ranged', 'caster', 'support']; for (let i = 0; i < 4; i++){ a += m[i]; if (r < a) return R[i]; } return 'melee'; }

/* ---------- 1. every ordinary monster of the tower comes from the squad ---------- */
{ const _m = twMob; twMob = function(type, x, y, f){
    if (!TWSQ.raw && typeof TW !== 'undefined' && TW.active && MOB[type] && !MOB[type].boss){ const role = twsqRoleFor(f || TW.f); type = twsqPick(f || TW.f, role); }
    const m = _m.call(this, type, x, y, f); if (m && !m.def.boss) m.twRole = twsqRole(type); return m; }; }

/* ---------- 2. affixes ---------- */
const TWSQ_AFX = {
  shield:{th:'เกราะเวท', en:'Warded', col:'#7ad0ff'}, swift:{th:'ว่องไว', en:'Swift', col:'#7dffb0'}, vamp:{th:'ดูดเลือด', en:'Vampiric', col:'#ff5a7a'},
  volatile:{th:'ระเบิดตาย', en:'Volatile', col:'#ff9a3a'}, split:{th:'แยกร่าง', en:'Splitting', col:'#c89aff'}, leader:{th:'ผู้นำฝูง', en:'Pack Leader', col:'#ffd23a'}
};
function twsqAffix(m, id){
  if (!m || m.dead || m.def.boss || m.twAfx) return; const a = TWSQ_AFX[id]; if (!a) return; m.twAfx = id;
  m.def = {...m.def, name:`${a.th} · ${m.def.name}`, en:`${a.en} ${m.def.en}`, exp:Math.round((m.def.exp || 1) * 1.6), jexp:Math.round((m.def.jexp || 1) * 1.6)};
  if (id === 'shield') m.twShield = Math.round(m.maxhp * .3);
  if (id === 'swift') m.def = {...m.def, speed:(m.def.speed || 50) * 1.5, delay:(m.def.delay || 1.5) * .7};
  if (id === 'leader') m.def = {...m.def, hp:Math.round(m.def.hp * 1.4)}, m.maxhp = m.hp = m.def.hp;
  if (typeof VFX !== 'undefined') VFX.play('enrage', {m});
}
const twsqAfxCount = f => (f < 5 ? 0 : Math.min(5, 1 + Math.floor(f / 20)));
function twsqDealAffixes(f, list){
  const ids = Object.keys(TWSQ_AFX), n = twsqAfxCount(f), pool = list.filter(m => !m.twAfx);
  for (let i = 0; i < n && pool.length; i++){ const m = pool.splice((Math.random() * pool.length) | 0, 1)[0]; twsqAffix(m, ids[(Math.random() * ids.length) | 0]); } }
// the shield soaks first
{ const _ad = applyDamage; applyDamage = function(m, res){ if (m && m.twShield > 0 && res && res.dmg > 0 && !m.dead){ const a = Math.min(m.twShield, res.dmg); m.twShield -= a; res.dmg -= a;
      if (typeof addText === 'function') addText(m.x, m.y - (MOB_H[m.type] || 40) - 14, m.twShield > 0 ? L('โล่', 'Shield') : L('โล่แตก!', 'Shield broken!'), '#7ad0ff', 11);
      if (res.dmg <= 0) return; }
    return _ad.apply(this, arguments); }; }
// the vampire drinks what it deals; the pack leader's squad hits harder
{ const _ma = mobAttack; mobAttack = function(m, mult = 1){ const lead = m && m.tw && !m.twAfx && typeof mobs !== 'undefined' && mobs.some(o => o !== m && o.twAfx === 'leader' && !o.dead && o.tw === m.tw && Math.hypot(o.x - m.x, o.y - m.y) < 300);
    const hp0 = S.hp, r = _ma.call(this, m, lead ? mult * 1.2 : mult, ...[].slice.call(arguments, 2)); const dealt = hp0 - S.hp;
    if (m && m.twAfx === 'vamp' && dealt > 0 && !m.dead){ const h = Math.round(dealt * .3); m.hp = Math.min(m.maxhp, m.hp + h); if (typeof addText === 'function') addText(m.x, m.y - (MOB_H[m.type] || 40) - 14, `+${h}`, '#ff5a7a', 11); }
    return r; }; }
// on death: the volatile one blasts, the splitter splits
EV.on('kill', m => {
  if (!m || !m.tw || typeof TW === 'undefined' || !TW.active) return;
  if (m.twAfx === 'volatile'){ const x = m.x, y = m.y, r = 80; VFX.play('warnCircle', {x, y, r, t:1});
    later(1, () => { if (!TW.active) return; VFX.play('boom', {x, y, r}); if (P.dead || P.roll) return;
      if (Math.hypot(P.x - x, (P.y - y) * 1.4) < r + 6){ const d = Math.round(DER.maxhp * .2 * (1 - Math.min(.6, buffSum('dmgRed')))); S.hp -= d; addText(P.x, P.y - 48, String(d), '#ff8a3a'); P.hurt = .25; if (S.hp <= 0) playerDie(); } }); }
  if (m.twAfx === 'split' && !m.twChild){ TWSQ.raw = true;
    try { for (const d of [-1, 1]){ const c = twMob(m.type, m.x + d * 26, m.y + 8, m.tw); c.def = {...c.def, hp:Math.max(1, Math.round(c.def.hp * .35)), name:`${L('ร่างแยก', 'Split')} · ${c.def.name}`}; c.maxhp = c.hp = c.def.hp; c.twChild = true; c.twRole = m.twRole; } }
    finally { TWSQ.raw = false; } }
});

/* ---------- 3. the wave takes its places; affixes are dealt; guardians bring a back line ---------- */
{ const _sp = twSpawn; twSpawn = function(){ const r = _sp.apply(this, arguments); if (!TW.active || TW.phase !== 'fight') return r;
    const f = TW.f, c = typeof twmC === 'function' ? twmC() : {x:P.x, y:P.y}, rx = typeof TWM_RX !== 'undefined' ? TWM_RX : 300, ry = typeof TWM_RY !== 'undefined' ? TWM_RY : 200;
    const wave = mobs.filter(m => m.tw === f && !m.dead && !m.def.boss), place = (m, x, y) => { if (walkable(x, y, 14)){ m.x = x; m.y = y; m.hx = x; m.hy = y; } };
    // back line toward the gate, front line in the middle
    const back = wave.filter(m => m.twRole && m.twRole !== 'melee'), front = wave.filter(m => !m.twRole || m.twRole === 'melee');
    back.forEach((m, i) => place(m, c.x + (i + .5 - back.length / 2) * Math.min(120, rx * 1.4 / Math.max(1, back.length)), c.y - ry * (.38 + (i % 2) * .14)));
    front.forEach((m, i) => { const a = (i / Math.max(1, front.length)) * 6.283; place(m, c.x + Math.cos(a) * rx * .3, c.y + Math.sin(a) * ry * .25); });
    if (twBoss(f)){ TWSQ.raw = true; try { for (const d of [-1, 1]){ const k = twsqPick(f, d < 0 ? 'ranged' : 'caster'), m = twMob(k, c.x + d * rx * .35, c.y - ry * .5, f); m.twRole = twsqRole(k); } } finally { TWSQ.raw = false; } }
    twsqDealAffixes(f, mobs.filter(m => m.tw === f && !m.dead && !m.def.boss));
    return r; }; }
// reinforcements (survive floors, splitters) sometimes carry an affix too
{ const _m = twMob; twMob = function(){ const m = _m.apply(this, arguments); if (m && TW.active && TW.phase === 'fight' && m.tw === TW.f && !m.def.boss && !TWSQ.raw && TW.spawned && Math.random() < .12 && TW.f >= 5){ const ids = Object.keys(TWSQ_AFX); twsqAffix(m, ids[(Math.random() * ids.length) | 0]); } return m; }; }

/* ---------- 4. part of v256's easing comes back ---------- */
if (typeof TW256_HP !== 'undefined'){ /* consts: the multipliers are re-applied through the wrappers below */ }
{ const _m = twMob; twMob = function(type, x, y, f){ const m = _m.apply(this, arguments);
    if (m && m.def && TW.active){ const fl = f || TW.f, kh = fl <= 40 ? 1 : 1 + .5 * Math.min(1, (fl - 40) / 35), ka = fl <= 50 ? 1 : 1 + .25 * Math.min(1, (fl - 50) / 30);   // ×.45 → ×.68 HP, ×.6 → ×.75 hits by the top
      m.def = {...m.def, hp:Math.round(m.def.hp * kh), atk:m.def.atk.map(v => Math.max(1, Math.round(v * ka)))}; m.maxhp = m.hp = m.def.hp; if (m.twShield) m.twShield = Math.round(m.maxhp * .3); }
    return m; }; }
if (typeof bossPunch === 'function'){ const _bp = bossPunch; bossPunch = function(m){ const r = _bp.apply(this, arguments);
    return m && m.twGuard && typeof TW !== 'undefined' && TW.active && TW.f > 30 ? Math.round(r * (1 + .5 * Math.min(1, (TW.f - 30) / 55))) : r; }; }   // the guardian's blows: ×.35 → ×.53 by the top

/* ---------- the wiki ---------- */
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'towersquad', t:['หอคอย: ทีมมอนและมอนพิเศษ', 'Tower: squads and affixes'], b:() => `<p>${L('มอนในหอคอยมาเป็นทีมผสมจากทุกแคว้นใกล้เลเวลชั้น: สายประชิดพุ่งเข้าหา สายยิงไกลและสายเวทยืนแถวหลัง สายสนับสนุนฮีลและปลุกใจพวก ยิ่งสูงยิ่งมีสายยิงและสายเวทมาก', 'Tower monsters come as mixed squads from every region near the floor level: melee rush you, ranged and casters hold the back line, supports heal and rally — higher up, more ranged and casters')}</p>
  <ul>${Object.values(TWSQ_AFX).map(a => `<li><b style="color:${a.col}">${L(a.th, a.en)}</b></li>`).join('')}</ul>
  <p>${L('มอนพิเศษ (มีชื่อนำหน้า) ได้ EXP มากกว่า · เกราะเวทซับดาเมจก่อน · ว่องไวเร็วขึ้น · ดูดเลือดฟื้นจากที่ตีโดน · ระเบิดตายมีวงแดงก่อนระเบิด · แยกร่างตายแล้วแบ่งเป็นสองตัว · ผู้นำฝูงทำให้ทีมตีแรงขึ้น — ฆ่าผู้นำก่อน!', 'Affixed monsters (named first) give more EXP · Warded soaks damage first · Swift is faster · Vampiric heals from its hits · Volatile shows a red circle, then blasts · Splitting becomes two · the Pack Leader makes its squad hit harder — kill it first!')}</p>`});
