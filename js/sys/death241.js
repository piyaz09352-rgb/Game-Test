/* VAYRATHEN — js/sys/death241.js — (v241) the death screen
   The owner: when you fall, a sign says «คุณตุยแล้ว สมน้ำหน้า» and you get up yourself — no more waking in town by
   itself after 3 seconds. Two buttons:
   · «เกิดที่เมือง»: back to Aren with half HP/SP (as before; in the Tower this ends the climb, as before);
   · «เกิดที่จุดตาย»: get up right where you fell with half HP/SP and 3 s of safety, using one Garuda Feather
     (ขนนกครุฑ: potion shops, 1,200 Bia; region bosses sometimes drop one). Not in the Tower (the climb is a test of
     your own strength); fine in dungeons and on field maps.
   Auto (the owner's choice) also waits on the sign until the player presses a button. */
'use strict';
ITEMS.garudafeather = {name:'ขนนกครุฑ', en:'Garuda Feather', buy:1200, kind:'use', revive:1,
  desc:['ใช้ตอนล้ม: ลุกขึ้นตรงจุดที่ล้ม พร้อม HP/SP ครึ่งหนึ่ง (ใช้ในหอคอยไม่ได้)', 'When you fall: rise right where you fell with half HP/SP (not in the Tower)']};
if (typeof BUFF_TH !== 'undefined') BUFF_TH.dthsafe = ['ขนนกครุฑคุ้มกัน', 'Garuda guard'];
const DTH = {loss:0, shown:false};
const dthTower = () => typeof TW !== 'undefined' && TW.active;
const dthFeathers = () => (S && S.inv && S.inv.garudafeather) | 0;

/* the feather's picture: a golden Garuda feather */
{ const _p = iaPick; iaPick = function(id){ if (id !== 'garudafeather') return _p.apply(this, arguments); const p = 'iagaruda§';
    const defs = `<linearGradient id="${p}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffc83a"/><stop offset="1" stop-color="#d0541a"/></linearGradient>`;
    const body = `<path d="M30 6C19 8 11 17 10 30l2 3c3-3 6-4 9-5-2-1-4-1-6 0 3-3 7-4 10-5-2-1-4-1-6-1 3-2 6-4 9-5-2-1-4-1-5-1 3-3 6-6 7-13z" fill="url(#${p}f)" stroke="#7a3008" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M29 8C22 14 16 22 11.5 32.5" fill="none" stroke="#7a3008" stroke-width="1.2" stroke-linecap="round"/><path d="M12 33l-3 3" stroke="#7a3008" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="26" cy="11" r="1.4" fill="#fff"/>`;
    return {p, art:[defs, body], frame:2, glow:'#ffc83a'}; }; }

/* using one from the bag: only while fallen */
{ const _u = useItem; useItem = function(id){ const it = ITEMS[id]; if (!it || !it.revive) return _u.apply(this, arguments);
    if (!P.dead){ if (typeof toast === 'function') toast(L('ขนนกครุฑใช้ได้ตอนล้มเท่านั้น', 'The Garuda Feather works only when you have fallen')); return; }
    dthHere(); }; }

/* falling: no auto-wake, the sign instead (the old «you will wake in Aren» banner is left out) */
{ const _pd = playerDie; playerDie = function(){ const e0 = S.exp, b0 = banner; banner = () => {};
    let r; try { r = _pd.apply(this, arguments); } finally { banner = b0; }
    if (P.dead){ P.deadT = 1e9; DTH.loss = Math.max(0, e0 - S.exp); dthShow(); }
    return r; }; }
EV.on('tick', () => { if (!S) return; if (P.dead){ P.deadT = 1e9; if (!DTH.shown) dthShow(); else dthSync(); } else if (DTH.shown) dthHide(); });

/* region bosses sometimes drop a feather */
EV.on('kill', m => { if (!m || !m.def || !m.def.boss || m.minion || Math.random() >= .3) return; addItem('garudafeather', 1);
  log(L('ได้ ขนนกครุฑ ×1 จากบอส', 'Got a Garuda Feather from the boss'), 'g'); });

function dthTown(){ if (!P.dead) return; dthHide(); respawn(); if (typeof SFX !== 'undefined' && SFX.play) SFX.play('click'); }
function dthHere(){
  if (!P.dead) return;
  if (dthTower()){ if (typeof toast === 'function') toast(L('ในหอคอยใช้ขนนกครุฑไม่ได้', 'No feathers in the Tower')); return; }
  if (dthFeathers() < 1){ if (typeof toast === 'function') toast(L('ไม่มีขนนกครุฑ · ซื้อได้ที่ร้านยา', 'No Garuda Feather · sold at potion shops')); return; }
  S.inv.garudafeather--; if (!S.inv.garudafeather) delete S.inv.garudafeather;
  P.dead = false; P.deadT = 0; P.act = null; P.tx = null; P.target = null;
  S.hp = Math.max(1, Math.round(DER.maxhp * .5)); S.sp = Math.round(DER.maxsp * .5);
  addBuff('dthsafe', {t:3, invuln:1});
  if (typeof VFX !== 'undefined') VFX.play('levelUp', {});
  if (typeof SFX !== 'undefined' && SFX.play) SFX.play('potion');
  addText(P.x, P.y - 60, L('ฟื้นคืนชีพ!', 'Revived!'), '#ffd36a', 16);
  log(L('ใช้ขนนกครุฑ ลุกขึ้นตรงจุดที่ล้ม', 'Used a Garuda Feather: back on your feet where you fell'), 'g');
  dirty = true; dthHide(); if (typeof renderHotbar === 'function') renderHotbar();
}

function dthEl(){
  let d = el('dth'); if (d) return d;
  d = document.createElement('div'); d.id = 'dth'; d.className = 'dth'; d.hidden = true;
  d.innerHTML = `<div class="dthcard" role="dialog" aria-modal="true" aria-labelledby="dthT">
    <div class="dthghost" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M32 6c-12 0-20 9-20 21v27l5-4 5 4 5-4 5 4 5-4 5 4 5-4 5 4V27C52 15 44 6 32 6z" fill="#fffaf0" stroke="#5a3a2a" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M22 25l6 6M28 25l-6 6M36 25l6 6M42 25l-6 6" stroke="#5a3a2a" stroke-width="2.6" stroke-linecap="round"/><path d="M27 41q5-4 10 0" fill="none" stroke="#5a3a2a" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="44" cy="16" rx="3" ry="2" fill="#fff" opacity=".8"/></svg></div>
    <h2 class="dtht" id="dthT">${L('คุณตุยแล้ว', 'You died')}</h2>
    <div class="dthrib"><span>${L('สมน้ำหน้า!', 'Serves you right!')}</span></div>
    <p class="dthloss" id="dthLoss"></p>
    <div class="dthbtns">
      <button class="dthb town" data-dth="town"><b id="dthTownT"></b><small id="dthTownS"></small></button>
      <button class="dthb here" data-dth="here"><i class="dthico">${itemArt('garudafeather')}</i><span><b>${L('เกิดที่จุดตาย', 'Rise here')}</b><small id="dthHereS"></small></span></button>
    </div>
  </div>`;
  (el('ui') || document.body).appendChild(d);
  d.addEventListener('click', e => { const b = e.target.closest('[data-dth]'); if (!b || b.disabled) return; e.stopPropagation(); if (b.dataset.dth === 'town') dthTown(); else dthHere(); });
  d.addEventListener('pointerdown', e => e.stopPropagation());
  return d;
}
function dthSync(){
  const d = el('dth'); if (!d) return; const tw = dthTower(), n = dthFeathers();
  const key = [tw, n, DTH.loss, typeof LANG !== 'undefined' ? LANG : ''].join('|'); if (d._k === key) return; d._k = key;
  el('dthLoss').textContent = DTH.loss ? L(`เสีย EXP ${DTH.loss.toLocaleString()}`, `Lost ${DTH.loss.toLocaleString()} EXP`) : '';
  const town = MAPS[0] ? (L(MAPS[0].th || MAPS[0].name || 'อาเรน', MAPS[0].en || 'Aren')) : L('อาเรน', 'Aren');
  el('dthTownT').textContent = tw ? L('ออกจากหอคอย', 'Leave the Tower') : L('เกิดที่เมือง', 'Rise in town');
  el('dthTownS').textContent = L(`${town} · HP/SP ครึ่งหนึ่ง`, `${town} · half HP/SP`);
  const here = d.querySelector('[data-dth="here"]'); here.disabled = tw || n < 1;
  el('dthHereS').textContent = tw ? L('ในหอคอยใช้ไม่ได้', 'Not in the Tower') : n < 1 ? L('ต้องมีขนนกครุฑ · ซื้อที่ร้านยา', 'Needs a Garuda Feather · potion shop') : L(`ใช้ขนนกครุฑ 1 · มี ${n}`, `Uses 1 Garuda Feather · you have ${n}`);
}
function dthShow(){ const d = dthEl(); DTH.shown = true; d._k = ''; dthSync(); d.hidden = false; d.classList.remove('on'); void d.offsetWidth; d.classList.add('on'); }
function dthHide(){ DTH.shown = false; const d = el('dth'); if (d){ d.hidden = true; d.classList.remove('on'); } }

{ const st = document.createElement('style'); st.textContent = `
  #dth.dth{position:absolute;inset:0;z-index:380;display:grid;place-items:center;pointer-events:auto;
    background:radial-gradient(ellipse at 50% 45%,rgba(60,8,8,.25),rgba(30,4,6,.72) 75%);font-family:var(--thai,"Sarabun"),sans-serif}
  #dth.dth[hidden]{display:none}
  #dth .dthcard{position:relative;width:min(468px,86%);padding:30px 26px 22px;text-align:center;border-radius:22px;
    background:linear-gradient(#fffaf0,#f6e6c8);border:3px solid #e3b04b;box-shadow:0 0 0 2px #7a3a14,0 0 0 7px rgba(227,176,75,.35),0 24px 60px rgba(0,0,0,.6)}
  #dth .dthcard::before{content:"";position:absolute;inset:7px;border-radius:16px;border:1.5px dashed rgba(170,110,40,.45);pointer-events:none}
  #dth .dthghost{position:absolute;left:50%;top:-46px;width:76px;height:76px;margin-left:-38px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.45));animation:dthFloat 2.4s ease-in-out infinite}
  #dth .dthghost svg{width:100%;height:100%}
  #dth .dtht{margin:22px 0 4px;font:700 46px/1.1 "Mali",var(--thai),sans-serif;letter-spacing:.5px;
    background:linear-gradient(#ff5a4a,#b0141e 60%,#5a0a10);-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(0 2px 0 #fff) drop-shadow(0 3px 0 rgba(90,10,16,.35))}
  #dth .dthrib{position:relative;display:inline-block;margin:6px 0 2px;padding:6px 30px;color:#fff6dc;font:700 20px/1.2 "Mali",var(--thai),sans-serif;
    background:linear-gradient(#d8343a,#9a141e);text-shadow:0 1px 0 #5a0a10;transform:rotate(-2deg);box-shadow:0 4px 10px rgba(90,10,16,.35)}
  #dth .dthrib::before,#dth .dthrib::after{content:"";position:absolute;top:5px;bottom:-5px;width:22px;background:#7a0e16;z-index:-1}
  #dth .dthrib::before{left:-14px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,40% 50%)}
  #dth .dthrib::after{right:-14px;clip-path:polygon(0 0,100% 0,60% 50%,100% 100%,0 100%)}
  #dth .dthloss{margin:10px 0 14px;min-height:1em;font:600 13px/1.2 var(--thai),sans-serif;color:#8a4a2a}
  #dth .dthbtns{display:flex;gap:12px;justify-content:center}
  #dth .dthb{flex:1 1 0;min-height:62px;display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;border-radius:14px;cursor:pointer;
    font:700 17px/1.15 var(--thai),sans-serif;border:2px solid #7a3a14;box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 4px 0 #7a3a14,0 8px 16px rgba(0,0,0,.25);transition:transform .08s}
  #dth .dthb:active:not(:disabled){transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 1px 0 #7a3a14}
  #dth .dthb b{display:block}
  #dth .dthb small{display:block;margin-top:3px;font:600 11.5px/1.2 var(--thai),sans-serif;opacity:.85}
  #dth .dthb.town{flex-direction:column;gap:0;background:linear-gradient(#fff2c0,#f2c24a);color:#4a2408}
  #dth .dthb.here{background:linear-gradient(#ffe7a8,#ff9a3a);color:#4a1a04;text-align:left}
  #dth .dthb.here:disabled{background:linear-gradient(#efe8dc,#d6cbb4);color:#8a7a60;border-color:#a89a80;box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 4px 0 #a89a80;cursor:default}
  #dth .dthb.here:disabled .dthico{filter:grayscale(1) opacity(.6)}
  #dth .dthico{flex:none;width:38px;height:38px;display:block}
  #dth .dthico svg{width:100%;height:100%}
  #dth.on .dthcard{animation:dthIn .45s cubic-bezier(.2,1.4,.4,1) both}
  #dth.on{animation:dthFade .35s ease both}
  @keyframes dthIn{from{transform:scale(.6) translateY(30px);opacity:0}to{transform:none;opacity:1}}
  @keyframes dthFade{from{opacity:0}to{opacity:1}}
  @keyframes dthFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}
  @media (max-height:520px){
    #dth .dthcard{width:min(440px,70%);padding:20px 18px 14px}
    #dth .dthghost{width:58px;height:58px;margin-left:-29px;top:-34px}
    #dth .dtht{margin-top:14px;font-size:34px}
    #dth .dthrib{font-size:16px;padding:4px 24px}
    #dth .dthloss{margin:6px 0 10px}
    #dth .dthb{min-height:52px;font-size:15px}
  }`; document.head.appendChild(st); }
