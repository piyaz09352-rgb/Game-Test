/* VAYRATHEN — js/sys/sizepot231.js — (v231) the All-size Strike Potion
   Every weapon type hits some monster sizes for less (elements.js SIZE_MOD: a sword does 75% to small and large
   monsters, a dagger 85% / 70% to medium / large, a bow 90% / 80%, fists and stars less to large ones). The owner
   asked for a potion that lifts that: while it works, every weapon hits every size at the full 100% — no size
   penalty at all (it never goes above 100%; staffs and magic were already 100%). Sold at the potion shop (Aren and
   the crossroads towns). 10 minutes; drinking another restarts the 10 minutes. */
'use strict';
ITEMS.sizepot = {name:'ยาโจมตีทุกขนาด', en:'All-size Strike Potion', buy:800, kind:'use', sizeAll:600,
  desc:['10 นาที: อาวุธทุกประเภทตีมอนทุกขนาด (เล็ก กลาง ใหญ่) ได้เต็ม 100% ไม่โดนหักตามขนาด · ดื่มซ้ำ = นับ 10 นาทีใหม่', '10 minutes: every weapon hits monsters of every size (small, medium, large) at the full 100%, with no size penalty · drinking another restarts the 10 minutes']};
if (typeof IA_POT !== 'undefined') IA_POT.sizepot = [['#f4e8ff', '#a868f0', '#3e1270'], 'tall'];
if (typeof BUFF_TH !== 'undefined') BUFF_TH.sizeall = ['โจมตีทุกขนาด', 'All-size strike'];
if (typeof BUFF_CAP !== 'undefined') BUFF_CAP.sizeall = ['ทุกขนาด', 'ALL SIZE'];
if (typeof BUFF_IC !== 'undefined') BUFF_IC.sizeall = ['#a868f0', '<circle cx="5" cy="13" r="2"/><circle cx="10" cy="11" r="3"/><circle cx="15.5" cy="9" r="4"/><path d="M3 5h14"/>'];
const sizeAllOn = () => !!(typeof P !== 'undefined' && P.buffs && P.buffs.sizeall && P.buffs.sizeall.t > 0);
// drinking it
{ const _u = useItem; useItem = function(id){ const it = ITEMS[id];
    if (!it || !it.sizeAll) return _u.apply(this, arguments);
    if (!S.inv[id] || P.dead || P.itemCd > 0) return;
    addBuff('sizeall', {t:it.sizeAll}); S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; P.itemCd = .3; dirty = true;
    SFX.play('potion'); addText(P.x, P.y - 50, L('โจมตีทุกขนาด 100%', 'All sizes 100%'), '#d8b0ff', 14);
    log(L('ดื่มยาโจมตีทุกขนาด · 10 นาที อาวุธตีมอนทุกขนาดเต็ม 100%', 'All-size Strike Potion · 10 minutes of full damage to every size'), 'g');
    if (typeof renderHotbar === 'function') renderHotbar(); }; }
// while it works, the size penalty is taken back out of every physical hit (everything else in the hit is unchanged)
{ const _p = physDamage; physDamage = function(m){ const r = _p.apply(this, arguments);
    if (r && r.dmg > 0 && sizeAllOn() && m && m.def){ const w = JOBS[S.job] && JOBS[S.job].weapon, f = w && SIZE_MOD[w.type] ? SIZE_MOD[w.type][m.def.size] : 1;
      if (f > 0 && f < 1) r.dmg = Math.max(1, Math.round(r.dmg / f)); }
    return r; }; }
