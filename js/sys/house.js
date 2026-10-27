/* VAYRATHEN — js/sys/house.js — your own Thai house (บ้านเรือนไทย)
   A teak room with carved gables you decorate: 3 wall spots and 6 floor spots, wall and floor finishes, and
   furniture bought for Bia. Some pieces are SHOWCASES that read your progress: the mannequin wears your current
   look (costumes, wings and all), the trophy shelf fills with boss kills, the card cabinet with cards you hold.
   Some pieces live: a Siamese cat that wanders and naps, goldfish in a lotus basin, lamps that flicker.
   The house belongs to the account. Online, a small summary of it is published with your player card, so friends
   can VISIT it (window → Visit) and see your room exactly as you set it. Nothing about a house changes stats. */
'use strict';

const HW = {lx:480, ly:300, sel:null, view:null, visits:[], hover:-1, cv:null, t:0};
const H_SLOTS = [
  {k:'wall', x:110, y:78}, {k:'wall', x:240, y:70}, {k:'wall', x:370, y:78},
  {k:'floor', x:78, y:222}, {k:'floor', x:188, y:214}, {k:'floor', x:292, y:214}, {k:'floor', x:402, y:222}, {k:'floor', x:150, y:280}, {k:'floor', x:330, y:280}
];
const H_WALLS = {teak:['ไม้สักทอง', 'Golden teak', '#8a5a2e', '#6e4220'], white:['ปูนขาวลายทอง', 'White & gold', '#efe6d4', '#d8c8a8'], lacquer:['ลายรดน้ำแดง', 'Red lacquer', '#7a1e1a', '#5a1210'], bamboo:['ฝาขัดแตะไม้ไผ่', 'Woven bamboo', '#c8a868', '#a88848']};
const H_FLOORS = {teak:['พื้นไม้สัก', 'Teak boards', '#7a4a24', '#5e361a'], tile:['กระเบื้องดินเผา', 'Terracotta tiles', '#b0603a', '#8a4428'], mat:['เสื่อกก', 'Reed mats', '#d0b878', '#b09858']};
const H_FIN_PRICE = 3000;
/* furniture: slot, names, price (Bia), draw(g, x, y, t, view) */
const FURN = {
  f_window:{k:'wall', th:'หน้าต่างไม้แกะสลัก', en:'Carved window', z:2000},
  f_paint:{k:'wall', th:'ภาพจิตรกรรมไทย', en:'Thai mural', z:4000},
  f_khon:{k:'wall', th:'หัวโขนทศกัณฐ์', en:'Khon mask', z:6000},
  f_flag:{k:'wall', th:'ธงตะขาบมงคล', en:'Centipede banner', z:2500},
  f_trophy:{k:'wall', th:'ชั้นถ้วยรางวัลบอส', en:'Boss trophy shelf', z:8000, show:true},
  f_cards:{k:'wall', th:'ตู้โชว์การ์ด', en:'Card cabinet', z:8000, show:true},
  f_manq:{k:'floor', th:'หุ่นโชว์ชุด', en:'Outfit mannequin', z:10000, show:true},
  f_cat:{k:'floor', th:'แมววิเชียรมาศ', en:'Siamese cat', z:9000, live:true},
  f_basin:{k:'floor', th:'อ่างบัวปลาทอง', en:'Lotus basin & goldfish', z:6000, live:true},
  f_lamp:{k:'floor', th:'โคมไฟล้านนา', en:'Lanna lamp', z:3000, live:true},
  f_altar:{k:'floor', th:'โต๊ะหมู่บูชา', en:'Altar table', z:7000},
  f_khantoke:{k:'floor', th:'ขันโตก', en:'Khantoke tray', z:2500},
  f_plant:{k:'floor', th:'ต้นโมกในกระถาง', en:'Potted jasmine', z:1500},
  f_drum:{k:'floor', th:'กลองยาว', en:'Long drum', z:3500},
  f_elephant:{k:'floor', th:'ช้างไม้แกะสลัก', en:'Carved elephant', z:5000}
};
const house = () => { ACC.house = ACC.house || {w:'teak', f:'teak', s:{}, own:{}, fin:{teak:1}}; const h = ACC.house; h.s = h.s || {}; h.own = h.own || {}; h.fin = h.fin || {teak:1}; return h; };
/* what friends see (published with the player card) */
function housePub(){ const h = house(), s = {}; for (const i in h.s) if (FURN[h.s[i]]) s[i] = h.s[i];
  return {w:h.w, f:h.f, s, j:S.job, g:(vg => { const a = (typeof GHOST_SLOTS !== 'undefined' ? GHOST_SLOTS : ['head', 'armor', 'weapon', 'acc']).map(k => vg[k] || ''); while (a.length > 4 && !a[a.length - 1]) a.pop(); return a.join(','); })(typeof visGear === 'function' ? visGear(S.gear) : S.gear || {}), lk:SPR.lookKey(S.look), wg:typeof cosPres === 'function' ? cosPres().wg : '', b:(S.st && S.st.bosses) || 0, c:Object.keys(S.cards || {}).length}; }
function houseView(){ // the house being shown: yours, or the one you visit (checked)
  if (!HW.view) { const p = housePub(); return {...p, mine:true, n:typeof netName === 'function' ? netName() : S.name}; }
  const v = HW.view, s = {}; if (v.s && typeof v.s === 'object') for (const i in v.s){ const n = +i; if (n >= 0 && n < H_SLOTS.length && FURN[v.s[i]] && FURN[v.s[i]].k === H_SLOTS[n].k) s[n] = v.s[i]; }
  return {w:H_WALLS[v.w] ? v.w : 'teak', f:H_FLOORS[v.f] ? v.f : 'teak', s, j:JOBS[v.j] ? v.j : 'novice', g:typeof v.g === 'string' ? v.g.slice(0, 160) : '', lk:typeof v.lk === 'string' ? v.lk : '', wg:typeof v.wg === 'string' && v.wg.length < 40 ? v.wg : '', b:clamp(v.b | 0, 0, 1e6), c:clamp(v.c | 0, 0, 999), n:v.n};
}
/* ---------- painting the room ---------- */
function hRoom(g, V, t){
  const Wl = H_WALLS[V.w], Fl = H_FLOORS[V.f], LX = HW.lx, LY = HW.ly;
  // wall
  g.fillStyle = Wl[2]; g.fillRect(0, 0, LX, 196);
  if (V.w === 'teak' || V.w === 'lacquer'){ g.strokeStyle = Wl[3]; g.lineWidth = 2; for (let x = 0; x < LX; x += 34){ g.beginPath(); g.moveTo(x, 20); g.lineTo(x, 196); g.stroke(); } }
  if (V.w === 'bamboo'){ g.strokeStyle = Wl[3]; g.lineWidth = 1; for (let y = 20; y < 196; y += 8) for (let x = (y / 8 % 2) * 8; x < LX; x += 16){ g.strokeRect(x, y, 8, 8); } }
  if (V.w === 'white' || V.w === 'lacquer'){ g.fillStyle = V.w === 'white' ? 'rgba(200,150,40,.35)' : 'rgba(240,190,80,.35)'; for (let y = 40; y < 190; y += 26) for (let x = ((y / 26) % 2) * 20; x < LX; x += 40){ g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + 4, y); g.lineTo(x, y + 5); g.lineTo(x - 4, y); g.fill(); } }
  // top beam with carved kanok trim
  g.fillStyle = '#4a2a12'; g.fillRect(0, 0, LX, 22); g.fillStyle = '#c8962e';
  for (let x = 0; x < LX; x += 16){ g.beginPath(); g.moveTo(x, 22); g.quadraticCurveTo(x + 8, 34, x + 16, 22); g.fill(); g.beginPath(); g.arc(x + 8, 27, 1.6, 0, 7); g.fillStyle = '#ffe08a'; g.fill(); g.fillStyle = '#c8962e'; }
  // floor with perspective boards
  const gr = g.createLinearGradient(0, 196, 0, LY); gr.addColorStop(0, Fl[3]); gr.addColorStop(1, Fl[2]); g.fillStyle = gr; g.fillRect(0, 196, LX, LY - 196);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1;
  if (V.f === 'tile'){ for (let y = 196; y < LY; y += 14 + (y - 196) * .12){ g.beginPath(); g.moveTo(0, y); g.lineTo(LX, y); g.stroke(); } }
  for (let i = -8; i <= 8; i++){ g.beginPath(); g.moveTo(LX / 2 + i * 30, 196); g.lineTo(LX / 2 + i * 70, LY); g.stroke(); }
  if (V.f === 'mat'){ g.strokeStyle = 'rgba(120,90,40,.25)'; for (let y = 200; y < LY; y += 6){ g.beginPath(); g.moveTo(0, y); g.lineTo(LX, y); g.stroke(); } }
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, 194, LX, 4);
  // pillars
  for (const x of [8, LX - 26]){ g.fillStyle = '#5a3418'; g.fillRect(x, 0, 18, LY); g.fillStyle = 'rgba(255,220,150,.15)'; g.fillRect(x + 2, 0, 4, LY); g.fillStyle = '#c8962e'; g.fillRect(x - 2, 186, 22, 6); }
  // the light from the window side
  const sun = g.createLinearGradient(0, 0, LX, LY); sun.addColorStop(0, 'rgba(255,230,170,.10)'); sun.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = sun; g.fillRect(0, 0, LX, LY);
}
function hMannequin(g, x, y, t, V){
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y, 20, 6, 0, 0, 7); g.fill();
  g.fillStyle = '#6a4a2a'; g.beginPath(); g.ellipse(x, y - 2, 18, 5, 0, 0, 7); g.fill(); g.fillStyle = '#c8962e'; g.fillRect(x - 18, y - 3, 36, 2);
  const sh = typeof heroSheet === 'function' ? heroSheet(V.j, typeof ghostGear === 'function' ? ghostGear(V.g) : {}, typeof ghostLook === 'function' ? ghostLook(V.lk) : S.look) : null; if (!sh) return;
  g.save(); g.translate(x, y - 3); g.scale(1.6, 1.6);
  if (V.wg && typeof wingDef === 'function' && wingDef(V.wg)) drawWings(g, V.wg, 0, 0, 0, t, {part:'back'});
  SPR.draw(g, sh, 'idle', 0, t, 0, 0);
  if (V.wg && typeof wingDef === 'function' && wingDef(V.wg)) drawWings(g, V.wg, 0, 0, 0, t, {part:'front'});
  g.restore();
}
function hDraw(g, id, x, y, t, V){
  const glow = (cx, cy, r, c, a) => { const q = g.createRadialGradient(cx, cy, 0, cx, cy, r); q.addColorStop(0, `rgba(${c},${a})`); q.addColorStop(1, `rgba(${c},0)`); g.fillStyle = q; g.fillRect(cx - r, cy - r, r * 2, r * 2); };
  const shadow = (w) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y, w, w * .3, 0, 0, 7); g.fill(); };
  switch (id){
    case 'f_window': g.fillStyle = '#3a200c'; g.fillRect(x - 34, y - 30, 68, 64); g.fillStyle = '#9ad0f0'; g.fillRect(x - 28, y - 24, 56, 52);
      g.fillStyle = '#c8e8a0'; g.fillRect(x - 28, y + 10, 56, 18); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - 20 + (t * 3 % 40), y - 16, 14, 4);
      g.fillStyle = '#6a3e18'; g.fillRect(x - 2, y - 24, 4, 52); g.fillRect(x - 28, y + 2, 56, 3); g.fillStyle = '#c8962e'; g.beginPath(); g.moveTo(x - 38, y - 30); g.lineTo(x, y - 46); g.lineTo(x + 38, y - 30); g.fill(); break;
    case 'f_paint': g.fillStyle = '#c8962e'; g.fillRect(x - 36, y - 26, 72, 52); g.fillStyle = '#2a1408'; g.fillRect(x - 32, y - 22, 64, 44);
      g.fillStyle = '#c84a2a'; g.fillRect(x - 32, y + 8, 64, 14); g.fillStyle = '#e8c060'; for (let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(x - 20 + i * 20, y + 8); g.lineTo(x - 26 + i * 20, y - 12); g.lineTo(x - 14 + i * 20, y - 12); g.fill(); g.beginPath(); g.arc(x - 20 + i * 20, y - 15, 4, 0, 7); g.fill(); } break;
    case 'f_khon': g.fillStyle = '#2a7a3a'; g.beginPath(); g.ellipse(x, y + 2, 16, 20, 0, 0, 7); g.fill(); g.fillStyle = '#e8c048';
      for (let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(x - 14 + i * 14, y - 14); g.lineTo(x - 7 + i * 14, y - 36 + (i === 1 ? -8 : 0)); g.lineTo(x + i * 14, y - 14); g.fill(); }
      g.fillStyle = '#fff'; g.fillRect(x - 10, y - 2, 7, 4); g.fillRect(x + 3, y - 2, 7, 4); g.fillStyle = '#c82020'; g.fillRect(x - 7, y + 10, 14, 4); g.fillStyle = '#fff'; g.fillRect(x - 7, y + 12, 2, 4); g.fillRect(x + 5, y + 12, 2, 4); break;
    case 'f_flag': for (let i = 0; i < 6; i++){ const sw = Math.sin(t * 2 + i * .7) * 2; g.fillStyle = i % 2 ? '#e8b830' : '#c83a2a'; g.fillRect(x - 10 + sw, y - 34 + i * 12, 20, 10); g.fillStyle = '#3a2008'; g.fillRect(x - 16 + sw, y - 30 + i * 12, 4, 2); g.fillRect(x + 12 + sw, y - 30 + i * 12, 4, 2); } break;
    case 'f_trophy': { g.fillStyle = '#4a2a12'; g.fillRect(x - 44, y + 8, 88, 6); g.fillRect(x - 44, y - 18, 88, 5); const n = Math.min(8, Math.ceil(V.b / 5));
      for (let i = 0; i < 8; i++){ const cx = x - 38 + (i % 4) * 25, cy = i < 4 ? y + 8 : y - 18; if (i >= n){ g.strokeStyle = 'rgba(255,255,255,.12)'; g.strokeRect(cx, cy - 14, 12, 13); continue; }
        g.fillStyle = i < 2 ? '#ffd34a' : i < 5 ? '#d8d8e0' : '#d8905a'; g.fillRect(cx + 2, cy - 14, 8, 7); g.fillRect(cx + 5, cy - 7, 2, 4); g.fillRect(cx + 2, cy - 3, 8, 3); glow(cx + 6, cy - 10, 10, '255,220,120', .25 + .1 * Math.sin(t * 2 + i)); }
      g.fillStyle = '#ffe8b0'; g.font = '700 9px Mali, sans-serif'; g.textAlign = 'center'; g.fillText(`${L('บอส', 'Bosses')} ${V.b}`, x, y + 24); break; }
    case 'f_cards': { g.fillStyle = '#3a200c'; g.fillRect(x - 40, y - 30, 80, 56); g.fillStyle = 'rgba(160,200,255,.18)'; g.fillRect(x - 36, y - 26, 72, 48); const n = Math.min(12, V.c);
      for (let i = 0; i < 12; i++){ const cx = x - 33 + (i % 6) * 11.5, cy = y - 23 + Math.floor(i / 6) * 23; g.fillStyle = i < n ? ['#f0d080', '#a0d8ff', '#ffb0c8', '#b8f0a0'][i % 4] : 'rgba(255,255,255,.08)'; g.fillRect(cx, cy, 9, 19); if (i < n){ g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(cx + 2, cy + 3, 5, 6); } }
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x - 36 + ((t * 20) % 72), y - 26, 3, 48); g.fillStyle = '#ffe8b0'; g.font = '700 9px Mali, sans-serif'; g.textAlign = 'center'; g.fillText(`${L('การ์ด', 'Cards')} ${V.c}`, x, y + 38); break; }
    case 'f_manq': hMannequin(g, x, y, t, V); break;
    case 'f_cat': { shadow(14); const nap = Math.sin(t * .2) > .2, wx = nap ? 0 : Math.sin(t * .6) * 16, bx = x + wx, d = nap ? 0 : Math.cos(t * .6) > 0 ? 1 : -1;
      g.fillStyle = '#efe0c8'; g.beginPath(); g.ellipse(bx, y - 8, 13, nap ? 6 : 7, 0, 0, 7); g.fill(); g.fillStyle = '#4a3020';
      const hx = bx + (nap ? -10 : d * 11), hy = nap ? y - 9 : y - 15; g.beginPath(); g.arc(hx, hy, 5.5, 0, 7); g.fill(); g.beginPath(); g.moveTo(hx - 5, hy - 2); g.lineTo(hx - 3, hy - 9); g.lineTo(hx, hy - 4); g.moveTo(hx + 5, hy - 2); g.lineTo(hx + 3, hy - 9); g.lineTo(hx, hy - 4); g.fill();
      g.strokeStyle = '#4a3020'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(bx - (nap ? -12 : d * 12), y - 8); g.quadraticCurveTo(bx - (nap ? -20 : d * 22), y - 16 + Math.sin(t * 3) * 4, bx - (nap ? -16 : d * 18), y - 22); g.stroke();
      if (nap){ g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '700 9px Mali'; g.fillText('z', hx - 6, hy - 10 - (t * 4 % 6)); } else { g.fillStyle = '#5ac8ff'; g.fillRect(hx + d * 1 - 3, hy - 1, 2, 2); g.fillRect(hx + d * 1 + 1, hy - 1, 2, 2); } break; }
    case 'f_basin': { shadow(24); g.fillStyle = '#5a6a7a'; g.beginPath(); g.ellipse(x, y - 8, 24, 10, 0, 0, 7); g.fill(); g.fillStyle = '#3a6a8a'; g.beginPath(); g.ellipse(x, y - 11, 20, 7, 0, 0, 7); g.fill();
      for (let i = 0; i < 3; i++){ const a = t * (.8 + i * .2) + i * 2, fx = x + Math.cos(a) * 12, fy = y - 11 + Math.sin(a) * 3.5; g.fillStyle = '#ff8a30'; g.beginPath(); g.ellipse(fx, fy, 3, 1.5, a + 1.57, 0, 7); g.fill(); }
      g.fillStyle = '#4a9a4a'; g.beginPath(); g.ellipse(x + 8, y - 12, 6, 2.5, 0, 0, 7); g.fill(); g.fillStyle = '#ffb0d0'; g.beginPath(); g.moveTo(x - 6, y - 12); g.lineTo(x - 9, y - 22); g.lineTo(x - 6, y - 18); g.lineTo(x - 3, y - 22); g.fill(); break; }
    case 'f_lamp': { shadow(10); const fl = .8 + Math.sin(t * 9) * .1 + Math.sin(t * 23) * .06; glow(x, y - 36, 40, '255,190,100', .35 * fl);
      g.fillStyle = '#3a200c'; g.fillRect(x - 1.5, y - 26, 3, 26); g.fillRect(x - 8, y - 2, 16, 3); g.fillStyle = `rgba(255,${180 + 40 * fl | 0},110,1)`; g.beginPath(); g.moveTo(x - 9, y - 30); g.lineTo(x, y - 46); g.lineTo(x + 9, y - 30); g.lineTo(x, y - 24); g.fill();
      g.strokeStyle = '#c8962e'; g.lineWidth = 1; g.stroke(); break; }
    case 'f_altar': shadow(28); for (let i = 0; i < 3; i++){ const w = 52 - i * 14, h = 12; g.fillStyle = i % 2 ? '#7a1e1a' : '#3a200c'; g.fillRect(x - w / 2, y - 10 - i * h - h, w, h + 10); g.fillStyle = '#c8962e'; g.fillRect(x - w / 2, y - 10 - i * h - h, w, 2); }
      g.fillStyle = '#ffd34a'; g.beginPath(); g.ellipse(x, y - 52, 5, 7, 0, 0, 7); g.fill(); glow(x, y - 52, 14, '255,220,120', .3 + .1 * Math.sin(t * 2)); break;
    case 'f_khantoke': shadow(20); g.fillStyle = '#8a1e14'; g.beginPath(); g.ellipse(x, y - 8, 22, 8, 0, 0, 7); g.fill(); g.fillStyle = '#c8962e'; g.fillRect(x - 6, y - 8, 12, 8);
      for (let i = 0; i < 4; i++){ g.fillStyle = ['#f0e0b0', '#e86a30', '#6ab04a', '#f0c040'][i]; g.beginPath(); g.ellipse(x - 12 + i * 8, y - 11, 3.5, 2, 0, 0, 7); g.fill(); } break;
    case 'f_plant': shadow(10); g.fillStyle = '#a0502a'; g.beginPath(); g.moveTo(x - 9, y - 16); g.lineTo(x + 9, y - 16); g.lineTo(x + 6, y); g.lineTo(x - 6, y); g.fill();
      for (let i = 0; i < 7; i++){ const a = -1.57 + (i - 3) * .35 + Math.sin(t + i) * .05; g.fillStyle = '#3a8a3a'; g.beginPath(); g.ellipse(x + Math.cos(a) * 12, y - 18 + Math.sin(a) * 14, 5, 2.5, a, 0, 7); g.fill(); }
      g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) g.fillRect(x - 8 + i * 5, y - 30 + (i % 2) * 6, 2.5, 2.5); break;
    case 'f_drum': shadow(10); g.fillStyle = '#8a3a1a'; g.beginPath(); g.moveTo(x - 9, y - 40); g.lineTo(x + 9, y - 40); g.lineTo(x + 5, y - 6); g.lineTo(x - 5, y - 6); g.fill();
      g.fillStyle = '#e8d8b0'; g.beginPath(); g.ellipse(x, y - 40, 9, 3, 0, 0, 7); g.fill(); g.fillStyle = '#c82020'; g.fillRect(x - 6, y - 26, 12, 3); g.fillStyle = '#3a200c'; g.fillRect(x - 4, y - 6, 8, 6); break;
    case 'f_elephant': shadow(18); g.fillStyle = '#7a4a24'; g.beginPath(); g.ellipse(x, y - 16, 15, 10, 0, 0, 7); g.fill(); g.fillRect(x - 12, y - 10, 5, 10); g.fillRect(x + 6, y - 10, 5, 10);
      g.beginPath(); g.arc(x + 14, y - 20, 7, 0, 7); g.fill(); g.strokeStyle = '#7a4a24'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x + 19, y - 18); g.quadraticCurveTo(x + 24, y - 8, x + 20 + Math.sin(t) * 2, y - 2); g.stroke();
      g.fillStyle = '#c8962e'; g.fillRect(x - 10, y - 26, 16, 5); g.fillStyle = '#f0e8d8'; g.fillRect(x + 17, y - 15, 5, 1.5); break;
  }
}
function houseFrame(){
  const cv = el('hCv'); if (!cv || !winOpen('house')) return; const g = cv.getContext('2d'), V = houseView(), t = T, k = cv.width / HW.lx;
  g.setTransform(k, 0, 0, k, 0, 0); g.imageSmoothingEnabled = false; hRoom(g, V, t);
  const order = H_SLOTS.map((s, i) => i).sort((a, b) => H_SLOTS[a].y - H_SLOTS[b].y);
  for (const i of order){ const s = H_SLOTS[i], id = V.s[i];
    if (id) hDraw(g, id, s.x, s.y, t, V);
    if (V.mine && !HW.view && (HW.sel === i || HW.hover === i || !id)){ g.save(); g.setLineDash([4, 3]); g.strokeStyle = HW.sel === i ? '#ffd34a' : 'rgba(255,240,200,.35)'; g.lineWidth = HW.sel === i ? 2 : 1;
      if (s.k === 'wall') g.strokeRect(s.x - 40, s.y - 34, 80, 68); else { g.beginPath(); g.ellipse(s.x, s.y - 2, 30, 10, 0, 0, 7); g.stroke(); } g.restore();
      if (!id){ g.fillStyle = 'rgba(255,240,200,.45)'; g.font = '700 14px Mali, sans-serif'; g.textAlign = 'center'; g.fillText('+', s.x, s.k === 'wall' ? s.y + 5 : s.y + 3); } } }
  if (HW.view){ g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, HW.ly - 22, HW.lx, 22); g.fillStyle = '#ffe8b0'; g.font = '700 12px Mali, sans-serif'; g.textAlign = 'center'; g.fillText(L(`🏠 บ้านของ ${V.n || 'เพื่อน'}`, `🏠 ${V.n || 'Friend'}'s house`), HW.lx / 2, HW.ly - 7); }
}
EV.on('tick', () => { if (winOpen('house')) houseFrame(); });
function houseHit(e){
  const cv = el('hCv'), r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * HW.lx, y = (e.clientY - r.top) / r.height * HW.ly;
  let best = -1, bd = 1e9; H_SLOTS.forEach((s, i) => { const d = s.k === 'wall' ? (Math.abs(x - s.x) < 42 && Math.abs(y - s.y) < 36 ? Math.hypot(x - s.x, y - s.y) : 1e9) : Math.hypot(x - s.x, (y - s.y + 14) * 1.4); if (d < bd && d < 50){ bd = d; best = i; } });
  return best;
}
/* ---------- window ---------- */
mkWin('house', 'บ้านของฉัน', 'My House', '', '<path d="M3 9l7-5 7 5"/><path d="M5 8v8h10V8"/><path d="M8.5 16v-4h3v4"/><path d="M2 9.5l2-1M18 9.5l-2-1"/>', false);   // taken off the menu
WIN_RENDER.house = function(){
  const pane = el('pane-house'); if (!pane) return; const h = house(), sel = HW.sel, slot = sel != null ? H_SLOTS[sel] : null;
  const own = Object.keys(FURN).filter(id => h.own[id]), buy = Object.keys(FURN).filter(id => !h.own[id]);
  const used = id => Object.values(h.s).filter(x => x === id).length;
  pane.innerHTML = `<div class="hbox"><canvas id="hCv" width="${HW.lx * 2}" height="${HW.ly * 2}"></canvas></div>
    ${HW.view ? `<button class="btn gold wide" data-hhome="1">${L('กลับบ้านเรา', 'Back to my house')}</button>` : `
    <div class="htabs"><span class="hint">${slot ? `${L('ช่อง', 'Spot')}: ${slot.k === 'wall' ? L('ผนัง', 'wall') : L('พื้น', 'floor')} ${sel + 1}` : L('แตะช่องในห้องเพื่อวางของ', 'Tap a spot in the room to place something')}</span></div>
    ${slot ? `<div class="hpick"><button class="btn sm" data-hput="">${L('ว่าง', 'Empty')}</button>${own.filter(id => FURN[id].k === slot.k).map(id => `<button class="btn sm${h.s[sel] === id ? ' gold' : ''}" data-hput="${id}">${L(FURN[id].th, FURN[id].en)}</button>`).join('') || `<small class="hint">${L('ยังไม่มีของสำหรับช่องนี้ ซื้อด้านล่าง', 'Nothing for this spot yet, buy below')}</small>`}</div>` : ''}
    <div class="sec">${L('ผนังและพื้น', 'Walls & floor')}</div>
    <div class="hfin">${Object.keys(H_WALLS).map(k => `<button class="hsw${h.w === k ? ' on' : ''}" data-hwall="${k}" style="--a:${H_WALLS[k][2]};--b:${H_WALLS[k][3]}"><i></i><small>${L(H_WALLS[k][0], H_WALLS[k][1])}${h.fin['w' + k] || k === 'teak' ? '' : ` · ${fmtN(H_FIN_PRICE)}`}</small></button>`).join('')}</div>
    <div class="hfin">${Object.keys(H_FLOORS).map(k => `<button class="hsw${h.f === k ? ' on' : ''}" data-hfloor="${k}" style="--a:${H_FLOORS[k][2]};--b:${H_FLOORS[k][3]}"><i></i><small>${L(H_FLOORS[k][0], H_FLOORS[k][1])}${h.fin['f' + k] || k === 'teak' ? '' : ` · ${fmtN(H_FIN_PRICE)}`}</small></button>`).join('')}</div>
    <div class="sec">${L('ร้านเฟอร์นิเจอร์', 'Furniture shop')} <span class="ct">${S.bia.toLocaleString()} ${CUR()}</span></div>
    <div class="shop">${[...buy, ...own].map(id => { const F = FURN[id], o = !!h.own[id]; return `<div class="srow${o ? ' owned' : ''}"><div class="nm"><b>${L(F.th, F.en)}</b><small>${F.k === 'wall' ? L('ผนัง', 'Wall') : L('พื้น', 'Floor')}${F.show ? ' · ' + L('โชว์ผลงาน', 'showcase') : ''}${F.live ? ' · ' + L('มีชีวิต', 'alive') : ''}${o ? ` · ${L('วางอยู่', 'placed')} ${used(id)}` : ''}</small></div>
      <span class="pr">${o ? '✓' : fmtN(F.z)}</span>${o ? '' : `<button class="btn sm" data-hbuy="${id}" ${S.bia >= F.z ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button>`}</div>`; }).join('')}</div>
    <div class="sec">${L('ไปเยี่ยมบ้านเพื่อน', 'Visit a friend')}</div>
    ${NET.db && NET.room ? `<div class="list">${(NET.room.peers().filter(p => !p.isMe && p.kind === 'viewer' && p.by && p.presence)).slice(0, 12).map(p => `<div class="item"><div class="nm"><b class="hvn" data-hvp="${p.peer}"></b><small>${JOBS[p.presence.j] ? nm(JOBS[p.presence.j]) : ''} · Lv ${clamp(p.presence.l | 0, 1, 999)}</small></div><button class="btn sm" data-hvisit="${escH(p.by)}" data-hvname="${p.peer}">${L('เยี่ยม', 'Visit')}</button></div>`).join('') || `<p class="hint">${L('ยังไม่มีเพื่อนออนไลน์', 'No friends online right now')}</p>`}</div>` : `<p class="hint">${L('เปิดผ่านลิงก์ claude.ai เพื่อเยี่ยมบ้านเพื่อน', 'Open from the claude.ai link to visit friends')}</p>`}`}`;
  pane.querySelectorAll('.hvn[data-hvp]').forEach(b => { const p = NET.room.peers().find(x => x.peer === b.dataset.hvp); b.textContent = clean(p && p.presence.n, 18) || L('นักผจญภัย', 'Adventurer'); });
  const cv = el('hCv'); if (cv){ cv.addEventListener('pointermove', e => { HW.hover = HW.view ? -1 : houseHit(e); }); cv.addEventListener('pointerleave', () => { HW.hover = -1; });
    cv.addEventListener('click', e => { if (HW.view) return; const i = houseHit(e); HW.sel = i >= 0 && HW.sel !== i ? i : null; WIN_RENDER.house(); }); }
  houseFrame();
};
document.addEventListener('click', async e => {
  const b = e.target.closest && e.target.closest('[data-hput],[data-hbuy],[data-hwall],[data-hfloor],[data-hvisit],[data-hhome]'); if (!b || b.disabled) return; const d = b.dataset, h = house();
  if (d.hput != null){ if (HW.sel == null) return; const id = d.hput; if (id && (!h.own[id] || !FURN[id] || FURN[id].k !== H_SLOTS[HW.sel].k)) return; if (id) h.s[HW.sel] = id; else delete h.s[HW.sel]; accSave(); SFX.play('click'); }
  else if (d.hbuy){ const F = FURN[d.hbuy]; if (!F || h.own[d.hbuy] || S.bia < F.z) return; S.bia -= F.z; h.own[d.hbuy] = 1; accSave(); save(); SFX.play('coin'); toast(L(`ซื้อ ${F.th} แล้ว · แตะช่องในห้องเพื่อวาง`, `Bought ${F.en} · tap a spot to place it`)); }
  else if (d.hwall || d.hfloor){ const k = d.hwall || d.hfloor, key = (d.hwall ? 'w' : 'f') + k, tb = d.hwall ? H_WALLS : H_FLOORS; if (!tb[k]) return;
    if (k !== 'teak' && !h.fin[key]){ if (S.bia < H_FIN_PRICE) return toast(L('เงินไม่พอ', 'Not enough Bia')); S.bia -= H_FIN_PRICE; h.fin[key] = 1; save(); SFX.play('coin'); }
    if (d.hwall) h.w = k; else h.f = k; accSave(); }
  else if (d.hvisit){ if (!NET.db) return; const p = NET.room && NET.room.peers().find(x => x.peer === d.hvname), n = clean(p && p.presence && p.presence.n, 18);
    try { const s = await NET.db.doc(`players/${d.hvisit}`).get(); const v = s.exists && s.data().house; if (!v || typeof v !== 'object') return toast(L('เพื่อนคนนี้ยังไม่ได้แต่งบ้าน', 'This friend has not decorated yet'));
      HW.view = {...v, n}; HW.sel = null; SFX.play('click'); } catch (er){ return toast(L('เยี่ยมไม่สำเร็จ', 'Could not visit')); } }
  else if (d.hhome){ HW.view = null; }
  if (NET && NET.dirT != null) NET.dirT = Math.min(NET.dirT, 3);
  WIN_RENDER.house();
});
