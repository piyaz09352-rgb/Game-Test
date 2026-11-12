/* VAYRATHEN — js/sys/hands2.js — (v102) one rule for one- and two-handed weapons, everywhere
   Before this, how a weapon was held was written by hand in several places and they disagreed:
   · "มีดคู่" (twin knives) starter kits of the Rogue and the Shadow Bandit, and both classes' own bare weapons,
     were one-handed, while the shop's twin daggers were two-handed (and the hero was drawn with one dagger).
   · several "คทา" (rods / sceptres) were two-handed: the class weapons คทาจตุธาตุ, คทาสังข์อัญเชิญ, ไม้เท้าโอสถ,
     and the Tier-4 kits; the Wiki says rods are one-handed and only ไม้เท้ายาว (longstaves) take both hands.
   · Tier-4 classes had no hand rule for their bare weapon at all (hands.js ran before they existed).
   · the Bulwark (ขุนพลปราการ) was drawn holding a two-handed greatsword while every one of its blades is one-handed.
   THE RULE (by weapon type, then by name):
     มือเดียว one-handed : ดาบ (blade) · มีดสั้น / กริช (dagger, kris) · คทา / ไม้เท้า (rod, staff)
     สองมือ  two-handed : ดาบสองมือ (greatsword) · มีดคู่ (twin daggers) · ไม้เท้ายาว (longstaff) · every fist weapon · every bow
   It is applied to every weapon item (shop, drops, crafted, class weapons, starter kits, rolled copies), to every
   class's bare weapon, and to the hero's picture (two-handed blades/staves drawn long, twin daggers drawn in both
   hands). Shields follow it: a shield only beside a one-handed blade or rod (js/sys/slots.js). */
'use strict';

const HANDS_RULE = {
  fist:() => '2h', bow:() => '2h', shuriken:n => (/คุไน|kunai/i.test(n) ? '1h' : '2h'),   // (v184) ดาวกระจาย: thrown from one hand, counted as two-handed · (v258) คุไน is one-handed
  dagger:n => (/คู่|twin/i.test(n) ? '2h' : '1h'),
  sword:n => (/สองมือ|greatsword/i.test(n) ? '2h' : '1h'),
  staff:n => (/ไม้เท้ายาว|longstaff/i.test(n) ? '2h' : '1h')
};
/* how a weapon of type wt with this name is held */
const handsRule = (wt, name) => (HANDS_RULE[wt] ? HANDS_RULE[wt](name || '') : '1h');
const hdBase = id => { const it = ITEMS[id]; const b = it && it.base && ITEMS[it.base]; return b || it; };
/* fix one weapon item (a rolled copy reads its base piece's name); returns true when it changed */
function handsFixItem(id){
  const it = ITEMS[id]; if (!it || !it.st || !it.st.wtype || (it.slot && it.slot !== 'weapon')) return false;
  const b = hdBase(id) || it, h = handsRule(it.st.wtype, `${b.name || ''} ${b.en || ''}`);
  if (it.st.hands === h) return false; it.st.hands = h; return true;
}
const HD = {n:0, t:0};
function handsFixAll(){
  let n = 0; for (const id in ITEMS) if (handsFixItem(id)) n++;
  if (typeof GEAR_LIST !== 'undefined') for (const g of GEAR_LIST) if (g[1] === 'weapon' && g[6] && g[6].wtype){ const h = handsRule(g[6].wtype, `${g[2]} ${g[3]}`); if (g[6].hands !== h){ g[6].hands = h; n++; } }
  for (const k in JOBS){ const w = JOBS[k].weapon; if (!w) continue; const h = handsRule(w.type, `${w.name || ''} ${w.en || ''}`); if (w.hands !== h){ w.hands = h; n++; }
    const c = typeof SPR !== 'undefined' && SPR.CHARS && SPR.CHARS[k];
    if (c){ const two = h === '2h' && (w.type === 'sword' || w.type === 'staff'), twin = w.type === 'dagger' && h === '2h';
      if (!!c.twoHand !== two){ c.twoHand = two; n++; } if (w.type === 'dagger' && !!c.twin !== twin){ c.twin = twin; n++; } } }
  HD.n += n; return n;
}
handsFixAll();
/* the hero's picture: whatever is worn decides (twin daggers in both hands, a single dagger in one) */
if (typeof SPR !== 'undefined' && SPR.heroKey){ const _hk = SPR.heroKey;
  SPR.heroKey = function(job, gear = {}, look = null){
    const key = _hk.apply(this, arguments), cfg = SPR.CHARS && SPR.CHARS[key], base = SPR.CHARS && SPR.CHARS[job];
    if (!cfg || !base || key === job) return key;
    const wi = gear && gear.weapon && ITEMS[gear.weapon];
    if (wi && wi.st && wi.st.wtype === base.weapon){ const h = handsOf(wi.st);
      if (base.weapon === 'dagger'){ if (h === '2h'){ cfg.offWeapon = true; cfg.shield = null; } else cfg.offWeapon = false; }
      cfg.twoHand = h === '2h' && (base.weapon === 'sword' || base.weapon === 'staff'); }
    return key; };
}
/* rolled copies made later (drops, crafting, rewards) and copies loaded from a save */
if (typeof makeInst === 'function'){ const _mi = makeInst; makeInst = function(){ const k = _mi.apply(this, arguments); if (k) handsFixItem(k); return k; }; }
window.addEventListener('DOMContentLoaded', () => { handsFixAll(); if (typeof derive === 'function' && typeof S !== 'undefined' && S && S.job) derive(); });
EV.on('job', () => { handsFixAll(); if (typeof shieldCheck === 'function') shieldCheck(); });
EV.on('tick', dt => { if ((HD.t += dt) < 5) return; HD.t = 0; if (handsFixAll() && typeof S !== 'undefined' && S && S.job){ derive(); if (typeof shieldCheck === 'function') shieldCheck(); if (typeof renderBag === 'function' && winOpen('bag')) renderBag(); } });

/* the Wiki says it the same way */
if (typeof WIKI_SYS !== 'undefined'){
  const art = {id:'hands', t:['อาวุธมือเดียว / สองมือ', 'One- and two-handed weapons'], b:() => `<p>${L('กติกาเดียวทั้งเกม (ร้านค้า ดรอป หลอม อาวุธประจำสาย ชุดเริ่มต้น และอาวุธติดตัวของทุกอาชีพ):', 'One rule across the game (shops, drops, crafting, class weapons, starter kits and every class\'s own weapon):')}</p>
    <ul><li><b>${L('มือเดียว', 'One-handed')}</b> · ${L('ดาบ · มีดสั้น / กริช · คทา / ไม้เท้า — ดาบและคทาตีเร็วขึ้น (ASPD +3) และถือโล่ได้ · ภาพตัวละครสลับมือถือตามมุมกล้อง', 'blades · daggers / krises · rods / staves — blades and rods swing faster (ASPD +3) and can take a shield · the hero switches hands to face the camera')}</li>
    <li><b>${L('สองมือ', 'Two-handed')}</b> · ${L('ดาบสองมือ · มีดคู่ · ไม้เท้ายาว · สนับมือ นวม กรงเล็บทุกแบบ · ธนูทุกแบบ — ถือโล่ไม่ได้ (ใส่แล้วโล่กลับเข้ากระเป๋า) · ดาบสองมือ/ไม้เท้ายาวแรงกว่าแต่ตีช้าลง (ASPD −8) · มีดคู่ถือมีดสองมือบนตัวละคร · ไอคอนมีป้าย 2H', 'greatswords · twin daggers · longstaves · every fist weapon · every bow — no shield (wearing one puts the shield back in the bag) · greatswords/longstaves hit harder but swing slower (ASPD −8) · twin daggers show a blade in each hand · icons carry a 2H mark')}</li></ul>
    <p class="hint">${L('อาวุธติดตัวของขุนศึกเป็นดาบสองมือ · ขุนพลปราการใช้ดาบขุนพลมือเดียวคู่โล่ · นักย่อง จอมโจรเงา พยัคฆ์เงา ใช้มีดคู่', 'The Warlord\'s own weapon is a greatsword · the Bulwark fights with a one-handed war blade and a shield · Rogue, Shadow Bandit and Shadow Tiger carry twin daggers')}</p>`};
  const i = WIKI_SYS.findIndex(a => a.id === 'hands'); if (i >= 0) WIKI_SYS[i] = art; else WIKI_SYS.push(art);
}
