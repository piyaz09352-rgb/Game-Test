/* VAYRATHEN — js/sys/prices272.js — (v273) the owner's price list
   Money was too easy to keep (too-cheap shop goods inflate the economy), so prices are set by hand here:
   · Vayra Coin only: weapon oils (3 coins, holy/shadow 5) · wind/earth arrows and stars (5 coins per 500) ·
     holy/shadow arrows and stars (8 coins per 500) · Diamond Drill (30) · Refine Ward (50).
     Their Bia price becomes unreachable (COIN272_Z), so no old Bia path can sell them; the shops show ◈ and take coins.
   · Bia: Golden Drill 1,000,000 · Socket Drill 100,000 · Card Guard Stone 100,000 · All-size Strike Potion 20,000 ·
     Garuda Feather 100,000 · Smith's Lucky Stone 1,000,000 · cooking and brewing 10,000 a bottle (or dish).
   · New: Swiftness Potion (+15% attack speed, 10 min) 20,000 at the potion shop.
   · The Return Talisman is gone: not sold, not brewed, not a reward; any you held is refunded at 250 Bia each.
     Going home: the Shrine Keeper of every camp warps you to Aren for free (Auto walks there by itself). */
'use strict';
const COIN272_Z = 1e12;
const COIN272 = {coat_fire:3, coat_water:3, coat_wind:3, coat_earth:3, coat_poison:3, coat_holy:5, coat_shadow:5,
  q_wind:5, q_earth:5, s_wind:5, s_earth:5, q_holy:8, q_shadow:8, s_holy:8, s_shadow:8, drill_d:30, rf_guard:50};
const COIN272_PACK = 500;   // coin arrows and stars come 500 to a pack
for (const id in COIN272){ const it = ITEMS[id], gr = typeof GEAR !== 'undefined' && GEAR[id];
  if (it) it.buy = COIN272_Z; if (gr){ gr.buy = COIN272_Z; gr.pack = COIN272_PACK; } }
const coin272 = id => COIN272[id] || 0;
const coins272 = () => (typeof ACC !== 'undefined' && ACC.coins) || 0;
/* Bia prices */
for (const [id, z] of [['drill_g', 1e6], ['drill_i', 1e5], ['cardguard', 1e5], ['sizepot', 2e4], ['garudafeather', 1e5], ['rf_luck', 1e6]]) if (ITEMS[id]) ITEMS[id].buy = z;
/* cooking and brewing: 10,000 a batch-unit (one bottle or dish) */
if (typeof CK_RCP !== 'undefined'){
  for (let i = CK_RCP.length - 1; i >= 0; i--){ const r = CK_RCP[i]; if (r.out === 'talisman'){ CK_RCP.splice(i, 1); if (typeof CK_R !== 'undefined') delete CK_R[r.id]; continue; } r.fee = 10000 * (r.n || 1); } }
/* the Return Talisman leaves the game */
if (ITEMS.talisman){ ITEMS.talisman.buy = 0; ITEMS.talisman.sell = 250; }
{ const _ai = addItem; addItem = function(id, n){ if (id === 'talisman'){ const k = Math.max(1, n | 0); S.bia += 250 * k; dirty = true; return; } return _ai.apply(this, arguments); }; }
EV.on('tick', () => { if (S && S.inv && S.inv.talisman > 0){ const k = S.inv.talisman; delete S.inv.talisman; S.bia += 250 * k; dirty = true;
  if (S.hot) for (let i = 0; i < S.hot.length; i++) if (S.hot[i] === 'talisman') S.hot[i] = null;
  log(L(`ยันต์กลับบ้านถูกนำออกจากเกม · คืนเงิน ${fmtN(250 * k)} เบี้ย (${k} อัน) · กลับเมืองฟรีที่ผู้เฝ้าศาลทุกแคมป์`, `The Return Talisman was retired · ${fmtN(250 * k)} Bia refunded (${k}) · go home free at any camp's Shrine Keeper`), 'g');
  if (typeof toast === 'function') toast(L(`คืนเงินยันต์กลับบ้าน ${fmtN(250 * k)} เบี้ย`, `Return Talismans refunded: ${fmtN(250 * k)} Bia`)); } });

/* the Swiftness Potion: +15% attack speed for 10 minutes */
ITEMS.aspdpot = {name:'ยาเร่งความเร็วโจมตี', en:'Swiftness Potion', buy:20000, sell:2000, kind:'use', aspdPot:600,
  desc:['10 นาที: ความเร็วโจมตี +15% · ดื่มซ้ำ = นับ 10 นาทีใหม่', '10 minutes: +15% attack speed · drinking another restarts the 10 minutes']};
if (typeof IA_POT !== 'undefined') IA_POT.aspdpot = [['#fff6d8', '#ffb43a', '#8a4a06'], 'tall'];
if (typeof BUFF_TH !== 'undefined') BUFF_TH.aspdpot = ['เร่งความเร็วโจมตี', 'Swiftness'];
if (typeof BUFF_CAP !== 'undefined') BUFF_CAP.aspdpot = ['เร็ว+15%', 'ASPD+15%'];
if (typeof BUFF_IC !== 'undefined') BUFF_IC.aspdpot = ['#ffb43a', '<path d="M11 2L4 11h5l-1 7 7-9h-5z"/>'];
const aspdPotOn = () => !!(typeof P !== 'undefined' && P.buffs && P.buffs.aspdpot && P.buffs.aspdpot.t > 0);
{ const _u = useItem; useItem = function(id){ const it = ITEMS[id];
    if (!it || !it.aspdPot) return _u.apply(this, arguments);
    if (!S.inv[id] || P.dead || P.itemCd > 0) return;
    addBuff('aspdpot', {t:it.aspdPot}); S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; P.itemCd = .3; dirty = true; derive();
    SFX.play('potion'); addText(P.x, P.y - 50, L('ความเร็วโจมตี +15%', 'Attack speed +15%'), '#ffc870', 14);
    log(L('ดื่มยาเร่งความเร็วโจมตี · 10 นาที ความเร็วโจมตี +15%', 'Swiftness Potion · 10 minutes of +15% attack speed'), 'g');
    if (typeof renderHotbar === 'function') renderHotbar(); }; }
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments);
    try { if (aspdPotOn() && DER && DER.pas) DER.pas.aspdPct = (DER.pas.aspdPct || 0) + .15; } catch (e) {} return r; }; }
{ let was = false; EV.on('tick', () => { const on = aspdPotOn(); if (on !== was){ was = on; if (!on && S && S.job) derive(); } }); }

/* ---------- buying with coins ---------- */
const coin272Btn = (id, kind, n) => { const c = coin272(id) * n, lvOk = kind !== 'pack' || !GEAR[id] || S.lvl >= GEAR[id].lv;
  return `<button class="btn sm gold qgo cgo" data-cbuy="${id}" data-qk="${kind}" ${lvOk && coins272() >= c ? '' : 'disabled'}>${L('ซื้อ', 'Buy')} <b class="qsum">◈ ${fmtN(c)}</b></button>`; };
{ const _qb = qtyBox; qtyBox = function(id, kind = 'item'){ if (!coin272(id)) return _qb.apply(this, arguments);
    const h = _qb.call(this, id, kind), n = QTY.last[id] || 1;
    return h.replace(/<button class="btn sm gold qgo"[\s\S]*<\/button>\s*$/, coin272Btn(id, kind, n)).replace('class="qty"', 'class="qty cq"'); }; }
{ const _qs = qtySet; qtySet = function(box, n){ const r = _qs.apply(this, arguments); const id = box && box.dataset.qty;
    if (coin272(id)){ const go = box.parentElement.querySelector(`[data-cbuy="${CSS.escape(id)}"]`), k = qtyOf(box), kind = box.dataset.qk;
      if (go){ go.querySelector('.qsum').textContent = '◈ ' + fmtN(coin272(id) * k); const lvOk = kind !== 'pack' || !GEAR[id] || S.lvl >= GEAR[id].lv; go.disabled = !lvOk || coins272() < coin272(id) * k; } }
    return r; }; }
function coin272Buy(id, kind, n){
  const unit = coin272(id), cost = unit * n; if (!unit || n < 1) return;
  const gr = typeof GEAR !== 'undefined' && GEAR[id];
  if (gr && S.lvl < gr.lv){ toast(L(`ต้อง Lv ${gr.lv}`, `Needs Lv ${gr.lv}`)); return; }
  if (coins272() < cost){ toast(L(`เหรียญวายราไม่พอ (ต้องใช้ ◈ ${fmtN(cost)})`, `Not enough Vayra Coins (needs ◈ ${fmtN(cost)})`)); return; }
  ACC.coins -= cost; if (typeof accSave === 'function') accSave(true);
  const got = gr && gr.slot === 'ammo' ? (gr.pack || 1) * n : n; addItem(id, got);
  if (gr && gr.slot === 'ammo' && typeof ammoFits === 'function' && ammoFits(id) && (!S.gear.ammo || !S.inv[S.gear.ammo] || !ammoFits(S.gear.ammo))){ S.gear.ammo = id; derive(); }
  SFX.play('coin'); log(L(`ซื้อ ${nm(ITEMS[id] || gr)} ×${fmtN(got)} · ◈ ${fmtN(cost)} เหรียญวายรา`, `Bought ${nm(ITEMS[id] || gr)} ×${fmtN(got)} · ◈ ${fmtN(cost)} Vayra Coins`), 'g');
  toast(L(`ซื้อแล้ว ×${fmtN(got)}`, `Bought ×${fmtN(got)}`)); dirty = true; save();
  if (typeof renderBag === 'function') try { renderBag(); } catch (e) {}
  const d = document.getElementById('dialog'), fg = el('win-forge');
  if (fg && !fg.hidden && typeof WIN_RENDER !== 'undefined' && WIN_RENDER.forge) WIN_RENDER.forge();
  else if (d && !d.hidden && d.dataset.npc){ const npc = NPCS.find(x => x.id === d.dataset.npc); if (npc) openNpc(npc); }
}
/* clicks: window capture runs before the shops' own document listeners */
window.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-cbuy],.qty.cq [data-qmax],[data-buygear],[data-fgbuy]'); if (!t) return;
  if (t.dataset.cbuy){ e.preventDefault(); e.stopPropagation(); if (t.disabled) return; const box = t.parentElement.querySelector(`.qty[data-qty="${CSS.escape(t.dataset.cbuy)}"]`);
    coin272Buy(t.dataset.cbuy, t.dataset.qk, box ? qtyOf(box) : 1); return; }
  if (t.dataset.qmax){ e.preventDefault(); e.stopPropagation(); const box = t.closest('.qty'), u = coin272(box.dataset.qty); qtySet(box, u ? Math.max(1, Math.floor(coins272() / u)) : 1); return; }
  const id = t.dataset.buygear || t.dataset.fgbuy; if (coin272(id)){ e.preventDefault(); e.stopPropagation(); coin272Buy(id, GEAR[id] ? 'pack' : 'item', 1); }
}, true);
/* every shop row of a coin item shows its coin price; old one-click buttons (armourer, camp) are enabled by coins */
function coin272Dress(root){
  for (const q of root.querySelectorAll('.srow')){ if (q.dataset.c272) continue;
    const b = q.querySelector('[data-cbuy],[data-buygear],[data-fgbuy],.qty[data-qty]'); if (!b) continue;
    const id = b.dataset.cbuy || b.dataset.buygear || b.dataset.fgbuy || b.dataset.qty; if (!coin272(id)) continue; q.dataset.c272 = 1;
    const pr = q.querySelector('.pr'), gr = typeof GEAR !== 'undefined' && GEAR[id];
    if (pr) pr.innerHTML = `<span class="c272">◈ ${fmtN(coin272(id))}</span>${gr && gr.slot === 'ammo' ? `<small> /${fmtN(gr.pack || 1)}</small>` : ''}`;
    for (const o of q.querySelectorAll('[data-buygear],[data-fgbuy]')) o.disabled = (gr && S.lvl < gr.lv) || coins272() < coin272(id);
    for (const o of q.querySelectorAll('.qty.cq')) qtySet(o, qtyOf(o));
    const sm = q.querySelector('.nm small'); if (sm && gr && gr.slot === 'ammo') sm.innerHTML = sm.innerHTML.replace(/(ห่อละ |)\b100\b( ดอก| ดวง| per pack)/, `$1${gr.pack}$2`); }
}
{ let qd = false; new MutationObserver(() => { if (qd) return; qd = true; requestAnimationFrame(() => { qd = false; try { coin272Dress(document.body); } catch (e) {} }); })
    .observe(document.body, {childList:true, subtree:true}); }
/* the potion shop sells the Swiftness Potion next to the All-size potion */
if (typeof openNpc === 'function'){ const _o = openNpc; openNpc = function(n){ const r = _o.apply(this, arguments);
    try { const d = document.getElementById('dialog'); if (d && !d.hidden && n && ITEMS.aspdpot && !d.querySelector('[data-qty="aspdpot"]')){ const anchor = d.querySelector('.srow:has([data-qty="sizepot"])');
      if (anchor){ const it = ITEMS.aspdpot; anchor.insertAdjacentHTML('afterend', `<div class="srow"><span class="ic">${itemIcon('aspdpot')}</span><div class="nm"><b>${nm(it)}</b><small>${itemDesc('aspdpot')} · ${L('มี', 'have')} ${(S.inv.aspdpot || 0).toLocaleString()}</small></div><span class="pr">${it.buy.toLocaleString()}</span>${qtyBox('aspdpot', 'item')}</div>`); } } } catch (e) {}
    return r; }; }
{ const st = document.createElement('style'); st.textContent = '.c272{color:#9fe0ff;font-weight:800;text-shadow:0 0 6px rgba(80,180,255,.45)}.qgo.cgo{background:linear-gradient(#5ab8ff,#2a6fd0) !important;color:#fff !important;border-color:#1d4f9a !important}.qgo.cgo:disabled{filter:grayscale(.6) brightness(.85)}';
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'prices273', t:['ของที่ซื้อด้วยเหรียญวายรา', 'Bought with Vayra Coins'], b:() => L(
  '<p>ยาเคลือบอาวุธ ◈ 3 (ศักดิ์สิทธิ์ / มืด ◈ 5) · ลูกธนูและดาวกระจายธาตุลม / ดิน ◈ 5 ต่อ 500 · ศักดิ์สิทธิ์ / มืด ◈ 8 ต่อ 500 · สว่านเพชร ◈ 30 · ยันต์คุ้มครองตีบวก ◈ 50 · ลูกธนูธรรมดา ไฟ น้ำ ยังซื้อด้วยเบี้ย · เหรียญได้จากความสำเร็จ งานแคมป์ และบอส</p><p>ยาเร่งความเร็วโจมตี +15% 10 นาที 20,000 เบี้ย ที่ร้านยา · ยันต์กลับบ้านถูกนำออกแล้ว: คุยกับผู้เฝ้าศาลที่แคมป์เพื่อกลับเมืองฟรี</p>',
  '<p>Weapon oils ◈ 3 (holy / shadow ◈ 5) · wind / earth arrows and stars ◈ 5 per 500 · holy / shadow ◈ 8 per 500 · Diamond Drill ◈ 30 · Refine Ward ◈ 50 · plain, fire and water arrows still cost Bia · coins come from achievements, camp jobs and bosses</p><p>Swiftness Potion +15% attack speed for 10 min, 20,000 Bia at the potion shop · the Return Talisman is gone: the Shrine Keeper at any camp takes you home for free</p>')});
/* the item card names the coin price, not the unreachable Bia one */
if (typeof itCard === 'function'){ const _ic = itCard; itCard = function(id){ let h = _ic.apply(this, arguments);
    try { const base = String(id).split('~')[0]; if (coin272(base)) h = h.replace(new RegExp(`${fmtN(COIN272_Z).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[^<]*`), `◈ ${fmtN(coin272(base))}${GEAR[base] && GEAR[base].slot === 'ammo' ? ' / ' + fmtN(GEAR[base].pack) : ''}`); } catch (e) {}
    return h; }; }
