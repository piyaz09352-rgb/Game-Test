/* VAYRATHEN — js/sys/healer.js — หมออ้อน, the healer of Aren
   Free, any time: talk to her and your HP and SP are filled and you get her blessing for 10 minutes (no window)
   (ATK +5% · MATK +5% · attack speed +5% · DEF +5). She stands near where you wake in Aren. */
'use strict';

const OON_BUFF = {t:600, atkPct:.05, matkPct:.05, aspdPct:.05, def:5};
BUFF_TH.oon = ['พรหมออ้อน', "Oon's Blessing"];
BUFF_CAP.oon = ['พรหมอ', 'BLESS'];
BUFF_IC.oon = ['#ffb0c8', '<path d="M10 16.5s-6-3.6-6-8a3.3 3.3 0 0 1 6-1.9 3.3 3.3 0 0 1 6 1.9c0 4.4-6 8-6 8z"/><path d="M10 7.5v5M7.5 10h5"/>'];
addTownNpc({id:'healer_oon', name:'หมออ้อน', en:'Doctor Oon', role:'เติมเลือด · แจกบัฟ', roleEn:'Heal · Blessing', x:250, y:930},
  {job:'healer', look:{sex:'f', hair:2, color:'hairPink'}, gear:{}});
if (typeof NPC_TAG !== 'undefined') NPC_TAG.healer_oon = ['หมออ้อน', 'เติมเลือด · บัฟ', 'Dr. Oon', 'Heal · Buff'];
function oonHeal(){
  if (!S || P.dead) return;
  S.hp = DER.maxhp; S.sp = DER.maxsp;
  addBuff('oon', {...OON_BUFF});
  if (typeof VFX !== 'undefined' && VFX.play) VFX.play('heal', {x:P.x, y:P.y});
  if (typeof fx !== 'undefined') fx.push({k:'heal', x:P.x, y:P.y, t:0, life:.8});
  addText(P.x, P.y - 40, L('เติมเต็ม + พรหมออ้อน', 'Healed + blessed'), '#9ff0c8', 13);
  SFX.play('bf_herb'); dirty = true;
}
/* talking to her is enough: healed and blessed at once, no window to close */
NPC_OPEN.healer_oon = n => {
  oonHeal(); setTimeout(() => { if (typeof closeDialog === 'function') closeDialog(); }, 0);
  toast(L('หมออ้อน: เติมเลือดเต็มแล้ว พรอยู่ได้ 10 นาทีจ้ะ', 'Doctor Oon: fully healed, blessed for 10 minutes'));
};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-oon]'); if (!b) return; oonHeal(); toast(L('เติมเต็มแล้ว', 'Healed')); });
if (typeof TOUR !== 'undefined') TOUR.push(['healer_oon', 'เติมเลือดและแจกบัฟฟรี', 'Free heal and blessing']);

