/* VAYRATHEN — js/ui/itemart270.js — (v270) every material its own look, and a tier like gear
   The owner: materials should get the same treatment as gear, and any item that looks like another should be changed.
   595 of the ~680 non-gear items shared a picture with at least one other (every "… Charm", "… Hide", "… Spirit Ash",
   "… Feather" was one picture per family, tinted only by element; dishes shared one bowl).
   · A monster's material is now drawn in THAT monster's own colours (its body and its glow, from the species list), so
     a red puma's hide is red-brown and a krasue's ash is pink — and it carries a small engraved medallion with a rune
     picked for that item, in the monster's glow colour.
   · Any other item that still shared a picture (dishes, odd drops) keeps its shape but turns to its own hue and gets
     its own rune.
   · TIER for materials (the frame and stars of gearrar270.js): a boss's material ตำนาน · Lv 150+ ล้ำค่า · Lv 70+ หายาก ·
     the rest ธรรมดา (ore หายาก, the gold crown and shards higher). The corner badge shows the material's family. */
'use strict';
const IA270_GLYPH = ['M5 1l1.2 2.8 3 .3-2.3 2 .7 3L5 7.6 2.4 9.1l.7-3L.8 4.1l3-.3z', 'M7 1.5A3.8 3.8 0 1 0 7 8.5 3 3 0 1 1 7 1.5z', 'M5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM5 0v2M5 8v2M0 5h2M8 5h2M1.5 1.5l1.4 1.4M7.1 7.1l1.4 1.4M8.5 1.5L7.1 2.9M2.9 7.1L1.5 8.5',
  'M0 4c1.7-2 3.3 2 5 0s3.3 2 5 0M0 7c1.7-2 3.3 2 5 0s3.3 2 5 0', 'M5 0c2 2.5 3.5 4.2 3.5 6.2a3.5 3.5 0 0 1-7 0C1.5 4.6 3 4 3.4 2.5 4 3.5 4.4 4 5 4.2z', 'M1 9C1 4 4 1 9 1c0 5-3 8-8 8zM1 9l5-5',
  'M0 5c2-3 8-3 10 0-2 3-8 3-10 0zM5 3.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z', 'M2 1l3 8 3-8z', 'M5 0C7 3 8 4.6 8 6.3a3 3 0 0 1-6 0C2 4.6 3 3 5 0z', 'M6 0L1.5 5.5H5L4 10l4.5-5.5H5z',
  'M5 5m-4 0a4 4 0 1 0 8 0 3 3 0 1 0-6 0 2 2 0 1 0 4 0', 'M4 0h2v4h4v2H6v4H4V6H0V4h4z', 'M5 0l5 5-5 5-5-5z', 'M5 1l4.5 8h-9z', 'M2 5a1.3 1.3 0 1 1 0 .1zM5 5a1.3 1.3 0 1 1 0 .1zM8 5a1.3 1.3 0 1 1 0 .1z', 'M1 1l8 8M9 1L1 9'];
const _iaPick269 = iaPick;
let IA270_DUP = null;
function ia270Dups(){
  if (IA270_DUP) return IA270_DUP; const g = {};
  for (const id in ITEMS){ const it = ITEMS[id]; if (!it || it.kind === 'gear' || (it.base && it.base !== id)) continue;
    try { const r = _iaPick269(id), p = 'ia' + id.replace(/\W/g, '') + '§', s = (r.art[0] + r.art[1]).split(p).join('P'); (g[s] = g[s] || []).push(id); } catch (e) {} }
  IA270_DUP = new Map(); for (const k in g) if (g[k].length > 1) g[k].forEach((id, i) => IA270_DUP.set(id, i));   // its place in its old group: no two twins get the same rune
  return IA270_DUP;
}
const ia270Hex = h => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return isNaN(n) ? null : [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const ia270Mix = (a, b, t) => { const x = ia270Hex(a), y = ia270Hex(b); if (!x || !y) return a; return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
let IA270_SP = null;
function ia270Look(mk){
  if (!IA270_SP){ IA270_SP = {}; if (typeof SPECIES !== 'undefined') for (const s of SPECIES) IA270_SP[s[0]] = s[5] || {}; }
  const lk = IA270_SP[mk]; if (!lk) return null;
  const hexes = k => typeof lk[k] === 'string' && /^#[0-9a-f]{3,8}$/i.test(lk[k]) ? lk[k].slice(0, 7) : null;
  const main = ['skin', 'col', 'body', 'shell', 'fur', 'hide', 'color', 'c1'].map(hexes).find(Boolean) || Object.keys(lk).map(hexes).find(Boolean);
  const acc = ['glow', 'eyeGlow', 'belly', 'accent', 'c2', 'mane', 'wing'].map(hexes).find(h => h && h !== main) || (main ? ia270Mix(main, '#ffffff', .55) : null);
  return main ? {main, acc} : null;
}
function ia270Fam(id){ const it = ITEMS[id] || {};
  if (id.startsWith('m_') && typeof MAT_FAM !== 'undefined') return (MAT_FAM.find(([re]) => re.test(it.en || '')) || [0, 'charm'])[1];
  return ['ore', 'shard', 'crown'].includes(id) ? 'gem' : 'mat'; }
function ia270Tier(id){
  const it = ITEMS[id]; if (!it) return 0;
  if (id === 'crown') return 3; if (id === 'shard') return 2; if (id === 'ore') return 1;
  if (id.startsWith('m_')){ const m = typeof MOB !== 'undefined' && MOB[id.slice(2)]; if (!m) return 0; return m.boss ? 3 : (m.lvl || 0) >= 150 ? 2 : (m.lvl || 0) >= 70 ? 1 : 0; }
  return it.rar || 0;
}
iaPick = function(id){
  const r = _iaPick269.apply(this, arguments), it = ITEMS[id];
  if (!it || it.kind === 'gear' || it.kind === 'ammo' || !ia270Dups().has(id)) return r;
  const p = r.p, h = typeof iaHash === 'function' ? iaHash(id) : [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  let [defs, body] = r.art, glow = r.glow, acc = '#fff0b0';
  const lk = id.startsWith('m_') ? ia270Look(id.slice(2)) : null;
  if (lk){ const fam = ia270Fam(id), c = [ia270Mix(lk.main, '#ffffff', .5), lk.main, ia270Mix(lk.main, '#000000', .55)];
    try { const art = fam === 'hide' ? IA.hide(p, c, (typeof iaFur === 'function' ? iaFur(it.en || '', (MOB[id.slice(2)] || {}).elem) : [0, ''])[1]) : IA[fam] ? IA[fam](p, c) : null; if (art){ [defs, body] = art; } } catch (e) {}
    glow = lk.acc || lk.main; acc = lk.acc || '#fff0b0'; }
  else { defs += `<filter id="${p}hr"><feColorMatrix type="hueRotate" values="${(h % 11 + 1) * 30}"/></filter>`; body = `<g filter="url(#${p}hr)">${body}</g>`; acc = ['#fff0b0', '#bfe8ff', '#ffc8e0', '#d8ffc0'][h % 4]; }
  // the rune medallion, top right
  const gi = ia270Dups().get(id) || 0, gl = IA270_GLYPH[gi % IA270_GLYPH.length];
  if (gi >= IA270_GLYPH.length) acc = ['#ffffff', '#ffb0b0', '#b0ffd0', '#c0c0ff'][Math.floor(gi / IA270_GLYPH.length) % 4];
  body += `<g transform="translate(26.5 4.5)"><circle cx="4.5" cy="4.5" r="4.6" fill="#1c120e" stroke="${acc}" stroke-width=".9"/><g transform="translate(1.6 1.6) scale(.58)"><path d="${gl}" fill="${acc}" stroke="${acc}" stroke-width=".7" stroke-linejoin="round" fill-opacity=".85"/></g></g>`;
  return {...r, art:[defs, body], glow};
};
/* materials take part in the rarity frames (gearrar270.js) */
if (typeof GR270_SVG !== 'undefined'){
  Object.assign(GR270_SVG, {
    'm-ash':'<path d="M12 1c4 4 6 7 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3-1-3-1-5 0-7z"/>',
    'm-slick':'<path d="M12 1c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z"/>',
    'm-feather':'<path d="M20 2C10 3 5 9 4 20l2 2c2-4 5-6 9-7-3 0-5 0-6-1 4 0 7-1 9-4-3 0-5 0-6-1 5-1 8-4 8-9z"/>',
    'm-scale':'<path d="M12 2l8 5v10l-8 5-8-5V7zm0 4L7 9v6l5 3 5-3V9z"/>',
    'm-hide':'<path d="M6 3l3 2h6l3-2 2 4-2 3 1 8-5 3h-4l-5-3 1-8-2-3z"/>',
    'm-ooze':'<path d="M4 18c-2-6 2-12 8-12s10 6 8 12c-1 3-4 3-5 1-1 2-5 2-6 0-1 2-4 2-5-1z"/>',
    'm-carapace':'<path d="M12 2c6 0 9 5 9 10s-3 10-9 10S3 17 3 12 6 2 12 2zm-1 2v16h2V4z"/>',
    'm-rubble':'<path d="M3 16l4-8 5 2 3-5 6 7-2 8H5z"/>',
    'm-charm':'<path d="M12 1l2 3h-4zM12 5a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 3l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/>',
    'm-gem':'<path d="M6 3h12l4 6-10 13L2 9zm1 6l5 9 5-9z"/>',
    'm-mat':'<path d="M4 7l8-4 8 4v10l-8 4-8-4zm8 1l-5-2.5v9L12 17z"/>'});
  const _gs = gr270Slot; gr270Slot = it => { if (it && (it.kind === 'etc' || it.kind === 'mat')){ const id = Object.keys(ITEMS).find(k => ITEMS[k] === it); return id ? 'm-' + ia270Fam(id) : 'm-mat'; } return _gs(it); };
  // the emblem rule for the new families (the stylesheet was built before they existed)
  { const st = document.createElement('style'); st.textContent = Object.keys(GR270_SVG).filter(k => k.startsWith('m-')).map(k => `html body #ui#ui.ui .bslot.grx.grx[data-gs="${k}"],html body .gdx[data-gs="${k}"]{--gsi:${gr270Uri(k)}}`).join('\n');
    const put = () => document.head.appendChild(st); put(); window.addEventListener('load', put); setTimeout(put, 1600); }
  // tag material cells too (the tagger only knew gear)
  const _tag = gr270Tag; gr270Tag = function(root){ _tag.apply(this, arguments);
    for (const b of (root && root.querySelectorAll ? root : document).querySelectorAll('.bslot[data-bagsel],.bslot[data-mksel],.bslot[data-tsel]')){
      const id = b.dataset.bagsel || b.dataset.mksel || b.dataset.tsel, it = ITEMS[id]; if (!it || (it.kind !== 'etc' && it.kind !== 'mat')) continue;
      const want = `gr${ia270Tier(id)}`, gs = 'm-' + ia270Fam(id);
      if (b.classList.contains(want) && b.classList.contains('grx') && b.dataset.gs === gs) continue;
      b.classList.remove('gr0', 'gr1', 'gr2', 'gr3'); b.classList.add(want, 'grx'); b.dataset.gs = gs; } };
}

/* ---------- weapons: every kind its own shape, every tier its own metal ---------- */
// tiers past 5 had no colours of their own (Solar, Infernal, Vajra, Devaraja… all looked like tier 5)
const IA270_TIER = {5:['#ffffff', '#ffd048', '#a86a08'], 6:['#ffc0a8', '#d0202a', '#3a0608'], 7:['#eaf8ff', '#3aa8ff', '#0a2e70'], 8:['#ffffff', '#ffe6a8', '#c08a20'], 9:['#f0e0ff', '#a050ff', '#2a0858'], 10:['#d8fff0', '#20d0a0', '#04463a'], 11:['#fff0f6', '#ff70b0', '#6a0838']};
const ia270Tc = t => IA270_TIER[t] || IA_TIER[t] || IA270_TIER[5 + (t % 7)] || IA_TIER[1];
const IA270_W = {
  collar:(p, c, g) => `<path d="M33.6 6.4l-1.4 5.4-13.4 13.4-3.6-3.6L28.6 8z" fill="url(#${p}b)" ${OL}/><path d="M32.6 7.4L18 22" stroke="${c[0]}" stroke-width=".9" opacity=".9"/><ellipse cx="15.6" cy="24.4" rx="5.6" ry="3" transform="rotate(-45 15.6 24.4)" fill="none" stroke="#1c0f08" stroke-width="3.4"/><ellipse cx="15.6" cy="24.4" rx="5.6" ry="3" transform="rotate(-45 15.6 24.4)" fill="none" stroke="#dfe6f0" stroke-width="1.8"/><g fill="#f2c444" ${OL}><circle cx="12.4" cy="23.6" r="1"/><circle cx="16.4" cy="21.2" r="1"/><circle cx="18.6" cy="25.6" r="1"/></g><path d="M13.4 27.2L8 32.6" stroke="#1c0f08" stroke-width="4" stroke-linecap="round"/><path d="M13.4 27.2L8 32.6" stroke="#6a3a22" stroke-width="2.4" stroke-linecap="round"/><circle cx="7.4" cy="33.2" r="2.2" fill="${g}" ${OL}/>`,
  gsword:(p, c, g) => `<path d="M34.5 4.5l-.8 7.2-15.6 15.6-5.4-5.4L28.3 6.3z" fill="url(#${p}b)" ${OL}/><path d="M33 6L16 23" stroke="${c[0]}" stroke-width="1.1" opacity=".9"/><path d="M8 19.5l12.5 12.5" stroke="#1c0f08" stroke-width="5" stroke-linecap="round"/><path d="M8 19.5l12.5 12.5" stroke="${g}" stroke-width="3.2" stroke-linecap="round"/><path d="M13.2 26.8L6.6 33.4" stroke="#1c0f08" stroke-width="4.4" stroke-linecap="round"/><path d="M13.2 26.8L6.6 33.4" stroke="#6a3a22" stroke-width="2.8" stroke-linecap="round"/><circle cx="6" cy="34" r="2.6" fill="${g}" ${OL}/>`,
  axe:(p, c, g) => `<path d="M10 34L26 12" stroke="#1c0f08" stroke-width="4" stroke-linecap="round"/><path d="M10 34L26 12" stroke="#7a4a2a" stroke-width="2.4" stroke-linecap="round"/><path d="M22 9c4-4 10-3 12 1-3 0-5 2-6 5-2 3-5 4-8 3z" fill="url(#${p}b)" ${OL}/><path d="M30 10.5c-2 1-3 3-3.5 5" stroke="${c[0]}" stroke-width=".9" fill="none"/><circle cx="24.4" cy="13" r="1.4" fill="${g}" ${OL}/>`,
  gaxe:(p, c, g) => `<path d="M8 35L27 9" stroke="#1c0f08" stroke-width="4.4" stroke-linecap="round"/><path d="M8 35L27 9" stroke="#6a3a22" stroke-width="2.8" stroke-linecap="round"/><path d="M24 5c5-3 11 0 12 5-3-1-6 0-8 2zM22 13c-4 3-5 9-1 12 0-3 2-6 4-7z" fill="url(#${p}b)" ${OL}/><path d="M19 4c4-2 9 0 10 4l-6 6c-1-4-2-7-4-10z" fill="url(#${p}b)" ${OL}/><circle cx="25" cy="11" r="1.8" fill="${g}" ${OL}/>`,
  bsword:(p, c, g) => `<path d="M35 5l-2 7-5 1-11 13-4-4L26 9l1-5z" fill="url(#${p}b)" ${OL}/><path d="M28 13l-2-2M31 10l-2-2" stroke="#1c0f08" stroke-width="1"/><path d="M9 21l9 9" stroke="#1c0f08" stroke-width="4.6" stroke-linecap="round"/><path d="M9 21l9 9" stroke="${g}" stroke-width="2.8" stroke-linecap="round"/><path d="M13 27l-5.6 5.6" stroke="#1c0f08" stroke-width="4" stroke-linecap="round"/><path d="M13 27l-5.6 5.6" stroke="#4a2414" stroke-width="2.4" stroke-linecap="round"/><path d="M7 33l-2 2" stroke="#c4222a" stroke-width="2.4" stroke-linecap="round"/>`,
  tdagger:(p, c, g) => { const one = r => `<g transform="rotate(${r} 20 20)"><path d="M20 4l2.2 4v12h-4.4V8z" fill="url(#${p}b)" ${OL}/><path d="M15.5 20.5h9" stroke="#1c0f08" stroke-width="3" stroke-linecap="round"/><path d="M15.5 20.5h9" stroke="${g}" stroke-width="1.6" stroke-linecap="round"/><path d="M20 22v8" stroke="#1c0f08" stroke-width="3" stroke-linecap="round"/><path d="M20 22v8" stroke="#6a3a22" stroke-width="1.6" stroke-linecap="round"/></g>`; return one(-35) + one(35) + `<path d="M17 31c2 3 4 3 6 0" stroke="#c4222a" stroke-width="1.6" fill="none"/>`; },
  ndagger:(p, c, g) => `<path d="M31 6c1 2-1 3 0 5s-1 3 0 5-2 3-1 5l-8 8-3-3 7-8c-1-2 1-3 0-5s1-3 0-5 2-2 5-2z" fill="url(#${p}b)" ${OL}/><path d="M12 25l6 6" stroke="#1c0f08" stroke-width="3.6" stroke-linecap="round"/><path d="M12 25l6 6" stroke="${g}" stroke-width="2" stroke-linecap="round"/><path d="M14.5 29.5c-2 1-4 3-5 5 2 1 4 0 5-2 1-1 1-2 0-3z" fill="#4a2414" ${OL}/>`,
  lstaff:(p, c, g) => `<path d="M7 36L30 7" stroke="#1c0f08" stroke-width="3.8" stroke-linecap="round"/><path d="M7 36L30 7" stroke="#8a5a34" stroke-width="2.2" stroke-linecap="round"/><path d="M26 4c6 0 9 6 6 10-1-3-4-5-7-4z" fill="url(#${p}b)" ${OL}/><circle cx="29.5" cy="8.5" r="2" fill="${c[0]}" ${OL} style="filter:drop-shadow(0 0 2px ${c[1]})"/><path d="M14 27l2.4 1.8M18 22l2.4 1.8" stroke="${g}" stroke-width="1.8"/>`,
  hexrod:(p, c, g) => `<path d="M9 35L24 16" stroke="#1c0f08" stroke-width="3.6" stroke-linecap="round"/><path d="M9 35L24 16" stroke="#3a2a3a" stroke-width="2" stroke-linecap="round"/><path d="M27 5c4 0 6 3 6 6 0 2-1 3-2 4v2h-7v-2c-1-1-2-2-2-4 0-3 2-6 5-6z" fill="#efe6d4" ${OL}/><circle cx="25.6" cy="10.6" r="1.5" fill="${c[1]}" style="filter:drop-shadow(0 0 2px ${c[1]})"/><circle cx="30" cy="10.6" r="1.5" fill="${c[1]}" style="filter:drop-shadow(0 0 2px ${c[1]})"/><path d="M26 16v1.5M28 16v1.5M30 16v1.5" stroke="#1c0f08" stroke-width=".8"/>`,
  estaff:(p, c, g) => `<path d="M9 35L24 15" stroke="#1c0f08" stroke-width="3.8" stroke-linecap="round"/><path d="M9 35L24 15" stroke="#5a3a6a" stroke-width="2.2" stroke-linecap="round"/><circle cx="23" cy="9" r="3.2" fill="#ff6a3a" ${OL} style="filter:drop-shadow(0 0 2px #ff6a3a)"/><circle cx="31" cy="11" r="3.2" fill="#3ab0ff" ${OL} style="filter:drop-shadow(0 0 2px #3ab0ff)"/><circle cx="28" cy="18" r="3.2" fill="#6ae06a" ${OL} style="filter:drop-shadow(0 0 2px #6ae06a)"/><path d="M24 15l3-3" stroke="${g}" stroke-width="1.6"/>`,
  hstaff:(p, c, g) => `<path d="M9 35C14 28 18 22 26 12" stroke="#1c0f08" stroke-width="3.8" stroke-linecap="round" fill="none"/><path d="M9 35C14 28 18 22 26 12" stroke="#6a8a3a" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M26 12c-1-5 2-8 7-8-1 4-3 7-7 8zM24 15c-4-1-7 0-8 4 4 0 6-1 8-4zM27 14c3 2 6 2 8 0-3-2-5-2-8 0z" fill="#6ac04a" ${OL}/><circle cx="26.5" cy="12.5" r="1.6" fill="${c[1]}" ${OL}/>`,
  sstaff:(p, c, g) => `<path d="M9 35L23 16" stroke="#1c0f08" stroke-width="3.8" stroke-linecap="round"/><path d="M9 35L23 16" stroke="${g}" stroke-width="2.2" stroke-linecap="round"/><path d="M22 14c-2-6 3-11 9-10 4 1 5 6 2 9-2 2-5 1-5-1 0-2 3-2 3-1" fill="#fff4e6" stroke="#1c0f08" stroke-width="1.1"/><path d="M22 14c3 1 7 1 9-1" stroke="#e8b080" stroke-width="1" fill="none"/>`,
  moonstar:(p, c, g) => `<path d="M24 6a10 10 0 1 0 10 13 8 8 0 1 1-10-13z" fill="url(#${p}b)" ${OL}/><path d="M13 22l1.6 3.2 3.4.4-2.6 2.2.8 3.4-3.2-1.8-3 1.8.6-3.4-2.4-2.2 3.4-.4z" fill="${c[0]}" ${OL}/>`,
  kunai:(p, c, g) => `<path d="M33 7l-3 8-6 6-3-3 6-6z" fill="url(#${p}b)" ${OL}/><path d="M20 20l-7 7" stroke="#1c0f08" stroke-width="3.4" stroke-linecap="round"/><path d="M20 20l-7 7" stroke="#2a2a34" stroke-width="1.8" stroke-linecap="round"/><circle cx="10.5" cy="29.5" r="3" fill="none" stroke="#1c0f08" stroke-width="2.6"/><circle cx="10.5" cy="29.5" r="3" fill="none" stroke="${g}" stroke-width="1.3"/><path d="M15 25l2 2" stroke="#c4222a" stroke-width="2"/>`,
  kfist:(p, c, g) => `<path d="M11 15c0-3 2-5 5-5h8c3 0 5 2 5 5v8c0 4-3 7-7 7h-4c-4 0-7-3-7-7z" fill="url(#${p}b)" ${OL}/><path d="M4 16c3-4 6-5 8-4l-1 6c-3 0-5-1-7-2zM36 16c-3-4-6-5-8-4l1 6c3 0 5-1 7-2z" fill="${g}" ${OL}/><circle cx="20" cy="18" r="2.6" fill="${c[0]}" ${OL} style="filter:drop-shadow(0 0 2px ${c[1]})"/><path d="M14 30h12v4H14z" fill="#6a3a22" ${OL}/>`,
  catclaw:(p, c, g) => `<path d="M11 22c0-5 4-8 9-8s9 3 9 8-4 9-9 9-9-4-9-9z" fill="${g}" ${OL}/><g fill="url(#${p}b)" ${OL}><path d="M13 16L10 5l6 9z"/><path d="M18 14l-1-11 4 11z"/><path d="M23 14l2-11 1 11z"/><path d="M27 16l5-10-2 11z"/></g><g fill="#ffd0d8" ${OL}><circle cx="20" cy="25" r="3.2"/><circle cx="15" cy="21" r="1.6"/><circle cx="20" cy="19.5" r="1.6"/><circle cx="25" cy="21" r="1.6"/></g>`,
  wbow:(p, c, g) => `<path d="M11 3c20 6 20 28 0 34" fill="none" stroke="#1c0f08" stroke-width="4.4" stroke-linecap="round"/><path d="M11 3c20 6 20 28 0 34" fill="none" stroke="#6a8a3a" stroke-width="2.8" stroke-linecap="round"/><path d="M11 3v34" stroke="#f6eedc" stroke-width=".9"/><path d="M24 9c3-2 6-1 7 1-3 1-5 1-7-1zM28 20c3-1 5 1 5 3-3 0-4-1-5-3zM24 31c3 2 6 1 7-1-3-1-5-1-7 1z" fill="#6ac04a" ${OL}/><path d="M6 20h24" stroke="#1c0f08" stroke-width="2.4" stroke-linecap="round"/><path d="M6 20h24" stroke="${c[1]}" stroke-width="1.1" stroke-linecap="round"/><path d="M33.5 20l-4-2.2v4.4z" fill="${c[1]}" ${OL}/>`
};
let IA270_GDUP = null;
function ia270GearDups(){
  if (IA270_GDUP) return IA270_GDUP; const g = {};
  for (const id in ITEMS){ const it = ITEMS[id]; if (!it || it.kind !== 'gear' || (it.base && it.base !== id)) continue;
    try { const r = _iaPick269(id), p = r.p, s = (r.art[0] + r.art[1]).split(p).join('P'); (g[s] = g[s] || []).push(id); } catch (e) {} }
  IA270_GDUP = new Map(); for (const k in g) if (g[k].length > 1) g[k].forEach((id, i) => IA270_GDUP.set(id, i));
  return IA270_GDUP;
}
{ const _pk = iaPick; iaPick = function(id){
    const it0 = ITEMS[id]; if (!it0 || it0.kind !== 'gear') return _pk.apply(this, arguments);
    const bid = it0.base && it0.base !== id && ITEMS[it0.base] ? it0.base : id, d = ia270GearDups(); if (!d.has(bid)) return _pk.apply(this, arguments);
    const r = _pk.apply(this, arguments), p = r.p, it = ITEMS[bid], km = {k_merchant_w:'w_axe1', k_tradelord_w:'w_gaxe4', k_tycoon_w:'w_gaxe8'}[bid], m = /^w_([a-z]+?)(\d+)$/.exec(km || bid);   // the merchant line's own axes look like axes
    let [defs, body] = r.art, glow = r.glow, shaped = false;
    if (m && it.slot === 'weapon'){ const kind = m[1], t = +m[2], c = ia270Tc(t), gld = t === 0 ? '#8a5a34' : t >= 6 ? c[0] : '#f2c444';
      if (IA270_W[kind]){ defs = lg(p + 'b', [c[0], c[1], c[2]], 0, 0, 1, 1); body = IA270_W[kind](p, c, gld); shaped = true; glow = c[1];
        if (t >= 2) body = `<g style="filter:drop-shadow(0 0 2px ${c[1]})">${body}</g>`; }
      else if (t > 5){ const c2 = ia270Tc(t); defs = defs.replace(/stop-color="[^"]+"/g, (() => { let i = 0; return () => `stop-color="${c2[Math.min(2, i++)]}"`; })()); glow = c2[1]; shaped = true; } }
    // what is still a twin of something else: its own hue and rune
    const twin = !shaped || ['bsword', 'bow', 'fist', 'glove', 'claw', 'staff', 'sword', 'dagger', 'shuriken'].includes(m && m[1]) && !/^w_/.test(bid);
    if (!shaped || (/^k_/.test(bid) && !km)){ const i = d.get(bid) || 0, h = (typeof iaHash === 'function' ? iaHash(bid) : i);
      if (i > 0){ defs += `<filter id="${p}hr"><feColorMatrix type="hueRotate" values="${(i * 47 + h % 30) % 360}"/></filter>`; body = `<g filter="url(#${p}hr)">${body}</g>`; }
      const acc = ['#fff0b0', '#bfe8ff', '#ffc8e0', '#d8ffc0'][i % 4], gl = IA270_GLYPH[i % IA270_GLYPH.length];
      body += `<g transform="translate(26.5 4.5)"><circle cx="4.5" cy="4.5" r="4.6" fill="#1c120e" stroke="${acc}" stroke-width=".9"/><g transform="translate(1.6 1.6) scale(.58)"><path d="${gl}" fill="${acc}" stroke="${acc}" stroke-width=".7" stroke-linejoin="round" fill-opacity=".85"/></g></g>`; }
    void twin; return {...r, art:[defs, body], glow}; }; }
