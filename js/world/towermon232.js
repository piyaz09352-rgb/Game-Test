/* VAYRATHEN — js/world/towermon232.js — (v232) the 100-floor Tower monument in Aren
   The owner asked for the Vayra Tower to be entered from the map, not from the menu: a monument of the hundred-floor
   tower now stands in Aren, near Gatekeeper Saeng. Tap it anywhere (the base, the shaft, the spire): you walk to its
   foot and the tower window opens (start floor, shop, legend, ranking). The tower's button is gone from the menu rail.
   It is a tall stone spire of stacked tiers with lit windows, a gold crown and a beacon at the top, a stepped plinth
   with a "100" plaque and two braziers; its name sits under it like an NPC's. */
'use strict';

PROP_TYPES.twmonument = (seed, v = 0) => makeProp({w:120, h:260, ax:60, ay:248, seed, shadow:[48, 12], collide:0, glow:[0, -236, 70], paint(g, rng){
  const stone = ['#e8dcc0', '#d4c4a0', '#bfae88'], dark = '#8a7454', gold = '#e3b04b', goldD = '#a87a24', win = '#ffe6a0';
  // the stepped plinth
  const step = (y, w, h, c) => { g.fillStyle = c; g.fillRect(-w / 2, y - h, w, h); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-w / 2, y - h, w, 2); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-w / 2, y - 2, w, 2); };
  step(0, 104, 10, stone[2]); step(-10, 90, 10, stone[1]); step(-20, 76, 12, stone[0]);
  // the plaque: 100
  g.fillStyle = goldD; g.fillRect(-20, -30, 40, 15); g.fillStyle = gold; g.fillRect(-18, -29, 36, 13);
  g.fillStyle = '#5a3a10'; g.font = '900 11px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('100', 0, -22);
  // the shaft: tiers narrowing upward, each a band with lit windows (a hundred floors suggested)
  let y = -32; const tiers = 13;
  for (let i = 0; i < tiers; i++){ const w = 52 - i * 2.6, h = 14 - i * .25, c = stone[i % 3];
    const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0); gr.addColorStop(0, dark); gr.addColorStop(.3, c); gr.addColorStop(.7, c); gr.addColorStop(1, dark); g.fillStyle = gr; g.fillRect(-w / 2, y - h, w, h);
    g.fillStyle = gold; g.fillRect(-w / 2 - 1.5, y - 2, w + 3, 2);                                        // a gold ledge under every tier
    const nw = Math.max(2, Math.round(w / 12)); for (let k = 0; k < nw; k++){ const x = -w / 2 + (k + .5) * (w / nw); g.fillStyle = (i + k) % 3 ? win : '#5a4a3a'; g.fillRect(x - 1.4, y - h + 3.5, 2.8, h - 7); }
    y -= h; }
  // the crown and the spire
  g.fillStyle = goldD; g.beginPath(); g.moveTo(-18, y); g.lineTo(18, y); g.lineTo(13, y - 8); g.lineTo(-13, y - 8); g.closePath(); g.fill();
  g.fillStyle = gold; for (const x of [-12, -4, 4, 12]){ g.beginPath(); g.moveTo(x - 3, y - 8); g.lineTo(x, y - 16); g.lineTo(x + 3, y - 8); g.closePath(); g.fill(); }
  g.fillStyle = gold; g.beginPath(); g.moveTo(-6, y - 8); g.lineTo(0, y - 44); g.lineTo(6, y - 8); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.moveTo(-2, y - 10); g.lineTo(0, y - 40); g.lineTo(1, y - 10); g.closePath(); g.fill();
  g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(0, y - 46, 4.5, 0, 7); g.fill();                                // the beacon
  // two braziers on the plinth
  for (const d of [-1, 1]){ const bx = d * 30; g.fillStyle = '#5a3a1e'; g.fillRect(bx - 2, -34, 4, 12); g.fillStyle = gold; g.fillRect(bx - 5, -36, 10, 3);
    g.fillStyle = '#ffb04a'; g.beginPath(); g.ellipse(bx, -41, 3.4, 5.5, 0, 0, 7); g.fill(); g.fillStyle = '#fff2a8'; g.beginPath(); g.ellipse(bx, -40, 1.6, 2.6, 0, 0, 7); g.fill(); }
  void rng; }});

const TWMON = {id:'tw_monument', name:'อนุสรณ์หอคอย 100 ชั้น', en:'Monument of the 100-floor Tower', role:'แตะเพื่อเข้าหอคอยวายรา', roleEn:'Tap to enter the Vayra Tower', mon:true};
// a clear spot near Gatekeeper Saeng: walkable for its whole base, away from NPCs and props
function twmonSpot(){
  const gk = NPCS.find(n => n.id === 'gatekeeper') || {x:VSPAWN.x + 200, y:VSPAWN.y - 300}, c = {x:gk.x + 160, y:gk.y + 70};
  for (let t = 0; t < 160; t++){ const a = t * 2.39, d = t * 7, x = Math.round(c.x + Math.cos(a) * d), y = Math.round(c.y + Math.sin(a) * d * .7);
    if (!walkable(x, y, 46) || !walkable(x, y + 30, 20)) continue;
    if (NPCS.some(n => n !== TWMON && Math.hypot(n.x - x, n.y - y) < 110)) continue;
    if (PROPS.some(p => Math.abs(p.x - x) < 80 && p.y > y - 60 && p.y < y + 60 && ['vshop', 'sala', 'armytent', 'house', 'shrine', 'tbld'].includes(p.type))) continue;
    return {x, y}; }
  return c;
}
{ const _s = setupNpcs; setupNpcs = function(id){ const r = _s.apply(this, arguments); if (id !== 0) return r;
    const at = twmonSpot(); TWMON.x = at.x; TWMON.y = at.y; NPCS.push(TWMON); obstacles.push({x:at.x, y:at.y - 16, r:26, twmon:true});
    // no tree or bush in front of or behind the spire (buildings stay; the spot already keeps clear of them)
    const keep = new Set(['vshop', 'sala', 'armytent', 'house', 'shrine', 'tbld', 'tland', 'lamp']);
    for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (keep.has(p.type)) continue; const im = propImg(p.type, p.variant), half = (im.w || 40) / 2;
      const overX = Math.abs(p.x - at.x) < 62 + half, overY = p.y - (im.ay || 40) < at.y + 4 && p.y > at.y - 262;
      if (overX && overY){ PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); } }
    return r; }; }
NPC_OPEN.tw_monument = () => { closeDialog(); openWin('tower'); };
// drawn as the monument, not a person
{ const _d = drawNpcW; drawNpcW = function(g, n){ if (!n || !n.mon) return _d.apply(this, arguments);
    const im = propImg('twmonument', 0), x = n.x - cam.x, y = n.y - cam.y; if (x < -im.w || x > VW + im.w || y < -20 || y - im.h > VH) return;
    drawPropW(g, {type:'twmonument', variant:0, x:n.x, y:n.y}, im, x, y);
    const b = .55 + Math.sin(T * 2.4) * .2; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y - 236, 1, x, y - 236, 22); gr.addColorStop(0, `rgba(255,236,160,${b})`); gr.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gr; g.fillRect(x - 24, y - 260, 48, 48); g.restore(); }; }
// tapping anywhere on the picture walks you to its foot (the usual NPC tap only reaches the base)
cv.addEventListener('pointerdown', e => { if (MAP_ID !== 0 || !TWMON.x || P.target) return; const p = typeof worldPt === 'function' ? worldPt(e) : null; if (!p) return;
  if (Math.abs(p.x - TWMON.x) < 48 && p.y < TWMON.y + 6 && p.y > TWMON.y - 250){ P.npc = TWMON; P.tx = null; P.cast = null; P.pending = null; } });
// the tower leaves the menu rail (it is entered at the monument now)
function twmonRail(){ document.querySelectorAll('.mb[data-win="tower"]').forEach(b => b.remove()); }
twmonRail(); window.addEventListener('DOMContentLoaded', twmonRail); setTimeout(twmonRail, 1500);
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'towermon', t:['อนุสรณ์หอคอย 100 ชั้น', 'The Tower monument'], b:() => `<p>${L('เข้าหอคอยวายราที่อนุสรณ์หอคอย 100 ชั้นในนครอาเรน ใกล้ผู้คุมประตูแสง แตะที่อนุสรณ์แล้วตัวละครจะเดินไปเปิดหน้าต่างหอคอย', 'Enter the Vayra Tower at the Monument of the 100-floor Tower in Aren, near Gatekeeper Saeng: tap it and you walk over and the tower window opens.')}</p>`});
