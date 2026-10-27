/* VAYRATHEN — js/ui/itemart.js
   Item art: every item is drawn as what it is, in colour, on a lacquer tile framed by rarity.
   Potions are glass flasks of their own liquid, arrows show their elemental heads, each weapon / armour / helm /
   accessory has its own shape and tier metal, and monster materials are drawn by family (feather, scale, hide,
   ooze, slick skin, carapace, spirit ash, rubble, charm) in the colours of the monster's element.
   itemArt(id) → inline SVG (bag, hotbar, shops, equipment) · itemArtImg(id) → cached Image for the ground drops. */
'use strict';

const IA_EL = {neutral:['#f6e2b8', '#b48a5a', '#4e3420'], earth:['#f0c888', '#b0762e', '#4a2c10'], water:['#c4ecff', '#3c8ed6', '#103866'],
  fire:['#ffd890', '#ec5a1e', '#6a1608'], wind:['#d4ffe0', '#4cbc7c', '#124a30'], holy:['#fffbe2', '#f2c444', '#7a5410'],
  shadow:['#e6d0ff', '#7c4ac4', '#281046'], poison:['#e4ff9a', '#8ac834', '#2c4610']};
// weapon / gear tier metals: apprentice iron · steel · ember · obsidian · naga jade · solar gold
const IA_TIER = [['#e6ebf2', '#98a2b4', '#454e62'], ['#ffffff', '#b8c4d8', '#56607a'], ['#fff0b0', '#ff8a3a', '#8a2410'],
  ['#c4b0ec', '#4c3c6c', '#160f22'], ['#dcfff2', '#3ccaa8', '#0e5a50'], ['#ffffff', '#ffd048', '#a86a08']];
const IA_FRAME = ['#9a6a3a', '#c9cfda', '#e3b04b', '#c08aff', '#ff9a5a'];   // common · fine · rare · epic · legendary
const OL = 'stroke="#1c0f08" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"';

const lg = (id, c, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${c.map((s, i) => `<stop offset="${i / (c.length - 1)}" stop-color="${s}"/>`).join('')}</linearGradient>`;
const rg = (id, c, cx = .38, cy = .32, r = .75) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${c.map((s, i) => `<stop offset="${i / (c.length - 1)}" stop-color="${s}"/>`).join('')}</radialGradient>`;
const iaHash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

/* ---------- shapes: each returns [defs, body] ---------- */
const IA = {
  // glass flask: shape 'round' | 'big' | 'tall' | 'elixir'
  flask(p, liq, shape){
    const body = shape === 'tall' ? 'M16.5 9h7v6c4 2 5.5 5 5.5 9v6.5a3 3 0 01-3 3H14a3 3 0 01-3-3V24c0-4 1.5-7 5.5-9z'
      : shape === 'elixir' ? 'M17 9h6v4l2 1c4 2.5 5 6 5 10 0 5.6-4.4 9.5-10 9.5S10 29.6 10 24c0-4 1-7.5 5-10l2-1z'
      : shape === 'big' ? 'M17 8h6v6.4a11 11 0 11-6 0z' : 'M17.2 9h5.6v6.8a9 9 0 11-5.6 0z';
    const ly = shape === 'tall' ? 20 : shape === 'big' ? 21 : 22;
    return [rg(p + 'l', liq, .4, .3, .8) + `<clipPath id="${p}c"><path d="${body}"/></clipPath>`,
      `<path d="${body}" fill="rgba(220,240,255,.18)"/>
       <rect x="0" y="${ly}" width="40" height="20" fill="url(#${p}l)" clip-path="url(#${p}c)"/>
       <ellipse cx="20" cy="${ly}" rx="8" ry="1.3" fill="${liq[0]}" opacity=".75" clip-path="url(#${p}c)"/>
       <path d="${body}" fill="none" ${OL}/>
       <path d="M13.6 ${ly + 3}c-.6 2.4 0 5 1.6 6.6" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>
       <rect x="16" y="5.6" width="8" height="4.4" rx="1.2" fill="#a8703c" ${OL}/><path d="M16.6 7.4h6.8" stroke="#d8a46c" stroke-width=".8"/>
       ${shape === 'elixir' ? `<path d="M15.6 13.4h8.8" stroke="#f2c444" stroke-width="1.6"/><path d="M28 9l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM10 15l.7 1.4 1.4.6-1.4.6-.7 1.4-.7-1.4-1.4-.6 1.4-.6z" fill="#fff6c0"/>` : ''}`];
  },
  talisman(p){
    return [lg(p + 'a', ['#fff3b8', '#f0c860', '#c89430']),
      `<g transform="rotate(-8 20 20)"><rect x="12" y="5" width="16" height="30" rx="1" fill="url(#${p}a)" ${OL}/>
       <rect x="13.8" y="6.8" width="12.4" height="26.4" fill="none" stroke="#c4222a" stroke-width=".9"/>
       <path d="M16.5 10.5h7M20 10.5v16M16.5 14.5q3.5 3 7 0M16.5 20q3.5-3 7 0M17 24h6" fill="none" stroke="#c4222a" stroke-width="1.3" stroke-linecap="round"/>
       <circle cx="20" cy="29.5" r="2.2" fill="#c4222a"/></g>`];
  },
  arrows(p, tip, fl){
    let b = '';
    for (const [ox, oy] of [[-3.4, 1.4], [0, 0], [3.4, -1.4]]){
      const x0 = 9 + ox, y0 = 31 + oy, x1 = 28 + ox, y1 = 12 + oy;
      b += `<path d="M${x0} ${y0}L${x1} ${y1}" stroke="#1c0f08" stroke-width="3" stroke-linecap="round"/><path d="M${x0} ${y0}L${x1} ${y1}" stroke="#d8b06c" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M${x1 + 4} ${y1 - 4}l-6.2 1.6 4.6 4.6z" fill="url(#${p}t)" ${OL}/>
        <path d="M${x0 + 1} ${y0 - 1}l-5.2-1 1.6-2.6 4.6 1.2zM${x0 + 1} ${y0 - 1}l1 5.2 2.6-1.6-1.2-4.6z" fill="${fl}" ${OL}/>`;
    }
    return [lg(p + 't', tip, 0, 0, 1, 1), b];
  },
  feather(p, c){
    return [lg(p + 'f', [c[0], c[1], c[2]], 1, 0, 0, 1),
      `<path d="M31 6C20 8.5 10.5 18 9.5 31.5 16 30.5 28 22 31 6z" fill="url(#${p}f)" ${OL}/>
       <path d="M24.5 13.5l-4-1.6M21 18l-4.4-.6M17.4 22.6l-4.4.2M24.5 13.5l1.2 3.6M21 18l1 4M17.4 22.6l.6 3.6" stroke="${c[2]}" stroke-width=".9" opacity=".65"/>
       <path d="M31 6L8 34" stroke="#fff6dc" stroke-width="1.4" stroke-linecap="round"/><path d="M11 30.4L7.5 34.6" stroke="#1c0f08" stroke-width="1.6" stroke-linecap="round"/>`];
  },
  scale(p, c){
    const one = (x, y) => `<path d="M${x} ${y - 8}c6.4 1.2 7.6 8.6 0 15.6-7.6-7-6.4-14.4 0-15.6z" fill="url(#${p}s)" ${OL}/><path d="M${x - 2.4} ${y - 4.2}c.6-1.6 1.8-2.4 3-2.6" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".75"/><path d="M${x} ${y - 5}v10" stroke="${c[2]}" stroke-width=".8" opacity=".5"/>`;
    return [rg(p + 's', [c[0], c[1], c[2]]), one(20, 14) + one(13, 24) + one(27, 24)];
  },
  hide(p, fur, pat){
    const path = 'M20 6.5l4 1.5 2 4h6l-1 4.2-4 1v9l4.6 4.2-3 2.6-3.6-3.8-2.6 1.2L20 35l-2.4-4.6-2.6-1.2-3.6 3.8-3-2.6 4.6-4.2v-9l-4-1L8 12h6l2-4z';
    const ptn = pat === 'stripe' ? `<path d="M15 15l3 2M25 15l-3 2M14 20l4 1.4M26 20l-4 1.4M14.6 25l3.6.6M25.4 25l-3.6.6M20 12v3" stroke="#22140c" stroke-width="1.5" stroke-linecap="round" clip-path="url(#${p}c)"/>`
      : pat === 'spot' ? `<g fill="#3a2414" clip-path="url(#${p}c)"><circle cx="16" cy="16" r="1.4"/><circle cx="23" cy="18" r="1.6"/><circle cx="18" cy="23" r="1.5"/><circle cx="24" cy="25" r="1.3"/><circle cx="15" cy="27" r="1.2"/></g>`
      : `<path d="M20 9v20" stroke="${fur[2]}" stroke-width="2.4" opacity=".35" clip-path="url(#${p}c)"/>`;
    return [rg(p + 'h', fur, .5, .45, .7) + `<clipPath id="${p}c"><path d="${path}"/></clipPath>`,
      `<path d="${path}" fill="url(#${p}h)" ${OL}/>${ptn}<path d="${path}" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="1.2 1.6" opacity=".35" transform="translate(20 20) scale(.84) translate(-20 -20)"/>`];
  },
  ooze(p, c){
    return [rg(p + 'o', ['#ffffff', c[0], c[1], c[2]], .4, .3, .8),
      `<path d="M9 30c-2-8 4.6-10 5.6-14.6 1.2-5.6 9.6-5.6 10.8 0C26.4 20 33 22 31 30c-1 2.6-21 2.6-22 0z" fill="url(#${p}o)" ${OL}/>
       <path d="M17 31.4c.4 2.6 1 3.6 1.8 3.6s1.2-1.2 1.2-3.4" fill="${c[1]}" ${OL}/>
       <ellipse cx="17" cy="17" rx="2" ry="1.3" fill="#fff" opacity=".85"/><circle cx="24" cy="24" r="1" fill="#fff" opacity=".6"/><circle cx="13.5" cy="25.5" r=".7" fill="#fff" opacity=".6"/>`];
  },
  slick(p, c){
    return [lg(p + 'k', [c[0], c[1], c[2]], 0, 0, 1, 1),
      `<path d="M7 14c6-5 12 3 18-2 3-2.4 6-2 8-1l-1 16.6c-6 5-12-4-18 1-3 2.4-5 1.6-6.4.6z" fill="url(#${p}k)" ${OL}/>
       <path d="M10.4 16.6c4-2.6 8 2.2 13.2-.6" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>
       <g fill="${c[2]}" opacity=".5"><circle cx="15" cy="22" r="1.1"/><circle cx="21" cy="25" r="1.3"/><circle cx="26" cy="19" r="1"/></g>`];
  },
  carapace(p, c){
    return [rg(p + 'p', [c[0], c[1], c[2]], .45, .25, .85),
      `<path d="M6.5 28C6.5 15.6 13.6 8.6 20 8.6S33.5 15.6 33.5 28z" fill="url(#${p}p)" ${OL}/>
       <path d="M12 28c0-9 3.6-15.4 8-19M28 28c0-9-3.6-15.4-8-19M20 9v19M8.4 20.6h23.2" fill="none" stroke="${c[2]}" stroke-width="1" opacity=".7"/>
       <rect x="5.5" y="27.4" width="29" height="4" rx="2" fill="${c[2]}" ${OL}/><path d="M14 13.4c1.6-1.8 3.4-2.6 5-2.8" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`];
  },
  ash(p, c){
    return [lg(p + 'u', ['#9a8aa8', '#5a4a66', '#2c2234']) + rg(p + 'w', ['#ffffff', c[0], c[1]], .5, .6, .7),
      `<path d="M20 19C14.6 15 22 11.4 17.6 5.4 25.6 8.4 26.4 15 20 19z" fill="url(#${p}w)" opacity=".92" style="filter:drop-shadow(0 0 2.5px ${c[1]})"/>
       <path d="M15.6 19.4h8.8v3h-8.8z" fill="url(#${p}u)" ${OL}/>
       <path d="M15 22.4c-3.6 3-3.6 11 5 11s8.6-8 5-11z" fill="url(#${p}u)" ${OL}/>
       <path d="M14 27.4h12" stroke="#f2c444" stroke-width="1" opacity=".8"/><path d="M16.4 25.4c-.6 1.6-.6 3.2 0 4.6" stroke="#fff" stroke-width="1" opacity=".5"/>`];
  },
  rubble(p, c){
    return [lg(p + 'r', [c[0], c[1], c[2]], 0, 0, 1, 1),
      `<path d="M14 19l3-7 6-1 2.4 6-6 3z" fill="url(#${p}r)" ${OL}/>
       <path d="M6.6 30L10 21.6l7-1.6 3 6-4 6.4z" fill="url(#${p}r)" ${OL}/>
       <path d="M18.4 31.4l2.4-11 7.4-3 5 6.2-2 7.8z" fill="url(#${p}r)" ${OL}/>
       <path d="M24 22l1.6 4.4-2.4 2.6M11.4 25l3 1.6" fill="none" stroke="${c[2]}" stroke-width="1"/><path d="M10.6 23l2.4-.8M21.6 22.4l2-.8" stroke="#fff" stroke-width="1" opacity=".6"/>`];
  },
  charm(p, c){
    return [rg(p + 'm', [c[0], c[1], c[2]]),
      `<path d="M13 5.6Q20 15 27 5.6" fill="none" stroke="#c4222a" stroke-width="1.6"/>
       <circle cx="20" cy="21.4" r="9" fill="url(#${p}m)" ${OL}/><circle cx="20" cy="21.4" r="6.6" fill="none" stroke="#f2c444" stroke-width="1.1"/>
       <path d="M20 16.4v10M15 21.4h10M16.6 18l6.8 6.8M23.4 18l-6.8 6.8" stroke="${c[2]}" stroke-width="1.1" stroke-linecap="round"/>
       <circle cx="20" cy="12.6" r="1.6" fill="#f2c444" ${OL}/><path d="M18.6 30.4l-.8 5M21.4 30.4l.8 5M20 30.4v5.4" stroke="#c4222a" stroke-width="1.2" stroke-linecap="round"/>`];
  },
  // ---------- specials ----------
  jelly(p){ return [rg(p + 'j', ['#ffffff', '#c4ecff', '#5aaee0', '#1c5a8a'], .38, .3, .8),
      `<path d="M8.6 28c-1.6-7 1-14.6 5-17 3.6-2.2 9.2-2.2 12.8 0 4 2.4 6.6 10 5 17-1 3.6-21.8 3.6-22.8 0z" fill="url(#${p}j)" ${OL}/>
       <ellipse cx="15.4" cy="15.4" rx="2.6" ry="1.6" fill="#fff" opacity=".9"/><circle cx="16.4" cy="23" r="1.4" fill="#123048"/><circle cx="23.6" cy="23" r="1.4" fill="#123048"/><path d="M18.6 26.4q1.4 1.2 2.8 0" stroke="#123048" stroke-width="1" fill="none" stroke-linecap="round"/>`]; },
  tusk(p){ return [lg(p + 'k', ['#ffffff', '#f2e8cc', '#c4b48a'], 0, 0, 1, 1),
      `<path d="M9.6 32.4C9.6 20 17.6 10 31.6 7.4 25 12.6 18.6 21.6 15.6 33.4z" fill="url(#${p}k)" ${OL}/>
       <path d="M9.4 29.6l6.6 1.6-.4 2.2-6.4-1z" fill="#8a5a34" ${OL}/><path d="M14 24c2.4-5.6 6.6-10.4 12-13.6" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>`]; },
  wick(p){ return [rg(p + 'f', ['#ffffff', '#ffe08a', '#ff8a2a', '#c4401a'], .5, .62, .7),
      `<rect x="14.6" y="20" width="10.8" height="13" rx="1.4" fill="#f6eedc" ${OL}/><path d="M14.6 22.6c2 1.4 3.6-.4 5.4.6s3.4-.6 5.4.4" fill="none" stroke="#d6c8a8" stroke-width="1"/>
       <path d="M20 20v-3" stroke="#1c0f08" stroke-width="1.2"/>
       <path d="M20 17.4c-3.6 0-4.6-3.4-2.6-6.4 1-1.6 2.2-3 2.6-5 2.6 2.6 5 5.4 3.4 8.6-.6 1.6-1.8 2.8-3.4 2.8z" fill="url(#${p}f)" style="filter:drop-shadow(0 0 3px #ffa040)"/>`]; },
  crown(p){ return [lg(p + 'g', ['#fff6c0', '#f2c444', '#a8701c']),
      `<path d="M7.6 29L9.4 13.6l5.6 7 5-10.4 5 10.4 5.6-7L32.4 29z" fill="url(#${p}g)" ${OL}/><rect x="7" y="27.6" width="26" height="5" rx="1.4" fill="url(#${p}g)" ${OL}/>
       <circle cx="20" cy="30" r="1.8" fill="#5ab4ff" ${OL}/><circle cx="13" cy="30" r="1.2" fill="#ff6a6a"/><circle cx="27" cy="30" r="1.2" fill="#ff6a6a"/>
       <circle cx="9.4" cy="13" r="1.4" fill="#c4ecff" ${OL}/><circle cx="20" cy="10.4" r="1.6" fill="#c4ecff" ${OL}/><circle cx="30.6" cy="13" r="1.4" fill="#c4ecff" ${OL}/>`]; },
  ore(p){ return [lg(p + 'r', ['#a89a90', '#6a5c54', '#3a302a'], 0, 0, 1, 1) + lg(p + 'c', ['#ffffff', '#8ad8ff', '#2a74c4'], 0, 0, 1, 1),
      `<path d="M6 30l4-10 8-4 10 2 6 8-2 6H8z" fill="url(#${p}r)" ${OL}/>
       <path d="M13 23l2-12 4 3-1 10zM19 24l4-15 4 5-3 11zM25 26l4-8 2.6 4-2 5z" fill="url(#${p}c)" ${OL} style="filter:drop-shadow(0 0 2px #6cc6ff)"/>
       <path d="M21.6 11.6l-1.6 7M15 14l-.6 5" stroke="#fff" stroke-width="1" opacity=".8"/>`]; },
  shard(p){ return [lg(p + 's', ['#d4dcf0', '#8a94b4', '#3a4260'], 0, 0, 1, 1),
      `<path d="M9 13l9-6 13 5-2 15-9 7-11-6z" fill="url(#${p}s)" ${OL}/>
       <path d="M20 13v14M14.6 17h10.8M15.6 24h8.8M17 13.6l6 13.4M23 13.6L17 27" stroke="#ffe08a" stroke-width="1.2" stroke-linecap="round" style="filter:drop-shadow(0 0 2px #f2c444)"/>
       <path d="M11 14.6l6.6-4.4" stroke="#fff" stroke-width="1.1" opacity=".7"/>`]; }
};

/* ---------- gear ---------- */
/* tiger-claw gauntlets: a metal glove with three curved claws out of the knuckles */
function iaClaw(p, t){
  const c = IA_TIER[t] || IA_TIER[0], d = lg(p + 'b', [c[0], c[1], c[2]], 0, 0, 1, 1), glow = t >= 2 ? ` style="filter:drop-shadow(0 0 2px ${c[1]})"` : '', trim = t >= 3 ? '#f2c444' : '#c8ccd8';
  const claw = x => `<path d="M${x} 21 C${x - 1} 13 ${x + 2} 7 ${x + 7} 4 C${x + 4} 9 ${x + 3} 14 ${x + 3.4} 21z" fill="url(#${p}b)" ${OL}${glow}/>`;
  return [d, `${claw(9)}${claw(15)}${claw(21)}<path d="M7 20h22l-1.4 7H8.4z" fill="#8a8f9a" ${OL}/><path d="M8 22.5h20" stroke="${trim}" stroke-width="1.6"/><path d="M10 27h16l-1 8H11z" fill="#6a6f7a" ${OL}/><path d="M12 30.5h12" stroke="${trim}" stroke-width="1.2"/>`];
}
/* boxing gloves: a pair of big padded gloves */
function iaGlove(p, t){
  const col = ['#d83a3a', '#d83a3a', '#2f4a9a', '#2a2a34', '#1e8a80', '#e8b030'][t] || '#d83a3a', cuff = t >= 3 ? '#f2c444' : '#f4efe4';
  const one = tr => `<g transform="${tr}"><path d="M8 20c0-7 4-11 9-11s8 4 8 10c0 5-3 8-8 8H11c-2 0-3-2-3-7z" fill="${col}" ${OL}/><path d="M12 12c2-1.4 5-1.6 7 0" stroke="#fff" stroke-width="1.4" opacity=".55" fill="none"/><rect x="9" y="26" width="13" height="5" rx="1.6" fill="${cuff}" ${OL}/></g>`;
  return ['', one('translate(-1 2)') + one('translate(41 4) scale(-1 1)')];
}
function iaWeapon(p, w, t){
  const c = IA_TIER[t] || IA_TIER[0], guard = t === 0 ? '#8a5a34' : '#f2c444', gem = t >= 2 ? `<circle cx="13.6" cy="26.4" r="1.6" fill="${t === 3 ? '#ff5a5a' : c[0]}" ${OL}/>` : '';
  const d = lg(p + 'b', [c[0], c[1], c[2]], 0, 0, 1, 1), glow = t >= 2 ? ` style="filter:drop-shadow(0 0 2px ${c[1]})"` : '';
  if (w === 'sword') return [d, `<path d="M33.6 6.4l-1.4 5.4-15.4 15.4-3.6-3.6L28.6 8z" fill="url(#${p}b)" ${OL}${glow}/><path d="M32.6 7.4L16 24" stroke="${c[0]}" stroke-width=".9" opacity=".9"/>
      <path d="M9.6 21.4l9 9" stroke="#1c0f08" stroke-width="4.4" stroke-linecap="round"/><path d="M9.6 21.4l9 9" stroke="${guard}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M13.4 27.2L8 32.6" stroke="#1c0f08" stroke-width="4" stroke-linecap="round"/><path d="M13.4 27.2L8 32.6" stroke="#6a3a22" stroke-width="2.4" stroke-linecap="round"/><circle cx="7.4" cy="33.2" r="2.2" fill="${guard}" ${OL}/>${gem}`];
  if (w === 'dagger'){ const one = (tr) => `<g transform="${tr}"><path d="M28.6 7.6l-.6 4.6-8.6 8.6-2.6-2.6 8.6-8.6z" fill="url(#${p}b)" ${OL}${glow}/><path d="M15.6 16.6l6 6" stroke="#1c0f08" stroke-width="3.4" stroke-linecap="round"/><path d="M15.6 16.6l6 6" stroke="${guard}" stroke-width="1.8" stroke-linecap="round"/><path d="M18.2 21.4l-4.4 4.4" stroke="#1c0f08" stroke-width="3.4" stroke-linecap="round"/><path d="M18.2 21.4l-4.4 4.4" stroke="#6a3a22" stroke-width="2" stroke-linecap="round"/></g>`;
    return [d, one('translate(-3 6)') + one('translate(43 6) scale(-1 1)')]; }
  if (w === 'staff'){ const shaft = ['#8a5a34', '#8a5a34', '#5a1e1a', '#2a2a34', '#1e6a64', '#c48a1c'][t] || '#8a5a34';
    return [rg(p + 'o', ['#ffffff', c[0], c[1]], .4, .35, .7), `<path d="M9 34L25 14" stroke="#1c0f08" stroke-width="4" stroke-linecap="round"/><path d="M9 34L25 14" stroke="${shaft}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M22.4 17.4c-2.6-3.6-1.6-8 1-10M26.4 18.6c3.6 1.4 7.4.2 9-2.4" fill="none" stroke="#f2c444" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="28" cy="11.6" r="5.2" fill="url(#${p}o)" ${OL} style="filter:drop-shadow(0 0 3px ${c[1]})"/><circle cx="26.4" cy="10" r="1.4" fill="#fff" opacity=".9"/><path d="M15 26.6l2 1.6" stroke="#f2c444" stroke-width="2"/>`]; }
  if (w === 'fist') return [d, `<path d="M8 16c0-2.4 2-4 4.4-4h15.2c2.4 0 4.4 1.6 4.4 4v6c0 4-2.4 6.4-6 6.4H14c-3.6 0-6-2.4-6-6.4z" fill="url(#${p}b)" ${OL}${glow}/>
      <g fill="#1c120e" ${OL}><circle cx="12.4" cy="18" r="2.4"/><circle cx="17.6" cy="18" r="2.4"/><circle cx="22.8" cy="18" r="2.4"/><circle cx="28" cy="18" r="2.4"/></g>
      <path d="M12 28.4h16v4.6H12z" fill="#6a3a22" ${OL}/>${t >= 2 ? `<path d="M10.6 12l1.8-5 1.8 5M16 12l1.8-5.6 1.8 5.6M21.4 12l1.8-5.6 1.8 5.6M26.8 12l1.8-5 1.8 5" fill="${c[0]}" ${OL}/>` : ''}`];
  // bow
  return [d, `<path d="M12 5c19 6 19 24 0 30" fill="none" stroke="#1c0f08" stroke-width="4.2" stroke-linecap="round"/><path d="M12 5c19 6 19 24 0 30" fill="none" stroke="url(#${p}b)" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M12 5v30" stroke="#f6eedc" stroke-width=".9"/><path d="M7 20h24" stroke="#1c0f08" stroke-width="2.6" stroke-linecap="round"/><path d="M7 20h24" stroke="#d8b06c" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M34.6 20l-4.4-2.4v4.8z" fill="${c[1]}" ${OL}/><path d="M7.6 20l-2.6-2.4M7.6 20l-2.6 2.4" stroke="#f06e5a" stroke-width="1.6" stroke-linecap="round"/><rect x="22.2" y="17.4" width="3" height="5.2" rx="1" fill="#6a3a22" ${OL}/>`];
}
const IA_SHIRT = 'M13 8L7.6 11.4 5.6 19.4l4.6 2 1-3.4V33h17.6V18l1 3.4 4.6-2-2-8L27 8c-1.6 3-3.8 4.2-7 4.2S14.6 11 13 8z';
const IA_VEST = 'M13 8l-2.6 4 .8 21h17.6l.8-21L27 8c-1.6 3.6-3.8 5-7 5s-5.4-1.4-7-5z';
function iaArmor(p, id){
  const A = {
    a_cotton:[['#ffffff', '#f2ece0', '#c8bea8'], 'shirt', 'plain'], a_buffalo:[['#e6b484', '#a8703c', '#5a3820'], 'vest', 'stitch'],
    a_rattan:[['#fbe6a8', '#d8b064', '#8a6428'], 'shirt', 'weave'], a_padded:[['#ff9a8f', '#c43c4a', '#5a1528'], 'shirt', 'quilt'],
    a_scale:[['#ffffff', '#b8c4d8', '#56607a'], 'shirt', 'scale'], a_yantra:[['#ffffff', '#f0ece4', '#bcb4a4'], 'shirt', 'yantra'],
    a_naga:[['#9af0e0', '#24a098', '#0a4440'], 'shirt', 'scale'], a_suvarna:[['#fff6c0', '#f2c444', '#9a6414'], 'shirt', 'scale']}[id] || [['#e6b484', '#a8703c', '#5a3820'], 'shirt', 'plain'];
  const [c, shape, pat] = A, path = shape === 'vest' ? IA_VEST : IA_SHIRT;
  const pdef = pat === 'scale' ? `<pattern id="${p}p" width="4" height="3.6" patternUnits="userSpaceOnUse"><path d="M0 3.6a2 2 0 014 0" fill="none" stroke="${c[2]}" stroke-width=".7"/></pattern>`
    : pat === 'weave' ? `<pattern id="${p}p" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><path d="M0 0h1.6v1.6H0zM1.6 1.6h1.6v1.6H1.6z" fill="${c[2]}" opacity=".45"/></pattern>`
    : pat === 'quilt' ? `<pattern id="${p}p" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0l5 5M5 0L0 5" stroke="${c[2]}" stroke-width=".6"/></pattern>` : '';
  const trim = {a_naga:'#f2c444', a_suvarna:'#c4222a', a_scale:'#454e62', a_padded:'#8a5a34'}[id];
  const cape = id === 'a_suvarna' ? `<path d="M11 10c-4 8-5 16-5 24h28c0-8-1-16-5-24z" fill="#c4222a" ${OL}/>` : '';
  const pads = ['a_padded', 'a_scale', 'a_naga', 'a_suvarna'].includes(id) ? `<path d="M6.4 11.4c1-2.6 4-3.6 7-3l.6 4.4c-2.4-.4-5.4.4-7.6 2z M33.6 11.4c-1-2.6-4-3.6-7-3l-.6 4.4c2.4-.4 5.4.4 7.6 2z" fill="${id === 'a_padded' ? '#8a5a34' : id === 'a_scale' ? '#d8e0ec' : '#f2c444'}" ${OL}/>` : '';
  const extra = pat === 'yantra' ? `<path d="M20 14v15M15.4 18h9.2M16 22.6q4 3 8 0M15.4 26.6h9.2" stroke="#c4222a" stroke-width="1.1" fill="none" stroke-linecap="round"/><circle cx="20" cy="18" r="2.2" fill="none" stroke="#5aa0e8" stroke-width=".9" style="filter:drop-shadow(0 0 2px #8fd0ff)"/>`
    : pat === 'stitch' ? `<path d="M20 13v20" stroke="#3a2414" stroke-width="1.2"/><path d="M13 14.4v17M27 14.4v17" stroke="#f2dcb0" stroke-width=".7" stroke-dasharray="1.2 1.2"/>`
    : pat === 'plain' ? `<path d="M17 11l3 4 3-4" fill="none" stroke="${c[2]}" stroke-width="1"/>` : '';
  const gem = id === 'a_suvarna' || id === 'a_naga' ? `<circle cx="20" cy="17" r="1.8" fill="${id === 'a_naga' ? '#5ae0c0' : '#ff5a5a'}" ${OL}/>` : '';
  return [lg(p + 'a', [c[0], c[1], c[2]], 0, 0, 1, 1) + pdef,
    `${cape}<path d="${path}" fill="url(#${p}a)" ${OL}/>${pdef ? `<path d="${path}" fill="url(#${p}p)"/>` : ''}
     ${trim ? `<path d="M11.2 30.6h17.6" stroke="${trim}" stroke-width="2.4"/><path d="M13 8c1.6 3 3.8 4.2 7 4.2s5.4-1.2 7-4.2" fill="none" stroke="${trim}" stroke-width="1.6"/>` : ''}
     <path d="${path}" fill="none" ${OL}/>${pads}${extra}${gem}`];
}
function iaHead(p, id){
  const gold = lg(p + 'g', ['#fff6c0', '#f2c444', '#9a6414'], 0, 0, 1, 1);
  switch (id){
    case 'h_cloth': return ['', `<path d="M7 21.6Q20 12 33 21.6" fill="none" stroke="#1c0f08" stroke-width="7" stroke-linecap="round"/><path d="M7 21.6Q20 12 33 21.6" fill="none" stroke="#f4efe4" stroke-width="5" stroke-linecap="round"/>
      <path d="M8 21q12-7.6 24 0" fill="none" stroke="#c8bea8" stroke-width="1"/><path d="M31.4 21.6l3.6 9.4-3.4.6-1.6-7.6M31.4 21.6l-.4 10.4-3-1 .8-8" fill="#f4efe4" ${OL}/><circle cx="31.6" cy="21.6" r="2" fill="#e6dccb" ${OL}/>`];
    case 'h_ngob': return [lg(p + 's', ['#fbe6a8', '#e0bd6c', '#9a7432']), `<path d="M3.6 26.4L20 8.4l16.4 18c-4.4 3-28.4 3-32.8 0z" fill="url(#${p}s)" ${OL}/>
      <path d="M20 8.4L8 26.6M20 8.4l-5.6 19.4M20 8.4v20M20 8.4l5.6 19.4M20 8.4l12 18.2" stroke="#9a7432" stroke-width=".8" opacity=".75"/><path d="M5 26.6q15 3.4 30 0" fill="none" stroke="#6a4528" stroke-width="1.4"/>
      <circle cx="20" cy="8.6" r="1.8" fill="#6a4528" ${OL}/><path d="M13 28.8q7 6 14 0" fill="none" stroke="#6a4528" stroke-width="1"/>`];
    case 'h_leather': return [lg(p + 'l', ['#e6b484', '#a8703c', '#5a3820']), `<path d="M30 14.6c2.6-4 5-6 6.4-6.4-1 3-2.6 6-5.6 9z" fill="#e0402e" ${OL}/>
      <path d="M8.6 26c0-9 5-14 11.4-14s11.4 5 11.4 14z" fill="url(#${p}l)" ${OL}/><path d="M6 26h28c-1 3.4-6 5-14 5S7 29.4 6 26z" fill="#8a5a34" ${OL}/>
      <path d="M20 12.4v13.6M9.4 22h21.2" stroke="#5a3820" stroke-width=".9" opacity=".7"/><path d="M11.6 21.4v-.1M28.4 21.4v-.1" stroke="#f2c444" stroke-width="2" stroke-linecap="round"/>`];
    case 'h_lotus': return [lg(p + 'm', ['#ffffff', '#b8c4d8', '#56607a'], 0, 0, 1, 1), `<path d="M6 27.4c0-1.6 6-3.6 14-3.6s14 2 14 3.6-6 3.4-14 3.4-14-1.8-14-3.4z" fill="url(#${p}m)" ${OL}/>
      <path d="M20 7.6c-4 4.4-5 10.4 0 17 5-6.6 4-12.6 0-17z" fill="url(#${p}m)" ${OL}/><path d="M13.6 12.4c-2.6 4.6-1.6 9.4 3.2 12.4.6-4.4-.4-8.6-3.2-12.4zM26.4 12.4c2.6 4.6 1.6 9.4-3.2 12.4-.6-4.4.4-8.6 3.2-12.4z" fill="url(#${p}m)" ${OL}/>
      <path d="M20 11v10" stroke="#fff" stroke-width=".9" opacity=".8"/><circle cx="20" cy="27.2" r="1.4" fill="#f2c444" ${OL}/>`];
    case 'h_mongkhon': return ['', `<ellipse cx="20" cy="18" rx="13" ry="6.4" fill="none" stroke="#1c0f08" stroke-width="5.4"/><ellipse cx="20" cy="18" rx="13" ry="6.4" fill="none" stroke="#e0322a" stroke-width="3.6"/>
      <ellipse cx="20" cy="18" rx="13" ry="6.4" fill="none" stroke="#fff3d0" stroke-width="3.6" stroke-dasharray="2.4 2.4"/>
      <path d="M17.6 24.2l-2.4 10.4M22.4 24.2l2.4 10.4" stroke="#1c0f08" stroke-width="3.4" stroke-linecap="round"/><path d="M17.6 24.2l-2.4 10.4M22.4 24.2l2.4 10.4" stroke="#e0322a" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 23.2l-.1 0" stroke="#f2c444" stroke-width="4" stroke-linecap="round"/>`];
    case 'h_chada': case 'h_goldchada': { const g = id === 'h_goldchada', band = g ? `url(#${p}g)` : '#2c2a34';
      return [gold, `<path d="M5.6 27c0-2 6.4-4.4 14.4-4.4s14.4 2.4 14.4 4.4-6.4 4.2-14.4 4.2S5.6 29 5.6 27z" fill="${band}" ${OL}/>
        <path d="M17 24L20 4.6 23 24z" fill="url(#${p}g)" ${OL}/><path d="M10.4 25.4l1.4-12 4 11.2zM29.6 25.4l-1.4-12-4 11.2z" fill="url(#${p}g)" ${OL}/>
        ${g ? `<path d="M6.6 26.6l-1.4-8 3.6 7.4zM33.4 26.6l1.4-8-3.6 7.4z" fill="url(#${p}g)" ${OL}/>` : ''}
        <circle cx="20" cy="27" r="${g ? 2.2 : 1.6}" fill="#ff5a5a" ${OL}/>${g ? `<circle cx="12.6" cy="27.6" r="1.2" fill="#5ae0c0" ${OL}/><circle cx="27.4" cy="27.6" r="1.2" fill="#5ae0c0" ${OL}/>` : ''}
        <path d="M20 8v12" stroke="#fff" stroke-width=".8" opacity=".8"/>`]; }
  }
  return ['', ''];
}
function iaAcc(p, id){
  const gold = lg(p + 'g', ['#fff6c0', '#f2c444', '#9a6414'], 0, 0, 1, 1);
  switch (id){
    case 'x_ring': return [gold, `<ellipse cx="20" cy="23" rx="10" ry="8" fill="none" stroke="#1c0f08" stroke-width="5.4"/><ellipse cx="20" cy="23" rx="10" ry="8" fill="none" stroke="url(#${p}g)" stroke-width="3.6"/>
      <path d="M16.6 15.6l3.4-4 3.4 4-3.4 2z" fill="#d88a4a" ${OL}/><path d="M12 19.4c1.6-2 3.6-3 6-3.4" stroke="#fff" stroke-width="1" opacity=".8"/>`];
    case 'x_bead': { let b = `<path d="M8 8c0 16 24 16 24 0" fill="none" stroke="#6a3a22" stroke-width=".9"/>`;
      for (let i = 0; i <= 10; i++){ const a = Math.PI * (i / 10), x = 20 - Math.cos(a) * 12, y = 8 + Math.sin(a) * 13.4; b += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.9" fill="${i % 2 ? '#f2c444' : '#c4222a'}" ${OL}/>`; }
      return ['', b + `<circle cx="20" cy="27" r="3" fill="#c4222a" ${OL}/><circle cx="19" cy="26" r=".9" fill="#fff" opacity=".8"/>`]; }
    case 'x_amulet': return [rg(p + 'j', ['#e8fff4', '#6ad8a8', '#1e7a5a']), `<path d="M12 5q8 12 16 0" fill="none" stroke="#6a3a22" stroke-width="1.4"/>
      <circle cx="20" cy="23" r="9.4" fill="url(#${p}j)" ${OL}/><circle cx="20" cy="23" r="3" fill="#1c120e" ${OL}/><path d="M13.4 20c1-2.6 3-4.2 5.4-4.8" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>
      <circle cx="20" cy="12.4" r="1.6" fill="#f2c444" ${OL}/>`];
    case 'x_charm': return [gold, `<path d="M8 10q12 10 24 0" fill="none" stroke="#c4222a" stroke-width="1.4"/>
      <rect x="9.6" y="17.4" width="20.8" height="7.4" rx="3.7" fill="url(#${p}g)" ${OL}/><path d="M14 17.6v7M20 17.6v7M26 17.6v7" stroke="#c4222a" stroke-width="1.8"/>
      <path d="M11.6 19.4h16.8" stroke="#fff" stroke-width=".9" opacity=".7"/><path d="M20 24.8l-1.4 9M20 24.8l1.4 9" stroke="#c4222a" stroke-width="1.2" stroke-linecap="round"/>`];
    case 'x_moon': return [lg(p + 's', ['#ffffff', '#c8d0e0', '#6a7290'], 0, 0, 1, 1) + rg(p + 'm', ['#ffffff', '#d8f0ff', '#7ab8f0']), `<ellipse cx="20" cy="25" rx="10" ry="7.6" fill="none" stroke="#1c0f08" stroke-width="5.2"/><ellipse cx="20" cy="25" rx="10" ry="7.6" fill="none" stroke="url(#${p}s)" stroke-width="3.4"/>
      <circle cx="20" cy="14.6" r="5.4" fill="url(#${p}m)" ${OL} style="filter:drop-shadow(0 0 3px #8fd0ff)"/><path d="M21.6 11.4a3.6 3.6 0 100 6.4 4.4 4.4 0 010-6.4z" fill="#5a8ad0" opacity=".7"/>`];
    case 'x_tiger': return [lg(p + 'f', ['#ffffff', '#f2e8cc', '#b8a47a'], 0, 0, 1, 1), `<path d="M10 6q10 8 20 0" fill="none" stroke="#6a3a22" stroke-width="1.4"/>
      <path d="M16.4 14.4h7.2c0 8-1.4 14-4.6 20.4-1.6-5.4-2.6-12-2.6-20.4z" fill="url(#${p}f)" ${OL}/><path d="M15.6 11.4h8.8v3.6h-8.8z" fill="#f2c444" ${OL}/>
      <path d="M17.6 11.6l1 3.2M21.4 11.6l-.4 3.2" stroke="#22140c" stroke-width="1"/><path d="M18.4 17.4c0 4 .4 8 1.4 11.4" stroke="#fff" stroke-width="1" opacity=".8"/>`];
    case 'x_naga': return [gold + rg(p + 'e', ['#e8fff4', '#40d0a0', '#0e5a40']), `<path d="M8 22c0-8 5.4-13 12-13s12 5 12 13-5.4 12-12 12c-4 0-7-2-8.4-4.6" fill="none" stroke="#1c0f08" stroke-width="4.4" stroke-linecap="round"/>
      <path d="M8 22c0-8 5.4-13 12-13s12 5 12 13-5.4 12-12 12c-4 0-7-2-8.4-4.6" fill="none" stroke="url(#${p}g)" stroke-width="2.8" stroke-linecap="round"/><path d="M8 22l-2.6-2.4 1-2 3 1.6z" fill="#f2c444" ${OL}/>
      <path d="M20 13.4l6 5-2.4 8.4h-7.2L14 18.4z" fill="url(#${p}e)" ${OL} style="filter:drop-shadow(0 0 2px #40d0a0)"/><path d="M14 18.4h12M20 13.4v13.4" stroke="#0e5a40" stroke-width=".7" opacity=".7"/>`];
    case 'x_sun': { let r = ''; for (let i = 0; i < 12; i++){ const a = i * Math.PI / 6, x1 = 20 + Math.cos(a) * 9.6, y1 = 20 + Math.sin(a) * 9.6, x2 = 20 + Math.cos(a) * 14.4, y2 = 20 + Math.sin(a) * 14.4; r += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#f2c444" stroke-width="2" stroke-linecap="round"/>`; }
      return [gold, `<g style="filter:drop-shadow(0 0 2.5px #ffcc48)">${r}</g><circle cx="20" cy="20" r="8.6" fill="url(#${p}g)" ${OL}/><circle cx="20" cy="20" r="5.4" fill="none" stroke="#9a6414" stroke-width=".9"/><circle cx="20" cy="20" r="2.6" fill="#e0322a" ${OL}/>`]; }
  }
  return ['', ''];
}

/* ---------- which picture for which item ---------- */
const IA_POT = {redpot:[['#ff9a8f', '#e0322a', '#7a0e14'], 'round'], orangepot:[['#ffd08a', '#f08a2a', '#8a3a0e'], 'round'], whitepot:[['#ffffff', '#ffe4ec', '#c8a0b4'], 'tall'],
  elixirpot:[['#ffffff', '#ffe890', '#e0a020'], 'elixir'], bluepot:[['#c4ecff', '#3c8ed6', '#103866'], 'round'], bigbluepot:[['#a8c8ff', '#2a4ac0', '#0c1660'], 'big']};
const IA_ARROW = {q_wood:['#e6ebf2', '#98a2b4', '#454e62'], q_fire:IA_EL.fire, q_ice:['#ffffff', '#9ad8ff', '#2a74c4'], q_wind:IA_EL.wind, q_earth:['#e8c890', '#9a7040', '#4a3014'], q_holy:['#ffffff', '#e8eef6', '#9aa6b8'], q_shadow:IA_EL.shadow};
const MAT_FAM = [[/Spirit Ash$/, 'ash'], [/Slick Skin$/, 'slick'], [/Feather$/, 'feather'], [/Scale$/, 'scale'], [/Hide$/, 'hide'], [/Ooze$/, 'ooze'], [/Carapace$/, 'carapace'], [/Rubble$/, 'rubble'], [/Charm$/, 'charm']];
function iaFur(en, el){
  if (/tiger|kraisorn|puma/i.test(en)) return [['#ffd29a', '#f29a3c', '#a4521a'], 'stripe'];
  if (/leopard/i.test(en)) return [['#f6e2b0', '#d8b070', '#8a6430'], 'spot'];
  if (/snow|ice|glacier|yeti|mammoth|white|airavata|erawan/i.test(en)) return [['#ffffff', '#e8eef6', '#a8b2c4'], ''];
  if (/bear|buffalo|banteng|wolf|ghost|phantom/i.test(en)) return [['#8a8494', '#4a4454', '#1c1824'], ''];
  if (/singha|lion|gold/i.test(en)) return [['#fff3b4', '#e6b048', '#8a5a1c'], ''];
  if (/lava|fire|drake|salamander/i.test(en)) return [['#ffb070', '#d0501e', '#5a1408'], ''];
  const e = IA_EL[el] || IA_EL.neutral; return [[e[0], e[1], e[2]], ''];
}
function iaTierOf(it){ return it.lv >= 100 ? 4 : it.lv >= 80 ? 3 : it.lv >= 45 ? 2 : it.lv >= 15 ? 1 : 0; }
function iaPick(id){
  const it = ITEMS[id] || {}, p = 'ia' + id.replace(/\W/g, '') + '\u00a7';
  if (IA_POT[id]) return {p, art:IA.flask(p, ...IA_POT[id]), frame:id === 'elixirpot' ? 2 : 0, glow:IA_POT[id][0][1]};
  if (it.recall || id === 'talisman') return {p, art:IA.talisman(p), frame:1, glow:'#f2c444'};
  if (it.kind === 'ammo') return {p, art:IA.arrows(p, IA_ARROW[id] || IA_ARROW.q_wood, id === 'q_wood' ? '#f4efe4' : (IA_ARROW[id] || [])[1]), frame:id === 'q_wood' ? 0 : 1, glow:(IA_ARROW[id] || IA_ARROW.q_wood)[1]};
  if (it.kind === 'gear'){
    if (it.base && it.base !== id && ITEMS[it.base]) id = it.base;            // a rolled instance (base~xxxx) looks like its base piece
    const g = GEAR[id] || it, fr = iaTierOf(g);
    if (g.slot === 'weapon'){ const t = Math.min(5, +(/(\d+)$/.exec(id) || [0, 0])[1]); return {p, art:g.st.claw ? iaClaw(p, t) : g.st.glove ? iaGlove(p, t) : iaWeapon(p, g.st.wtype, t), frame:Math.min(4, Math.max(0, t - 1)), glow:(IA_TIER[t] || IA_TIER[1] || ['', '#e3b04b'])[1]}; }
    if (g.slot === 'armor') return {p, art:iaArmor(p, id), frame:fr, glow:'#e3b04b'};
    if (g.slot === 'head') return {p, art:iaHead(p, id), frame:fr, glow:'#e3b04b'};
    if (g.slot === 'acc') return {p, art:iaAcc(p, id), frame:fr, glow:'#e3b04b'};
  }
  if (id === 'shard') return {p, art:IA.shard(p), frame:2, glow:'#f2c444'};
  if (id === 'ore') return {p, art:IA.ore(p), frame:1, glow:'#6cc6ff'};
  if (IA[id] && ['jelly', 'tusk', 'wick', 'crown'].includes(id)) return {p, art:IA[id](p), frame:id === 'crown' ? 2 : 0, glow:id === 'wick' ? '#ffa040' : '#f2c444'};
  if (id === 'hide') return {p, art:IA.hide(p, ['#ffffff', '#f2e6dc', '#c8a8a0'], ''), frame:0, glow:'#e3b04b'};
  if (id.startsWith('m_')){
    const mk = id.slice(2), m = (typeof MOB !== 'undefined' && MOB[mk]) || {}, el = m.elem || 'neutral', en = it.en || '';
    const fam = (MAT_FAM.find(([re]) => re.test(en)) || [0, 'charm'])[1];
    let c = IA_EL[el] || IA_EL.neutral;
    if (fam === 'rubble') c = el === 'water' ? ['#ffffff', '#b8dcf0', '#5a84a8'] : el === 'fire' ? ['#ff9a6a', '#5a3a34', '#22140e'] : ['#c8beb4', '#8a7e74', '#3a322c'];
    if (/gold/i.test(en) && fam !== 'hide') c = IA_EL.holy;
    const art = fam === 'hide' ? IA.hide(p, ...iaFur(en, el)) : IA[fam](p, c);
    return {p, art, frame:m.boss ? 2 : (m.lvl || 0) >= 120 ? 1 : 0, glow:c[1]};
  }
  // anything else: a cloth bundle tinted by its hash
  const e = IA_EL[ELEM[iaHash(id) % ELEM.length]] || IA_EL.neutral;
  return {p, art:IA.charm(p, e), frame:0, glow:e[1]};
}
/* gradient / clip ids must be unique per copy: a copy inside a hidden panel (display:none) would otherwise
   blank out every other copy that points at the same id */
const IA_CACHE = {}; let IA_N = 0;
function itemArt(id, bare = false){ return iaTpl(id, bare).replace(/\u00a7/g, '_' + (++IA_N).toString(36)); }
function iaTpl(id, bare){
  const key = id + (bare ? '|b' : ''); if (IA_CACHE[key]) return IA_CACHE[key];
  const {p, art, frame, glow} = iaPick(id), [defs, body] = art, fc = IA_FRAME[frame] || IA_FRAME[0];
  const tile = bare ? '' : `<rect x="1.5" y="1.5" width="37" height="37" rx="8" fill="#1c120e"/><rect x="1.5" y="1.5" width="37" height="37" rx="8" fill="url(#${p}bg)"/>
    <rect x="1.5" y="1.5" width="37" height="37" rx="8" fill="none" stroke="${fc}" stroke-width="1.6"/><rect x="4" y="4" width="32" height="32" rx="6" fill="none" stroke="rgba(255,236,170,.18)"/>`;
  return (IA_CACHE[key] = `<svg class="sico iart" viewBox="0 0 40 40" aria-hidden="true"${bare ? ' xmlns="http://www.w3.org/2000/svg"' : ''}><defs>${bare ? '' : rg(p + 'bg', [glow + '88', glow + '22', '#1c120e00'], .5, .45, .62)}${defs}</defs>${tile}<g transform="translate(20 20) scale(.92) translate(-20 -20)">${body}</g></svg>`);
}
/* ground drops: the same art as a cached bitmap */
const IA_IMG = {};
function itemArtImg(id){
  if (IA_IMG[id]) return IA_IMG[id].complete && IA_IMG[id].naturalWidth ? IA_IMG[id] : null;
  const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(itemArt(id, true).replace(/style="filter:[^"]*"/g, ''));
  IA_IMG[id] = im; return null;
}
