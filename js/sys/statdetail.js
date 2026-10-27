/* VAYRATHEN — js/sys/statdetail.js — every number about your hero, in a drawer beside the Status window
   A tab sticks out of the Status window's right edge ("รายละเอียด ▶"). Tapping it slides out a side panel with all
   of the character's details: who you are (class, levels, EXP, money, title, guild, pet), HP/SP, attack (ATK, MATK,
   CRIT and crit damage, HIT, attack speed, cast speed, range, weapon element, one/two hands, move speed), defence
   (DEF, MDEF, FLEE, block), the six stats as base + bonus = total, passive skill effects, bonus damage per race,
   the buffs on you right now and every piece of gear you wear with its refine. It opens on whichever side has room
   and stays up to date while it is open. Also: the window header's key hint (A) and minimise button are gone. */
'use strict';

const SD = {open:false};
function sdRow(a, b){ return `<div class="sdr"><span>${a}</span><b>${b}</b></div>`; }
/* combat extras that gear or buffs may add later: element damage %, cooldown cut, damage reduction (all start at 0) */
const SD_ELEMS = [['earth', 'ดิน', 'Earth'], ['water', 'น้ำ', 'Water'], ['wind', 'ลม', 'Wind'], ['fire', 'ไฟ', 'Fire'], ['neutral', 'ไร้ธาตุ', 'Neutral'], ['shadow', 'ความมืด', 'Dark'], ['holy', 'ศักดิ์สิทธิ์', 'Holy']];
function sdExtra(key){ let v = 0; for (const id of Object.values(S.gear || {})){ const it = id && ITEMS[id]; if (it){ v += +(it[key] || (it.st && it.st[key]) || 0) || 0; } } for (const b of Object.values(P.buffs || {})) if (b && b[key]) v += +b[key] || 0; return v; }
function sdElemBonus(e){ let v = 0; const k = 'elem_' + e; for (const id of Object.values(S.gear || {})){ const it = id && ITEMS[id]; if (it){ v += +(it[k] || (it.st && it.st[k]) || 0) || 0; } } for (const b of Object.values(P.buffs || {})) if (b && b[k]) v += +b[k] || 0; if (DER.pas && DER.pas.luckyElem === e) v += .1; return v; }
if (typeof HK !== 'undefined' && HK.outMul) HK.outMul.push((mult, elem) => mult * (1 + sdElemBonus(elem || 'neutral')));
EV.on('skill', id => setTimeout(() => { const c = Math.min(.5, sdExtra('cdr')); if (c > 0 && P.cds[id] > 0) P.cds[id] *= 1 - c; }, 0));
const sdArmor = () => { let v = 0; for (const [s, id] of Object.entries(S.gear || {})){ const it = id && ITEMS[id]; if (it && s !== 'weapon') v += +((it.st && it.st.def) || it.def || 0) || 0; } return v; };
function sdHTML(){
  const D = DER, pc = v => `${Math.round(v * 1000) / 10}%`;
  const hpTick = Math.max(1, Math.floor(D.maxhp / 200) + Math.floor(D.b.vit / 5)), spTick = 1 + Math.floor(D.maxsp / 100) + Math.floor(D.b.int / 6) + (D.pas.spRegen || 0), spEvery = /INT/.test(JOBS[S.job].stat) ? 4 : 8;
  const red = typeof clRed === 'function' ? clRed() : sdExtra('dmgRed'), cdr = Math.min(.5, sdExtra('cdr'));
  const ab = (th, en, code) => code;   // standard game stat codes only (English), like other MMOs
  const rows = [
    [ab('พลังโจมตีกายภาพ', 'Physical attack', 'Physical Attack'), D.atk],
    [ab('พลังโจมตีเวทย์', 'Magic attack', 'Magic Attack'), D.matk],
    [ab('พลังป้องกัน', 'Defence', 'Defense'), D.def + (typeof buffDef === 'function' ? buffDef() : 0)],
    [ab('เลือด', 'Health', 'Health Points'), `${fmtN(Math.round(S.hp))} / ${fmtN(D.maxhp)}`],
    [ab('เอสพี', 'Skill points', 'Skill Points'), `${fmtN(Math.round(S.sp))} / ${fmtN(D.maxsp)}`],
    [ab('แม่นยำ', 'Accuracy', 'Accuracy'), D.hit],
    [ab('โอกาสคริติคอล', 'Critical chance', 'Critical Chance'), `${D.crit}%`],
    [ab('ดาเมจคริติคอล', 'Critical damage', 'Critical Damage'), pc(D.critDmg || 1.5)],
    [ab('', '', 'Critical Resistance'), `${typeof critResPct === 'function' ? +critResPct().toFixed(1) : 0}%`],
    [ab('ความเร็วโจมตี', 'Attack speed', 'Attack Speed'), `${D.aspd} <small>(${D.interval.toFixed(2)}s)</small>`],
    [ab('เวลาร่าย', 'Cast time', 'Cast Time'), pc(D.castMul)],
    [ab('', '', 'Cast Resistance'), `${typeof castResPct === 'function' ? +castResPct().toFixed(1) : 0}%`],
    [ab('เวลาใช้สกิลซ้ำ', 'Skill cooldown', 'Skill Cooldown'), cdr ? `−${pc(cdr)}` : '100%'],
    [ab('ค่าเกราะ', 'Armour', 'Armor'), sdArmor()],
    [ab('ต้านทานเวทย์', 'Magic resistance', 'Magic Defense'), D.mdef],
    [ab('หลบหลีก', 'Evasion', 'Evasion'), `${D.flee}${D.pas.dodge ? ` <small>+${pc(D.pas.dodge)}</small>` : ''}`],
    [ab('', '', 'Block Chance'), `${Math.round(D.block || 0)}%`],
    [ab('ลดดาเมจ', 'Damage reduction', 'Damage Reduction'), pc(red)],
    [ab('ความเร็วเดิน', 'Move speed', 'Movement Speed'), pc(D.move || 1)],
    [ab('รีเจ้นเลือด', 'HP regen', 'Health Regeneration'), `+${hpTick} / 6s`],
    [ab('รีเจ้นเอสพี', 'SP regen', 'Skill Point Regeneration'), `+${spTick} / ${spEvery / (P.buffs && P.buffs.meditate ? 2 : 1)}s`]
  ];
  const elem = SD_ELEMS.map(([e, th, en]) => [en, `+${pc(sdElemBonus(e))}`]);
  return `<div class="sdhead"><b>Character Details</b><button class="ibtn" data-sdclose="1" aria-label="${L('ปิด', 'Close')}">✕</button></div>
    <div class="sdbody">${rows.map(([a, b]) => sdRow(a, b)).join('')}<div class="sdsec"><h4>Element Damage Bonus</h4><div class="sdgrid">${elem.map(([a, b]) => sdRow(a, b)).join('')}</div></div></div>`;
}
function sdPlace(){
  const w = el('win-stat'), p = el('sdPanel'); if (!w || !p) return;
  const ui = el('ui').getBoundingClientRect(), r = w.getBoundingClientRect(), need = p.offsetWidth * (parseFloat(getComputedStyle(el('ui')).zoom) || 1) + 8;
  p.classList.toggle('left', r.right + need > ui.right && r.left - need > ui.left);
}
function sdRender(){
  const w = el('win-stat'); if (!w) return;
  let tab = el('sdTab'); if (!tab){ w.insertAdjacentHTML('beforeend', `<button class="sdtab" id="sdTab" data-sdtoggle="1"></button><div class="sdpanel sl-keep" id="sdPanel" hidden></div>`); tab = el('sdTab'); }
  const th = SD.open ? `◀ <span>${L('ซ่อน', 'Hide')}</span>` : `<span>${L('รายละเอียด', 'Details')}</span> ▶`; if (tab.innerHTML !== th) tab.innerHTML = th;
  tab.classList.toggle('on', SD.open);
  const p = el('sdPanel'); p.hidden = !SD.open; if (SD.open){ const h = sdHTML();   // (v57) rebuilt only when a number really changed, so the panel never blinks
    if (h !== SD.html){ SD.html = h; const sc = p.querySelector('.sdbody') ? p.querySelector('.sdbody').scrollTop : 0; p.innerHTML = h; p.querySelector('.sdbody').scrollTop = sc; } sdPlace(); } else SD.html = null;
}
{ const _rp = renderPanel; renderPanel = function(){ const r = _rp.apply(this, arguments); sdRender(); return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-sdtoggle],[data-sdclose]'); if (!b) return; e.stopPropagation(); SD.open = !!b.dataset.sdtoggle && !SD.open; sdRender(); });
EV.on('tick', dt => { SD.t = (SD.t || 0) - dt; if (SD.t > 0 || !SD.open || !winOpen('stat')) return; SD.t = 1; sdRender(); });
window.addEventListener('resize', () => setTimeout(sdPlace, 150));
{ const st = document.createElement('style');
  st.textContent = `.win .wt kbd,.win .wt .minb{display:none !important}
  #win-stat{overflow:visible !important}
  .sdtab{position:absolute;top:56px;right:-34px;width:30px;padding:10px 0;writing-mode:vertical-rl;border:3px solid #fff;border-left:0;border-radius:0 12px 12px 0;cursor:pointer;
    background:linear-gradient(180deg,#fff3a0,#ffd34a 50%,#ffb31f);color:#6a3a00;font:700 12px var(--display);box-shadow:3px 3px 0 #d08a10;z-index:2}
  .sdtab span{letter-spacing:.05em}
  .sdtab.on{background:linear-gradient(180deg,#ffffff,#d9efff);color:#14325e;box-shadow:3px 3px 0 #8cbbe6}
  .sdpanel{position:absolute;top:0;left:calc(100% + 34px);width:270px;max-height:100%;height:100%;display:flex;flex-direction:column;z-index:3;
    border:3px solid #fff;border-radius:18px;background:linear-gradient(180deg,#2d5a9e,#21467f 55%,#16315c);box-shadow:0 4px 0 #0d2141,0 10px 22px rgba(20,60,120,.35);color:#fff;overflow:hidden}
  .sdpanel.left{left:auto;right:calc(100% + 8px)}
  .sdpanel[hidden]{display:none}
  .sdhead{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:linear-gradient(180deg,#6bbcf5,#3b8ad6);border-bottom:2px solid #fff}
  .sdhead b{font:700 15px var(--display);text-shadow:0 1px 0 #0d2a52}
  .sdbody{overflow-y:auto;padding:6px 10px 12px;flex:1}
  .sdsec h4{margin:10px 0 4px;font:700 13px var(--display);color:#ffe27a;text-shadow:0 1px 0 #0d2141;border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:2px}
  .sdr{display:flex;justify-content:space-between;gap:8px;padding:3px 6px;border-radius:6px;font-size:12.5px}
  .sdr:nth-child(odd){background:rgba(255,255,255,.07)}
  .sdr span{color:#c8dcf6;font-weight:600}
  .sdr b{color:#fff;text-align:right;font-weight:700}
  .sdr em{color:#7dffb0;font-style:normal}
  .sdr small{color:#c8dcf6;font-weight:400}\n  .sdab{font-style:normal;font-size:10px;font-weight:700;color:#14325e;background:#bfe4ff;border-radius:5px;padding:0 4px;margin-left:4px}\n  .sdgrid{display:grid;grid-template-columns:1fr 1fr;gap:2px 8px}\n  .sdgrid .sdr:nth-child(odd){background:none}.sdgrid .sdr{background:rgba(255,255,255,.07)}\n  .sdnote{margin:6px 2px 8px;font-size:12px;color:#ffe27a}
  /* (v57) the bright theme, drawn here so nothing has to repaint it after each refresh */
  html body .sdpanel{background:linear-gradient(180deg,#fffdf6,#fbf1dc) !important;border-color:#8a5a1c !important;box-shadow:0 4px 0 #b88a4a,0 10px 22px rgba(80,50,10,.25) !important;color:#141414 !important}
  html body .sdpanel .sdhead{background:linear-gradient(180deg,#ffe7a6,#f5c25a) !important;border-bottom:2px solid #8a5a1c !important}
  html body .sdpanel .sdhead b{color:#141414 !important;text-shadow:none !important}
  html body .sdpanel .sdsec h4{color:#7a3a00 !important;text-shadow:none !important;border-bottom-color:#d9b98a !important}
  html body .sdpanel .sdr{background:transparent}
  html body .sdpanel .sdr:nth-child(odd),html body .sdpanel .sdgrid .sdr{background:#f3e6c8 !important}
  html body .sdpanel .sdr span,html body .sdpanel .sdr small,html body .sdpanel .sdnote{color:#3a2a1a !important;text-shadow:none !important}
  html body .sdpanel .sdr b{color:#141414 !important;text-shadow:none !important}
  html body .sdpanel .sdr em{color:#13703a !important}
  html body .sdpanel .sdab{background:#ffe7a6 !important;color:#141414 !important}
  @media (max-width:700px),(max-height:520px){.sdpanel{left:6px;right:6px;width:auto;top:44px;height:calc(100% - 50px)}.sdpanel.left{left:6px;right:6px}.sdtab{right:-31px;top:44px}}`;
  document.head.appendChild(st); }
