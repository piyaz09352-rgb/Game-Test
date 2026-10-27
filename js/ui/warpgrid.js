/* VAYRATHEN — js/ui/warpgrid.js — (v95) the boatman and the warp shrine open a full-screen board of regions
   · one card per region, sorted by level: a picture of the region (cut from the world map painting), its Lv range,
     land, a line about it, its boss and monsters, the fare and a Go button
   · regions never visited stay greyed with "ยังไม่เคยไป"; the one the hero stands in is marked
   · the warp itself is the same [data-warp] button as before (ui/panels.js); the board closes on arrival */
'use strict';

const WG_Z = 7;   // world map painting shown at 7× the picture's width: one region and a little around it
function wgPicPos(id){ const [x, y] = wmPic(id), r = 9 / 16;
  const px = (WG_Z * x - .5) / (WG_Z - 1), py = (WG_Z * y - r / 2) / (WG_Z - r);
  return `${(clamp(px, 0, 1) * 100).toFixed(2)}% ${(clamp(py, 0, 1) * 100).toFixed(2)}%`; }
const wgArt = k => `<img alt="" data-mart="${k}" src="${mobArt(k) || MART_NONE}">`;

function wgHTML(n){
  const boat = n.id === 'boatman', list = MAPS.slice().sort((a, b) => a.lv[0] - b.lv[0] || a.lv[1] - b.lv[1] || a.id - b.id);
  const card = mp => { const seen = S.visited && S.visited[mp.id], here = mp.id === MAP_ID, fee = warpFee(mp.id), land = LANDS[mp.land] || LANDS.fertile, bd = MOB[mp.boss];
    const ok = seen && !here && S.bia >= fee;
    return `<div class="wgc${seen ? '' : ' locked'}${here ? ' here' : ''}">
      <div class="wgpic" style="background-position:${wgPicPos(mp.id)}"><span class="wglv">Lv ${mp.lv[0]}–${mp.lv[1]}</span>${here ? `<span class="wghere">${L('อยู่ที่นี่', 'You are here')}</span>` : ''}${seen ? '' : `<span class="wglock">🔒 ${L('ยังไม่เคยไป', 'Not visited')}</span>`}</div>
      <div class="wgbd"><b class="wgnm">${escH(nm(mp))}</b><small class="wgland" style="--lc:${land[2]}">${L(land[0], land[1])}</small>
        ${mp.desc ? `<p class="wgds">${escH(L(mp.desc[0], mp.desc[1]))}</p>` : ''}
        ${bd ? `<div class="wgboss">${wgArt(mp.boss)}<span><small>${L('บอสประจำแผนที่', 'Region boss')}</small><b>♛ ${escH(nm(bd))}</b><small>Lv ${bd.lvl || bd.lv || '?'}</small></span></div>` : ''}
        <div class="wgmobs">${(mp.mobs || []).slice(0, 6).map(k => (MOB[k] ? `<span title="${escH(nm(MOB[k]))} · Lv ${MOB[k].lvl || MOB[k].lv || '?'}">${wgArt(k)}</span>` : '')).join('')}</div>
        <div class="wgft"><span class="wgfee">${fee ? `${fmtN(fee)}` : L('ฟรี', 'Free')}</span>
          <button class="btn sm${ok ? ' gold' : ''}" data-warp="${mp.id}" ${ok ? '' : 'disabled'}>${here ? L('อยู่ที่นี่', 'Here') : seen ? L('ไป', 'Go') : L('ยังไม่เคยไป', 'Not visited')}</button></div></div></div>`; };
  const seenN = MAPS.filter(m => S.visited && S.visited[m.id]).length;
  return `<div class="wghd"><div class="wgtt"><b>${n.name ? `${escH(nm(n))} · ${escH(L(n.role || '', n.roleEn || ''))}` : L('ศาลวาร์ป', 'Warp shrine')}</b>
      <small>${boat ? L('จะไปไหนล่ะหลาน ตาพายไปส่งได้ทุกที่ที่เคยไปมาแล้ว', 'Where to, child? I can row you anywhere you have been before.') : L('ศาลนี้เชื่อมทุกแคว้นที่เจ้าเคยเหยียบ', 'This shrine links every region you have set foot in.')} · ${L(`ไปมาแล้ว ${seenN}/${MAPS.length} แผนที่`, `${seenN}/${MAPS.length} visited`)}</small></div>
      <span class="wgbia">${fmtN(S.bia)}</span><button class="btn sm" data-win-open="world">${L('แผนที่โลก', 'World map')}</button><button class="wgx" data-wgclose aria-label="${L('ปิด', 'Close')}">✕</button></div>
    <div class="wggrid">${list.map(card).join('')}</div>`;
}
function wgOpen(n){
  let b = el('warpGrid'); if (!b){ b = document.createElement('div'); b.id = 'warpGrid'; b.hidden = true; el('ui').appendChild(b); }
  b.innerHTML = wgHTML(n); b.dataset.npc = n.id; b.hidden = false;
  const here = b.querySelector('.wgc.here'); if (here) here.scrollIntoView({block:'center'});
  // (v153) the monster pictures of the cards on screen are painted first (they used to wait behind every card above them)
  if (typeof IntersectionObserver === 'function' && typeof MARTQ !== 'undefined'){ const io = new IntersectionObserver(es => { for (const e of es){ if (!e.isIntersecting) continue; io.unobserve(e.target);
      for (const im of e.target.querySelectorAll('img[data-mart]')){ const k = im.dataset.mart, i = MARTQ.q.indexOf(k); if (i > 0){ MARTQ.q.splice(i, 1); MARTQ.q.unshift(k); } } } }, {root:b.querySelector('.wggrid')});
    b.querySelectorAll('.wgc').forEach(c => io.observe(c)); }
}
function wgClose(){ const b = el('warpGrid'); if (b && !b.hidden){ b.hidden = true; b.innerHTML = ''; } }
const wgOn = () => { const b = el('warpGrid'); return !!b && !b.hidden; };

{ const _o = openNpc;
  openNpc = function(n){ const r = _o.apply(this, arguments);
    if (n && (n.id === 'boatman' || n.id === 'warp')){ closeDialog(); wgOpen(n); }
    return r; }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#warpGrid [data-wgclose], #warpGrid [data-win-open]'); if (t) wgClose(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && wgOn()){ wgClose(); e.stopImmediatePropagation(); } }, true);
{ const _lm = loadMap; loadMap = function(){ wgClose(); return _lm.apply(this, arguments); }; }   // closes on arrival
