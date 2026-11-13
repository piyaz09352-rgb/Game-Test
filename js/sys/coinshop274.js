/* VAYRATHEN — js/sys/coinshop274.js — (v274) ร้านค้าเหรียญวายรา · the Vayra Coin shop
   The owner asked for one shop for everything bought with Vayra Coins, sorted by kind, opened from a button on the
   screen (left of the minimap, the usual place for a shop in this kind of game) and from the menu:
   · แฟชั่น Fashion — wings, headpieces, masks, outfit sets, mounts: every piece priced in coins by how grand it looks,
     ◈30–300 (the old prices ◈35–220 kept their order and were spread over the new range; pieces that only came from
     the story, towns or login get a price too and can still be earned there; festival and tower-token pieces stay exclusive).
     The free trial is over: a piece can be previewed on your hero in the wardrobe, but only worn once bought
     (anything worn on trial is taken off).
   · ของใช้ Items — the coin-only goods (prices272.js: oils, special arrows and stars, Diamond Drill, Refine Ward).
   · หุ่นผู้ช่วย Robots — the nine premium helper robots (beastkeeper.js), rented from anywhere.
   · บริการ Services — bag slots (bag100.js).
   · เติมเหรียญ Top-up — the coin packs, shown but not open yet (no payment system yet), and the free ways to earn coins. */
'use strict';

/* ---------- prices by look ---------- */
const CSH_FASH = () => [...Object.keys(WINGS), ...Object.keys(typeof XMOUNT !== 'undefined' ? XMOUNT : {}), ...Object.keys(COSTUME).filter(k => ['top', 'head', 'mask'].includes(COSTUME[k].slot))];
const cshDef = id => COSTUME[id] || WINGS[id] || XCOS[id];
{ const sc = c => clamp(Math.round((30 + (c - 35) * 270 / 185) / 10) * 10, 30, 300), bySlot = {};
  for (const id of CSH_FASH()){ const d = cshDef(id); if (!d || d.src === 'free' || d.src === 'event' || d.src === 'tower' || d.src === 'inv') continue;
    const c0 = d.price && d.price.c ? d.price.c : d.tprice || 0; if (!c0) continue; d.price = {c:sc(c0)}; if (d.tprice) d.tprice = d.price.c; (bySlot[fwSlot(id)] = bySlot[fwSlot(id)] || []).push(d.price.c); }
  const med = s => { const a = (bySlot[s] || [150]).slice().sort((x, y) => x - y); return a[a.length >> 1]; };
  for (const id of CSH_FASH()){ const d = cshDef(id); if (!d || d.src === 'free' || d.src === 'event' || d.src === 'tower' || d.src === 'inv' || d.price) continue;
    d.price = {c:clamp(Math.round(med(fwSlot(id)) * 1.15 / 10) * 10, 30, 300)}; }   // reward pieces: a little above their slot's middle
}
/* ---------- no more free trial: preview only ---------- */
if (typeof COS_TRIAL !== 'undefined') COS_TRIAL.on = false;
function cshStrip(){ if (!S || !S.cos) return; let ch = false;
  for (const k in S.cos){ const id = S.cos[k]; if (typeof id === 'string' && cshDef(id) && !cosHave(id)){ S.cos[k] = null; ch = true; } }
  if (ch){ dirty = true; log(L('ระบบทดลองใช้ชุดฟรีปิดแล้ว · ถอดชิ้นที่ยังไม่ได้ซื้อออก (ลองดูได้ในตู้เสื้อผ้า ซื้อได้ที่ร้านค้าเหรียญ)', 'Free costume trials have ended · pieces not bought were taken off (preview them in the wardrobe, buy them in the Coin Shop)'), 'g');
    if (typeof NET !== 'undefined' && NET.pushPres) try { NET.pushPres(); } catch (e) {} if (typeof renderEquip === 'function' && UIS.open.equip) renderEquip(); } }
EV.on('map', cshStrip); { let once = false; EV.on('tick', () => { if (!once && S && S.lvl){ once = true; cshStrip(); } }); }
/* the wardrobe's words */
if (typeof renderWardrobe === 'function'){ const _rw = renderWardrobe; renderWardrobe = function(){ const r = _rw.apply(this, arguments);
    try { const p = document.getElementById('pane-equip'); if (p){ p.querySelectorAll('.fwfilter,.fwfempty').forEach(x => x.remove()); if (typeof FWF !== 'undefined' && FWF.mode !== 'all'){ FWF.mode = 'all'; if (typeof fwfApply === 'function') fwfApply(); }   // (v274) only owned pieces are listed: no All / Owned / New filter
 for (const h of p.querySelectorAll('.hint')) if (/ช่างตัดชุด|tailor/.test(h.textContent)) h.innerHTML = `${L('ชุดที่คุณมี · เป็นของทั้งบัญชี ทุกตัวละครใช้ได้ · ดูและซื้อชิ้นใหม่ที่ร้านค้าเหรียญ', 'Your costumes · shared by your whole account · browse and buy new ones in the Coin Shop')} <button class="btn sm" data-cshopen="1">◈ ${L('ร้านค้าเหรียญ', 'Coin Shop')}</button>`;
      for (const b of p.querySelectorAll('.cosit small')) if (b.textContent === L('ยังไม่มี', 'Locked')) b.innerHTML = `<span class="c272">◈ ${(cshDef(b.closest('[data-costry]').dataset.costry).price || {}).c || '—'}</span>`; } } catch (e) {}
    return r; }; }

/* ---------- the shop ---------- */
const CSH = {tab:'fash', sub:'wing', top:{}};
const CSH_TABS = [['fash', 'แฟชั่น', 'Fashion', '👘'], ['item', 'ของใช้', 'Items', '🧪'], ['bot', 'หุ่นผู้ช่วย', 'Robots', '🤖'], ['svc', 'บริการ', 'Services', '🎒'], ['topup', 'เติมเหรียญ', 'Top up', '💎']];
const CSH_PACKS = [[60, 0], [180, 10], [300, 30], [600, 80], [1500, 250], [3000, 600]];
const cshCoins = () => (typeof ACC !== 'undefined' && ACC.coins) || 0;
const cshPr = c => `<b class="c272">◈ ${fmtN(c)}</b>`;
function cshFashion(){
  const subs = FW_TABS, ids = fwIds(CSH.sub).filter(id => { const d = cshDef(id); return d && d.price && d.price.c; }).sort((a, b) => cshDef(a).price.c - cshDef(b).price.c);
  const own = ids.filter(cosHave).length;
  const sel = CSH.sel && cshDef(CSH.sel) ? CSH.sel : null, sd = sel && cshDef(sel);
  const stage = `<div class="cshstage"><canvas id="cshPrev"></canvas><div class="cshrot"><button class="ibtn" data-cshrot="-1" aria-label="${L('หมุนซ้าย', 'Turn left')}">‹</button><button class="ibtn" data-cshrot="1" aria-label="${L('หมุนขวา', 'Turn right')}">›</button></div>
    ${sel ? `<b>${itemName2(sel)}</b>${cosHave(sel) ? `<span class="ok">✓ ${L('มีแล้ว', 'Owned')}</span>` : `${cshPr(sd.price.c)}<button class="btn sm cgo" data-cshfash="${sel}" ${cshCoins() >= sd.price.c ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button>`}` : `<small>${L('กด «ลองดู» เพื่อดูบนตัวละคร', 'Tap «Preview» to see it on your hero')}</small>`}</div>`;
  return `<div class="cshfw">${stage}<div class="cshfr"><div class="cshsub">${subs.map(([k, th, en]) => `<button class="${k === CSH.sub ? 'on' : ''}" data-cshsub="${k}">${L(th, en)}</button>`).join('')}<span class="ct">${L('มีแล้ว', 'owned')} ${own}/${ids.length}</span></div>
    <div class="cshgrid">${ids.map(id => { const d = cshDef(id), have = cosHave(id), c = d.price.c;
      return `<div class="cshit${have ? ' own' : ''}${CSH.sel === id ? ' sel' : ''}"><i class="cosw" data-cth="${id}" style="--c1:${fwSwatch(id, 0)};--c2:${fwSwatch(id, 1)}"></i><b>${itemName2(id)}</b>
        <div class="cshp">${have ? `<span class="ok">✓ ${L('มีแล้ว', 'Owned')}</span>` : cshPr(c)}</div>
        <div class="cshb"><button class="btn sm" data-cshtry="${id}">${L('ลองดู', 'Preview')}</button>${have ? '' : `<button class="btn sm cgo" data-cshfash="${id}" ${cshCoins() >= c ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button>`}</div></div>`; }).join('')}</div>
    <p class="hint">${L('ชุดแฟชั่นไม่เปลี่ยนค่าพลัง · เป็นของทั้งบัญชี · «ลองดู» แสดงบนตัวละครทางซ้าย · ซื้อแล้วสวมได้ในตู้เสื้อผ้า (Q) · ชุดเทศกาลแลกได้เฉพาะช่วงเทศกาล', 'Costumes never change stats · shared by the whole account · «Preview» shows it on your hero at the left · wear what you buy from the wardrobe (Q) · festival pieces only during their festival')}</p></div></div>`;
}
function cshItems(){
  const ids = Object.keys(typeof COIN272 !== 'undefined' ? COIN272 : {}).filter(id => ITEMS[id] || GEAR[id]);
  const grp = [['coat_', 'ยาเคลือบอาวุธ (10 นาที)', 'Weapon oils (10 min)'], ['q_', 'ลูกธนูธาตุ (ห่อละ 500)', 'Element arrows (500 a pack)'], ['s_', 'ดาวกระจายธาตุ (ห่อละ 500)', 'Element stars (500 a pack)'], ['', 'ตีบวกและเจาะรู', 'Refining and sockets']];
  const used = new Set();
  return grp.map(([p, th, en]) => { const list = ids.filter(id => !used.has(id) && (p ? id.startsWith(p) : true)); list.forEach(id => used.add(id)); if (!list.length) return '';
    return `<div class="sec">${L(th, en)}</div><div class="cshgrid">${list.map(id => { const it = ITEMS[id] || GEAR[id], gr = GEAR[id], c = COIN272[id], lvOk = !gr || S.lvl >= gr.lv;
      return `<div class="cshit"><span class="cshic">${itemIcon(id)}</span><b>${nm(it)}</b><small>${gr ? `${gearStatText(gr.st)} · Lv ${gr.lv}` : escH((itemDesc(id) || '').replace(/<[^>]+>/g, '')).slice(0, 60)} · ${L('มี', 'have')} ${fmtN(S.inv[id] || 0)}</small>
        <div class="cshp">${cshPr(c)}${gr ? ` <small>/ ${fmtN(gr.pack || 1)}</small>` : ''}</div>
        <div class="cshb"><button class="btn sm cgo" data-cshitem="${id}" data-n="1" ${lvOk && cshCoins() >= c ? '' : 'disabled'}>×1</button><button class="btn sm cgo" data-cshitem="${id}" data-n="10" ${lvOk && cshCoins() >= c * 10 ? '' : 'disabled'}>×10</button></div></div>`; }).join('')}</div>`; }).join('');
}
function cshBots(){
  const h = typeof helperPaid === 'function' && helperPaid();
  return `${h ? `<div class="cshnow">${typeof hlpPic === 'function' ? hlpPic(h.k) : ''}<span>${L('กำลังเช่า', 'Renting')} <b>${HELPERS[h.k].en}</b> · ${L('เหลือ', 'left')} ${rentLeft(h.left)}</span></div>` : ''}
    <div class="cshgrid bots">${HLP_PAID.map(k => { const R = HELPERS[k];
      return `<div class="cshit bot"><span class="cshic botic"><img src="${botPic(k)}" alt=""></span><b>${R.en} <span class="ct">${R.th}</span></b><small><b class="hlpbuff">EXP +10% · JOB +10% · ${L(...R.buff)}</b></small>
        <div class="cshb">${RENT_TIME.map((t, i) => `<button class="btn sm cgo" data-rentpet="${k}" data-rt="${i}" ${cshCoins() >= rentPrice(k, i) ? '' : 'disabled'}>${L(t.th, t.en)} ◈${rentPrice(k, i)}</button>`).join('')}</div></div>`; }).join('')}</div>
    <p class="hint">${L('หุ่นไม่สู้ บินไปเก็บของให้วินาทีละชิ้น ของสำคัญก่อน · ทุกตัวใช้ฟรี ไม่หมดเวลา · เปลี่ยนตัวได้ตลอด ที่นี่หรือที่ลุงบุญมา นครอาเรน', 'Robots never fight; they fetch a drop a second, the most important first · every robot is free with no time limit · swap any time, here or with Uncle Boonma in Aren')}</p>`;
}
function cshServices(){
  const n = (S.bagX | 0), max = typeof BAGX !== 'undefined' && n >= BAGX.max, fee = typeof BAGX !== 'undefined' ? BAGX.price(n) : 0;
  return `<div class="cshgrid svc">
    <div class="cshit"><span class="cshic">🎒</span><b>${L('ขยายกระเป๋า +10 ช่อง', 'Bag +10 slots')}</b><small>${L('ตอนนี้', 'now')} ${typeof bagCap === 'function' ? bagCap() : '—'} ${L('ช่อง · ครั้งต่อไปแพงขึ้น', 'slots · each lot costs more')}</small>
      <div class="cshp">${max ? `<span class="ok">${L('เต็มที่แล้ว', 'Maxed')}</span>` : cshPr(fee)}</div><div class="cshb">${max ? '' : `<button class="btn sm cgo" data-bagx="1" ${cshCoins() >= fee ? '' : 'disabled'}>${L('ขยาย', 'Enlarge')}</button>`}</div></div></div>`;
}
function cshTopup(){
  return `<div class="cshtop"><b>${L('เติมเหรียญวายรา', 'Top up Vayra Coins')}</b><small>${L('ระบบเติมเหรียญกำลังจะเปิดเร็ว ๆ นี้', 'Top-ups are coming soon')}</small></div>
    <div class="cshgrid packs">${CSH_PACKS.map(([c, b], i) => `<div class="cshit pack t${i}"><span class="cshgem">◈</span><b>${fmtN(c)} ${L('เหรียญ', 'coins')}</b><small>${b ? `<span class="bonus">+${fmtN(b)} ${L('โบนัส', 'bonus')}</span>` : '&nbsp;'}</small>
      <div class="cshb"><button class="btn sm" disabled>${L('เร็ว ๆ นี้', 'Coming soon')}</button></div></div>`).join('')}</div>
    <div class="sec">${L('ได้เหรียญฟรีจากการเล่น', 'Earn coins by playing')}</div>
    <p class="hint">${L('ความสำเร็จ (หน้าต่างความสำเร็จ) · งานประจำแคมป์ งานละ 1 เหรียญ · ล้มบอสประจำแผนที่ 1–5 เหรียญ (วันละไม่เกิน 30) · บอสโลก การรุกราน หอคอย และกิจกรรมต่าง ๆ', 'Achievements · camp jobs, 1 coin each · map bosses 1–5 coins (up to 30 a day) · world bosses, invasions, the tower and events')}</p>`;
}
if (typeof PHI_WIDE !== 'undefined' && !PHI_WIDE.includes('cshop')) PHI_WIDE.push('cshop');   // the standard wide window shape (phi237.js)
mkWin('cshop', 'ร้านค้าเหรียญ', 'Coin Shop', '', '<path d="M4 7h12l-1 9H5z"/><path d="M7 7a3 3 0 016 0"/><path d="M10 10.5l1.4 1.4-1.4 1.4-1.4-1.4z"/>');
WIN_RENDER.cshop = function(){
  const pane = el('pane-cshop'); if (!pane || !S) return;
  const old = pane.querySelector('.cshfr') || pane.querySelector('.cshbody'); if (old) CSH.top[CSH.tab + CSH.sub] = old.scrollTop;   // (v276) on the fashion tab only the list scrolls
  const body = CSH.tab === 'fash' ? cshFashion() : CSH.tab === 'item' ? cshItems() : CSH.tab === 'bot' ? cshBots() : CSH.tab === 'svc' ? cshServices() : cshTopup();
  pane.innerHTML = `<div class="cshw"><nav class="cshtabs">${CSH_TABS.map(([k, th, en, ic]) => `<button class="${k === CSH.tab ? 'on' : ''}${k === 'topup' ? ' tu' : ''}" data-cshtab="${k}"><i>${ic}</i><span>${L(th, en)}</span></button>`).join('')}
      <div class="cshwal"><small>${L('เหรียญของคุณ', 'Your coins')}</small><b>◈ ${fmtN(cshCoins())}</b></div></nav>
    <div class="cshbody${CSH.tab === 'fash' ? ' fash' : ''}">${body}</div></div>`;
  const nb = pane.querySelector('.cshfr') || pane.querySelector('.cshbody'); if (nb) nb.scrollTop = CSH.top[CSH.tab + CSH.sub] || 0;   /* (v276) the columns fill the window by layout (no measured height: on some phones it stopped short) */
};
function cshBuyFash(id){
  const d = cshDef(id); if (!d || !d.price || cosHave(id)) return; const c = d.price.c;
  if (cshCoins() < c){ toast(L(`เหรียญวายราไม่พอ (ต้องใช้ ◈ ${c})`, `Not enough Vayra Coins (needs ◈ ${c})`)); return; }
  sysPrompt(L(`ซื้อ «${itemName2(id)}» ราคา ◈ ${c} เหรียญวายรา?`, `Buy «${itemName2(id)}» for ◈ ${c} Vayra Coins?`), () => {
    if (cosHave(id) || cshCoins() < c) return; ACC.coins -= c; (ACC.wardrobe = ACC.wardrobe || {})[id] = 1; if (typeof accSave === 'function') accSave(true);
    SFX.play('coin'); banner(L(`ได้ชุดแฟชั่นใหม่: ${itemName2(id)} · สวมได้ในตู้เสื้อผ้า (Q)`, `New look: ${itemName2(id)} · wear it in the wardrobe (Q)`));
    log(L(`ซื้อ ${itemName2(id)} · ◈ ${c}`, `Bought ${itemName2(id)} · ◈ ${c}`), 'g'); save(); reWin('cshop'); if (UIS.open.equip && typeof renderEquip === 'function') renderEquip(); });
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-cshtab],[data-cshsub],[data-cshfash],[data-cshtry],[data-cshitem],[data-cshgo]'); if (!t || t.disabled) return; const d = t.dataset;
  if (d.cshtab){ CSH.tab = d.cshtab; reWin('cshop'); }
  else if (d.cshsub){ CSH.sub = d.cshsub; reWin('cshop'); }
  else if (d.cshfash) cshBuyFash(d.cshfash);
  else if (d.cshtry){ CSH.sel = d.cshtry; reWin('cshop'); }
  else if (d.cshitem){ if (typeof coin272Buy === 'function'){ const id = d.cshitem; coin272Buy(id, GEAR[id] ? 'pack' : 'item', +d.n || 1); reWin('cshop'); } }
  
});
/* the preview stage: the wardrobe's own drawing (drawEquipPrev) pointed at the shop's canvas for a moment */
CSH.dir = 0;
function cshDraw(){ const cv = document.getElementById('cshPrev'); if (!cv || typeof drawEquipPrev !== 'function') return;
  const gi = document.getElementById, tab = EQ.tab, tr = EQ.try, dir = EQ.dir;
  document.getElementById = function(id){ return id === 'eqPrev' ? cv : gi.call(document, id); };
  try { EQ.tab = 'cos'; EQ.try = CSH.sel || null; EQ.dir = CSH.dir; drawEquipPrev(); } catch (e) {} finally { document.getElementById = gi; EQ.tab = tab; EQ.try = tr; EQ.dir = dir; } }
setInterval(() => { if (CSH.tab === 'fash' && winOpen('cshop')) cshDraw(); }, 90);   // wings flap, auras glow
document.addEventListener('click', e => { const r = e.target.closest && e.target.closest('[data-cshrot]'); if (!r) return; CSH.dir = (CSH.dir + +r.dataset.cshrot + SPR.DIRS.length) % SPR.DIRS.length; cshDraw(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-cshopen]'); if (!b) return; e.stopPropagation(); CSH.tab = 'fash'; if (typeof FW !== 'undefined' && FW_TABS.some(x => x[0] === FW.tab)) CSH.sub = FW.tab; openWin('cshop'); WIN_RENDER.cshop(); }, true);
/* anything bought elsewhere (robots, bag, other windows) refreshes the shop */
window.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-rentpet],[data-bagx],[data-cosbuy]') && winOpen('cshop')) setTimeout(() => reWin('cshop'), 60); }, true);

/* ---------- the button on the screen: left of the minimap ---------- */
{ const ui = document.getElementById('ui'); if (ui && !document.getElementById('cshBtn')) ui.insertAdjacentHTML('beforeend', `<button id="cshBtn" class="cshbtn" data-win-open="cshop" aria-label="${L('ร้านค้าเหรียญ', 'Coin Shop')}"><i>◈</i><span>${L('ร้านค้า', 'Shop')}</span><b id="cshBtnN">0</b></button>`); }
function cshPlace(){ const b = document.getElementById('cshBtn'), m = document.getElementById('mapCard'); if (!b) return;
  const show = S && S.job && !(typeof sq272Busy === 'function' && sq272Busy()) && !(typeof PHOTO !== 'undefined' && PHOTO.on); b.hidden = !show; if (!show || !m) return;
  const ui = document.getElementById('ui') || document.body, r = m.getBoundingClientRect(), ur = ui.getBoundingClientRect(), k = ui.offsetWidth ? ur.width / ui.offsetWidth : 1;   // the UI may be scaled (phones)
  const mw = r.width / k, z = clamp(mw / 175, .72, 1);   // as tall as a third of the minimap card, about
  b.style.setProperty('--z', z.toFixed(2)); let x = (r.left - ur.left) / k - 62 * z - 8, y = (r.top - ur.top) / k;
  /* (v274) on touch screens the folded menu sits just left of the minimap: never on top of it — go under it, right edges lined up */
  const rl = document.getElementById('rail'); if (rl && rl.offsetParent !== null){ const q = rl.getBoundingClientRect(), qx0 = (q.left - ur.left) / k, qx1 = (q.right - ur.left) / k, qy0 = (q.top - ur.top) / k, qy1 = (q.bottom - ur.top) / k;
    if (x < qx1 && x + 62 * z > qx0 && y < qy1 && y + 62 * z > qy0 && qy1 < (r.bottom - ur.top) / k){ x = qx1 - 62 * z; y = qy1 + 10; } }
  b.style.left = `${Math.round(x)}px`; b.style.top = `${Math.round(y)}px`;
  const n = document.getElementById('cshBtnN'), v = fmtN(cshCoins()); if (n && n.textContent !== v) n.textContent = v; }
setInterval(() => { try { cshPlace(); } catch (e) {} }, 500); window.addEventListener('resize', () => setTimeout(cshPlace, 50));
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#cshBtn'); if (!b) return; e.stopPropagation(); if (winOpen('cshop')) closeWin('cshop'); else { openWin('cshop'); WIN_RENDER.cshop(); } }, true);

{ const st = document.createElement('style'); st.textContent = `
#cshBtn.cshbtn{position:absolute;z-index:40;width:62px;height:62px;transform:scale(var(--z,1));transform-origin:top left;border:0;border-radius:16px;cursor:pointer;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
  background:radial-gradient(circle at 50% 30%,#6fd0ff,#1e64c8 70%,#123a80);box-shadow:0 0 0 2px #ffe6a0,0 0 0 3.5px #8a5a10,0 4px 10px rgba(0,0,0,.35),0 0 14px rgba(80,180,255,.6);color:#fff;font-family:var(--thai,sans-serif)}
#cshBtn i{font-style:normal;font-size:22px;line-height:1;text-shadow:0 0 8px #bff0ff,0 1px 0 #0a2a60;animation:cshPulse 2.4s ease-in-out infinite}
#cshBtn span{font-size:11px;font-weight:800;line-height:1.1;text-shadow:0 1px 0 #0a2a60}
#cshBtn b{position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);min-width:34px;padding:0 6px;border-radius:9px;background:#fff8e4;color:#1d4f9a;font:800 10.5px/16px var(--display,sans-serif);box-shadow:0 0 0 1.5px #c99a3a;white-space:nowrap}
#cshBtn:hover{filter:brightness(1.1)}#cshBtn:active{transform:scale(calc(var(--z,1) * .94))}
@keyframes cshPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
html.gr-still #cshBtn i{animation:none}
#pane-cshop .cshw{display:flex;gap:10px;min-height:0}
#pane-cshop .cshtabs{display:flex;flex-direction:column;gap:6px;flex:none;width:112px}
#pane-cshop .cshtabs button{display:flex;align-items:center;gap:6px;border:1px solid rgba(232,194,106,.55);background:linear-gradient(180deg,#2a3563,#171e3d);color:#f7edd6;border-radius:10px;padding:7px 9px;font:700 13px var(--thai,sans-serif);cursor:pointer;text-align:left}
#pane-cshop .cshtabs button i{font-style:normal;font-size:16px}
#pane-cshop .cshtabs button.on{background:linear-gradient(180deg,#fff0c2,#e8c26a 50%,#b8862f);color:#2a1a00;border-color:#fff0c2}
#pane-cshop .cshtabs button.tu:not(.on){background:linear-gradient(180deg,#3a8ae8,#1d4f9a);border-color:#9fd8ff}
#pane-cshop .cshwal{margin-top:auto;padding:6px 8px;border-radius:10px;background:linear-gradient(#1d4f9a,#123a70);color:#fff;text-align:center;box-shadow:inset 0 0 0 1.5px #9fd8ff}
#pane-cshop .cshwal small{display:block;font-size:10.5px;opacity:.85}#pane-cshop .cshwal b{font:800 16px var(--display,sans-serif);color:#bff0ff}
#pane-cshop .cshbody{flex:1;min-width:0;max-height:560px;overflow-y:auto;overscroll-behavior:contain;padding-right:4px}
#pane-cshop .cshsub{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px;position:sticky;top:0;z-index:2;padding:2px 0 6px;background:linear-gradient(#fdf6e8 80%,rgba(253,246,232,0))}
#pane-cshop .cshsub button{border:1.5px solid #c99a3a;background:#fffaf0;color:#4a2a08;border-radius:999px;padding:3px 12px;font:700 12.5px var(--thai,sans-serif);cursor:pointer}
#pane-cshop .cshsub button.on{background:#c99a3a;color:#fff}#pane-cshop .cshsub .ct{margin-left:auto}
#pane-cshop .cshgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
#pane-cshop .cshgrid.bots,#pane-cshop .cshgrid.svc{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
#pane-cshop .cshit{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 6px;border-radius:12px;background:linear-gradient(#fffaf0,#f6ead0);box-shadow:inset 0 0 0 1.5px #e3c486;text-align:center;min-width:0}
#pane-cshop .cshit.own{box-shadow:inset 0 0 0 2px #5ac08a;background:linear-gradient(#f4fff6,#e2f4e6)}
#pane-cshop .cshit > b{font-size:12.5px;line-height:1.25;color:#3a2206;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em}
#pane-cshop .cshit > small{font-size:10.5px;color:#7a5a30;line-height:1.3}
#pane-cshop .cshit .cosw{width:64px;height:64px;border-radius:12px}
#pane-cshop .cshic{width:48px;height:48px;display:grid;place-items:center;font-size:28px}#pane-cshop .cshic svg,#pane-cshop .cshic img{width:100%;height:100%}
#pane-cshop .cshp{font-size:14px}#pane-cshop .cshp .ok{color:#1f8a4e;font-weight:800;font-size:12px}
#pane-cshop .cshb{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
#pane-cshop .btn.cgo{background:linear-gradient(#5ab8ff,#2a6fd0) !important;color:#fff !important;border-color:#1d4f9a !important}#pane-cshop .btn.cgo:disabled{filter:grayscale(.6) brightness(.85)}
#pane-cshop .cshnow{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:6px 10px;border-radius:10px;background:rgba(90,184,255,.12);font-size:13px}#pane-cshop .cshnow .ic{width:36px;height:36px}
#pane-cshop .cshtop{display:flex;flex-direction:column;align-items:center;padding:12px;margin-bottom:10px;border-radius:14px;background:linear-gradient(120deg,#123a80,#2a6fd0 50%,#123a80);color:#fff}
#pane-cshop .cshtop b{font:800 18px var(--display,sans-serif);color:#bff0ff}#pane-cshop .cshtop small{opacity:.9}
#pane-cshop .cshit.pack{background:linear-gradient(#f4fbff,#dceefe);box-shadow:inset 0 0 0 1.5px #8ac4f0}
#pane-cshop .cshgem{font-size:34px;line-height:1;color:#2a8ae8;text-shadow:0 0 10px rgba(80,180,255,.7)}
#pane-cshop .pack.t3 .cshgem,#pane-cshop .pack.t4 .cshgem{color:#a050e8;text-shadow:0 0 12px rgba(180,100,255,.75)}#pane-cshop .pack.t5 .cshgem{color:#e8a020;text-shadow:0 0 14px rgba(255,200,80,.9)}
#pane-cshop .bonus{color:#d0501a;font-weight:800}
#pane-cshop .cshfw{display:flex;gap:10px;align-items:flex-start}#pane-cshop .cshfr{flex:1;min-width:0}
#pane-cshop .cshstage{position:sticky;top:0;flex:none;width:170px;display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px;border-radius:14px;text-align:center;
  background:radial-gradient(circle at 50% 38%,#fff6dc,#f3dfb0 60%,#e2c48a);box-shadow:inset 0 0 0 1.5px #d4b47a}
#pane-cshop .cshstage canvas{width:150px;height:auto;aspect-ratio:76/92;image-rendering:auto}
#pane-cshop .cshstage > b{font-size:13px;line-height:1.25;color:#3a2206}#pane-cshop .cshstage small{font-size:11px;color:#7a5a30}#pane-cshop .cshstage .ok{color:#1f8a4e;font-weight:800;font-size:12px}
#pane-cshop .cshrot{display:flex;gap:30px}#pane-cshop .cshrot .ibtn{width:28px;height:28px;font-size:18px}
#pane-equip .fwempty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 10px;color:#7a5a30;font-weight:700}
#pane-cshop .cshit.sel{box-shadow:inset 0 0 0 2.5px #2a8ae8,0 0 10px rgba(80,180,255,.5)}
/* (v276) balanced: the three columns (tabs · preview · list) run the full height of the window and line up top and bottom; only the list scrolls */
#pane-cshop{display:flex;flex-direction:column}
#pane-cshop .cshw{flex:1 1 auto;min-height:0;height:100%;align-items:stretch}
#pane-cshop .cshbody{max-height:none !important;align-self:stretch}
#pane-cshop .cshbody.fash{overflow:hidden;display:flex;padding-right:0}
#pane-cshop .cshbody.fash .cshfw{flex:1;min-height:0;align-items:stretch}
#pane-cshop .cshbody.fash .cshstage{position:static;justify-content:center;gap:8px}
#pane-cshop .cshbody.fash .cshfr{overflow-y:auto;overscroll-behavior:contain;padding-right:4px;min-height:0}
#pane-cshop .cshtabs button{white-space:nowrap;min-height:0}
#pane-cshop .cshrot .ibtn{width:30px !important;height:30px !important;min-width:0 !important;min-height:0 !important;padding:0 !important;font-size:18px;line-height:1}
#pane-cshop .cshstage small{line-height:1.35}
#pane-cshop .cshit{justify-content:space-between}
#pane-cshop .cshb{width:100%;flex-wrap:nowrap}
#pane-cshop .cshb .btn{flex:1 1 0;min-width:0 !important;min-height:0 !important;height:30px;padding:0 6px !important;font-size:12.5px}
#pane-cshop .cshgrid.bots .cshb .btn,#pane-cshop .cshgrid.svc .cshb .btn{height:30px}
@media (max-height:500px){#pane-cshop .cshstage{width:118px;padding:5px}#pane-cshop .cshstage canvas{width:100px}#pane-cshop .cshtabs{width:92px}#pane-cshop .cshtabs button{padding:5px 7px;font-size:12px}#pane-cshop .cshgrid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))}#pane-cshop .cshit .cosw{width:52px;height:52px}#pane-cshop .cshtabs button{font-size:11.5px;gap:4px}#pane-cshop .cshb .btn{height:28px;font-size:12px}#pane-cshop .cshrot .ibtn{width:26px !important;height:26px !important}}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'cshop', t:['ร้านค้าเหรียญวายรา', 'Vayra Coin Shop'], b:() => L(
  '<p>ปุ่ม ◈ ร้านค้า ข้างแผนที่เล็ก (หรือเมนู) · แยกหมวด: แฟชั่น (ปีก ส่วนหัว หน้ากาก ชุดเซต พาหนะ ◈30–300 ตามความอลังการ) · ของใช้ (ยาเคลือบ ลูกธนู/ดาวกระจายธาตุพิเศษ สว่านเพชร ยันต์คุ้มครอง) · หุ่นผู้ช่วยพรีเมียม · บริการ (ขยายกระเป๋า) · เติมเหรียญ (เร็ว ๆ นี้) · ชุดแฟชั่นลองดูได้ในตู้เสื้อผ้า แต่ใส่ออกไปข้างนอกต้องซื้อ</p>',
  '<p>The ◈ Shop button beside the minimap (or the menu) · sections: Fashion (wings, headpieces, masks, outfits, mounts, ◈30–300 by how grand they are) · Items (oils, special arrows/stars, Diamond Drill, Refine Ward) · premium robots · Services (bag slots) · Top up (coming soon) · costumes can be previewed in the wardrobe but must be bought to wear</p>')});
