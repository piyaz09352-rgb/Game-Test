/* VAYRATHEN — js/sys/bossshout.js — bosses shout with real feeling (v56)
   A boss no longer reads out a flat line in the top banner (which also sat on top of the target's status icons).
   It shouts in a speech bubble right beside itself (v58: the bubble follows the boss and flips to its other side at the
   screen edge, so it never covers the target frame or the middle of the screen): stunned when you first make it bleed
   at half HP, boiling with rage when it unleashes a signature move or a new phase, berserk at the last phase, and
   panicking near death. Each mood has its face, colour and a pool of lines. The bubble fades in and holds still. */
'use strict';

const SHOUT_MOOD = {
  shock:{ico:'😱', th:'ตะลึง', en:'Stunned', col:'#7a3fd0', lines:[
    ['อะไรนะ!? เจ้า… เจ้ากล้าทำให้ข้าเลือดตกยางออกงั้นรึ!!', 'WHAT!? You… you dare make me BLEED!?'],
    ['เป็นไปไม่ได้!! มนุษย์ตัวกระจ้อยร่อยอย่างเจ้าทำร้ายข้าได้ยังไง!?', 'IMPOSSIBLE!! How could a puny human wound ME!?'],
    ['ข้า… ข้าบาดเจ็บ!? ไม่มีใครเคยทำได้มาก่อนเลย!!', 'I… I am HURT!? No one has EVER done that!!']]},
  rage:{ico:'😡', th:'โมโห', en:'Enraged', col:'#c8201a', lines:[
    ['พอกันที!!! ข้าจะบดขยี้เจ้าให้แหลกเป็นผุยผง!!', 'ENOUGH!!! I will grind you into DUST!!'],
    ['เจ้าทำให้ข้าโกรธแล้ว!!! รับไปซะ {m}!!!', 'Now you have made me ANGRY!!! Take this: {m}!!!'],
    ['อ๊ากกกก!!! ข้าจะฉีกเจ้าออกเป็นชิ้น ๆ!!', 'RAAAAGH!!! I will tear you to PIECES!!'],
    ['หนีไปไหนก็ไม่พ้น!!! {m}!!!', 'There is NOWHERE to run!!! {m}!!!'],
    ['บังอาจนัก!!! ลิ้มรส {m} ของข้าซะ!!', 'You INSOLENT worm!!! Taste my {m}!!']]},
  fury:{ico:'🔥', th:'เดือดดาลสุดขีด', en:'Berserk', col:'#a01010', lines:[
    ['ข้าจะไม่ยั้งมืออีกแล้ว!!! ทุกสิ่งจงมอดไหม้ไปพร้อมกับข้า!!!', 'NO MORE MERCY!!! Let EVERYTHING burn with me!!!'],
    ['แผ่นดินนี้จะต้องจมลงในเลือดของเจ้า!!!', 'This land will DROWN in your blood!!!'],
    ['ฮ่าฮ่าฮ่า!!! มาเลย!!! ตายไปพร้อมกันเลย!!!', 'HAHAHA!!! COME ON!!! We die TOGETHER!!!']]},
  fear:{ico:'😨', th:'ตกใจ', en:'Panicking', col:'#1f5ab0', lines:[
    ['ไม่… ไม่จริง!! ข้าคือผู้ไม่มีวันพ่าย… ไม่จริง!!', 'No… NO!! I am the undefeated… this cannot be!!'],
    ['ถอยไป!! อย่าเข้ามานะ!! อย่าเข้ามา!!!', 'Get BACK!! Stay away from me!! STAY AWAY!!!'],
    ['เลือดข้า… ไหลไม่หยุด… เจ้าเป็นตัวอะไรกันแน่!?', 'My blood… it will not stop… WHAT ARE YOU!?']]}
};
const SHOUT = {t:0, el:null, m:null};
function shoutEl(){ if (SHOUT.el && SHOUT.el.isConnected) return SHOUT.el; const e = document.createElement('div'); e.id = 'bossShout'; e.hidden = true; const ui = el('ui'); (ui || document.body).appendChild(e); return (SHOUT.el = e); }
/* the first free line under the target frame and its status icons (the top banner still uses it) */
function shoutTop(){ const ui = el('ui'), u = ui ? ui.getBoundingClientRect() : {top:0}; let y = 76;
  for (const id of ['target', 'tSt']){ const e = el(id); if (e && !e.hidden && e.offsetParent){ const r = e.getBoundingClientRect(); if (r.height) y = Math.max(y, r.bottom - u.top + 8); } }
  return Math.round(y); }
/* beside the boss's head, in #ui's own units; on its right unless that runs off the screen */
function shoutPlace(){
  const e = SHOUT.el, m = SHOUT.m, ui = el('ui'); if (!e || !m || !ui || typeof cv === 'undefined') return;
  const r = brect(cv), u = brect(ui), k = (ui.offsetWidth ? u.width / ui.offsetWidth : 1) || 1;
  const hx = r.left + (m.x - cam.x) / VW * r.width, hy = r.top + (m.y - (MOB_H[m.type] || 40) * .8 - cam.y) / VH * r.height;
  const off = hx < r.left - 40 || hx > r.right + 40 || hy < r.top - 40 || hy > r.bottom + 40; e.style.visibility = off ? 'hidden' : '';
  const W = e.offsetWidth, H = e.offsetHeight, x = (hx - u.left) / k, y = (hy - u.top) / k, gap = 26, uw = ui.offsetWidth, uh = ui.offsetHeight;
  const left = x + gap + W > uw - 6 && x - gap - W > 6; e.classList.toggle('lf', left);
  e.style.left = Math.round(left ? x - gap - W : Math.min(x + gap, uw - W - 6)) + 'px';
  e.style.top = Math.round(clamp(y - H * .75, 6, Math.max(6, uh - H - 6))) + 'px';
}
function bossShout(m, mood, move, line){
  return;   // (v155) boss speech bubbles are switched off on the owner's request: no bubble, no banner, no chat line
  const M = SHOUT_MOOD[mood] || SHOUT_MOOD.rage, d = m && m.def; if (!d) return;
  const raw = line ? L(...line) : L(...M.lines[Math.floor(Math.random() * M.lines.length)]), mv = move || '';
  const text = raw.replace(/\{m\}/g, mv || L('พลังของข้า', 'my power')), e = shoutEl();
  e.className = 'bsh ' + mood; e.style.setProperty('--mc', M.col); SHOUT.m = m;
  e.innerHTML = `<span class="bsf">${M.ico}</span><div class="bsq">${mv ? `<i>${escH(mv)}</i>` : ''}${escH(text)}</div>`;
  e.title = nm(d); e.hidden = false; e.classList.remove('out'); shoutPlace(); e.classList.remove('in'); void e.offsetWidth; e.classList.add('in');
  SHOUT.t = T + (mood === 'fury' ? 4.6 : 4); if (typeof log === 'function') log(`${nm(d)}: ${text}`, 'r');
}
EV.on('tick', () => { const e = SHOUT.el; if (!e || e.hidden) return;
  if (!SHOUT.m || SHOUT.m.dead && T < SHOUT.t - .5) SHOUT.t = Math.min(SHOUT.t, T + 1.2);
  if (T > SHOUT.t){ e.classList.add('out'); if (T > SHOUT.t + .45){ e.hidden = true; e.classList.remove('out'); SHOUT.m = null; return; } }
  shoutPlace(); });
/* the ordinary top banner also steps below the target frame and its icons */
{ const _b = banner; banner = function(){ const r = _b.apply(this, arguments); requestAnimationFrame(() => { const b = el('banner'); if (b) b.style.setProperty('top', shoutTop() + 'px', 'important'); }); return r; }; }   // (v132) measured on the next frame, not in the middle of the action
/* near death: one panicked shout per fight */
{ const _ub = updBoss; updBoss = function(m, dt){ if (m && !m.dead && m.def && m.def.boss && !m.shFear && m.hp < m.maxhp * .15 && m.aggro){ m.shFear = true; bossShout(m, 'fear'); } return _ub.apply(this, arguments); }; }
{ const st = document.createElement('style');
  st.textContent = `#bossShout{position:absolute;z-index:30;pointer-events:none;display:flex;align-items:flex-start;gap:6px;width:max-content;max-width:min(250px,60vw);
    padding:6px 10px 7px 7px;border-radius:14px;background:#fffdf6;border:2.5px solid var(--mc);
    box-shadow:0 3px 0 color-mix(in srgb,var(--mc) 60%,#000),0 6px 14px rgba(0,0,0,.22);font-family:Sarabun,sans-serif}
  #bossShout[hidden]{display:none}
  #bossShout::before,#bossShout::after{content:'';position:absolute;top:calc(75% - 9px);border:9px solid transparent}
  #bossShout::before{left:-20px;border-right:11px solid var(--mc)}
  #bossShout::after{left:-14px;border-right:9px solid #fffdf6}
  #bossShout.lf::before{left:auto;right:-20px;border-right-color:transparent;border-left:11px solid var(--mc)}
  #bossShout.lf::after{left:auto;right:-14px;border-right-color:transparent;border-left:9px solid #fffdf6}
  #bossShout .bsf{flex:none;font-size:20px;line-height:1.1}
  #bossShout .bsq{font:800 13.5px/1.3 Sarabun,sans-serif;color:#141414;min-width:0}
  #bossShout .bsq i{display:block;width:max-content;font:800 10.5px Sarabun,sans-serif;font-style:normal;color:#fff;background:var(--mc);padding:0 6px;border-radius:6px;margin-bottom:2px}
  #bossShout.rage .bsq,#bossShout.fury .bsq{color:#2a0505}
  #bossShout.in{animation:bshIn .25s ease-out both}
  #bossShout.out{transition:opacity .4s;opacity:0}
  @keyframes bshIn{from{opacity:0}to{opacity:1}}
  @media (max-width:700px){#bossShout .bsq{font-size:12px}#bossShout .bsf{font-size:17px}}`;
  document.head.appendChild(st); }
