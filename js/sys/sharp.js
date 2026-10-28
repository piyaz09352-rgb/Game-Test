/* VAYRATHEN — js/sys/sharp.js — (v185) "ความคมชัดตัวละครและมอน": heroes, monsters, NPCs and props drawn as finely as
   the screen and the camera zoom allow
   Sprites are painted (rasterised) at K pixels per world unit and then drawn at their size on screen. The graphics
   preset chose K from the screen alone, so on a 1080p screen at 150 % zoom a hero was painted coarser than it is shown,
   and the presets below Ultra capped it lower still. Settings › Display › ความคมชัดตัวละครและมอน:
     0 ปกติ    the preset's own K (as before)
     1 สูง     K follows the real screen density (devicePixelRatio) and the zoom, up to 6
     2 สูงสุด  (default) the same with a step of supersampling for clean edges, up to 8; props follow too
   The sprite memory budget grows with K² so the extra detail is not thrown away and painted again. When the zoom
   settles on a new level the sprites are painted again at the K it needs (once, a moment after the zoom stops). */
'use strict';

const SHARP = {k:0, ps:0, zoomAt:0, lastZ:1};
// (v186) phones and tablets start on สูง (a mid-range phone stuttered painting the sharpest sprites); a choice made in Settings stays
try { const saved = JSON.parse(localStorage.getItem(SETKEY) || '{}'); if (!('sharp' in saved) && GFX.touch) SETTINGS.sharp = 1; } catch (e) {}
function sharpWant(){
  const lvl = +SETTINGS.sharp || 0, p = GFX.P[GFX.preset] || GFX.P.high;
  if (!lvl || GFX.preset === 'low') return null;   // the Low preset is for weak machines: it keeps its own coarse sprites
  const h = Math.min(innerWidth || 1280, innerHeight || 720) - (GFX.touch ? 0 : 60);
  const px = Math.min(4, Math.max(2, Math.round(h / 330 * 2) / 2)), dpr = Math.min(3, devicePixelRatio || 1);
  const z = Math.max(1, typeof ZOOM !== 'undefined' ? ZOOM.target || 1 : 1);
  const need = px * dpr * z * (lvl >= 2 ? 1.25 : 1);
  const cap = lvl >= 2 ? (GFX.touch ? 6 : 8) : (GFX.touch ? 5 : 6);
  const k = Math.max(2, Math.min(cap, Math.ceil(need) + (GFX.smooth ? 1 : 0)));
  return {k, ps:lvl >= 2 ? Math.min(6, Math.max(p.ps, Math.ceil(px * dpr))) : null};
}
/* apply on top of what the preset chose (never below it) */
function sharpApply(){
  const w = sharpWant(), base = {k:GFX.k, ps:GFX.ps};
  if (!w) return base;
  const P = GFX.P[GFX.preset] || GFX.P.high, k0 = GFX.k;
  if (w.k > GFX.k){ GFX.k = w.k; GFX.budget = Math.min(GFX.touch ? 60e6 : 180e6, Math.max(GFX.budget, P.budget * (w.k / Math.max(2, k0)) ** 2)); }
  if (w.ps && w.ps > GFX.ps) GFX.ps = w.ps;
  return base;
}
{ const _use = GFX.use; GFX.use = function(){ const r = _use.apply(this, arguments); sharpApply(); return r; }; }
GFX.use(GFX.preset || 'high');
/* re-apply after a change of the setting or a settled zoom: repaint only what changed */
function sharpRefresh(){
  const k0 = GFX.k, ps0 = GFX.ps; GFX.use(GFX.preset);
  if (GFX.ps !== ps0 && typeof propCache !== 'undefined') for (const k in propCache) delete propCache[k];
  if (GFX.k !== k0 && typeof SHEETS !== 'undefined' && SHEETS) SPR.rebuild(SHEETS);
  return GFX.k !== k0;
}
document.addEventListener('change', e => { if (e.target && e.target.id === 'set-sharp') setTimeout(() => { sharpRefresh(); if (typeof toast === 'function') toast(L(`ความคมชัด: ${['ปกติ', 'สูง', 'สูงสุด'][+SETTINGS.sharp || 0]}`, `Sharpness: ${['Normal', 'High', 'Highest'][+SETTINGS.sharp || 0]}`)); }, 0); });
EV.on('tick', () => {
  if (typeof ZOOM === 'undefined' || !(+SETTINGS.sharp)) return;
  const z = ZOOM.target || 1, now = performance.now();
  if (Math.abs(z - SHARP.lastZ) > .001){ SHARP.lastZ = z; SHARP.zoomAt = now; return; }
  if (SHARP.zoomAt && now - SHARP.zoomAt > 900){ SHARP.zoomAt = 0; const w = sharpWant(); if (w && w.k !== GFX.k) sharpRefresh(); }
});
