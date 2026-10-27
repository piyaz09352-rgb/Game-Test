/* VAYRATHEN — js/sys/support.js — "สนับสนุนกาแฟ" (buy the developer a coffee) and "ติดต่อผู้พัฒนา"
   A big coffee button on the title screen and in the menu opens a small window with the developer's PromptPay
   number (with a copy button) and a thank-you. (v159) "ติดต่อผู้พัฒนา" opens the game's Discord server, from that
   window and from its own button on the title screen. */
'use strict';

const SUP_PP = '0831087666', SUP_DISCORD = 'https://discord.gg/6smpHGME4';
mkWin('support', 'สนับสนุนกาแฟ', 'Buy us a coffee', '', '<path d="M4 8h10v4a5 5 0 0 1-10 0z"/><path d="M14 9h1.5a2 2 0 0 1 0 4H14"/><path d="M7 3.5c0 1-1 1-1 2M10 3.5c0 1-1 1-1 2"/>');
const supHTML = () => `<div class="supw">
    <div class="supcup">☕</div>
    <p class="supnum"><b>${SUP_PP}</b><span>${L('พร้อมเพย์', 'PromptPay')}</span></p>
    <button class="btn gold wide" data-supcopy="1">${L('คัดลอกเบอร์พร้อมเพย์', 'Copy the PromptPay number')}</button>
    <p class="supty">${L('ขอบคุณที่เป็นกำลังใจให้กันครับ', 'Thank you for cheering us on!')}</p>
    <a class="btn wide supdc" href="${SUP_DISCORD}" target="_blank" rel="noopener">${L('ติดต่อผู้พัฒนาทาง Discord', 'Contact the developer on Discord')}</a></div>`;
WIN_RENDER.support = function(){ const pane = el('pane-support'); if (pane) pane.innerHTML = supHTML(); };
async function supCopy(){
  let ok = false;
  try { await navigator.clipboard.writeText(SUP_PP); ok = true; } catch (e) {}
  if (!ok) try { const t = document.createElement('textarea'); t.value = SUP_PP; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch (e) {}
  toast(ok ? L(`คัดลอก ${SUP_PP} แล้ว`, `Copied ${SUP_PP}`) : L(`พร้อมเพย์ ${SUP_PP}`, `PromptPay ${SUP_PP}`));
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-supopen],[data-supcopy]'); if (!b) return;
  if (b.dataset.supopen){ e.preventDefault(); if (el('title') && !el('title').hidden) supTitlePop(); else openWin('support'); }
  else if (b.dataset.supcopy) supCopy();
});
/* on the title screen (no game windows there): a small pop-up over the title card */
function supTitlePop(){
  let p = el('supPop'); if (p){ p.remove(); return; }
  p = document.createElement('div'); p.id = 'supPop'; p.className = 'suppop';
  p.innerHTML = `<div class="supbox"><button class="ibtn supx" data-supx="1" aria-label="${L('ปิด', 'Close')}">✕</button><h3>${L('สนับสนุนกาแฟ', 'Buy us a coffee')}</h3>${supHTML()}</div>`;
  document.body.appendChild(p);
}
document.addEventListener('click', e => { const p = el('supPop'); if (!p) return; if (e.target.closest('[data-supx]') || e.target === p) p.remove(); });
/* the big button on the title screen */
{
  const _t = renderTitleBody;
  renderTitleBody = function(){
    const r = _t.apply(this, arguments);
    const card = document.querySelector('#title .title-card'); if (card && !card.querySelector('.supbig')) card.insertAdjacentHTML('beforeend', `<button class="supbig" data-supopen="1">☕ ${L('สนับสนุนกาแฟ', 'Buy us a coffee')}</button><a class="supdcbig" href="${SUP_DISCORD}" target="_blank" rel="noopener">${L('ติดต่อเรา · Discord', 'Contact us · Discord')}</a>`);
    return r;
  };
}
if (typeof MENU_ICONS !== 'undefined') MENU_ICONS.support = ['#ffd9a0', '#6a3a1a', `<path d="M8 12h13v6a6.5 6.5 0 0 1-13 0z" fill="#fff3e0" stroke="#4a2410" stroke-width="1.2"/><path d="M21 13.5h2a2.6 2.6 0 0 1 0 5.2h-2" fill="none" stroke="#4a2410" stroke-width="1.4"/><path d="M12 6.5c0 1.4-1.4 1.4-1.4 2.8M16 6.5c0 1.4-1.4 1.4-1.4 2.8" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round"/>`];
{
  const st = document.createElement('style');
  st.textContent = `.supw{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:6px 4px}
    .supcup{font-size:54px;line-height:1;filter:drop-shadow(0 4px 10px rgba(255,180,80,.35))}
    .supnum{margin:0;display:flex;flex-direction:column;align-items:center}.supnum b{font:700 30px/1.1 var(--display);letter-spacing:.06em;color:#ffe08a}.supnum span{font-size:13px;color:#e8d6b0}
    .supty{margin:0;font-size:15px;color:#fff3d6}
    .supdc,.supdcbig{display:block;text-align:center;text-decoration:none;box-sizing:border-box;background:#5865f2;color:#fff;border:2px solid #3c45b8}
    .supdc{padding:10px 12px;border-radius:12px;font-weight:700;background:#5865f2 !important;color:#fff !important;border-color:#3c45b8 !important}
    .supdcbig{width:100%;margin-top:8px;padding:11px 16px;border-radius:14px;font:700 16px var(--display);box-shadow:0 4px 14px rgba(0,0,0,.4)}
    .supdc:hover,.supdcbig:hover{filter:brightness(1.1)}
    .supbig{display:block;width:100%;margin-top:12px;padding:14px 16px;border-radius:14px;border:2px solid #f2c45a;cursor:pointer;
      background:linear-gradient(180deg,#8a4a1a,#5a2a0e);color:#fff3d6;font:700 18px var(--display);box-shadow:0 4px 16px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,230,170,.35)}
    .supbig:hover{filter:brightness(1.12)}
    .suppop{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;background:rgba(0,0,0,.55)}
    .supbox{position:relative;width:min(340px,calc(100% - 32px));padding:18px 16px 16px;border-radius:16px;background:linear-gradient(180deg,#3a1610,#1e0a08);border:2px solid #f2c45a;color:#fff3d6}
    .supbox h3{margin:0 0 6px;text-align:center;color:#ffe08a}.supx{position:absolute;right:8px;top:8px}`;
  document.head.appendChild(st);
}
