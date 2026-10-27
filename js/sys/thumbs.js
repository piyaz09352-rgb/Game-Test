/* VAYRATHEN — js/sys/thumbs.js — picture cards for every costume, headpiece, wing, cosmetic mount and pet
   Wherever the game used to show a two-colour swatch for a cosmetic (the wardrobe, the tailor, the festival
   stall), it now shows a small portrait rendered with the real sprite engine:
   · outfits: your own hero (job, hair, colours) wearing the outfit, full body;
   · headpieces: a close-up of your hero's head wearing it;
   · wings: your hero seen from behind (three-quarter) with the wings spread;
   · cosmetic mounts: the mount itself (the cloud, lotus and carpet with your hero standing on them);
   · cosmetic pets: the little creature, large.
   Each portrait is rendered once per look and cached; they are drawn a few per frame so nothing stutters. */
'use strict';

const CTH = {cache:new Map(), q:[], qs:new Set(), dirty:false};
const CTH_W = 104, CTH_H = 122; let CTH_HEAD = 25;
const cthKind = id => (typeof WINGS !== 'undefined' && WINGS[id] ? 'wing' : typeof XCOS !== 'undefined' && XCOS[id] ? XCOS[id].slot : typeof COSTUME !== 'undefined' && COSTUME[id] ? COSTUME[id].slot : null);
function cthKey(id){
  const k = cthKind(id); if (!k) return null;
  if (k === 'mount' || k === 'pet') return id + (k === 'mount' ? '|' + S.job + '|' + SPR.lookKey(S.look) : '');
  return `${id}|${S.job}|${SPR.lookKey(S.look)}|${cthWeapon()}`;
}
/* portraits show the hero in plain clothes with their weapon, so wearing or changing gear never re-renders them */
const cthWeapon = () => { const w = S.gear && S.gear.weapon; return w ? baseOf(w) : ''; };
const cthFrame = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').putImageData(img, 0, 0); return c; };
/* draw the hero (world units, feet at 0,0) into a context already scaled to world units */
function cthHero(g, gear, dir){
  const key = SPR.heroKey(S.job, gear, S.look), K = 2, img = SPR.renderFrame('char', key, 'idle', dir, 0, K), fs = img.width;
  g.drawImage(cthFrame(img), -fs / 2 / K, -SPR.ANCHOR_Y, fs / K, fs / K);
}
function cthMob(g, mob, dir){
  if (!SPR.MOBS[mob]) return false; const K = 2, img = SPR.renderFrame('mob', mob, 'idle', dir, 0, K), fs = img.width;
  g.drawImage(cthFrame(img), -fs / 2 / K, -(fs - 6 * K) / K, fs / K, fs / K); return true;
}
function cthRender(id){
  const k = cthKind(id), c = document.createElement('canvas'); c.width = CTH_W; c.height = CTH_H; const g0 = c.getContext('2d'), SC = CTH_W / 120;
  const g = new Proxy(g0, {get:(o, n) => { if (n === 'setTransform') return (a, b, cc, d, e, f) => o.setTransform(a * SC, b, cc, d * SC, e * SC, f * SC); const v = o[n]; return typeof v === 'function' ? v.bind(o) : v; }, set:(o, n, v) => { o[n] = v; return true; }});
  g0.setTransform(SC, 0, 0, SC, 0, 0);
  // soft stage light and a floor shadow
  const grand = !!((typeof COS2 !== 'undefined' && COS2[id]) || (typeof WINGS !== 'undefined' && WINGS[id]));
  const bg = g.createRadialGradient(CTH_W / 2, CTH_H * .55, 4, CTH_W / 2, CTH_H * .55, CTH_W * .75);
  bg.addColorStop(0, grand ? 'rgba(255,214,120,.42)' : 'rgba(255,236,190,.26)'); bg.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = bg; g.fillRect(0, 0, CTH_W, CTH_H);
  const floor = (y, w) => { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(CTH_W / 2, y, w, w * .28, 0, 0, 7); g.fill(); };
  const gear = {weapon:cthWeapon() || null};
  try {
    if (k === 'top'){ gear.armor = id; floor(CTH_H - 8, 26); g.setTransform(2.9, 0, 0, 2.9, CTH_W / 2, CTH_H - 8); cthHero(g, gear, 1); }
    else if (k === 'head'){ gear.head = id; const s = 3.5; g.setTransform(s, 0, 0, s, CTH_W / 2, CTH_H * .5 + CTH_HEAD * s); cthHero(g, gear, 1); }
    else if (k === 'wing'){ floor(CTH_H - 12, 20); const s = 1.75; g.setTransform(s, 0, 0, s, CTH_W / 2, CTH_H - 14);
      drawWings(g, typeof dyeId === 'function' ? dyeId(id) : id, 0, 0, 5, .55, {part:'back'}); cthHero(g, gear, 5); drawWings(g, typeof dyeId === 'function' ? dyeId(id) : id, 0, 0, 5, .55, {part:'front'}); }
    else if (k === 'mount'){ const M = XCOS[id];
      if (M.kind === 'beast'){ const fs = (SPR.MOBS[M.mob] && SPR.MOBS[M.mob].fs) || 80, sc = Math.min(2.4, 130 / fs); floor(CTH_H - 14, 30); g.setTransform(sc, 0, 0, sc, CTH_W / 2, CTH_H - 14); cthMob(g, M.mob, 1); }
      else { const s = 2.2; g.setTransform(s, 0, 0, s, CTH_W / 2, CTH_H - 16); drawMountX(g, M, 0, 0, 1, .4, false, 'under'); g.translate(0, -M.lift); cthHero(g, gear, 1); } }
    else if (k === 'pet'){ const M = XCOS[id], fs = (SPR.MOBS[M.mob] && SPR.MOBS[M.mob].fs) || 60, s = Math.min(2.6, 118 / fs); floor(CTH_H - 14, 22);
      g.setTransform(s, 0, 0, s, CTH_W / 2, CTH_H - 14 - (M.fly ? 8 : 0)); cthMob(g, M.mob, 1); }
    else return null;
  } catch (e) { return null; }
  g.setTransform(1, 0, 0, 1, 0, 0);
  // a few sparkles on the grand pieces
  if (grand){ g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++){ const x = 12 + ((i * 47) % 96), y = 14 + ((i * 31) % 70), r = 1 + (i % 3) * .7;
    g.fillStyle = 'rgba(255,240,190,.9)'; g.beginPath(); g.moveTo(x, y - r * 3); g.lineTo(x + r * .7, y); g.lineTo(x, y + r * 3); g.lineTo(x - r * .7, y); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x - r * 3, y); g.lineTo(x, y + r * .7); g.lineTo(x + r * 3, y); g.lineTo(x, y - r * .7); g.closePath(); g.fill(); } }
  return c.toDataURL('image/png');
}
function cthApply(node, url){ node.style.backgroundImage = `url(${url})`; node.classList.add('th'); node.dataset.thk = node.dataset.cthk; }
/* cache: in memory, and kept in this browser so reopening the wardrobe is instant */
const CTH_LS = 'vay-cth-v4';   // (v123) v3 kept pictures drawn before some wing kinds existed: blank cards — start fresh
try { localStorage.removeItem('vay-cth-v3'); } catch (e) {}
try { const o = JSON.parse(localStorage.getItem(CTH_LS) || '{}'); for (const k in o) CTH.cache.set(k, o[k]); } catch (e) {}
function cthSave(){ clearTimeout(CTH.saveT); CTH.saveT = setTimeout(() => { try { const o = {}; [...CTH.cache.entries()].filter(e => e[1]).slice(-140).forEach(([k, v]) => { o[k] = v; }); localStorage.setItem(CTH_LS, JSON.stringify(o)); } catch (e) {} }, 1500); }
/* only portraits that are on screen get drawn, a few at a time */
const CTH_IO = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(es => { for (const e of es){ if (!e.isIntersecting) continue; CTH_IO.unobserve(e.target); cthNeed(e.target); } }, {rootMargin:'120px'}) : null;
function cthNeed(n){
  const id = n.dataset.cth, key = cthKey(id); if (!key) return; n.dataset.cthk = key;
  if (CTH.cache.has(key)){ const url = CTH.cache.get(key); if (url) cthApply(n, url); else n.dataset.thk = key; return; }
  if (!CTH.qs.has(key)){ CTH.qs.add(key); CTH.q.push([id, key]); }
}
function cthFill(){
  CTH.dirty = false; if (typeof S === 'undefined' || !S || !S.look) return;
  for (const n of document.querySelectorAll('.cosw[data-cth]:not(.th):not([data-cto])')){
    if (n.dataset.cth === 'hc_hide') continue; n.dataset.cto = '1';
    const key = cthKey(n.dataset.cth); if (key && CTH.cache.get(key)){ n.dataset.cthk = key; cthApply(n, CTH.cache.get(key)); continue; }
    if (CTH_IO) CTH_IO.observe(n); else cthNeed(n);
  }
}
function cthWork(){
  const t0 = performance.now();
  while (CTH.q.length && performance.now() - t0 < 6){
    const [id, key] = CTH.q.shift(); CTH.qs.delete(key); if (CTH.cache.has(key)) continue;
    const url = cthRender(id); CTH.cache.set(key, url || ''); if (CTH.cache.size > 400) CTH.cache.delete(CTH.cache.keys().next().value); if (url) cthSave();
    if (url) for (const n of document.querySelectorAll(`.cosw[data-cth="${id}"]`)) if (n.dataset.cthk === key) cthApply(n, url);
  }
  if (CTH.dirty){ const now = performance.now(); if (now - (CTH.fillT || 0) > 120){ CTH.fillT = now; cthFill(); } }
  requestAnimationFrame(cthWork);
}
new MutationObserver(() => { CTH.dirty = true; }).observe(document.body, {childList:true, subtree:true});
requestAnimationFrame(cthWork);
