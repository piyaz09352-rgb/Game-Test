/* VAYRATHEN — js/sys/lite.js — โหมดประหยัด (battery saver) for phones that run hot or stutter (v60)
   Settings → การแสดงผล → โหมดประหยัด. When on: the canvas runs at 1 pixel per screen point, the light
   effects drop to the "low" level (no swaying plants, water glints or extra particles), glows lose their
   blurred halo, and the colour filter (Vivid etc.) is skipped. Everything still plays the same.
   Also: after the graphics preset changes, every prop on the map is repainted right away instead of
   one by one the first time each comes into view. */
'use strict';

const LITE = {on:() => !!SETTINGS.lite};
if (SETTINGS.lite == null) SETTINGS.lite = false;

/* the preset is applied as usual, then lite trims it */
{ const _use = GFX.use;
  GFX.use = function(name){ const r = _use.apply(this, arguments); if (LITE.on()){ GFX.fx = 0; GFX.dpr = 1; } return r; };
  if (LITE.on()){ GFX.fx = 0; GFX.dpr = 1; } }

/* no blurred halos on the game picture (sprites and menus are untouched) */
{ const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
  if (d && d.set && typeof MAINCTX !== 'undefined') Object.defineProperty(MAINCTX, 'shadowBlur', {configurable:true,
    get(){ return d.get.call(this); }, set(v){ d.set.call(this, LITE.on() ? 0 : v); }}); }

/* no colour filter over the whole screen */
if (typeof visApply === 'function'){ const _va = visApply;
  visApply = function(){ if (!LITE.on()) return _va.apply(this, arguments);
    const c = el('cv'); if (!c || (typeof PHOTO !== 'undefined' && PHOTO.on)) return; VIS_ON = visFilter(); if (c.style.filter) c.style.filter = ''; }; }

/* props are painted again straight after a preset change */
{ const _ag = applyGfx;
  applyGfx = function(){ const r = _ag.apply(this, arguments); if (typeof PROPS !== 'undefined') for (const p of PROPS) propImg(p.type, p.variant); return r; }; }

/* the switch in Settings, just above "Show FPS" */
{ const _rs = renderSettings;
  renderSettings = function(){ const r = _rs.apply(this, arguments);
    const at = el('set-showFps') && el('set-showFps').closest('label');
    if (at && !el('set-lite')) at.insertAdjacentHTML('beforebegin', `<label class="set"><span><b>${L('โหมดประหยัด', 'Battery saver')}</b><small>${L('ลดความละเอียดจอ แสงเงา และฟิลเตอร์สี · เล่นลื่นขึ้น เครื่องร้อนน้อยลง', 'Lower screen resolution, glows and colour filter · smoother, cooler phone')}</small></span><input type="checkbox" id="set-lite" data-set="lite" ${SETTINGS.lite ? 'checked' : ''}><i class="sw"></i></label>`);
    return r; }; }
{ let was = LITE.on(); const _as = applySettings;
  applySettings = function(){ const r = _as.apply(this, arguments);
    if (LITE.on() !== was){ was = LITE.on(); applyGfx(GFX.preset); if (typeof visApply === 'function') visApply();
      if (typeof toast === 'function') toast(was ? L('เปิดโหมดประหยัด', 'Battery saver on') : L('ปิดโหมดประหยัด', 'Battery saver off')); }
    return r; }; }
