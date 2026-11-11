/* VAYRATHEN — js/ui/skicons283.js — (v283) no two skills share a picture, anywhere in the game
   The owner: "หน้าตาของสกิลที่เป็น UI ก็ต้องไม่ซ้ำ". skicons2.js (v161) made the icons unique within a class; across
   classes 184 skills still drew from 123 glyphs, so a crown stood for seven different skills and a hand for five.
   Now:
   · thirty more glyphs, given to the skills that shared the busiest pictures (crown, hand, star, eye, heart, fang,
     paw, shield, spiral, cuts, axe …), each chosen from what the skill is;
   · whatever still shares a glyph after that gets a small sigil in the tile's corner (a dot, a ring, two dots, a
     chevron, a cross, a diamond, a crescent, a bolt, a triangle, a bar …), the second user of a glyph the first sigil,
     the third the second, and so on; neutral tiles also turn their colour a step round the wheel per sigil;
   · skiReport() lists any two skills that still look alike (tests/skicons283.test.js keeps it empty).
   The tile, ring and element colours are the game's own (ui/icons.js). Loaded after every skill file. */
'use strict';

Object.assign(GLYPH, {
  laurel:'<path d="M20 31c-7-2-11-7-11-15 4 1 7 4 8 8M20 31c7-2 11-7 11-15-4 1-7 4-8 8"/><path d="M14 13c2-1 4 0 5 2M26 13c-2-1-4 0-5 2M20 9v22"/>',
  medal:'<circle cx="20" cy="24" r="7"/><path d="M20 20v6l2 1.5M14 7l5 10M26 7l-5 10M14 7h5M26 7h-5"/>',
  candle:'<path d="M15 32h10M17 32V16h6v16"/><path d="M20 16c-3-3-3-6 0-9 3 3 3 6 0 9z"/>',
  claws:'<path d="M11 10c1 6 2 11 4 16M20 8c0 7 0 13 1 19M29 10c-1 6-2 11-4 16"/><path d="M9 31h22"/>',
  fangs:'<path d="M9 11h22l-3 6H12z"/><path d="M14 17l2 11 3-11M26 17l-2 11-3-11"/>',
  shinobi:'<circle cx="20" cy="20" r="11"/><path d="M9 18h22M12 23h16"/><path d="M31 15l4-5M31 15l5 1"/>',
  hands:'<path d="M8 22c2-4 5-5 8-3l4 3 4-3c3-2 6-1 8 3"/><path d="M12 25l6 4h4l6-4M14 19v-5M26 19v-5"/>',
  grip:'<path d="M12 18c0-4 3-7 8-7s8 3 8 7v9c0 2-1 3-3 3H15c-2 0-3-1-3-3z"/><path d="M12 22h16M16 11v-4M24 11v-4"/>',
  ledger:'<path d="M11 7h18v26H11z"/><path d="M15 13h10M15 18h10M15 23h6M15 28h4"/>',
  goldhand:'<path d="M13 30V18a2 2 0 014 0v4V14a2 2 0 014 0v8V16a2 2 0 014 0v6V19a2 2 0 014 0v7c0 4-3 7-7.5 7H19c-3 0-6-3-6-3z"/><path d="M8 8l1.5 3L13 12l-3.5 1L8 16l-1.5-3L3 12l3.5-1z"/>',
  pawstar:'<circle cx="20" cy="25" r="5"/><circle cx="13" cy="18" r="2"/><circle cx="18" cy="14" r="2"/><circle cx="24" cy="14" r="2"/><circle cx="29" cy="18" r="2"/><path d="M31 6l1 2.5 2.5.5-2 1.7.6 2.6L31 12l-2.1 1.3.6-2.6-2-1.7 2.5-.5z"/>',
  bladefan:'<path d="M20 31L10 9M20 31L16 7M20 31l4-24M20 31l10-22"/><path d="M15 31h10"/>',
  shuriken:'<path d="M20 7l3 10 10 3-10 3-3 10-3-10-10-3 10-3z"/><circle cx="20" cy="20" r="2.2"/>',
  footstar:'<path d="M14 30c-2-5 0-10 3-12 2-1 4 0 5 2 1 3 0 7-2 9-2 2-5 2-6 1z"/><circle cx="13" cy="14" r="1.6"/><circle cx="17" cy="11" r="1.6"/><circle cx="22" cy="11" r="1.6"/><path d="M29 8l1 2.4 2.5.3-1.9 1.7.6 2.5L29 13.6l-2.2 1.3.6-2.5-1.9-1.7 2.5-.3z"/>',
  ear:'<path d="M14 24c-3-5-2-12 4-15 5-2 10 1 11 6 1 4-2 7-4 9-2 2-2 5-4 7-2 1-5 0-5-3"/><path d="M19 15c3-1 5 1 5 3"/>',
  whisker:'<circle cx="20" cy="20" r="3"/><path d="M8 15l9 3M7 20h10M8 25l9-3M32 15l-9 3M33 20H23M32 25l-9-3"/>',
  scent:'<path d="M14 13c-2 4-1 8 2 10s4 6 2 9"/><path d="M20 10c-2 4-1 8 2 10s4 6 2 9"/><path d="M26 13c-2 4-1 8 2 10s4 6 2 9"/>',
  catface:'<path d="M10 14l2-7 6 5h4l6-5 2 7c1 8-3 15-10 15S9 22 10 14z"/><circle cx="16" cy="18" r="1.3"/><circle cx="24" cy="18" r="1.3"/><path d="M18 23h4l-2 2z"/>',
  ribbon:'<path d="M20 20l-9-6v12zM20 20l9-6v12z"/><circle cx="20" cy="20" r="2.5"/><path d="M17 23l-3 9M23 23l3 9"/>',
  collar:'<path d="M9 17c0 7 5 11 11 11s11-4 11-11"/><path d="M9 17c3-2 8-3 11-3s8 1 11 3"/><circle cx="20" cy="30" r="2.5"/><path d="M20 28v-1"/>',
  claws3:'<path d="M12 8c3 5 4 10 3 17M20 7c1 6 1 12-1 18M28 8c-3 5-4 10-3 17"/><path d="M14 30l-2 3M20 30v3M26 30l2 3"/>',
  jaw:'<path d="M9 13h22v6H9z"/><path d="M11 19l1 4 2-4 2 4 2-4 2 4 2-4 2 4 2-4 2 4 1-4"/><path d="M9 29h22"/>',
  bone:'<path d="M11 13a3 3 0 014 2l10 10a3 3 0 11-2 2L13 17a3 3 0 01-2-4z"/><path d="M9 15a3 3 0 102-4M29 29a3 3 0 10-2 4"/>',
  spring:'<path d="M12 32h16M14 30c0-3 12-3 12-6s-12-3-12-6 12-3 12-6-12-3-12-6"/>',
  pawprints:'<circle cx="13" cy="26" r="3"/><circle cx="9" cy="21" r="1.4"/><circle cx="12" cy="18" r="1.4"/><circle cx="16" cy="19" r="1.4"/><circle cx="27" cy="14" r="3"/><circle cx="23" cy="9" r="1.4"/><circle cx="26" cy="6" r="1.4"/><circle cx="30" cy="7" r="1.4"/>',
  pawshield:'<path d="M20 7l10 4v7c0 7-4.4 11.4-10 14-5.6-2.6-10-7-10-14v-7z"/><circle cx="20" cy="22" r="2.6"/><circle cx="16" cy="17" r="1.3"/><circle cx="19" cy="15" r="1.3"/><circle cx="22" cy="15" r="1.3"/><circle cx="25" cy="17" r="1.3"/>',
  armor:'<path d="M12 10l8-3 8 3v9c0 7-3 11-8 14-5-3-8-7-8-14z"/><path d="M12 15h16M20 7v26"/>',
  wall:'<path d="M8 12h24v20H8z"/><path d="M8 18h24M8 25h24M16 12v6M24 18v7M14 25v7M26 25v7"/>',
  fur:'<path d="M9 28c2-6 3-10 2-16 3 4 5 9 5 14M16 26c1-7 1-12-1-18 4 4 6 9 7 16M23 27c2-7 3-12 2-18 3 4 5 9 5 15M29 29c1-5 1-9 0-13 2 3 3 7 3 12"/>',
  axespin:'<path d="M20 20L13 13"/><path d="M8 7c4-1 8 1 9 5-3 0-5 2-6 5-3-2-4-6-3-10z"/><path d="M26 10a12 12 0 0110 10M30 27a12 12 0 01-10 7M10 30a12 12 0 01-4-10"/>',
  arc:'<path d="M8 26c6-13 18-13 24 0"/><path d="M8 26l3-5M32 26l-3-5M11 31c5-8 13-8 18 0"/>',
  fangspin:'<path d="M20 20l-4-9 6 6 6-6-4 9 9 1-8 3 5 8-7-5-3 9-3-9-7 5 5-8-8-3z"/>',
  kingsword:'<path d="M20 31V12M16 12h8M14 17h12"/><path d="M14 10l-1-5 3 2 4-4 4 4 3-2-1 5z"/>',
  fissure:'<path d="M8 30l6-9-3-4 7-5-2-5 6 3"/><path d="M14 21l4 2 3-5 5 1 3-3 3 2"/><path d="M8 34h24"/>',
  cleaver:'<path d="M9 23h14l7-9H16z"/><path d="M23 23l6 7M12 23l2 9"/>',
  lunge:'<path d="M7 29l10-10"/><path d="M15 19l12-12 3 3-12 12z"/><path d="M26 10l4 4M8 31l2-2"/>',
  crosshair:'<circle cx="20" cy="20" r="9"/><path d="M20 5v6M20 29v6M5 20h6M29 20h6"/><circle cx="20" cy="20" r="1.5"/>',
  boomerang:'<path d="M9 27c2-9 8-15 17-17 3-1 5 1 4 4-1 2-3 2-6 3-6 2-9 6-10 11-1 3-5 2-5-1z"/><path d="M26 7l2 3"/>'
});

/* the skills that shared the busiest pictures: each gets one of the new glyphs (or a free old one) that fits it */
const SKI_PICK = {
  emperorgrace:'laurel', peerless:'medal', hexmastery:'candle', royalclaws:'claws', kingfang:'fangs', kagemastery:'shinobi',
  unity:'hands', grabthrow:'grip', debtcollect:'ledger', midasstrike:'goldhand',
  starpounce:'pawstar', bladeart:'bladefan', shurikenstorm:'shuriken', starstep:'footstar',
  thiefsense:'ear', catreflex:'whisker', hunterinstinct:'scent',
  cuteface:'catface', royalcharm:'ribbon', loyalheart:'collar',
  wildclaws:'claws3', bite:'jaw', crunch:'bone',
  tigerpounce:'spring', pounce:'pawprints', guardianpaw:'pawshield',
  goldbody:'armor', shieldwall:'wall', ironfur:'fur',
  axewhirl:'axespin', goldenarc:'arc', fangspin:'fangspin', warking:'kingsword', earthsplit:'fissure', cleavestrike:'cleaver', shadowlunge:'lunge', deadeye:'crosshair',
  assassinate:'cut', deathmark:'pin', silentkill:'feather', doomcurse:'nova', axestorm:'boomerang'
};
/* small corner marks, in the order they are handed out to the second, third … user of a glyph */
const SKI_SIGIL = [
  '', '<circle cx="31" cy="31" r="2" fill="#fff8e0" stroke="none"/>', '<circle cx="31" cy="31" r="2.8"/>', '<circle cx="28.5" cy="31" r="1.5" fill="#fff8e0" stroke="none"/><circle cx="33.5" cy="31" r="1.5" fill="#fff8e0" stroke="none"/>',
  '<path d="M28 32l3-3 3 3"/>', '<path d="M28 28l6 6M34 28l-6 6"/>', '<path d="M31 27.5l3.5 3.5-3.5 3.5-3.5-3.5z"/>', '<path d="M33.5 28a3.6 3.6 0 100 6 2.8 2.8 0 010-6z" fill="#fff8e0" stroke="none"/>',
  '<path d="M32 27l-3 4h3l-1 4 3.5-5H32z" fill="#fff8e0" stroke="none"/>', '<path d="M31 27.5l3.5 6h-7z"/>', '<path d="M27.5 31h7"/>', '<path d="M31 27v8M27 31h8"/>',
  '<circle cx="9" cy="31" r="2" fill="#fff8e0" stroke="none"/>', '<circle cx="9" cy="31" r="2.8"/>', '<path d="M6 32l3-3 3 3"/>', '<path d="M6 28l6 6M12 28l-6 6"/>', '<path d="M9 27.5l3.5 3.5L9 34.5 5.5 31z"/>', '<path d="M9 27.5l3.5 6h-7z"/>', '<path d="M5.5 31h7"/>', '<path d="M9 27v8M5 31h8"/>'
];
const SKI = {of:{}, built:false};
const skiRot = (hex, deg) => { const n = parseInt(hex.slice(1), 16); let r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let h = 0, s = 0;
  if (d){ s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  h = (h + deg + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2;
  const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [R, G, B].map(v => Math.round((v + m0) * 255).toString(16).padStart(2, '0')).join(''); };
/* every skill of every class, in class order: the first user of a glyph keeps it plain, the next ones take a sigil */
function skiBuild(){
  SKI.built = true; SKI.of = {}; const order = [];
  for (const j of Object.values(JOBS)) for (const id of (j.skills || [])) if (!order.includes(id)) order.push(id);
  for (const id in SKILLS) if (!order.includes(id)) order.push(id);
  const users = {};
  for (const id of order){ const sk = SKILLS[id]; if (!sk) continue;
    const base = SKI_PICK[id] && GLYPH[SKI_PICK[id]] ? SKI_PICK[id] : SKI.base(sk);
    const n = users[base] || 0; users[base] = n + 1;
    const k = Math.min(n, SKI_SIGIL.length - 1); SKI.of[id] = {base, k, glyph:k ? `${base}_s${k}` : base};
    if (k && !GLYPH[SKI.of[id].glyph]) GLYPH[SKI.of[id].glyph] = GLYPH[base] + SKI_SIGIL[k]; }
}
{ const _sg = skillGlyph; SKI.base = sk => _sg(sk);
  skillGlyph = function(sk){ const id = sk && (sk.id || Object.keys(SKILLS).find(k => SKILLS[k] === sk)); if (!SKI.built) skiBuild(); const o = id && SKI.of[id]; return o ? o.glyph : _sg.apply(this, arguments); }; }
/* a neutral tile turns its colour a step round the wheel per sigil, so the tiles differ as well as the marks */
{ const _iv = iconSvg;
  iconSvg = function(glyph, el){ const m = /_s(\d+)$/.exec(glyph || ''); if (m && el === 'neutral'){ const key = 'neutralS' + m[1];
      if (!ICON_EL[key]){ const deg = (+m[1]) * 37; ICON_EL[key] = [skiRot(ICON_EL.neutral[0], deg), skiRot(ICON_EL.neutral[1], deg)]; } el = key; }
    return _iv.call(this, glyph, el); }; }
/* any two skills that still look alike: [] when every icon is its own */
function skiReport(){ if (!SKI.built) skiBuild(); const seen = {}, out = [], shown = new Set(Object.values(JOBS).flatMap(j => j.skills || []));
  for (const id in SKI.of){ if (!shown.has(id)) continue;   // retired skills no class lists are never drawn
    const sk = SKILLS[id], el = sk.type === 'heal' ? 'heal' : sk.fx === 'poison' || sk.fx === 'poisonblade' || sk.fx === 'smokeCloud' ? 'poison' : sk.elem || 'neutral', key = SKI.of[id].glyph + '|' + el;
    if (seen[key]) out.push(`${seen[key]} ~ ${id} (${key})`); else seen[key] = id; }
  return out; }
