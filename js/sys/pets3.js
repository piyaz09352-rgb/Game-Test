/* VAYRATHEN — js/sys/pets3.js — three pets, and pets that make sense (v29)
   · Keep up to 3 caught pets: one fights beside you, two wait. The Pet tab lists them: "ออกมาช่วย" (send it out)
     swaps it in, "ปล่อย" (release) lets it go. Catching a new one with all 3 places full is refused until you release one.
   · Nothing about a pet is random any more. Everything follows the monster that was caught:
       – Grade (ระดับ) by its level: C below 30 · B 30–69 · A 70–129 · S 130–199 · SS 200+ (an elite catch is one grade higher)
       – Class: the one that suits its body best (rocks Guardian, birds Swift, spirits Mystic …)
       – Skills: as many as its grade allows (1 · 1 · 2 · 2 · 3), its class's signature skills in order, each at the pet's own grade
       – HP, ATK and DEF from its level on one smooth curve (then class and grade), so a pet is as strong as its level says,
         never a lucky roll; attack speed, CRIT, element and reach as before.
   · Capture gear: every net adds to the catch chance; a Bamboo Cage or the Golden Hunter's Lasso also lifts the
     grade one step (never past SS).
   · Pets caught before this update are recalculated the same way. */
'use strict';

const PET_MAX = 3;
const petGradeFor = (lv, elite) => Math.min(4, (lv < 30 ? 0 : lv < 70 ? 1 : lv < 130 ? 2 : lv < 200 ? 3 : 4) + (elite ? 1 : 0));
const petClassFor = type => { const n = natureOf(type) || {a:'quad'}, pool = PCLS_POOL[n.wp || n.a] || {brawler:1}; let best = null, bw = -1; for (const k in pool) if (pool[k] > bw){ bw = pool[k]; best = k; } return best; };
petRoll = function(type, opt = {}){
  const d = MOB[type]; if (!d) return null;
  const net = typeof CAP_USE !== 'undefined' && CAP_USE && CAP_USE.g >= .2 ? 1 : 0;   // a bamboo cage or the golden lasso: one grade up
  const g = opt.g != null ? opt.g : Math.min(4, petGradeFor(d.lvl || 1, opt.elite) + net), cls = petClassFor(type), C = PCLS[cls];
  const sk = C.sk.slice(0, PG[g].sk).map(id => [id, g]);
  const p = {type, lv:d.lvl || 1, g, cls, sk, v:3, elite:!!opt.elite}; petStats(p); p.hp = p.mhp; return p;
};
petStats = function(p){
  const d = MOB[p.type] || {}, C = PCLS[p.cls] || PCLS.brawler, m = PG[p.g].mul, lv = p.lv || 1;
  p.mhp = Math.max(40, Math.round((60 + lv * 22 + lv * lv * .15) * m * C.hp));
  p.atk = Math.max(6, Math.round((8 + lv * 1.6 + lv * lv * .0035) * m * C.atk));
  p.def = Math.round(lv * .45 * m * C.def);
  p.delay = +Math.max(.6, (d.delay || 1.5) * C.spd).toFixed(2);
  p.crit = C.crit + p.g * 2; p.elem = d.elem || 'neutral';
  p.ranged = !!(d.range || C.magic); p.range = d.range ? d.range : C.magic ? 120 : mobReach(d); p.shot = d.shot || (C.magic ? ELEM_SHOT[p.elem] || 'holy' : null);
  return p;
};
const petFix = p => (p && p.type && MOB[p.type] && p.v !== 3 ? petRoll(p.type, {elite:!!p.elite}) : p);
{ const _pe = petEnsure;
  petEnsure = function(){ _pe.apply(this, arguments); if (S && S.petd && S.petd.v !== 3 && !S.petd.rent){ S.petd = petFix(S.petd); if (typeof PET !== 'undefined') PET.hp = S.petd.mhp; dirty = true; }
    if (S && Array.isArray(S.pets)) S.pets = S.pets.filter(x => x && MOB[x.type]).map(petFix).slice(0, PET_MAX - 1); }; }

/* ---------- the roster ---------- */
const petList = () => (S.pets || (S.pets = []));
const petCount = () => (S.pet ? 1 : 0) + petList().length;
{ const _tc = tryCapture;
  tryCapture = function(){ if (S && petCount() >= PET_MAX && P.target && !P.target.dead){ toast(L(`มีสัตว์เลี้ยงครบ ${PET_MAX} ตัวแล้ว · ปล่อยตัวหนึ่งในแท็บสัตว์เลี้ยงก่อน`, `You already keep ${PET_MAX} pets · release one in the Pet tab first`)); return; }
    return _tc.apply(this, arguments); }; }
{ const _rc = resolveCapture;
  resolveCapture = function(){ const t = P.capTarget, prev = S.pet && S.petd ? S.petd : S.pet ? petRoll(S.pet) : null;
    const r = _rc.apply(this, arguments);
    if (t && t.dead && t.vanish && prev){ if (petCount() - 1 < PET_MAX){ petList().push(prev); log(L(`${nm(MOB[prev.type])} พักรออยู่ในแท็บสัตว์เลี้ยง (${petCount()}/${PET_MAX})`, `${nm(MOB[prev.type])} now waits in the Pet tab (${petCount()}/${PET_MAX})`), 'g'); } dirty = true; save(); }
    return r; }; }
{ const _rel = releasePet;
  releasePet = function(){ _rel.apply(this, arguments); const nx = petList().shift(); if (nx){ S.pet = nx.type; S.petd = nx; PET.hp = nx.hp || nx.mhp; PET.down = 0; PET.x = P.x; PET.y = P.y; dirty = true; save(); } }; }
function petSwap(i){ const L0 = petList(), nx = L0[i]; if (!nx) return; const cur = S.pet && S.petd ? {...S.petd, hp:Math.round(PET.hp ?? S.petd.mhp)} : null;
  L0.splice(i, 1); if (cur) L0.push(cur); S.pet = nx.type; S.petd = nx; PET.hp = nx.hp || nx.mhp; PET.down = 0; PET.x = P.x + 20; PET.y = P.y; PET.cd = {};
  toast(L(`${nm(MOB[nx.type])} ออกมาช่วยแล้ว`, `${nm(MOB[nx.type])} is out`)); SFX.play('equip'); dirty = true; save(); if (typeof bagDraw === 'function') bagDraw(); }
/* v33: releasing asks in the centred confirm box (the small top prompt hid behind windows and pop-ups, so the button seemed dead) */
function petAsk(name, go){ const t = L('ปล่อยสัตว์เลี้ยง', 'Release pet'), q = L(`ปล่อย ${escH(name)} กลับสู่ทุ่ง? ปล่อยแล้วเอาคืนไม่ได้`, `Release ${escH(name)} to the wild? This cannot be undone.`);
  if (typeof askConfirm === 'function') askConfirm(t, q, L('ปล่อย', 'Release'), go); else sysPrompt(q, go); }
function petFree(i){ const nx = petList()[i]; if (!nx) return; petAsk(nm(MOB[nx.type]), () => { petList().splice(i, 1); dirty = true; save(); toast(L(`ปล่อย${nm(MOB[nx.type])}แล้ว`, `Released ${nm(MOB[nx.type])}`)); if (typeof bagDraw === 'function') bagDraw(); else if (typeof renderEquip === 'function') renderEquip(); }); }
{ const _ph = petCardHTML;
  petCardHTML = function(){ const top = _ph.apply(this, arguments), L0 = petList();
    const row = (p, i) => `<div class="petrow" style="--gc:${PG[p.g].c}"><img src="${petPic(p.type)}" alt="">${gradeTag(p.g)}<div class="nm"><b>${nm(MOB[p.type])} <small>Lv ${p.lv}</small></b>
      <small>${L(PCLS[p.cls].th, PCLS[p.cls].en)} · HP ${fmtN(p.mhp)} · ATK ${fmtN(p.atk)} · DEF ${fmtN(p.def)} · ${p.sk.map(([id]) => L(PSK[id].th, PSK[id].en)).join(', ')}</small></div>
      <button class="btn sm gold" data-petout="${i}">${L('ออกมาช่วย', 'Send out')}</button><button class="btn sm" data-petfree="${i}">${L('ปล่อย', 'Release')}</button></div>`;
    return `<div class="sec">${L('สัตว์เลี้ยง', 'Pets')} <span class="ct">${petCount()}/${PET_MAX}</span></div>${top}
      ${L0.length ? `<div class="sec">${L('พักรอ', 'Waiting')}</div><div class="petroster">${L0.map(row).join('')}</div>` : ''}
      <p class="hint">${L(`เลี้ยงได้ ${PET_MAX} ตัว ออกมาช่วยสู้ทีละตัว · ระดับ สกิล และค่าพลังตามเลเวลของมอนที่จับ ไม่มีการสุ่ม`, `Keep ${PET_MAX} pets, one out at a time · grade, skills and stats follow the caught monster's level, nothing random`)}</p>`; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-petout],[data-petfree],[data-release]'); if (!b) return; e.stopPropagation();
  if (b.dataset.release != null){ if (S && S.pet) petAsk(nm(MOB[S.pet]), () => { releasePet(); toast(L('ปล่อยสัตว์เลี้ยงแล้ว', 'Pet released')); if (typeof bagDraw === 'function') bagDraw(); else if (typeof renderEquip === 'function') renderEquip(); }); return; }
  if (b.dataset.petout != null) petSwap(+b.dataset.petout); else petFree(+b.dataset.petfree); }, true);
{ const st = document.createElement('style');
  st.textContent = `.petroster{display:flex;flex-direction:column;gap:6px}.petrow{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;border:1px solid var(--gc);background:rgba(10,14,36,.55)}
  .petrow img{width:40px;height:40px;object-fit:contain}.petrow .nm{flex:1;min-width:0}.petrow .nm small{display:block;opacity:.8;font-size:11px}`;
  document.head.appendChild(st); }
if (typeof CAP_NETS !== 'undefined') for (const n of CAP_NETS) if (ITEMS[n.id]) ITEMS[n.id].desc = [`ที่จับสัตว์ · โอกาสจับ +${n.c}%${n.g >= .2 ? ' · เกรดสัตว์เลี้ยง +1 ขั้น' : ''} · ใช้ชิ้นดีที่สุดในกระเป๋าเองเมื่อกดจับ (T) หมดเมื่อจับสำเร็จ`,
  `Capture gear · catch chance +${n.c}%${n.g >= .2 ? ' · pet grade +1' : ''} · the best one in your bag is used when you Catch (T), used up on a success`];
