/* VAYRATHEN sprite generator — procedural chibi pixel art, 8 directions.
   Standard: 1 world unit = 1 sprite pixel, frame 64x64 (boss 128), feet anchor (32, 58),
   body ~40px tall (2.2 heads), 4-tone hue-shifted ramps, light from top-left-front, selective dark outline. */
/* graphics quality — Settings → กราฟิก. Four presets plus "auto", which picks one from the device
   (cores, memory, touch, screen) and steps down by itself while the game runs if frames get slow.
   k  = sprite pixels per world unit · ts = ground px per unit · ps = prop px per unit
   dpr = cap on the canvas's device-pixel ratio (the biggest single cost on phones) · fx = effect detail 0–2 */
const GFX = (() => {
  const touch = !!(globalThis.matchMedia && matchMedia('(pointer:coarse)').matches);
  const cores = (globalThis.navigator && navigator.hardwareConcurrency) || 4, mem = (globalThis.navigator && navigator.deviceMemory) || 4;
  const ORDER = ['low', 'medium', 'high', 'ultra'];
  const P = {
    low:   {dpr:1,   kMax:2, ts:1,   ps:2, budget:touch ? 8e6 : 12e6,  fx:0},
    medium:{dpr:1.5, kMax:3, ts:1.5, ps:3, budget:touch ? 14e6 : 24e6, fx:1},
    high:  {dpr:2,   kMax:4, ts:2,   ps:4, budget:touch ? 22e6 : 48e6, fx:2, terrPx:touch ? 20e6 : 30e6},
    // (v156) ultra is now the sharpest the game can draw: sprites up to 6 px per unit on 3× screens, props painted at
    // 6×, and the ground canvas allowed to grow to ~56 megapixels on a desktop (it was capped at 16, so on big maps
    // the ground was drawn at 1.4 px per unit and looked soft however high the setting)
    ultra: {dpr:3,   kMax:touch ? 5 : 6, ts:3, ps:touch ? 5 : 6, budget:touch ? 36e6 : 110e6, fx:2, terrPx:touch ? 28e6 : 56e6}
  };
  // first guess from the hardware; a slow first session lowers it (stored), never raises it
  let guess = touch ? (mem <= 3 || cores <= 4 ? 'low' : mem <= 4 ? 'medium' : 'high')
                    : (cores <= 2 ? 'low' : cores <= 4 || mem <= 4 ? 'medium' : mem >= 8 && cores >= 8 ? 'ultra' : 'high');
  try { const learned = localStorage.getItem('vayrathen-gfx-auto'); if (ORDER.includes(learned) && ORDER.indexOf(learned) < ORDER.indexOf(guess)) guess = learned; } catch (e) {}
  let mode = 'auto';
  try { mode = JSON.parse(localStorage.getItem('vayrathen-settings-v1') || '{}').gfx || 'auto'; } catch (e) {}
  mode = {max:'ultra', save:'low'}[mode] || mode; if (mode !== 'auto' && !ORDER.includes(mode)) mode = 'auto';
  // smooth picture (default on): sprites are drawn a step sharper than the screen and filtered, so edges are soft
  // and anti-aliased and movement glides between pixels instead of stepping
  let smooth = true; try { smooth = JSON.parse(localStorage.getItem('vayrathen-settings-v1') || '{}').smooth !== false; } catch (e) {}
  const G = {touch, ORDER, P, guess, mode, preset:null, k:2, ts:1, ps:2, dpr:1, budget:12e6, fx:1, smooth, terrPx:16e6};
  G.use = name => {
    const p = P[name]; G.preset = name;
    const devDpr = Math.min(p.dpr, globalThis.devicePixelRatio || 1);
    const h = Math.min(globalThis.innerWidth || 1280, globalThis.innerHeight || 720) - (touch ? 0 : 60);
    const px = Math.min(4, Math.max(2, Math.round(h / 330 * 2) / 2));
    const ss = G.smooth && name !== 'low' ? 1 : 0;
    G.k = Math.max(2, Math.min(p.kMax + ss, Math.round(px * devDpr) + ss));
    G.ts = p.ts; G.ps = Math.max(p.ps, Math.min(G.k, 4)); G.dpr = p.dpr; G.budget = p.budget; G.fx = p.fx; G.terrPx = p.terrPx || 16e6;
    return G;
  };
  G.use(mode === 'auto' ? guess : mode);
  return G;
})();
const SPR = (() => {
'use strict';
const PITCH = 0.46, cosP = Math.cos(PITCH), sinP = Math.sin(PITCH);
const LV = (() => { const x = -0.55, y = -0.62, z = 0.56, l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; })();
const DIRS = ['S','SW','W','NW','N','NE','E','SE'];
const DIR_TH = ['ใต้','ตะวันตกเฉียงใต้','ตะวันตก','ตะวันตกเฉียงเหนือ','เหนือ','ตะวันออกเฉียงเหนือ','ตะวันออก','ตะวันออกเฉียงใต้'];

/* ---------- materials ---------- */
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const MATS = [], M = {};
const toHex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/* a 4-tone ramp (light → dark) from one base colour, for generated monster palettes */
function rampOf(name, base, o = {}){
  if (M[name] != null) return M[name];
  const c = hex(base), mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const hi = mix(c, [255, 250, 235], .45), d1 = mix(c, [40, 20, 50], .32), d2 = mix(c, [24, 12, 34], .58);
  mat(name, [toHex(hi), base, toHex(d1), toHex(d2)], o); return M[name];
}
function mat(name, ramp, o = {}){ M[name] = MATS.length; MATS.push({name, hex:ramp, ramp:ramp.map(hex), emissive:!!o.emissive, noEdge:!!o.noEdge}); }
mat('skin',   ['#ffeedd','#f7d2b4','#e0a98d','#b8786c']);
mat('blush',  ['#ffc2b8','#f49a92','#d97a7a','#b05a62']);
mat('eye',    ['#ffffff','#5a3a52','#2e1f34','#1a1020'], {noEdge:true});
mat('mouth',  ['#e6857a','#b85a5a','#8a3a44','#5a2230'], {noEdge:true});
mat('irisBr', ['#f0c890','#b07a45','#7a4f2e','#4a2e1e'], {noEdge:true});
mat('irisBl', ['#bfe6ff','#5a9ee0','#3a64b0','#233a78'], {noEdge:true});
mat('irisVi', ['#f0dcff','#b48af0','#7a56c0','#4a3080'], {noEdge:true});
mat('irisGr', ['#d8f5b0','#7cc26a','#4a8a4e','#2a5236'], {noEdge:true});
mat('hairBrown',['#d9a878','#9a6a42','#6b452c','#40271b']);
mat('hairBlonde',['#fff3c8','#f2c879','#cf9a4e','#94632e']);
mat('maroon', ['#b8716a','#7e3b36','#5a2826','#391817']);
mat('hairNavy', ['#8fa0e6','#4a5aa8','#2f3a78','#1b2048']);
mat('hairSilver',['#ffffff','#e6def5','#b8aad8','#7f70a8']);
mat('hairAuburn',['#f2a56e','#c2603a','#8a3c28','#55231a']);
mat('hairWhite',['#ffffff','#ecebe6','#c2c0bd','#8e8b92']);
mat('hairBlack',['#6a6680','#36334a','#22202f','#14131c']);
// more hair and eye colours so no two classes share a head
mat('hairViolet',['#e2c4ff','#a476e0','#6a44a8','#3a2266']);
mat('hairGreen',['#c8f0a0','#6cb45a','#3e7a3e','#20462a']);
mat('hairCrimson',['#ff9a8a','#d83a3a','#962028','#561018']);
mat('hairPink',['#fff0f6','#ffb4d2','#e07aa6','#a44a74']);
mat('hairTeal',['#c4fff4','#56d4c4','#2a948c','#145654']);
mat('hairChestnut',['#d8a47a','#8e5a36','#5e3a22','#3a2214']);
mat('hairOrange',['#ffe0b0','#f59a3a','#c0621c','#7a3410']);
mat('hairRose',['#ffe2e2','#f08a8a','#c04a5a','#782838']);
mat('hairLilac',['#f8eaff','#d4b0f0','#9c78c4','#5e4486']);
mat('hairSky',['#e0f4ff','#7cc4f0','#3f86c0','#1f4a78']);
mat('hairMint',['#e8fff0','#9ae6b8','#5aae84','#2e6a50']);
mat('hairAsh',['#eef0f4','#aab0bc','#6e7486','#3e4252']);
mat('hairGold',['#fff8c8','#ffc64a','#d0861c','#8a4e10']);
mat('irisRd', ['#ffd0c0','#e05a4a','#a02c30','#5a1420'], {noEdge:true});
mat('irisGd', ['#fff4c0','#f0b440','#b07418','#6a420c'], {noEdge:true});
mat('irisPk', ['#ffe0f0','#f07ab0','#b84a84','#6e2450'], {noEdge:true});
mat('irisSv', ['#ffffff','#c8ccd8','#8a90a4','#4e5468'], {noEdge:true});
mat('irisTl', ['#d0fff6','#4cd0c0','#24908a','#10504e'], {noEdge:true});
mat('tan',    ['#f6e7bf','#dcc48e','#b2955f','#7c6142']);
mat('brownCl',['#c99a6b','#946a45','#6a4a33','#43301f']);
mat('boots',  ['#a87b56','#7a5232','#563621','#352015']);
mat('red',    ['#ff9a7e','#d24c3c','#9c2d36','#5e1a2c']);
mat('steel',  ['#ffffff','#cdd6e2','#8d9ab4','#566080']);
mat('gold',   ['#fff3b4','#f2c34c','#c68a24','#82541c']);
mat('indigo', ['#a495f2','#5d4cc2','#3c3090','#241b5e']);
mat('indigoD',['#7d6fd0','#40339a','#2a2070','#170f42']);
mat('green',  ['#b5e894','#62ac62','#3c7c50','#24503e']);
mat('greenD', ['#7fbf72','#3f7a4c','#2a573c','#173628']);
mat('leather',['#e6b484','#b47c4c','#83542f','#51331f']);
mat('wood',   ['#d8a86c','#9c6a3c','#6c4528','#432a18']);
mat('white',  ['#ffffff','#f1ece0','#cfc7b6','#968c7e']);
mat('cream',  ['#fffaf0','#efe2c6','#c9b48e','#8f7a5c']);
mat('crimson',['#ff8f8f','#c43c4a','#8c2238','#561528']);
mat('sarong', ['#7f8ad8','#3e4aa0','#2a3272','#181d48']);
mat('feather',['#ffffff','#f06e5a','#b83e3e','#7a2230']);
mat('orb',    ['#ffffff','#efe4ff','#c4a8ff','#9370ea'], {emissive:true});
mat('rune',   ['#ffffff','#d8f0ff','#8fd0ff','#5aa0e8'], {emissive:true});
mat('slime',  ['#e6fbff','#86d4ec','#48a4cc','#2a6c9a']);
mat('slimeG', ['#fff8cc','#f5cc50','#d0961e','#8c5a14']);
mat('slimeE', ['#ffffff','#2a3a48','#1c2834','#101820'], {noEdge:true});
mat('fur',    ['#ffffff','#f1e6d2','#d3c2a6','#9c8a72']);
mat('furPink',['#ffd6dc','#eea4b0','#c97888','#94505e']);
mat('cap',    ['#ff9a84','#d84a3a','#a02c30','#661a24']);
mat('boar',   ['#c08860','#8c5a3a','#64402a','#3e271a']);
mat('snout',  ['#f6c0b0','#d8968a','#a86a66','#744448']);
mat('mane',   ['#fff0a8','#eec456','#c08e2a','#7c5a1c']);
mat('tusk',   ['#ffffff','#f6efdc','#cfc4a6','#948a70']);
mat('lantern',['#ffd9a0','#f49a48','#c8642a','#8a3a1c']);
mat('lanternGlow',['#fff8e0','#ffe0a0','#ffbe6a','#f08a3c'], {emissive:true});
mat('lanternWood',['#8a5a3a','#5e3a24','#40261a','#281610']);
mat('wisp',   ['#ffffff','#ffd8a8','#ffb070','#e07a40'], {emissive:true});
mat('crown',  ['#fff6c0','#f6c844','#c88a20','#7e5016']);
mat('deer',   ['#ffe9a8','#e2aa4c','#aa722e','#6c4420']);
mat('antler', ['#fffbe8','#efe2c0','#c8b48a','#8a7a5a']);
mat('rope',   ['#f6e4b4','#c9a868','#94743e','#5e4826'], {noEdge:true});
mat('auraGold',['#ffffff','#fff0b0','#f5c84c','#d08a20'], {emissive:true});
mat('auraGreen',['#ffffff','#dcffd4','#8ee68a','#4aa860'], {emissive:true});
mat('auraWhite',['#ffffff','#f0f6ff','#c8dcff','#8aa8e0'], {emissive:true});
mat('auraViolet',['#ffffff','#efe2ff','#c4a2ff','#8a62e0'], {emissive:true});
mat('kram',   ['#7d93d8','#3d4f9e','#27346e','#161e45']);            // Thai indigo (ม่อฮ่อม)
mat('straw',  ['#fbe6a8','#e0bd6c','#b48c42','#7a5a28']);
mat('tigerFur',['#ffd29a','#f29a3c','#c4621e','#7e3812']);
mat('ochre',  ['#f3c98e','#cf8a46','#9a5a2c','#5e3418']);            // hermit's robe (สีกรัก)
mat('cloth',  ['#ffffff','#f4efe4','#d8cfbd','#a39882']);
mat('lacquer',['#7a3a30','#4e1f1b','#341311','#1e0a09']);
mat('elephant',['#c9c3c8','#958d97','#6a626e','#433d48']);
mat('gem',    ['#ffd6d6','#ff6a6a','#c83a4a','#80203a'], {emissive:true});
// modern outfit cloths: charcoal leather, deep navy, teal, plum, off-white tech fabric, scarlet
mat('charcoal',['#5a5c66','#3a3c46','#24252d','#14141a']);
mat('navy',['#4a6aa8','#2e4a82','#1c2f5a','#101a36']);
mat('teal',['#4ac8c0','#24a098','#147068','#0a4440']);
mat('plum',['#a070d0','#7a48ac','#542c80','#301650']);
mat('tech',['#ffffff','#e6e8f0','#b8bccc','#7c8094']);
mat('scarlet',['#ff6a5a','#e0322a','#a81c18','#5e0e0e']);
// wardrobe (costume) cloths
mat('sakura',['#ffe4ef','#ff9cc4','#e0609a','#902c60']);
mat('sky',['#e4f6ff','#8ccfff','#4a96d8','#1f5490']);
mat('lilac',['#f2e4ff','#c8a0f4','#9468cc','#583a88']);
mat('mint',['#e6fff4','#8ee8c4','#44b890','#1e7058']);
mat('midnight',['#5a5a7a','#2c2c48','#1a1a30','#0c0c18']);
mat('rose',['#ffb0b8','#e8506a','#b02844','#621428']);
mat('sunset',['#ffe0b0','#ffa04a','#e06a20','#8a3a10']);
mat('ivory',['#fffef8','#f6efdc','#d8ccb0','#a89878']);
// worn-gear materials: weapon tiers (ember / obsidian / naga jade / solar) and gear trims
mat('ember',['#fff2c0','#ffa048','#e0561e','#8a2410'], {emissive:true});
mat('obsid',['#c4b0ec','#5e4c80','#30264a','#160f22']);
mat('jade',['#e8fff6','#66e6c8','#26a48e','#0e5a50'], {emissive:true});
mat('sun',['#ffffff','#fff2a8','#ffcc48','#d68c12'], {emissive:true});

/* ---------- raster core ---------- */
function Frame(w, h){ const n = w * h; this.w = w; this.h = h; this.m = new Int16Array(n).fill(-1); this.t = new Uint8Array(n); this.d = new Float32Array(n).fill(-1e9); this.g = new Int16Array(n).fill(-1); }
Frame.prototype.put = function(x, y, d, m, t, g){
  if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
  const i = y * this.w + x; if (d <= this.d[i]) return;
  this.d[i] = d; this.m[i] = m; this.t[i] = t; this.g[i] = g;
};
function Ctx(F, th, ox, oy, k = 1){ this.F = F; this.c = Math.cos(th); this.s = Math.sin(th); this.ox = ox; this.oy = oy; this.k = k; this.pre = null; this.gid = 0; }
function xf(cx, p){ return cx.pre ? cx.pre(p) : p; }
function proj(cx, p){
  const q = xf(cx, p);
  const X = q[0] * cx.c + q[2] * cx.s, Z = -q[0] * cx.s + q[2] * cx.c, Y = q[1];
  const k = cx.k;
  return {x:cx.ox + X * k, y:cx.oy + (-Y * cosP + Z * sinP) * k, d:(Z * cosP + Y * sinP) * k};
}
function toLocal(cx, dx, dy, dd){
  const dY = -cosP * dy + sinP * dd, dZ = sinP * dy + cosP * dd;
  return [dx * cx.c - dZ * cx.s, dY, dx * cx.s + dZ * cx.c];
}
const tone = l => l > .7 ? 0 : l > .28 ? 1 : l > -.12 ? 2 : 3;
// ordered (Bayer 4x4) dithering between tone bands → painterly pixel shading at high resolution
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v / 16 - .47) * .16);
const toneD = (l, x, y) => tone(l + BAYER[(y & 3) * 4 + (x & 3)]);
function texApply(r, m, t){ if (r === false) return null; if (!r) return [m, t]; return [r.m ?? m, r.t ?? Math.max(0, Math.min(3, t + (r.dt || 0)))]; }

/* ellipsoid impostor: c local center, screen radii rx, ry */
function ell(cx, c, rx, ry, m, o = {}){
  const K = cx.k; rx *= K; ry *= K;
  const p = proj(cx, c), rz = (o.rz != null ? o.rz * K : Math.min(rx, ry)), g = o.g ?? cx.gid;
  const F = cx.F, W = F.w, FD = F.d, FM = F.m, FT = F.t, FG = F.g;
  // (v89) the frame's bounds are clipped up front and the pixel write is inline: same pixels, far less work per sprite
  const x0 = Math.max(0, Math.floor(p.x - rx - 1)), x1 = Math.min(W - 1, Math.ceil(p.x + rx + 1)), y0 = Math.max(0, Math.floor(p.y - ry - 1)), y1 = Math.min(F.h - 1, Math.ceil(p.y + ry + 1));
  const lim = rx < 1.3 ? 1.6 : 1, emis = MATS[m].emissive, bias = o.bias || 0, dzK = (o.dz || 0) * K, tex = o.tex, L0 = LV[0], L1 = LV[1], L2 = LV[2];
  for (let y = y0; y <= y1; y++){ const ny = (y + .5 - p.y) / ry, by = (y & 3) * 4, row = y * W;
    for (let x = x0; x <= x1; x++){
      const nx = (x + .5 - p.x) / rx, q = nx * nx + ny * ny;
      if (q > lim) continue;
      const nz = Math.sqrt(Math.max(0, 1 - q)), dd = nz * rz;
      let t = tone(nx * L0 + ny * L1 + nz * L2 + bias + BAYER[by + (x & 3)]);
      let mm = m;
      if (emis) t = o.et ?? (q < .3 ? 0 : q < .7 ? 1 : 2);
      if (tex){
        const lo = toLocal(cx, nx * rx / K, ny * ry / K, dd / K), L = Math.hypot(lo[0], lo[1], lo[2]) || 1;
        const r = texApply(tex([lo[0] / L, lo[1] / L, lo[2] / L], lo, q), mm, t);
        if (!r) continue; mm = r[0]; t = r[1];
      }
      const d = p.d + dd + dzK, i = row + x; if (d <= FD[i]) continue;
      FD[i] = d; FM[i] = mm; FT[i] = t; FG[i] = g;
    } }
}
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/* capsule = spheres along segment, radius r0->r1 */
function cap(cx, a, b, r0, r1, m, o = {}){
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(1, Math.ceil(len / (o.step ? Math.max(.5, Math.min(r0, r1) * o.step) : .5)));   // o.step: thick parts need fewer spheres
  for (let i = 0; i <= n; i++){
    const t = i / n, r = r0 + (r1 - r0) * t;
    // o.tex gets t along the capsule; with o.step the surface point's own offset along the axis refines it, so patterns
    // stay smooth even when the spheres are spaced out
    ell(cx, lerp3(a, b, t), r, r, m, o.tex ? {...o, tex:(nn, lo, q) => o.tex(nn, lo, q, o.step ? t + ((lo[0] * (b[0] - a[0]) + lo[1] * (b[1] - a[1]) + lo[2] * (b[2] - a[2])) / (len * len || 1)) : t)} : o);
  }
}
/* horizontal disc stack (frustum): y0 top -> y1 bottom, around local (cx0, cz0) */
function frustum(cx, base, y0, y1, r0, r1, m, o = {}){
  const steps = Math.max(2, Math.ceil(Math.abs(y0 - y1) / .5)), g = o.g ?? cx.gid;
  for (let i = 0; i <= steps; i++){
    const k = i / steps, y = y0 + (y1 - y0) * k;
    const c = [base[0], y, base[2]], p = proj(cx, c), R = (r0 + (r1 - r0) * k) * cx.k;
    const ry = Math.max(.6, R * sinP);
    for (let py = Math.floor(p.y - ry - 1); py <= Math.ceil(p.y + ry + 1); py++) for (let px = Math.floor(p.x - R - 1); px <= Math.ceil(p.x + R + 1); px++){
      const X = px + .5 - p.x, Zs = (py + .5 - p.y) / sinP;
      if (X * X + Zs * Zs > R * R) continue;
      const nX = X / R, nZ = Zs / R;
      let t = toneD(nX * LV[0] + nZ * sinP * LV[1] + nZ * cosP * LV[2] + (o.bias || 0), px, py), mm = m;
      if (o.tex){
        const lx = X * cx.c - Zs * cx.s, lz = X * cx.s + Zs * cx.c;
        const r = texApply(o.tex([lx / R, 0, lz / R], k, y), mm, t);
        if (!r) continue; mm = r[0]; t = r[1];
      }
      cx.F.put(px, py, p.d + Zs * cosP, mm, t, g);
    }
  }
}
/* thin line, 1-2px */
function line(cx, a, b, m, o = {}){
  const pa = proj(cx, a), pb = proj(cx, b), g = o.g ?? cx.gid;
  const n = Math.max(1, Math.ceil(Math.hypot(pb.x - pa.x, pb.y - pa.y) * 2));
  for (let i = 0; i <= n; i++){
    const k = i / n, x = pa.x + (pb.x - pa.x) * k, y = pa.y + (pb.y - pa.y) * k, d = pa.d + (pb.d - pa.d) * k + 1.2 * cx.k;
    const t = o.toneAt ? o.toneAt(k) : (o.t ?? 1), w = Math.max(1, Math.round(cx.k * .8));
    for (let yy = 0; yy < w; yy++) for (let xx = 0; xx < w; xx++) cx.F.put(Math.floor(x) + xx, Math.floor(y) + yy, d, m, t, g);
    if (o.w2) cx.F.put(Math.floor(x) + w, Math.floor(y), d - .01, m, Math.min(3, t + 1), g);
  }
}
function dot(cx, p, m, t, g){ const q = proj(cx, p), w = Math.max(1, Math.round(cx.k)); for (let yy = 0; yy < w; yy++) for (let xx = 0; xx < w; xx++) cx.F.put(Math.floor(q.x) + xx, Math.floor(q.y) + yy, q.d + 2 * cx.k, m, t, g ?? cx.gid); }

/* compose frame → ImageData */
function finish(F, K = 1){
  const {w, h} = F, n = w * h, out = new Uint8ClampedArray(n * 4), t2 = F.t.slice(), DZ = 2.4 * K, Mm = F.m, D = F.d, G = F.g;
  // (v89) neighbours (left, right, up, down) are read inline, with no arrays made per pixel
  const edge = (i, j) => Mm[j] >= 0 && G[j] !== G[i] && D[j] - D[i] > DZ && !MATS[Mm[j]].emissive;
  for (let i = 0; i < n; i++){
    const m = Mm[i]; if (m < 0) continue; const mt = MATS[m]; if (mt.emissive || mt.noEdge) continue;
    const x = i % w;
    if ((x > 0 && edge(i, i - 1)) || (x < w - 1 && edge(i, i + 1)) || (i >= w && edge(i, i - w)) || (i < n - w && edge(i, i + w))) t2[i] = Math.min(3, Math.max(t2[i] + 1, 2));
  }
  // painterly rim light: surface pixels whose upper-left neighbour is empty catch the light
  for (let i = 0; i < n; i++){
    const m = Mm[i]; if (m < 0 || MATS[m].emissive || t2[i] === 0) continue;
    const x = i % w;
    if ((i >= w && Mm[i - w] < 0) || (x > 0 && Mm[i - 1] < 0)) t2[i] = Math.max(0, t2[i] - 1);
  }
  for (let i = 0; i < n; i++){
    const m = Mm[i], o = i * 4;
    if (m >= 0){ const c = MATS[m].ramp[t2[i]]; out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255; continue; }
    const x = i % w; let best = -1, bd = -1e9;
    if (x > 0 && Mm[i - 1] >= 0 && D[i - 1] > bd){ bd = D[i - 1]; best = i - 1; }
    if (x < w - 1 && Mm[i + 1] >= 0 && D[i + 1] > bd){ bd = D[i + 1]; best = i + 1; }
    if (i >= w && Mm[i - w] >= 0 && D[i - w] > bd){ bd = D[i - w]; best = i - w; }
    if (i < n - w && Mm[i + w] >= 0 && D[i + w] > bd){ bd = D[i + w]; best = i + w; }
    if (best >= 0){
      const mt = MATS[Mm[best]], c = mt.ramp[3];
      if (mt.emissive){ out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 150; }
      else { out[o] = c[0] * .42 | 0; out[o + 1] = c[1] * .38 | 0; out[o + 2] = c[2] * .46 | 0; out[o + 3] = 255; }
    }
  }
  detailPass(F, out, K);
  // thicker outline at high resolution (second ring, slightly softer)
  for (let pass = 1; pass < Math.round(K * .7); pass++){
    const prev = out.slice(), ring = j => prev[j * 4 + 3] === 255 && Mm[j] < 0;
    for (let i = 0; i < n; i++){
      if (prev[i * 4 + 3]) continue;
      const x = i % w, j = x > 0 && ring(i - 1) ? i - 1 : x < w - 1 && ring(i + 1) ? i + 1 : i >= w && ring(i - w) ? i - w : i < n - w && ring(i + w) ? i + w : -1;
      if (j >= 0){ const o = i * 4, a = j * 4; out[o] = prev[a]; out[o + 1] = prev[a + 1]; out[o + 2] = prev[a + 2]; out[o + 3] = 255; }
    }
  }
  return new ImageData(out, w, h);
}

/* (v80) detail pass: more depth in every character and monster, from the shape itself (so nothing shimmers as they move)
   · soft volume: the surface normal (from the depth buffer) lights each pixel smoothly between the 4 tones
   · shine: metal, gems, slime, lacquer and eyes get a sharp specular highlight; skin and cloth a faint sheen
   · contact shadow: creases where one part sits in front of another darken softly
   · back light: a cool rim along the lower-right edge so bodies pop off the grass */
const DP_SHINE = /^(steel|gold|crown|gem|orb|rune|tech|obsid|jade|sun|lacquer|tusk|slime|slimeG|slimeE|lantern|kram)$/, DP_SOFT = /^(skin|blush|hair|leather|boots|silk|white|cream|ivory)/;
const DP_SHINE_P = /_(shell|horn|beak|casque|crystal|tusk|claw|acc|bars)$/, DP_SOFT_P = /_(body|belly|head|muzzle|nose|skin|socks|wing|fin|top|mantle|tip)$/, DP_COAT = /_(body|belly|head|muzzle|stripe|spot|dark|socks|skin)$/;
const DP_KIND = [], DP_X = [];
function detailPass(F, out, K){ if (globalThis.SPR_NODETAIL) return;
  const {w, h} = F, n = w * h, D = F.d, Mm = F.m, G = F.g, s = 2 * K, hx = LV[0], hy = LV[1], hz = LV[2] + 1, hl = Math.hypot(hx, hy, hz);
  const H0 = [hx / hl, hy / hl, hz / hl], kr = Math.round(K), kw = kr * w, dz = 1.5 * K, L0 = LV[0], L1 = LV[1], L2 = LV[2], H00 = H0[0], H01 = H0[1], H02 = H0[2];
  for (let i = 0; i < n; i++){ const m = Mm[i]; if (m < 0) continue; const mt = MATS[m]; if (mt.emissive) continue;
    // (v95) monster parts are named <monster>_<part>: their shells, horns and beaks shine, their coats get a soft sheen,
    // and manes, tails and coats get a fine grain that follows the body's curve, like hair does
    let kd = DP_KIND[m]; if (kd === undefined) kd = DP_KIND[m] = DP_SHINE.test(mt.name) || DP_SHINE_P.test(mt.name) ? 2 : DP_SOFT.test(mt.name) || DP_SOFT_P.test(mt.name) ? 1 : 0;
    let xk = DP_X[m]; if (xk === undefined) xk = DP_X[m] = /^hair|_(mane|tail|hair|crest)$/.test(mt.name) ? 1 : /^(eye|slimeE)$/.test(mt.name) ? 2 : /^steel$/.test(mt.name) ? 3 : DP_COAT.test(mt.name) ? 4 : 0;
    const x = i % w, g = G[i], di = D[i];   // (v83) neighbours read inline: no closures or arrays per pixel
    const l = x > 0 && Mm[i - 1] >= 0 && G[i - 1] === g ? D[i - 1] : di, r = x < w - 1 && Mm[i + 1] >= 0 && G[i + 1] === g ? D[i + 1] : di,
      u = i >= w && Mm[i - w] >= 0 && G[i - w] === g ? D[i - w] : di, dn = i + w < n && Mm[i + w] >= 0 && G[i + w] === g ? D[i + w] : di;
    let nx = -(r - l), ny = -(dn - u), nz = s; const nl = Math.sqrt(nx * nx + ny * ny + nz * nz); nx /= nl; ny /= nl; nz /= nl;
    const lam = nx * L0 + ny * L1 + nz * L2;
    let f = 1 + (lam - .62) * .46;
    // (v95) cavities: a pixel lying deeper than the surface around it (between muscles, folds, under a jaw) darkens a little
    { const q = 2 * kr, ql = x >= q ? i - q : -1, qr = x < w - q ? i + q : -1, qu = i - q * w, qd = i + q * w;
      let sum = 0, c = 0;
      if (ql >= 0 && G[ql] === g && Mm[ql] >= 0){ sum += D[ql]; c++; } if (qr >= 0 && G[qr] === g && Mm[qr] >= 0){ sum += D[qr]; c++; }
      if (qu >= 0 && G[qu] === g && Mm[qu] >= 0){ sum += D[qu]; c++; } if (qd < n && G[qd] === g && Mm[qd] >= 0){ sum += D[qd]; c++; }
      if (c >= 3){ const cv = sum / c - di; if (cv > .5 * K) f *= 1 - Math.min(.16, (cv - .5 * K) / (9 * K)); } }
    // (v95) coat grain on monster bodies: a soft cross-weave from the normal, so it sits still on the body as it moves
    if (xk === 4) f *= 1 + Math.sin(nx * 23 + ny * 7) * Math.sin(ny * 19 - nx * 5) * .07;
    // (v83) hair strands: fine light and dark combing that follows the curve of the head (from the normal, so it never crawls)
    if (xk === 1) f *= 1 + Math.sin(nx * 15 + ny * 5) * .09;
    // contact shadow: something of another part sits just above/left and in front
    { const j1 = i - kw, j2 = i - kr, j3 = i + kr;
      if ((j1 >= 0 && Mm[j1] >= 0 && G[j1] !== g && D[j1] - di > dz) || (j2 >= 0 && Mm[j2] >= 0 && G[j2] !== g && D[j2] - di > dz) || (j3 < n && Mm[j3] >= 0 && G[j3] !== g && D[j3] - di > dz)) f *= .88; }
    const o = i * 4; let R = out[o] * f, Gc = out[o + 1] * f, B = out[o + 2] * f;
    const sp = Math.max(0, nx * H00 + ny * H01 + nz * H02);
    if (kd === 2){ const v = Math.pow(sp, 18) * .85; R += (255 - R) * v; Gc += (255 - Gc) * v; B += (255 - B) * v; }
    else if (kd === 1){ const v = Math.pow(sp, 10) * .18; R += (255 - R) * v; Gc += (255 - Gc) * v; B += (255 - B) * v; }
    // back light on the lower-right silhouette
    if ((x < w - 1 && Mm[i + 1] < 0) || (i + w < n && Mm[i + w] < 0)){ R = R * .82 + 150 * .18; Gc = Gc * .82 + 190 * .18; B = B * .82 + 235 * .18; }
    // (v83) eyes: brighter, with a white catch-light on the upper-left pixel of each eye
    if (xk === 2){ R = Math.min(255, R * 1.18 + 14); Gc = Math.min(255, Gc * 1.18 + 14); B = Math.min(255, B * 1.18 + 14);
      if ((i < w || Mm[i - w] !== m) && (x === 0 || Mm[i - 1] !== m)){ R = 255; Gc = 252; B = 240; } }
    // (v83) gold trim where armour plates meet cloth or skin
    else if (xk === 3){ const t = j => j >= 0 && j < n && Mm[j] >= 0 && Mm[j] !== m && G[j] !== g;
      if (t(i - 1) || t(i + 1) || t(i - w) || t(i + w)){ R = R * .45 + 236 * .55; Gc = Gc * .45 + 192 * .55; B = B * .45 + 92 * .55; } }
    out[o] = R; out[o + 1] = Gc; out[o + 2] = B; }
}

/* ---------- math helpers ---------- */
const rotX = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
const rotZ = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
const rotY = (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/* ---------- actions ---------- */
const ACTIONS = {
  idle:{n:6, fps:5, loop:true, th:'ยืน'}, walk:{n:8, fps:12, loop:true, th:'เดิน'}, attack:{n:5, fps:12, th:'โจมตี'},
  skill:{n:5, fps:10, th:'ใช้สกิล'}, cast:{n:4, fps:8, loop:true, th:'ร่ายเวท'}, roll:{n:6, fps:14, th:'กลิ้งหลบ'},
  capture:{n:6, fps:10, th:'จับสัตว์'}, rideIdle:{n:4, fps:5, loop:true, th:'ขี่ (หยุด)'}, ride:{n:6, fps:11, loop:true, th:'ขี่ (วิ่ง)'},
  hurt:{n:2, fps:8, th:'โดนตี'}, die:{n:4, fps:6, th:'ล้ม'}, sit:{n:4, fps:3, loop:true, th:'นั่งพับเพียบ'},
  // ---------- skill poses (each skill names one in SKILL_ACT, js/data/jobs.js) ----------
  punch:{n:6, fps:14, th:'หมัดชุด'}, knee:{n:5, fps:11, th:'เข่าลอย'}, kick:{n:6, fps:14, th:'เตะตัด'}, spinkick:{n:8, fps:16, th:'จระเข้ฟาดหาง'},
  uppercut:{n:6, fps:12, th:'หนุมานถวายแหวน'}, teep:{n:5, fps:12, th:'ถีบ'}, ramwai:{n:8, fps:6, th:'รำไหว้ครู'}, wai:{n:6, fps:8, th:'ไหว้'},
  invoke:{n:6, fps:10, th:'อัญเชิญ'}, point:{n:4, fps:12, th:'ปล่อยเวท'}, plant:{n:5, fps:10, th:'ปักไม้เท้า'}, drink:{n:6, fps:8, th:'ดื่มยา'},
  tend:{n:6, fps:8, th:'ปรุงยา'}, throw:{n:5, fps:14, th:'ขว้าง'}, slam:{n:6, fps:12, th:'ฟาดพื้น'}, lunge:{n:4, fps:12, th:'พุ่งแทง'},
  shout:{n:5, fps:8, th:'คำราม'}, guard:{n:5, fps:8, th:'ตั้งรับ'}, whirl:{n:6, fps:18, loop:true, th:'หมุนฟัน'}, crouch:{n:4, fps:8, th:'ย่อพราง'},
  settrap:{n:5, fps:8, th:'วางกับดัก'}, whistle:{n:5, fps:8, th:'ผิวปากเรียก'}, aimup:{n:5, fps:10, th:'ยิงขึ้นฟ้า'}, stab:{n:5, fps:12, th:'แทง'},
  snatch:{n:5, fps:12, th:'ล้วง'}, heave:{n:5, fps:10, th:'ทอดแห'}, flurry:{n:6, fps:16, th:'รัวมีด'}, crossslash:{n:5, fps:14, th:'ฟันกากบาท'}, twinspin:{n:8, fps:18, th:'หมุนมีดคู่'},
  // (v116) poses of their own for skills that used to share one
  hongcall:{n:6, fps:10, th:'กางปีกอัญเชิญหงส์'}, dive:{n:6, fps:14, th:'กระโจนฟันลง'}, pounce:{n:5, fps:13, th:'พยัคฆ์กระโจน'},
  seal:{n:5, fps:11, th:'ผนึกตรามรณะ'}, rake:{n:6, fps:15, th:'ตะปบกรงเล็บ'}
};
const MOB_ACTIONS = {
  idle:{n:4, fps:5, loop:true, th:'ยืน'}, walk:{n:4, fps:8, loop:true, th:'เดิน'}, attack:{n:4, fps:10, th:'โจมตี'},
  hurt:{n:2, fps:8, th:'โดนตี'}, die:{n:4, fps:6, th:'ล้ม'}
};
const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

/* ---------- skill poses ----------
   Conventions: arm* = shoulder pitch (0 down, 1.57 forward, 3.1 up), out* = sideways (− across the chest),
   elb* = forearm bend, leg* = hip swing (+ forward), lift* = knee lift, bob = height (− crouch, + jump),
   lean/twist = upper body, spin = whole body turn (round kicks). R = the weapon hand. */
const GUARD = P => { P.armL = P.armR = 1.05; P.elbL = P.elbR = 1.45; P.outL = P.outR = -.12; P.legL = .32; P.legR = -.24; P.bob = -.7; };
const WAI = (P, up = 0) => { P.armL = P.armR = .92 + up; P.elbL = P.elbR = 1.72; P.outL = P.outR = -.44; P.noWeapon = true; };
const pick = (a, f) => a[Math.min(f, a.length - 1)];
const SK_POSE = {
  punch(P, f){ GUARD(P); P.lean = .06;
    if (f === 1){ P.armR = 1.58; P.elbR = .04; P.outR = -.06; P.lean = .14; P.twist = .32; P.legL = .45; }
    if (f === 3){ P.armL = 1.58; P.elbL = .04; P.outL = -.06; P.lean = .16; P.twist = -.36; P.legR = -.36; }
    if (f === 5){ P.armR = 1.45; P.elbR = .95; P.outR = .65; P.lean = .12; P.twist = .5; P.mouth = 1; }
    P.sway = [0, .5, 0, -.5, 0, .7][f]; },
  knee(P, f){ P.noWeapon = false;
    P.bob = [-1.6, 3, 5.2, 1.4, -.4][f]; P.lean = [.1, .15, .24, .1, 0][f];
    P.armL = P.armR = [-.4, 1.4, 1.95, 1.2, .3][f]; P.elbL = P.elbR = [.6, 1.3, 1.25, 1.2, .4][f]; P.outL = P.outR = [.3, -.1, -.2, 0, .1][f];
    P.legL = [.1, .9, 1.25, .4, .1][f]; P.liftL = [0, 3.8, 5.4, 1, 0][f]; P.legR = [-.2, -.3, -.5, -.2, -.1][f]; P.mouth = f === 2 ? 1 : 0; P.sway = [0, -.6, -1, -.4, 0][f]; },
  kick(P, f){ GUARD(P);
    P.spin = [0, .4, .9, 1.5, 2.3, .2][f]; P.lean = [0, -.06, -.15, -.26, -.12, 0][f];
    P.legL = [.32, .35, 1.0, 1.55, .8, .32][f]; P.liftL = [0, 2, 3.6, 0, 1.2, 0][f];
    if (f >= 2 && f <= 4){ P.armR = -.2; P.outR = .8; P.elbR = .3; P.armL = .5; P.outL = .9; }
    P.sway = [0, .4, .9, 1.2, .8, .2][f]; },
  spinkick(P, f, n){ P.spin = f / n * Math.PI * 2; P.bob = [0, .8, 1.4, 1.6, 1.4, 1, .4, 0][f]; P.lean = -.22;
    P.legL = f >= 1 && f <= 6 ? 1.5 : .4; P.liftL = f === 1 || f === 6 ? 2 : 0; P.legR = -.2;
    P.armL = .7; P.outL = 1.05; P.elbL = .3; P.armR = .5; P.outR = 1.0; P.elbR = .3; P.sway = 1.2; P.mouth = f > 2 && f < 6 ? 1 : 0; P.aura = Math.min(4, f); },
  uppercut(P, f){ P.bob = [-2.6, -.4, 4.2, 5.6, 2.2, -.8][f]; P.lean = [.25, .1, -.12, -.16, 0, .1][f];
    P.armR = [-.3, 1.6, 2.9, 3.0, 2.2, .6][f]; P.elbR = [1.7, 1.3, .25, .1, .4, .8][f]; P.outR = [.1, -.1, -.15, -.15, 0, .1][f];
    P.armL = [.9, .9, 1.1, 1.0, .8, .4][f]; P.elbL = [1.4, 1.4, 1.5, 1.5, 1.2, .8][f];
    P.legL = [.3, .2, .5, .7, .3, .3][f]; P.liftL = [0, 0, 3, 4, 1, 0][f]; P.legR = [-.2, -.2, -.1, -.1, -.2, -.2][f]; P.twist = [-.2, .1, .3, .3, .1, 0][f]; P.mouth = f === 3 ? 1 : 0; P.sparks = f; },
  teep(P, f){ GUARD(P); P.legL = [.9, 1.55, 1.5, .6, .32][f]; P.liftL = [3.6, 0, 0, 2, 0][f]; P.lean = [-.08, -.3, -.28, -.1, 0][f]; P.armR = [1.05, .4, .4, 1, 1.05][f]; P.outR = [-.1, .6, .6, 0, -.1][f]; P.sway = [.3, 1, .8, .3, 0][f]; },
  ramwai(P, f){
    if (f <= 2){ P.kneel = 1; P.bob = -4.5; WAI(P, f === 2 ? .35 : 0); P.head = f === 1 ? .2 : .05; P.eyes = f === 1 ? 'closed' : 'open'; P.aura = f; return; }
    const k = f - 3, s = Math.sin(k * 1.3);
    P.noWeapon = true; P.bob = -1.4; P.armL = .7 + s * .5; P.outL = 1.15; P.elbL = .9 - s * .4; P.armR = .7 - s * .5; P.outR = 1.15; P.elbR = .9 + s * .4;
    P.legL = k % 2 ? .5 : .2; P.liftL = k % 2 ? 3 : 0; P.legR = -.2; P.twist = s * .3; P.sway = s * 1.1; P.aura = Math.min(4, k); P.sparks = k; },
  wai(P, f){ WAI(P, f === 4 ? .45 : 0);
    if (f === 0 || f === 5){ P.armL = P.armR = .6; P.elbL = P.elbR = 1.2; P.outL = P.outR = -.2; }
    P.head = f === 2 || f === 3 ? .2 : 0; P.eyes = f >= 2 && f <= 4 ? 'closed' : 'open'; P.bob = f === 2 || f === 3 ? -.6 : 0; P.lean = f === 2 || f === 3 ? .1 : 0; P.aura = Math.min(4, f); P.sparks = f; },
  invoke(P, f){ P.armL = [.4, 1.6, 2.7, 2.8, 2.7, 1.2][f]; P.armR = [.4, 1.7, 2.9, 3.0, 2.9, 1.3][f]; P.elbL = P.elbR = [1.2, .6, .12, .1, .12, .5][f];
    P.outL = P.outR = [.1, .2, .38, .42, .38, .2][f]; P.head = [0, -.04, -.1, -.12, -.1, 0][f]; P.bob = [-.4, 0, .4, .6, .4, 0][f]; P.mouth = f >= 2 && f <= 4 ? 1 : 0;
    P.glow = f; P.ring = f >= 1 && f <= 4 ? f : -1; P.aura = Math.min(4, f); P.sparks = f; P.wpn = 2.3; P.sway = [0, .3, .6, .6, .4, 0][f]; },
  point(P, f){ P.armR = [1.2, 1.58, 1.55, .9][f]; P.elbR = [.9, .05, .05, .5][f]; P.outR = -.05; P.armL = .95; P.elbL = 1.5; P.outL = -.3;
    P.lean = [.0, .16, .14, .04][f]; P.twist = [-.2, .28, .25, .05][f]; P.legL = [.1, .42, .4, .15][f]; P.legR = -.25; P.glow = f; P.mouth = f === 1 ? 1 : 0; P.sway = [0, -.6, -.5, 0][f]; },
  plant(P, f){ P.armR = [2.2, 2.6, 1.0, 1.0, .6][f]; P.elbR = [.5, .3, .15, .15, .4][f]; P.armL = [2.0, 2.4, .95, .95, .4][f]; P.elbL = [.7, .5, .3, .3, .4][f]; P.outL = -.25; P.outR = -.1;
    P.bob = [.4, 1, -1.8, -1.6, -.4][f]; P.lean = [-.1, -.15, .3, .28, .05][f]; P.ring = f >= 2 ? f : -1; P.glow = f; P.aura = f >= 2 ? f : -1; P.wpn = 2.0; P.legL = .35; P.legR = -.3; },
  drink(P, f){ P.noWeapon = true; P.armR = [.6, 1.6, 1.75, 1.75, 1.2, .3][f]; P.elbR = [1, 1.9, 2.15, 2.15, 1.4, .5][f]; P.outR = -.28;
    P.head = [0, -.04, -.12, -.12, 0, 0][f]; P.eyes = f === 2 || f === 3 ? 'closed' : 'open'; P.armL = .25; P.elbL = .5; P.aura = f >= 3 ? f - 1 : -1; P.sparks = f; },
  tend(P, f){ P.noWeapon = true; P.bob = -2; P.lean = .26; P.legL = .45; P.legR = -.35;
    const r = f % 2 ? .15 : -.15; P.armL = 1.0; P.armR = 1.0; P.elbL = .65 + r; P.elbR = .65 - r; P.outL = P.outR = -.32; P.head = .1; P.aura = Math.min(4, f); P.sparks = f; },
  throw(P, f){ P.armR = [2.6, 3.0, 1.6, .9, .4][f]; P.elbR = [1.0, 1.5, .05, .2, .4][f]; P.outR = [.3, .35, 0, -.1, .1][f]; P.armL = [1.3, 1.4, .6, .2, .1][f]; P.elbL = .2;
    P.lean = [-.12, -.18, .2, .25, .05][f]; P.twist = [-.4, -.5, .35, .4, .05][f]; P.legL = [.3, .35, .5, .5, .2][f]; P.legR = -.25; P.noWeapon = f === 2 || f === 3; P.sway = [.4, .6, -.6, -.8, -.2][f]; },
  slam(P, f){ P.bob = [-1.6, 4, 5.2, 0, -1.9, -.4][f]; P.lean = [.1, -.15, -.2, .35, .42, .05][f];
    P.armR = [.5, 2.9, 3.2, 1.0, .9, .4][f]; P.elbR = [.8, .4, .5, .1, .1, .4][f]; P.armL = [.4, 2.7, 3.0, 1.0, .9, .3][f]; P.elbL = [.8, .5, .6, .2, .2, .4][f];
    P.legL = [.2, .1, .2, .45, .45, .2][f]; P.legR = [-.2, -.1, -.2, -.45, -.45, -.2][f]; P.liftL = f === 1 || f === 2 ? 2 : 0; P.mouth = f === 3 || f === 4 ? 1 : 0; P.sparks = f >= 3 ? f : -1; P.wpn = [1.7, 1.3, 1.1, .7, .7, 1.5][f]; P.sway = [0, -.6, -.8, .9, .7, .1][f]; },
  lunge(P, f){ P.bob = [-1, -1.6, -1.6, -.4][f]; P.lean = [-.1, .38, .36, .05][f]; P.legL = [.1, .85, .8, .2][f]; P.legR = [-.1, -.75, -.7, -.2][f];
    P.armR = [.3, 1.57, 1.55, .6][f]; P.elbR = [1.2, .05, .05, .4][f]; P.armL = [.2, -.4, -.4, .1][f]; P.outL = .4; P.twist = [-.3, .3, .28, 0][f]; P.wpn = [1.7, 1.57, 1.57, 1.6][f]; P.sway = [.3, -1, -.9, 0][f]; },
  shout(P, f){ const on = f >= 1 && f <= 3; P.armL = P.armR = on ? .95 : .5; P.outL = P.outR = on ? 1.1 : .2; P.elbL = P.elbR = on ? .4 : 1.0;
    P.lean = on ? -.2 : .1; P.head = on ? -.12 : .05; P.mouth = on ? 1 : 0; P.bob = on ? .2 : -1; P.legL = .32; P.legR = -.32; P.aura = Math.min(4, f); P.sparks = f; P.sway = on ? Math.sin(f * 2) * .8 : 0; },
  guard(P, f){ P.legL = .4; P.legR = -.4; P.bob = -1.3; P.lean = .05; P.armR = 1.2; P.elbR = .95; P.outR = -.22; P.armL = 1.1; P.elbL = 1.05; P.outL = -.36; P.wpn = 2.4;
    if (f === 0){ P.armR = P.armL = .5; P.bob = -.4; } P.aura = Math.min(4, f); P.sparks = f; P.mouth = f === 2 ? 1 : 0; },
  whirl(P, f, n){ P.spin = f / n * Math.PI * 2; P.bob = -.8; P.lean = .08; P.armR = 1.45; P.outR = 1.2; P.elbR = .1; P.armL = .8; P.outL = 1.0; P.elbL = .4; P.legL = .35; P.legR = -.3; P.sway = 1.2; P.wpn = 1.55; P.mouth = 1; },
  crouch(P, f){ P.bob = [-1.5, -3, -3.2, -3][f]; P.lean = .36; P.legL = .5; P.legR = -.42; P.armL = 1.0; P.elbL = 1.6; P.outL = -.2; P.armR = .45; P.elbR = .8; P.head = .1; P.eyes = f === 2 ? 'closed' : 'open'; P.sway = .3; },
  settrap(P, f){ P.kneel = 1; P.bob = -4.5; P.lean = .48; P.noWeapon = true; P.armL = P.armR = .95; P.elbL = .35 + (f % 2) * .2; P.elbR = .35 + ((f + 1) % 2) * .2; P.outL = P.outR = -.1; P.head = .12; },
  whistle(P, f){ P.armR = 1.85; P.elbR = 2.2; P.outR = -.3; P.armL = [2.0, 2.8, 2.4, 2.8, 1.4][f]; P.outL = .55; P.elbL = .2; P.mouth = 1; P.head = -.08; P.lean = -.06; P.sway = Math.sin(f * 2) * .6; P.noWeapon = true; },
  aimup(P, f){ P.armL = 2.3; P.outL = .05; P.elbL = .05; P.armR = [1.9, 2.05, 2.1, 2.0, .8][f]; P.elbR = [.6, 1.4, 1.9, .3, .3][f]; P.outR = .1; P.draw = [0, .6, 1, 0, 0][f];
    P.arrow = f >= 1 && f <= 2; P.lean = -.26; P.head = -.14; P.legL = .3; P.legR = -.25; P.bob = -.4; },
  stab(P, f){ P.bob = [-2, -2, -1.8, -1, -.2][f]; P.lean = [.22, .42, .4, .2, .02][f]; P.legL = [.2, .72, .7, .4, .1][f]; P.legR = [-.2, -.62, -.6, -.3, -.1][f];
    P.armR = [-.3, 1.55, 1.5, 1.2, .5][f]; P.elbR = [1.4, .08, .1, .8, .4][f]; P.armL = [-.2, 1.4, 1.35, .8, .2][f]; P.elbL = [1.2, .2, .2, .9, .3][f]; P.outL = -.15;
    P.twist = [-.3, .2, .2, 0, 0][f]; P.wpn = [2.0, 1.6, 1.6, 1.7, 1.7][f]; P.sway = [.4, -.9, -.8, -.2, 0][f]; },
  snatch(P, f){ P.armR = [1.4, 1.6, .8, .3, .2][f]; P.elbR = [.2, 0, 2.0, .6, .4][f]; P.outR = [-.1, -.12, -.2, .2, .1][f];
    P.lean = [.3, .38, .1, .05, 0][f]; P.legL = [.5, .6, .3, .2, .1][f]; P.legR = -.3; P.bob = [-.8, -1.2, -.6, -.2, 0][f]; P.twist = [.1, .2, -.3, -.2, 0][f]; P.mouth = f === 3 ? 1 : 0; },
  heave(P, f){ P.noWeapon = true; P.armL = P.armR = [2.9, 3.1, 1.5, 1.1, .4][f]; P.elbL = P.elbR = [.9, 1.1, .1, .2, .4][f]; P.outL = P.outR = [.15, .2, .25, .3, .2][f];
    P.lean = [-.2, -.25, .3, .32, .05][f]; P.legL = .4; P.legR = -.3; P.bob = [-.3, -.2, -1, -1, -.2][f]; P.mouth = f === 2 ? 1 : 0; },
  // (v116) the summoner raises both arms like wings, rises onto the toes, then sweeps them forward to send the swan
  hongcall(P, f){ P.noWeapon = true; P.armL = P.armR = [.35, 1.25, 2.35, 2.85, 1.6, .9][f]; P.outL = P.outR = [.3, 1.35, 1.05, .6, .2, .3][f];
    P.elbL = P.elbR = [.6, .25, .2, .15, .1, .5][f]; P.bob = [0, .6, 1.4, 1.8, .2, -.3][f]; P.lean = [.05, -.12, -.2, -.18, .22, .08][f];
    P.head = [0, -.1, -.18, -.2, .05, 0][f]; P.legL = .25; P.legR = -.25; P.aura = Math.min(4, f); P.sparks = f >= 2 && f <= 4 ? f : -1; P.eyes = f === 2 ? 'closed' : 'open'; P.mouth = f === 4 ? 1 : 0; },
  // (v116) Shadow Execution: a crouch, a leap with the blade high, the drop and the cut
  dive(P, f){ P.bob = [-2.2, -.6, 3.2, 4.2, -.4, -2.6][f]; P.lean = [.32, .1, -.12, -.05, .48, .32][f];
    P.armR = [1.0, 2.1, 2.9, 3.05, .7, .35][f]; P.elbR = [1.1, .5, .2, .15, .2, .6][f]; P.outR = [-.1, .1, .2, .1, -.2, -.1][f];
    P.armL = [.9, 1.5, 1.9, 1.7, .9, .6][f]; P.elbL = [1.2, .7, .5, .6, 1.0, 1.2][f]; P.outL = [.2, .5, .7, .6, .3, .2][f];
    P.legL = [.55, .3, .85, .9, .6, .55][f]; P.legR = [-.5, -.4, -.9, -.95, -.55, -.5][f]; P.liftL = f >= 2 && f <= 3 ? 1.4 : 0;
    P.wpn = [2.0, 2.6, 3.0, 3.1, 1.1, 1.3][f]; P.mouth = f === 4 ? 1 : 0; P.sparks = f === 4 ? 3 : -1; },
  // (v116) Tiger Pounce: down low, spring, both hands forward like claws, land
  pounce(P, f){ P.bob = [-3.2, -1.4, 2.2, 1.0, -2.2][f]; P.lean = [.46, .62, .72, .55, .3][f];
    P.armL = P.armR = [.8, 1.5, 1.75, 1.4, .6][f]; P.outL = [.12, .3, .36, .22, .1][f]; P.outR = [-.12, -.3, -.36, -.22, -.1][f];
    P.elbL = P.elbR = [1.4, .35, .1, .5, 1.0][f]; P.legL = [.62, .2, -.42, .1, .52][f]; P.legR = [-.52, -.82, -.92, -.42, -.42][f];
    P.liftL = f === 2 ? 1.2 : 0; P.head = [.1, -.05, -.12, 0, .08][f]; P.mouth = f === 2 || f === 3 ? 1 : 0; P.sway = [.2, .6, 1, .6, .2][f]; },
  // (v116) Death Mark: the free hand draws the seal before the face, eyes shut, then the blade thrusts through it
  seal(P, f){ P.armL = [1.2, 1.75, 1.85, .6, .4][f]; P.elbL = [1.6, 1.95, 1.95, .6, .8][f]; P.outL = [.1, -.15, -.2, .2, .2][f];
    P.armR = [.4, .5, .6, 1.65, 1.5][f]; P.elbR = [1.2, 1.1, 1.0, .1, .2][f]; P.outR = [-.1, -.1, -.1, .05, 0][f];
    P.lean = [0, -.05, 0, .42, .26][f]; P.bob = [0, -.3, -.45, -1.3, -.6][f]; P.legL = [.2, .2, .25, .7, .5][f]; P.legR = [-.2, -.2, -.25, -.55, -.4][f];
    P.eyes = f === 2 ? 'closed' : 'open'; P.aura = f >= 1 && f <= 2 ? 3 : 0; P.wpn = [1.3, 1.3, 1.3, 1.6, 1.5][f]; P.mouth = f === 3 ? 1 : 0; },
  // (v116) Moon Claws: low and forward, the hands rake up one after the other
  rake(P, f){ P.lean = [.3, .38, .34, .3, .38, .3][f]; P.bob = [-1.6, -.6, -1.1, -1.6, -.5, -1.2][f];
    P.armR = [.6, 2.3, .8, .55, 2.35, .9][f]; P.elbR = [1.2, .2, .9, 1.2, .2, .8][f]; P.outR = [-.15, .15, -.2, -.15, .2, -.1][f];
    P.armL = [.6, .55, 2.25, .6, .55, 2.1][f]; P.elbL = [1.2, 1.1, .25, 1.1, 1.1, .3][f]; P.outL = [.15, .15, .3, .15, .15, .3][f];
    P.legL = .55; P.legR = -.48; P.twist = [0, .18, -.18, 0, .2, -.2][f]; P.mouth = f === 1 || f === 4 ? 1 : 0; P.sparks = f === 2 || f === 5 ? 2 : -1; },
  // twin daggers: an X-shaped double cut, and a spinning double slash
  crossslash(P, f){ P.bob = [-1, -1.8, -1.6, -1, -.2][f]; P.lean = [.1, .34, .36, .2, 0][f]; P.legL = [.2, .7, .68, .4, .1][f]; P.legR = [-.2, -.6, -.58, -.3, -.1][f];
    P.armR = [2.4, 2.2, .9, .4, .3][f]; P.elbR = [.5, .2, .1, .6, .4][f]; P.outR = [-.3, .4, -.5, -.3, 0][f];
    P.armL = [2.4, 2.2, .9, .4, .3][f]; P.elbL = [.5, .2, .1, .6, .4][f]; P.outL = [-.3, .4, -.5, -.3, 0][f];
    P.twist = [0, .1, -.1, 0, 0][f]; P.wpn = [2.6, 2.2, 1.0, 1.4, 1.7][f]; P.sway = [.4, -.6, -1, -.4, 0][f]; P.mouth = f === 2 ? 1 : 0; P.sparks = f >= 2 && f <= 3 ? f : -1; },
  twinspin(P, f, n){ P.spin = f / n * Math.PI * 2; P.bob = [-.4, .6, 1.2, 1.4, 1.2, .6, -.2, -.8][f] || 0; P.lean = .12; P.legL = .45; P.legR = -.38; P.liftL = f > 1 && f < 6 ? 1.2 : 0;
    P.armR = 1.55; P.outR = 1.25; P.elbR = .05; P.armL = 1.55; P.outL = 1.25; P.elbL = .05; P.wpn = 1.55; P.sway = 1.4; P.mouth = 1; P.aura = Math.min(4, f); },
  flurry(P, f){ const a = f % 2; P.bob = -1.2; P.lean = .25; P.legL = .5; P.legR = -.4;
    P.armR = a ? .6 : 1.6; P.elbR = a ? 1.4 : .05; P.armL = a ? 1.6 : .6; P.elbL = a ? .05 : 1.4; P.outL = -.1; P.outR = -.1; P.twist = a ? -.28 : .28; P.sway = a ? .8 : -.8; }
};

/* ---------- human model ---------- */
function humanPose(act, f, n, weapon){
  const P = {bob:0, legL:0, legR:0, liftL:0, liftR:0, armL:.1, armR:.1, outL:.16, outR:.16, elbL:.28, elbR:.28, lean:0, twist:0, hipX:0, fall:0, wpn:1.7,
    eyes:'open', sit:false, spin:0, draw:0, glow:0, ring:-1, mouth:0, kneel:0, head:0, sway:0, aura:-1, sparks:-1, lasso:null, ride:null, tuck:0, roll:0, noWeapon:false, breath:0};
  const ph = f / n * Math.PI * 2;
  if (act === 'idle'){
    const b = Math.sin(ph);
    P.bob = -.35 + b * .35; P.breath = b * .25; P.hipX = Math.sin(ph) * .35; P.twist = Math.sin(ph) * .03;
    P.armL = P.armR = .1 + b * .03; P.elbL = P.elbR = .3 + b * .05; P.sway = Math.sin(ph - 1) * .4; P.head = Math.sin(ph - .6) * .02;
    if (f === 5) P.eyes = 'closed';
  } else if (act === 'walk'){
    const s = Math.sin(ph), c = Math.cos(ph);
    P.legL = .62 * s; P.legR = -.62 * s;
    P.liftL = Math.max(0, c) * 1.8 * Math.max(0, s + .3); P.liftR = Math.max(0, -c) * 1.8 * Math.max(0, -s + .3);
    P.armL = -.5 * s; P.armR = .5 * s; P.elbL = .3 + Math.max(0, -s) * .55; P.elbR = .3 + Math.max(0, s) * .55;
    P.bob = (Math.abs(c) - .6) * 1.1; P.lean = .07; P.twist = .13 * s; P.hipX = s * .25; P.sway = Math.sin(ph - .9) * .8; P.head = -c * .015;
  } else if (act === 'attack'){
    if (weapon === 'bow'){
      P.armL = 1.5; P.outL = .05; P.elbL = .05; P.armR = [1.0, 1.35, 1.45, 1.2, .5][f]; P.elbR = [.6, 1.6, 2.2, .3, .3][f]; P.outR = .1; P.draw = [0, .6, 1, 0, 0][f];
      P.lean = [0, .05, .08, -.04, 0][f]; P.twist = [0, -.25, -.4, .1, 0][f]; P.arrow = f >= 1 && f <= 2; P.legL = .25; P.legR = -.2;
    } else if (weapon === 'shuriken'){
      // (v184) a throwing star: the hand draws back past the ear, whips forward flat and lets go at frame 2, follows
      // through low, then a new star is drawn from the pouch; the free hand points at the target
      P.armR = [.5, 1.9, 1.35, .75, .4][f]; P.elbR = [.7, 2.0, .25, .1, .5][f]; P.outR = [.2, .55, .05, -.2, .1][f]; P.wpn = [1.7, 2.6, 1.5, 1.2, 1.7][f];
      P.armL = [.4, 1.25, .9, .35, .2][f]; P.elbL = [.4, .15, .3, .5, .4][f]; P.outL = [.2, .1, .15, .25, .2][f];
      P.lean = [0, -.06, .14, .12, .03][f]; P.twist = [0, -.4, .3, .38, .06][f]; P.sway = [0, .4, -.5, -.5, -.1][f];
      P.legL = [0, -.1, .4, .36, .08][f]; P.legR = -P.legL * .6; P.bob = [0, .2, -.6, -.5, -.1][f]; P.thrown = f === 2 || f === 3;
    } else if (weapon === 'dagger'){
      // one-handed knife slash: draw the blade up and back over the shoulder, cut down and across the body with the hips,
      // let it follow through low, then recover; the free hand guards in front, then swings back for balance
      P.armR = [.5, 1.5, 1.35, .7, .4][f]; P.elbR = [.8, 1.6, .05, .15, .55][f]; P.outR = [.2, .95, -.35, -.5, .08][f]; P.wpn = [1.7, .9, 1.7, 2.1, 1.7][f];
      P.armL = [.3, .75, -.25, -.35, .15][f]; P.elbL = [.5, 1.3, .55, .45, .4][f]; P.outL = [.2, .1, .35, .4, .2][f];
      P.lean = [0, -.08, .2, .16, .03][f]; P.twist = [0, -.45, .38, .5, .08][f]; P.sway = [0, .5, -.6, -.7, -.1][f];
      P.legL = [0, -.12, .52, .46, .1][f]; P.legR = -P.legL * .6; P.bob = [0, .25, -.85, -.65, -.1][f];
    } else {
      P.armR = [.6, 2.6, 2.2, .9, .3][f]; P.elbR = [.4, .9, .2, .1, .4][f]; P.wpn = [1.7, 1.3, 1.1, .8, 1.5][f]; P.outR = [.2, .3, .25, .1, .2][f];
      P.lean = [0, -.1, .12, .2, .04][f]; P.twist = [0, -.35, .1, .32, .08][f]; P.legL = [0, -.15, .38, .52, .1][f]; P.legR = -P.legL * .7; P.bob = [0, .3, 0, -1, -.2][f];
      P.armL = [.2, .5, .3, -.2, .1][f]; P.elbL = [.3, .9, .6, .3, .3][f]; P.sway = [0, .4, -.2, -.6, -.2][f];
    }
  } else if (act === 'skill'){
    P.aura = f; P.sparks = f;
    P.armR = [-.2, 1.1, 1.65, 1.6, .5][f]; P.elbR = [.4, 1.8, .05, .05, .4][f]; P.outR = [.5, .1, .05, .05, .2][f];
    P.armL = [-.2, 1.0, -.35, -.3, .1][f]; P.elbL = [.4, 1.8, .4, .4, .3][f]; P.outL = [.5, .15, .35, .35, .2][f];
    P.legL = [.1, .1, .45, .45, .1][f]; P.legR = [-.1, -.1, -.38, -.38, -.1][f]; P.bob = [-1.2, -1, -1.4, -1.3, -.3][f];
    P.lean = [-.05, .02, .16, .14, .02][f]; P.twist = [0, -.2, .25, .22, 0][f]; P.sway = [0, .6, -.8, -.6, 0][f]; P.mouth = f === 2 || f === 3 ? 1 : 0; P.wpn = 1.9;
  } else if (act === 'cast'){
    P.armL = 1.25 + Math.sin(ph) * .08; P.armR = 1.35 + Math.sin(ph) * .08; P.elbL = P.elbR = .35; P.outL = .32; P.outR = .2; P.wpn = 2.3; P.glow = f; P.ring = f;
    P.bob = Math.sin(ph) * .4 - .2; P.mouth = 1; P.sway = Math.sin(ph) * .5;
  } else if (act === 'roll'){
    const rot = [0, 1.25, 2.6, 3.95, 5.3, 0][f];
    P.tuck = f > 0 && f < 5 ? 1 : 0; P.roll = rot; P.noWeapon = P.tuck === 1;
    if (f === 0){ P.bob = -3; P.lean = .45; P.legL = .5; P.legR = .2; P.armL = P.armR = .9; P.elbL = P.elbR = .8; P.head = .1; }
    if (f === 5){ P.bob = -2; P.lean = .3; P.legL = .45; P.legR = -.25; P.armL = .6; P.armR = .3; P.outL = .5; P.elbL = .8; }
    if (P.tuck){ P.bob = -2; P.armL = P.armR = 1.4; P.elbL = P.elbR = 1.4; P.outL = P.outR = .25; P.eyes = 'closed'; }
  } else if (act === 'capture'){
    P.noWeapon = true;
    const spin = [0, 1.6, 3.2][Math.min(f, 2)];
    if (f <= 2){ P.armR = 2.45; P.elbR = .35; P.outR = .95; P.armL = .5; P.elbL = .6; P.outL = .3; P.lasso = {mode:'spin', a:spin + f * .4}; P.lean = -.05; P.twist = [-.1, .05, -.08][f]; P.legL = .25; P.legR = -.2; P.sway = Math.sin(f * 2) * .5; }
    else if (f === 3){ P.armR = 1.55; P.elbR = .05; P.outR = .05; P.armL = -.3; P.outL = .4; P.lean = .16; P.twist = .3; P.legL = .5; P.legR = -.35; P.bob = -.8; P.lasso = {mode:'throw', k:.55}; }
    else if (f === 4){ P.armR = 1.3; P.elbR = .2; P.outR = .05; P.armL = -.2; P.lean = .1; P.twist = .2; P.legL = .45; P.legR = -.3; P.bob = -.6; P.lasso = {mode:'land'}; }
    else { P.armR = .9; P.elbR = 1.3; P.armL = 1.1; P.elbL = 1.2; P.outL = .05; P.lean = -.18; P.twist = -.1; P.legL = .55; P.legR = -.15; P.bob = -1.2; P.lasso = {mode:'pull'}; P.mouth = 1; }
  } else if (act === 'rideIdle' || act === 'ride'){
    const moving = act === 'ride', s = Math.sin(ph), c = Math.cos(ph);
    const mb = moving ? Math.abs(c) * 1.4 - .7 : Math.sin(ph) * .25;
    P.ride = {ph, moving, bob:mb};
    P.bob = 18.2 + (moving ? Math.abs(Math.cos(ph - .5)) * 1.2 - .6 : Math.sin(ph - .4) * .25);
    P.armL = P.armR = 1.0 + (moving ? c * .06 : 0); P.elbL = P.elbR = .75; P.outL = P.outR = .12; P.lean = moving ? .12 : .02;
    P.sway = moving ? Math.sin(ph - 1) * .9 : Math.sin(ph) * .3; P.wpn = 2.3; P.head = moving ? -.03 : 0;
    if (!moving && f === 3) P.eyes = 'closed';
    void s;
  } else if (act === 'hurt'){
    P.lean = [-.25, -.15][f]; P.armL = [.6, .35][f]; P.armR = [.7, .4][f]; P.outL = P.outR = .5; P.elbL = P.elbR = .7; P.eyes = 'hurt'; P.bob = [.5, 0][f]; P.legL = .15; P.legR = -.1; P.head = [-.12, -.06][f]; P.sway = [.8, .4][f];
  } else if (act === 'die'){
    P.eyes = 'closed';
    if (f === 0){ P.lean = -.3; P.armL = P.armR = .7; P.outL = P.outR = .5; P.eyes = 'hurt'; }
    if (f === 1){ P.kneel = 1; P.bob = -4.5; P.lean = .25; P.armL = P.armR = .2; }
    if (f === 2){ P.kneel = 1; P.bob = -4.5; P.fall = -.8; P.armL = P.armR = 1.2; P.outL = P.outR = .6; }
    if (f === 3){ P.fall = -1.5; P.armL = P.armR = 2.4; P.outL = P.outR = .5; P.legL = .1; P.legR = -.1; }
  } else if (SK_POSE[act]){
    SK_POSE[act](P, f, n, weapon, ph);
  } else if (act === 'sit'){
    // พับเพียบ — legs folded to one side, hands resting in the lap, slow breathing
    const b = Math.sin(ph);
    P.sit = 'phap'; P.bob = -6.3 + b * .2; P.breath = b * .2; P.armL = .55; P.armR = .6; P.elbL = 1.15; P.elbR = 1.05; P.outL = .05; P.outR = .02;
    P.lean = .04; P.twist = .12; P.head = .03 + b * .01; P.hipX = .6; P.sway = Math.sin(ph - 1) * .3; P.eyes = f === 3 ? 'closed' : 'open';
  }
  return P;
}

/* ช้างศึก: the Warlord's war elephant with a gold-and-lacquer saddle cloth, tusks and a swinging trunk */
function drawElephant(cx, R){
  const ph = R.ph, mv = R.moving, B = R.bob, K = 1.32;
  const E = (c, rx, ry, m, o = {}) => ell(cx, mul(c, K), rx * K, ry * K, m, o.rz ? {...o, rz:o.rz * K} : o);
  const C = (a, b, r0, r1, m, o = {}) => cap(cx, mul(a, K), mul(b, K), r0 * K, r1 * K, m, o);
  let gid = 200; const G = () => (cx.gid = gid++);
  const skin = n => (Math.sin(n[0] * 17 + n[1] * 5) > .86 ? {dt:1} : undefined);
  for (const [s, z, off] of [[-1, 6.5, 0], [1, 6.5, Math.PI], [-1, -6.5, Math.PI], [1, -6.5, 0]]){
    G(); const sw = mv ? Math.sin(ph + off) * .32 : 0, lift = mv ? Math.max(0, Math.cos(ph + off)) * 1.4 : 0;
    const top = [s * 4, 12 + B, z], foot = add(top, rotX([0, -11.6 + lift, 0], -sw));
    C(top, foot, 3.4, 3.0, M.elephant, {tex:(n, lo, q, t) => (t > .9 ? {m:M.cloth, t:1} : undefined)});
  }
  G(); E([0, 15.5 + B, -1], 9.4, 8.2, M.elephant, {tex:skin});
  G(); E([0, 21.8 + B, -1], 8.4, 3.2, M.red, {rz:2.8, tex:n => (Math.abs(n[0]) > .78 || Math.abs(n[2]) > .82 ? {m:M.gold} : Math.sin(n[0] * 12) * Math.sin(n[2] * 12) > .6 ? {m:M.gold, t:2} : undefined)});
  for (const s of [-1, 1]){ G(); E([s * 8.6, 16.5 + B, -1], 1.2, 6, M.red, {tex:(n, lo) => (lo[1] < -4 * K ? {m:M.gold} : undefined)}); }
  const hb = mv ? Math.sin(ph * 2) * .5 : Math.sin(ph) * .25, hd = [0, 20 + B + hb, 10];
  G(); E(hd, 6.4, 6.6, M.elephant, {tex:n => {
    if (n[2] < 0) return skin(n);
    for (const sx of [-1, 1]){ const ex = n[0] - sx * .55, ey = n[1] - .18; if ((ex / .12) ** 2 + (ey / .16) ** 2 < 1) return {m:M.slimeE, t:ey > .04 ? 0 : 1}; }
    if (n[1] > .55) return {m:M.gold};
  }});
  for (const s of [-1, 1]){ G(); E(add(hd, [s * 6.8, .5, -2.4]), 1.4, 5.6, M.elephant, {rz:4.4, tex:n => (n[2] * s > .3 ? {m:M.furPink, t:2} : undefined)}); }
  // trunk: a curling chain that sways
  G(); let p0 = add(hd, [0, -1.5, 4.8]);
  for (let i = 1; i <= 7; i++){ const k = i / 7, p1 = add(add(hd, [Math.sin(ph + k * 2) * (mv ? 1.4 : .6) * k, -1.5 - k * 9 + k * k * 4, 5.2 + k * 2.4 + k * k * 1.6]), [0, 0, 0]); C(p0, p1, 2.2 - k * 1.1, 2.1 - k * 1.1, M.elephant, {tex:(n, lo, q, t) => (Math.sin((k + t / 7) * 40) > .5 ? {dt:1} : undefined)}); p0 = p1; }
  for (const s of [-1, 1]){ G(); C(add(hd, [s * 2.4, -3.4, 4.4]), add(hd, [s * 3, -7.5, 9]), .9, .4, M.tusk, {}); }
  G(); E(add(hd, [0, 6.2, -1]), 2.2, 1.4, M.gold);
  return mul(add(hd, [0, 2, 4]), K);
}
function drawMount(cx, R){
  if (R.elephant) return drawElephant(cx, R);
  const ph = R.ph, mv = R.moving, B = R.bob, K = 1.32;
  const E = (c, rx, ry, m, o = {}) => ell(cx, mul(c, K), rx * K, ry * K, m, o.rz ? {...o, rz:o.rz * K} : o);
  const C = (a, b, r0, r1, m, o = {}) => cap(cx, mul(a, K), mul(b, K), r0 * K, r1 * K, m, o);
  let gid = 200; const G = () => (cx.gid = gid++);
  const legs = [[-1, 6.5, 0], [1, 6.5, Math.PI], [-1, -7, Math.PI], [1, -7, 0]];
  for (const [s, z, off] of legs){
    G();
    const sw = mv ? Math.sin(ph + off) * .55 : 0, lift = mv ? Math.max(0, Math.cos(ph + off)) * 2.2 : 0;
    const top = [s * 2.8, 13.5 + B, z];
    const knee = add(top, rotX([0, -6.4, 0], -(sw * 1.1 + (z < 0 ? -.25 : .1))));
    const hoof = add(knee, rotX([0, -6.6, 0], -(sw * .5 + (z < 0 ? .35 : -.05) - lift * .12)));
    hoof[1] = Math.max(hoof[1], .4 + lift * .5);
    C(top, knee, 2.2, 1.4, M.deer); C(knee, hoof, 1.3, 1.0, M.deer);
    G(); E(add(hoof, [0, .2, .3]), 1.4, 1.1, M.lanternWood);
  }
  const coat = n => (n[1] < -.45 ? {m:M.cream} : Math.sin(n[0] * 13 + 1) * Math.sin(n[2] * 11) > .72 && n[1] > -.2 ? {m:M.cream, t:1} : undefined);
  G(); E([0, 15.6 + B, -6.6], 6.1, 5.8, M.deer, {tex:coat});
  G(); E([0, 15.2 + B, 0], 6.7, 6.0, M.deer, {tex:coat});
  G(); E([0, 15.4 + B, 6.2], 6.3, 6.1, M.deer, {tex:coat});
  G(); E([0, 17.6 + B, -12.4], 1.9, 2.3, M.cream);
  G(); E([0, 20.3 + B, -.8], 6.9, 2.6, M.red, {rz:2.4, tex:n => (Math.abs(n[0]) > .8 || Math.abs(n[2]) > .8 ? {m:M.gold} : undefined)});
  for (const s of [-1, 1]){ G(); E([s * 6.4, 16 + B, -.8], 1.2, 4.2, M.red, {tex:(n, lo) => (lo[1] < -3 * K ? {m:M.gold} : undefined)}); }
  const hb = mv ? Math.sin(ph * 2) * .6 : Math.sin(ph) * .3;
  G(); C([0, 18.5 + B, 8.5], [0, 25.5 + B + hb, 11.2], 3.5, 2.8, M.deer);
  const hd = [0, 27.6 + B + hb, 12.6];
  G(); E(hd, 4.1, 3.9, M.deer, {tex:n => {
    if (n[2] < -.1) return;
    for (const sx of [-1, 1]){ const ex = n[0] - sx * .62, ey = n[1] - .12; if ((ex / .13) ** 2 + (ey / .2) ** 2 < 1) return {m:M.slimeE, t:ey > .05 ? 0 : 1}; }
  }});
  G(); C(add(hd, [0, -.6, 1.6]), add(hd, [0, -1.8, 5]), 2.4, 1.6, M.deer, {tex:(n, lo, q, t) => (t > .85 && n[2] > .4 ? {m:M.lanternWood} : undefined)});
  for (const s of [-1, 1]){ G(); C(add(hd, [s * 2.6, 2.4, -1]), add(hd, [s * 5.6, 3.6, -2]), 1.2, .6, M.deer);
    G(); const a0 = add(hd, [s * 1.5, 3.4, -.6]), a1 = add(hd, [s * 3.8, 9.5, -2.2]);
    C(a0, a1, .7, .45, M.antler); C(lerp3(a0, a1, .45), add(hd, [s * 6.2, 6.8, -1.2]), .5, .38, M.antler); C(lerp3(a0, a1, .8), add(hd, [s * 2.2, 11.4, -3.8]), .45, .32, M.antler); }
  return mul(add(hd, [0, -1.6, 4.2]), K);
}
function drawHuman(cx, cfg, P){
  const B = P.bob, sitK = P.sit, ride = P.ride;
  const hipY = 9.5 + B, fwdLean = P.lean, tw = P.twist || 0;
  let mouth = null;
  if (ride){ ride.elephant = cfg.mount === 'elephant'; mouth = drawMount(cx, ride); }
  if (P.fall){ const a = P.fall; cx.pre = p => { const q = rotX(p, a); return [q[0], Math.max(q[1], .6), q[2]]; }; }
  if (P.spin && !P.fall && !P.roll){ const a = P.spin, hx = P.hipX || 0; cx.pre = p => { const q = rotY([p[0] - hx, p[1], p[2]], a); return [q[0] + hx, q[1], q[2]]; }; }
  if (P.roll){ const a = P.roll, py = 8; cx.pre = p => { const q = rotX([p[0], p[1] - py, p[2]], a); return [q[0], Math.max(q[1] + py, .3), q[2]]; }; }
  const hipC = [P.hipX || 0, hipY, 0];
  const upper = v => rotY(rotX(v, fwdLean), tw);
  const lean = p => { const v = upper([p[0] - hipC[0], p[1] - hipY, p[2]]); return [v[0] + hipC[0], v[1] + hipY, v[2]]; };
  let gid = 1; const G = () => (cx.gid = gid++);
  const pm = M[cfg.pants], bm = M[cfg.boots];
  const limb = (hip, knee, foot, toeOff) => {
    const bg = cfg.baggy ? .7 : 0;
    G(); cap(cx, hip, knee, 2.5 + bg, 2.3 + bg, pm, {});
    if (cfg.sandals) cap(cx, knee, foot, 2.3 + bg, 1.9, M[cfg.skinM || 'skin'], {tex:(n, lo, q, t) => (t < .38 ? {m:pm} : t > .72 && t < .86 ? {m:M[cfg.sandals]} : undefined)});
    else cap(cx, knee, foot, 2.3, 2.2, bm, {tex:(n, lo, q, t) => (t < .35 && cfg.bootCuff ? {m:M[cfg.bootCuff]} : undefined)});
    G(); const toe = add(foot, toeOff); ell(cx, [toe[0], toe[1] + .3, toe[2]], 2.5, 1.9, bm);
  };
  const legLen = 8.4;
  for (const side of [-1, 1]){
    const sw = side < 0 ? P.legR : P.legL, lift = side < 0 ? P.liftR : P.liftL;
    const hip = [hipC[0] + side * 2.5, hipY, 0];
    if (ride){ limb(hip, [side * 8.2, hipY - 3.2, 2.6], [side * 8.4, hipY - 9.4, 1.2], [0, 0, 1.6]); G(); dot(cx, [side * 8.6, hipY - 9.6, 1.4], M.gold, 1); continue; }
    if (P.tuck){ const k = upper([side * 2.4, 2.2, 5.2]), ft = upper([side * 2.2, -3.4, 2.4]); limb(hip, add(hipC, k), add(hipC, ft), upper([0, 0, 1.4])); continue; }
    if (sitK === 'phap'){ // both shins tucked to the character's right side
      const knee = [side * 2.2 + 1.2, 1.6, 4.6], foot = [-6.8 + side * .6, 1.2, -1.2 + side * 2.2];
      limb(hip, knee, foot, [-1.4, 0, 0]); continue;
    }
    if (P.kneel){ limb(hip, [side * 2.8, 1.6, 3.8], [side * 2.6, 1.4, -3.2], [0, 0, -1.3]); continue; }
    const foot = add(hip, rotX([0, -legLen, 0], -sw)); foot[1] = Math.max(foot[1] + lift, .2 + lift);
    const knee = add(lerp3(hip, foot, .5), [0, 0, .35 + lift * .45]);
    limb(hip, knee, foot, [0, 0, 1.7]);
  }
  // skirt / robe
  if (cfg.skirt && !P.tuck){ G(); const s = cfg.skirt;
    const top = s[0] + B, bot = sitK ? Math.max(.4, s[1] + B * .4) : ride ? Math.max(hipY - 8.5, s[1] + B) : Math.max(.4, s[1] + B * .25 + (P.kneel ? 3 : 0));
    frustum(cx, lean([hipC[0], 0, 0]), top, bot, s[2], s[3] + (sitK ? 2 : ride ? 1.5 : 0), M[s[4]], {tex:(n, k) => (k > .86 && s[5] ? {m:M[s[5]]} : cfg.skirtStripes && Math.sin(k * 26) > .55 ? {dt:1} : undefined)}); }
  // cape (secondary motion)
  if (cfg.cape){ G(); for (let i = 0; i <= 10; i++){ const k = i / 10, sw = P.sway * k * k * 2.2; ell(cx, lean([sw * .4, 18.5 + B - k * 11 * (P.tuck ? .6 : 1), -4.6 - k * 2.2 - Math.abs(sw) * .6 - (ride ? k * 3 : 0)]), 5.6 + k * 2.2, 2.4, M[cfg.cape], {rz:1.5, tex:cfg.capeTex === 'tiger' ? (n => (Math.sin(n[0] * 9 + k * 7) > .55 ? {m:M.hairBlack, t:2} : undefined)) : cfg.capeTex === 'gold' && i === 10 ? (() => ({m:M.gold})) : undefined}); } }
  if (cfg.quiver){ G(); cap(cx, lean([-3.5, 23 + B, -5.2]), lean([2.8, 12.5 + B, -5.2]), 1.9, 1.9, M.leather, {}); G();
    for (let i = 0; i < 3; i++) line(cx, lean([-3.8 + i * 1.1, 23 + B, -5.2]), lean([-4.6 + i * 1.1, 26.5 + B, -5.4]), M.feather, {t:i === 1 ? 0 : 1}); }
  // torso (breathing)
  G();
  ell(cx, lean([hipC[0], 14.6 + B, 0]), 6.1 * (cfg.slim || 1), 6.4 + (P.breath || 0), M[cfg.top], {tex:(n) => (cfg.runeLines && n[1] > -.4 && n[1] < .7 && (Math.abs(Math.sin(n[0] * 9)) < .13 || Math.abs(n[1] - .18) < .05) ? {m:M.rune, t:1} : cfg.topTex ? cfg.topTex(n) : (n[1] < -.45 && n[1] > -.66 ? {m:M[cfg.belt || 'leather']} : undefined))});
  if (cfg.chest && !P.tuck){ G(); const cm = M[cfg.chest], tm = M[cfg.chestTrim || cfg.chest], tx = cfg.chestTex;
    ell(cx, lean([hipC[0], 15.2 + B, .9]), 6.5 * (cfg.slim || 1), 6.0 + (P.breath || 0), cm, {rz:6.2, tex:n => {
      if (n[1] < -.6) return false;
      if (n[1] > .74 || n[1] < -.46) return {m:tm, t:1};
      if (tx === 'scale'){ const row = Math.floor((n[1] + 1) * 6); if (Math.sin(n[0] * 14 + row * 1.6) > .55 && ((n[1] + 1) * 6) % 1 > .6) return {dt:1}; }
      else if (tx === 'weave'){ if (Math.sin(n[0] * 18) * Math.sin(n[1] * 18) > .35) return {dt:1}; }
      else if (tx === 'quilt'){ if (Math.abs(Math.sin(n[0] * 8 + n[1] * 8)) < .1 || Math.abs(Math.sin(n[0] * 8 - n[1] * 8)) < .1) return {dt:1}; }
      else if (tx === 'vest'){ if (Math.abs(n[0]) < .16 && n[2] > .5) return false; }
      return undefined; }}); }
  if (cfg.sashTail){ const sw0 = P.sway || 0;
    G(); ell(cx, lean([hipC[0] + 2.8, 11.4 + B, 5.4]), 2.1, 1.8, M[cfg.belt]);
    G(); cap(cx, lean([hipC[0] + 3.0, 10.8 + B, 5.8]), lean([hipC[0] + 3.5 + sw0 * .5, 5.6 + B * .8, 5.9 - Math.abs(sw0) * .3]), 1.0, 1.25, M[cfg.belt],
      {tex:(n, lo, q, t) => (t > .86 ? {m:M.gold, t:1} : Math.sin(t * 20) > .75 ? {m:M.gold, t:2} : undefined)}); }
  if (cfg.pauldron){ G(); ell(cx, lean([hipC[0] - 6.4, 19.6 + B, 0]), 3.4, 3.0, M[cfg.pauldron]); G(); ell(cx, lean([hipC[0] + 6.4, 19.6 + B, 0]), 3.4, 3.0, M[cfg.pauldron]); }
  // arms with elbows
  const arm = (side, pitch, out, elb) => {
    G();
    const sh = lean([hipC[0] + side * 6.0 * (cfg.slim || 1), 19.4 + B, 0]);
    const u = upper(rotX(rotZ([0, -4.1, 0], side * out), -pitch));
    const el = add(sh, u);
    const fa = upper(rotX(rotZ([0, -3.8, 0], side * out * .6), -(pitch + elb)));
    const hand = add(el, fa);
    cap(cx, sh, el, 2.3, 2.1, M[cfg.sleeve || cfg.top], cfg.armband ? {tex:(n, lo, q, t) => (t > .62 && t < .82 ? {m:M[cfg.armband]} : undefined)} : {});
    cap(cx, el, hand, 2.1, 1.9, M[cfg.forearm || cfg.skinM || 'skin'], cfg.wrap ? {tex:(n, lo, q, t) => (t > .42 && t < .9 ? {m:M[cfg.wrap]} : undefined)} : {});
    G(); ell(cx, hand, cfg.handWrap ? 2.4 : 2.2, cfg.handWrap ? 2.4 : 2.2, M[cfg.handWrap || cfg.skinM || 'skin'], cfg.handWrap ? {tex:n => (Math.sin(n[1] * 9 + n[0] * 3) > .5 ? {dt:1} : undefined)} : {});
    if (cfg.glove){ G(); ell(cx, add(hand, mul(nrm(fa), .4)), 3.5, 3.2, M[cfg.glove], {tex:n => (n[1] > .55 ? {dt:-1} : undefined)}); G(); cap(cx, add(hand, mul(nrm(fa), -1.6)), add(hand, mul(nrm(fa), -.6)), 2.4, 2.4, M[cfg.gloveCuff], {}); }
    if (cfg.fistClaw){
      // tiger-claw gauntlets (กรงเล็บคู่): a metal glove over the fist and forearm, Thai gold trim from tier 3,
      // and three curved claws out of the knuckles that hook like a tiger's, longer at higher tiers
      const d = nrm(fa), sd = nrm(Math.abs(d[1]) > .9 ? [1, 0, 0] : [-d[1], d[0], 0]), dn = [0, -1, 0], k0 = d[0] * dn[0] + d[1] * dn[1] + d[2] * dn[2];
      let curl = [dn[0] - d[0] * k0, dn[1] - d[1] * k0, dn[2] - d[2] * k0]; curl = Math.hypot(...curl) < .2 ? [0, 0, 1] : nrm(curl);
      const tier = cfg.clawTier || 0, L1 = 3.4 + tier * .45, L2 = 2.6 + tier * .35, trim = tier >= 3 ? 'gold' : 'steel';
      G(); cap(cx, add(hand, mul(d, -2.4)), hand, 2.25, 2.15, M.steel, {tex:(n, lo, q, t) => (t > .15 && t < .3 ? {m:M[trim]} : undefined)});
      G(); ell(cx, add(hand, mul(d, .3)), 2.7, 2.5, M.steel, {tex:n => (n[1] > .5 ? {m:M[trim]} : undefined)});
      for (const k of [-1, 0, 1]){ G(); const b0 = add(add(hand, mul(sd, k * .95)), mul(d, 1.6)), m0 = add(add(b0, mul(d, L1)), mul(sd, k * .25)), t0 = add(add(m0, mul(d, L2 * .55)), mul(curl, L2 * .8));
        cap(cx, b0, m0, .55, .32, M[cfg.fistClaw], {}); G(); cap(cx, m0, t0, .32, .12, M[cfg.fistClaw], {}); } }
    return {hand, dir:nrm(fa)};
  };
  // (v159) a two-handed weapon (greatsword, katana, longstaff) is gripped with both hands: the weapon hand keeps its pose
  // and the other hand reaches the hilt just below it (two-bone reach: shoulder → elbow → hand, elbow bent down and out)
  const armTo = (side, target) => {
    G();
    const sh = lean([hipC[0] + side * 6.0 * (cfg.slim || 1), 19.4 + B, 0]), l1 = 4.1, l2 = 3.8;
    let d = [target[0] - sh[0], target[1] - sh[1], target[2] - sh[2]], D = Math.hypot(...d) || 1; const u = [d[0] / D, d[1] / D, d[2] / D];
    // short chibi arms may stretch up to a quarter to reach the hilt; past that the hand stops short
    const st = Math.min(1.25, Math.max(1, D / (l1 + l2 - .05))), L1 = l1 * st, L2 = l2 * st;
    D = Math.min(D, L1 + L2 - .05); const hand = add(sh, mul(u, D));
    const a = (L1 * L1 - L2 * L2 + D * D) / (2 * D), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const hint = [side * .8, -1, -.2], k = hint[0] * u[0] + hint[1] * u[1] + hint[2] * u[2];
    let pp = [hint[0] - u[0] * k, hint[1] - u[1] * k, hint[2] - u[2] * k]; const pl = Math.hypot(...pp) || 1; pp = [pp[0] / pl, pp[1] / pl, pp[2] / pl];
    const el = add(add(sh, mul(u, a)), mul(pp, h));
    cap(cx, sh, el, 2.3, 2.1, M[cfg.sleeve || cfg.top], cfg.armband ? {tex:(n, lo, q, t) => (t > .62 && t < .82 ? {m:M[cfg.armband]} : undefined)} : {});
    cap(cx, el, hand, 2.1, 1.9, M[cfg.forearm || cfg.skinM || 'skin'], cfg.wrap ? {tex:(n, lo, q, t) => (t > .42 && t < .9 ? {m:M[cfg.wrap]} : undefined)} : {});
    G(); ell(cx, hand, cfg.handWrap ? 2.4 : 2.2, cfg.handWrap ? 2.4 : 2.2, M[cfg.handWrap || cfg.skinM || 'skin'], {});
    return {hand, dir:nrm([hand[0] - el[0], hand[1] - el[1], hand[2] - el[2]])};
  };
  const arm0 = (side, pitch, out, elb) => { const sh = lean([hipC[0] + side * 6.0 * (cfg.slim || 1), 19.4 + B, 0]), el = add(sh, upper(rotX(rotZ([0, -4.1, 0], side * out), -pitch)));
    return add(el, upper(rotX(rotZ([0, -3.8, 0], side * out * .6), -(pitch + elb)))); };
  const grip2 = !P.noWeapon && !ride && !cfg.sheathed && (cfg.twoHand || cfg.katana) && (cfg.weapon === 'sword' || cfg.weapon === 'staff' || cfg.weapon === 'dagger') && !(cfg.weapon === 'staff' && P.ring >= 0);
  let AR, AL;
  if (grip2){
    const wa = P.wLeft ? P.armL + P.elbL * .7 : P.armR + P.elbR * .7, wd = nrm(upper(rotX([0, -1, 0], -(wa + P.wpn - .1))));
    // the weapon hand keeps its pose but is drawn in toward the front of the body, so the other hand can close on the
    // hilt just below it: both hands on the grip, like a real two-handed hold
    const side = P.wLeft ? 1 : -1, posed = arm0(side, P.wLeft ? P.armL : P.armR, P.wLeft ? P.outL : P.outR, P.wLeft ? P.elbL : P.elbR);
    const front = lean([hipC[0] + side * 1.6, 15.2 + B, 4.2]), main = lerp3(posed, front, .5), off = add(main, mul(wd, -3.1));
    if (P.wLeft){ AL = armTo(1, main); AR = armTo(-1, off); } else { AR = armTo(-1, main); AL = armTo(1, off); }
  } else { AR = arm(-1, P.armR, P.outR, P.elbR); AL = arm(1, P.armL, P.outL, P.elbL); }
  const handR = AR.hand, handL = AL.hand;
  if (ride && mouth){ G(); line(cx, handR, mouth, M.gold, {t:1}); line(cx, handL, mouth, M.gold, {t:1}); }
  // head
  const hc = lean([hipC[0], 28.4 + B, .4 + P.head * 4]);
  const skinG = G();
  ell(cx, hc, 10.4, 10.4, M[cfg.skinM || 'skin'], {tex:n => faceTex(n, cfg, P)});
  if (cfg.beard){ G(); ell(cx, add(hc, [0, -6.5, 5.2]), 5.8, 4.6, M[cfg.beard], {tex:n => (n[2] < -.2 ? false : n[1] > .35 && Math.abs(n[0]) < .45 ? false : undefined)}); }
  const hairG0 = gid; G(); ell(cx, add(hc, [0, 1.0, -1.4]), 11.2, 11.2, M[cfg.hair], {tex:n => hairTex(n, cfg)});
  const sw = P.sway || 0;
  if (cfg.spikes && !['wizard', 'cap', 'mala', 'lomphok', 'hermit', 'ngob', 'helm', 'crown'].includes(cfg.hat)){
    // messy locks: tapered tufts around the crown and back (never over the face), each its own outline group
    const n = cfg.spikes, L = cfg.spikeLen || 4.5, c0 = add(hc, [0, 1.2, -1.4]);
    for (let i = 0; i < n; i++){
      const a = i * 2.399 + .5, y = .05 + .8 * ((i * .618) % 1), r = Math.sqrt(1 - y * y), d = nrm([Math.sin(a) * r, y, Math.cos(a) * r]);
      if (d[2] > .3 && d[1] < .8) continue;
      const len = L * (.75 + .5 * ((i * .37) % 1)), base = add(c0, mul(d, 9.6));
      const tip = add(base, add(mul(d, len * (1 - y * .35)), [sw * .35 * (1 - y), -len * .55 * (1 - y), 0]));
      G(); cap(cx, base, tip, 3.0, .45, M[cfg.hair], {tex:(nn, lo, q, t) => (t > .62 && nn[0] - nn[1] < -.3 ? {dt:-1} : undefined)});
    }
    // crown spikes: sharp anime tufts standing up and back from the top of the head
    if (cfg.crown) for (let i = 0; i < cfg.crown; i++){
      const a = (i / Math.max(1, cfg.crown - 1) - .5) * 2.6 + Math.PI, d = nrm([Math.sin(a) * .62, .78, Math.cos(a) * .62 + .12]);
      const len = L * (1.05 + .25 * ((i * .53) % 1)), base = add(c0, mul(d, 9.2)), tip = add(base, add(mul(d, len), [sw * .3, -len * .12, -len * .25]));
      G(); cap(cx, base, tip, 3.2, .4, M[cfg.hair], {tex:(nn, lo, q, t) => (t > .6 && nn[0] - nn[1] < -.3 ? {dt:-1} : undefined)});
    }
    if (cfg.bangs) for (let k = -2; k <= 2; k++){
      const x = k * 3.1 + (k === 0 ? .6 : 0), drop = 5.2 - Math.abs(k) * .5 + (k === 1 ? 1 : 0);
      G(); cap(cx, add(hc, [x * .9, 8.6, 6.8 - Math.abs(k) * .9]), add(hc, [x * 1.18 + sw * .2, 8.4 - drop, 10.2 - Math.abs(k) * 1.4]), 2.6, .5, M[cfg.hair], {});
    }
  }
  cx.head = {hc, skinG, hairG0, hairG1:gid, P, cfg, hatTop:['wizard', 'cap', 'mala', 'lomphok', 'hermit', 'ngob', 'helm', 'crown'].includes(cfg.hat)};
  if (cfg.backHair){ G(); for (let i = 0; i <= 6; i++){ const k = i / 6; ell(cx, add(hc, upper([sw * k * 1.4, -2 - k * (cfg.backLen || 9), -6.5 - k * 1.5 - Math.abs(sw) * k])), (cfg.backW || 8.6) - k * 2.4, 4.5, M[cfg.hair], {tex:n => (Math.sin(Math.atan2(n[0], -n[2]) * 9) > .6 ? {dt:1} : undefined)}); } }
  if (cfg.ponytail){ G(); for (let i = 0; i <= 8; i++){ const k = i / 8; ell(cx, add(hc, upper([sw * k * 3, 4 - k * 11 + Math.abs(sw) * k * 2, -10.5 - Math.sin(k * 2.5) * 3 - Math.abs(sw) * k * 2])), 3.4 - k * 1.4, 3.4 - k * 1.4, M[cfg.hair]); } }
  if (cfg.sideLocks){ const len = cfg.sideLocks; for (const sd of [-1, 1]){ G(); for (let i = 0; i <= 7; i++){ const k = i / 7;
      ell(cx, add(hc, upper([sd * (9.7 - k * .4) + sw * k * .8, 1.6 - k * len, 3 - k * 1.6])), 2.7 - k * 1, 2.7 - k * 1, M[cfg.hair], {tex:n => (Math.sin(n[1] * 8 + k * 5) > .6 ? {dt:1} : undefined)}); } } }
  if (cfg.hairpin){ G(); const pc = add(hc, upper([7.6, 7.4, 6.2])); for (let a = 0; a < 5; a++) ell(cx, add(pc, [Math.cos(a * 1.26) * 1.3, Math.sin(a * 1.26) * 1.3, .4]), 1.1, 1.1, M[cfg.hairpin]); G(); ell(cx, add(pc, [0, 0, .9]), .8, .8, M.gold); }
  if (cfg.ribbon){ const rc = M[cfg.ribbon], bp = add(hc, upper([0, 9.4, -7.6])); for (const sd of [-1, 1]){ G(); ell(cx, add(bp, [sd * 3.4, .6, -.4]), 3.4, 2.4, rc, {rz:1.6, tex:n => (Math.abs(n[0]) < .25 ? {dt:1} : undefined)}); G(); cap(cx, add(bp, [sd * .8, -.6, -.6]), add(bp, [sd * 2.4, -5.4, -1.4]), 1, .7, rc, {}); }
    G(); ell(cx, bp, 1.4, 1.4, M.gold); }
  if (cfg.twintail){ for (const sd of [-1, 1]){ G(); ell(cx, add(hc, upper([sd * 9.6, 6.2, -3.4])), 2.4, 2.4, M[cfg.belt === 'gold' ? 'gold' : 'scarlet']);
      G(); for (let i = 0; i <= 8; i++){ const k = i / 8; ell(cx, add(hc, upper([sd * (10.6 + k * 2.6) + sw * k * 2, 5 - k * 15 + Math.abs(sw) * k * 2, -4.6 - k * 2.4 - Math.abs(sw) * k])), 3.5 - k * 1.5, 3.5 - k * 1.5, M[cfg.hair], {tex:n => (Math.sin(Math.atan2(n[0], n[1]) * 5 + k * 6) > .55 ? {dt:1} : undefined)}); } } }
  if (cfg.bun){ G(); ell(cx, add(hc, upper([0, 7.5, -8])), 4.6, 4.6, M[cfg.hair], {tex:n => (Math.sin(Math.atan2(n[0], n[1]) * 6) > .5 ? {dt:1} : undefined)}); G(); line(cx, add(hc, upper([-4, 9, -9])), add(hc, upper([5, 10.5, -8])), M.gold, {t:1}); }
  // hats
  if (cfg.hat === 'wizard'){
    G(); frustum(cx, add(hc, [0, 0, -.8]), hc[1] + 7.2, hc[1] + 6.4, 12.6, 12.6, M.indigoD, {g:cx.gid});
    G(); const segs = 16;
    for (let i = 0; i <= segs; i++){ const k = i / segs, r = 8.8 * (1 - k) + .7, bend = k * k * 6.5;
      ell(cx, add(hc, [sw * k * k * 2.5, 7.5 + k * 17, -1 - bend - Math.abs(sw) * k * k * 1.5]), r, r * .9, k < .16 ? M.gold : M.indigo, {bias:.05}); }
    G(); ell(cx, add(hc, [sw * 2.5, 24.5, -7.6 - Math.abs(sw) * 1.5]), 1.6, 1.6, M.gold);
  } else if (cfg.hat === 'cap'){
    G(); ell(cx, add(hc, [0, 4.5, -.6]), 11.8, 9.4, M[cfg.capMat], {tex:n => (n[1] < .05 ? false : n[1] < .22 ? {m:M.leather} : undefined)});
    G(); for (let i = 0; i < 2; i++) cap(cx, add(hc, [5 + i, 9, -3]), add(hc, [10 + i * .5 + sw * 1.5, 19, -8 - Math.abs(sw)]), 1.1, .5, M.feather, {});
  } else if (cfg.hat === 'band'){
    G(); ell(cx, add(hc, [0, 2.2, -.5]), 11.9, 11.9, M[cfg.bandMat], {tex:n => (n[1] > .28 && n[1] < .5 ? (Math.abs(n[0]) < .14 && n[2] > .8 ? {m:M.gold} : undefined) : false)});
  } else if (cfg.hat === 'crest'){
    // modern circlet: a headband with a raised crest at the front (helm / chada items)
    G(); ell(cx, add(hc, [0, 2.2, -.5]), 11.9, 11.9, M[cfg.bandMat || 'steel'], {tex:n => (n[1] > .26 && n[1] < .5 ? undefined : false)});
    const cn = cfg.crestN || 3;
    for (let i = 0; i < cn; i++){ const o = i - (cn - 1) / 2, h = 6.5 - Math.abs(o) * 1.8;
      G(); cap(cx, add(hc, [o * 3.1, 6.6, 10.2 - Math.abs(o) * .8]), add(hc, [o * 4.2, 6.6 + h, 8.2 - Math.abs(o) * 1.2]), 1.25, .35, M[cfg.crestMat || 'gold'], {}); }
    if (cfg.crestGem){ G(); ell(cx, add(hc, [0, 7.2, 11.2]), 1.5, 1.5, M.gem); }
  } else if (cfg.hat === 'mongkhon'){
    // มงคล: a twisted cord ring round the head with two tails falling behind
    G(); for (let a = 0; a < Math.PI * 2; a += .2){ const p = add(hc, [Math.sin(a) * 11.2, 3.2 + Math.cos(a * 2) * .3, Math.cos(a) * 11.2 - .6]); ell(cx, p, 1.5, 1.4, M[cfg.bandMat || 'cloth'], {tex:() => (Math.sin(a * 9) > .3 ? {dt:1} : undefined)}); }
    G(); for (const sd of [-1, 1]) cap(cx, add(hc, [sd * 2, 3, -11]), add(hc, [sd * 3.2 + sw * 1.5, -6, -14 - Math.abs(sw)]), 1.2, .7, M[cfg.bandMat || 'cloth'], {});
  } else if (cfg.hat === 'headwrap'){
    G(); ell(cx, add(hc, [0, 5.2, -1]), 11.9, 7.8, M[cfg.bandMat || 'cloth'], {tex:n => (n[1] < -.15 ? false : Math.sin(n[0] * 7 + n[1] * 9) > .6 ? {dt:1} : undefined)});
    G(); ell(cx, add(hc, [5.5, 8.5, 7]), 2.8, 2.4, M[cfg.bandMat || 'cloth']);
  } else if (cfg.hat === 'ngob'){
    // งอบ: the wide palm-leaf farmer's hat
    G(); frustum(cx, add(hc, [0, 0, -.5]), hc[1] + 15, hc[1] + 6.6, 3, 17.5, M.straw, {tex:(n, k) => (Math.sin(Math.atan2(n[0], n[2]) * 14) > .7 ? {dt:1} : k > .92 ? {m:M.wood} : undefined)});
    G(); ell(cx, add(hc, [0, 15.6, -.5]), 2, 1.6, M.wood);
  } else if (cfg.hat === 'lomphok' || cfg.hat === 'hermit'){
    // ลอมพอก: tall cone hat of Ayutthaya envoys and astrologers (tiger-striped for the hermit)
    const mtl = cfg.hat === 'hermit' ? M.tigerFur : M[cfg.hatMat || 'cloth'];
    G(); const segs = 14;
    for (let i = 0; i <= segs; i++){ const k = i / segs, r = 10.6 * (1 - k * .88), bend = k * k * 2.2;
      ell(cx, add(hc, [sw * k * .8, 5.5 + k * 22, -1 - bend]), r, r * .92, k < .12 ? M.gold : mtl, {bias:.05, tex:cfg.hat === 'hermit' ? (n => (Math.sin(Math.atan2(n[0], n[2]) * 5 + k * 9) > .55 ? {m:M.hairBlack, t:2} : undefined)) : (k > .5 && k < .56 ? (() => ({m:M.gold})) : undefined)}); }
    G(); ell(cx, add(hc, [sw * .8, 28.5, -3.2]), 1.5, 2.2, M.gold);
  } else if (cfg.hat === 'mala'){
    // มาลา: rounded war helmet with a spire and a lacquer-red brim
    G(); ell(cx, add(hc, [0, 3.4, -.8]), 12, 10.8, M.gold, {tex:n => (n[1] < .02 ? false : n[1] < .2 ? {m:M.lacquer} : Math.abs(n[0]) < .08 && n[2] > .6 ? {dt:-1} : undefined)});
    G(); cap(cx, add(hc, [0, 13, -1.2]), add(hc, [sw * .6, 21, -2.4]), 2.2, .5, M.gold, {});
    G(); for (const sd of [-1, 1]) cap(cx, add(hc, [sd * 11, 1, 1]), add(hc, [sd * 12.5, -5, 2]), 1.6, 1.0, M.gold, {});
  } else if (cfg.hat === 'leaf'){
    G(); cap(cx, add(hc, [-1, 11, 0]), add(hc, [-3 + sw, 16, 1]), .9, .6, M.wood, {});
    G(); ell(cx, add(hc, [-5 + sw * 1.4, 16.5, 1]), 3.2, 1.8, M.green, {});
  }
  // v29 wardrobe headpieces: halo, flower wreath, antlers, kirin horn, knight helm, phoenix plumes, beast ears, royal crown, dragon horns
  { const hm = M[cfg.hatMat || 'gold'], cm = M[cfg.crestMat || 'gold'];
    if (cfg.hat === 'halo'){
      G(); for (let a = 0; a < Math.PI * 2; a += .14) ell(cx, add(hc, [Math.sin(a) * 8.4, 17.6 + sw * .4, Math.cos(a) * 8.4 - 1.6]), 1.15, 1.15, hm, {et:0});
      if (cfg.crestN){ G(); ell(cx, add(hc, [0, 2.2, -.5]), 11.9, 11.9, cm, {tex:n => (n[1] > .3 && n[1] < .46 ? undefined : false)}); }
    } else if (cfg.hat === 'wreath'){
      G(); for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2, p = add(hc, [Math.sin(a) * 11, 5.6 + Math.sin(a * 3) * .5, Math.cos(a) * 11 - .8]);
        ell(cx, p, 2.3, 2.1, i % 2 ? cm : hm, {tex:n => (Math.hypot(n[0], n[1]) < .3 && n[2] > .5 ? {m:M.sun} : undefined)}); }
      if (cfg.crestGem){ G(); for (const sd of [-1, 1]) ell(cx, add(hc, [sd * 6, 8.4, 8.6]), 2.6, 2.2, cm); }
    } else if (cfg.hat === 'antlers'){
      for (const sd of [-1, 1]){ const b = add(hc, [sd * 5.2, 8.6, -1.2]), m1 = add(hc, [sd * 9 + sw, 17, -3]), t1 = add(hc, [sd * 13 + sw * 1.4, 24, -5]);
        G(); cap(cx, b, m1, 1.5, 1.05, hm, {}); G(); cap(cx, m1, t1, 1.05, .35, hm, {});
        G(); cap(cx, add(hc, [sd * 7.6, 14, -2.4]), add(hc, [sd * 4 + sw, 21, -1]), .9, .3, hm, {}); G(); cap(cx, m1, add(hc, [sd * 15 + sw, 18, -2]), .85, .3, hm, {});
        G(); cap(cx, add(hc, [sd * 11.4, 21, -4.2]), add(hc, [sd * 9.6 + sw, 27, -4]), .7, .25, hm, {});
        if (cfg.crestGem){ G(); ell(cx, add(hc, [sd * 9, 17, -3]), 1.2, 1.2, cm, {et:0}); } }
    } else if (cfg.hat === 'kirin'){
      G(); let p0 = add(hc, [0, 8.8, 7.4]);
      for (let i = 1; i <= 10; i++){ const k = i / 10, p1 = add(hc, [sw * k * .5, 8.8 + k * 13 * (cfg.hatTall || 1), 7.4 + k * 3 - k * k * 2]);
        cap(cx, p0, p1, 2.1 * (1 - (k - .1) * .85), 2.1 * (1 - k * .88), i % 2 ? hm : cm, {}); p0 = p1; }
      if (cfg.crestN){ G(); ell(cx, add(hc, [0, 2.2, -.5]), 11.9, 11.9, cm, {tex:n => (n[1] > .3 && n[1] < .46 ? undefined : false)}); }
    } else if (cfg.hat === 'helm'){
      G(); ell(cx, add(hc, [0, 3, -.6]), 12.4, 11.4, hm, {tex:n => (n[1] < -.42 ? false : n[2] > .5 && n[1] < .38 && n[1] > -.42 ? false : Math.abs(n[0]) < .07 && n[1] > .2 ? {m:cm} : n[1] < -.2 ? {m:cm} : undefined)});
      G(); for (let i = 0; i <= 9; i++){ const k = i / 9; ell(cx, add(hc, [sw * k * 2, 14 + Math.sin(k * 2.6) * 4, -2 - k * 13 - Math.abs(sw) * k * 2]), 2.6 - k * .9, 2.6 - k * .9, M[cfg.plume || 'scarlet'], {}); }
      for (const sd of [-1, 1]){ G(); cap(cx, add(hc, [sd * 11.6, 5, -1]), add(hc, [sd * 15.4, 12, -5]), 1.4, .3, cm, {}); }
    } else if (cfg.hat === 'plumes'){
      G(); ell(cx, add(hc, [0, 2.2, -.5]), 11.9, 11.9, cm, {tex:n => (n[1] > .26 && n[1] < .5 ? undefined : false)});
      const n = cfg.crestN || 5;
      for (let i = 0; i < n; i++){ const o = i - (n - 1) / 2; G(); let p0 = add(hc, [o * 2.6, 9, 7 - Math.abs(o) * .9]);
        for (let j = 1; j <= 8; j++){ const k = j / 8, p1 = add(hc, [o * (2.6 + k * 2.8) + sw * k, 9 + k * (14 - Math.abs(o) * 2), 7 - Math.abs(o) * .9 - k * 9 - k * k * 6]);
          cap(cx, p0, p1, 1.5 - k * .6, 1.5 - k * .9, k > .7 ? cm : hm, {}); p0 = p1; } }
      G(); ell(cx, add(hc, [0, 7.6, 11]), 1.7, 1.7, M.gem);
    } else if (cfg.hat === 'ears'){
      for (const sd of [-1, 1]){ G(); cap(cx, add(hc, [sd * 6.4, 8.6, -.6]), add(hc, [sd * (9.4 + (cfg.hornSpread || 0)) + sw * .4, 18.5 + (cfg.hornLen || 0), -1.8]), 3.3, .4, hm, {tex:n => (n[2] > .35 && Math.abs(n[0]) < .5 ? {m:cm} : undefined)}); }
      if (cfg.crestGem){ G(); ell(cx, add(hc, [0, 7.2, 10.6]), 1.5, 1.5, M.gem); }
    } else if (cfg.hat === 'crown'){
      G(); frustum(cx, add(hc, [0, 0, -1]), hc[1] + 12.4, hc[1] + 7.6, 8.8, 9.6, hm, {tex:(n, k) => (k > .8 ? {m:cm} : Math.sin(Math.atan2(n[0], n[2]) * 8) > .9 ? {m:M.gem} : undefined)});
      const pts = cfg.crestN || 8;
      for (let i = 0; i < pts; i++){ const a = i / pts * Math.PI * 2, r = 8.6; G(); cap(cx, add(hc, [Math.sin(a) * r, 12.2, Math.cos(a) * r - 1]), add(hc, [Math.sin(a) * (r + .6), 16.6, Math.cos(a) * (r + .6) - 1]), 1.3, .35, hm, {});
        G(); ell(cx, add(hc, [Math.sin(a) * (r + .6), 17, Math.cos(a) * (r + .6) - 1]), .9, .9, i % 2 ? M.gem : cm); }
      G(); ell(cx, add(hc, [0, 10, 8.4]), 1.8, 1.8, M.gem);
    } else if (cfg.hat === 'dragon'){
      for (const sd of [-1, 1]){ G(); let p0 = add(hc, [sd * 5.4, 8, 2]);
        for (let j = 1; j <= 9; j++){ const k = j / 9, p1 = add(hc, [sd * (5.4 + k * 6) + sw * k, 8 + Math.sin(k * 2.2) * 9, 2 - k * 13]); cap(cx, p0, p1, 1.9 - k * 1.2, 1.9 - k * 1.5, j > 6 ? cm : hm, {}); p0 = p1; } }
      for (let i = 0; i < 4; i++){ G(); cap(cx, add(hc, [0, 10 - i * 1.5, -6 - i * 2.4]), add(hc, [sw * .3, 14.5 - i * 1.8, -8.5 - i * 2.6]), 1.2, .3, cm, {}); }
    }
  }
  if (cfg.krabenTail && !ride && !sitK){ G(); cap(cx, lean([hipC[0], 10.2 + B, -5.6]), lean([hipC[0] + (P.sway || 0) * .4, 5.8 + B, -6.6]), 1.8, 1.2, M[cfg.pants], {}); }
  // v56 cute head pieces (head slot since v57, they replace the hat): animal ears on a thin headband, a big hair bow, star or flower clips
  if (cfg.earKind){ const em = M[cfg.earMat || 'white'], ei = M[cfg.earIn || 'sakura'], k = cfg.earKind, inner = n => (n[2] > .3 && Math.abs(n[0]) < .55 ? {m:ei} : undefined);
    if (k === 'cat' || k === 'fox'){ for (const sd of [-1, 1]){ G(); cap(cx, add(hc, [sd * 6.4, 10, -.6]), add(hc, [sd * (k === 'fox' ? 9.8 : 8.6) + sw * .4, k === 'fox' ? 19.2 : 17.2, -1.4]), k === 'fox' ? 3.3 : 3.6, .35, em, {tex:inner}); } }
    else if (k === 'bunny'){ for (const sd of [-1, 1]){ const b = add(hc, [sd * 3.8, 11, -.8]), m = add(hc, [sd * 4.8 + sw * .3, 18, -1.4]), t = add(hc, [sd * 5.6 + sw * .6, 24.5, -2]);
        G(); cap(cx, b, m, 2, 2.5, em, {tex:inner}); G(); cap(cx, m, t, 2.5, 1.2, em, {tex:inner}); } }
    else if (k === 'lop'){ for (const sd of [-1, 1]){ const b = add(hc, [sd * 6.4, 10.6, -.4]), m = add(hc, [sd * 11.6, 7.4, .4]), t = add(hc, [sd * 12.6, .4, .8]);
        G(); cap(cx, b, m, 2.1, 2.6, em, {tex:inner}); G(); cap(cx, m, t, 2.6, 1.7, em, {tex:inner}); } }
    else if (k === 'bear' || k === 'mouse'){ const r = k === 'mouse' ? 3.8 : 2.9; for (const sd of [-1, 1]){ G(); ell(cx, add(hc, [sd * (k === 'mouse' ? 8.4 : 7.6), k === 'mouse' ? 11.8 : 11.2, -.8]), r, r, em, {tex:n => (n[2] > .35 && Math.hypot(n[0], n[1]) < .62 ? {m:ei} : undefined)}); } }
    if (!cfg.earNoBand){ G(); for (let a = -1.2; a <= 1.21; a += .15) ell(cx, add(hc, [Math.sin(a) * 12.2, 2.2 + Math.cos(a) * 12.2, -.4]), .8, .8, M[cfg.bandMat || cfg.earMat || 'white']); } }   // (v164) the cat folk's own ears grow from the hair: no headband
  if (cfg.hairBow){ const bm = M[cfg.hairBow], c0 = add(hc, [6.2 + sw * .2, 11.6, 3]);
    for (const sd of [-1, 1]){ G(); ell(cx, add(c0, [sd * 2.6, .6, 0]), 2.9, 2, bm, {rz:1.6}); G(); cap(cx, add(c0, [sd * .6, -.4, .3]), add(c0, [sd * 1.8, -3.6, .6]), .9, .7, bm, {}); }
    G(); ell(cx, c0, 1.2, 1.2, M[cfg.bowKnot || cfg.hairBow]); }
  if (cfg.hairClip){ const cm2 = M[cfg.clipMat || 'goldLight'];
    for (const [px, py, pz, r] of [[-7.2, 8.4, 6.6, 1.5], [-5, 10.4, 7.2, 1.2]]){ const c0 = add(hc, [px, py, pz]);
      if (cfg.hairClip === 'flower'){ for (let i = 0; i < 5; i++){ const a = i / 5 * Math.PI * 2; G(); ell(cx, add(c0, [Math.cos(a) * r * .8, Math.sin(a) * r * .8, 0]), r * .62, r * .62, cm2); } G(); ell(cx, add(c0, [0, 0, .3]), r * .45, r * .45, M.sun); }
      else { G(); ell(cx, c0, r, r, cm2); for (let i = 0; i < 5; i++){ const a = i / 5 * Math.PI * 2 + Math.PI / 2; G(); cap(cx, c0, add(c0, [Math.cos(a) * r * 1.9, Math.sin(a) * r * 1.9, 0]), r * .55, .15, cm2, {}); } } } }
  // v57 face-slot pieces worn at the side of the head, where the ears are: elf ears, floppy puppy ears, lamb ears, mermaid fins, feather ears, earmuffs
  if (cfg.sideEar){ const k = cfg.sideEar, sm = M[cfg.sideMat || cfg.skinM || 'skin'], si = M[cfg.sideIn || cfg.sideMat || 'sakura'], front = n => (n[2] > .55 ? {m:si} : undefined);
    for (const sd of [-1, 1]){ const at = (x, y, z) => add(hc, [sd * x, y, z]);
      if (k === 'elf' || k === 'elfl'){ const L0 = k === 'elfl'; G(); cap(cx, at(9.9, -1.6, -.2), at(L0 ? 18.6 : 15.4, L0 ? 6.4 : 3.8, L0 ? -1.8 : -1.1), L0 ? 2.3 : 2.1, .25, sm, {}); }
      else if (k === 'puppy'){ const b = at(9.4, 4, -.4), m = add(at(12.4, -.2, .2), [sw * .3, 0, 0]), t = add(at(12.6, -6.4, .6), [sw * .6, 0, 0]);
        G(); cap(cx, b, m, 2.6, 3.2, sm, {tex:front}); G(); cap(cx, m, t, 3.2, 2.3, sm, {tex:front}); }
      else if (k === 'sheep'){ G(); ell(cx, at(13, .6, -.3), 3.5, 1.8, sm, {rz:1.6, tex:n => (n[2] > .4 && Math.abs(n[1]) < .5 ? {m:si} : undefined)}); }
      else if (k === 'fin' || k === 'feather'){ const F = k === 'feather', tips = F ? [[13.6, 8.6], [16.4, 5.4], [17.2, 1.6]] : [[14.6, 5.2], [16.4, 1.4], [14.8, -2.8]];
        tips.forEach(([x, y], i) => { G(); cap(cx, at(10.2, -.6, -.5), at(x, y, -1 - i * .3), F ? 1.5 : 1.4, F ? .35 : .5, F ? sm : (i % 2 ? si : sm), {}); });
        G(); ell(cx, at(10.4, -.6, -.2), 1.4, 1.4, si); }
      else if (k === 'muff'){ G(); ell(cx, at(11.2, -1.6, .2), 3.7, 3.7, sm, {rz:2.4}); }
    }
    if (k === 'muff'){ G(); for (let a = -1.45; a <= 1.46; a += .14) ell(cx, add(hc, [Math.sin(a) * 11.8, -1.6 + Math.cos(a) * 13.6, -.4]), .9, .9, si); } }
  if (cfg.mask){ G(); ell(cx, add(hc, [0, -4.2, 2.8]), 10.6, 5.6, M[cfg.mask], {tex:n => (n[2] < .1 ? false : n[1] > .5 ? false : undefined)}); }
  // (v164) a ninja's cloth mask: wraps the lower face from under the eyes to the chin, with a seam across the nose
  if (cfg.ninjaMask){ G(); ell(cx, add(hc, [0, -6.6, .9]), 10.6, 4.8, M[cfg.ninjaMask], {rz:10.75, tex:n => (n[2] < -.35 ? false : n[1] > .62 ? false : Math.abs(n[1] - .5) < .08 ? {t:2} : undefined)}); }
  // (v166) the cat and dog folk's own faces: a dog's muzzle with a black nose, a cat's two little whisker pads (the fur, nose, mouth and whiskers are painted on in paintHead)
  if (cfg.animal === 'dog'){ G(); ell(cx, add(hc, [0, -6.9, 8.3]), 3.9, 2.5, M[cfg.muzzle || 'cream'], {rz:4.5, tex:n => (n[1] < -.5 && n[2] > .3 && Math.abs(n[0]) < .55 ? {t:2} : undefined)});
    G(); ell(cx, add(hc, [0, -5.5, 12.4]), 1.75, 1.25, M.charcoal, {rz:1.2, tex:n => (n[1] > .5 && n[0] < 0 ? {t:0} : undefined)}); }
  else if (cfg.animal === 'cat'){ for (const sd of [-1, 1]){ G(); ell(cx, add(hc, [sd * 1.45, -6.5, 9.1]), 1.75, 1.35, M[cfg.muzzle || 'white'], {rz:1.5}); } }
  if (cfg.earring){ for (const sd of [-1, 1]){ const e0 = add(hc, [sd * 10.6, -3.2, .9]); G(); ell(cx, e0, 1.1, 1.1, M[cfg.earring]); G(); ell(cx, add(e0, [sd * .25, -2.5, .2]), cfg.earBig ? 1.8 : 1.35, cfg.earBig ? 2.4 : 1.7, M[cfg.earring]); } }
  if (cfg.pouch){ G(); ell(cx, lean([hipC[0] - 4.8, 10.6 + B, 3.4]), 2.4, 2.7, M.tan, {tex:n => (n[1] > .55 ? {m:M.leather} : undefined)}); }
  if (cfg.necklace || cfg.pendant){ G(); for (let a = -1.3; a <= 1.3; a += .2) dot(cx, lean([hipC[0] + Math.sin(a) * 5, 19.6 + B - Math.cos(a) * 1.6, Math.cos(a) * 5.4 + (cfg.chest ? .5 : 0)]), M[cfg.neckMat || 'gold'], 1); }
  if (cfg.pendant){ G(); ell(cx, lean([hipC[0], 17.6 + B, 6.4 + (cfg.chest ? .5 : 0)]), 1.35, cfg.pendant === 'tusk' ? 2 : 1.35, M[cfg.pendant]); }
  if (cfg.fingerRing){ G(); ell(cx, add(handL, [0, 0, .6]), .9, .9, M[cfg.fingerRing]); }
  // monster extras: a long tail (monkeys, mermaids), horns and fangs (yaksha), wings (kinnaree, deva, garuda-kin)
  if (cfg.tail){ G(); let p0 = lean([hipC[0], 9.5 + B, -5]); const sw0 = P.sway || 0;
    for (let i = 1; i <= 7; i++){ const k = i / 7, p1 = lean([hipC[0] + Math.sin(k * 3 + sw0) * 2.4 * k, 9 + B - k * 3 + Math.sin(k * 3.2) * 5 * (cfg.tailUp || 1), -5 - k * 9]);
      cap(cx, p0, p1, (cfg.tailW || 1.5) * (1 - k * .45), (cfg.tailW || 1.5) * (1 - k * .5), M[cfg.tail], {}); p0 = p1; }
    if (cfg.tailFin){ G(); ell(cx, p0, 4.2, 1.2, M[cfg.tailFin], {rz:2.6}); } }
  if (cfg.horns){ for (const sd of [-1, 1]){ G(); cap(cx, add(hc, [sd * 5.4, 7.4, .5]), add(hc, [sd * (7.6 + (cfg.hornSpread || 0)), 14.5 + (cfg.hornLen || 0), -1.8]), 1.9, .45, M[cfg.horns], {}); } }
  if (cfg.fangs){ for (const sd of [-1, 1]){ G(); cap(cx, add(hc, [sd * 2.2, -4.4, 9.6]), add(hc, [sd * 2.5, -7.6, 9.4]), .9, .35, M.white, {}); } }
  if (cfg.wings){ const fl = ride ? 0 : Math.sin((P.sway || 0) * 1.3 + (P.bob || 0)) * .25;
    for (const sd of [-1, 1]){ G(); for (let i = 0; i < 5; i++){ const k = i / 4; ell(cx, lean([hipC[0] + sd * (4 + k * 9), 21 + B + k * 4 - k * k * 6 + fl * 6 * k, -5.5 - k * 2]), 5.4 - k * 2.2, 2.2, M[cfg.wings], {rz:4.5 - k * 2, tex:n => (n[1] < -.3 ? {m:M[cfg.wingTip || cfg.wings], t:1} : undefined)}); } } }
  // (v161) out of combat, and always while riding, the gear is carried the way it really is carried:
  //  · sword, greatsword, katana: SHEATHED in a scabbard on the back, hung from a baldric (the strap crosses the chest
  //    from the right shoulder to the left hip); the hilt stands beside the head over the right shoulder, ready for a
  //    right-hand draw, the scabbard runs down across the back toward the left hip. Katana in a black lacquer saya.
  //  · rod, longstaff: across the back on the same strap, the head over the right shoulder, the foot at the left hip
  //  · bow: slung strung across the body as archers carry it: the stave across the back, the top limb over the left
  //    shoulder, the bottom limb past the right hip, and the STRING across the chest (it is the strap)
  //  · dagger: level in a sheath on the belt at the small of the back, the hilt to the right hand
  //  · shield: flat in the middle of the back on a guige strap (crossing the chest the other way); weapons over it
  //  The chibi head covers most of the upper back, so the hilts and staff heads sit just outside the head's outline and
  //  the long parts reach below it, where they read from every side. Nothing here glows (the glow is drawn over the body).
  const stow = !P.noWeapon && (cfg.sheathed || !!ride);
  if (stow){
    const ws0 = cx.wsegs ? cx.wsegs.length : 0;
    const back = (dx, dy, dz) => lean([hipC[0] + dx, dy + B, dz]), shOn = cfg.shield && !cfg.twoHand && cfg.weapon !== 'bow';
    const wt = cfg.wTier ?? -1, strapM = M[wt >= 3 ? 'lacquer' : 'leather'], fit = M[wt >= 3 ? 'gold' : 'steel'];
    // a point on the front (sd 1) or back (sd -1) of the chest at (x, y)
    const chest = (x, y, sd) => { const q = 1 - (x / 7.1) ** 2 - ((y - 15) / 7) ** 2; return back(x, y, .4 + sd * (6.6 * Math.sqrt(Math.max(0, q)) + .45)); };
    const strap = (pts, r = .55, m = strapM) => { G(); for (let i = 0; i < pts.length - 1; i++) cap(cx, pts[i], pts[i + 1], r, r, m, {}); };
    // a strap over one shoulder (x0 side, near the neck) down across the chest to the other hip (x1)
    const sash = (x0, x1, r, m) => { const pts = []; for (let i = 0; i <= 8; i++){ const k = i / 8, x = x0 + (x1 - x0) * k, y = 21.2 - k * 12.4; pts.push(chest(x, y, 1)); } strap(pts, r, m); };
    if (shOn){ const sh = cfg.shield, big = (sh[3] || 1) * .92, c = back(0, 14.4, -7.2);
      sash(5.8, -6.2, .45, strapM);
      G(); ell(cx, c, 5.3 * big, 6.3 * big, M[sh[0]], {rz:1.1});
      G(); ell(cx, add(c, [0, 0, -.5]), 4.4 * big, 5.4 * big, M[sh[1]], {rz:1.1, tex:sh[4] ? (n => (Math.abs(n[0]) < .12 || Math.abs(n[1] - .1) < .1 ? {m:M[sh[4]], t:1} : undefined)) : undefined});
      if (sh[2]){ G(); ell(cx, add(c, [0, .3, -1.4]), 1.5 * big, 1.5 * big, M[sh[2]]); } }
    const w = cfg.weapon, zb = shOn ? -9.4 : -7.6, kat = w === 'dagger' && !!cfg.katana, two = !!cfg.twoHand || kat;
    if (w && w !== 'fist'){
      const P2 = {...P, ring:-1, draw:0, arrow:false, glow:-1}, cf = {...cfg, rfTier:0, offWeapon:false};
      if (w === 'bow'){
        const BW = 10 * WPN_BIG * 1.06, bw = wt, ax = nrm(upper([.62, 1, 0])), out = upper([0, 0, -1]), c = back(2.2, 14.6, zb);
        const limbM = M[['wood', 'wood', 'lacquer', 'charcoal', 'teal', 'gold'][bw] || 'wood'], pts = [];
        for (let i = 0; i <= 18; i++){ const yy = BW - i / 18 * BW * 2, k = yy / BW; pts.push(add(add(c, mul(ax, yy)), mul(out, 2.6 * (1 - k * k) - .9 * Math.abs(k) ** 3))); }   // a recurve: belly out, tips back
        G(); for (let i = 0; i < pts.length - 1; i++) cap(cx, pts[i], pts[i + 1], 1.2 + (i > 7 && i < 11 ? .35 : 0), 1.2, i < 2 || i > pts.length - 4 ? M.steel : (i > 7 && i < 11 ? M.leather : limbM), {});
        // the string: from the top nock over the left shoulder, across the chest, under the right arm to the bottom nock
        const top = pts[0], bot = pts[pts.length - 1], sp = [top, back(7.4, 22.2, -1.4)];
        for (let i = 0; i <= 6; i++){ const k = i / 6; sp.push(chest(6.2 - 12.6 * k, 20.6 - 11 * k, 1)); }
        sp.push(back(-7.4, 9, -1.2), bot);
        G(); for (let i = 0; i < sp.length - 1; i++) line(cx, sp[i], sp[i + 1], M.white, {t:1});
      }
      else if (w === 'dagger' && !kat){
        // level on the belt at the small of the back, edge down, hilt to the right
        P2.wdir = nrm(upper([1, -.12, 0])); const h = back(-4.2, 10.4, -7.0);
        drawWeapon(cx, w, P2, h, h, G, cf);
        const len = (9.5 + Math.max(0, wt) * .3) * WPN_BIG * 1.15, a0 = add(h, mul(P2.wdir, .2)), a1 = add(h, mul(P2.wdir, len + .5));
        G(); cap(cx, a0, a1, 1.45, 1.0, strapM, {}); G(); ell(cx, a1, 1.0, 1.0, fit); G(); ell(cx, a0, 1.6, 1.6, fit, {rz:.5});
      }
      else if (w === 'staff' || cfg.axe){
        // head over the right shoulder beside the head, the foot toward the left hip (v164: an axe hangs the same way, by its haft)
        const len = cfg.axe ? (17 + Math.max(0, wt) * .7) * (two ? 1.45 : .88) * WPN_BIG * (two ? 1.02 : .82) : (20 + Math.max(0, wt) * .5) * (two ? .86 : .5) * WPN_BIG, tot = len + 6, tip = back(-10.6, 27.5, zb), sn = Math.min(.8, (27.5 - 3) / tot);
        P2.wdir = nrm(upper([-Math.sqrt(1 - sn * sn), sn, 0])); const h = add(tip, mul(P2.wdir, -len));
        sash(-6.2, 6.0, .55, strapM);
        drawWeapon(cx, w, P2, h, h, G, cf);
        // the strap holds it at two points
        G(); for (const k of [.35, .75]){ const q = add(h, mul(P2.wdir, -6 + tot * k - len * 0)); ell(cx, add(q, mul(P2.wdir, -tot * .0)), 1.25, 1.25, strapM, {rz:.6}); }
      }
      else {
        // sword, greatsword, katana: hilt over the right shoulder, sheathed blade down across the back
        const len = kat ? (19.5 + Math.max(0, wt) * .5) * WPN_BIG : (17 + Math.max(0, wt) * .7) * (two ? 1.45 : .88) * WPN_BIG;
        const gy = 21.6, gx = two ? -10.2 : -9.6, sn = Math.min(.86, (gy - 2.6) / len);
        P2.wdir = nrm(upper([Math.sqrt(1 - sn * sn), -sn, 0])); const g0 = back(gx, gy, zb), h = add(g0, mul(P2.wdir, .8)), dir = P2.wdir;
        sash(-6.2, 6.0, two ? .65 : .55, strapM);
        drawWeapon(cx, w, P2, h, h, G, cf);
        const scM = kat ? M[wt >= 3 ? 'lacquer' : 'charcoal'] : M[['leather', 'leather', 'lacquer', 'charcoal', 'teal', 'lacquer'][wt] || 'leather'];
        if (kat){
          // saya: follows the katana's gentle curve, a cord (sageo) knotted at the mouth, a horn cap at the end
          const up = nrm(Math.abs(dir[1]) > .95 ? [0, 0, 1] : [-dir[0] * dir[1], 1 - dir[1] * dir[1], -dir[2] * dir[1]]);
          const base = add(h, mul(dir, -.8)), k0 = add(base, mul(dir, .5)), k1 = add(add(base, mul(dir, len * .55)), mul(up, .55)), k2 = add(add(base, mul(dir, len + .6)), mul(up, 1.5));
          G(); cap(cx, k0, k1, 1.3, 1.22, scM, {tex:(n, lo, q, t) => (t > .06 && t < .1 ? {m:M[wt >= 3 ? 'gold' : 'white'], t:1} : undefined)}); cap(cx, k1, k2, 1.22, 1.0, scM, {});
          G(); ell(cx, k2, 1.05, 1.05, M[wt >= 3 ? 'gold' : 'charcoal']);
          G(); cap(cx, add(k0, mul(dir, 2)), add(add(k0, mul(dir, 3.4)), mul(up, -2.2)), .35, .35, M[wt >= 3 ? 'gold' : 'white'], {});
        } else {
          // scabbard: wider than the blade, a metal throat (locket) at the mouth, a metal tip (chape), a strap ring
          const hw = two ? 2.75 : 2.05, base = add(h, mul(dir, -.8)), a0 = add(base, mul(dir, .35)), a1 = add(base, mul(dir, len + .5));
          G(); cap(cx, a0, a1, hw, hw * .62, scM, {rz:1.25});
          G(); cap(cx, a0, add(a0, mul(dir, 2.0)), hw + .2, hw + .15, fit, {rz:1.4});
          G(); cap(cx, add(a1, mul(dir, -2.2)), add(a1, mul(dir, .3)), hw * .7, hw * .45, fit, {rz:1.3});
          G(); ell(cx, add(a0, mul(dir, len * .32)), hw + .25, .5, strapM, {rz:hw * .6});
        }
      }
    }
    if (cx.wsegs) cx.wsegs.length = ws0;
  }
  // weapon follows the forearm
  if (!P.noWeapon && !stow){
    const wa = P.wLeft ? P.armL + P.elbL * .7 : P.armR + P.elbR * .7;
    P.wdir = nrm(upper(rotX([0, -1, 0], -(wa + P.wpn - .1))));
    drawWeapon(cx, cfg.weapon, P, P.wLeft ? handL : handR, P.wLeft ? handR : handL, () => (cx.gid = gid++), cfg);
  }
  // a second one-handed weapon in the free hand
  if (cfg.offWeapon && !P.noWeapon && !stow && !cfg.twoHand){ const wa2 = P.wLeft ? P.armR + P.elbR * .7 : P.armL + P.elbL * .7, wd0 = P.wdir;
    P.wdir = nrm(upper(rotX([0, -1, 0], -(wa2 + P.wpn * .6 - .1)))); drawWeapon(cx, cfg.weapon, P, P.wLeft ? handR : handL, P.wLeft ? handL : handR, () => (cx.gid = gid++), {...cfg, wTier:cfg.offTier ?? cfg.wTier}); P.wdir = wd0; }
  // a shield on the free hand (only beside a one-handed weapon): rim behind, face in front, a boss in the middle
  if (cfg.shield && !P.noWeapon && !stow && !cfg.twoHand){ const sh = cfg.shield, side = P.wLeft ? -1 : 1, c = add(P.wLeft ? handR : handL, [side * 2.0, 1.6, 1.6]), big = sh[3] || 1;
    G(); ell(cx, c, 5.3 * big, 6.3 * big, M[sh[0]], {rz:1.2, dz:-.6});
    G(); ell(cx, c, 4.4 * big, 5.4 * big, M[sh[1]], {rz:1.5, tex:sh[4] ? (n => (Math.abs(n[0]) < .12 || Math.abs(n[1] - .1) < .1 ? {m:M[sh[4]], t:1} : undefined)) : undefined});
    if (sh[2]){ G(); ell(cx, add(c, [0, .3, 1.2]), 1.5 * big, 1.5 * big, M[sh[2]]); }
    (cx.ssegs || (cx.ssegs = [])).push([proj(cx, add(c, [0, 0, .8])), proj(cx, add(c, [0, 5.6 * big, .8]))]); }   // where the shield is in this frame (refine glow, v55)
  // lasso (capture)
  if (P.lasso){
    const L = P.lasso; G();
    const ring = (c, r, a0, flat) => { for (let a = 0; a < 6.28; a += .12){ const p = add(c, [Math.cos(a + a0) * r, flat ? 0 : Math.sin(a + a0) * r * .25, Math.sin(a + a0) * r]); dot(cx, p, M.rope, (Math.floor(a * 2) % 2), 900); } };
    if (L.mode === 'spin'){ const c = add(handR, [0, 3.5, 0]); ring(c, 6, L.a, true); line(cx, handR, add(c, [Math.cos(L.a) * 6, 0, Math.sin(L.a) * 6]), M.rope, {t:1}); }
    else if (L.mode === 'throw'){ const c = [0, 9, 15]; line(cx, handR, c, M.rope, {t:1}); ring(c, 4.5, 0, false); }
    else if (L.mode === 'land'){ const c = [0, 1, 19]; line(cx, handR, c, M.rope, {t:1}); ring(c, 5.5, 0, true); }
    else { const c = [0, 1.2, 19]; line(cx, handR, c, M.rope, {t:0}); line(cx, handL, lerp3(handR, c, .25), M.rope, {t:1}); ring(c, 3.6, 0, true); }
  }
  // magic ring (cast)
  if (P.ring >= 0 && cfg.ringMat){
    G(); const R = 16, rot = P.ring * .4;
    for (let a = 0; a < Math.PI * 2; a += .05){ dot(cx, [Math.cos(a) * R, .2, Math.sin(a) * R * 1], M[cfg.ringMat], (Math.floor((a + rot) * 3) % 3 === 0) ? 0 : 2, 999); }
    for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + rot; const p1 = [Math.cos(a) * R, .2, Math.sin(a) * R], p2 = [Math.cos(a + 2.1) * R, .2, Math.sin(a + 2.1) * R]; line(cx, p1, p2, M[cfg.ringMat], {t:2, g:999}); }
  }
  // skill aura + rising sparks
  if (P.aura >= 0){
    const am = M[cfg.aura || 'auraGold'], R = [8, 12, 15, 17, 18][P.aura], fade = [1, 0, 0, 1, 2][P.aura];
    for (let a = 0; a < Math.PI * 2; a += .06) dot(cx, [Math.cos(a) * R, .3, Math.sin(a) * R], am, Math.min(3, fade + (Math.floor(a * 4 + P.aura) % 2)), 998);
    for (let i = 0; i < 9; i++){ const a = i * 2.39, h = ((P.sparks * 7 + i * 9) % 34) + 2, r = 9 + (i % 3) * 2.2;
      const p = [Math.cos(a) * r, h, Math.sin(a) * r]; dot(cx, p, am, h > 26 ? 2 : 0, 997); if (h < 30) dot(cx, add(p, [0, 1, 0]), am, 1, 997); }
  }
  cx.pre = null;
}
function faceTex(n, cfg, P){
  if (n[2] < .38) return;
  if (cfg.paint){ // eyes and mouth are hand-painted afterwards (paintHead); keep only the blush here
    if (n[1] < -.2 && n[1] > -.36 && Math.abs(Math.abs(n[0]) - .55) < .1 && n[2] > .5) return {m:M.blush, t:1};
    return;
  }
  const iris = M[cfg.iris || 'irisBr'];
  for (const sx of [-1, 1]){
    const ex = n[0] - sx * .37, ey = n[1] + .1;
    if (P.eyes === 'closed'){ if (Math.abs(ey + .04) < .055 && Math.abs(ex) < .16) return {m:M.eye, t:2}; continue; }
    if (P.eyes === 'hurt'){ if (Math.abs(Math.abs(ex) * .9 - (ey + .02) * sx * 0 - Math.abs(ey + .02)) < .06 && Math.abs(ex) < .15 && Math.abs(ey) < .15) return {m:M.eye, t:2}; continue; }
    const q = (ex / .175) ** 2 + (ey / .27) ** 2;
    if (q < 1){
      if (ey > .04 && ey < .17 && ex < .03 && ex > -.11) return {m:M.eye, t:0};          // main catch-light
      if (ey < -.12 && ey > -.19 && ex > .04 && ex < .1) return {m:M.eye, t:0};         // small lower glint
      if (ey > .14) return {m:M.eye, t:3};                                               // upper lid shadow
      if (ey < -.04) return {m:iris, t:ey < -.15 ? 0 : 1};
      return {m:M.eye, t:2};
    }
    if (q < 1.7 && ey > .1) return {m:M.eye, t:3};                                       // bold lash line
    if (q < 1.5 && ey < -.12 && Math.abs(ex) < .12) return {m:M[cfg.skinM || 'skin'], t:2};
  }
  if (cfg.beard) return;
  if (Math.abs(n[0]) < (P.mouth ? .09 : .065) && n[1] < -.37 && n[1] > (P.mouth ? -.5 : -.44) && n[2] > .78) return {m:M.mouth, t:1};
  if (n[1] < -.18 && n[1] > -.36 && Math.abs(Math.abs(n[0]) - .53) < .11 && n[2] > .5) return {m:M.blush, t:1};
}
/* ---------- hand-painted head layer ----------
   After the 3D pass, the face and hair get drawn like pixel art: anime eyes with lash, iris bands and catch-lights,
   a small mouth, bangs cut into clumps with dark gaps, and lock lines across the hair.
   Every shape is defined in the head's own surface frame and projected, so it foreshortens and turns with all 8
   directions and every animation. Paint lands only on the head's own pixels (hands in front still cover it). */
function paintHead(img, F, cx){
  const H = cx.head, {hc, cfg, P} = H, K = cx.k, D = img.data, W = F.w, R = 10.4;
  const rgb = (m, t) => MATS[M[m] ?? m].ramp[t];
  const isSkin = i => F.g[i] === H.skinG, isHair = i => F.g[i] >= H.hairG0 && F.g[i] < H.hairG1;
  const put = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= F.h) return; const o = (y * W + x) * 4; D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = 255; };
  const nz = (v) => { const a = proj(cx, hc), b = proj(cx, add(hc, mul(v, R))); return (b.d - a.d) / (R * K); }; // how much a head-local normal faces the viewer
  // rasterise fn(u, v) over a patch on the head surface: centre local normal n0, tangents tu/tv, 1 unit = sc model units
  function patch(n0, tu, tv, sc, ext, fn, mask){
    const c3 = add(hc, mul(n0, R)), c = proj(cx, c3), pu = proj(cx, add(c3, mul(tu, sc))), pv = proj(cx, add(c3, mul(tv, sc)));
    const ux = pu.x - c.x, uy = pu.y - c.y, vx = pv.x - c.x, vy = pv.y - c.y, det = ux * vy - vx * uy;
    if (Math.abs(det) < .05) return;
    const r = Math.ceil(ext * (Math.hypot(ux, uy) + Math.hypot(vx, vy)));
    for (let y = Math.floor(c.y - r); y <= c.y + r; y++) for (let x = Math.floor(c.x - r); x <= c.x + r; x++){
      if (x < 0 || y < 0 || x >= W || y >= F.h) continue;
      const rx = x + .5 - c.x, ry = y + .5 - c.y, u = (rx * vy - vx * ry) / det, v = (ux * ry - rx * uy) / det;
      const col = fn(u, v); if (!col) continue;
      const i = y * W + x; if (mask(i, u, v)) put(x, y, col);
    }
  }
  const front = nz([0, 0, 1]);
  const dark = [42, 24, 30], white = [255, 252, 246];
  // (v166) cat and dog folk: the face is fur (the skin re-coloured, its shading kept), a pale muzzle, tabby stripes or a Siamese mask
  const ani = cfg.animal;
  if (ani && cfg.faceFur){ const s0 = rgb(cfg.skinM || 'skin', 2), f0 = rgb(cfg.faceFur, 2), kk = [0, 1, 2].map(c => f0[c] / Math.max(1, s0[c]));
    for (let i = 0, n = W * F.h; i < n; i++) if (isSkin(i)){ const o = i * 4; D[o] = Math.min(255, D[o] * kk[0]); D[o + 1] = Math.min(255, D[o + 1] * kk[1]); D[o + 2] = Math.min(255, D[o + 2] * kk[2]); }
    if (front > .1){ const mz = cfg.muzzle ? rgb(cfg.muzzle, 1) : null, pt = cfg.facePoint ? rgb(cfg.facePoint, 1) : null, stp = cfg.faceStripes ? rgb(cfg.faceStripes, 1) : null;
      const nmz = nrm([0, -.5, .87]); if (mz && nz(nmz) > .15) patch(nmz, [1, 0, 0], [0, 1, 0], 1, 4.6, (u, v) => ((u / 3.6) ** 2 + ((v + .2) / 2.4) ** 2 < 1 ? mz : null), i => isSkin(i));
      if (pt){ const np = nrm([0, -.3, .95]); if (nz(np) > .15) patch(np, [1, 0, 0], [0, 1, 0], 1, 5, (u, v) => ((u / 3.4) ** 2 + ((v + .5) / 3) ** 2 < 1 ? pt : null), i => isSkin(i)); }
      if (stp){ const nf = nrm([0, .5, .87]); if (nz(nf) > .1) patch(nf, [1, 0, 0], [0, 1, 0], 1, 4, (u, v) => { for (const c of [-1.6, 0, 1.6]) if (Math.abs(u - c * (1 + v * .08)) < .38 - Math.abs(v) * .06 && v > -1.4 && v < 2.2 - Math.abs(c) * .5) return stp; return null; }, i => isSkin(i)); } } }
  // ---- eyes ----
  if (front > .18 && !H.hatFace){
    for (const side of [-1, 1]){
      const n0 = nrm([side * .37, -.2, .91]), f = nz(n0); if (f < .12) continue;
      const tu = nrm([n0[2], 0, -n0[0]]), tv = [0, 1, 0], ir = cfg.iris || 'irisBr', out = -side; // u grows to the character's left; "out" points away from the nose
      patch(n0, tu, tv, 1.22, 3.4, (u, v) => {
        const o = u * out;                                   // + = outer corner
        if (P.eyes === 'closed') return (Math.abs(v + .1 + o * o * .08) < .45 && Math.abs(u) < 1.9) ? dark : null;
        if (P.eyes === 'hurt') return (Math.abs(Math.abs(v) - (1.4 - Math.abs(u)) * .8) < .45 && Math.abs(u) < 1.5) ? dark : null;
        const e = (u / 1.75) ** 2 + ((v + .1) / 2.5) ** 2;
        const arc = 2.15 - u * u * .2;                                                                   // lash follows the top of the eye
        if (v > arc - .65 && v < arc + .55 && Math.abs(u) < 1.95) return dark;                          // upper lash (thick, rounded)
        if (o > 1.5 && o < 2.35 && v > arc - .9 && v < arc + .1) return dark;                           // small outer flick
        if (cfg.lashes && ((o > 1.7 && o < 2.9 && v > arc - .2 - (o - 1.7) * .9 && v < arc + .5 - (o - 1.7) * .9) || (o > 1.2 && o < 2 && v < -2.15 && v > -2.7))) return dark;   // longer lashes + lower lash
        if (e >= 1) return null;
        if ((u + .55 * out * 0 + .55) ** 2 + (v - .75) ** 2 < (cfg.cute ? .62 : .45)) return white;                        // main catch-light
        if (cfg.cute && ((u - .55) ** 2 + (v + .55) ** 2 < .16 || (Math.abs(u - .1) < .12 && Math.abs(v + 1.6) < .4) || (Math.abs(v + 1.6) < .12 && Math.abs(u - .1) < .4))) return white;   // sparkle
        if ((u - .6) ** 2 + (v + 1.35) ** 2 < .18) return white;                                       // small glint
        const ie = ((u + out * .1) / 1.45) ** 2 + ((v + .2) / 2.3) ** 2;
        if (ie < 1){
          if ((u / (ani === 'cat' ? .3 : .6)) ** 2 + ((v + .1) / (ani === 'cat' ? 1.45 : 1.05)) ** 2 < 1) return dark;   // pupil (a cat's is a slit)
          return v > .35 ? rgb(ir, 3) : v > -.9 ? rgb(ir, 2) : v > -1.7 ? rgb(ir, 1) : rgb(ir, 0);
        }
        return v > .9 ? [214, 206, 214] : white;                                                         // sclera (lid shadow on top)
      }, i => isSkin(i));
    }
    // mouth + nose
    // cute: soft pink blush ovals with tiny highlight lines under each eye
    if (cfg.cute || cfg.blush) for (const side of [-1, 1]){ const nb = nrm([side * .5, -.36, .8]); if (nz(nb) > .15) patch(nb, nrm([nb[2], 0, -nb[0]]), [0, 1, 0], 1, 1.8, (u, v) => {
        const e = (u / 1.25) ** 2 + (v / .6) ** 2; if (e >= 1) return null; return (Math.abs(u - .3 + v * .6) < .16 || Math.abs(u + .4 + v * .6) < .16) && e < .7 ? [255, 236, 236] : [255, 150, 170]; }, i => isSkin(i)); }
    const nm = nrm([0, -.42, .9]);
    if (ani === 'cat'){   // a pink nose, the little ω mouth, three whiskers a side
      const nC = nrm([0, -.47, .88]); if (nz(nC) > .2) patch(nC, [1, 0, 0], [0, 1, 0], .9, 2.6, (u, v) => {
        if (v > .55 && v < 1.55 && Math.abs(u) < (v - .55) * .95 + .12) return v > 1.35 ? [255, 190, 200] : [232, 120, 140];
        if (Math.abs(u) < .14 && v > -.15 && v <= .6) return [96, 52, 58];
        for (const sd of [-1, 1]){ const d = Math.hypot(u - sd * .62, v + .05); if (v < 0 && Math.abs(d - .62) < .16) return [96, 52, 58]; }
        return null; }, i => isSkin(i));
      const wc = cfg.whisker === 'dark' ? [70, 50, 50] : [250, 246, 238];
      for (const sd of [-1, 1]){ const nw = nrm([sd * .5, -.5, .7]); if (nz(nw) < .05) continue; const tu = nrm([nw[2] * sd, 0, -nw[0] * sd]);
        patch(nw, tu, [0, 1, 0], 1, 7, (u, v) => { if (u < .6 || u > 6.4) return null; for (const j of [-1, 0, 1]) if (Math.abs(v - j * (.55 + u * .16)) < .13) return wc; return null; }, i => isSkin(i) || D[i * 4 + 3] === 0); }
    } else if (ani !== 'dog' && nz(nm) > .2) patch(nm, [1, 0, 0], [0, 1, 0], .9, 2.2, (u, v) => {
      if (P.mouth) return ((u / .9) ** 2 + ((v + .2) / .8) ** 2 < 1) ? (v > .2 ? [120, 40, 52] : [200, 90, 90]) : null;
      return (Math.abs(v - u * u * .22 + .1) < .38 && Math.abs(u) < 1.1) ? (cfg.lashes ? [208, 92, 110] : [150, 64, 70]) : null;
    }, i => isSkin(i));
    const nn = nrm([0, -.2, .98]);
    if (!ani && nz(nn) > .3) patch(nn, [1, 0, 0], [0, 1, 0], .9, 1, (u, v) => (Math.abs(u - .3) < .5 && Math.abs(v) < .5 ? rgb('skin', 2) : null), i => isSkin(i));
    // a half mask across the eyes (face slot) and eyewear (eye slot), painted over the face
    const ne = nrm([0, -.2, .98]);
    if (cfg.halfMask && nz(ne) > .2){ const hm = cfg.halfMask;
      patch(ne, [1, 0, 0], [0, 1, 0], 1, 10, (u, v) => { if (Math.abs(v - .2 + u * u * .012) > 1.9 || Math.abs(u) > 11) return null;
        for (const ex of [-3.85, 3.85]) if (((u - ex) / 1.75) ** 2 + ((v - .1) / 1.35) ** 2 < 1) return null;   // eye holes
        const edge = Math.abs(v - .2 + u * u * .012) > 1.45; return edge ? rgb(hm, 3) : rgb(hm, v > .9 ? 1 : 2); }, i => isSkin(i)); }
    if (cfg.lens && nz(ne) > .2){ const ln = cfg.lens, fr = cfg.lensFrame || 'gold', blend = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= F.h) return; const o = (y * W + x) * 4; D[o] = (D[o] + c[0] * 1.3) / 2.3; D[o + 1] = (D[o + 1] + c[1] * 1.3) / 2.3; D[o + 2] = (D[o + 2] + c[2] * 1.3) / 2.3; };
      const c3 = add(hc, mul(ne, R)), c = proj(cx, c3), pu = proj(cx, add(c3, [1, 0, 0])), pv = proj(cx, add(c3, [0, 1, 0]));
      const ux = pu.x - c.x, uy = pu.y - c.y, vx = pv.x - c.x, vy = pv.y - c.y, det = ux * vy - vx * uy, r = Math.ceil(8 * (Math.hypot(ux, uy) + Math.hypot(vx, vy)));
      if (Math.abs(det) > .05) for (let y = Math.floor(c.y - r); y <= c.y + r; y++) for (let x = Math.floor(c.x - r); x <= c.x + r; x++){
        if (x < 0 || y < 0 || x >= W || y >= F.h || !isSkin(y * W + x)) continue;
        const rx = x + .5 - c.x, ry = y + .5 - c.y, u = (rx * vy - vx * ry) / det, v = (ux * ry - rx * uy) / det;
        let hit = 0; for (const ex of [-3.85, 3.85]){ const d = Math.hypot((u - ex) / 1.15, (v - .15) / 1.0); if (d < 1.6) hit = Math.max(hit, 1); if (d >= 1.6 && d < 2.15) hit = 2; }
        if (!hit && Math.abs(v - .7) < .35 && Math.abs(u) < 2.2) hit = 2;                               // the bridge
        if (hit === 2) put(x, y, rgb(fr, 2)); else if (hit === 1) blend(x, y, rgb(ln, 1)); } }
    // v29 wardrobe masks: a painted face mask in one of eleven cuts (cfg.fmStyle), its material, a trim and optional glowing eyes
    if (cfg.faceMask && nz(ne) > .15){ const fm = cfg.faceMask, tr = cfg.fmTrim || fm, eg = cfg.fmEye, st = cfg.fmStyle || 'full';
      const hole = (u, v, rx = 1.75, ry = 1.35) => { for (const ex of [-3.85, 3.85]) if (((u - ex) / rx) ** 2 + ((v - .1) / ry) ** 2 < 1) return ex; return 0; };
      const eye = (u, v, rx, ry) => { const h = hole(u, v, rx, ry); if (!h) return 0; return eg ? (((u - h) / (rx * .55)) ** 2 + ((v - .1) / (ry * .45)) ** 2 < 1 ? rgb(eg, 0) : [24, 14, 22]) : null; };
      const face = (u, v, a = 10.8, b = 7.4, c = -1.4) => ((u / a) ** 2 + ((v - c) / b) ** 2);
      const tone = (v, k) => rgb(fm, k > .82 ? 3 : v > 2 ? 1 : v < -4 ? 2 : 1);
      const FM = {
        // v56 cute face pieces: glasses (round, big, heart, star, cat-eye), blush, whiskers, a plaster, cheek stickers, a cloth mask
        round:(u, v) => { for (const ex of [-3.9, 3.9]){ const d = Math.hypot(u - ex, v - .2); if (d < 2.25){ return Math.hypot(u - ex + .9, v - 1.1) < .45 ? [255, 255, 255] : null; } if (d < 2.85) return rgb(tr, d < 2.5 ? 1 : 2); }
          if (Math.abs(u) < 1.65 && Math.abs(v - .9) < .32) return rgb(tr, 1); if (Math.abs(v - .7) < .3 && Math.abs(u) > 6.6 && Math.abs(u) < 10.8) return rgb(tr, 2); return null; },
        big:(u, v) => { for (const ex of [-4, 4]){ const d = Math.hypot((u - ex) / 1.05, v - .1); if (d < 2.95) return Math.hypot(u - ex + 1.2, v - 1.3) < .5 ? [255, 255, 255] : null; if (d < 3.35) return rgb(tr, 1); }
          if (Math.abs(u) < 1.2 && Math.abs(v - 1.1) < .28) return rgb(tr, 1); if (Math.abs(v - 1) < .26 && Math.abs(u) > 7.4 && Math.abs(u) < 10.8) return rgb(tr, 2); return null; },
        heart:(u, v) => { const hf = (x, y) => { const X = x * 1.25, Y = y * 1.25 + .2, q = X * X + Y * Y - 1; return q * q * q - X * X * Y * Y * Y; };
          for (const ex of [-4, 4]){ const x = (u - ex) / 2.7, y = (v - .3) / 2.7; if (hf(x, y) < 0){ if (hf(x / .8, y / .8) >= 0) return rgb(tr, 1); return Math.hypot(u - ex + .9, v - 1.2) < .55 ? [255, 255, 255] : rgb(fm, v > .6 ? 0 : 1); } }
          if (Math.abs(u) < 1.4 && Math.abs(v - 1) < .3) return rgb(tr, 1); if (Math.abs(v - .8) < .28 && Math.abs(u) > 7.2 && Math.abs(u) < 10.8) return rgb(tr, 2); return null; },
        star:(u, v) => { for (const ex of [-4, 4]){ const x = u - ex, y = v - .2, r = Math.hypot(x, y), a = Math.atan2(y, x) - Math.PI / 2, R = 2.9 * (.62 + .38 * Math.cos(5 * a));
            if (r < R){ if (r > R - .55) return rgb(tr, 1); return Math.hypot(x + .7, y - .9) < .45 ? [255, 255, 255] : rgb(fm, y > .3 ? 0 : 1); } }
          if (Math.abs(u) < 1.3 && Math.abs(v - .6) < .28) return rgb(tr, 1); if (Math.abs(v - .7) < .28 && Math.abs(u) > 7.2 && Math.abs(u) < 10.8) return rgb(tr, 2); return null; },
        cateye:(u, v) => { for (const ex of [-3.9, 3.9]){ const x = u - ex, y = v - .2, k = (x / 2.8) ** 2 + (y / 2) ** 2, out = Math.sign(ex) * x;
            if (out > 1.2 && y > .6 && y < .6 + (out - 1.2) * 1.1 && out < 3.6) return rgb(tr, 0);
            if (k < 1){ if (k > .72 || (y > 1.1 && k > .45)) return rgb(tr, 1); return Math.hypot(x + .8, y - .8) < .42 ? [255, 255, 255] : null; } }
          if (Math.abs(u) < 1.3 && Math.abs(v - .9) < .3) return rgb(tr, 1); return null; },
        blush:(u, v) => { for (const ex of [-6.3, 6.3]){ const k = ((u - ex) / 2) ** 2 + ((v + 2.5) / 1.15) ** 2; if (k < 1) return rgb(fm, k < .35 ? 1 : 2);
            for (let i = -1; i <= 1; i++) if (Math.abs((u - ex - i * 1) + (v + 2.5) * .6) < .16 && Math.abs(v + 2.5) < .55) return rgb(fm, 3); }
          if (tr !== fm && Math.hypot(u - 6.4, v + .6) < .5) return rgb(tr, 0); return null; },
        whisker:(u, v) => { if (Math.abs(u) < 1 && v < -2.2 && v > -3.4 + Math.abs(u) * .9) return rgb(fm, 1);
          for (const sd of [-1, 1]) for (const k of [-1, 0, 1]){ const au = sd * u; if (au > 5.4 && au < 10.6 && Math.abs(v - (-2.6 + k * .9) - (au - 5.4) * k * .12) < .17) return rgb(tr, 3); }
          for (const ex of [-6.3, 6.3]) if (((u - ex) / 1.6) ** 2 + ((v + 3.4) / .9) ** 2 < 1) return rgb(fm, 2); return null; },
        plaster:(u, v) => { const x = u - 6.1, y = v + 2.5, c = Math.cos(.5), sn = Math.sin(.5), a = x * c + y * sn, b = -x * sn + y * c;
          if (Math.abs(a) < 2.5 && Math.abs(b) < .9){ if (Math.abs(a) < .85) return (Math.round(a * 3) + Math.round(b * 3)) % 2 ? rgb(tr, 1) : rgb(tr, 0); return rgb(fm, Math.abs(b) > .65 ? 2 : 1); }
          for (const ex of [-6.3]) if (((u - ex) / 1.8) ** 2 + ((v + 2.6) / 1) ** 2 < 1) return rgb('sakura', 1); return null; },
        sticker:(u, v) => { const X = (u - 6.3) / 1.6 * 1.25, Y = (v + 2.2) / 1.6 * 1.25 + .2, q = X * X + Y * Y - 1; if (q * q * q - X * X * Y * Y * Y < 0) return rgb(fm, Y > .4 ? 0 : 1);
          const x = u + 6.3, y = v + 2.4, r = Math.hypot(x, y), a = Math.atan2(y, x) - Math.PI / 2; if (r < 1.7 * (.6 + .4 * Math.cos(5 * a))) return rgb(tr, 0); return null; },
        cloth:(u, v) => { const k = face(u, v, 10.4, 7.6, -1.6); if (k > 1 || v > -1.6) return null; if (Math.abs(v + 1.85) < .25) return rgb(tr, 1);
          if (Math.abs(v + 3.4) < .14 || Math.abs(v + 5) < .14) return rgb(fm, 3);
          const x = Math.abs(u), d = Math.hypot(x - .75, v + 4.15); if (Math.abs(d - .75) < .17 && v < -4.15) return [70, 40, 50];
          if (Math.abs(u) < 2.4 && Math.abs(v + 3.2) < .1) return null; return rgb(fm, v > -3 ? 0 : 1); },
        domino:(u, v) => { const band = Math.abs(v - .2 + u * u * .012), tip = Math.abs(u) > 7.5 && v > 1.4 && v < 1.6 + (Math.abs(u) - 7.5) * 1.1 && Math.abs(u) < 11.5;
          if (band > 2.1 && !tip) return null; const e = eye(u, v); if (e !== 0) return e; return band > 1.6 || tip ? rgb(tr, 1) : rgb(fm, v > .9 ? 1 : 2); },
        butterfly:(u, v) => { const au = Math.abs(u), up = ((au - 5.4) / 6) ** 2 + ((v - 1.4) / 3.6) ** 2, lo = ((au - 4.4) / 4) ** 2 + ((v + 1.8) / 2.2) ** 2;
          if (up > 1 && lo > 1 && !(au < 1.2 && Math.abs(v) < 2.4)) return null; const e = eye(u, v, 1.6, 1.25); if (e !== 0) return e;
          if (Math.min(up, lo) > .72) return rgb(tr, 1); if (((au - 7) / 1.1) ** 2 + ((v - 2.4) / 1) ** 2 < 1) return rgb(tr, 0); return rgb(fm, up < .4 ? 1 : 2); },
        full:(u, v) => { const k = face(u, v); if (k > 1) return null; const e = eye(u, v); if (e !== 0) return e;
          if (Math.abs(v + 4.6) < .4 && Math.abs(u) < 2.2) return [30, 18, 24]; return k > .84 ? rgb(tr, 1) : tone(v, k); },
        khon:(u, v) => { const k = face(u, v, 10.8, 8); if (k > 1 && !(v > 3 && Math.abs(u) < 3.2 - (v - 3) * .5)) return null; const e = eye(u, v, 1.9, 1.2); if (e !== 0) return e;
          if (Math.abs(v + 4.6) < .7 && Math.abs(u) < 2.6) return rgb('scarlet', 1);
          if (v > 2.2 && v < 2.9 && Math.abs(u) > 1 && Math.abs(u) < 6.5) return [30, 18, 24];
          for (const sd of [-1, 1]){ const d = Math.hypot(u - sd * 6, v + 2.6); if (d < 2.6 && Math.sin(d * 2.6 + Math.atan2(v + 2.6, u - sd * 6) * 1.2) > .55) return rgb(tr, 0); }
          if (v > 3.2 && Math.abs(u) < 1) return rgb(tr, 0); return k > .86 ? rgb(tr, 1) : tone(v, k); },
        fox:(u, v) => { const k = face(u, v, 10.6, 6.6, -1) * (v < -5 ? 1 + (-5 - v) * .1 * Math.abs(u) / 3 : 1); if (k > 1) return null; const e = eye(u, v, 1.9, 1.05); if (e !== 0) return e;
          if (Math.abs(v + 3.4 - Math.abs(u) * .12) < .25 && Math.abs(u) > 4 && Math.abs(u) < 9.6) return rgb(tr, 2);
          if (((Math.abs(u) - 3.9) / 1.2) ** 2 + ((v - 2.5) / .7) ** 2 < 1) return rgb(tr, 0); if (Math.abs(u) < .9 && v < -3.6 && v > -5) return [30, 18, 24];
          return k > .86 ? rgb(tr, 1) : tone(v, k); },
        oni:(u, v) => { const k = face(u, v); if (k > 1) return null; const e = eye(u, v, 1.9, 1.15); if (e !== 0) return e;
          if (v > 1.7 && v < 2.9 - Math.abs(u) * .06 && Math.abs(u) < 8.5) return rgb(fm, 3);
          if (v < -3.8 && v > -5.6 && Math.abs(u) < 3.4){ return Math.abs(u) > 2.2 && v > -5 ? [250, 246, 236] : [40, 14, 18]; }
          if (Math.abs(Math.abs(u) - 7.4 + v * .3) < .45 && v < 0 && v > -5) return rgb(tr, 0); return k > .86 ? rgb(tr, 1) : tone(v, k); },
        skull:(u, v) => { const k = face(u, v); if (k > 1) return null;
          for (const ex of [-3.85, 3.85]) if (((u - ex) / 2.6) ** 2 + ((v - .2) / 2.2) ** 2 < 1) return eg && ((u - ex) / 1) ** 2 + ((v - .2) / .9) ** 2 < 1 ? rgb(eg, 0) : [22, 14, 20];
          if (v < -1.4 && v > -3.2 && Math.abs(u) < (v + 3.2) * .55) return [22, 14, 20];
          if (v < -4 && v > -6.2 && Math.abs(u) < 3.6) return Math.sin(u * 2.6) > .55 || Math.abs(v + 5.1) < .22 ? [40, 30, 34] : rgb(fm, 0);
          return k > .86 ? rgb(tr, 1) : tone(v, k); },
        veil:(u, v) => { const k = face(u, v); if (k > 1 || v > -1.4) return null; if (v > -2.1) return rgb(tr, 0);
          if (k > .9 && Math.abs(Math.sin(u * 1.6)) < .35) return rgb('gold', 0); return rgb(fm, Math.sin(u * 2 + v) > .6 ? 1 : 2); },
        visor:(u, v) => { const band = Math.abs(v - .2); if (band > 2 || Math.abs(u) > 11.2) return null;
          if (band < .5 && Math.abs(u) < 8) return eg ? rgb(eg, Math.abs(u) < 5 ? 0 : 1) : [24, 14, 22]; return band > 1.55 ? rgb(tr, 1) : rgb(fm, v > .2 ? 1 : 2); },
        tiger:(u, v) => { const k = face(u, v); if (k > 1) return null; const e = eye(u, v, 1.9, 1.1); if (e !== 0) return e;
          if (Math.sin(Math.abs(u) * 1.25 - v * .35) > .72 && Math.abs(u) > 2.4) return rgb(tr, 3); if (Math.abs(u) < .7 && v > 2) return rgb(tr, 3);
          if (Math.abs(v + 4.4) < .35 && Math.abs(u) < 2) return [30, 18, 24]; return k > .86 ? rgb(tr, 1) : tone(v, k); },
        phantom:(u, v) => { if (u < -.4) return null; const k = face(u, v); if (k > 1) return null; const e = eye(u, v); if (e !== 0) return e; return k > .84 || u < .2 ? rgb(tr, 1) : tone(v, k); },
        sun:(u, v) => { const k = face(u, v, 10.6, 7.6); if (k > 1) return null; const e = eye(u, v, 1.7, 1.2); if (e !== 0) return e;
          const a = Math.atan2(v - .2, u), r = Math.hypot(u, v - .2); if (r > 6.6 && Math.sin(a * 9) > .3) return rgb(tr, 0);
          if (Math.abs(r - 6) < .35) return rgb(tr, 1); if (Math.abs(v + 4.6) < .4 && Math.abs(u) < 1.8) return [60, 30, 10]; return tone(v, k); }
      };
      const f = FM[st] || FM.full; patch(ne, [1, 0, 0], [0, 1, 0], 1, 13, f, i => isSkin(i)); }
  }
  // ---- hair lock lines (dark gaps between clumps) + a soft sheen band ----
  if (!H.hatTop){
    const hcH = add(hc, [0, 1, -1.4]), RH = 11.2, lines = cfg.lockLines || 11, LW = Math.max(1, Math.round(K / 2.5));
    for (let k = 0; k < lines; k++){
      const a0 = k / lines * Math.PI * 2 + .2;
      let prev = null;
      for (let t = .12; t <= 1.55; t += .04){
        const a = a0 + t * .45, d = [Math.sin(t) * Math.sin(a), Math.cos(t), Math.sin(t) * Math.cos(a)];
        if (d[2] > .25 && d[1] < .62) { prev = null; continue; }           // face opening
        const p3 = add(hcH, mul(d, RH)), q = proj(cx, p3), facing = proj(cx, add(hcH, mul(d, RH + 1))).d - q.d;
        if (facing <= 0){ prev = null; continue; }
        const pt = [Math.floor(q.x), Math.floor(q.y)];
        if (prev){ const n = Math.max(Math.abs(pt[0] - prev[0]), Math.abs(pt[1] - prev[1]));
          for (let j = 0; j <= n; j++){ const x = Math.round(prev[0] + (pt[0] - prev[0]) * j / (n || 1)), y = Math.round(prev[1] + (pt[1] - prev[1]) * j / (n || 1));
            for (let w = 0; w < LW; w++){ const xx = x + w; if (xx >= 0 && y >= 0 && xx < W && y < F.h && isHair(y * W + xx)) put(xx, y, rgb(cfg.hair, t < .5 ? 2 : 3)); } } }
        prev = pt;
      }
    }
  }
  // ---- bangs: clumps over the forehead, each with a highlight side and a dark outline ----
  if (cfg.paintBangs && front > .05 && !H.hatTop){
    const n0 = nrm([0, .42, .91]), tu = [1, 0, 0], tv = nrm([0, .91, -.42]);
    const sway = (P.sway || 0) * .25, locks = cfg.paintBangs;
    const inLock = (u, v) => { for (const L of locks){ const top = 1.6, tip = L[2]; if (v > top || v < tip) continue;
        const k = (top - v) / (top - tip), cxl = L[0] + (L[1] + sway) * k * k, w = L[3] * (1 - k) + .15;
        if (Math.abs(u - cxl) < w) return [L, (u - cxl) / w]; } return null; };
    patch(n0, tu, tv, 1, 9, (u, v) => {
      const h = inLock(u, v); if (!h) return null;
      // dark rim where a neighbouring sample is outside every lock (bottom and side edges only)
      if (!inLock(u, v - .55) || (!inLock(u - .5, v) && v < 1.2) || (!inLock(u + .5, v) && v < 1.2)) return rgb(cfg.hair, 3);
      return h[1] < -.35 ? rgb(cfg.hair, 0) : h[1] > .45 ? rgb(cfg.hair, 2) : rgb(cfg.hair, 1);
    }, (i, u, v) => isSkin(i) || isHair(i));
  }
}
function hairTex(n, cfg){
  const x = n[0], y = n[1], z = n[2];
  const bang = .36 - cfg.jag * (.5 + .5 * Math.cos(x * cfg.bangF)) ;
  if (z > .1 && y < bang && Math.abs(x) < .76 - Math.max(0, -y) * .12) return false;
  if (cfg.short && y < -.55) return false;
  const a = Math.atan2(x, z);
  if (Math.sin(a * cfg.strands + y * 2.5) > .78) return {dt:1};
  if (y > .55 && Math.sin(a * 3 + 1) > .3 && z > -.2) return {dt:-1};
}
/* (v101) held weapons drawn bigger (length × WPN_BIG, sword blades a little wider) so the weapon reads at game zoom */
const WPN_BIG = 1.3;
function drawWeapon(cx, w, P, hR, hL, G, cfg = {}){
  if (!w || w === 'fist') return;
  if (w === 'bow'){
    G();
    const fwd = rotX([0, 0, 1], 0), c = add(hL, [0, 0, .6]);
    const BW = 10 * WPN_BIG, top = add(c, [0, BW, -2.6]), bot = add(c, [0, -BW, -2.6]);
    const pts = []; for (let i = 0; i <= 16; i++){ const k = i / 16, yy = BW - k * BW * 2; pts.push(add(c, [0, yy, 2.6 * (1 - (yy / BW) ** 2) - 2.6 + 2.6])); }
    const bw = cfg.wTier ?? -1, limbM = M[['wood', 'wood', 'lacquer', 'charcoal', 'teal', 'gold'][bw] || 'wood'], tipM = M[cfg.rfTier ? ['', 'rune', 'orb', 'auraGold', 'auraWhite'][cfg.rfTier] : ['wood', 'steel', 'ember', 'obsid', 'jade', 'sun'][bw] || 'wood'];
    for (let i = 0; i < pts.length - 1; i++) cap(cx, pts[i], pts[i + 1], .9 + (i > 6 && i < 10 ? .25 : 0), .9, i < 2 || i > pts.length - 4 ? tipM : limbM, {});
    G(); const pull = add(hR, [0, 0, 0]); const mid = P.draw > 0 ? [c[0], c[1], c[2] - 2.6 - 6 * P.draw] : [c[0], c[1], c[2] - 2.6];
    if (P.draw > 0){ mid[0] = (pull[0] + c[0]) / 2; mid[1] = (pull[1] + c[1]) / 2; mid[2] = pull[2]; }
    const tp = pts[0], bt = pts[pts.length - 1];
    line(cx, tp, mid, M.white, {t:1}); line(cx, mid, bt, M.white, {t:1});
    if (P.arrow){ G(); line(cx, mid, add(c, [0, 0, 6]), M.wood, {t:1}); dot(cx, add(c, [0, 0, 6.5]), M.steel, 1); }
    (cx.wsegs || (cx.wsegs = [])).push([proj(cx, tp), proj(cx, bt)]);   // where the weapon is in this frame (refine glow)
    void fwd; return;
  }
  if (w === 'shuriken'){
    // (v184) a ninja's throwing star, held flat between the fingers: four leaf blades with bright edges round a ringed
    // hole; it leaves the hand at the release of a throw (P.thrown) and a fresh one is back in the hand for the next
    if (P.thrown) return;
    const st = cfg.wTier ?? -1, met = M[['steel', 'steel', 'ember', 'obsid', 'jade', 'sun'][st] || 'steel'];
    let dir0 = P.wdir || rotX(rotX([0, -1, 0], P.armR + P.wpn), P.lean); dir0 = nrm(dir0);
    const R = (4 + Math.max(0, st) * .16) * WPN_BIG, c = add(hR, mul(dir0, R * .55)), sp = .4 + (P.spinStar || 0);
    // the star is a flat disc: lay it in whichever plane the camera sees most of (it reads as a star, never as a sliver)
    const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], p0 = proj(cx, c); let best = null, ba = -1;
    for (const [i, j] of [[0, 1], [0, 2], [1, 2]]){ const pa = proj(cx, add(c, AX[i])), pb = proj(cx, add(c, AX[j]));
      const ar = Math.abs((pa.x - p0.x) * (pb.y - p0.y) - (pa.y - p0.y) * (pb.x - p0.x)); if (ar > ba){ ba = ar; best = [AX[i], AX[j]]; } }
    const dir = nrm(add(best[0], mul(best[1], .25))), wv = nrm(add(best[1], mul(best[0], -.25)));
    for (let k = 0; k < 4; k++){ const a = sp + k * Math.PI / 2, u = add(mul(dir, Math.cos(a)), mul(wv, Math.sin(a)));
      const tip = add(c, mul(u, R)); G(); cap(cx, add(c, mul(u, R * .18)), tip, R * .26, .18, met, {rz:.35, tex:(n, lo, q, t) => (Math.abs(n[0]) > .7 ? {t:0} : {t:2})}); }
    G(); ell(cx, c, R * .24, R * .24, M[st >= 3 ? 'gold' : 'scarlet'] || met); G(); ell(cx, c, R * .1, R * .1, M.charcoal || met);
    (cx.wsegs || (cx.wsegs = [])).push([proj(cx, add(c, mul(dir, -R))), proj(cx, add(c, mul(dir, R)))]);
    return;
  }
  const wt = cfg.wTier ?? -1, BL = ['steel', 'steel', 'ember', 'obsid', 'jade', 'sun'], SH = ['wood', 'wood', 'lacquer', 'charcoal', 'teal', 'gold'], ORB = ['orb', 'rune', 'ember', 'auraViolet', 'jade', 'sun'];
  const RFM = ['', 'rune', 'orb', 'auraGold', 'auraWhite'], rft = cfg.rfTier || 0;   // refine glow: blue → violet → gold → radiant
  const blade = M[BL[wt] || 'steel'],   // (v166) a refined blade stays its own metal (it used to turn into glowing white at +13 and vanish into a blob of light); the glow is laid over it by refinefx.js
        _rfm = RFM[rft], guard = M[wt === 0 ? 'leather' : wt >= 3 ? 'gold' : 'gold'];
  // (v159) one-handed blades and rods are visibly smaller than their two-handed kin: a 1H sword ×0.88, a greatsword ×1.45;
  // a rod ×0.72, a longstaff ×1.3; the katana is its own long single blade
  const kat = w === 'dagger' && !!cfg.katana, two = !!cfg.twoHand || kat;
  const len = kat ? (19.5 + Math.max(0, wt) * .5) * WPN_BIG : ((w === 'sword' ? 17 : w === 'staff' ? 20 : 9.5) + Math.max(0, wt) * (w === 'sword' ? .7 : w === 'staff' ? .5 : .3)) * (w === 'sword' ? (two ? 1.45 : .88) : w === 'staff' ? (two ? .86 : .5) : 1) * WPN_BIG * (w === 'dagger' ? 1.15 : 1);   // daggers a touch more: they were the hardest to see
  let dir = P.wdir || rotX(rotX([0, -1, 0], P.armR + P.wpn), P.lean);
  if (w === 'staff' && P.ring >= 0) dir = nrm([0, 1, .25]);
  const base = add(hR, mul(dir, w === 'staff' ? -6 : -.8)), tip = add(hR, mul(dir, len));
  (cx.wsegs || (cx.wsegs = [])).push(w === 'staff' ? [proj(cx, add(tip, mul(dir, -.4))), proj(cx, add(tip, mul(dir, 3.2)))]   // (v159) a staff glows at its head only, never along the shaft
    : [proj(cx, add(base, mul(dir, kat ? 2 : 1))), proj(cx, tip)]);   // the blade in this frame
  G();
  if (w === 'sword' && cfg.axe){
    // (v164) the merchant line's axe: a wooden haft wrapped at the grip, an iron head with a curved bit (a bearded
    // hand axe in one hand; a broad double-bit war axe in two), a steel cap on the butt
    const wvR = [-dir[1], dir[0], 0], wv = Math.hypot(...wvR) < .25 ? [1, 0, 0] : nrm(wvR), hl = len * (two ? 1.02 : .82), grip = two ? 6.4 : 3.6;
    cap(cx, add(base, mul(dir, -grip)), add(base, mul(dir, hl)), two ? 1.05 : .9, two ? .95 : .82, M[SH[wt] || 'wood'], {tex:(n, lo, q, t) => (t < grip / (hl + grip) && Math.abs(Math.sin(t * 40)) < .35 ? {m:M.leather, t:1} : undefined)});
    G(); ell(cx, add(base, mul(dir, -grip - .6)), 1.1, 1.1, M.steel);
    const hd = add(base, mul(dir, hl - (two ? 2.6 : 2))), bw = two ? 6.6 : 5, bh = two ? 5.4 : 3.8, metal = blade;
    for (const sd of (two ? [-1, 1] : [1])){
      G(); cap(cx, add(hd, mul(wv, sd * .6)), add(hd, mul(wv, sd * bw * .55)), two ? 1.5 : 1.2, two ? 1.1 : .9, metal, {tex:() => ({t:1})});   // the cheek
      const edge = []; for (let i = 0; i <= 8; i++){ const u = -1 + i / 4; edge.push(add(add(hd, mul(wv, sd * bw * (1 - .22 * u * u))), mul(dir, u * bh))); }
      G(); for (let i = 0; i < edge.length; i++){ cap(cx, add(hd, mul(wv, sd * bw * .45)), edge[i], .55, .5, metal, {rz:.45, tex:() => ({t:1})}); }
      G(); for (let i = 0; i < edge.length - 1; i++) cap(cx, edge[i], edge[i + 1], .5, .5, M.white, {rz:.4, tex:() => ({t:0})});
    }
    if (!two){ G(); cap(cx, add(hd, mul(wv, -.6)), add(add(hd, mul(wv, -2.6)), mul(dir, -.6)), .9, .5, M.steel, {}); }   // a short spike on the back
    G(); ell(cx, add(hd, mul(dir, two ? 2.6 : 2)), 1, 1, M.steel);
  } else if (w === 'sword'){
    // (v159) a real sword, not a stick: a FLAT blade (laid as thin strips across its width) with bevelled bright edges, a
    // darker fuller down the middle and a point; a short ricasso, a crossguard with quillons bent toward the blade, a
    // wrapped grip and a pommel. Arming sword: blade about 6.5 widths long, guard 3 blade-widths, grip one hand.
    // Greatsword: wider and longer, a long ricasso, a two-hand grip and a heavier guard.
    const wvR = [dir[1] * 0 - dir[2] * 0, dir[2] * 1 - dir[0] * 0, dir[0] * 0 - dir[1] * 1];   // dir × [0,0,1]
    const wv = Math.hypot(...wvR) < .25 ? [1, 0, 0] : nrm(wvR), tv = nrm([dir[1] * wv[2] - dir[2] * wv[1], dir[2] * wv[0] - dir[0] * wv[2], dir[0] * wv[1] - dir[1] * wv[0]]);
    const hw0 = (two ? 2.25 : 1.6) + Math.max(0, wt - 2) * .07, ric = two ? 2.8 : 1.2, gw = two ? 6 : 4.6, gl = two ? 6.4 : 3.8;
    const b0 = add(base, mul(dir, ric)), BL = len - ric;
    const half = t => (t < .82 ? hw0 * (1 - t * .16) : hw0 * .87 * Math.max(0, (1 - t) / .18));   // a long parallel blade, then the point
    // grip, pommel
    cap(cx, add(base, mul(dir, -gl)), add(base, mul(dir, -.3)), two ? 1.0 : .9, two ? .95 : .85, M.leather, {tex:(n, lo, q, t) => (Math.abs(Math.sin(t * (two ? 30 : 18) + n[0] * 2)) < .32 ? {m:M[wt >= 3 ? 'gold' : 'charcoal'], t:1} : undefined)});
    G(); ell(cx, add(base, mul(dir, -gl - .8)), two ? 1.6 : 1.25, two ? 1.6 : 1.25, guard, {});
    // crossguard with quillons curving toward the blade
    G(); for (const sd of [-1, 1]){ const g0 = add(base, mul(wv, sd * .4)), g1 = add(base, mul(wv, sd * gw * .7)), g2 = add(add(base, mul(wv, sd * gw)), mul(dir, two ? 1.4 : 1));
      cap(cx, g0, g1, two ? 1.0 : .82, two ? .85 : .7, guard, {}); cap(cx, g1, g2, two ? .85 : .7, .55, guard, {}); ell(cx, g2, two ? .95 : .75, two ? .95 : .75, guard); }
    G(); ell(cx, base, two ? 1.4 : 1.1, two ? 1.4 : 1.1, wt >= 2 ? M.gem : guard);
    // ricasso (unsharpened, a little narrower), then the blade in strips across its width
    G(); cap(cx, add(base, mul(dir, .3)), b0, hw0 * .62, hw0 * .72, blade, {rz:.5, tex:() => ({t:2})});
    const strips = two ? 9 : 7, rows = 9;
    for (let i = 0; i < strips; i++){ const u = -1 + 2 * i / (strips - 1), au = Math.abs(u);
      const tone = au > .78 ? 0 : au < .2 ? 2 : 1, mat = wt === 3 && au < .2 ? M.ember : blade, th = .42 * (1 - au * .55);
      let p0 = add(b0, mul(wv, u * half(0)));
      for (let r = 1; r <= rows; r++){ const t = r / rows, p1 = add(add(b0, mul(dir, BL * t)), mul(wv, u * half(t)));
        cap(cx, p0, p1, th, th, mat, {tex:() => ({t:tone})}); p0 = p1; } }
    void tv;
  } else if (kat){  } else if (kat){
    // the katana: a long cord-wrapped hilt for two hands, a round guard, a slim blade with a gentle curve and a pale edge
    const up = nrm(Math.abs(dir[1]) > .95 ? [0, 0, 1] : [-dir[0] * dir[1], 1 - dir[1] * dir[1], -dir[2] * dir[1]]);
    cap(cx, add(base, mul(dir, -6.2)), add(base, mul(dir, -.2)), 1.0, .95, M.charcoal, {tex:(n, lo, q, t) => (Math.abs(Math.sin(t * 22)) < .35 ? {m:M[wt >= 3 ? 'gold' : 'white'], t:1} : undefined)});
    G(); ell(cx, add(base, mul(dir, -6.5)), 1.05, 1.05, M[wt >= 3 ? 'gold' : 'steel']);
    G(); ell(cx, add(base, mul(dir, .1)), 2.3, 2.3, M[wt >= 3 ? 'gold' : 'charcoal'], {rz:.45});
    G(); const k0 = add(base, mul(dir, .7)), k1 = add(add(base, mul(dir, len * .55)), mul(up, .55)), k2 = add(add(base, mul(dir, len)), mul(up, 1.5));
    const edge = (n, lo, q, t) => (q < .3 ? {m:M.white, t:0} : undefined);
    cap(cx, k0, k1, .82, .72, blade, {tex:edge}); cap(cx, k1, k2, .72, .2, blade, {tex:edge});
  } else if (w === 'dagger' && cfg.claw){
    // twin claws (กรงเล็บคู่): three long blades fanned out from a knuckle guard on the back of the fist
    const sd = nrm(Math.abs(dir[1]) > .9 ? [1, 0, 0] : [-dir[1], dir[0], 0]);
    ell(cx, hR, 1.35, 1.1, M[wt >= 3 ? 'gold' : 'steel'], {});
    for (const k of [-1, 0, 1]){ G(); const b0 = add(hR, mul(sd, k * .95)), t0 = add(add(b0, mul(dir, len * 1.25)), mul(sd, k * .7)); cap(cx, b0, t0, .5, .22, blade, {}); }
  } else if (w === 'dagger'){
    cap(cx, add(base, mul(dir, -1.5)), base, .9, .9, M.wood, {});
    G(); cap(cx, add(base, mul(dir, .8)), tip, 1.3, .6, blade, {});
  } else if (w === 'staff'){
    cap(cx, base, tip, two ? 1.1 : .85, two ? 1.1 : .85, M[SH[wt] || 'wood'], {tex:(n, lo, q, t) => (t > .78 && t < .84 ? {m:M.gold} : undefined)});   // (v159) the shaft never takes the refine glow
    G(); for (let a = 0; a < 6.28; a += .9) line(cx, tip, add(tip, rotX(rotY([0, 3.2, 1.6], a), 0)), M.gold, {t:1});
    G(); ell(cx, add(tip, mul(dir, 1.4)), (two ? .8 : 0) + 2.6 + Math.max(0, wt - 2) * .25 + (P.glow >= 0 && P.ring >= 0 ? (P.glow % 2) * .6 : 0), 2.6 + Math.max(0, wt - 2) * .25, M[rft >= 3 ? RFM[rft] : ORB[wt] || 'orb'], {});
  }
}

/* ---------- characters ---------- */
// anime bang shapes for the painted forehead: [root u, sideways bend, tip v, half width]
const BANG_SWEEP = [[-6.4, -1.4, -3.6, 1.6], [-3.8, -.7, -2.6, 1.7], [-1.2, .1, -3.0, 1.8], [1.4, .8, -2.4, 1.7], [3.9, 1.2, -2.9, 1.6], [6.4, 1.5, -3.8, 1.5]];
const BANG_SHARP = [[-6.6, -2.2, -4.4, 1.4], [-3.6, -1.4, -3.8, 1.5], [-.6, -.2, -4.6, 1.6], [2.4, 1.2, -3.4, 1.5], [5.4, 2.2, -4.2, 1.4]];
const BANG_SIDE = [[-6.2, .6, -4.8, 1.8], [-3.2, 1.4, -4.2, 1.9], [-.2, 2.2, -3.6, 1.9], [2.8, 2.8, -2.8, 1.7], [5.8, 3.0, -2.2, 1.5]];
const BANG_SOFT = [[-5.8, -.8, -3.0, 2.0], [-2.2, -.2, -2.4, 2.1], [1.6, .4, -2.6, 2.1], [5.2, 1.0, -3.0, 1.9]];
const CHARS = {
  // ages: the villager is a 15-year-old (a little shorter); every class is a young adult of about 18
  // ages: the villager is a 15-year-old (a little shorter); every class is a young adult of about 18.
  // Modern fantasy look: no ancient helmets or tall hats — spiky anime hair, fitted jackets with trims and zips,
  // boots, gloves, scarves and long coats. A light Thai accent survives in the colours and small details.
  novice:{name:'ชาวบ้าน', en:'Villager', bodyScale:.9, paint:true, hair:'hairBrown', iris:'irisBr', top:'tech', sleeve:'navy', forearm:'skin', pants:'navy', boots:'leather', bootCuff:'tech', belt:'leather',
    weapon:'dagger', aura:'auraWhite', pouch:true, jag:.22, bangF:14, strands:11, spikes:16, spikeLen:4.8, bangs:true, paintBangs:BANG_SWEEP, crown:4, lockLines:12,
    topTex:n => (n[1] > .42 ? {m:M.navy} : n[2] > .5 && Math.abs(n[0]) < .04 && n[1] > -.4 ? {m:M.steel} : undefined)},
  // นักดาบ: navy fitted jacket with red trim and a steel zip, black gloves, red headband, steel shoulder guard
  blade:{name:'นักดาบ', en:'Swordsman', paint:true, hair:'hairBlack', iris:'irisBr', top:'navy', sleeve:'navy', forearm:'charcoal', handWrap:'charcoal', pants:'charcoal', boots:'charcoal', bootCuff:'scarlet', belt:'leather',
    weapon:'sword', aura:'auraGold', hat:'band', bandMat:'scarlet', pauldron:'steel', jag:.24, bangF:14, strands:11, spikes:22, spikeLen:6.2, bangs:true, paintBangs:BANG_SHARP, crown:5, lockLines:12,
    topTex:n => (n[2] > .5 && Math.abs(n[0]) < .045 && n[1] > -.4 ? {m:M.steel} : n[1] > .44 || n[1] < -.4 && n[1] > -.5 ? {m:M.scarlet} : undefined)},
  // นักเวท: plum hooded-look long coat with silver trims, black inner shirt, glowing rune buckle
  rune:{name:'นักเวท', en:'Mage', paint:true, hair:'hairNavy', iris:'irisVi', top:'plum', sleeve:'plum', forearm:'charcoal', pants:'charcoal', boots:'charcoal', bootCuff:'plum', belt:'charcoal', skirt:[11.6, 1.1, 6.4, 9.2, 'plum', 'tech'], skirtStripes:false,
    weapon:'staff', aura:'auraViolet', necklace:true, jag:.16, bangF:13, strands:10, spikes:14, spikeLen:4.6, bangs:true, paintBangs:BANG_SIDE, crown:4, ringMat:'rune', lockLines:11,
    topTex:n => (n[2] > .45 && Math.abs(n[0]) < .16 && n[1] > -.38 ? {m:M.charcoal} : Math.abs(Math.abs(n[0]) - .17) < .03 ? {m:M.tech} : undefined)},
  // พราน: olive hunting jacket, teal scarf, fingerless gloves, quiver and boots
  ranger:{name:'พราน', en:'Hunter', paint:true, hair:'hairAuburn', iris:'irisGr', top:'greenD', sleeve:'greenD', forearm:'skin', handWrap:'leather', pants:'brownCl', boots:'leather', bootCuff:'greenD', belt:'leather',
    weapon:'bow', aura:'auraGreen', quiver:true, pouch:true, ponytail:true, jag:.18, bangF:12, strands:10, spikes:16, spikeLen:5, bangs:true, paintBangs:BANG_SWEEP, crown:4,
    topTex:n => (n[1] > .4 ? {m:M.teal} : n[2] > .5 && Math.abs(n[0]) < .04 && n[1] > -.4 ? {m:M.leather} : undefined)},
  // ขุนศึก: black-and-gold armoured coat, steel pauldrons, crimson cape, no helmet
  warlord:{name:'ขุนศึก', en:'Warlord', paint:true, mount:'elephant', hair:'hairBlack', iris:'irisBr', top:'charcoal', sleeve:'charcoal', forearm:'steel', armband:'gold', handWrap:'charcoal', pants:'charcoal', boots:'steel', bootCuff:'gold', belt:'gold', pauldron:'steel',
    weapon:'sword', aura:'auraGold', cape:'scarlet', capeTex:'gold', jag:.26, bangF:14, strands:11, spikes:24, spikeLen:6.6, bangs:true, paintBangs:BANG_SHARP, crown:6, lockLines:12,
    topTex:n => (n[2] > .3 && Math.abs(n[0]) < .5 && n[1] > -.4 && n[1] < .48 ? (Math.abs(n[0]) < .05 || Math.abs(n[1] - .05) < .04 ? {m:M.gold} : {m:M.steel}) : n[1] > .48 ? {m:M.gold} : undefined)},
  // มหาโหรา: white tech long coat with gold lines, navy inner, star pendant
  astro:{name:'มหาโหรา', en:'Astromancer', paint:true, hair:'hairSilver', iris:'irisVi', top:'tech', sleeve:'tech', forearm:'navy', armband:'gold', pants:'navy', boots:'navy', bootCuff:'gold', belt:'gold', skirt:[11.6, .9, 6.4, 9.4, 'tech', 'gold'],
    weapon:'staff', aura:'auraViolet', necklace:true, jag:.14, bangF:12, strands:10, spikes:14, spikeLen:4.6, bangs:true, paintBangs:BANG_SIDE, crown:0, ringMat:'rune', lockLines:11,
    topTex:n => (n[2] > .45 && Math.abs(n[0]) < .14 && n[1] > -.38 ? {m:M.navy} : Math.abs(Math.abs(n[0]) - .16) < .025 || n[1] > .48 ? {m:M.gold} : undefined)},
  // พรานพงไพร: dark green ranger coat, tiger-pattern scarf and cape, gloves, steel bracers
  warden:{name:'พรานพงไพร', en:'Wildwarden', paint:true, hair:'hairBlack', iris:'irisGr', top:'greenD', sleeve:'greenD', forearm:'steel', handWrap:'charcoal', pants:'charcoal', boots:'leather', bootCuff:'tigerFur', belt:'leather',
    weapon:'bow', aura:'auraGreen', cape:'tigerFur', capeTex:'tiger', quiver:true, ponytail:true, jag:.2, bangF:12, strands:10, spikes:18, spikeLen:5.6, bangs:true, paintBangs:BANG_SWEEP, crown:4,
    topTex:n => (n[1] > .4 ? {m:M.tigerFur} : n[2] > .5 && Math.abs(n[0]) < .04 && n[1] > -.4 ? {m:M.steel} : undefined)},
  // นักมวย: red sleeveless hoodie top, fight shorts, hand wraps, red headband
  muay:{name:'นักมวย', en:'Muay Fighter', paint:true, hair:'hairBlack', iris:'irisBr', top:'scarlet', sleeve:'skin', forearm:'skin', handWrap:'tech', pants:'charcoal', boots:'charcoal', bootCuff:'scarlet', belt:'tech',
    weapon:'fist', aura:'auraGold', hat:'band', bandMat:'scarlet', jag:.26, bangF:14, strands:11, spikes:22, spikeLen:6, bangs:true, paintBangs:BANG_SHARP, crown:5,
    topTex:n => (n[2] > .5 && Math.abs(n[0]) < .04 ? {m:M.tech} : n[1] > .45 ? {m:M.charcoal} : undefined)},
  // ปรมาจารย์มวย: black fight jacket with gold lines, gold wraps and headband
  grandmaster:{name:'ปรมาจารย์มวย', en:'Muay Grandmaster', paint:true, hair:'hairBlack', iris:'irisBr', top:'charcoal', sleeve:'skin', forearm:'skin', armband:'gold', handWrap:'gold', pants:'charcoal', boots:'charcoal', bootCuff:'gold', belt:'gold',
    weapon:'fist', aura:'auraGold', hat:'band', bandMat:'gold', jag:.24, bangF:13, strands:10, spikes:24, spikeLen:6.6, bangs:true, paintBangs:BANG_SHARP, crown:6,
    topTex:n => (Math.abs(n[0]) < .045 || n[1] > .45 ? {m:M.gold} : undefined)},
  // หมอยา: teal medic jacket over white, bag of herbs, short cape
  healer:{name:'หมอยา', en:'Herbalist', paint:true, hair:'hairBrown', iris:'irisGr', top:'teal', sleeve:'teal', forearm:'tech', pants:'tech', boots:'leather', bootCuff:'teal', belt:'leather', skirt:[11.4, 1, 6.2, 8.2, 'teal', 'tech'], skirtStripes:false,
    weapon:'staff', aura:'auraGreen', pouch:true, necklace:true, jag:.16, bangF:12, strands:10, spikes:12, spikeLen:4.2, bangs:true, paintBangs:BANG_SOFT, crown:0, ringMat:'rune',
    topTex:n => (n[2] > .5 && Math.abs(n[0]) < .14 && n[1] > -.4 ? {m:M.tech} : undefined)},
  // ราชแพทย์: white long coat with teal and gold lines
  physician:{name:'ราชแพทย์', en:'Royal Physician', paint:true, hair:'hairAuburn', iris:'irisGr', top:'tech', sleeve:'tech', forearm:'teal', armband:'gold', pants:'teal', boots:'tech', bootCuff:'gold', belt:'gold', skirt:[11.6, .9, 6.4, 9.4, 'tech', 'teal'],
    weapon:'staff', aura:'auraGreen', necklace:true, jag:.14, bangF:12, strands:10, spikes:12, spikeLen:4.2, bangs:true, paintBangs:BANG_SOFT, crown:0, ringMat:'rune',
    topTex:n => (n[2] > .45 && Math.abs(n[0]) < .12 && n[1] > -.38 ? {m:M.teal} : Math.abs(Math.abs(n[0]) - .14) < .025 || n[1] > .48 ? {m:M.gold} : undefined)},
  // นักย่อง: charcoal hoodie, scarlet scarf, twin daggers, light boots
  rogue:{name:'นักย่อง', en:'Rogue', paint:true, hair:'hairNavy', iris:'irisBr', top:'charcoal', sleeve:'charcoal', forearm:'charcoal', handWrap:'charcoal', pants:'charcoal', boots:'leather', bootCuff:'charcoal', belt:'scarlet',
    weapon:'dagger', twin:true, aura:'auraViolet', jag:.24, bangF:14, strands:11, spikes:20, spikeLen:5.6, bangs:true, paintBangs:BANG_SIDE, crown:4,
    topTex:n => (n[1] > .42 ? {m:M.scarlet} : n[2] > .5 && Math.abs(n[0]) < .04 && n[1] > -.4 ? {m:M.steel} : undefined)},
  // จอมโจรเงา: black stealth suit with face mask and a tiger-striped scarf cape
  bandit:{name:'จอมโจรเงา', en:'Shadow Bandit', paint:true, hair:'hairBlack', iris:'irisVi', top:'charcoal', sleeve:'charcoal', forearm:'charcoal', armband:'plum', handWrap:'charcoal', pants:'charcoal', boots:'charcoal', bootCuff:'plum', belt:'plum',
    weapon:'dagger', twin:true, aura:'auraViolet', mask:'charcoal', cape:'tigerFur', capeTex:'tiger', jag:.24, bangF:14, strands:11, spikes:20, spikeLen:5.8, bangs:true, paintBangs:BANG_SHARP, crown:5,
    topTex:n => (n[1] > .44 ? {m:M.plum} : undefined)},
  // ผู้อัญเชิญ: cream mystic coat with gold lines, glowing rune collar, navy short cape, conch staff
  summoner:{name:'ผู้อัญเชิญ', en:'Summoner', paint:true, hair:'hairBlonde', iris:'irisBl', top:'cream', sleeve:'cream', forearm:'navy', armband:'gold', handWrap:'navy', pants:'navy', boots:'leather', bootCuff:'gold', belt:'gold', skirt:[11.6, 1.4, 6.2, 8.8, 'cream', 'gold'],
    weapon:'staff', aura:'auraGold', cape:'navy', necklace:true, jag:.18, bangF:13, strands:10, spikes:16, spikeLen:5, bangs:true, paintBangs:BANG_SIDE, crown:4, ringMat:'rune', lockLines:11,
    topTex:n => (n[1] > .46 ? {m:M.rune} : n[2] > .45 && Math.abs(n[0]) < .045 && n[1] > -.4 ? {m:M.gold} : Math.abs(Math.abs(n[0]) - .2) < .025 ? {m:M.navy} : undefined)},
  // จอมอัญเชิญหิมพานต์: white-and-scarlet royal coat, gold pauldrons, long scarlet cape with a gold hem
  sovereign:{name:'จอมอัญเชิญหิมพานต์', en:'Himmapan Sovereign', paint:true, hair:'hairBlonde', iris:'irisBl', top:'tech', sleeve:'scarlet', forearm:'tech', armband:'gold', handWrap:'gold', pants:'charcoal', boots:'charcoal', bootCuff:'gold', belt:'gold', pauldron:'gold', skirt:[11.6, .9, 6.4, 9.4, 'scarlet', 'gold'],
    weapon:'staff', aura:'auraGold', cape:'scarlet', capeTex:'gold', necklace:true, jag:.18, bangF:13, strands:10, spikes:18, spikeLen:5.4, bangs:true, paintBangs:BANG_SIDE, crown:5, ringMat:'rune', lockLines:11,
    topTex:n => (n[1] > .46 ? {m:M.gold} : n[2] > .4 && Math.abs(n[0]) < .16 && n[1] > -.4 ? (Math.abs(n[0]) < .04 ? {m:M.gold} : {m:M.scarlet}) : undefined)},
  // ครูวายรา: a forest hermit (ฤๅษี) in an ochre robe and a tiger-striped tall hat, white beard
  sage:{name:'ครูวายรา', en:'Master Vayra (NPC)', paint:true, hair:'hairWhite', iris:'irisBr', spikes:6, spikeLen:2.2, top:'ochre', sleeve:'ochre', forearm:'ochre', pants:'ochre', boots:'wood', belt:'tigerFur', skirt:[11.6, .8, 6.2, 8.6, 'ochre', 'tigerFur'],
    weapon:'staff', beard:'hairWhite', backHair:true, hat:'hermit', jag:.04, bangF:5, strands:6, ringMat:'rune',
    topTex:n => (Math.abs(n[0] * .75 + n[1] * .66 - .05) < .15 ? (Math.sin(n[0] * 14 - n[1] * 10) > .4 ? {m:M.hairBlack, t:2} : {m:M.tigerFur}) : undefined)},
  // ป้าบัวคำ: diagonal gold sabai over a crimson blouse, striped pha sin skirt, hair bun with a gold pin
  aunt:{name:'ป้าบัวคำ', en:'Auntie Buakham (NPC)', paint:true, hair:'hairBlack', iris:'irisBr', spikes:4, spikeLen:1.6, top:'crimson', sleeve:'crimson', pants:'sarong', boots:'wood', belt:'gold', skirt:[11.4, .9, 6.6, 8.6, 'sarong', 'gold'], skirtStripes:true, bun:true, necklace:true, jag:.05, bangF:6, strands:7,
    topTex:n => (Math.abs(n[0] * .78 + n[1] * .62 - .02) < .17 ? {m:M.gold, dt:Math.sin(n[0] * 30) > .5 ? 1 : 0} : n[1] < -.45 && n[1] > -.64 ? {m:M.gold} : undefined)}
};
/* every class gets its own head: a hair colour, eye colour and hair shape no other class shares */
const CLASS_LOOK = {
  novice:{hair:'hairBrown', iris:'irisBr'},
  blade:{hair:'hairBlack', iris:'irisBr'},                                                                 // short spikes + red band
  warlord:{hair:'maroon', iris:'irisRd', backHair:true, backLen:12, backW:9.4, spikes:24, spikeLen:6.8, crown:6},   // long war mane
  rune:{hair:'hairNavy', iris:'irisVi', sideLocks:10},                                                      // side locks
  astro:{hair:'hairViolet', iris:'irisGd', backHair:true, backLen:15, backW:9.8, spikes:10, spikeLen:3.4, crown:0, paintBangs:BANG_SOFT, jag:.12},   // long flowing
  ranger:{hair:'hairAuburn', iris:'irisGr'},                                                                // ponytail
  warden:{hair:'hairGreen', iris:'irisGd', spikes:26, spikeLen:6.6, crown:6, jag:.26},                     // wild spikes + ponytail
  muay:{hair:'hairCrimson', iris:'irisBr', spikes:28, spikeLen:3.4, crown:7, paintBangs:BANG_SHARP},        // short crop + band
  grandmaster:{hair:'hairWhite', iris:'irisRd', bun:true, spikes:14, spikeLen:3, crown:0, paintBangs:BANG_SWEEP},   // white topknot
  healer:{hair:'hairPink', iris:'irisGr', sideLocks:8, paintBangs:BANG_SOFT},                               // soft bob
  physician:{hair:'hairTeal', iris:'irisBl', backHair:true, backLen:10, backW:9.4, spikes:10, spikeLen:3.2, crown:0},   // neat long
  rogue:{hair:'hairAsh', iris:'irisRd', spikes:18, spikeLen:5.4, paintBangs:BANG_SIDE, sideLocks:6},        // ash side-swept
  bandit:{hair:'hairSilver', iris:'irisVi'},                                                                // silver + mask
  summoner:{hair:'hairBlonde', iris:'irisBl', sideLocks:9},
  sovereign:{hair:'hairGold', iris:'irisGd', backHair:true, backLen:13, backW:9.6, crown:5}                 // radiant long gold
};
for (const k in CLASS_LOOK) if (CHARS[k]) Object.assign(CHARS[k], CLASS_LOOK[k]);
/* worn gear on the hero: each head / armour / weapon / accessory item maps to look overrides on the class cfg.
   heroKey(job, gear) composes a derived CHARS entry once per combination and returns its key for SPR.sheet. */
const GEAR_LOOK = {
  h_cloth:{hat:'band', bandMat:'cloth'}, h_ngob:{hat:'ngob'}, h_leather:{hat:'cap', capMat:'leather'},
  h_lotus:{hat:'crest', bandMat:'steel', crestMat:'steel', crestN:3}, h_mongkhon:{hat:'mongkhon', bandMat:'scarlet'},
  h_chada:{hat:'crest', bandMat:'charcoal', crestMat:'gold', crestN:3}, h_goldchada:{hat:'crest', bandMat:'gold', crestMat:'gold', crestN:5, crestGem:true},
  a_cotton:{}, a_buffalo:{chest:'leather', chestTex:'vest'}, a_rattan:{chest:'straw', chestTex:'weave', chestTrim:'wood'},
  a_padded:{chest:'crimson', chestTex:'quilt', chestTrim:'leather', pauldron:'leather'}, a_scale:{chest:'steel', chestTex:'scale', chestTrim:'charcoal', pauldron:'steel'},
  a_yantra:{runeLines:true, armband:'rune'}, a_naga:{chest:'teal', chestTex:'scale', chestTrim:'gold', pauldron:'gold'},
  a_suvarna:{chest:'gold', chestTex:'scale', chestTrim:'scarlet', pauldron:'gold', cape:'scarlet', capeTex:'gold'},
  x_ring:{fingerRing:'gold'}, x_bead:{necklace:true, neckMat:'crimson'}, x_amulet:{pendant:'jade'}, x_charm:{armband:'scarlet'},
  x_moon:{fingerRing:'rune'}, x_tiger:{pendant:'tusk'}, x_naga:{pendant:'jade', neckMat:'gold'}, x_sun:{pendant:'sun', neckMat:'gold'}
};
CHARS.warlord && (CHARS.warlord.twoHand = true);   // the Warlord's own weapon is a two-handed war sword
const FIST_WRAP = ['leather', 'steel', 'scarlet', 'obsid', 'teal', 'gold'];
/* the hero's own look (chosen when the character is made): sex · hair style · hair colour.
   Sex is looks only: women get lashes, a slimmer frame, a pleated skirt over leggings where the class has none. */
const HAIR_RESET = {spikes:12, spikeLen:3.6, jag:.14, paintBangs:BANG_SOFT, crown:0, ponytail:false, backHair:false, backLen:0, backW:0, sideLocks:0, twintail:false, bun:false};
const HS = o => ({...HAIR_RESET, ...o});
const HAIR_M = [{},                                                                                   // 0 class spikes (the class's own hair)
  {spikes:12, spikeLen:3.6, jag:.14, paintBangs:BANG_SOFT, crown:0, ponytail:false, backHair:false},   // 1 short & soft (as before)
  {spikes:18, spikeLen:5.2, jag:.2, paintBangs:BANG_SIDE, crown:3, ponytail:true, backHair:false},   // 2 tied back (as before)
  HS({backHair:true, backLen:12, backW:9.4, spikes:20, spikeLen:5.6, crown:4, jag:.2, paintBangs:BANG_SHARP}),   // 3 long mane
  HS({bun:true, spikes:14, spikeLen:3, paintBangs:BANG_SWEEP}),                                       // 4 topknot
  HS({spikes:28, spikeLen:6.6, crown:7, jag:.26, paintBangs:BANG_SHARP}),                             // 5 wild spikes
  HS({spikes:16, spikeLen:4.6, jag:.16, paintBangs:BANG_SIDE, sideLocks:7}),                          // 6 side-swept
  HS({spikes:28, spikeLen:2.4, jag:.08, paintBangs:BANG_SHARP}),                                      // 7 short crop
  HS({spikes:14, spikeLen:3.4, paintBangs:BANG_SWEEP, sideLocks:10})];                                // 8 long side locks
const HAIR_F = [{backHair:true, backLen:17, backW:10.2, sideLocks:15, ponytail:false, spikes:9, spikeLen:3, jag:.12, paintBangs:BANG_SOFT, crown:0, deco:['ribbon', 'scarlet']},   // 0 long & loose
  {twintail:true, sideLocks:9, ponytail:false, backHair:false, spikes:10, spikeLen:3.2, jag:.12, paintBangs:BANG_SWEEP, crown:0, deco:['hairpin', 'hairPink']},            // 1 twin tails
  {ponytail:true, sideLocks:11, backHair:false, spikes:12, spikeLen:3.6, jag:.14, paintBangs:BANG_SIDE, crown:2, deco:['ribbon', 'hairPink']},                                     // 2 high ponytail
  HS({bun:true, sideLocks:8, spikes:10, spikeLen:3, jag:.1, paintBangs:BANG_SWEEP}),                                                 // 3 bun
  HS({sideLocks:8, spikes:12, spikeLen:3.4, jag:.12, deco:['hairpin', 'gold']}),                                                     // 4 short bob
  HS({backHair:true, backLen:22, backW:11, sideLocks:16, spikes:9, spikeLen:3, jag:.1, paintBangs:BANG_SWEEP, deco:['hairpin', 'hairSky']}),   // 5 extra long
  HS({backHair:true, backLen:14, backW:9.6, sideLocks:12, spikes:12, spikeLen:3.6, paintBangs:BANG_SIDE, deco:['ribbon', 'teal']}),  // 6 side-swept long
  HS({ponytail:true, sideLocks:15, spikes:10, spikeLen:3.2, jag:.12, crown:2, deco:['ribbon', 'gold']}),                            // 7 ponytail + long locks
  HS({twintail:true, backHair:true, backLen:12, backW:9.2, sideLocks:6, spikes:10, spikeLen:3, paintBangs:BANG_SOFT, deco:['hairpin', 'hairLilac']})];   // 8 long twin tails
const HAIR_COLORS = ['', 'hairBlack', 'hairBrown', 'hairBlonde', 'hairAuburn', 'hairSilver', 'hairNavy', 'maroon', 'hairPink', 'hairTeal',
  'hairWhite', 'hairViolet', 'hairGreen', 'hairCrimson', 'hairAsh', 'hairGold', 'hairChestnut', 'hairOrange', 'hairRose', 'hairLilac', 'hairSky', 'hairMint'];
const IRIS_COLORS = ['', 'irisBr', 'irisBl', 'irisGr', 'irisVi', 'irisRd', 'irisGd', 'irisPk', 'irisSv', 'irisTl'];
const b36 = n => (n | 0).toString(36);
/* the look in a few characters (also what other players receive): sex · style · hair colour [· e + eye colour] [· r + refine tier]
   old keys (m00 … f29) mean exactly what they meant before */
function lookKey(lk){
  if (!lk) return 'm00';
  const f = lk.sex === 'f', hs = (lk.hair | 0) % (f ? HAIR_F : HAIR_M).length, ci = Math.max(0, HAIR_COLORS.indexOf(lk.color || '')), ei = Math.max(0, IRIS_COLORS.indexOf(lk.eye || ''));
  return `${f ? 'f' : 'm'}${hs}${b36(ci)}${ei ? 'e' + b36(ei) : ''}${lk.rft > 0 ? 'r' + Math.min(4, lk.rft | 0) : ''}${lk.sh ? 's' : ''}`;
}
function parseLookKey(k){
  const m = typeof k === 'string' && /^([mf])([0-9])([0-9a-z])(?:e([0-9a-z]))?(?:r([0-4]))?(s)?$/.exec(k); if (!m) return null;
  return {sex:m[1], hair:+m[2], color:HAIR_COLORS[parseInt(m[3], 36)] || '', eye:m[4] ? IRIS_COLORS[parseInt(m[4], 36)] || '' : '', ...(m[6] ? {sh:1} : {})};   // (v161) s: the weapon is put away
}
function applyLook(cfg, lk){
  const f = lk.sex === 'f', list = f ? HAIR_F : HAIR_M, st = {...(list[(lk.hair | 0) % list.length] || {})}, deco = st.deco; delete st.deco;
  if (!cfg.beard) Object.assign(cfg, st);
  // she: big sparkling eyes, rosy cheeks, a ribbon bow or a flower pin, a petite frame
  if (f){ cfg.lashes = true; cfg.cute = true; cfg.slim = .88; cfg.bodyScale = (cfg.bodyScale || 1) * .96;
    if (deco) cfg[deco[0]] = deco[1];
    if (cfg.iris === 'irisBr') cfg.iris = 'irisPk';
    if (!cfg.skirt) cfg.skirt = [11.2, 5.6, 6.1, 8.2, cfg.top, cfg.bootCuff || cfg.belt || cfg.top]; }
  if (lk.color && HAIR_COLORS.includes(lk.color)) cfg.hair = lk.color;
  if (lk.eye && IRIS_COLORS.includes(lk.eye)) cfg.iris = lk.eye;
}
function heroKey(job, gear = {}, look = null){
  const base = CHARS[job]; if (!base) return job;
  const ids = [gear.head, gear.armor, gear.weapon, gear.acc, gear.shield, gear.pants, gear.shoes, gear.mask].map(x => x || ''), lk = lookKey(look);
  while (ids.length > 4 && !ids[ids.length - 1]) ids.pop();   // old keys stay the same when the new places are empty
  if (!ids.some(Boolean) && lk === 'm00') return job;
  const key = job + '|' + ids.join('|') + '|' + lk;
  if (CHARS[key]) return key;
  const cfg = {...base};
  if (lk !== 'm00') applyLook(cfg, look);
  cfg.rfTier = look && look.rft > 0 ? Math.min(4, look.rft | 0) : 0;   // a refined weapon glows (sys/refinefx.js picks the tier)
  cfg.sheathed = !!(look && look.sh);   // (v159) out of combat: weapon and shield carried on the back
  for (const id of ids){ const lk = GEAR_LOOK[id]; if (lk) Object.assign(cfg, lk); }
  // a wardrobe top re-colours the skirt too (the class skirt keeps its cut; heroines get one in the costume colours)
  if (cfg.cosTop){ if (base.skirt) cfg.skirt = [...base.skirt.slice(0, 4), cfg.skirtM || cfg.top, cfg.skirtT || cfg.belt || cfg.top];
    else if (look && look.sex === 'f') cfg.skirt = [11.2, 5.6, 6.1, 8.2, cfg.skirtM || cfg.top, cfg.skirtT || cfg.bootCuff || cfg.top]; else if (cfg.skirtAll) cfg.skirt = cfg.skirtAll; }
  const wm = /^w_(?:g(?=sword)|[lehs](?=staff)|t(?=dagger)|w(?=bow))?([a-z]+)(\d+)$/.exec(ids[2]);
  const om = /^w_(?:g(?=sword)|l(?=staff))?([a-z]+)(\d+)$/.exec(ids[4] || '');
  if (om && om[1] === base.weapon && (base.weapon === 'sword' || base.weapon === 'staff')){ cfg.offWeapon = true; cfg.offTier = Math.min(5, +om[2]); cfg.shield = null; }
  // twin daggers: a blade in each hand (a worn มีดคู่, or the thief line's own pair when no weapon item is worn); a single มีดสั้น shows one
  // the boxer's pairs, worn on both fists: นวมคู่ (big padded gloves) or กรงเล็บคู่ (three blades strapped over each fist)
  { const gm = /^w_(glove|claw)(\d+)$/.exec(ids[2] || ''); if (gm && base.weapon === 'fist'){ const t = Math.min(5, +gm[2]);
      if (gm[1] === 'glove'){ cfg.glove = ['scarlet', 'scarlet', 'navy', 'charcoal', 'teal', 'gold'][t]; cfg.gloveCuff = t >= 3 ? 'gold' : 'white'; }
      else { cfg.fistClaw = ['steel', 'steel', 'ember', 'obsid', 'jade', 'sun'][t]; cfg.clawTier = t; cfg.handWrap = 'steel'; } } }
  if (base.weapon === 'dagger' && (/^w_tdagger\d+$/.test(ids[2] || '') || (!ids[2] && base.twin))){ cfg.offWeapon = true; cfg.offTier = wm ? Math.min(5, +wm[2]) : 0; cfg.shield = null; }
  if (wm && wm[1] === base.weapon){ cfg.wTier = Math.min(5, +wm[2]); if (base.weapon === 'fist') cfg.handWrap = FIST_WRAP[cfg.wTier]; }
  // one- or two-handed: a worn weapon decides; with none, the class's own weapon does (the Warlord's is a greatsword)
  const wi = ids[2] && typeof ITEMS !== 'undefined' && ITEMS[ids[2]];
  if (wi && wi.st && wi.st.wtype === base.weapon) cfg.twoHand = (wi.st.hands || '') === '2h' && (base.weapon === 'sword' || base.weapon === 'staff');
  CHARS[key] = cfg; CHAR_ACTIONS[key] = CHAR_ACTIONS[job];
  return key;
}
const PLAYER_ACTS = ['idle','walk','attack','skill','roll','capture','rideIdle','ride','hurt','die','sit'];
const CHAR_ACTIONS = {novice:PLAYER_ACTS, blade:PLAYER_ACTS, rune:[...PLAYER_ACTS.slice(0, 4), 'cast', ...PLAYER_ACTS.slice(4)], ranger:PLAYER_ACTS, warlord:PLAYER_ACTS, astro:[...PLAYER_ACTS.slice(0, 4), 'cast', ...PLAYER_ACTS.slice(4)], warden:PLAYER_ACTS, muay:PLAYER_ACTS, grandmaster:PLAYER_ACTS, healer:[...PLAYER_ACTS.slice(0, 4), 'cast', ...PLAYER_ACTS.slice(4)], physician:[...PLAYER_ACTS.slice(0, 4), 'cast', ...PLAYER_ACTS.slice(4)], rogue:PLAYER_ACTS, bandit:PLAYER_ACTS, summoner:[...PLAYER_ACTS.slice(0, 4), 'cast', ...PLAYER_ACTS.slice(4)], sovereign:[...PLAYER_ACTS.slice(0, 4), 'cast', ...PLAYER_ACTS.slice(4)], sage:['idle','cast','sit'], aunt:['idle','walk','sit']};

/* ---------- monsters ---------- */
function slimeModel(big){
  return (cx, act, f, n) => {
    const S = big ? 2.55 : 1, ph = f / n * Math.PI * 2;
    let sq = 1, hop = 0, lun = 0, melt = 0, eyes = 'open';
    if (act === 'idle') sq = 1 + Math.sin(ph) * .07;
    if (act === 'walk'){ hop = Math.max(0, Math.sin(ph)) * 4; sq = 1 + Math.cos(ph) * .12; }
    if (act === 'attack'){ sq = [1.15, .8, 1.2, 1][f]; lun = [0, -1, 5, 1][f]; hop = [0, 0, 2, 0][f]; }
    if (act === 'hurt'){ sq = [.78, .9][f]; eyes = 'hurt'; }
    if (act === 'die'){ melt = [.15, .45, .7, .9][f]; eyes = 'closed'; }
    const body = big ? M.slimeG : M.slime;
    const r = 9 * S, h = (1 - melt) / sq;
    const yc = (r * .82 * h) + hop * S;
    cx.gid = 1;
    ell(cx, [0, yc, lun * S], r * Math.sqrt(sq) * (1 + melt * .5), r * .86 * h, body, {rz:r * .9, tex:n => {
      if (n[2] < .35) return;
      for (const sx of [-1, 1]){ const ex = n[0] - sx * .33, ey = n[1] - .02;
        if (eyes === 'closed'){ if (Math.abs(ey) < .05 && Math.abs(ex) < .12) return {m:M.slimeE, t:1}; continue; }
        if (eyes === 'hurt'){ if (Math.abs(Math.abs(ex) - Math.abs(ey)) < .05 && Math.abs(ex) < .11) return {m:M.slimeE, t:1}; continue; }
        const q = (ex / .14) ** 2 + (ey / .24) ** 2; if (q < 1) return {m:M.slimeE, t:ey > .08 && ex < .02 && ex > -.1 ? 0 : 1}; }
      if (Math.abs(n[0]) < .14 && n[1] < -.22 && n[1] > -.32 && n[2] > .8) return {m:M.slimeE, t:2};
    }});
    cx.gid = 2;
    if (melt < .6) for (let i = 0; i < 6; i++){ const k = i / 6; ell(cx, [0, yc + r * .7 * h + k * 6 * S * h, lun * S - k * 1.5 * S], (4.6 - k * 4) * S, (4.6 - k * 4) * S * .9, body, {}); }
    if (big){
      cx.gid = 3; const cy = yc + r * .75 * h + 6 * S * h;
      frustum(cx, [0, 0, lun * S - 3], cy + 3, cy + 1, 9, 9, M.crown, {});
      for (let i = 0; i < 5; i++){ const a = i / 5 * Math.PI * 2; cx.gid = 4 + i; cap(cx, [Math.cos(a) * 8, cy + 2, lun * S - 3 + Math.sin(a) * 8], [Math.cos(a) * 7, cy + 8 + (i % 2) * 2, lun * S - 3 + Math.sin(a) * 7], 1.6, .6, M.crown, {}); }
      cx.gid = 10; ell(cx, [0, cy + 3.5, lun * S - 3 + 9], 1.8, 1.8, M.gem, {});
    }
  };
}
function hareModel(cx, act, f, n){
  const ph = f / n * Math.PI * 2;
  let hop = 0, lun = 0, tilt = 0, eyes = 'open', fall = 0;
  if (act === 'idle') hop = Math.max(0, Math.sin(ph)) * .6;
  if (act === 'walk') hop = Math.max(0, Math.sin(ph)) * 4.5;
  if (act === 'attack'){ lun = [0, -2, 6, 1][f]; hop = [0, 1, 3, 0][f]; tilt = [0, -.2, .35, 0][f]; }
  if (act === 'hurt'){ tilt = -.3; eyes = 'hurt'; lun = -1.5; }
  if (act === 'die'){ fall = [.3, .8, 1.3, 1.55][f]; eyes = 'closed'; }
  if (fall) cx.pre = p => { const q = rotZ([p[0], p[1] - 6, p[2]], fall); return [q[0], Math.max(.5, q[1] + 6 - fall * 3), q[2]]; };
  const T = p => { const v = rotX([p[0], p[1] - 6, p[2]], -tilt); return [v[0], v[1] + 6 + hop, v[2] + lun]; };
  cx.gid = 1; ell(cx, T([0, 6.5, -2.5]), 7.4, 6.4, M.fur);
  cx.gid = 2; ell(cx, T([0, 7.6, 2.2]), 6.4, 6.2, M.fur);
  cx.gid = 3; ell(cx, T([0, 7, -8.2]), 2.6, 2.6, M.white);
  for (const s of [-1, 1]){ cx.gid = 4 + s; ell(cx, T([s * 3.4, 1.4, 3.6]), 2, 1.6, M.fur); ell(cx, T([s * 3.6, 1.6, -4.4]), 2.6, 1.8, M.fur); }
  const hc = T([0, 12.4, 5.2]);
  cx.gid = 8; ell(cx, hc, 6.2, 6.2, M.fur, {tex:n => {
    if (n[2] < .2) return;
    for (const sx of [-1, 1]){ const ex = n[0] - sx * .42, ey = n[1] + .02;
      if (eyes === 'closed'){ if (Math.abs(ey) < .06 && Math.abs(ex) < .13) return {m:M.slimeE, t:1}; continue; }
      if (eyes === 'hurt'){ if (Math.abs(Math.abs(ex) - Math.abs(ey)) < .06 && Math.abs(ex) < .13) return {m:M.slimeE, t:1}; continue; }
      const q = (ex / .14) ** 2 + (ey / .2) ** 2; if (q < 1) return {m:M.slimeE, t:ey > .06 && ex < 0 ? 0 : 1}; }
    if (n[1] < -.3 && n[1] > -.5 && Math.abs(n[0]) < .1 && n[2] > .7) return {m:M.furPink, t:1};
    if (n[1] < -.15 && n[1] > -.32 && Math.abs(Math.abs(n[0]) - .62) < .12) return {m:M.furPink, t:1};
  }});
  for (const s of [-1, 1]){ cx.gid = 11 + s; cap(cx, add(hc, [s * 2.4, 4, -1]), add(hc, [s * 3.6, 12, -3.4]), 1.8, 1.4, M.fur, {tex:(n) => (n[2] > .3 && Math.abs(n[0]) < .5 ? {m:M.furPink} : undefined)}); }
  cx.gid = 14; ell(cx, add(hc, [1.5, 5.2, .6]), 5.4, 3.4, M.cap, {tex:n => (n[1] < -.2 ? false : Math.sin(n[0] * 11) * Math.sin(n[2] * 11 + 1) > .55 ? {m:M.white, t:1} : undefined)});
  cx.gid = 15; cap(cx, add(hc, [1.5, 2.8, .6]), add(hc, [1.5, 4.5, .6]), 1.6, 1.6, M.cream, {});
  cx.pre = null;
}
function boarModel(cx, act, f, n){
  const ph = f / n * Math.PI * 2;
  let lun = 0, bob = 0, sw = 0, eyes = 'open', fall = 0, head = 0;
  if (act === 'idle'){ bob = Math.sin(ph) * .4; head = Math.sin(ph) * .05; }
  if (act === 'walk'){ sw = Math.sin(ph) * .55; bob = Math.abs(Math.cos(ph)) * .8; }
  if (act === 'attack'){ lun = [0, -2.5, 7, 2][f]; head = [0, .25, -.35, 0][f]; sw = [0, -.3, .5, .1][f]; }
  if (act === 'hurt'){ lun = -2; head = .3; eyes = 'hurt'; }
  if (act === 'die'){ fall = [.35, .9, 1.35, 1.55][f]; eyes = 'closed'; }
  if (fall) cx.pre = p => { const q = rotZ([p[0], p[1] - 10, p[2]], fall); return [q[0], Math.max(.5, q[1] + 10 - fall * 4.5), q[2]]; };
  const T = p => [p[0], p[1] + bob, p[2] + lun];
  for (const [s, z, k] of [[-1, 6, 1], [1, 6, -1], [-1, -6.5, -1], [1, -6.5, 1]]){ cx.gid = 20 + s + z; const top = T([s * 5, 9, z]); cap(cx, top, add(top, rotX([0, -8.5, 0], sw * k)), 2.5, 2.1, M.boar, {tex:(nn, lo, q, t) => (t > .78 ? {m:M.lanternWood} : undefined)}); }
  cx.gid = 1; ell(cx, T([0, 12, -6]), 9.6, 8.6, M.boar, {tex:n => (Math.sin(n[1] * 14 + n[0] * 3) > .82 ? {dt:1} : undefined)});
  cx.gid = 2; ell(cx, T([0, 13, 1]), 10.4, 9.4, M.boar, {tex:n => (Math.sin(n[1] * 14 + n[0] * 3) > .82 ? {dt:1} : undefined)});
  cx.gid = 3; ell(cx, T([0, 8, -14.5]), 1.6, 1.6, M.boar);
  const hc = T(rotX([0, 12, 9.2], head));
  cx.gid = 4; ell(cx, hc, 7.4, 7.2, M.boar, {tex:n => {
    if (n[2] < .1) return;
    for (const sx of [-1, 1]){ const ex = n[0] - sx * .5, ey = n[1] - .22;
      if (eyes === 'closed'){ if (Math.abs(ey) < .06 && Math.abs(ex) < .12) return {m:M.slimeE, t:1}; continue; }
      const q = (ex / .11) ** 2 + (ey / .15) ** 2; if (q < 1) return {m:M.slimeE, t:ey > .05 ? 0 : 1}; }
  }});
  cx.gid = 5; cap(cx, add(hc, [0, -1.5, 4.5]), add(hc, [0, -2.2, 8.5]), 3.6, 3.2, M.snout, {tex:(nn, lo, q, t) => (t > .9 && Math.abs(nn[0]) > .1 && Math.abs(nn[0]) < .45 && nn[2] > .5 ? {m:M.boar, t:3} : undefined)});
  for (const s of [-1, 1]){ cx.gid = 6 + s; cap(cx, add(hc, [s * 3, -3, 6.5]), add(hc, [s * 4.2, 1.5, 9.5]), 1.1, .5, M.tusk, {}); }
  for (const s of [-1, 1]){ cx.gid = 9 + s; cap(cx, add(hc, [s * 4.6, 5, -1]), add(hc, [s * 6.4, 8.6, -3]), 2.2, .8, M.boar, {}); }
  for (let i = 0; i < 9; i++){ const z = 6 - i * 2.2, h = 4 + (i % 2) * 2 - Math.abs(i - 3) * .3; cx.gid = 30 + i; cap(cx, T([0, 20.5 - Math.abs(i - 3) * .35, z]), T([0, 20.5 + h, z - 2.2]), 1.9, .5, M.mane, {}); }
  cx.pre = null;
}
function lanternModel(cx, act, f, n){
  const ph = f / n * Math.PI * 2;
  let fl = Math.sin(ph) * 1.5, lun = 0, sway = Math.sin(ph) * .08, eyes = 'open', dim = 0;
  if (act === 'walk'){ sway = Math.sin(ph) * .2; }
  if (act === 'attack'){ lun = [0, -2, 7, 2][f]; sway = [0, -.25, .35, 0][f]; }
  if (act === 'hurt'){ sway = -.3; eyes = 'hurt'; }
  if (act === 'die'){ dim = [.2, .45, .7, .9][f]; fl = -dim * 14; eyes = 'closed'; }
  const base = 21 + fl;
  cx.pre = p => { const v = rotX([p[0], p[1] - base, p[2]], sway); return [v[0], Math.max(.5, v[1] + base), v[2] + lun]; };
  cx.gid = 1;
  ell(cx, [0, base, 0], 10 * (1 - dim * .2), 10.5 * (1 - dim * .4), M.lantern, {rz:10, tex:(nn) => {
    const a = Math.atan2(nn[0], nn[2]);
    if (nn[2] > .35){
      for (const sx of [-1, 1]){ const ex = nn[0] - sx * .3, ey = nn[1] - .1;
        if (eyes === 'closed'){ if (Math.abs(ey) < .05 && Math.abs(ex) < .13) return {m:M.lanternWood, t:0}; continue; }
        if (eyes === 'hurt'){ if (Math.abs(Math.abs(ex) - Math.abs(ey)) < .05 && Math.abs(ex) < .12) return {m:M.lanternWood, t:0}; continue; }
        if ((ex / .13) ** 2 + (ey / .2) ** 2 < 1 && ey < .12 - sx * ex * .9) return {m:M.lanternWood, t:0}; }
      if (eyes !== 'closed' && nn[1] < -.2 && nn[1] > -.38 && Math.abs(nn[0]) < .22) return {m:M.lanternWood, t:Math.sin(nn[0] * 45) > 0 ? 0 : 1};
    }
    if (Math.abs(Math.sin(a * 3.5)) < .1) return {dt:1};
    if (nn[2] > .15) return {m:M.lanternGlow, t:dim > .5 ? 3 : nn[2] > .75 ? 0 : nn[2] > .45 ? 1 : 2};
  }});
  cx.gid = 2; frustum(cx, [0, 0, 0], base + 11.5, base + 9.6, 5.4, 7.2, M.lanternWood, {});
  cx.gid = 3; frustum(cx, [0, 0, 0], base - 9.6, base - 11.5, 7.2, 5.4, M.lanternWood, {});
  cx.gid = 4; cap(cx, [0, base + 11.5, 0], [0, base + 14.5, 0], 1, .8, M.lanternWood, {});
  cx.pre = null;
  if (dim < .8) for (let i = -1; i <= 1; i++){ cx.gid = 6 + i; const pts = []; for (let k = 0; k <= 6; k++){ const t = k / 6; pts.push([i * 4 + Math.sin(ph + t * 4 + i) * 2, base - 12 - t * 7, Math.cos(ph + i) * 1.5 + lun]); }
    for (let k = 0; k < pts.length - 1; k++) cap(cx, pts[k], pts[k + 1], Math.max(.5, 1.4 - k * .18), Math.max(.5, 1.2 - k * .18), M.wisp, {}); }
}
const MOBS = {
  dewblob:{name:'เจลลี่น้ำค้าง', fs:64, model:slimeModel(false)},
  hare:{name:'กระต่ายเขาเห็ด', fs:64, model:hareModel},
  boar:{name:'หมูป่าหญ้าทอง', fs:64, model:boarModel},
  lantern:{name:'ผีโคมลอย', fs:64, model:lanternModel},
  boss:{name:'ราชาเจลลี่ทองคำ', fs:128, model:slimeModel(true)}
};

/* ---------- sheets ---------- */
const FS = 88, ANCHOR_Y = 82;
/* one-handed weapons (knife, sword, staff) switch hands with the view so the weapon is never hidden behind the body */
const ONE_HAND = ['dagger', 'sword', 'staff', 'shuriken'];   // (v184) the ninja's stars are thrown from one hand
let DAGGER_LEFT = [0, 1];
function mirrorArms(P){ const Q = {...P}; for (const [a, b] of [['armL', 'armR'], ['elbL', 'elbR'], ['outL', 'outR'], ['legL', 'legR'], ['liftL', 'liftR']]){ Q[a] = P[b]; Q[b] = P[a]; }
  Q.twist = -(P.twist || 0); Q.sway = -(P.sway || 0); Q.hipX = -(P.hipX || 0); Q.wLeft = true; return Q; }
/* (v95) a monster's feet nearest the camera, its tail or a falling body reached below the bottom of its cell and were
   cut flat (a third of all monsters). The cell now reaches further down; frames are cropped to their picture, so the
   extra room costs no memory. */
let MOB_PAD = globalThis.SPR_MOB_PAD ?? .3;
// render scale: sprites are rasterised at K pixels per world unit, then drawn back at world size
const kOf = () => GFX.k;   // sprites are rasterised at the quality preset's density (see GFX)
function newCanvas(w, h){ if (typeof OffscreenCanvas !== 'undefined' && !globalThis.__SPR_DOM) return new OffscreenCanvas(w, h); const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function renderFrame(kind, key, act, dir, f, K = kOf(kind, key)){
  if (kind === 'char'){
    const cfg = CHARS[key], A = ACTIONS[act], fs = Math.ceil(FS * K), F = new Frame(fs, fs), cx = new Ctx(F, -dir * Math.PI / 4, fs / 2, ANCHOR_Y * K, K * (cfg.bodyScale || 1));
    let P = humanPose(act, f, A.n, cfg.weapon);
    if (ONE_HAND.includes(cfg.weapon) && !cfg.twoHand && DAGGER_LEFT.includes(dir)) P = mirrorArms(P);   // one-handed weapons are carried in the hand the camera can see
    drawHuman(cx, cfg, P);
    const img = finish(F, K);
    if (cfg.paint && cx.head) paintHead(img, F, cx);
    img.wsegs = cx.wsegs || null; img.ssegs = cx.ssegs || null;
    return img;
  }
  const mb = MOBS[key], A = MOB_ACTIONS[act], fs = Math.ceil(mb.fs * K), F = new Frame(fs, fs + Math.ceil(fs * MOB_PAD)), cx = new Ctx(F, -dir * Math.PI / 4, fs / 2, fs - 6 * K, K * (mb.scale || 1));
  if (mb.human){ drawHuman(cx, mb.human, humanPose(act, f, A.n, mb.human.weapon)); const img = finish(F, K); if (mb.human.paint && cx.head) paintHead(img, F, cx); img.wsegs = cx.wsegs || null; return img; }   // (v166) where its weapon is, for the boss weapon glow
  mb.model(cx, act, f, A.n);
  return finish(F, K);
}
/* lazy sheet: each action is rasterised the first time it is drawn (or during warm-up) */
function sheet(kind, key){
  const acts = kind === 'char' ? CHAR_ACTIONS[key] : Object.keys(MOB_ACTIONS), AT = kind === 'char' ? ACTIONS : MOB_ACTIONS;
  const K = kOf(kind, key), base = kind === 'char' ? FS : MOBS[key].fs, fs = Math.ceil(base * K);
  const index = {}; acts.forEach(a => { index[a] = {n:AT[a].n, fps:AT[a].fps, loop:!!AT[a].loop}; });
  return {kind, key, K, fs, base, index, cache:{}, anchor:[fs / 2, kind === 'char' ? ANCHOR_Y * K : fs - 6 * K]};
}
// memory budget: cached (action, direction) strips are evicted least-recently-used beyond this many pixels.
// Frames inside a strip are rasterised one at a time, the first time they are needed (or in idle time).
// (v89) each frame is kept cropped to its own picture (plus a clear pixel all round), not as a full square cell: a
// monster's cell is mostly empty air, so the same memory now holds several times more frames and fights stop
// re-drawing the same monsters over and over. The recency list is a Map, so marking a strip used costs nothing.
let cachedPx = 0; const lru = new Map();
const STATS = {rast:0, ms:0, evicted:0, get px(){ return cachedPx; }, get strips(){ return lru.size; }, top(){ return [...lru].map(([e, [sh, k]]) => [sh.kind + ':' + sh.key + ':' + k + ' K' + sh.K, e.px, e.done.reduce((a, b) => a + b, 0) + '/' + e.n]).sort((a, b) => b[1] - a[1]).slice(0, 15); }};   // (v97) counters for the performance checks
let spent = 0;                                   // ms of rasterising this display frame (see tick)
function tick(){ spent = 0; WDRAWS.length = 0; SDRAWS.length = 0; }
const WDRAWS = [], SDRAWS = [];                               // weapons drawn this display frame: where each blade is on screen
function touch(sh, key, e){ lru.delete(e); lru.set(e, [sh, key]); }
function dropStrip(e){ for (const fr of e.fr) if (fr && fr.c){ fr.c.width = fr.c.height = 0; } if (e.c){ e.c.width = e.c.height = 0; e.c = null; } cachedPx -= e.px; e.px = 0; }
function evict(keep){
  for (const [oe, [os, ok]] of lru){ if (cachedPx <= GFX.budget || lru.size <= 1) break; if (oe === keep) continue;
    lru.delete(oe); dropStrip(oe); if (os.cache[ok] === oe) delete os.cache[ok]; STATS.evicted++; }
}
function strip(sh, act, dir){
  if (!sh.index[act]) act = 'idle';
  if (sh.kind === 'mob' && dir > 4) dir = 8 - dir;   // (v97) monsters facing NE, E, SE are the NW, W, SW pictures mirrored: 3 strips in 8 never painted
  const key = act + '|' + dir; let e = sh.cache[key];
  if (e){ touch(sh, key, e); return e; }
  const n = sh.index[act].n;
  e = {fr:new Array(n), c:null, px:0, done:new Uint8Array(n), n, act, dir};
  sh.cache[key] = e; touch(sh, key, e);
  return e;
}
/* monsters get the cute cartoon look of the new theme: colours a touch brighter and livelier, and a soft dark navy
   outline around the whole body (like the hero art and the UI) — baked once into each frame, so it costs nothing per draw */
function toonFrame(img, w){
  const d = img.data, W = img.width, H = img.height, a0 = new Uint8Array(W * H);
  for (let i = 0, p = 0; i < d.length; i += 4, p++){ const al = d[i + 3]; a0[p] = al > 110 ? 1 : 0; if (!al) continue;
    let r = d[i], g = d[i + 1], b = d[i + 2]; const m = (r + g + b) / 3;
    r = m + (r - m) * 1.18; g = m + (g - m) * 1.18; b = m + (b - m) * 1.18;   // a little more saturated
    d[i] = Math.min(255, r + (255 - r) * .07); d[i + 1] = Math.min(255, g + (255 - g) * .07); d[i + 2] = Math.min(255, b + (255 - b) * .07); }
  // cel shading (v18): light falls into flat bands like a hand-coloured cartoon, and a thin ink line is drawn inside the body
  // wherever two parts meet (a sharp change in brightness) — monsters read as drawn characters, not soft 3D blobs
  const lum = new Float32Array(W * H);
  for (let p = 0, i = 0; p < W * H; p++, i += 4) if (a0[p]) lum[p] = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
  for (let p = 0, i = 0; p < W * H; p++, i += 4){ if (!a0[p]) continue; const l = lum[p]; if (l < .02) continue;
    const band = l < .22 ? .16 : l < .42 ? .34 : l < .64 ? .56 : l < .84 ? .76 : .94, k = 1 + (band / l - 1) * .55;
    d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k); }
  const ink = new Uint8Array(W * H), thr = .34;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){ const p = y * W + x; if (!a0[p]) continue;
    const gx = lum[p + 1] - lum[p - 1], gy = lum[p + W] - lum[p - W]; if (gx * gx + gy * gy > thr * thr && lum[p] <= Math.max(lum[p + 1], lum[p - 1], lum[p + W], lum[p - W])) ink[p] = 1; }
  for (let p = 0, i = 0; p < W * H; p++, i += 4) if (ink[p]){ d[i] = d[i] * .42 + 30 * .58 * .5; d[i + 1] = d[i + 1] * .42 + 38 * .58 * .5; d[i + 2] = d[i + 2] * .45 + 62 * .55 * .5; }
  // a soft rim light along the top edges and a gentle shade along the bottom edges: the rounded, cel-shaded cartoon look
  const rim = Math.max(1, w), sh2 = Math.max(1, w);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const p = y * W + x; if (!a0[p]) continue; const i = p * 4;
    let top = false, bot = false; for (let k = 1; k <= rim; k++){ if (y - k < 0 || !a0[p - k * W]){ top = true; break; } } for (let k = 1; k <= sh2; k++){ if (y + k >= H || !a0[p + k * W]){ bot = true; break; } }
    if (top){ d[i] = d[i] + (255 - d[i]) * .28; d[i + 1] = d[i + 1] + (255 - d[i + 1]) * .28; d[i + 2] = d[i + 2] + (255 - d[i + 2]) * .3; }
    else if (bot){ d[i] *= .8; d[i + 1] *= .8; d[i + 2] *= .86; } }
  // the outline: a separable dilation of the body (rows, then columns), so it stays cheap even on big frames
  const h1 = new Uint8Array(W * H);
  for (let y = 0; y < H; y++){ let run = -1e9; const o = y * W;
    for (let x = 0; x < W; x++){ if (a0[o + x]) run = x; if (x - run <= w) h1[o + x] = 1; }
    run = 1e9; for (let x = W - 1; x >= 0; x--){ if (a0[o + x]) run = x; if (run - x <= w) h1[o + x] = 1; } }
  for (let x = 0; x < W; x++){ let run = -1e9;
    for (let y = 0; y < H; y++){ const p = y * W + x; if (h1[p]) run = y; if (!a0[p] && y - run <= w){ const i = p * 4; d[i] = 30; d[i + 1] = 38; d[i + 2] = 62; d[i + 3] = 235; } }
    run = 1e9; for (let y = H - 1; y >= 0; y--){ const p = y * W + x; if (h1[p]) run = y; if (!a0[p] && run - y <= w){ const i = p * 4; d[i] = 30; d[i + 1] = 38; d[i + 2] = 62; d[i + 3] = 235; } } }
}
function frameIn(sh, e, f){
  if (e.done[f]) return;
  const t0 = performance.now();
  const img = renderFrame(sh.kind, sh.key, e.act, e.dir, f, sh.K);
  if (sh.kind === 'mob' && globalThis.MOB_TOON === true) toonFrame   // off by default (v19): monsters keep their natural painted look, no dark outline(img, Math.max(1, Math.round(sh.K * .9)));
  // crop to the drawn pixels
  const W = img.width, H = img.height, D = img.data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++){ const r = y * W * 4; for (let x = 0; x < W; x++) if (D[r + x * 4 + 3]){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; } }
  let fr = {c:null, x:0, y:0};
  if (x1 >= 0){ const A = 12;   // edges snapped to a 12-pixel grid (and a clear margin) so scaling samples exactly as from the full cell
    x0 = Math.max(0, Math.floor((x0 - 1) / A) * A); y0 = Math.max(0, Math.floor((y0 - 1) / A) * A); x1 = Math.min(W - 1, Math.ceil((x1 + 2) / A) * A - 1); y1 = Math.min(H - 1, Math.ceil((y1 + 2) / A) * A - 1);
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1, c = newCanvas(cw, ch); c.getContext('2d').putImageData(img, -x0, -y0, x0, y0, cw, ch);
    fr = {c, x:x0, y:y0}; e.px += cw * ch; cachedPx += cw * ch; }
  STATS.rast++; STATS.ms += performance.now() - t0;
  e.fr[f] = fr; e.done[f] = 1; if (img.wsegs) (e.ws || (e.ws = []))[f] = img.wsegs; if (img.ssegs) (e.ss || (e.ss = []))[f] = img.ssegs;
  spent += performance.now() - t0;
  if (cachedPx > GFX.budget) evict(e);
}
/* quality changed: drop every cached frame and re-make each sheet at the new density (frames re-render lazily) */
function rebuild(sheets){
  for (const e of lru.keys()) dropStrip(e);
  lru.clear(); cachedPx = 0;
  for (const k in sheets){ const old = sheets[k]; Object.assign(old, sheet(old.kind, old.key), {cache:{}}); }
}
/* a fully rendered strip (portraits, tools) */
/* the whole strip as one canvas (portraits and menus draw from it): frames side by side in full square cells */
/* (v97) frames only, no whole-strip canvas: the start-up warm-up used ensure() and built a full-cell canvas for every
   direction of the hero's walk (about 1 M pixels each), which filled the sprite budget and made monsters repaint all the time */
function ensureFrames(sh, act, dir = 0){ const e = strip(sh, act, dir); for (let f = 0; f < e.n; f++) frameIn(sh, e, f); return e; }
function ensure(sh, act, dir = 0){ const e = strip(sh, act, dir); for (let f = 0; f < e.n; f++) frameIn(sh, e, f);
  if (!e.c){ const fs = sh.fs; e.c = newCanvas(e.n * fs, fs); const g = e.c.getContext('2d');
    e.fr.forEach((fr, f) => { if (fr && fr.c) g.drawImage(fr.c, f * fs + fr.x, fr.y); }); }   // (v97) only a few portraits use this: not counted against the sprite budget
  return e.c; }
/* full sheet in one canvas (tools/sprite-atlas.html) */
function buildSheet(kind, key){
  const sh = sheet(kind, key), acts = Object.keys(sh.index), cols = Math.max(...acts.map(a => sh.index[a].n));
  const can = newCanvas(cols * sh.fs, acts.length * 8 * sh.fs), g = can.getContext('2d'), index = {};
  acts.forEach((a, ai) => { index[a] = {...sh.index[a], row:ai * 8}; for (let d = 0; d < 8; d++) g.drawImage(ensure(sh, a, d), 0, (ai * 8 + d) * sh.fs); });
  return {canvas:can, fs:sh.fs, index, anchor:sh.anchor, kind, key, K:sh.K};
}
/* creates every sheet; pre-renders the listed [key, action] pairs so the first frames do not hitch */
async function buildAll(onProgress, prewarm = []){
  const out = {};
  for (const k of Object.keys(CHARS)) out[k] = sheet('char', k);
  for (const k of Object.keys(MOBS)) out[k] = sheet('mob', k);
  for (let i = 0; i < prewarm.length; i++){
    const [key, act, dirs] = prewarm[i]; if (out[key]) for (const d of dirs || [0, 1, 2, 3, 4, 5, 6, 7]) ensureFrames(out[key], act, d);
    if (onProgress) onProgress((i + 1) / prewarm.length, key);
    await new Promise(r => setTimeout(r, 0));
  }
  return out;
}
/* render the remaining frames in idle time, a few frames per slice */
function warm(sheets, keys){
  const todo = [];
  for (const k of keys){ const [key, act] = Array.isArray(k) ? k : [k, null]; if (!sheets[key]) continue;
    for (const a in sheets[key].index) if (!act || a === act) for (let d = 0; d < 8; d++) todo.push([key, a, d]); }
  const idle = globalThis.requestIdleCallback || (f => setTimeout(() => f({timeRemaining:() => 8}), 30));
  const step = dl => {
    let one = dl && dl.didTimeout && spent < 1;   // (v89) a busy game is never idle: still paint one frame each time the wait runs out
    while (todo.length && (!dl || dl.timeRemaining() > 4 || one)){
      if (cachedPx > GFX.budget * .8) return;
      const [key, a, d] = todo[0], sh = sheets[key], e = strip(sh, a, d), f = e.done.indexOf(0);
      if (f < 0){ todo.shift(); continue; }
      frameIn(sh, e, f); one = false;
    }
    if (todo.length) idle(step, {timeout:120});
  };
  idle(step, {timeout:120});
}
function dirFromVec(dx, dy){
  const a = Math.atan2(dy, dx) * 180 / Math.PI;
  return ((Math.round((a - 90) / 45) % 8) + 8) % 8;
}
function frameAt(sh, act, t){
  const ix = sh.index[act] || sh.index.idle, n = ix.n;
  const fr = Math.floor(t * ix.fps);
  return ix.loop ? fr % n : Math.min(n - 1, fr);
}
const LAZY = [];
function lazyQ(sh, e, f){
  if (LAZY.some(q => q[1] === e)) return;
  LAZY.push([sh, e, f]); if (LAZY.length > 1) return;
  const idle = globalThis.requestIdleCallback || (fn => setTimeout(() => fn({timeRemaining:() => 8}), 30));
  const step = dl => { let one = dl && dl.didTimeout;
    while (LAZY.length && (!dl || dl.timeRemaining() > 4 || one)){ const [s2, e2, f2] = LAZY.shift(); if (!e2.done[f2]) frameIn(s2, e2, f2); one = false; }
    if (LAZY.length) idle(step, {timeout:200}); };
  idle(step, {timeout:200});
}
function draw(g, sh, act, dir, t, x, y, o = {}){
  if (!sh.index[act]) act = 'idle';
  let e = strip(sh, act, dir); const fs = sh.fs, K = sh.K, flip = sh.kind === 'mob' && dir > 4; let f = o.frame ?? frameAt(sh, act, t);
  // rasterise on demand, but only ~6 ms per display frame (v83: was 10, and a strip with no ready frame was always
  // drawn at once, so a crowd turning to a new direction stalled the frame). Over budget, show the nearest ready
  // frame: this strip's, else the same pose facing another way, else any ready pose of this sheet; the missing
  // frames fill in over the next display frames.
  // (v95) figures that can wait (town NPCs): a missing frame is drawn in idle time, never inside a display frame — a town
  // full of NPCs on arrival (~40 ms each on a slow machine) froze the screen for over a second. Until it is ready the
  // nearest ready pose shows, or nothing for the first moment.
  // (v97) monsters wait the same way ('soft'): a new pose or direction is painted in idle time while the nearest ready
  // one shows; only a monster with nothing painted yet is painted at once (within the per-frame budget below)
  const lazy = o.lazy ?? (sh.kind === 'mob' ? 'soft' : false);
  if (!e.done[f] && lazy){ lazyQ(sh, e, f); const any = e.done.indexOf(1);
    if (any >= 0) f = any;
    else { let alt = null; for (const k in sh.cache){ const c = sh.cache[k]; if (c.done.indexOf(1) >= 0 && (!alt || c.act === act)){ alt = c; if (c.act === act) break; } }
      if (alt){ e = alt; f = alt.done.indexOf(1); } else if (lazy !== 'soft') return; } }
  if (!e.done[f]){ const any = e.done.indexOf(1);
    if (any >= 0 ? spent === 0 : spent < 6) frameIn(sh, e, f);   // (v89) a strip that can show something rasterises at most one frame per display frame
    else if (any >= 0) f = any;
    else { let alt = null; for (const k in sh.cache){ const c = sh.cache[k]; if (c.done.indexOf(1) >= 0 && (!alt || c.act === act)){ alt = c; if (c.act === act) break; } }
      if (alt){ e = alt; f = alt.done.indexOf(1); }
      else frameIn(sh, e, f); } }
  const fr = e.fr[f], scale = g.getTransform ? g.getTransform().a : 1;
  const sm = g.imageSmoothingEnabled, sq = g.imageSmoothingQuality;
  // sprites are rendered at the screen's density; only when zoomed out below it do we filter the downscale
  const smooth = GFX.smooth;
  g.imageSmoothingEnabled = smooth || K > scale * 1.05; g.imageSmoothingQuality = 'high';
  // crisp mode snaps to the sprite's own pixel grid; smooth mode lets it glide between pixels
  const dx = smooth ? x - sh.anchor[0] / K : Math.round((x - sh.anchor[0] / K) * K) / K, dy = smooth ? y - sh.anchor[1] / K : Math.round((y - sh.anchor[1] / K) * K) / K;
  if (fr && fr.c){ const w = fr.c.width / K, l = dx + fr.x / K;
    if (flip){ g.save(); g.translate(2 * x - l, 0); g.scale(-1, 1); g.drawImage(fr.c, 0, dy + fr.y / K, w, fr.c.height / K); g.restore(); }
    else g.drawImage(fr.c, l, dy + fr.y / K, w, fr.c.height / K); }
  const ws = e.ws && e.ws[f]; if (ws && WDRAWS.length < 200) WDRAWS.push({g, x, y, mt:sh.kind === 'mob' && g.getTransform ? g.getTransform() : null, segs:ws.map(([a, b]) => flip ? [2 * x - dx - a.x / K, dy + a.y / K, 2 * x - dx - b.x / K, dy + b.y / K] : [dx + a.x / K, dy + a.y / K, dx + b.x / K, dy + b.y / K])});
  const ss = e.ss && e.ss[f]; if (ss && SDRAWS.length < 200) SDRAWS.push({g, x, y, segs:ss.map(([a, b]) => [dx + a.x / K, dy + a.y / K, Math.max(2, Math.hypot(b.x - a.x, b.y - a.y) / K)])});
  g.imageSmoothingEnabled = sm; g.imageSmoothingQuality = sq;
}
const prim = {ell, cap, frustum, line, dot, rotX, rotY, rotZ, add, mul, lerp3, nrm, ramp:rampOf};
return {STATS, WDRAWS, SDRAWS, prim, heroKey, lookKey, parseLookKey, HAIR_COLORS, IRIS_COLORS, HAIR_M, HAIR_F, GEAR_LOOK, buildAll, buildSheet, sheet, ensure, warm, tick, rebuild, renderFrame, draw, frameAt, dirFromVec, DIRS, DIR_TH, ACTIONS, MOB_ACTIONS, CHARS, CHAR_ACTIONS, MOBS, MATS, M, FS, ANCHOR_Y};
})();
