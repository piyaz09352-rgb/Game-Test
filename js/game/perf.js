/* VAYRATHEN — js/game/perf.js
   Keeps the game smooth on any machine: applies a graphics preset live (no reload), shows an FPS meter,
   and in "auto" mode steps the preset down when frames stay slow. A step down is remembered for next time. */
'use strict';

const GFX_TH = new Proxy({auto:['อัตโนมัติ', 'Auto'], low:['ต่ำ', 'Low'], medium:['กลาง', 'Medium'], high:['สูง', 'High'], ultra:['สูงสุด', 'Ultra']}, {get:(o, k) => (o[k] ? L(...o[k]) : k)});
const PERF = {fps:60, fpsT:0, frames:0, acc:0, n:0, slow:0, warm:6, warned:false};

/* soft: the automatic step-down mid-play only changes what is cheap now (screen resolution, effects); the ground,
   props and sprites are painted again at the next map change, behind its fade, instead of freezing a frame */
function applyGfx(name, soft){
  const before = {k:GFX.k, ts:GFX.ts, ps:GFX.ps, budget:GFX.budget};   // (v97) a soft step keeps the sprite budget too: a smaller budget with the old large sprites only threw pictures away and painted them again
  GFX.use(name); PERF.pend = null;
  if (soft && (GFX.ts !== before.ts || GFX.ps !== before.ps || GFX.k !== before.k)){ PERF.pend = name; Object.assign(GFX, before); }
  if (GFX.ts !== before.ts){ TS = GFX.ts; repaintMap(); }
  if (GFX.ps !== before.ps) for (const k in propCache) delete propCache[k];
  if (GFX.k !== before.k && SHEETS) SPR.rebuild(SHEETS);
  resize();
  PERF.acc = PERF.n = PERF.slow = 0; PERF.warm = 4;
}
function setGfxMode(mode){ GFX.mode = mode; applyGfx(mode === 'auto' ? GFX.guess : mode); }

function updPerf(dt){
  PERF.fpsT += dt; PERF.frames++;
  if (PERF.fpsT >= .5){ PERF.fps = PERF.frames / PERF.fpsT; PERF.fpsT = 0; PERF.frames = 0;
    const f = document.getElementById('fps'); if (f){ f.hidden = !SETTINGS.showFps; if (SETTINGS.showFps) { f.textContent = `${Math.round(PERF.fps)} fps`; f.title = GFX_TH[GFX.preset]; } } }
  if (document.hidden) return;
  if (PERF.warm > 0){ PERF.warm -= dt; return; }
  PERF.acc += dt; PERF.n++;
  if (PERF.acc < 3) return;
  const avg = PERF.acc / PERF.n; PERF.acc = 0; PERF.n = 0;
  PERF.slow = avg > 1 / 40 ? PERF.slow + 1 : 0;           // under ~40 FPS for two windows in a row
  if (PERF.slow < 2) return;
  PERF.slow = 0;
  const i = GFX.ORDER.indexOf(GFX.preset);
  if (i <= 0) return;
  const lower = GFX.ORDER[i - 1];
  if (GFX.mode === 'auto'){
    GFX.guess = lower; try { localStorage.setItem('vayrathen-gfx-auto', lower); } catch (e) {}
    applyGfx(lower, true); toast(L(`ปรับกราฟิกเป็น "${GFX_TH[lower]}" อัตโนมัติให้ลื่นขึ้น`, `Graphics lowered to "${GFX_TH[lower]}" automatically for smoother play`));
    if (!el('win-settings')?.hidden) renderSettings();
  } else if (!PERF.warned){
    PERF.warned = true; toast(L(`เกมกระตุก ลองลดกราฟิกเป็น "${GFX_TH[lower]}" ในหน้าตั้งค่า (O)`, `The game is stuttering. Try "${GFX_TH[lower]}" graphics in Settings (O)`));
  }
}

/* a step-down that was put off is finished when the next map is painted (loadMap paints the ground itself) */
{ const _lm = loadMap;
  loadMap = function(){ const n = PERF.pend;
    if (n && GFX.preset === n){ PERF.pend = null; const k0 = GFX.k; GFX.use(n); for (const k in propCache) delete propCache[k]; if (GFX.k !== k0 && SHEETS) SPR.rebuild(SHEETS); }
    return _lm.apply(this, arguments); }; }
