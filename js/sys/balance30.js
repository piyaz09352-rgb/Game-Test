/* VAYRATHEN — js/sys/balance30.js — the damage scale, and monsters that fight like what they are (v29)
   1) Damage scale. Numbers grow with level, gently. (v100) Cut from ×80 at Lv 300 to ×10, so the numbers stay readable:
      ordinary Lv 300 monsters have about 170,000 HP (was 1.4 million) and bosses a few million (was 46 million).
      Both sides shrink by the same curve, so a fight takes as many hits as before. One curve, K(lv) = 1 + 9·(lv/300)^2.2
      (Lv 50 ×1.2 · Lv 100 ×1.9 · Lv 150 ×2.9 · Lv 200 ×4.7 · Lv 300 ×10), multiplies:
        – every hit you (and your pet, summons, DoTs) deal to monsters, by YOUR level (your pet by its level);
        – every monster's HP, by ITS level (ordinary monsters ×0.75 of it, so a level-matched kill takes a few fewer hits;
          bosses the full curve). Monster attacks and your HP are unchanged, so survival plays as before.
      PvP is not scaled (duel damage stays as it was).
   2) No more running away: wounded monsters stand and fight.
   3) Monster skills by kind. Every ordinary monster species gets one or two skills that fit its body, weapon, element
      and race, each with a short warning (a red circle or the skill's name over its head):
        ranged — spit, feather volley, snare arrow, elemental bolt · magic — bolts that pierce armour and leave burns,
        chills, curses, silence · support — healing and rallying the monsters around it, hardening its own hide ·
        status — stunning slams, poisoned bites, bleeding claws, webs and coils that root you · a maul and a wing gale (v283: no jumps).
      Ranged and caster species keep their distance; brutes charge in. */
'use strict';

/* ---------- 1) the damage scale ---------- */
const DSK = lv => 1 + 9 * Math.pow(clamp(lv || 1, 1, LV_MAX) / 300, 2.2);
for (const k in MOB){ const d = MOB[k]; if (!d || !d.hp || d.dsk || k === 'dummy' || k === 'crowncrystal') continue; d.hp = Math.round(d.hp * DSK(d.lvl) * (d.boss ? 1 : .75)); d.dsk = true; }
if (typeof wbDef === 'function'){ const _wb = wbDef; wbDef = function(){ const d = _wb.apply(this, arguments); if (d && !d.dsk){ d.hp = Math.round(d.hp * DSK(d.lvl)); d.dsk = true; } return d; }; }
{ const _ad = applyDamage;
  applyDamage = function(m, res, sk){
    if (m && !m.pvp && !m.dead && res && res.dmg > 0 && !res.dsk){ const k = res.pet && typeof PD === 'function' && PD() ? DSK(PD().lv) : DSK(S.lvl); res = {...res, dmg:Math.max(1, Math.round(res.dmg * k)), dsk:true}; }
    return _ad.call(this, m, res, sk); }; }

/* ---------- 2) no running away ---------- */
EV.on('tick', () => { for (const m of mobs) if (m.fleeT > 0){ m.fleeT = 0; m.aggro = true; } });

/* ---------- 3) monster skills ---------- */
const MSK = {
  // ranged
  spit:{th:'พ่นพิษ', en:'Venom Spit', kind:'shot', r:190, cd:7, shot:'dart', mul:.9, af:['poison', 5]},
  volley:{th:'ระดมขนนก', en:'Feather Volley', kind:'volley', r:200, cd:9, shot:'arrow', mul:.55, n:3},
  snare:{th:'ศรตรึง', en:'Snare Arrow', kind:'shot', r:230, cd:10, shot:'arrow', mul:.8, af:['root', 1.6]},
  bolt:{th:'ศรเวท', en:'Arcane Bolt', kind:'shot', r:200, cd:6, mul:1.25, magic:true},
  // magic
  nova:{th:'ระเบิดธาตุ', en:'Elemental Nova', kind:'circle', r:240, cd:12, area:70, mul:1.5, magic:true, atPlayer:true},
  hex:{th:'คำสาป', en:'Hex', kind:'shot', r:220, cd:13, shot:'dark', mul:.6, magic:true, af:['curse', 5]},
  hush:{th:'มนตร์ใบ้', en:'Hush', kind:'shot', r:200, cd:15, shot:'dark', mul:.5, magic:true, af:['silence', 3]},
  // support
  mend:{th:'รักษาพวกพ้อง', en:'Mend Kin', kind:'heal', r:260, cd:11, heal:.18},
  rally:{th:'ปลุกใจฝูง', en:'Rally', kind:'rally', r:260, cd:18, dur:8, amt:.3},
  harden:{th:'ผิวศิลา', en:'Harden', kind:'harden', r:999, cd:16, dur:6, amt:.4},
  // status
  slam:{th:'กระแทกสลบ', en:'Stunning Slam', kind:'circle', r:70, cd:10, area:62, mul:1.3, stun:1.1},
  bite:{th:'กัดพิษ', en:'Venom Bite', kind:'melee', r:60, cd:8, mul:1.2, af:['poison', 6]},
  rend:{th:'ข่วนเลือด', en:'Rend', kind:'melee', r:60, cd:8, mul:1.25, af:['bleed', 5]},
  web:{th:'ใยรัด', en:'Web', kind:'shot', r:200, cd:11, shot:'dart', mul:.4, af:['root', 2.2]},
  coil:{th:'รัดพัน', en:'Coil', kind:'melee', r:70, cd:12, mul:.9, af:['root', 1.8]},
  frost:{th:'ลมหนาว', en:'Chill', kind:'shot', r:200, cd:9, shot:'ice', mul:.8, magic:true, af:['slow', 4]},
  blind:{th:'ฝุ่นตาพร่า', en:'Blinding Dust', kind:'circle', r:80, cd:12, area:70, mul:.5, af:['blind', 4]},
  // movement
  // (v283) the owner: no monster jumps at the hero. The pounce and the dive became ground moves with the same numbers
  maul:{th:'ตะปบ', en:'Maul', kind:'melee', r:60, cd:9, mul:1.4},
  gale:{th:'ลมปีกบาด', en:'Wing Gale', kind:'circle', r:90, cd:9, area:70, mul:1.0, af:['bleed', 3]}
};
const MSK_ELEM_AF = {fire:['burn', 4], water:['slow', 3], wind:['bleed', 3], earth:['root', 1.2], holy:['blind', 3], shadow:['curse', 4], poison:['poison', 5], undead:['curse', 4], ghost:['silence', 2], neutral:null};
const MSK_SHOT = {fire:'fire', water:'ice', holy:'holy', wind:'bolt', shadow:'dark', undead:'dark', ghost:'dark', poison:'dart', earth:'dart', neutral:'dark'};
/* which skills a species gets: from its body (or weapon), then its race */
function mskFor(k){
  const d = MOB[k]; if (!d || d.boss) return []; const a = d.nature || 'quad', wp = d.natWp, race = d.race, out = [];
  const byBody = {quad:['maul', 'rend'], rock:['slam', 'harden'], squat:['slam', 'blind'], slime:['spit', 'mend'], bug:['web', 'bite'], bird:['gale', 'volley'],
    serpent:['spit', 'coil'], floater:['nova', 'hex']}[a] || ['rend'];
  const byWeapon = {sword:['rend', 'slam'], bow:['snare', 'volley'], staff:['bolt', 'mend'], fist:['slam', 'maul']}[wp];
  out.push(...(byWeapon || byBody));
  if (a === 'bug' && typeof SPECIES !== 'undefined'){ const r = SPECIES.find(x => x[0] === k); if (r && /^(hornet|wasp|bee)$/.test(r[5].kind || '')) out[0] = 'bite'; }   // (v274) hornets and wasps sting, no webs · (v283) a sting, not a dive
  const lv = d.lvl || 1, i = Object.keys(MOB).indexOf(k);
  if (race === 'undead' || race === 'demon') out[1] = i % 2 ? 'hex' : 'hush';
  else if (race === 'angel') out[1] = 'mend';
  else if (race === 'plant' && a !== 'floater') out[1] = i % 2 ? 'web' : 'mend';
  else if (d.elem === 'water' && i % 3 === 0) out[1] = 'frost';
  if (a === 'quad' && i % 4 === 0) out[1] = 'rally';
  return lv < 8 ? out.slice(0, 1) : out.slice(0, 2);
}
for (const k in MOB){ const d = MOB[k]; if (d && !d.boss && k !== 'dummy' && k !== 'crowncrystal') d.msk = mskFor(k); }

/* telegraph + effect */
const mskName = (m, s) => { addText(m.x, m.y - (MOB_H[m.type] || 30) - 16, L(s.th, s.en), s.kind === 'heal' || s.kind === 'rally' || s.kind === 'harden' ? '#b8ffc8' : '#ffb070', 13); };
const mskOk = m => !m.dead && !m.vanish && !(m.st && (m.st.stun > 0 || m.st.freeze > 0 || m.st.stop > 0)) && !m.dummy;
const mskDot = () => Math.max(1, Math.round(DER.maxhp * .012));
function mskHit(m, s, mul){ if (P.dead || !mskOk(m)) return; mobAttack(m, mul, !!s.magic); if (!MOB_HIT_LANDED) return;   // (v291) missed, dodged or absorbed: no bleed, poison, burn or stun either
  const af = s.af || (s.magic ? MSK_ELEM_AF[m.def.elem] : null); if (af && !P.dead && typeof afflict === 'function' && Math.random() < (s.af ? .75 : .45)) afflict(af[0], af[1], {dps:mskDot(), amt:.35});
  if (s.stun && !P.roll && !(P.stunT > 0)){ P.stunT = s.stun; P.cast = null; VFX.play('stunStars', {}); } }
function mskShot(m, s, mul, delay = 0){ later(delay, () => { if (!mskOk(m) || P.dead) return; const h = (MOB_H[m.type] || 30) * .55, d = Math.hypot(P.x - m.x, P.y - m.y), t = d / 280;
  VFX.play('mobShot', {x:m.x, y:m.y - h, tx:P.x, ty:P.y - 20, t, kind:s.shot || MSK_SHOT[m.def.elem] || 'dark'});
  later(t, () => { if (!P.roll && Math.hypot(P.x - m.x, P.y - m.y) < s.r + 90) mskHit(m, s, mul); }); }); }
function mskCast(m, id){
  const s = MSK[id], near = r => mobs.filter(o => !o.dead && !o.vanish && !o.def.boss && o !== m && Math.hypot(o.x - m.x, o.y - m.y) < r);
  mskName(m, s); m.lunge = .25; m.dir = SPR.dirFromVec(P.x - m.x, P.y - m.y);
  if (s.kind === 'shot') mskShot(m, s, s.mul, .45);
  else if (s.kind === 'volley') for (let i = 0; i < s.n; i++) mskShot(m, s, s.mul, .4 + i * .18);
  else if (s.kind === 'melee') later(.4, () => { if (mskOk(m) && Math.hypot(P.x - m.x, P.y - m.y) < s.r + 20 && !P.roll) mskHit(m, s, s.mul); });
  else if (s.kind === 'circle'){ const x = s.atPlayer ? P.x : m.x, y = s.atPlayer ? P.y : m.y; VFX.play('warnCircle', {x, y, r:s.area, t:.9});
    later(.9, () => { if (!mskOk(m)) return; VFX.play(s.magic ? 'boom' : 'quake', {x, y, r:s.area}); if (inHit(x, y, s.area) && !P.roll) mskHit(m, s, s.mul); }); }
  else if (s.kind === 'heal'){ const who = [m, ...near(s.r)].filter(o => o.hp < o.maxhp).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] || m;
    later(.5, () => { if (!mskOk(m) || who.dead) return; const h = Math.round(who.maxhp * s.heal); who.hp = Math.min(who.maxhp, who.hp + h); VFX.play('heal', {x:who.x, y:who.y}); addText(who.x, who.y - (MOB_H[who.type] || 30) - 4, `+${fmtN(h)}`, '#9cffb0', 13); }); }
  else if (s.kind === 'rally') later(.4, () => { for (const o of [m, ...near(s.r)]){ o.rallyT = T + s.dur; o.aggro = true; } VFX.play('roar', {x:m.x, y:m.y}); });
  else if (s.kind === 'harden') later(.3, () => { m.hardT = T + s.dur; VFX.play('barrier', {}); });
}
/* rallied monsters hit harder; hardened ones take less */
{ const _ma = mobAttack; mobAttack = function(m, mult = 1, noDodge){ if (m && m.rallyT > T) mult *= 1 + MSK.rally.amt; return _ma.call(this, m, mult, noDodge); }; }
{ const _ad = applyDamage; applyDamage = function(m, res, sk){ if (m && m.hardT > T && res && res.dmg > 0) res = {...res, dmg:Math.max(1, Math.round(res.dmg * (1 - MSK.harden.amt)))}; return _ad.call(this, m, res, sk); }; }
/* the brain: an angry monster near you uses a ready skill now and then */
EV.on('tick', dt => {
  if (!S || P.dead || (typeof GM !== 'undefined' && GM.on && GM.inv)) return;
  for (const m of mobs){
    const d = m.def; if (!d || !d.msk || !d.msk.length || !m.aggro || !mskOk(m) || m.minion && Math.random() < .5 || m.foe === (typeof PET !== 'undefined' ? PET : null)) continue;
    const dist0 = Math.hypot(P.x - m.x, P.y - m.y); if (dist0 > 280) continue;
    m.mskCd = m.mskCd || {}; if ((m.mskGap || 0) > T) continue;
    for (const id of d.msk){ const s = MSK[id]; if ((m.mskCd[id] || 0) > T) continue;
      const need = s.kind === 'heal' ? mobs.some(o => !o.dead && !o.def.boss && Math.hypot(o.x - m.x, o.y - m.y) < s.r && o.hp < o.maxhp * .6) : s.kind === 'harden' ? m.hp < m.maxhp * .7 : s.kind === 'rally' ? true : dist0 <= s.r;
      if (!need || Math.random() > dt * 1.4) continue;
      m.mskCd[id] = T + s.cd * rand(.85, 1.2); m.mskGap = T + 2.2; mskCast(m, id); break; }
  }
});
/* ranged and casting kinds keep their distance */
{ const near = m => m.def && m.def.msk && m.def.msk.some(id => ['shot', 'volley'].includes(MSK[id].kind)) && (m.def.range || 0) > 0;
  EV.on('tick', dt => { for (const m of mobs){ if (m.dead || !m.aggro || !near(m) || m.def.boss || !mskOk(m)) continue; const dx = m.x - P.x, dy = m.y - P.y, l = Math.hypot(dx, dy) || 1;
      if (l < 70 && !(m.st && m.st.root > 0)){ m.x += dx / l * 40 * dt; m.y += dy / l * 40 * dt; } } }); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'balance30', t:['สเกลดาเมจและสกิลมอนสเตอร์', 'Damage scale and monster skills'], b:() => `<p>${L('ดาเมจโตแรงขึ้นมากตามเลเวล (HP มอนโตตามเลเวลของมันเช่นกัน) · ตัวละครเลเวลสูงที่ของครบตีมอนธรรมดาได้หลักแสน สกิลถึงหลักล้าน · PvP ไม่ขยาย · มอนไม่หนีแล้ว · มอนทุกชนิดมีสกิลตามร่างกาย อาวุธ ธาตุ และเผ่า: ยิงระยะไกล เวทเจาะเกราะ ฮีล/ปลุกใจพวก สถานะ (สลบ พิษ เลือดไหล ตรึง ช้า ตาพร่า คำสาป ใบ้) และกระโจน · มีวงเตือนสีแดงก่อนสกิลพื้นที่', 'Damage grows a lot with level (monster HP grows with its level too) · a fully geared high-level hero hits ordinary monsters for hundreds of thousands, skills up to a million · PvP is not scaled · monsters no longer run · every species has skills by body, weapon, element and race: ranged shots, armour-piercing spells, healing/rallying kin, statuses (stun, poison, bleed, root, slow, blind, curse, silence) and pounces · area skills show a red warning circle first')}</p>`});

/* ---------- 4) every species has a strong point (and pays for it) ----------
   evasive หลบเก่ง: 20% of non-critical physical hits miss · HP −10%
   swift ว่องไว: attacks 30% faster, moves 30% faster · HP −15%
   brute ช้าแต่แรง: hits 45% harder, attacks and moves slower
   critproof ต้านคริ: critical hits on it do only a third of their extra damage
   armored เกราะหนา: physical damage −30%, magic +15%
   warded ต้านเวท: magic damage −35%, physical +10%
   tough อึด: HP +35%, hits 10% softer
   regen ฟื้นตัว: recovers 0.8% HP a second
   Picked from what the creature is (rocks and turtles armoured, spirits warded, birds and cats evasive or swift …); about one
   species in six has none. Bosses keep their own design. Shown on the target frame. */
const MTRAIT = {evasive:['หลบเก่ง', 'Evasive', '#9fd8ff'], swift:['ว่องไว', 'Swift', '#7dffb0'], brute:['ช้าแต่แรง', 'Brute', '#ff8a6a'], critproof:['ต้านคริ', 'Crit-proof', '#e8e0ff'],
  armored:['เกราะหนา', 'Armoured', '#c8b890'], warded:['ต้านเวท', 'Warded', '#c9a0ff'], tough:['อึด', 'Tough', '#ffcf6a'], regen:['ฟื้นตัว', 'Regenerates', '#9cffb0']};
const MTRAIT_BY = {rock:['armored', 'tough', 'critproof'], squat:['armored', 'tough', 'regen'], slime:['regen', 'warded', 'critproof'], floater:['warded', 'evasive', 'critproof'],
  bird:['evasive', 'swift', 'swift'], bug:['armored', 'swift', 'critproof'], serpent:['evasive', 'swift', 'regen'], quad:['swift', 'brute', 'tough'], human:['brute', 'evasive', 'warded']};
for (const k in MOB){ const d = MOB[k]; if (!d || d.boss || !d.lvl || k === 'dummy' || k === 'crowncrystal' || d.trait !== undefined) continue;
  let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; const pool = MTRAIT_BY[d.nature || 'quad'] || MTRAIT_BY.quad;
  const t = d.lvl < 6 || h % 6 === 0 ? null : pool[h % pool.length]; d.trait = t;
  if (t === 'evasive') d.hp = Math.round(d.hp * .9);
  else if (t === 'swift'){ d.hp = Math.round(d.hp * .85); d.delay = +(d.delay * .7).toFixed(2); d.speed = Math.round(d.speed * 1.3); }
  else if (t === 'brute'){ d.atk = d.atk.map(v => Math.round(v * 1.45)); d.delay = +(d.delay * 1.3).toFixed(2); d.speed = Math.round(d.speed * .85); }
  else if (t === 'tough'){ d.hp = Math.round(d.hp * 1.35); d.atk = d.atk.map(v => Math.round(v * .9)); } }
{ const _pd = physDamage;
  physDamage = function(m, mult, elem){ const r = _pd.apply(this, arguments), t = m && m.def && m.def.trait; if (!t || !r || r.miss) return r;
    if (t === 'evasive' && !r.crit && Math.random() < .2) return {miss:true};
    if (t === 'critproof' && r.crit && DER.critDmg > 1) return {...r, dmg:Math.max(1, Math.round(r.dmg / DER.critDmg * (1 + (DER.critDmg - 1) / 3)))};
    if (t === 'armored') return {...r, dmg:Math.max(1, Math.round(r.dmg * .7))};
    if (t === 'warded') return {...r, dmg:Math.round(r.dmg * 1.1)};
    return r; }; }
{ const _md = magicDamage;
  magicDamage = function(m, mult, elem){ const r = _md.apply(this, arguments), t = m && m.def && m.def.trait; if (!t || !r) return r;
    if (t === 'armored') return {...r, dmg:Math.round(r.dmg * 1.15)};
    if (t === 'warded') return {...r, dmg:Math.max(1, Math.round(r.dmg * .65))};
    return r; }; }
EV.on('tick', dt => { for (const m of mobs) if (!m.dead && m.def && m.def.trait === 'regen' && m.hp < m.maxhp){ m.rgAcc = (m.rgAcc || 0) + m.maxhp * .008 * dt; if (m.rgAcc >= 1){ const h = Math.floor(m.rgAcc); m.rgAcc -= h; m.hp = Math.min(m.maxhp, m.hp + h); } } });
if (typeof tsChips === 'function'){ const _ts = tsChips; tsChips = function(m){ const out = _ts.apply(this, arguments), t = m && m.def && m.def.trait; if (t && MTRAIT[t]) out.unshift([L(MTRAIT[t][0], MTRAIT[t][1]), MTRAIT[t][2]]); return out; }; }

/* (v283) the v276 jump (mskLeap) is gone: the owner did not want monsters leaping at the hero */
