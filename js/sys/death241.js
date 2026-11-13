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

const DTH_CORNER = '<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M4 56V22C4 12 12 4 22 4h34" fill="none" stroke="#e3b04b" stroke-width="3"/><path d="M11 56V26c0-8 7-15 15-15h30" fill="none" stroke="#fff0b8" stroke-width="1.4" opacity=".8"/><path d="M18 18c6-7 15-6 17 1-6-2-11 0-13 6-3-1-4-4-4-7z" fill="#e3b04b"/><circle cx="12" cy="12" r="4.5" fill="#ffd56a" stroke="#7a3a14" stroke-width="1.4"/><path d="M28 8l3-3 3 3-3 3z M8 28l3-3 3 3-3 3z" fill="#ffd56a"/></svg>';
function dthEl(){
  let d = el('dth'); if (d) return d;
  d = document.createElement('div'); d.id = 'dth'; d.className = 'dth'; d.hidden = true;
  let sparks = ''; for (let i = 0; i < 28; i++){ const ember = i % 3 !== 0, x = (i * 37 % 100) + (i % 7) * .7, dur = (ember ? 3.2 : 5) + (i * 13 % 25) / 10, dl = -((i * 29) % 50) / 10, sz = ember ? 3 + (i % 4) : 2 + (i % 3);
    sparks += `<i class="${ember ? 'em' : 'as'}" style="--x:${x.toFixed(1)}%;--d:${dur}s;--dl:${dl}s;--s:${sz}px;--w:${(i % 5 - 2) * 14}px"></i>`; }
  d.innerHTML = `<div class="dthfx" aria-hidden="true"><i class="dthrays"></i><i class="dthvig"></i><div class="dthsparks">${sparks}</div><i class="dthflash"></i></div>
  <div class="dthcard" role="dialog" aria-modal="true" aria-labelledby="dthT">
    <i class="dthc tl">${DTH_CORNER}</i><i class="dthc tr">${DTH_CORNER}</i><i class="dthc bl">${DTH_CORNER}</i><i class="dthc br">${DTH_CORNER}</i>
    <i class="dthshine" aria-hidden="true"></i>
    <div class="dthghost" aria-hidden="true"><i class="soul s1"></i><i class="soul s2"></i><i class="soul s3"></i><svg viewBox="0 0 64 64"><defs><radialGradient id="dthGh" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f2ecff"/><stop offset="1" stop-color="#c9bcf0"/></radialGradient></defs>
      <path d="M32 6c-12 0-20 9-20 21v27l5-4 5 4 5-4 5 4 5-4 5 4 5-4 5 4V27C52 15 44 6 32 6z" fill="url(#dthGh)" stroke="#4a3060" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M22 25l6 6M28 25l-6 6M36 25l6 6M42 25l-6 6" stroke="#4a3060" stroke-width="2.6" stroke-linecap="round"/><path d="M26 41q6 5 12 0" fill="#ff8aa8" stroke="#4a3060" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="19" cy="36" rx="3.2" ry="2" fill="#ffb0c8" opacity=".7"/><ellipse cx="45" cy="36" rx="3.2" ry="2" fill="#ffb0c8" opacity=".7"/><ellipse cx="42" cy="15" rx="3.4" ry="2.2" fill="#fff"/></svg></div>
    <h2 class="dtht" id="dthT"><span>${L('คุณตุยแล้ว', 'You died')}</span></h2>
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
function dthShow(){ const d = dthEl(); DTH.shown = true; d._k = ''; dthSync(); d.hidden = false; d.classList.remove('on'); void d.offsetWidth; d.classList.add('on');
  const w = el('wrap'); if (w) w.classList.add('dthon'); setTimeout(() => { if (DTH.shown && typeof SFX !== 'undefined' && SFX.play) SFX.play('boom'); }, 380); }
function dthHide(){ DTH.shown = false; const d = el('dth'); if (d){ d.hidden = true; d.classList.remove('on'); } const w = el('wrap'); if (w) w.classList.remove('dthon'); }

/* the loops say 9999 rather than «infinite»: js/sys/perf4.js stops every infinite loop in the game's style sheets (the
   HUD repainting every frame made the game stutter); this sign is only up while you lie fallen, so its loops may run */
{ const st = document.createElement('style'); st.id = 'dthcss'; st.textContent = `
  #wrap.dthon #cv{filter:grayscale(.85) brightness(.62) contrast(1.05)!important;transition:filter 1.4s ease}
  #wrap #cv{transition:filter .5s ease}
  #dth.dth{position:absolute;inset:0;z-index:380;display:grid;place-items:center;pointer-events:auto;overflow:hidden;font-family:var(--thai,"Sarabun"),sans-serif}
  #dth.dth[hidden]{display:none}
  #dth .dthfx,#dth .dthfx>i,#dth .dthsparks{position:absolute;inset:0;pointer-events:none}
  #dth .dthvig{background:radial-gradient(ellipse at 50% 46%,rgba(40,0,6,.05) 20%,rgba(50,4,10,.55) 62%,rgba(14,0,4,.88) 100%);animation:dthBeat 2.2s ease-in-out 1s 9999}
  #dth .dthflash{background:radial-gradient(circle at 50% 46%,rgba(255,240,220,.9),rgba(255,40,30,.65) 40%,rgba(120,0,10,.2) 80%);opacity:0}
  #dth .dthrays{inset:-60%;background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,90,60,.0) 0deg 7deg,rgba(255,150,80,.3) 9deg 13deg,rgba(255,90,60,0) 15deg 22deg);
    -webkit-mask:radial-gradient(circle at 50% 50%,#000 6%,transparent 42%);mask:radial-gradient(circle at 50% 50%,#000 6%,transparent 42%);opacity:0}
  #dth .dthsparks i{position:absolute;left:var(--x);width:var(--s);height:var(--s);border-radius:50%;opacity:0}
  #dth .dthsparks .em{bottom:-12px;background:radial-gradient(circle,#fff6c0,#ff9a3a 45%,rgba(255,60,20,0) 72%);box-shadow:0 0 8px 2px rgba(255,120,40,.7)}
  #dth .dthsparks .as{top:-12px;background:rgba(220,210,210,.75);border-radius:30%}
  #dth .dthcard{position:relative;width:min(480px,86%);padding:34px 28px 22px;text-align:center;border-radius:20px;isolation:isolate;
    background:radial-gradient(ellipse at 50% 0%,#fffdf6,#fbefd8 55%,#f0d9b0);border:3px solid #e3b04b;
    box-shadow:0 0 0 2px #6a2a0e,0 0 0 8px rgba(227,176,75,.38),0 0 60px 10px rgba(255,80,40,.35),0 26px 70px rgba(0,0,0,.65);opacity:0}
  #dth .dthcard::before{content:"";position:absolute;inset:8px;border-radius:14px;border:1.5px solid rgba(190,120,40,.45);box-shadow:inset 0 0 22px rgba(200,120,40,.18);pointer-events:none}
  #dth .dthc{position:absolute;width:46px;height:46px;pointer-events:none;z-index:2}
  #dth .dthc svg{width:100%;height:100%;display:block;filter:drop-shadow(0 1px 1px rgba(90,40,10,.5))}
  #dth .dthc.tl{left:-6px;top:-6px}#dth .dthc.tr{right:-6px;top:-6px;transform:scaleX(-1)}#dth .dthc.bl{left:-6px;bottom:-6px;transform:scaleY(-1)}#dth .dthc.br{right:-6px;bottom:-6px;transform:scale(-1)}
  #dth .dthshine{position:absolute;inset:0;border-radius:18px;overflow:hidden;pointer-events:none;z-index:1}
  #dth .dthshine::after{content:"";position:absolute;top:-20%;bottom:-20%;width:34%;left:-50%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.75),transparent);transform:skewX(-18deg)}
  #dth .dthghost{position:absolute;left:50%;top:-58px;width:86px;height:86px;margin-left:-43px;z-index:3;filter:drop-shadow(0 0 14px rgba(200,180,255,.9)) drop-shadow(0 8px 10px rgba(0,0,0,.4));opacity:0}
  #dth .dthghost svg{position:relative;width:100%;height:100%}
  #dth .soul{position:absolute;left:50%;top:30%;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:radial-gradient(circle,#fff,#d8c8ff 50%,rgba(180,150,255,0) 72%);opacity:0}
  #dth .dtht{position:relative;z-index:2;margin:20px 0 2px;font:700 54px/1.15 "Mali",var(--thai),sans-serif;letter-spacing:.5px;opacity:0}
  #dth .dtht span{background:linear-gradient(#ffd0a0 0%,#ff4a3a 30%,#b0101c 65%,#4a0610 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(1.5px 0 0 #fff4c8) drop-shadow(-1.5px 0 0 #fff4c8) drop-shadow(0 1.5px 0 #fff4c8) drop-shadow(0 -1.5px 0 #fff4c8) drop-shadow(0 3px 0 #6a1a0e) drop-shadow(0 0 10px rgba(255,60,40,.55))}
  #dth .dthrib{position:relative;z-index:2;display:inline-block;margin:4px 0 0;padding:7px 34px;color:#fff8e0;font:700 22px/1.2 "Mali",var(--thai),sans-serif;
    background:linear-gradient(#ff4a4a,#c0141e 55%,#8a0c16);text-shadow:0 2px 0 #5a0a10,0 0 10px rgba(255,200,120,.5);box-shadow:0 5px 12px rgba(90,10,16,.45),inset 0 1px 0 rgba(255,255,255,.4);clip-path:inset(0 50% 0 50%)}
  #dth .dthrib::before,#dth .dthrib::after{content:"";position:absolute;top:6px;bottom:-6px;width:24px;background:#6a0a12;z-index:-1}
  #dth .dthrib::before{left:-16px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,40% 50%)}#dth .dthrib::after{right:-16px;clip-path:polygon(0 0,100% 0,60% 50%,100% 100%,0 100%)}
  #dth .dthribw{display:inline-block}
  #dth .dthloss{position:relative;z-index:2;margin:12px 0 14px;min-height:1em;font:700 13px/1.2 var(--thai),sans-serif;color:#9a3a1a;opacity:0}
  #dth .dthbtns{position:relative;z-index:2;display:flex;gap:12px;justify-content:center}
  #dth .dthb{position:relative;overflow:hidden;flex:1 1 0;min-height:64px;display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;border-radius:14px;cursor:pointer;opacity:0;
    font:700 17px/1.15 var(--thai),sans-serif;border:2px solid #7a3a14;box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 4px 0 #7a3a14,0 8px 16px rgba(0,0,0,.28);transition:transform .08s,filter .15s}
  #dth .dthb::after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.7),transparent);transform:skewX(-18deg);animation:dthSweep 3.2s ease-in-out 2s 9999}
  #dth .dthb:hover:not(:disabled){filter:brightness(1.07)}
  #dth .dthb:active:not(:disabled){transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 1px 0 #7a3a14}
  #dth .dthb b{display:block}#dth .dthb small{display:block;margin-top:3px;font:600 11.5px/1.2 var(--thai),sans-serif;opacity:.85}
  #dth .dthb.town{flex-direction:column;gap:0;background:linear-gradient(#fff6d0,#f6c84e 60%,#e0a030);color:#4a2408}
  #dth .dthb.here{background:linear-gradient(#fff0c0,#ffb040 55%,#f07a20);color:#4a1a04;text-align:left}
  #dth .dthb.here:not(:disabled){animation:dthGold 1.6s ease-in-out 1.6s 9999}
  #dth .dthb.here:disabled{background:linear-gradient(#efe8dc,#d6cbb4);color:#8a7a60;border-color:#a89a80;box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 4px 0 #a89a80;cursor:default}
  #dth .dthb.here:disabled::after{display:none}#dth .dthb.here:disabled .dthico{filter:grayscale(1) opacity(.6)}
  #dth .dthico{flex:none;width:40px;height:40px;display:block}#dth .dthico svg{width:100%;height:100%}
  #dth.on .dthflash{animation:dthFlash .9s ease-out both}
  #dth.on .dthrays{animation:dthRaysIn 1s ease .25s both,dthSpin 28s linear 1.2s 9999}
  #dth.on .dthsparks .em{animation:dthEmber var(--d) linear var(--dl) 9999}
  #dth.on .dthsparks .as{animation:dthAsh var(--d) linear var(--dl) 9999}
  #dth.on .dthcard{animation:dthCardIn .5s cubic-bezier(.2,1.5,.4,1) .1s both,dthShake .42s ease .5s}
  #dth.on .dthcard .dthshine::after{animation:dthSweep 1.1s ease .9s both,dthSweep 1.1s ease 4.5s 9999}
  #dth.on .dtht{animation:dthStamp .55s cubic-bezier(.3,1.6,.5,1) .35s both}
  #dth.on .dtht span{animation:dthGlow 2s ease-in-out 1.2s 9999}
  #dth.on .dthrib{animation:dthUnfurl .5s cubic-bezier(.4,1.4,.5,1) .8s both}
  #dth.on .dthghost{animation:dthRise .9s cubic-bezier(.2,1.2,.4,1) .55s both,dthFloat 2.6s ease-in-out 1.5s 9999}
  #dth.on .soul{animation:dthSoul 2.4s ease-out 9999}#dth.on .soul.s2{animation-delay:.8s;margin-left:-14px}#dth.on .soul.s3{animation-delay:1.6s;margin-left:2px}
  #dth.on .dthloss{animation:dthUp .4s ease 1s both}
  #dth.on .dthb.town{animation:dthUp .45s cubic-bezier(.2,1.4,.4,1) 1.1s both}
  #dth.on .dthb.here{animation:dthUp .45s cubic-bezier(.2,1.4,.4,1) 1.25s both}
  #dth.on .dthb.here:not(:disabled){animation:dthUp .45s cubic-bezier(.2,1.4,.4,1) 1.25s both,dthGold 1.6s ease-in-out 1.8s 9999}
  @keyframes dthFlash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}
  @keyframes dthBeat{0%,100%{opacity:1}14%{opacity:.82}28%{opacity:1}42%{opacity:.88}}
  @keyframes dthRaysIn{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
  @keyframes dthSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes dthEmber{0%{transform:translate(0,0) scale(.6);opacity:0}10%{opacity:1}80%{opacity:.9}100%{transform:translate(var(--w),-105vh) scale(1.1);opacity:0}}
  @keyframes dthAsh{0%{transform:translate(0,0) rotate(0);opacity:0}10%{opacity:.8}100%{transform:translate(calc(var(--w) * -1),105vh) rotate(260deg);opacity:0}}
  @keyframes dthCardIn{from{transform:scale(.5) translateY(40px);opacity:0}to{transform:none;opacity:1}}
  @keyframes dthShake{0%,100%{transform:none}20%{transform:translate(-7px,3px) rotate(-.8deg)}40%{transform:translate(6px,-3px) rotate(.7deg)}60%{transform:translate(-4px,2px)}80%{transform:translate(3px,-1px)}}
  @keyframes dthStamp{0%{transform:scale(3.2) rotate(-10deg);opacity:0;filter:blur(8px)}60%{transform:scale(.9) rotate(1.5deg);opacity:1;filter:none}80%{transform:scale(1.07)}100%{transform:none;opacity:1}}
  @keyframes dthGlow{0%,100%{filter:drop-shadow(1.5px 0 0 #fff4c8) drop-shadow(-1.5px 0 0 #fff4c8) drop-shadow(0 1.5px 0 #fff4c8) drop-shadow(0 -1.5px 0 #fff4c8) drop-shadow(0 3px 0 #6a1a0e) drop-shadow(0 0 8px rgba(255,60,40,.45))}
    50%{filter:drop-shadow(1.5px 0 0 #fff4c8) drop-shadow(-1.5px 0 0 #fff4c8) drop-shadow(0 1.5px 0 #fff4c8) drop-shadow(0 -1.5px 0 #fff4c8) drop-shadow(0 3px 0 #6a1a0e) drop-shadow(0 0 22px rgba(255,90,40,.95))}}
  @keyframes dthUnfurl{from{clip-path:inset(0 50% 0 50%);transform:rotate(-2deg) scaleY(.6)}to{clip-path:inset(-20px -30px -20px -30px);transform:rotate(-2deg)}}
  @keyframes dthRise{from{transform:translateY(70px) scale(.4);opacity:0}to{transform:none;opacity:1}}
  @keyframes dthFloat{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-9px) rotate(4deg)}}
  @keyframes dthSoul{0%{transform:translateY(10px) scale(.5);opacity:0}25%{opacity:.95}100%{transform:translateY(-60px) scale(1.2);opacity:0}}
  @keyframes dthUp{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}
  @keyframes dthSweep{0%{left:-60%}60%,100%{left:130%}}
  @keyframes dthGold{0%,100%{box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 4px 0 #7a3a14,0 8px 16px rgba(0,0,0,.28),0 0 0 rgba(255,200,60,0)}50%{box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 4px 0 #7a3a14,0 8px 16px rgba(0,0,0,.28),0 0 22px 4px rgba(255,200,60,.85)}}
  @media (max-height:520px){
    #dth .dthcard{width:min(450px,66%);padding:22px 20px 14px}
    #dth .dthc{width:34px;height:34px}
    #dth .dthghost{width:62px;height:62px;margin-left:-31px;top:-40px}
    #dth .dtht{margin-top:12px;font-size:38px}
    #dth .dthrib{font-size:17px;padding:5px 26px}
    #dth .dthloss{margin:6px 0 10px}
    #dth .dthb{min-height:52px;font-size:15px}#dth .dthico{width:34px;height:34px}
  }
  @media (prefers-reduced-motion:reduce){#dth *,#dth{animation-duration:.01s!important;animation-iteration-count:1!important}}`; document.head.appendChild(st); }

/* (v294) the owner: fallen, then sent out of the server for idling (the sign waits for a button), and entering again
   put the hero back on that map at 0 HP — and dead once more. A hero saved fallen (0 HP) now wakes in town with half
   HP/SP, the way «เกิดที่เมือง» would have (the EXP for that fall was already lost: nothing is taken twice). */
{ const _lm = loadMap; loadMap = function(id){
    if (typeof S !== 'undefined' && S && S.hp <= 0 && !P.dead && !(typeof TW !== 'undefined' && TW.active)){ id = 0; S.map = 0; S.x = VSPAWN.x; S.y = VSPAWN.y; S.hp = 1; DTH.wake = true; }
    const r = _lm.call(this, id);
    if (DTH.wake){ P.x = VSPAWN.x; P.y = VSPAWN.y; } return r; }; }
EV.on('tick', () => { if (!DTH.wake || !S || typeof DER === 'undefined' || !DER || !DER.maxhp || P.dead) return; DTH.wake = false; P.x = VSPAWN.x; P.y = VSPAWN.y; S.x = P.x; S.y = P.y;
  S.hp = Math.max(1, Math.round(DER.maxhp * .5)); S.sp = Math.max(S.sp || 0, Math.round(DER.maxsp * .5)); dirty = true;
  if (typeof toast === 'function') toast(L('คุณล้มไว้ก่อนออกจากเกม · ฟื้นที่เมืองแล้ว', 'You had fallen before leaving · you woke in town')); });
