/* VAYRATHEN — js/sys/petevo.js — (v86) pets grow with you and evolve (สายสัมพันธ์ · วิวัฒนาการ)
   Pets never pick anything up: they fight beside you and lift you.
   · Bond (สายสัมพันธ์): every monster near your level (or above) you defeat with your pet out adds 1, a region boss 15.
     Each pet keeps its own bond, also while it waits in the roster.
   · Bond 300 → ร่างตื่น (Awakened): HP/ATK/DEF ×1.25, a little bigger, a calm ring under it; while it is up your
     damage is +5%.
   · Bond 1200 → ร่างเทพ (Divine): HP/ATK/DEF ×1.6, bigger again; your damage +10% and monsters hit you 6% softer,
     and in a fight it casts Bond Blessing on you every 30 s (ATK +12%, damage taken −8% for 10 s).
   Counting runs on the kill event; the ring is one plain ellipse (no blinking); nothing new runs per frame but a timer. */
'use strict';

const PEVO = {need:[0, 300, 1200], mul:[1, 1.25, 1.6], size:[1, 1.12, 1.25], ring:[null, '#7dd3a8', '#ffd36b'],
  th:['ร่างปกติ', 'ร่างตื่น', 'ร่างเทพ'], en:['Base form', 'Awakened', 'Divine'], bless:0};
const petStage = p => (!p ? 0 : (p.bd || 0) >= PEVO.need[2] ? 2 : (p.bd || 0) >= PEVO.need[1] ? 1 : 0);
const petStageNow = () => { const p = PD(); return p && !(PET.down > 0) ? petStage(p) : 0; };
{ const _ps = petStats; petStats = function(p){ const r = _ps.apply(this, arguments) || p; const k = PEVO.mul[petStage(p)];
    if (k > 1){ p.mhp = Math.round(p.mhp * k); p.atk = Math.round(p.atk * k); p.def = Math.round(p.def * k); } return r; }; }
function petBond(n){
  const p = PD(); if (!p || PET.down > 0) return; const s0 = petStage(p); p.bd = (p.bd || 0) + n; dirty = true;
  const s1 = petStage(p); if (s1 === s0) return;
  const f = PET.hp != null && p.mhp ? PET.hp / p.mhp : 1; petStats(p); PET.hp = Math.round(p.mhp * f);
  banner(L(`✨ ${petName(p)} วิวัฒนาการเป็น${PEVO.th[s1]}!`, `✨ ${petName(p)} evolved: ${PEVO.en[s1]}!`));
  log(L(`${petName(p)} ${PEVO.th[s1]}: ค่าพลัง ×${PEVO.mul[s1]} · ${s1 === 2 ? 'ดาเมจคุณ +10% · มอนตีเบาลง 6% · ร่ายพรผูกพันทุก 30 วิ' : 'ดาเมจคุณ +5%'}`,
    `${petName(p)} ${PEVO.en[s1]}: stats ×${PEVO.mul[s1]} · ${s1 === 2 ? 'your damage +10% · monsters hit 6% softer · Bond Blessing every 30 s' : 'your damage +5%'}`), 'g');
  VFX.play('jobChange', {x:PET.x, y:PET.y}); SFX.play('drop3'); save();
}
EV.on('kill', m => { if (!m || !m.def || m.pvp || m.dummy || m.minion) return; const d = m.def;
  if (d.boss) petBond(15); else if (d.lvl >= S.lvl - 15) petBond(1); });
/* what the evolved pet gives you */
HK.outMul.push(mult => { const s = petStageNow(); return s ? mult * (1 + (s === 2 ? .1 : .05)) : mult; });
HK.atkMul.push((m, mult) => (petStageNow() === 2 ? mult * .94 : mult));
EV.on('tick', dt => { if ((PEVO.bless -= dt) > 0 || petStageNow() !== 2 || P.dead) return;
  const fight = (P.target && !P.target.dead && !P.target.pvp) || (typeof petTarget === 'function' && petTarget()); if (!fight){ PEVO.bless = 1; return; }
  PEVO.bless = 30; addBuff('pet_bless', {t:10, atkPct:.12, dmgRed:.08});
  addText(PET.x, PET.y - (MOB_H[S.pet] || 26) - 14, L('พรผูกพัน', 'Bond Blessing'), '#ffd36b', 13); VFX.play('heal', {x:P.x, y:P.y}); });
/* a bigger body and a calm ring for an evolved pet */
{ const _dp = drawPetW; drawPetW = function(g){ const p = PD(), s = petStage(p); if (!s || !S.pet || !SHEETS[S.pet]) return _dp.apply(this, arguments);
    const x = PET.x - cam.x, y = PET.y - cam.y, r = (MOB[S.pet].r || 14) * 1.15 * PEVO.size[s], a0 = g.globalAlpha;
    g.globalAlpha = a0 * (PET.down > 0 ? .25 : .55); g.strokeStyle = PEVO.ring[s]; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r, r * .38, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = a0;
    const m = g.getTransform(), k = PEVO.size[s]; g.translate(x, y); g.scale(k, k); g.translate(-x, -y);
    try { _dp.apply(this, arguments); } finally { g.setTransform(m); } }; }
/* the pet card: bond bar and form */
function petEvoHTML(p){ const s = petStage(p), bd = p.bd || 0, nx = PEVO.need[s + 1];
  return `<div class="petevo" style="--rc:${PEVO.ring[s] || '#9aa6b2'}"><b>${L(PEVO.th[s], PEVO.en[s])}</b> <small>${L('สายสัมพันธ์', 'Bond')} ${fmtN(bd)}${nx ? ` / ${fmtN(nx)}` : ''}</small>
    ${nx ? `<div class="achbar"><i style="width:${Math.min(100, (bd - PEVO.need[s]) / (nx - PEVO.need[s]) * 100)}%"></i><span>${L(`อีก ${fmtN(nx - bd)} วิวัฒนาการเป็น${PEVO.th[s + 1]}`, `${fmtN(nx - bd)} more to ${PEVO.en[s + 1]}`)}</span></div>` : ''}
    <small class="pevg">${s === 2 ? L('ดาเมจคุณ +10% · มอนตีคุณเบาลง 6% · พรผูกพันทุก 30 วิ (ATK +12% · รับดาเมจ −8%)', 'Your damage +10% · monsters hit you 6% softer · Bond Blessing every 30 s (ATK +12% · damage taken −8%)') : s === 1 ? L('ดาเมจคุณ +5% · ร่างเทพที่ 1,200', 'Your damage +5% · Divine form at 1,200') : L('ล้มมอนเลเวลใกล้คุณพร้อมสัตว์เลี้ยงเพื่อเพิ่มสายสัมพันธ์', 'Defeat monsters near your level with your pet out to grow the bond')}</small></div>`; }
{ const _ph = petCardHTML; petCardHTML = function(){ const h = _ph.apply(this, arguments), p = PD(); if (!h || !p) return h;
    return h.replace('<div class="petsk">', petEvoHTML(p) + '<div class="petsk">'); }; }
{ const st = document.createElement('style');
  st.textContent = `.petevo{grid-column:1/-1;margin:6px 0;padding:6px 8px;border-radius:10px;border:1.5px solid var(--rc);background:rgba(255,255,255,.9);color:#1b1b1b}
  .petevo b{color:#1b1b1b}.petevo small{color:#333}.petevo .pevg{display:block;margin-top:3px;color:#1f7a3a;font-weight:600}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'petevo', t:['วิวัฒนาการสัตว์เลี้ยง', 'Pet evolution'], b:() => `<p>${L('สัตว์เลี้ยงไม่เก็บของ แต่ช่วยตีและบัฟคุณ ล้มมอนเลเวลใกล้คุณหรือสูงกว่าพร้อมสัตว์เลี้ยง สายสัมพันธ์จะเพิ่มขึ้น (บอสแคว้นได้เยอะ) · สายสัมพันธ์ 300 = ร่างตื่น ค่าพลังสูงขึ้นและเพิ่มดาเมจคุณ · 1,200 = ร่างเทพ แข็งแกร่งขึ้นอีก เพิ่มดาเมจคุณมากขึ้น มอนตีเบาลง และร่ายพรผูกพันเป็นระยะ', 'Pets never pick things up: they fight and lift you. Defeat monsters near your level (or above) with your pet out and your bond grows (a lot from region bosses) · bond 300 = Awakened: stronger stats and more damage for you · 1,200 = Divine: stronger still, more damage for you, monsters hit softer, and a Bond Blessing now and then')}</p>`});
