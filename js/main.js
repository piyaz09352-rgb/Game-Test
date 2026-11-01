/* VAYRATHEN — js/main.js */
'use strict';

/* ---------- landscape only ---------- */
const PORTRAIT = matchMedia('(orientation:portrait) and (max-width:1024px)');
PORTRAIT.addEventListener?.('change', () => { if (PORTRAIT.matches && !ROT.on && !PAUSED && SETTINGS.autoSave) save(); JOY.active = false; JOY.vx = JOY.vy = 0; setTimeout(resize, 250); });
// fullscreen + landscape lock where the browser allows it (Android Chrome); iOS shows the rotate screen instead
function tryLandscape(){
  if (!matchMedia('(pointer:coarse)').matches) return;
  const de = document.documentElement, lock = () => { try { screen.orientation?.lock?.('landscape').catch(() => {}); } catch (e) {} };
  try { if (!document.fullscreenElement && de.requestFullscreen) de.requestFullscreen({navigationUI:'hide'}).then(lock, lock); else lock(); } catch (e) { lock(); }
}

/* ---------- loop ---------- */
let last = 0, goalT = 0, musT = 0;
/* one step of the game. draw=false runs the logic only (screen-rest mode, or a hidden tab driven by bgStep) */
function advance(dt, draw){
  if (PAUSED){ if (draw){ hud(); render(); } return; }
  T += dt; S.worldT += dt;
  const n = isNight(), ev = isEvent();
  if (lastNight !== null && n !== lastNight){
    if (n){ banner(L('ค่ำแล้ว · ผีโคมลอยออกล่า', 'Nightfall · Lantern Ghosts roam')); log(L('ค่ำแล้ว', 'Nightfall'), 'c'); }
    else { banner(L('รุ่งอรุณ ผีโคมลอยสลายไปกับแสงแรก', 'Dawn: the Lantern Ghosts fade with the first light')); log(L('รุ่งอรุณ', 'Dawn')); }
  }
  if (lastEvent !== null && ev !== lastEvent){
    if (ev){ banner(L('อีเว้นหลังเลิกงาน 17:00–02:00 · EXP และ Drop x1.5', 'After-work event 17:00–02:00 · EXP and drops x1.5')); log(L('อีเว้นหลังเลิกงานเริ่มแล้ว: EXP และ Drop x1.5', 'After-work event started: EXP and drops x1.5'), 'g'); SFX.play('quest'); }
    else { banner(L('อีเว้นหลังเลิกงานจบแล้ว · พบกันใหม่ 17:00 น.', 'After-work event over · back at 17:00')); log(L('อีเว้นหลังเลิกงานจบแล้ว', 'After-work event ended')); }
  }
  lastNight = n; lastEvent = ev;
  updSlots(dt);
  for (const m of mobs){ if (typeof nmUpd === 'function' && nmUpd(m, dt)) continue; updMob(m, dt); if (typeof nmAfter === 'function') nmAfter(m, dt); }
  updLoot(dt); updJoystick(); updBot(dt); updPlayer(dt); checkGates(); updSkills(dt); updFx(dt); if (draw) updPerf(dt); tickBuffBars();
  if (toastT > 0) toastT -= dt;
  if (bannerT > 0){ bannerT -= dt; if (bannerT <= 0) $('#banner').hidden = true; }
  if (typeof netTick === 'function') netTick(dt);
  if (typeof EV !== 'undefined') EV.emit('tick', dt);
  musT = (musT || 0) - dt; if (musT <= 0){ musT = 1; musicMood(); }
  if (dirty){ renderPanel(); dirty = false; }
  goalT -= dt; if (goalT <= 0){ renderGoal(); goalT = 1; }
  saveT += dt; if (saveT > 10){ saveT = 0; if (SETTINGS.autoSave) save(); }
  if (draw){ hud(); render(); }
}
function frame(ts){
  // a hidden tab gets no animation frames; bgStep() (driven by a worker timer, js/sys/bgrun.js) keeps the game going then
  if (document.hidden){ requestAnimationFrame(frame); return; }
  // clamp at 0: hideTitle() sets `last` from performance.now(), which can be later than this frame's timestamp
  const dt = Math.max(0, Math.min(.1, (ts - last) / 1000 || 0)); last = ts;
  requestAnimationFrame(frame);   // queue the next frame first: an error below can never freeze the game again
  try { advance(dt, !(typeof REST !== 'undefined' && REST.on)); }
  catch (e) { if (!frame.errT || ts - frame.errT > 3000){ frame.errT = ts; console.error('frame error', e); } }
}
/* hidden tab / folded screen / other window in front: step the game from a timer instead of animation frames.
   Gaps are replayed in slices of at most 0.1 s (like normal frames), up to 2 s per tick; a longer gap means the
   device itself slept and is not replayed. */
function bgStep(){
  if (!document.hidden || PAUSED || SETTINGS.bgRun === false) return;
  const now = performance.now(); let d = (now - last) / 1000; last = now;
  if (!(d > 0)) return;
  d = Math.min(d, 2);
  while (d > 1e-4){ const s = Math.min(.1, d); advance(s, false); d -= s; }
}

async function start(data){
  const s = (data && data.S) || load();
  if (s){ S = s; P.x = S.x || VSPAWN.x; P.y = S.y || VSPAWN.y; villageFix(); }
  applyStaticLang(); rotApply(); loadMap(S.map || 0); resize(); derive();
  const loading = k => { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#15131f'; ctx.fillRect(0, 0, SW, SH);
    ctx.fillStyle = '#e3b04b'; ctx.font = FD(500, 18); ctx.textAlign = 'center'; ctx.fillText(L('กำลังเตรียมตัวละคร…', 'Preparing characters…'), SW / 2, SH / 2 - 10);
    ctx.fillStyle = '#3a3552'; ctx.fillRect(SW / 2 - 120, SH / 2 + 8, 240, 8); ctx.fillStyle = '#e3b04b'; ctx.fillRect(SW / 2 - 120, SH / 2 + 8, 240 * k, 8); };
  loading(0);
  const artReady = ART.load();
  // pre-render what is on screen first; the rest is drawn in idle time
  const pre = [];
  // only what the first seconds need; everything else is rasterised frame by frame in idle time
  pre.push([S.job, 'idle'], [S.job, 'walk'], ['sage', 'idle', [0]], ['aunt', 'idle', [0]]);
  for (const k of ['dewblob', 'hare']) pre.push([k, 'idle', [0, 2, 6]]);
  SHEETS = await SPR.buildAll(k => loading(k), pre);
  SPR.warm(SHEETS, [[S.job, 'attack'], [S.job, 'skill'], [S.job, 'hurt'], ...['dewblob', 'hare', 'boar', 'lantern'].flatMap(k => [[k, 'idle'], [k, 'walk'], [k, 'attack']]), ['sage', 'idle'], ['aunt', 'idle'], [S.job, 'sit'], [S.job, 'roll'], [S.job, 'ride'], [S.job, 'rideIdle']]);
  await artReady;
  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', () => { if (!PAUSED && SETTINGS.autoSave) save(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !PAUSED && SETTINGS.autoSave) save(); });
  window.claude?.hot?.snapshot?.(() => ({S}));
  initUI(); applySettings(); applyControlMode(); showTitle(); netInit();
  matchMedia('(pointer:coarse)').addEventListener?.('change', applyControlMode);
  window.__vay = {P, get mobs(){ return mobs; }, cam, get S(){ return S; }};
  dirty = true;
  requestAnimationFrame(ts => { last = ts; frame(ts); });
}
// show any startup error on screen instead of a silent black canvas
function showFatal(msg){
  const t = document.getElementById('title'); if (!t) return;
  t.hidden = false; t.classList.remove('out');
  t.querySelector('.title-card').innerHTML = `<p class="t-eyebrow">${L('เกิดข้อผิดพลาด', 'Something went wrong')}</p><p class="t-sub" style="margin:10px 0">${String(msg).slice(0, 300)}</p><div class="t-btns"><button class="tbtn gold" onclick="location.reload()">โหลดใหม่</button></div>`;
}
window.addEventListener('error', e => { if (!window.__vay) showFatal(e.message); });
window.addEventListener('unhandledrejection', e => { if (!window.__vay) showFatal(e.reason && e.reason.message || e.reason); });
// a 2D canvas can be dropped by the browser under memory pressure; repaint the ground when it comes back
cv.addEventListener('contextlost', e => e.preventDefault());
cv.addEventListener('contextrestored', () => { try { repaintMap(); } catch (err) {} });
const boot = () => window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
{ let booted = false; const go = () => { if (booted) return; if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', go, {once:true}); return; } booted = true; boot(); };   // (v236) never before every script has run (job lines register late)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); setTimeout(go, 2500); }   // never wait more than 2.5 s for fonts
