/* VAYRATHEN — js/sys/campround.js — round camps, laid out evenly round the middle of the map (v60)
   The camp sits in the exact middle of every field map. Its clearing is now a round circle edged with stones, with
   three openings where the trails come in (east, south and west) and a lamp on each side of every opening.
   The campfire is the centre; the World Tree stands straight behind it (north); log seats ring the fire on the
   south side, and bedrolls, packs and jars pair up left and right. The land's own plants stand evenly round
   the outside. Everything else (the land's colours, the ground, the tree's look) is as in camp3.js. */
'use strict';

campPlace = function(){
  const c = CAMP; if (!c) return; const th = campTheme(), land = (MAPS[MAP_ID] || {}).land, li = Math.max(0, CAMP_LANDS.indexOf(land)), R0 = 175;
  let sd = (MAP_ID * 7919 + 13) % 233280; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  const drop = test => { for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!test(p)) continue; PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); } };
  drop(p => Math.hypot(p.x - c.x, p.y - c.y) < R0 + 40);
  for (let i = obstacles.length - 1; i >= 0; i--){ const o = obstacles[i]; if (o.prop && Math.hypot(o.x - c.x, o.y - c.y) < R0 + 40) obstacles.splice(i, 1); }
  drop(p => CAMP_NOBUILD.includes(p.type) && Math.hypot(p.x - c.x, (p.y - c.y) * 1.2) < 420);
  // the ground: the land's own, worn paler in a round clearing
  const B = BIOME[(MAPS[MAP_ID] || {}).biome] || {}, base = (B.base && B.base[1]) || th.ground[0], snowy = CAMP_SNOWY.includes((MAPS[MAP_ID] || {}).biome);
  const mix = (h1, h2, k) => { const a = parseInt(h1.slice(1), 16), b2 = parseInt(h2.slice(1), 16), ch = s => Math.round((a >> s & 255) * (1 - k) + (b2 >> s & 255) * k); return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join(''); };
  const gr0 = snowy ? '#e8f0f6' : mix(base, th.ground[0], .45), gr1 = snowy ? '#cfdce8' : mix(base, th.ground[1], .3);
  const hex = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  const disc = (k, col) => { g.fillStyle = col; g.beginPath(); g.arc(c.x, c.y, R0 * k, 0, 7); g.fill(); };
  for (const [k, a] of [[1.1, .12], [1.04, .22], [.98, .4], [.9, .55], [.8, .62]]) disc(k, hex(gr0, a));
  // a worn ring path round the fire, and the trails coming in through the openings
  g.strokeStyle = hex(gr1, .45); g.lineWidth = 20; g.beginPath(); g.arc(c.x, c.y, R0 * .66, 0, 7); g.stroke();
  for (const a of [0, Math.PI / 2, Math.PI]){ g.lineWidth = 26; g.beginPath(); g.moveTo(c.x + Math.cos(a) * R0 * .66, c.y + Math.sin(a) * R0 * .66); g.lineTo(c.x + Math.cos(a) * R0 * 1.12, c.y + Math.sin(a) * R0 * 1.12); g.stroke(); }
  disc(.3, hex(gr1, .4));
  for (let i = 0; i < 800; i++){ const a = r() * 6.28, d = Math.sqrt(r()) * R0 * .97, x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d;
    g.fillStyle = r() < .5 ? th.speck[0] : th.speck[1]; g.beginPath(); g.ellipse(x, y, .8 + r() * 2.2, .6 + r(), r() * 3, 0, 7); g.fill(); }
  // a ring of stones round the edge, open where the trails come in
  const gap = a => [0, Math.PI / 2, Math.PI].some(o => Math.abs(Math.atan2(Math.sin(a - o), Math.cos(a - o))) < .2);
  for (let i = 0; i < 64; i++){ const a = i / 64 * 6.283; if (gap(a)) continue; const x = c.x + Math.cos(a) * R0, y = c.y + Math.sin(a) * R0;
    g.fillStyle = 'rgba(30,25,20,.25)'; g.beginPath(); g.ellipse(x + 1, y + 2, 5.4, 3, 0, 0, 7); g.fill();
    g.fillStyle = th.snow ? (i % 2 ? '#9a9aa4' : '#b8bac4') : i % 2 ? '#857a6c' : '#a09482'; g.beginPath(); g.ellipse(x, y, 5 + (i % 3), 3.6, a, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(x - 1, y - 1.2, 2.4, 1.2, 0, 0, 7); g.fill(); }
  // flowers or snow tufts just inside the stones
  for (let i = 0; i < 48; i++){ const a = i / 48 * 6.283 + r() * .05; if (gap(a)) continue; const d = R0 * (.9 + r() * .05), x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d;
    if (snowy){ g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(x, y, 4, 1.6, 0, 0, 7); g.fill(); }
    else if (land === 'fertile' || land === 'light'){ g.fillStyle = land === 'light' ? (i % 2 ? '#fff4d0' : '#f2c8e0') : ['#f2c14e', '#f6e7f0', '#e86a8a'][i % 3]; g.beginPath(); g.arc(x, y, 1.7, 0, 7); g.fill(); }
    else { g.strokeStyle = th === CAMP_THEME.volcanic ? 'rgba(90,80,70,.6)' : 'rgba(80,120,50,.6)'; g.lineWidth = 1.1; for (let k = 0; k < 3; k++){ g.beginPath(); g.moveTo(x + k * 2, y); g.lineTo(x + k * 2, y - 4); g.stroke(); } } }
  // the fire pit in the very middle
  for (let i = 0; i < 12; i++){ const a = i / 12 * 6.28; g.fillStyle = th.snow ? (i % 2 ? '#8a8a92' : '#a8aab4') : i % 2 ? '#7a7066' : '#948a7c'; g.beginPath(); g.ellipse(c.x + Math.cos(a) * 15, c.y + 18 + Math.sin(a) * 7, 3.6, 2.6, 0, 0, 7); g.fill(); }
  g.fillStyle = '#2a1e16'; g.beginPath(); g.ellipse(c.x, c.y + 18, 11, 5, 0, 0, 7); g.fill();
  g.restore();
  // the great tree straight behind the fire (worldtree.js turns it into the World Tree)
  addProp('camptree', c.x, c.y - 100, li);
  // log seats on the south side of the fire
  for (const a of [.45, 1.5708, 2.69]) addProp('logseat', c.x + Math.cos(a) * 50, c.y + 18 + Math.sin(a) * 30);
  // bedrolls, packs, jars and lamps in pairs, left and right
  for (const s of [-1, 1]){
    addProp('bedroll', c.x + s * 78, c.y - 62, (li + (s > 0 ? 1 : 0)) % 6); addProp('bedroll', c.x + s * 118, c.y - 34, (li + (s > 0 ? 3 : 2)) % 6);
    addProp('packs', c.x + s * 128, c.y + 58); if (!th.snow) addProp('jar', c.x + s * 104, c.y + 84);
  }
  for (const o of [0, Math.PI / 2, Math.PI]) for (const s of [-1, 1]){ const a = o + s * .3; addProp('stakelamp', c.x + Math.cos(a) * R0 * .93, c.y + Math.sin(a) * R0 * .93 + 4, li); }
  // the land's plants evenly round the outside, clear of the trails
  for (let i = 0; i < 10; i++){ const a = (i + .5) / 10 * 6.283; if (gap(a) || Math.abs(a - 4.712) < .5) continue; const d = R0 * 1.22, t = th.deco[i % th.deco.length];
    if (PROP_TYPES[t]) addProp(t, c.x + Math.cos(a) * d, c.y + Math.sin(a) * d, Math.floor(r() * 3)); }
  NAV.grid = null;
};
