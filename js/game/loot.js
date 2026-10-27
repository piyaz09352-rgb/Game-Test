/* VAYRATHEN — js/game/loot.js
   Ground drops. Every drop lands on the ground (there is no Auto Loot): click / tap / point at a drop, press Z or the
   pick-up button to walk over and take it, or let a rented helper animal (beastkeeper.js) fetch it. Drops fade after 90 seconds. */
'use strict';

const LOOT = [];
const LOOT_COL = {etc:['#a9773f', '#e0b46a', '#5a3a1c'], mat:['#5f7fa8', '#bfe0ff', '#27344a'], use:['#b23a3a', '#ff9a8a', '#4a1414'], gold:['#d6a21f', '#fff0a0', '#6a4a08']};
/* item families (kept for older code paths) */
const LOOT_CATS = [['use', 'ยา/ใช้ของ', 'Consumables'], ['gear', 'อุปกรณ์', 'Equipment'], ['etc', 'ของสะสม/วัสดุมอน', 'Monster loot'], ['mat', 'แร่/ของสำคัญ', 'Ore & key items']];
const lootCat = id => { const k = (ITEMS[id] || {}).kind; return k === 'use' ? 'use' : k === 'gear' || k === 'ammo' ? 'gear' : k === 'etc' ? 'etc' : 'mat'; };
const lootWanted = id => !SETTINGS.lootCats || SETTINGS.lootCats[lootCat(id)] !== false;
/* straight into the bag (unused since Auto Loot was removed; (party.js may hand it to a party member instead) */
function lootAutoTake(id, x, y){ addItem(id, 1); bump('pickups'); EV.emit('pickup', id); log(L(`ได้ ${nm(ITEMS[id])}`, `Got ${nm(ITEMS[id])}`)); if (x != null) addText(x, y - 30, `+ ${nm(ITEMS[id])}`, '#9ff0c8', 11); return true; }
function dropLoot(id, x, y){
  const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 16;
  LOOT.push({id, x:clamp(x + Math.cos(a) * r, 24, W - 24), y:clamp(y + Math.sin(a) * r * .6, 34, H - 24), t:90, born:T});
}
function pickLoot(l){
  const i = LOOT.indexOf(l); if (i < 0) return;
  LOOT.splice(i, 1); addItem(l.id, 1); SFX.play('pickup'); bump('pickups'); EV.emit('pickup', l.id);
  log(L(`เก็บ ${nm(ITEMS[l.id])}`, `Picked up ${nm(ITEMS[l.id])}`));
  addText(l.x, l.y - 18, nm(ITEMS[l.id]), '#9ff0c8', 12);
  if (P.loot === l) P.loot = null;
}
/* gear on the ground is drawn 1.8× bigger with a soft glow, so it is easy to spot and tap */
const LOOT_GEAR_K = 1.8;
const lootGearK = id => lootCat(id) === 'gear' ? LOOT_GEAR_K : 1;
function lootAt(p, r = 16){
  let best = null, bd = r;
  for (const l of LOOT){ const gk = lootGearK(l.id), d = Math.hypot(l.x - p.x, l.y - (gk > 1 ? 14 : 4) - p.y) / gk; if (d < bd){ bd = d; best = l; } }   // gear is bigger, so easier to tap
  return best;
}
function nearestLoot(r = 120){
  let best = null, bd = r;
  for (const l of LOOT){ const d = dist(l, P); if (d < bd){ bd = d; best = l; } }
  return best;
}
function updLoot(dt){
  for (let i = LOOT.length - 1; i >= 0; i--){ const l = LOOT[i]; l.t -= dt; if (l.t <= 0){ LOOT.splice(i, 1); if (P.loot === l) P.loot = null; } }
}
/* a little pixel sack / bottle / ore that pops out of the monster and glints on the grass */
function drawLootW(g, l){
  const x = Math.round(l.x - cam.x), age = T - l.born;
  if (x < -30 || x > VW + 30) return;
  const hop = age < .45 ? Math.sin(age / .45 * Math.PI) * 14 : 0, y = Math.round(l.y - cam.y - hop);
  if (y < -30 || y > VH + 30) return;
  const it = ITEMS[l.id], kind = l.id === 'crown' ? 'gold' : l.id === 'bluepot' ? 'mat' : it.kind;
  const [c, hi, dk] = LOOT_COL[kind] || LOOT_COL.etc;
  g.save();
  if (l.t < 10 && Math.sin(T * 14) > 0) g.globalAlpha = .45;
  const gk = lootGearK(l.id);
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x, Math.round(l.y - cam.y) + 1, 7 * gk, 2.5 * gk, 0, 0, 7); g.fill();
  if (it.rar){ const c = RAR[it.rar].c, gy = Math.round(l.y - cam.y), hgt = 30 + it.rar * 18, pu = .55 + .45 * Math.sin(T * 3 + l.born);   // light pillar: blue / violet / gold
    const gr = g.createLinearGradient(0, gy - hgt, 0, gy); gr.addColorStop(0, c + '00'); gr.addColorStop(.7, c + '66'); gr.addColorStop(1, c + 'cc');
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .55 + .35 * pu; g.fillStyle = gr; g.fillRect(x - 4 - it.rar * 1.5, gy - hgt, 8 + it.rar * 3, hgt); g.globalAlpha *= .6; g.fillRect(x - 1, gy - hgt * 1.25, 2, hgt * 1.25);
    g.globalAlpha = .5 * pu; g.fillStyle = c; g.beginPath(); g.ellipse(x, gy, 10 + it.rar * 2, 3.5, 0, 0, 7); g.fill(); g.restore(); }
  if (gk > 1){   // a soft pulsing halo behind gear, then everything below is drawn bigger around the drop's foot
    const gy = Math.round(l.y - cam.y), hy = y - 9 * gk, pu = .5 + .5 * Math.sin(T * 4 + l.born), hc = it.rar ? RAR[it.rar].c : '#fff2c0';
    const hg = g.createRadialGradient(x, hy, 2, x, hy, 17 * gk); hg.addColorStop(0, hc + 'aa'); hg.addColorStop(1, hc + '00');
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= .45 + .3 * pu; g.fillStyle = hg; g.beginPath(); g.arc(x, hy, 17 * gk, 0, 7); g.fill(); g.restore();
    g.translate(x, gy); g.scale(gk, gk); g.translate(-x, -gy);
  }
  const px = (a, b, w, h, col) => { g.fillStyle = col; g.fillRect(x + a, y + b, w, h); };
  const art = typeof itemArtImg === 'function' ? itemArtImg(l.id) : null;
  if (art){ g.imageSmoothingEnabled = true; g.drawImage(art, x - 9, y - 17, 18, 18); }
  else if (it.kind === 'use'){                       // potion bottle
    px(-4, -9, 8, 9, dk); px(-3, -8, 6, 7, c); px(-2, -7, 2, 3, hi); px(-2, -12, 4, 3, '#d9c7a2'); px(-2, -13, 4, 1, '#7a5a30');
  } else if (kind === 'mat'){                   // ore chunk
    px(-5, -7, 10, 7, dk); px(-4, -8, 7, 7, c); px(-3, -7, 3, 2, hi); px(1, -4, 2, 2, hi);
  } else if (kind === 'gold'){                  // crown
    px(-6, -6, 12, 6, dk); px(-5, -5, 10, 4, c); px(-6, -9, 2, 3, c); px(-1, -10, 2, 4, c); px(4, -9, 2, 3, c); px(-3, -4, 2, 2, hi); px(-1, -10, 1, 1, '#ff5a5a');
  } else {                                      // cloth sack tied with a cord
    px(-6, -8, 12, 8, dk); px(-5, -9, 10, 8, c); px(-3, -12, 6, 3, c); px(-3, -10, 6, 1, dk); px(-4, -8, 3, 3, hi); px(-1, -13, 2, 1, dk);
  }
  // glint
  const s = (Math.sin(T * 3 + l.born * 7) + 1) / 2;
  if (s > .7){ g.globalAlpha *= (s - .7) / .3; g.fillStyle = '#fffbe0'; g.fillRect(x + 3, y - 13, 1, 5); g.fillRect(x + 1, y - 11, 5, 1); }
  g.restore();
}
/* (v27) item names are drawn in the screen-space pass with the mob names (render.js); drawn inside the world pass they
   took the world zoom twice and landed far from their drop */
function drawLootTags(){
  for (const l of LOOT){ const it = ITEMS[l.id]; if (!it || !(l === hoverLoot || l === P.loot || it.rar >= 2)) continue; const gk = lootGearK(l.id), x = sx(l.x), y = sy(l.y - (gk > 1 ? 34 : 22));
    if (x < -80 || x > SW + 80 || y < -40 || y > SH + 40) continue; nameTag(x, y, nm(it), it.rar ? RAR[it.rar].c : '#e8f8c8'); }
}
let hoverLoot = null;
