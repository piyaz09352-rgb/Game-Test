/* VAYRATHEN — js/gfx/themepal.js — (v128) regional monsters wear the colours of the land they are named after
   About 185 monsters are regional variants ("Sapphire Golem", "Asura Elephant", "Firefly Moth"…) whose colours were
   rolled at random — a sapphire golem came out pinkish-brown with green crystals. Now every colour in their look is
   taken from their land's palette (main · light · accent · dark), each species shifted a little so a land's monsters
   are kin but not copies:
     sapphire blue and ice · asura crimson, gold and black · the Milky Way indigo and starlight · fireflies dark green
     and glowing lime · magma black and lava · aurora teal and violet · rainbow falls a different hue for each · …
   Skin stays skin on people (only their clothes and hair change). Loaded after realism.js. */
'use strict';

const THEME_PAL = {   // [main, light, accent, dark]
  asuramaze:['#8a1e2a', '#c8505a', '#e3b04b', '#1e0e12'], milkyway:['#2e2a6a', '#6a68c8', '#e8ecff', '#12102e'], sunflower:['#f2c230', '#fff0a0', '#4a8a2a', '#5a3a10'],
  firefly:['#1e3a28', '#4a7a4a', '#d8ff6a', '#0e1a12'], goldbloom:['#e3b04b', '#fff0c0', '#f08aa8', '#7a5010'], sapphire:['#2a5ad8', '#6a9af0', '#bfe0ff', '#10204a'],
  skygarden:['#7cc4f0', '#d8f0ff', '#ffffff', '#2a5a8a'], gempalace:['#8a4ad8', '#d0b0ff', '#f0d070', '#2a1450'], sandcity:['#d8b878', '#f4e4b8', '#c0602a', '#6a4a20'],
  basalt:['#4a4a52', '#8a8a94', '#e8642a', '#1e1e22'], cinder:['#3a2e2a', '#7a5a4a', '#ff7a2a', '#1a1210'], snowpine:['#eef4fa', '#ffffff', '#2a6a4a', '#2a3a4a'],
  suncourt:['#f0c040', '#fff4c8', '#fffaf0', '#8a5a10'], orchard:['#6aa84a', '#c8e8a0', '#e04a3a', '#2a4a1a'], mangrove:['#5a6a3a', '#a8b878', '#8a6a4a', '#2a2a1a'],
  sulphur:['#e8d84a', '#fff8a8', '#8ac83a', '#4a4a1a'], magmariver:['#2a1a1a', '#5a3a30', '#ff5a1a', '#120808'], fjord:['#4a6a8a', '#a8c0d8', '#e8f0f8', '#1e2e3e'],
  glowcap:['#6a3a8a', '#c8a0e8', '#6af0f0', '#2a1a3a'], crimsonlake:['#b02a3a', '#e8a0a8', '#f08a9a', '#4a0e18'], oasis:['#2ab0a0', '#a8f0e0', '#e8d098', '#1a5a50'],
  cactus:['#5a9a4a', '#c8e8a0', '#f08ab0', '#2a4a2a'], aurora:['#3ad0b0', '#c0fff0', '#a06ae8', '#1a2a4a'], blizzard:['#d8ecff', '#ffffff', '#6aa0e8', '#3a5a8a'],
  gloom:['#3a2a4a', '#7a6a8a', '#8ac06a', '#140e1a'], hexspire:['#5a2a8a', '#a87ad8', '#6ae86a', '#1a0e2a'], galegorge:['#8a9ab0', '#d0dae6', '#f0f4f8', '#3a4a5a'],
  kingtomb:['#c8a868', '#eadcb0', '#e3b04b', '#4a3a1a']};
/* which part of the palette each look colour takes */
const TP_ROLE = {skin:0, body:0, shell:0, col:0, belly:1, wing:1, leg:1, top:0, sarong:1, acc:2, mane:2, crest:2, hood:2, tailCol:2, glow:2, eyeGlow:2, crystals:2, hatCol:2, stripe:3, pants:3, hair:3, dark:3, moss:1, beak:2, horn:2};
const tpHash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
function tpShift(hex, f){ const n = parseInt(hex.slice(1), 16); let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  const t = f > 0 ? 255 : 0, k = Math.abs(f); r += (t - r) * k; g += (t - g) * k; b += (t - b) * k;
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); }
function tpHue(hex, deg){ // rotate hue (rainbow falls)
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let h = 0, s = 0;
  if (d){ s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  h = (h + deg + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2;
  const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [R, G, B].map(v => Math.round((v + m0) * 255).toString(16).padStart(2, '0')).join(''); }
/* (v280) several colours on every creature: parts that came out in the body's own hue take a contrasting one
   (shell, mane, crest, wings, stripes, spots, horns, scutes…), and a belly in the body's hue turns pale and warm */
const TP_SECOND = new Set(['shell', 'mane', 'crest', 'wing', 'stripe', 'spots', 'horn', 'acc', 'tailCol', 'hood', 'scute', 'headStripe', 'ruff', 'crystals', 'moss', 'beak', 'hatCol', 'sarong', 'pants']);
function tpHsl3(hex){ const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l]; const s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, s, l]; }
function tpFromHsl(h, s, l){ h = ((h % 360) + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2;
  const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [R, G, B].map(v => Math.round(Math.min(1, Math.max(0, v + m0)) * 255).toString(16).padStart(2, '0')).join(''); }
function tpMulti(look, seed = 0){
  const main = [look.skin, look.body, look.col, look.top].find(v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)); if (!main) return look;
  const [mh, ms] = tpHsl3(main), step = [150, -150, 120, -120, 180][seed % 5];
  for (const k in look){ const v = look[k]; if (typeof v !== 'string' || !/^#[0-9a-f]{6}$/i.test(v) || v === main) continue;
    const [h, s, l] = tpHsl3(v), near = Math.abs(((h - mh + 540) % 360) - 180) < 32 || s < .12;
    if (k === 'belly' && near) look[k] = tpFromHsl(mh + 20, Math.min(.45, Math.max(.25, ms * .5)), Math.max(.74, l));
    else if (TP_SECOND.has(k) && near && !(s < .1 && l > .85)) look[k] = tpFromHsl(mh + step, Math.max(.45, s), Math.min(.7, Math.max(.3, l))); }
  return look; }
/* (v280) hue steps for the species of one land, and grey palettes get some colour so the turn shows */
const TP_STEP = [0, 40, -40, 85, -85, 130, -130, 180];
function tpVivid(hex, deg){ if (!deg) return hex;
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let l = (mx + mn) / 2, d = mx - mn, h = 0, s = 0;
  if (d){ s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  if (s < .3){ s = .48; h = 210; }                        // grey, white or black: give it a colour so the turn shows
  l = Math.min(.82, Math.max(.16, l));                    // pure white / pure black cannot carry a hue
  h = (h + deg + 720) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2;
  const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [R, G, B].map(v => Math.round((v + m0) * 255).toString(16).padStart(2, '0')).join(''); }
{ const _mk = BEAST.make;
  BEAST.make = function(key, spec){
    const th = typeof key === 'string' ? key.split('_')[0] : '';
    if (!spec || !key.includes('_') || (!THEME_PAL[th] && th !== 'rainbowfall') || ['croc', 'rat', 'boar'].includes(spec.head)) return _mk.call(this, key, spec);   // (v274) crocodiles keep a real crocodile's olive hide (a teal one looked like a toy)
    const h = tpHash(key), f = ((h % 7) - 3) * .045;   // each species a little lighter or darker
    // (v280) the owner: a land's monsters were all the same colour. Each species now turns the land's palette round the
    // colour wheel by its own step (the first keeps it), so a map shows several clear colours that still belong together
    const deg = TP_STEP[h % TP_STEP.length], degA = TP_STEP[(h >> 3) % TP_STEP.length] + 180;
    let pal = THEME_PAL[th];
    if (th === 'rainbowfall'){ const base = ['#e04a6a', '#f8b0c0', '#ffe060', '#5a1a2a'], deg = (h % 6) * 60; pal = base.map(c => tpHue(c, deg)); }
    const out = {...spec}, human = spec.arch === 'human';
    const main = [spec.skin, spec.body, spec.col, spec.shell, spec.top].find(v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) || pal[0], tpH = hex => { const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
    const rot = ((tpH(pal[0]) + deg - tpH(human && spec.top ? spec.top : main)) % 360 + 360) % 360;
    for (const [k, v] of Object.entries(spec)){ if (typeof v !== 'string' || !/^#[0-9a-f]{6}$/i.test(v)) continue;
      if (human && k === 'skin') continue;                  // people keep a skin colour
      // (v280) the owner: one colour from head to tail looked cheap. The species keeps its own mix of colours (shell vs
      // skin, belly, stripes, crest) and the whole set is turned round the wheel so its main colour lands on the
      // land's colour plus the species' own step: kin to the land, several colours each, no two species alike
      out[k] = tpShift(tpHue(v, rot), (TP_ROLE[k] ?? 1) === 3 ? -Math.abs(f) : f); }
    if (!human) tpMulti(out, h);
    return _mk.call(this, key, out);
  }; }
