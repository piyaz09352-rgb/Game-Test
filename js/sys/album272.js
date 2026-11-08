/* VAYRATHEN — js/sys/album272.js — (v272) สมุดสะสมวัตถุดิบ · the materials album
   Every monster's material now has a picture of its own (itemart270.js), so they can be collected: the album lists
   them land by land; one you have ever held is shown in colour, one you have not is a dark shape with a "?".
   Completing a land's page earns that land's collector title (an achievement); the whole album earns one more.
   Titles only — no money, no items — so the harder drops (v269) are not undone.
   Saved per character: S.album = {item id: 1}. Anything already in the bag counts when the album first opens. */
'use strict';
const ALB = {land:null, sets:null};
function albSets(){
  if (ALB.sets) return ALB.sets; const sets = {}, seen = new Set();
  MAPS.forEach((mp, i) => { if (!mp || !mp.land || mp.land === 'capital' || !mp.mobs || (typeof isTown === 'function' && isTown(i))) return;
    for (const k of mp.mobs){ const id = 'm_' + k; if (!ITEMS[id] || seen.has(id)) continue; seen.add(id); (sets[mp.land] = sets[mp.land] || []).push(id); } });
  return (ALB.sets = sets);
}
const albHave = id => !!(S && S.album && S.album[id]);
const albCount = land => { const l = albSets()[land] || []; return [l.filter(albHave).length, l.length]; };
const albAll = () => { let a = 0, b = 0; for (const k in albSets()){ const [x, y] = albCount(k); a += x; b += y; } return [a, b]; };
function albMark(id){ if (!S || !id || !/^m_/.test(id) || !ITEMS[id]) return; S.album = S.album || {}; if (S.album[id]) return; S.album[id] = 1; dirty = true;
  if (ALB.seeded){ const land = Object.keys(albSets()).find(k => albSets()[k].includes(id)); if (land){ const [x, y] = albCount(land), t = L(`📖 บันทึกลงสมุดสะสม · ${nm(ITEMS[id])} (${LANDS[land][0]} ${x}/${y})`, `📖 New in the album · ${nm(ITEMS[id])} (${LANDS[land][1]} ${x}/${y})`);
    log(t, 'g'); if (typeof toast === 'function') toast(t); } }
  if (typeof achCheck === 'function') setTimeout(achCheck, 0); }
{ const _ai = addItem; addItem = function(id){ const r = _ai.apply(this, arguments); try { albMark(id); } catch (e) {} return r; }; }
function albSeed(){ if (!S || !S.inv) return; S.album = S.album || {}; for (const k in S.inv) if (S.inv[k] > 0 && /^m_/.test(k)) S.album[k] = 1; }
EV.on('tick', () => { if (!ALB.seeded && S && S.lvl){ ALB.seeded = true; albSeed(); } });
/* collector titles: one a land, one for everything */
if (typeof ACH !== 'undefined' && typeof LANDS !== 'undefined'){
  const add = a => { if (ACH_BY[a.id]) return; ACH.push(a); ACH_BY[a.id] = a; };
  for (const land of Object.keys(LANDS)){ if (land === 'capital') continue; const [th, en] = LANDS[land];
    add({id:'alb_' + land, cat:'world', tier:1, th:`นักสะสม${th}`, en:`${en} Collector`, dth:`สะสมวัตถุดิบครบทุกชนิดของ${th}`, den:`Collect every material of the ${en}`,
      prog:() => { const [a, b] = albCount(land); return [a, Math.max(1, b)]; }, coin:0, title:[`นักสะสม${th}`, `${en} Collector`]}); }
  add({id:'alb_all', cat:'world', tier:3, th:'ปราชญ์แห่งวายรา', en:'Sage of Vayra', dth:'สะสมวัตถุดิบครบทั้งสมุด', den:'Complete the whole materials album',
    prog:() => { const [a, b] = albAll(); return [a, Math.max(1, b)]; }, coin:0, title:['ปราชญ์แห่งวายรา', 'Sage of Vayra']});
}
/* the window */
mkWin('album', 'สมุดสะสม', 'Album', '', '<path d="M4 3h9a3 3 0 013 3v11H7a3 3 0 01-3-3z"/><path d="M7 7h6M7 10h6M7 13h3"/>');
WIN_RENDER.album = function(){
  const pane = el('pane-album'); if (!pane || !S) return; albSeed();
  const sets = albSets(), lands = Object.keys(sets).filter(k => LANDS[k]); if (!ALB.land || !sets[ALB.land]) ALB.land = lands[0];
  const [ta, tb] = albAll(), list = sets[ALB.land] || [], [la, lb] = albCount(ALB.land);
  pane.innerHTML = `<div class="albw"><div class="albtop"><b>${L('สมุดสะสมวัตถุดิบ', 'Materials album')}</b><span class="ct">${ta} / ${tb}</span><span class="albbar"><i style="width:${tb ? Math.round(ta / tb * 100) : 0}%"></i></span></div>
    <div class="albtabs">${lands.map(k => { const [a, b] = albCount(k); return `<button class="albtab${k === ALB.land ? ' on' : ''}${a >= b ? ' done' : ''}" data-albland="${k}" style="--lc:${LANDS[k][2]}">${escH(L(LANDS[k][0], LANDS[k][1]))} <small>${a}/${b}</small></button>`; }).join('')}</div>
    <p class="hint">${L(`ครบหน้า «${LANDS[ALB.land][0]}» ได้ฉายา «นักสะสม${LANDS[ALB.land][0]}» · ${la}/${lb} · แตะช่องเพื่อดูว่าได้จากมอนตัวไหน แผนที่ไหน`, `Complete «${LANDS[ALB.land][1]}» for the title «${LANDS[ALB.land][1]} Collector» · ${la}/${lb} · tap one to see which monster and map it comes from`)}</p>
    <div class="albgrid">${list.map(id => { const have = albHave(id), m = MOB[id.slice(2)] || {};
      return `<div class="albit${have ? '' : ' no'}" data-albfind="${id}" title="${escH(have ? nm(ITEMS[id]) : L('ยังไม่เคยได้', 'Not found yet'))}"><span class="albic">${itemArt(id)}${have ? '' : '<em>?</em>'}</span><small>${escH(have ? nm(ITEMS[id]) : (m.lvl ? 'Lv ' + m.lvl : '?'))}</small></div>`; }).join('')}</div></div>`;
};
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-albland]'); if (t){ ALB.land = t.dataset.albland; WIN_RENDER.album(); return; }
  const f = e.target.closest && e.target.closest('[data-albfind]'); if (f && typeof fdOpen === 'function') fdOpen('item', f.dataset.albfind); });   // where it comes from, with a warp
{ const st = document.createElement('style'); st.textContent = `
#pane-album .albw{display:flex;flex-direction:column;gap:8px}
#pane-album .albtop{display:flex;align-items:center;gap:10px;font-weight:800}#pane-album .albbar{flex:1;height:8px;border-radius:5px;background:rgba(0,0,0,.12);overflow:hidden}#pane-album .albbar i{display:block;height:100%;background:linear-gradient(90deg,#e3b04b,#ffd86a)}
#pane-album .albtabs{display:flex;flex-wrap:wrap;gap:6px}#pane-album .albtab{border-radius:999px;padding:3px 11px;border:2px solid var(--lc);background:#fffaf0;color:#4a2a08;font-weight:800;font-size:12px;cursor:pointer}
#pane-album .albtab.on{background:var(--lc);color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.35)}#pane-album .albtab.done::after{content:' ✓'}#pane-album .albtab small{opacity:.8;font-weight:700}
#pane-album .albgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:8px}
#pane-album .albit{cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;border-radius:10px;background:linear-gradient(#fffaf0,#f6ead0);box-shadow:inset 0 0 0 1.5px #e3c486}
#pane-album .albit small{font-size:10.5px;font-weight:700;text-align:center;line-height:1.2;color:#4a2a08;max-height:2.4em;overflow:hidden}
#pane-album .albic{position:relative;width:52px;height:52px}#pane-album .albic svg{width:52px !important;height:52px !important}
#pane-album .albit.no .albic svg{filter:brightness(0) opacity(.3)}#pane-album .albit.no .albic svg > rect{display:none}#pane-album .albit.no small{color:#9a8462}
#pane-album .albic em{position:absolute;inset:0;display:grid;place-items:center;font:900 22px Georgia,serif;color:#fff8e0;text-shadow:0 1px 3px rgba(0,0,0,.6)}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'album', t:['สมุดสะสมวัตถุดิบ', 'Materials album'], b:() => L(
  '<p>วัตถุดิบจากมอนทุกชนิดถูกบันทึกในสมุดสะสมเมื่อได้มาครั้งแรก (เมนู «สมุดสะสม») แยกหน้าตามดินแดน · ครบหน้าไหนได้ฉายานักสะสมของดินแดนนั้น · ครบทั้งสมุดได้ฉายา «ปราชญ์แห่งวายรา» · เป็นรางวัลฉายาเท่านั้น</p>',
  '<p>Every monster material is recorded in the album the first time you get it (menu «Album»), page by page per land · completing a land earns its collector title · the whole album earns «Sage of Vayra» · titles only</p>')});
/* the item card says where it sits in the album */
if (typeof itCard === 'function'){ const _ic = itCard; itCard = function(id){ let h = _ic.apply(this, arguments); try { if (/^m_/.test(id) && ITEMS[id]){ const land = Object.keys(albSets()).find(k => albSets()[k].includes(id));
      if (land){ const [x, y] = albCount(land), line = `<div class="gdx-alb">📖 ${L(`สมุดสะสม · หน้า${LANDS[land][0]}`, `Album · ${LANDS[land][1]}`)} · ${albHave(id) ? L('บันทึกแล้ว', 'recorded') : L('ยังไม่บันทึก', 'not yet')} · ${x}/${y}</div>`;
        h = h.includes('<div class="gdx-foot">') ? h.replace('<div class="gdx-foot">', line + '<div class="gdx-foot">') : h + line; } } } catch (e) {} return h; }; }
{ const st = document.createElement('style'); st.textContent = 'html body .gdx-alb{margin:6px 0 2px;padding:3px 8px;border-radius:8px;background:rgba(227,176,75,.16);font:700 11.5px var(--thai,sans-serif);color:#7a4a10}'; document.head.appendChild(st); }
