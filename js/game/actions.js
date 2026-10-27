/* VAYRATHEN — js/game/actions.js
   Movement actions shared by every job: dodge roll, riding the golden deer, capturing a pet. */
'use strict';

const MOVES = {
  roll:    {cd:1.2, dur:.43, dist:70},
  ride:    {speed:1.7},
  capture: {range:Infinity, hpMax:.3, dur:.2, base:45},   // no distance limit, no long wait (2026-10-17)
  pet:     {expBonus:.05}
};
const PET = {x:0, y:0, dir:0, moving:false, t:0, atkCd:1, target:null};

const dirVec = d => { const a = (90 + d * 45) * Math.PI / 180; return [Math.cos(a), Math.sin(a)]; };

function doRoll(){
  if (P.dead || P.roll || P.cast || (P.cds.roll || 0) > 0) return;
  if (P.ride){ toast(L('ลงจากพาหนะก่อนจึงกลิ้งได้', 'Dismount before rolling')); return; }
  let vx, vy;
  if (P.tx != null && Math.hypot(P.tx - P.x, P.ty - P.y) > 4){ const d = Math.hypot(P.tx - P.x, P.ty - P.y); vx = (P.tx - P.x) / d; vy = (P.ty - P.y) / d; }
  else [vx, vy] = dirVec(P.dir || 0);
  P.sit = false; P.pending = null; P.target = null; P.npc = null;
  P.roll = {t:0, vx, vy}; P.dir = SPR.dirFromVec(vx, vy); P.cds.roll = MOVES.roll.cd; P.act = null;
}
function updRoll(dt){
  const r = P.roll; r.t += dt;
  const k = 1 - Math.min(1, r.t / MOVES.roll.dur), spd = MOVES.roll.dist / MOVES.roll.dur * (0.55 + k * .9);
  P.x += r.vx * spd * dt; P.y += r.vy * spd * dt; pushOut(P, 10);
  if (r.t >= MOVES.roll.dur){ P.roll = null; P.tx = null; }
}
function toggleRide(){
  if (P.dead || P.roll || P.cast) return;
  P.sit = false;
  P.ride = !P.ride; P.act = null;
  if (P.ride){ P.target = null; P.pending = null; toast(S.job === 'warlord' ? L('ขึ้นช้างศึก', 'Mounted the war elephant') : L('ขึ้นขี่กวางทอง · เร็วขึ้น 70%', 'Riding the golden deer · 70% faster')); }
  else toast(L('ลงจากพาหนะ', 'Dismounted'));
  renderHotbar();
}
function tryCapture(){
  if (P.dead || P.roll || P.cast || P.capT > 0) return;
  const t = P.target;
  if (!t || t.dead){ toast(L('เลือกมอนสเตอร์ที่จะจับก่อน', 'Pick a monster to capture first')); return; }
  if (t.wb){ toast(L('World Boss จับไม่ได้', 'The World Boss cannot be captured')); return; }   // every other boss can be caught (the region boss too)
  if (t.hp / t.maxhp > MOVES.capture.hpMax){ toast(L(`ทำให้ HP เหลือไม่เกิน ${MOVES.capture.hpMax * 100}% ก่อน`, `Bring its HP to ${MOVES.capture.hpMax * 100}% or less first`)); return; }
  if (dist(P, t) > MOVES.capture.range + t.def.r){ toast(L('เข้าใกล้อีกนิด', 'Get a little closer')); return; }
  if (P.ride) P.ride = false;
  P.sit = false; P.capT = MOVES.capture.dur; P.capTarget = t; P.act = null; P.dir = SPR.dirFromVec(t.x - P.x, t.y - P.y);
  t.stunT = MOVES.capture.dur + .2;
}
function resolveCapture(){
  const t = P.capTarget; P.capTarget = null;
  if (!t || t.dead) return;
  const chance = MOVES.capture.base + DER.b.luk * .5 + (1 - t.hp / t.maxhp) * 30 + (t.def.boss && DER.pas.bossCapture ? 15 : 0);
  if (Math.random() * 100 < chance){
    t.dead = true; t.deadT = 0; t.vanish = true; if (P.target === t) P.target = null;
    if (t === boss){ boss = null; if (typeof BCK !== 'undefined') BCK.kill[MAP_ID] = typeof wNow === 'function' ? wNow() : Date.now(); if (typeof mvpWrite === 'function' && typeof mvpIsMapBoss === 'function' && mvpIsMapBoss(t)) mvpWrite(t.type, {up:false, at:Date.now(), map:MAP_ID}); }   // a caught region boss counts as gone: its 15-min clock starts
    if (typeof bump === 'function'){ bump('captures'); EV.emit('capture', t.type); }
    S.pet = t.type; PET.x = t.x; PET.y = t.y; PET.dir = t.dir || 0;
    banner(L(`จับ${nm(t.def)}ได้แล้ว! มาเป็น Pet`, `Captured ${nm(t.def)}! It is now your pet`)); log(L(`ได้ Pet: ${nm(t.def)} (EXP +${MOVES.pet.expBonus * 100}%)`, `New pet: ${nm(t.def)} (EXP +${MOVES.pet.expBonus * 100}%)`), 'g');
    fx.push({k:'heal', x:t.x, y:t.y, t:0, life:.8}); save(); dirty = true;
  } else {
    t.aggro = true; addText(t.x, t.y - MOB_H[t.type] - 6, L('ดิ้นหลุด!', 'Broke free!'), '#ffb0a8', 14);
  }
}
function releasePet(){ if (!S.pet) return; log(L(`ปล่อย${nm(MOB[S.pet])}กลับสู่ทุ่ง`, `Released ${nm(MOB[S.pet])} back to the wild`)); S.pet = null; dirty = true; save(); }
function updPet(dt){
  if (!S.pet) return;
  PET.t += dt;
  const [fx0, fy0] = dirVec(P.dir || 0), tx = P.x - fx0 * 26 + 14, ty = P.y - fy0 * 18 + 6;
  const d = Math.hypot(tx - PET.x, ty - PET.y);
  if (d > 300){ PET.x = tx; PET.y = ty; }
  PET.moving = d > 6;
  if (PET.moving) moveTo(PET, tx, ty, Math.min(220, (P.ride ? SPEED * MOVES.ride.speed : SPEED) * (d > 60 ? 1.4 : 1.05)), dt);
  else PET.dir = SPR.dirFromVec(P.x - PET.x, P.y - PET.y);
  // Beast Training / Wild Kin: the pet joins the fight on the player's target
  const pa = DER.pas.petAtk || 0; PET.atkCd -= dt;
  const t = P.target && !P.target.dead && dist(P.target, PET) < 200 ? P.target : null; PET.target = t;
  if (pa && t && PET.atkCd <= 0){
    PET.atkCd = 1.5; PET.dir = SPR.dirFromVec(t.x - PET.x, t.y - PET.y);
    const mul = pa * (P.petBuff > 0 ? 1.3 : 1), bite = () => { if (!t.dead){ applyDamage(t, physDamage(t, mul)); VFX.play('clawHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, small:true}); } };
    bite(); if (DER.pas.petTwin) later(.25, bite);
  }
}
