/* VAYRATHEN — js/sys/login234.js — (v234) arranges the login card like the owner's design
   auth.js builds the form (and builds it again on errors or a language switch); this only rearranges what it
   built, every time: the field names go inside the fields, the TH | EN pill shows both languages, the guest and
   forgotten-password links share one row with a divider and an icon each, and a tagline closes the card.
   Nothing is renamed: every id, class and data-* auth.js listens to stays as it was. */
'use strict';
function lg234(){
  const box = document.getElementById('auBox'); if (!box || box.dataset.lg234 === '1') return; box.dataset.lg234 = '1';
  const ph = {auLId:L('ไอดี', 'ID'), auLPw:L('รหัสผ่าน', 'Password'), auId:L('ไอดี · เช่น maprang_09', 'ID · e.g. maprang_09'), auPw:L('รหัสผ่าน · อย่างน้อย 6 ตัว', 'Password · 6 or more'), auPw2:L('ยืนยันรหัสผ่าน', 'Confirm password')};
  for (const id in ph){ const i = document.getElementById(id); if (i) i.placeholder = ph[id]; }
  const lang = box.querySelector('.au-lang'); if (lang){ const th = (typeof SETTINGS === 'undefined' || SETTINGS.lang !== 'en'); lang.innerHTML = `<span class="${th ? 'on' : ''}">TH</span><span class="${th ? '' : 'on'}">EN</span>`; }
  const guest = box.querySelector('.au-guest'), forgot = box.querySelector('.au-forgot'), go = box.querySelector('.au-go');
  if (go && (guest || forgot) && !box.querySelector('.au-links')){
    const row = document.createElement('div'); row.className = 'au-links';
    if (guest){ guest.innerHTML = `<span class="ico">🎮</span>${L('เล่นแบบแขก ไม่ต้องสมัคร', 'Play as a guest')}`; row.appendChild(guest); }
    if (guest && forgot){ const s = document.createElement('i'); s.className = 'sep'; row.appendChild(s); }
    if (forgot){ forgot.innerHTML = `<span class="ico">🔑</span>${L('ลืมรหัสผ่าน?', 'Forgot password?')}`; row.appendChild(forgot); }
    const last = [...box.querySelectorAll('.au-hint')].pop() || go; last.after(row);
    const tag = document.createElement('p'); tag.className = 'au-tagline'; tag.textContent = L('เข้าสู่โลกแห่งวายรา เพื่อเริ่มต้นการผจญภัยของคุณ', 'Enter the realm of Vayra and begin your adventure'); row.after(tag);
  }
}
// the game zooms its UI layer on big screens (#ui zoom): the login card divides its sizes by it (css/login233.css --uiz)
function lg234Zoom(){ const ui = document.getElementById('ui'); const z = ui ? parseFloat(getComputedStyle(ui).zoom) || 1 : 1; const r = document.documentElement; if (r.style.getPropertyValue('--uiz') !== String(z)) r.style.setProperty('--uiz', String(z)); }
window.addEventListener('resize', () => setTimeout(lg234Zoom, 60)); setInterval(lg234Zoom, 1000);
{ const run = () => { try { lg234Zoom(); lg234(); } catch (e) {} };
  const mo = new MutationObserver(run); const start = () => { const t = document.getElementById('titleBody') || document.getElementById('title'); if (t) mo.observe(t, {childList:true, subtree:true}); run(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); }
