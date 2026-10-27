/* VAYRATHEN — js/sys/ridefight.js — who can fight on a mount */
'use strict';

/* mounted combat: only the warrior line (Swordsman → Warlord) fights while riding; everyone else dismounts to attack */
const rideFighter = () => !!(S && JOBS[S.job] && jobChain().includes('blade'));
{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments); if (DER && DER.pas){ if (rideFighter()) DER.pas.rideAtk = 1; else delete DER.pas.rideAtk; } return r; }; }

/* attack-speed buffs (aspdPct: Rapid Fire, Doctor Oon's blessing …) speed up your own swings and shots too */
BUFF_TH.mountedarcher = ['ธนูรัว', 'Rapid Fire']; BUFF_CAP.mountedarcher = ['ยิงรัว', 'RAPID'];
BUFF_IC.mountedarcher = ['#ffd27a', '<path d="M3 17L15 5"/><path d="M11 4.5h4.5V9"/><path d="M6 17l-3 0 0-3"/><path d="M7.5 10.5l2 2M5.5 12.5l2 2"/>'];
{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments); if (DER) DER._iv = DER.interval; return r; }; }
EV.on('tick', () => {
  if (!DER || !DER._iv) return; const h = Math.min(.6, buffSum('aspdPct')), iv = Math.max(.2, +(DER._iv / (1 + h)).toFixed(3));   // never faster than the ASPD cap
  if (DER.interval !== iv){ DER.interval = iv; DER.aspd = ivAspd(iv); }
});
