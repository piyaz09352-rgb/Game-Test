/* VAYRATHEN — js/ui/cards.js
   Monster cards drawn as real collectible cards: a frame coloured by rarity (bronze / silver / gold for bosses),
   the monster's own sprite on an element-tinted backdrop, the slot it goes in, its level, race and element,
   and the bonus written out. cardHTML(id, 'full' | 'mini') is used by the bag, the equipment window and the
   pop-up shown when a card drops. The sprite art is rendered once per card and cached. */
'use strict';

const CARD_MOB = {};
for (const k in MOB) if (MOB[k].card) CARD_MOB[MOB[k].card] = k;
const CARD_ART = {};
function cardArt(id){
  if (CARD_ART[id] !== undefined) return CARD_ART[id];
  const key = CARD_MOB[id]; let url = '';
  try {
    if (key && SPR.MOBS[key]){
      const im = SPR.renderFrame('mob', key, 'idle', 1, 0), c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').putImageData(im, 0, 0);
      // crop to the sprite's pixels
      const d = im.data; let x0 = im.width, y0 = im.height, x1 = 0, y1 = 0;
      for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) if (d[(y * im.width + x) * 4 + 3] > 20){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 > x0){ const w = x1 - x0 + 1, h = y1 - y0 + 1, o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h); url = o.toDataURL(); }
    }
  } catch (e) { url = ''; }
  return (CARD_ART[id] = url);
}
const cardTitle = c => nm(CARDS[c]).replace(/^Card\s*/i, '').replace(/\s*Card$/i, '');
function cardRarity(id){ const m = MOB[CARD_MOB[id]]; return !m ? 'r1' : m.boss ? 'r3' : m.lvl >= 120 ? 'r2' : 'r1'; }
function cardHTML(id, size = 'full'){
  const cd = CARDS[id]; if (!cd) return '';
  const m = MOB[CARD_MOB[id]] || {}, art = cardArt(id), el = m.elem || 'neutral', r = cardRarity(id);
  const slotTxt = L(SLOT_TH[cd.slot], SLOT_EN[cd.slot]), meta = m.lvl ? `Lv ${m.lvl} · ${raceName ? raceName(m.race) : m.race} · ${elemName(el)}` : '';
  if (size === 'mini') return `<span class="tcard mini ${r} el-${el}" title="${nm(cd)}"><span class="tc-art">${art ? `<img src="${art}" alt="">` : ''}</span><i class="tc-gem"></i></span>`;
  return `<div class="tcard ${r} el-${el}">
    <div class="tc-top"><b>${cardTitle(id)}</b><span class="tc-slot">${slotTxt}</span></div>
    <div class="tc-art">${art ? `<img src="${art}" alt="${cardTitle(id)}">` : ''}<span class="tc-rar">${r === 'r3' ? 'MVP' : r === 'r2' ? 'RARE' : 'CARD'}</span></div>
    <div class="tc-meta">${meta}</div>
    <div class="tc-desc">${cardDesc(id)}</div>
  </div>`;
}
const raceName = r => (typeof RACE_TH !== 'undefined' && RACE_TH[r] ? L(RACE_TH[r], RACE_EN[r]) : r);
/* a card drop: the card flips in at the centre of the screen for a moment */
function cardPop(id){
  let box = document.getElementById('cardPop');
  if (!box){ box = document.createElement('div'); box.id = 'cardPop'; box.className = 'cardpop'; document.getElementById('ui').appendChild(box); box.addEventListener('click', () => { box.hidden = true; }); }
  box.innerHTML = `<div class="cp-t">${L('ได้รับการ์ด!', 'Card obtained!')}</div>${cardHTML(id)}`; box.hidden = false; box.classList.remove('in'); void box.offsetWidth; box.classList.add('in');
  clearTimeout(box._t); box._t = setTimeout(() => { box.hidden = true; }, 3200);
  if (typeof SFX !== 'undefined') SFX.play('levelUp');
}
