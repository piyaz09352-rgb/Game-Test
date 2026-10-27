/* VAYRATHEN — js/sys/hands.js — one-handed and two-handed weapons
   Every weapon says how it is held (shown on its name line and its icon):
   · มือเดียว one-handed: daggers, blades (ดาบ), rods (คทา) — quicker: ASPD +3 for one-handed weapon items
   · สองมือ two-handed: greatswords (ดาบสองมือ), longstaves (ไม้เท้ายาว), knuckles, bows —
     greatswords and longstaves hit harder (built into their ATK / MATK) and swing slower: ASPD −8
   The hero holds them that way too: a one-handed weapon switches to the hand the camera sees, a two-handed one
   stays put and is drawn longer and broader. The Warlord's own war sword is two-handed. */
'use strict';

for (const k in JOBS){ const w = JOBS[k].weapon; if (w) w.hands = /สองมือ/.test(w.name || '') ? '2h' : HANDS_DEF[w.type] || '1h'; }
/* the weapon actually in use (worn item of the class's type, or the class's own) */
function wornWeapon(){ const id = S.gear && S.gear.weapon, it = id && ITEMS[id]; return it && it.st && it.st.wtype === JOBS[S.job].weapon.type ? it : null; }
const curHands = () => { const it = wornWeapon(); return it ? handsOf(it.st) : JOBS[S.job].weapon.hands; };
{ const _d = derive;
  derive = function(){ _d();
    const it = wornWeapon(); if (!it || !DER) return; const h = handsOf(it.st), wt = it.st.wtype; let a = 0;
    if (h === '2h' && (wt === 'sword' || wt === 'staff')) a = -8; else if (h === '1h') a = 3;
    if (a){ DER.aspd = Math.max(100, Math.min(ASPD_STAT, DER.aspd + a)); DER.interval = aspdIv(DER.aspd); }
    DER.hands = h;
  };
}
/* a small "2H" mark on two-handed weapon icons */
{ const _art = itemArt;
  itemArt = function(id, bare = false){
    const s = _art(id, bare), it = ITEMS[id]; if (!it || it.slot !== 'weapon' || !it.st || handsOf(it.st) !== '2h' || bare) return s;
    return s.replace(/<\/svg>$/, `<g><rect x="25.5" y="3.4" width="11.6" height="7.6" rx="2" fill="#2a1204" stroke="#ffd36a" stroke-width=".8"/><text x="31.3" y="9.3" text-anchor="middle" font-family="Mali,sans-serif" font-size="6.4" font-weight="900" fill="#ffd36a">2H</text></g></svg>`);
  };
}
/* the class's own weapon line in the Equipment window also says how it is held */
{ const _slot = eqSlot;
  eqSlot = function(sl){ let h = _slot(sl); if (sl === 'weapon' && !(S.gear && S.gear.weapon && ITEMS[S.gear.weapon])) h = h.replace(/<i>ATK /, `<i>${handsTxt(JOBS[S.job].weapon.hands)} · ATK `); return h; };
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'hands', t:['อาวุธมือเดียว / สองมือ', 'One- and two-handed weapons'], b:() => `<p>${L('มือเดียว: มีดสั้น ดาบ คทา — ตีเร็วขึ้น (ASPD +3) และสลับมือถือตามมุมกล้อง · สองมือ: ดาบสองมือ ไม้เท้ายาว สนับมือ ธนู — ดาบสองมือ ATK สูงกว่าดาบ 20% ไม้เท้ายาว MATK สูงกว่าคทา 25% แต่ตีช้าลง (ASPD −8) · ไอคอนอาวุธสองมือมีป้าย 2H · อาวุธประจำตัวขุนศึกเป็นดาบสองมือ · หาได้ที่ช่างตีเหล็ก หลอม หรือดรอป', 'One-handed: daggers, blades, rods — faster (ASPD +3), switch hands with the camera · Two-handed: greatswords, longstaves, knuckles, bows — greatswords have 20% more ATK than blades, longstaves 25% more MATK than rods, but swing slower (ASPD −8) · two-handed icons wear a 2H tag · the Warlord’s own sword is two-handed · from the blacksmith, crafting or drops')}</p>`});
