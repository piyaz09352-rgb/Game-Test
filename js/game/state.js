/* VAYRATHEN — js/game/state.js */
'use strict';

/* ---------- state ---------- */
function newS(){
  return {v:2,lvl:1,jlvl:1,exp:0,jexp:0,job:'novice',stats:{str:1,agi:1,vit:1,int:1,dex:1,luk:1},
    statPts:48,skPts:0,skills:{},hot:[null,null,null,null,null,null],inv:{redpot:6},cards:{},slots:{weapon:null,armor:null,head:null},
    refine:0,bia:500,hp:40,sp:11,x:1210,y:820,vxv:1,worldT:0,pet:null,map:0,visited:{0:1},gear:{armor:null,head:null,ammo:null,weapon:null,acc:null},look:{sex:'m',hair:0,color:''}};
}
let S = newS();
let DER = null;
const LOG = [];
const P = {buffs:{},lastStandCd:0,orbT:3,regenT:0,petBuff:0,roll:null,ride:false,capT:0,capTarget:null,skillAnim:0,x:1210,y:820,tx:null,ty:null,target:null,npc:null,face:1,dir:0,act:'idle',animT:0,atkAnim:0,sit:false,moving:false,atkCd:0,swing:0,cast:null,pending:null,acd:0,acdMax:0,dead:false,deadT:0,rH:0,rS:0,cds:{},itemCd:0,fx:0};
let mobs = [], spawnSlots = [], projs = [], fx = [], texts = [];
let T = 0, bossTimer = 90, boss = null, lastNight = null, lastEvent = null, mobId = 0;
let hoverMob = null, toastMsg = '', toastT = 0, bannerT = 0;
let dirty = true, saveT = 0;

/* ---------- derived stats ---------- */
const slotHas = c => Object.values(S.slots).includes(c);
const skl = id => S.skills[id] || 0;
/* old saves (v1) had the 7-skill prototype set: refund every Skill Point under the new tables */
function migrateSave(s){
  for (const id in s.skills || {}){ const sk = SKILLS[id]; if (!sk){ s.skPts += s.skills[id]; delete s.skills[id]; continue; } if (s.skills[id] > sk.max){ s.skPts += s.skills[id] - sk.max; s.skills[id] = sk.max; } }
  if ((s.v || 1) >= 2) return s;
  let pts = 0; for (let j = JOBS[s.job] ? s.job : 'novice', first = true; j; j = JOBS[j].parent, first = false) pts += first ? s.jlvl - 1 : tierPoints(j);
  s.skills = {}; s.skPts = pts; s.hot = [null, null, null, null, null, null]; s.v = 2;
  return s;
}
/* sum of every learned passive's effect */
function passives(){
  const o = {};
  for (const id of ownedSkillIds()){ const sk = SKILLS[id], lv = skl(id); if (!lv || !sk.pas) continue; const e = sk.pas(lv); for (const k in e) o[k] = (o[k] || 0) + e[k]; }
  return o;
}
/* (v100) attack speed: (200 − ASPD) ÷ 50 seconds between attacks · 150 → 1.0 s · 180 → 0.4 s · 190 (the cap) → 0.2 s.
   Stats alone stop at ASPD_STAT; flat ASPD from gear options and cards takes it the rest of the way (js/sys/bosshard.js). */
const ASPD_CAP = 190, ASPD_STAT = 180;
const aspdIv = a => +Math.max(.2, (200 - Math.min(ASPD_CAP, a)) / 50).toFixed(3);
const ivAspd = iv => Math.min(ASPD_CAP, Math.round(200 - iv * 50));
function derive(){
  const j = JOBS[S.job], b = {...S.stats}, pas = passives();
  const bonus = {str:0,agi:0,vit:0,int:0,dex:0,luk:0};
  // c_boss (Golden Jelly King card) now drains HP and SP instead of +3 stats: see js/sys/cardjelly.js
  if (slotHas('c_dew')) bonus.luk += 1;
  if (slotHas('c_boar')) bonus.vit += 2;
  bonus.dex += pas.dex || 0;
  // worn gear and boss cards (generic bonuses)
  const G = {def:0, mdef:0, hp:0, sp:0, hpPct:0, spPct:0, atkPct:0, matkPct:0, crit:0, atk:0}, race = {};
  const addB = st => { if (!st) return; for (const k in st){ if (k === 'race'){ for (const r in st.race) race[r] = (race[r] || 0) + st.race[r]; continue; } if (k === 'all') for (const s in bonus) bonus[s] += st.all; else if (k in bonus) bonus[k] += st[k]; else if (k in G) G[k] += st[k]; } };
  const gear = S.gear || {}; for (const sl in gear) if (gear[sl] && ITEMS[gear[sl]]) addB(ITEMS[gear[sl]].st);
  for (const sl in S.slots) if (S.slots[sl] && CARDS[S.slots[sl]] && CARDS[S.slots[sl]].bonus) addB(CARDS[S.slots[sl]].bonus);
  for (const k in b) b[k] += bonus[k];
  const wIt = gear.weapon && ITEMS[gear.weapon] && ITEMS[gear.weapon].wtype === j.weapon.type ? ITEMS[gear.weapon].st : null;
  const L0 = S.lvl, wt = j.weapon.type, wAtk = (wIt ? wIt.watk : j.weapon.atk) + G.atk * (wt === 'bow' ? 1 : 0) + (wIt || wt === 'staff' ? 0 : (S.refine || 0) * 5) + (wt === 'sword' ? pas.atkFlat || 0 : 0) + (wt === 'fist' ? pas.fistAtk || 0 : 0) + (wt === 'dagger' ? pas.daggerAtk || 0 : 0);
  let atk = j.ranged
    ? b.dex * 2 + Math.floor(b.str / 5) + Math.floor(b.luk / 5) + wAtk
    : b.str * 2 + Math.floor(b.dex / 5) + Math.floor(b.luk / 5) + wAtk;
  atk = Math.round(atk * (1 + (pas.atkPct || 0) + G.atkPct));
  let matk = Math.floor(b.int * 2.5) + Math.floor(b.int / 9) ** 2 +   // was INT×2 + (INT/7)²: stronger early, flatter late
     (wIt && wIt.wmatk ? wIt.wmatk : j.weapon.matk || 0) + (j.weapon.type === 'staff' && !wIt ? (S.refine || 0) * 5 : 0) +
     (wt === 'shuriken' ? (!wIt ? (S.refine || 0) * 5 : 0) + (gear.ammo && ITEMS[gear.ammo] && ITEMS[gear.ammo].st && ITEMS[gear.ammo].st.star ? ITEMS[gear.ammo].st.smatk || 0 : 0) : 0);   // (v184) the stars in the pouch add their MATK
  matk = Math.round(matk * (1 + (pas.matkPct || 0) + G.matkPct));
  let maxhp = (35 + L0 * 9 * j.hp) * (1 + b.vit / 100);
  if (slotHas('c_dew')) maxhp += 200;
  if (slotHas('c_boar')) maxhp *= 1.05;
  maxhp = (maxhp + G.hp) * (1 + (pas.hpPct || 0) + G.hpPct);
  const maxsp = ((10 + L0 * j.sp) * (1 + b.int / 100) + G.sp) * (1 + (pas.spPct || 0) + G.spPct);
  // (v55) AGI/DEX give less and less (stats alone stop at ASPD_STAT); gear options and cards push it the rest of the way to ASPD_CAP
  const aspd = Math.min(ASPD_STAT, 200 - j.delay * (1 - Math.min(.6, (b.agi * 3 + b.dex) / (1000 + b.agi * 3 + b.dex) * 1.1)));
  DER = {
    b, bonus, pas, race, atk, matk, maxhp:Math.round(maxhp), maxsp:Math.round(maxsp),
    hit:175 + L0 + b.dex, flee:100 + L0 + b.agi + (pas.flee || 0), crit:+(1 + b.luk * .3 + (pas.crit || 0) + G.crit).toFixed(1), critDmg:1.5 + (pas.critDmg || 0),
    aspd:Math.round(aspd), interval:aspdIv(aspd),
    def:Math.floor(b.vit / 2) + 4 + (pas.def || 0) + G.def,
    mdef:Math.floor(b.int / 2) + G.mdef,
    castMul:Math.max(.25, 1 - (b.dex * 2 + b.int) / 400) * Math.max(.2, 1 - (pas.castPct || 0)),
    range:j.range + (j.ranged ? pas.range || 0 : 0),
    move:1 + (pas.move || 0),
    welem:slotHas('c_lantern') ? 'holy' : ((wt === 'bow' || wt === 'shuriken') && gear.ammo && ITEMS[gear.ammo] && !!ITEMS[gear.ammo].st.star === (wt === 'shuriken')) ? ITEMS[gear.ammo].st.elem : 'neutral'
  };
  S.hp = Math.min(S.hp, DER.maxhp); S.sp = Math.min(S.sp, DER.maxsp);
}
