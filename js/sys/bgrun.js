/* VAYRATHEN — js/sys/bgrun.js — play in the background · screen rest · keep the device awake
   · Background play: browsers stop animation frames for a hidden tab (another window in front, a minimised
     window, a folded or locked phone). A worker timer now keeps stepping the game logic (bgStep in main.js), so the
     character, Auto and the monsters carry on and the page is never closed or reloaded.
     This tab still lets go of hosted monsters while hidden (js/sys/netmob.js) so other players never see them freeze.
   · Screen rest: a black screen with a small status card. Drawing stops, the game logic keeps running, so Auto can
     farm for hours with almost no battery or GPU use. Starts after N idle minutes (Settings) or from the 🌙 chip;
     any tap or key wakes it. It also wakes by itself if the hero dies or HP gets low.
   · Keep awake: asks the browser not to dim or lock the screen while the game is in front (Screen Wake Lock). */
'use strict';

/* ---------- background ticker (a worker timer is throttled far less than a page timer) ---------- */
const BGW = {w:null, iv:0};
function bgStart(){
  if (BGW.w || BGW.iv) return;
  const fallback = () => { if (BGW.w){ try { BGW.w.terminate(); } catch (e) {} BGW.w = null; } if (!BGW.iv) BGW.iv = setInterval(() => { if (typeof bgStep === 'function') bgStep(); }, 250); };
  try {
    const src = 'setInterval(function(){postMessage(0)},200)';
    BGW.w = new Worker(URL.createObjectURL(new Blob([src], {type:'text/javascript'})));
    BGW.w.onmessage = () => { if (typeof bgStep === 'function') bgStep(); };
    BGW.w.onerror = fallback;
  } catch (e) { fallback(); }
}
bgStart();
// the page was frozen and thawed by the browser: do not replay the gap
document.addEventListener('resume', () => { last = performance.now(); });

/* ---------- keep the screen awake ---------- */
const WL = {s:null, busy:false};
async function wlSync(){
  const want = SETTINGS.keepAwake !== false && !PAUSED && !document.hidden && !!navigator.wakeLock;
  if (!want){ if (WL.s){ try { await WL.s.release(); } catch (e) {} WL.s = null; } return; }
  if (WL.s || WL.busy) return;
  WL.busy = true;
  try { WL.s = await navigator.wakeLock.request('screen'); WL.s.addEventListener('release', () => { WL.s = null; }); } catch (e) { WL.s = null; }
  WL.busy = false;
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) wlSync(); });

/* ---------- screen rest ---------- */
const REST = {on:false, lastIn:Date.now(), t:0, card:0, box:null, lowWarn:false};
function restBox(){
  if (REST.box && REST.box.isConnected) return REST.box;
  const b = document.createElement('div'); b.id = 'restScr'; b.hidden = true;
  b.innerHTML = '<div class="rs-card" id="rsCard"></div><div class="rs-hint" id="rsHint"></div>';
  document.body.appendChild(b); return REST.box = b;
}
function restFill(){
  const c = document.getElementById('rsCard'); if (!c) return;
  const mx = (typeof DER !== 'undefined' && DER.maxhp) || 1, ms = (typeof DER !== 'undefined' && DER.maxsp) || 1;
  const hp = Math.max(0, Math.min(100, Math.round(S.hp / mx * 100))), sp = Math.max(0, Math.min(100, Math.round(S.sp / ms * 100)));
  const bot = BOT.on ? (BOT.pause > 0 ? 'Auto ⏸' : `Auto · ${BOT_TH[BOT.state] ? L(...BOT_TH[BOT.state]) : ''}`) : L('Auto ปิดอยู่', 'Auto off');
  let map = ''; try { map = nm(MAPS[MAP_ID]); } catch (e) {}
  c.innerHTML = `<div class="rs-t">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
    <div class="rs-n">${escH(S.name || '')} · Lv ${S.lvl}</div><div class="rs-m">${escH(map)}</div>
    <div class="rs-bar hp"><i style="width:${hp}%"></i></div><div class="rs-bar sp"><i style="width:${sp}%"></i></div>
    <div class="rs-m">${escH(bot)}</div>`;
  const h = document.getElementById('rsHint'); if (h) h.textContent = L('พักหน้าจอ · เกมยังทำงานอยู่ · แตะที่ไหนก็ได้เพื่อกลับมา', 'Screen rest · the game is still running · tap anywhere to return');
}
function enterRest(){
  if (REST.on || PAUSED || !window.__vay) return;
  REST.on = true; REST.t = 0; REST.lowWarn = false;
  const b = restBox(); b.classList.remove('out'); b.hidden = false; restFill();
  document.getElementById('ui')?.classList.add('rest-on');
}
function leaveRest(msg){
  if (!REST.on) return;
  REST.on = false; REST.lastIn = Date.now(); last = performance.now();
  const b = restBox(); b.classList.add('out');           // fades out; keeps catching the tap so it does not hit the game below
  setTimeout(() => { if (!REST.on) b.hidden = true; }, 350);
  document.getElementById('ui')?.classList.remove('rest-on');
  try { resize(); } catch (e) {} dirty = true;
  if (msg) toast(msg);
}
function restInput(e){
  if (REST.on){ e.preventDefault(); e.stopPropagation(); leaveRest(); return; }
  REST.lastIn = Date.now();
}
for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) document.addEventListener(ev, restInput, {capture:true, passive:false});
document.addEventListener('click', e => { if (REST.box && !REST.box.hidden && REST.box.classList.contains('out')){ e.preventDefault(); e.stopPropagation(); } }, true);
document.addEventListener('click', e => {
  if (e.target.closest('#restNow, #restChip')){ e.stopPropagation(); closeAllWins?.(); enterRest(); }
});
function closeAllWins(){ try { for (const w of WIN_IDS) closeWin(w); } catch (e) {} }

EV.on('tick', dt => {
  REST.t += dt;
  if (REST.t < 1) return; REST.t = 0;
  wlSync();
  if (PAUSED){ if (REST.on) leaveRest(); return; }
  if (REST.on){
    restFill();
    const box = REST.box, k = Math.floor(Date.now() / 30000) % 6;   // the card drifts every 30 s (no burn-in on OLED)
    if (box && box.dataset.k !== String(k)){ box.dataset.k = String(k); }
    const mx = DER.maxhp || 1;
    if (P.dead) leaveRest(L('ตัวละครล้มแล้ว · ปลุกหน้าจอ', 'Your hero fell · screen woken'));
    else if (S.hp / mx < .25 && !REST.lowWarn){ REST.lowWarn = true; leaveRest(L('HP ต่ำ · ปลุกหน้าจอ', 'HP is low · screen woken')); }
    return;
  }
  const m = SETTINGS.restMin;
  if (m > 0 && !document.hidden && !P.dead && Date.now() - REST.lastIn >= m * 60000) enterRest();
});

/* ---------- settings section + 🌙 chip ---------- */
{
  const _rs = renderSettings;
  renderSettings = function(){
    _rs.apply(this, arguments);
    const pane = el('pane-settings'); if (!pane || pane.querySelector('#set-restMin')) return;
    const tg = (k, label, sub) => `<label class="set"><span><b>${label}</b><small>${sub}</small></span><input type="checkbox" id="set-${k}" data-set="${k}" ${SETTINGS[k] !== false ? 'checked' : ''}><i class="sw"></i></label>`;
    const o = (v, label) => `<option value="${v}" ${Number(SETTINGS.restMin) === v ? 'selected' : ''}>${label}</option>`;
    const tpl = document.createElement('div');
    tpl.innerHTML = `<div class="sec">${L('พักหน้าจอ · เล่นเบื้องหลัง', 'Screen rest · background play')}</div>
      ${tg('bgRun', L('เล่นต่อเมื่อสลับหน้าต่าง/พับจอ', 'Keep playing in the background'), L('เกมไม่หยุดเมื่อไปเปิดหน้าต่างอื่น หรือพับ/ล็อกจอ (บางเครื่องมือถืออาจหยุดแอปเบื้องหลังเอง)', 'The game keeps running when you switch windows or fold/lock the screen (some phones still suspend background tabs)'))}
      ${tg('keepAwake', L('ไม่ให้จอดับเอง', 'Keep screen awake'), L('ขณะเกมอยู่หน้าสุด เครื่องจะไม่หรี่หรือล็อกจอ · ใช้คู่กับพักหน้าจอ', 'The device will not dim or lock while the game is in front · pairs with Screen rest'))}
      <label class="set"><span><b>${L('พักหน้าจออัตโนมัติ', 'Auto screen rest')}</b><small>${L('จอดำประหยัดแบต เกมยังทำงานต่อ · แตะเพื่อกลับมา', 'Black screen saves battery, the game keeps running · tap to return')}</small></span>
        <select id="set-restMin" data-set="restMin">${o(0, L('ปิด', 'Off'))}${o(1, L('ไม่ขยับ 1 นาที', 'After 1 min idle'))}${o(3, L('ไม่ขยับ 3 นาที', 'After 3 min idle'))}${o(5, L('ไม่ขยับ 5 นาที', 'After 5 min idle'))}${o(10, L('ไม่ขยับ 10 นาที', 'After 10 min idle'))}${o(30, L('ไม่ขยับ 30 นาที', 'After 30 min idle'))}</select></label>
      <div class="row"><button class="btn" id="restNow">🌙 ${L('พักหน้าจอตอนนี้', 'Rest screen now')}</button></div>`;
    const secs = [...pane.querySelectorAll('.sec')];   // near the top, right above "Controls", so it is easy to find
    const anchor = secs.find(n => /การควบคุม|^Controls?$/.test(n.textContent.trim())) || secs.find(n => /ข้อมูลเกม|Save data|อื่น ๆ|^Other$/.test(n.textContent.trim()));
    while (tpl.firstChild) anchor ? anchor.before(tpl.firstChild) : pane.appendChild(tpl.firstChild);
  };
}
document.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.set; if (k === 'keepAwake') wlSync(); if (k === 'restMin') REST.lastIn = Date.now(); });
{
  const chips = document.getElementById('chips');
  if (chips && !document.getElementById('restChip')){
    const c = document.createElement('div'); c.className = 'botchip restchip'; c.id = 'restChip'; c.title = L('พักหน้าจอ (จอดำ เกมยังทำงาน)', 'Screen rest (black screen, game keeps running)');
    c.innerHTML = '<i></i><span>' + L('🌙 พักจอ', '🌙 Rest') + '</span>'; chips.appendChild(c);
  }
}
