/* VAYRATHEN — js/sys/visual.js — picture: vivid colours by default, and your own light settings
   Settings → การแสดงผล → แสงและสี: brightness, colour strength and contrast sliders, with presets
   (สดใส Vivid — the default · ธรรมชาติ Natural · อบอุ่น Warm · สว่าง Bright). Applied to the game picture only
   (not the menus); photo mode uses its own filters and hands the picture back when you leave it. */
'use strict';

const VIS_PRESETS = {vivid:['สดใส', 'Vivid', {b:100, s:160, c:108, w:0}], natural:['ธรรมชาติ', 'Natural', {b:100, s:100, c:100, w:0}],
  warm:['อบอุ่น', 'Warm', {b:103, s:130, c:104, w:18}], bright:['สว่าง', 'Bright', {b:118, s:140, c:102, w:0}]};
if (!SETTINGS.vis || typeof SETTINGS.vis !== 'object') SETTINGS.vis = {...VIS_PRESETS.vivid[2]};
const visFilter = () => { const v = SETTINGS.vis; return `brightness(${v.b / 100}) saturate(${v.s / 100}) contrast(${v.c / 100})${v.w ? ` sepia(${v.w / 100})` : ''}`; };
let VIS_ON = '';
function visApply(){ const c = el('cv'); if (!c || (typeof PHOTO !== 'undefined' && PHOTO.on)) return; const f = visFilter(); VIS_ON = f; c.style.filter = f === 'brightness(1) saturate(1) contrast(1)' ? '' : f; }
EV.on('tick', () => { if ((typeof PHOTO === 'undefined' || !PHOTO.on) && (VIS_ON !== visFilter() || el('cv').style.filter === '' && visFilter() !== 'brightness(1) saturate(1) contrast(1)')) visApply(); });
setTimeout(visApply, 0);
const visPreset = () => Object.keys(VIS_PRESETS).find(k => { const p = VIS_PRESETS[k][2], v = SETTINGS.vis; return p.b === v.b && p.s === v.s && p.c === v.c && (p.w || 0) === (v.w || 0); }) || '';
function visUI(){
  const v = SETTINGS.vis, cur = visPreset();
  const sl = (k, th, en, min, max) => `<label class="set visl"><span><b>${L(th, en)}</b><small id="visV-${k}">${v[k]}%</small></span><input type="range" min="${min}" max="${max}" step="1" value="${v[k]}" data-vis="${k}"></label>`;
  return `<div class="sec">${L('แสงและสี', 'Light & colour')}</div>
    <div class="vispre">${Object.keys(VIS_PRESETS).map(k => `<button class="${cur === k ? 'on' : ''}" data-vispre="${k}">${L(VIS_PRESETS[k][0], VIS_PRESETS[k][1])}</button>`).join('')}</div>
    <label class="set"><span><b>${L('ภาพนุ่มนวล (ขอบเนียน ไม่เป็นหยัก)', 'Smooth picture (soft, anti-aliased edges)')}</b><small>${L('ตัวละครและมอนขอบเนียน เคลื่อนที่ลื่น · ปิดเพื่อภาพพิกเซลคม', 'Soft edges and gliding movement · off for crisp pixels')}</small></span><input type="checkbox" data-smooth="smooth" ${GFX.smooth ? 'checked' : ''}><i class="sw"></i></label>
    <label class="set"><span><b>${L('กล้องเลื่อนนุ่ม', 'Smooth camera')}</b><small>${L('กล้องค่อย ๆ ตามตัวละคร', 'The camera eases after your hero')}</small></span><input type="checkbox" data-smooth="smoothCam" ${SETTINGS.smoothCam !== false ? 'checked' : ''}><i class="sw"></i></label>
    ${sl('b', 'ความสว่าง', 'Brightness', 70, 140)}${sl('s', 'ความสดของสี', 'Colour strength', 40, 220)}${sl('c', 'ความคมชัด', 'Contrast', 80, 140)}${sl('w', 'โทนอุ่น', 'Warm tone', 0, 50)}`;
}
{ const _rs = renderSettings;
  renderSettings = function(){ _rs(); const pane = el('pane-settings'); if (!pane || pane.querySelector('.vispre')) return;
    const anchor = el('set-nightFx'), row = anchor && anchor.closest('.set'); if (row) row.insertAdjacentHTML('afterend', visUI()); };
}
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.vis; if (!k) return; SETTINGS.vis[k] = +e.target.value; const o = el('visV-' + k); if (o) o.textContent = e.target.value + '%';
  visApply(); document.querySelectorAll('[data-vispre]').forEach(b => b.classList.toggle('on', b.dataset.vispre === visPreset())); });
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.vis) saveSettings(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-vispre]'); if (!b) return; SETTINGS.vis = {...VIS_PRESETS[b.dataset.vispre][2]}; saveSettings(); visApply(); renderSettings(); });

/* smooth picture / smooth camera switches */
document.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.smooth; if (!k) return; const v = !!e.target.checked; SETTINGS[k] = v; saveSettings();
  if (k === 'smooth'){ GFX.smooth = v; document.body.classList.toggle('crisp', !v); if (typeof applyGfx === 'function') applyGfx(GFX.preset); } });
document.body.classList.toggle('crisp', !GFX.smooth);
