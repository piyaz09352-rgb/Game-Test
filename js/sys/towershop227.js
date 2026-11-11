/* VAYRATHEN — js/sys/towershop227.js — (v227) tower tokens, the tower shop and milestone pieces
   Climbing paid only Bia, a few Vayra Coins and a boss-table piece now and then. Now:
   · TOWER TOKENS (เหรียญหอคอย): every floor you clear gives 1 (+1 for every 20 floors up), a guardian floor 3×,
     every chest in a treasure room 1 more. Kept per character (S.tower.tok); shown in the tower window and the
     run summary.
   · THE TOWER SHOP (in the tower window): wardrobe pieces found nowhere else — the Tower Guardian outfit, the Dawn
     Sandstone crown, Kanok tower wings — and potions for the climb.
   · MILESTONES: your best floor unlocks a piece no one can buy — floor 50: the Indigo Night crown · floor 75: the
     Golden Heaven wings · floor 100: the Floating Stone Dais mount (and the title «เจ้าแห่งหอคอย»).
   Wardrobe pieces go to the account's wardrobe like the story pieces (the tailor does not sell them). */
'use strict';

/* ---------- the pieces ---------- */
{ const M = SPR.M, mm = (n, f = 'white') => (M[n] != null ? n : f), m = n => M[mm(n)];
  const tops = {tws_top:['ชุดเกราะผู้พิทักษ์หอคอย', 'Tower Guardian Raiment', fSet('court', mm('sand', 'cream'), mm('scarlet'), mm('gold'), FT.combo(FT.kanok(m('gold')), FT.hem(m('scarlet'))))]};
  const parts = {
    tws_crown:['head', 'มงกุฎศิลาอรุณ', 'Dawn Sandstone Crown', {hat:'crown', hatMat:mm('goldLight', 'gold'), crestMat:mm('sunset', 'scarlet'), crestN:7}],
    tws_night:['head', 'มงกุฎราตรีคราม', 'Indigo Night Crown', {hat:'crown', hatMat:mm('midnight', 'navy'), crestMat:mm('iceGlow', 'sky'), crestN:9}]
  };
  for (const id in tops){ const [th, en, look] = tops[id]; COSTUME[id] = {slot:'top', th, en, src:'tower', grand:true, sw:[look.top, look.forearm], look}; SPR.GEAR_LOOK[id] = look; }
  for (const id in parts){ const [slot, th, en, look] = parts[id]; COSTUME[id] = {slot, th, en, src:'tower', grand:false, sw:[look.hatMat, look.crestMat], look}; SPR.GEAR_LOOK[id] = look; }
  WINGS.tws_kanok = {set:null, th:'ปีกกนกหอคอย', en:'Kanok Tower Wings', kind:'kanok', c:['#fff4d0', '#e3b04b', '#a8322a'], edge:'#ffe9a0', glow:'255,200,110', fx:'sparkle', span:1, story:true};
  WINGS.tws_heaven = {set:null, th:'ปีกสวรรค์ทอง', en:'Golden Heaven Wings', kind:'ether', c:['#ffffff', '#ffe9a0', '#ffcf3a'], edge:'#fff6d0', glow:'255,230,150', fx:'sparkle', span:1.1, story:true};
  const dais = {slot:'mount', th:'แท่นศิลาลอยฟ้า', en:'Floating Stone Dais', kind:'twdais', lift:10, c:['#d8c09a', '#e3b04b'], story:true};
  XMOUNT.tws_dais = dais; XCOS.tws_dais = dais;
  if (typeof COS_SRC !== 'undefined') COS_SRC.tower = ['หอคอยวายรา (เหรียญหอคอย / ชั้นหลักไมล์)', 'Vayra Tower (tower tokens / milestone floors)'];
}
// the dais: a round slab of the tower's stone floating under you, a gold rune ring turning on it, two little braziers
MOUNT_X.twdais = function(g, M, x, by, dir, t){
  const [stone, gold] = M.c, bob = Math.sin(t * 2) * 1.4, y = by + 6 + bob;
  fxGlow(g, x, by + 14, 24, 8, '255,200,110', .3);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, by + 15, 18, 5, 0, 0, 7); g.fill();
  g.fillStyle = '#8a6a44'; g.beginPath(); g.ellipse(x, y + 4, 21, 7, 0, 0, Math.PI); g.lineTo(x - 21, y); g.ellipse(x, y, 21, 7, 0, Math.PI, 0, true); g.closePath(); g.fill();   // the slab's side
  g.fillStyle = stone; g.beginPath(); g.ellipse(x, y, 21, 7, 0, 0, 7); g.fill(); g.strokeStyle = '#8a6a44'; g.lineWidth = .8; g.stroke();
  g.strokeStyle = gold; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, 14, 4.6, 0, 0, 7); g.stroke();
  for (let i = 0; i < 8; i++){ const a = t * .8 + i / 8 * 6.283; g.fillStyle = gold; g.fillRect(x + Math.cos(a) * 14 - .8, y + Math.sin(a) * 4.6 - .8, 1.6, 1.6); }
  for (const d of [-1, 1]){ const bx = x + d * 17, byy = y - 1; g.fillStyle = '#5a3a1e'; g.fillRect(bx - 1.2, byy - 6, 2.4, 6); g.fillStyle = gold; g.fillRect(bx - 2.4, byy - 7, 4.8, 1.6);
    const fl = 1 + Math.sin(t * 12 + d) * .15; g.fillStyle = '#ffb04a'; g.beginPath(); g.ellipse(bx, byy - 9, 1.6 * fl, 2.6 * fl, 0, 0, 7); g.fill(); g.fillStyle = '#fff2a8'; g.beginPath(); g.ellipse(bx, byy - 8.6, .8, 1.3, 0, 0, 7); g.fill(); }
};

/* ---------- tokens ---------- */
const twsTok = () => { const s = twSt(); s.tok = s.tok | 0; return s; };
const twsFloorTok = f => (1 + Math.floor(f / 20)) * (f % 5 === 0 ? 3 : 1);
function twsGive(n, why){ if (n <= 0) return; const s = twsTok(); s.tok += n; TW.gain.tok = (TW.gain.tok || 0) + n; dirty = true; if (why) addText(P.x, P.y - 110, `+${n} 🗼 ${why}`, '#c8b8ff', 13); }
{ const _tc = twClear; twClear = function(){ const f = TW.f, before = TW.phase; const r = _tc.apply(this, arguments); if (before === 'fight' && TW.phase === 'rest' && TW.f === f + 1) twsGive(twsFloorTok(f), L('เหรียญหอคอย', 'tower tokens')); twsMilestones(); return r; }; }
// a chest in the treasure room: one token more
{ let last = 0; EV.on('tick', () => { if (typeof TWF === 'undefined' || TWF.kind !== 'treasure' || TWF.f !== TW.f) { last = 0; return; } const n = TWF.chests.filter(c => c.open).length; if (n > last){ twsGive(n - last); } last = n; }); }
// the run summary lists the tokens
{ const _s = twSummary; twSummary = function(){ const r = _s.apply(this, arguments); const box = document.getElementById('twSum'), n = TW.end && TW.end.gain && TW.end.gain.tok; if (box && n){ const li = document.createElement('li'); li.innerHTML = `${L('เหรียญหอคอย', 'Tower tokens')} <b>+${n} 🗼</b>`; const ul = box.querySelector('ul'); if (ul) ul.appendChild(li); } return r; }; }
{ const _f = twFinish; twFinish = function(){ const g = TW.gain.tok; const r = _f.apply(this, arguments); if (TW.end && g) TW.end.gain.tok = g; TW.gain.tok = 0; return r; }; }

/* ---------- the shop and the milestones ---------- */
const TWS_SHOP = [['tws_top', 300], ['tws_crown', 150], ['tws_kanok', 500], ['whitepot', 12, 10], ['bigbluepot', 15, 10]];
const TWS_MILE = [[50, 'tws_night'], [75, 'tws_heaven'], [100, 'tws_dais']];   // (v255) the tower ends at 100: the wings moved from 150 to 75
const twsPiece = id => COSTUME[id] || WINGS[id] || XCOS[id];
const twsHave = id => COSTUME[id] ? (typeof cosHave === 'function' && cosHave(id)) : !!(ACC.wardrobe && ACC.wardrobe[id]);
function twsGrant(id){ if (COSTUME[id]) return typeof cosGrant === 'function' ? cosGrant(id) : false; const w = ACC.wardrobe = ACC.wardrobe || {}; if (w[id]) return false; w[id] = 1; if (typeof accSave === 'function') accSave(); return true; }
function twsMilestones(){ const b = twSt().best || 0; for (const [f, id] of TWS_MILE) if (b >= f && !twsHave(id) && twsGrant(id)){ const d = twsPiece(id); banner(L(`หอคอยชั้น ${f}! ได้ ${d.th}`, `Tower floor ${f}! ${d.en} unlocked`)); SFX.play('ach'); } }
function twsHTML(){
  const s = twsTok(), b = s.best || 0;
  const name = id => { const d = twsPiece(id), it = ITEMS[id]; return d ? L(d.th, d.en) : it ? nm(it) : id; };
  const kindOf = id => (COSTUME[id] ? L({top:'ชุด', head:'หมวก', mask:'หน้ากาก'}[COSTUME[id].slot] || 'ชุด', {top:'Outfit', head:'Headwear', mask:'Mask'}[COSTUME[id].slot] || 'Outfit') : WINGS[id] ? L('ปีก', 'Wings') : XCOS[id] ? L('สัตว์ขี่', 'Mount') : L('ไอเทม', 'Item'));
  const shop = TWS_SHOP.map(([id, price, n]) => { const own = !n && twsHave(id), can = s.tok >= price && !own;
    return `<div class="twsr${own ? ' own' : ''}"><div><b>${name(id)}${n ? ` ×${n}` : ''}</b><small>${kindOf(id)}${own ? ` · ${L('มีแล้ว', 'owned')}` : ''}</small></div><span>${price} 🗼</span><button class="btn sm${can ? ' gold' : ''}" data-twsbuy="${id}" ${can ? '' : 'disabled'}>${own ? '✓' : L('แลก', 'Get')}</button></div>`; }).join('');
  const mile = TWS_MILE.map(([f, id]) => { const got = twsHave(id); return `<div class="twsr${got ? ' own' : ''}"><div><b>${L(`ชั้น ${f}`, `Floor ${f}`)} · ${name(id)}</b><small>${kindOf(id)} · ${L('แลกไม่ได้ ได้จากการปีนถึงเท่านั้น', 'cannot be bought, only climbed for')}</small></div><span>${got ? '✓' : `${Math.min(b, f)}/${f}`}</span></div>`; }).join('');
  return `<div class="twsec">${L('ร้านหอคอย', 'Tower shop')} · <span class="twtok">${s.tok} 🗼 ${L('เหรียญหอคอย', 'tower tokens')}</span></div><div class="twshop">${shop}</div>
    <div class="twsec">${L('รางวัลชั้นหลักไมล์', 'Milestone floors')}</div><div class="twshop">${mile}</div>
    <p class="hint">${L('ผ่านชั้นละ 1 เหรียญ (+1 ทุก 20 ชั้น) · ชั้นผู้พิทักษ์ ×3 · หีบในห้องสมบัติใบละ 1', '1 token a floor (+1 every 20 floors up) · guardian floors ×3 · 1 per treasure-room chest')}</p>`;
}
{ const _r = WIN_RENDER.tower; WIN_RENDER.tower = function(){ const r = _r.apply(this, arguments); const pane = el('pane-tower'), sec = pane && [...pane.querySelectorAll('.twsec')].pop();
    if (pane && !pane.querySelector('.twshop')){ const box = document.createElement('div'); box.className = 'twshopbox'; box.innerHTML = twsHTML(); const det = pane.querySelector('.twrules'); if (det) det.before(box); else if (sec) sec.before(box); }
    return r; }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-twsbuy]'); if (!t || t.disabled) return;
  const id = t.dataset.twsbuy, row = TWS_SHOP.find(x => x[0] === id), s = twsTok(); if (!row || s.tok < row[1]) return;
  if (row[2]){ s.tok -= row[1]; addItem(id, row[2]); toast(L(`ได้ ${nm(ITEMS[id])} ×${row[2]}`, `Got ${nm(ITEMS[id])} ×${row[2]}`)); }
  else { if (twsHave(id)) return; s.tok -= row[1]; twsGrant(id); const d = twsPiece(id); toast(L(`ได้ ${d.th} · ใส่ได้ที่หน้าต่างแฟชั่น`, `Got ${d.en} · wear it from the wardrobe`)); }
  SFX.play('coin'); dirty = true; save(); if (typeof reWin === 'function') reWin('tower'); });
// the new title at floor 100 (10, 50 and 75 already have theirs)
if (typeof ACH !== 'undefined' && typeof ACH_BY !== 'undefined' && !ACH_BY.tower100){ const a = {id:'tower100', cat:'hunt', tier:3, th:'เจ้าแห่งหอคอย', en:'Lord of the Tower', dth:'ผ่านหอคอยวายราชั้น 100', den:'Clear floor 100 of the Vayra Tower', prog:() => [(S.tower && S.tower.best) || 0, 100], coin:60, title:['เจ้าแห่งหอคอย', 'Lord of the Tower']}; ACH.push(a); ACH_BY.tower100 = a; }
{ const st = document.createElement('style'); st.textContent = `.twshop{display:flex;flex-direction:column;gap:4px}.twsr{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:5px 8px;border-radius:9px;background:#f7f4ff;border:1px solid #e6defc}
  .twsr b{display:block;font-size:13px}.twsr small{color:#6a5a8a;font-size:11px}.twsr span{font-weight:800;color:#5a2ad8;white-space:nowrap}.twsr.own{opacity:.7}.twtok{color:#5a2ad8;font-weight:800}`; document.head.appendChild(st); }
