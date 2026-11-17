/* VAYRATHEN — js/sys/loading307.js — (v307) a loading screen when you enter a map
   The owner asked for a loading screen on entering a map: with the larger maps a phone can take a few seconds to paint the
   new ground, and walking into a gate simply froze the picture until it was done. Now, through a gate or the warp keeper:
   · the screen shows at once: the land's colours, the land's name, the map's name and level range, a moving bar and a
     tip, then the map is painted underneath and the card fades out over the first frames of the new map;
   · nothing moves the hero while it shows (the gate is not walked into twice);
   · a far land still asks first (js/sys/gatewarn294.js) and Auto still never takes a gate by itself (js/sys/botgate.js).
   The bar moves on its own (the painting itself is one piece of work the browser cannot pause to redraw); the card is
   on the page above everything, not in the game picture. */
'use strict';
const LD = {busy:false, next:null, t0:0};
const LD_TIPS = [
  ['ในเมืองไม่มีมอนสเตอร์ ออกไปล่าที่แมพรอบเมือง', 'There are no monsters in town: hunt on the maps around it'],
  ['คุยกับผู้เฝ้าศาลที่แคมป์เพื่อวาร์ปกลับเมืองได้ฟรี', 'Talk to the Shrine Keeper at the camp to warp home for free'],
  ['บอสของแต่ละแคว้นเกิดใหม่ทุก 15 นาที', "Each region's boss comes back every 15 minutes"],
  ['วงสีแดงบนพื้นคือสกิลบอส เดินออกจากวงก่อนวงเต็ม', "A red circle on the ground is a boss skill: step out before it fills"],
  ['เปิด Auto ในเมือง ตัวละครจะออกไปล่าที่ทุ่งสุวรรณินเอง', 'Switch on Auto in town and your hero walks out to the Suwannin Fields'],
  ['แผนที่โลกบอกเลเวลของแต่ละแคว้น ไปแคว้นที่เหมาะกับเลเวลจะได้ EXP ดีที่สุด', 'The world map shows each region\'s level: one that fits yours gives the best EXP'],
  ['ปิดเอฟเฟกต์ประจำอาชีพได้ในหน้าตั้งค่า ถ้าเครื่องช้า', 'Class skill effects can be turned off in Settings on a slow device']];
function ldCard(){ let c = document.getElementById('ldCard'); if (c) return c;
  c = document.createElement('div'); c.id = 'ldCard'; c.hidden = true;
  c.innerHTML = '<div class="ldbg"></div><div class="ldin"><small class="ldland"></small><b class="ldname"></b><span class="ldlv"></span><div class="ldbar"><i></i></div><p class="ldtip"></p></div>';
  document.body.appendChild(c);
  const st = document.createElement('style'); st.textContent = `
#ldCard{position:fixed;inset:0;z-index:99998;display:flex;background:#16121c;align-items:center;justify-content:center;pointer-events:auto;transition:opacity .28s}
#ldCard[hidden]{display:none}#ldCard.out{opacity:0}
#ldCard .ldbg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,var(--g1,#7cc46a) 0%,var(--g2,#4e9a48) 42%,#1c1424 100%)}
#ldCard .ldin{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:20px 30px;max-width:min(92vw,520px);text-align:center;color:#fff8e4;font-family:Sarabun,"Noto Sans Thai",sans-serif;text-shadow:0 2px 6px rgba(0,0,0,.55)}
#ldCard .ldland{font-weight:700;font-size:13px;line-height:1;letter-spacing:.12em;color:var(--lc,#ffe08a);opacity:.95}
#ldCard .ldname{font-weight:900;font-size:clamp(24px,4.6vw,40px);line-height:1.15}
#ldCard .ldlv{font-weight:700;font-size:14px;line-height:1;padding:4px 12px;border-radius:12px;background:rgba(20,14,26,.5);border:1px solid rgba(255,230,160,.4)}
#ldCard .ldbar{position:relative;width:min(70vw,320px);height:7px;margin-top:10px;border-radius:5px;background:rgba(20,14,26,.55);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,230,160,.35)}
#ldCard .ldbar i{position:absolute;top:0;bottom:0;left:-40%;width:40%;border-radius:5px;background:linear-gradient(90deg,rgba(255,224,138,0),#ffe08a,rgba(255,224,138,0));animation:ldmove 1.05s ease-in-out infinite}
@keyframes ldmove{0%{left:-40%}100%{left:100%}}
#ldCard .ldtip{margin:8px 0 0;font-weight:500;font-size:13px;line-height:1.45;opacity:.88;max-width:440px}`;
  document.head.appendChild(st); return c; }
function ldShow(id){ const c = ldCard(), mp = MAPS[id] || MAPS[0], land = (typeof LANDS !== 'undefined' && LANDS[mp.land]) || ['', '', '#ffe08a'], gr = (typeof WM_GROUND !== 'undefined' && (WM_GROUND[mp.land] || WM_GROUND.fertile)) || ['#7cc46a', '#4e9a48'];
  c.style.setProperty('--g1', gr[0]); c.style.setProperty('--g2', gr[1]); c.style.setProperty('--lc', land[2] || '#ffe08a');
  c.querySelector('.ldland').textContent = L(land[0] || '', land[1] || ''); c.querySelector('.ldname').textContent = nm(mp);
  c.querySelector('.ldlv').textContent = mp.town || id === 0 ? L(`เมือง · Lv ${mp.lv[0]}–${mp.lv[1]}`, `Town · Lv ${mp.lv[0]}–${mp.lv[1]}`) : `Lv ${mp.lv[0]}–${mp.lv[1]}`;
  const tip = LD_TIPS[Math.floor(Math.random() * LD_TIPS.length)]; c.querySelector('.ldtip').textContent = '💡 ' + L(...tip);
  c.classList.remove('out'); c.hidden = false; LD.t0 = performance.now(); }
function ldHide(){ const c = document.getElementById('ldCard'); if (!c || c.hidden) return;
  const wait = Math.max(0, 260 - (performance.now() - LD.t0));   // a fast machine still sees the card for a moment, not a flicker
  setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => { c.classList.add('out'); setTimeout(() => { c.hidden = true; c.classList.remove('out'); }, 300); })), wait); }
/* do «go» (which changes the map) with the card showing first: the card is painted, then the map, then the card fades */
function ldRun(id, go){ ldShow(id); LD.busy = true; P.tx = null; P.ty = null; P.nav = null;
  requestAnimationFrame(() => setTimeout(() => { try { go(); } finally { LD.busy = false; ldHide(); } }, 30)); }
/* the warp keeper / world map: the «warping…» card becomes this one */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-warp]'); if (b && !b.disabled) LD.next = +b.dataset.warp; }, true);
if (typeof warpCard === 'function'){ warpCard = function(on){ if (on) ldShow(LD.next != null ? LD.next : MAP_ID); else { LD.next = null; ldHide(); } }; }
/* a gate */
{ const _cg = checkGates; checkGates = function(){
    if (LD.busy) return;
    if ((typeof DG !== 'undefined' && DG.active) || P.dead || P.roll || P.capT > 0 || T < (P.gateLock || 0)) return _cg.apply(this, arguments);
    const gt = GATES.find(g => Math.hypot(P.x - g.x, P.y - g.y) < 26); if (!gt) return;
    if (typeof botgOn === 'function' && botgOn()) return _cg.apply(this, arguments);
    if (typeof gwFar === 'function' && gwFar(gt.to) && !(GWN.ok && GWN.ok[gt.to])) return _cg.apply(this, arguments);   // the far-land question comes first
    const self = this, args = arguments; ldRun(gt.to, () => _cg.apply(self, args)); }; }
