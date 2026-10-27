/* VAYRATHEN — js/sys/perf4.js — (v105) why the game stuttered, and the fixes (measured, see docs/UPDATES.md v105)
   1. Page animations: always-running CSS animations (the EXP bars' flowing light, gold "new" dots, glows, twinkles)
      forced the browser to repaint the HUD every frame: about a third of the frame. (v106) Every looping animation and
      every blinking strobe in every style sheet is now stopped (found at load and again later for sheets systems add);
      one-shot entrances stay. The full-screen flash is gone too.
   2. Fewer things per frame: monsters, NPCs and loot far off screen are no longer queued and sorted for drawing
      (render.js), and the ground is scaled with normal rather than "high" filtering (sharp preset keeps "high").
   3. Phones: the "high/ultra" picture caps the canvas at 1.5× the screen's CSS pixels (was 2×; 3× screens drew 4×
      the pixels for little visible gain).
   4. Frame rate cap (Settings → Graphics → "จำกัดเฟรมเรต"): auto = 30 FPS on a phone with the low or medium picture,
      otherwise free; or always 30 / always 60. A steady 30 feels smoother than a stuttering 45–60. */
'use strict';

/* ---------- 1. no looping or blinking animations (v106: every one, not only the ones that repaint) ---------- */
/* stopped: anything that loops forever (spins, pulses, bobs, halos, dots, glows, flowing bars) and the short strobes
   that flash on and off (refine flashes, low-HP and MVP blinks, map/phase flashes). Kept: one-shot entrances
   (windows sliding in, pop-ups, banners) — they play once and stop. */
const PF4 = {blink:new Set(['flow', 'sheen', 'glow', 'eqGlow', 'cuteTwinkle', 'dot', 'pf4dot', 'blink', 'bfBlink', 'mvpblink', 'lowhp', 'rfflash', 'rfhit', 'phFlash', 'mapFlash']), seen:new WeakSet(), sheet:null, done:new Set()};
function pf4Scan(){
  if (!PF4.sheet){ const st = document.createElement('style'); st.id = 'pf4css'; document.head.appendChild(st); PF4.sheet = st.sheet; }
  const add = (sel, body) => { const k = sel + '|' + body; if (PF4.done.has(k)) return; PF4.done.add(k); try { PF4.sheet.insertRule(`${sel}{${body}}`, PF4.sheet.cssRules.length); } catch (e) {} };
  const walk = rules => { for (const r of rules){
      if (r.cssRules && !r.selectorText){ try { walk(r.cssRules); } catch (e) {} continue; }   // @media blocks
      if (!r.style || !r.selectorText) continue; const name = r.style.animationName; if (!name || name === 'none') continue;
      const names = name.split(',').map(x => x.trim()), loops = /infinite/.test(r.style.animationIterationCount || r.style.animation || '');
      if (loops || names.some(n => PF4.blink.has(n))) add(r.selectorText, 'animation:none!important');
    } };
  for (const s of document.styleSheets){ if (s === PF4.sheet || PF4.seen.has(s)) continue;
    let rules; try { rules = s.cssRules; } catch (e) { continue; }   // another site's font sheet
    if (!s.ownerNode || s.ownerNode.tagName === 'LINK') PF4.seen.add(s); walk(rules); }
}
/* the full-screen flash (crits, level ups, skills) blinks the whole picture: drop it */
if (typeof VFX !== 'undefined' && VFX.drawFlash) VFX.drawFlash = () => {};
pf4Scan(); setTimeout(pf4Scan, 3000); setTimeout(pf4Scan, 15000);   // systems add their own <style> as they load and open

/* ---------- 3. phones: a lighter canvas at the sharp presets ---------- */
if (typeof GFX !== 'undefined' && GFX.touch){
  GFX.P.high.dpr = Math.min(GFX.P.high.dpr, 1.5); GFX.P.ultra.dpr = Math.min(GFX.P.ultra.dpr, 1.5);
  if (GFX.preset) GFX.use(GFX.preset);
  if (typeof resize === 'function' && typeof cv !== 'undefined') try { resize(); } catch (e) {}
}

/* ---------- 4. frame rate cap ---------- */
const pf4Cap = () => { const s = typeof SETTINGS !== 'undefined' ? SETTINGS.fpsCap || 'auto' : 'auto';
  if (s === '30') return 30; if (s === '60') return 0;
  return typeof GFX !== 'undefined' && GFX.touch && (GFX.preset === 'low' || GFX.preset === 'medium') ? 30 : 0; };
if (typeof frame === 'function'){
  const _fr = frame; let lastDraw = 0;
  frame = function(ts){
    const cap = pf4Cap();
    // skip this refresh when it comes too soon (a little slack so a 60 Hz screen lands on every second refresh)
    if (cap && !document.hidden && ts - lastDraw < 1000 / cap - 4){ requestAnimationFrame(frame); return; }
    lastDraw = ts; return _fr.apply(this, arguments);
  };
}
if (typeof renderSettings === 'function'){
  const _rs = renderSettings;
  renderSettings = function(){ const r = _rs.apply(this, arguments);
    const g = el('set-gfx'), row = g && g.closest('label'); if (!row || el('set-fpscap')) return r; const v = SETTINGS.fpsCap || 'auto';
    const o = (k, t) => `<option value="${k}" ${v === k ? 'selected' : ''}>${t}</option>`;
    row.insertAdjacentHTML('afterend', `<label class="set"><span><b>${L('จำกัดเฟรมเรต', 'Frame rate cap')}</b><small>${L('30 FPS ที่นิ่งลื่นกว่า 60 ที่สะดุด · อัตโนมัติ = 30 บนมือถือที่ภาพต่ำ/กลาง', 'A steady 30 FPS beats a stuttering 60 · auto = 30 on phones at low/medium picture')}</small></span>
      <select id="set-fpscap">${o('auto', L(`อัตโนมัติ (${pf4Cap() || L('ไม่จำกัด', 'free')})`, `Auto (${pf4Cap() || 'free'})`))}${o('30', '30 FPS')}${o('60', L('ไม่จำกัด', 'Free'))}</select></label>`);
    return r; };
}
document.addEventListener('change', e => { if (!e.target || e.target.id !== 'set-fpscap') return; SETTINGS.fpsCap = e.target.value; if (typeof saveSettings === 'function') saveSettings(); toast(L('ตั้งเฟรมเรตแล้ว', 'Frame rate set')); });
