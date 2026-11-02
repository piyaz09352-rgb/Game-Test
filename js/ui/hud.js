/* VAYRATHEN — js/ui/hud.js */
'use strict';

/* ---------- HUD & window system ---------- */
const UIKEY = 'vayrathen-ui-v1', WIN_IDS = ['stat', 'skill', 'bag', 'log', 'settings', 'help', 'auto', 'equip', 'world', 'social', 'quest', 'wiki'];
let UIS = {open:{}, min:{}, pos:{}, fold:{}, hide:false};
try { const r = localStorage.getItem(UIKEY); if (r) UIS = Object.assign(UIS, JSON.parse(r)); } catch (e) {}
const saveUI = () => { try { localStorage.setItem(UIKEY, JSON.stringify(UIS)); } catch (e) {} };
const E = {}; const el = id => { let e = E[id]; if (!e || !e.isConnected) e = E[id] = document.getElementById(id); return e; };   // cached, re-found when a re-render replaced it
let zTop = 50, drag = null, lastTarget = null, hudF = 0;
const winEl = id => el('win-' + id);
const isPhone = () => vpW() <= 700;
function syncMenu(){ document.querySelectorAll('.mb[data-win]').forEach(b => b.setAttribute('aria-pressed', UIS.open[b.dataset.win] ? 'true' : 'false')); }
function openWin(id){
  const w = winEl(id); if (!w) return;
  if (id === 'settings') renderSettings();
  if (id === 'auto') renderAuto();
  if (id === 'skill') setTimeout(() => requestAnimationFrame(drawSkLines), 30);
  if (id === 'equip') renderEquip();
  if (id === 'world'){ WM.sel = MAP_ID; renderWorld(); }
  if (id === 'wiki') renderWiki();
  if (typeof WIN_RENDER !== 'undefined' && WIN_RENDER[id]) WIN_RENDER[id]();
  if (id === 'social') setTimeout(openSocial);
  if (id === 'quest') setTimeout(renderQuestLog);
  if (compactUI()) for (const o of WIN_IDS) if (o !== id && UIS.open[o]) closeWin(o);
  w.hidden = false; fitWin(id); w.classList.remove('out', 'in'); void w.offsetWidth; w.classList.add('in');
  w.style.zIndex = ++zTop; UIS.open[id] = 1; saveUI(); syncMenu();
}
function closeWin(id){
  const w = winEl(id); if (!w || w.hidden) return;
  w.classList.remove('in'); w.classList.add('out'); delete UIS.open[id]; saveUI(); syncMenu();
  setTimeout(() => { if (w.classList.contains('out')){ w.hidden = true; w.classList.remove('out'); } }, 170);
}
function toggleWin(id){ UIS.open[id] ? closeWin(id) : openWin(id); }
function topWin(){ let best = null, z = -1; for (const id of WIN_IDS){ const w = winEl(id); if (UIS.open[id] && (+w.style.zIndex || 0) > z){ z = +w.style.zIndex || 0; best = id; } } return best; }
function setHideUI(v){
  UIS.hide = !!v; el('ui').classList.toggle('hide-ui', UIS.hide);
  const b = el('uiToggle'); b.setAttribute('aria-pressed', UIS.hide); b.setAttribute('aria-label', UIS.hide ? L('แสดง UI', 'Show UI') : L('ซ่อน UI', 'Hide UI'));
  b.querySelector('span').textContent = UIS.hide ? L('แสดง UI', 'Show UI') : L('ซ่อน UI', 'Hide UI');
  if (UIS.hide) toast(L('ซ่อน UI แล้ว · กดปุ่มรูปตา หรือ H เพื่อแสดง', 'UI hidden · press the eye button or H to show it'));
  saveUI();
}
function pulseChar(){ const c = el('charCard'); c.classList.remove('pulse'); void c.offsetWidth; c.classList.add('pulse'); }
/* small screens (phones, the narrow app panel): one window at a time, shown as a full sheet */
const compactUI = () => vpW() <= 900 || vpH() <= 500;
/* where a window opens on a big screen: its saved spot if it still fits, else centred (cascading when others are
   open), always kept between the top bar and the hotbar, never taller than the room left */
function fitWin(id){
  const w = winEl(id), ui = el('ui'); el('ui').classList.toggle('compact', compactUI()); if (compactUI()){ w.style.left = w.style.top = w.style.maxHeight = ''; return; }
  const W0 = ui.clientWidth, H0 = ui.clientHeight, dk = el('dock'), dockH = dk && dk.offsetHeight ? dk.offsetHeight + 24 : 20, ww = w.offsetWidth || 340;
  const others = WIN_IDS.filter(o => o !== id && UIS.open[o]).length, p = UIS.pos[id];
  let x = Math.round((W0 - ww) / 2 + others * 26), y = 56 + others * 26;
  if (p && p[0] >= 0 && p[0] + 80 < W0 && p[1] >= 0 && p[1] + 60 < H0 - dockH){ x = p[0]; y = p[1]; }
  x = clamp(x, 8, Math.max(8, W0 - ww - 8)); y = clamp(y, 8, Math.max(8, H0 - dockH - 160));
  w.style.left = x + 'px'; w.style.top = y + 'px'; w.style.right = 'auto'; w.style.bottom = 'auto';
  w.style.setProperty('--wmax', Math.max(200, H0 - y - dockH) + 'px');
}
function placeWin(id){
  const w = winEl(id), p = UIS.pos[id];
  if (p && !isPhone()){ w.style.left = p[0] + 'px'; w.style.top = p[1] + 'px'; w.style.right = 'auto'; w.style.bottom = 'auto'; }
}
function initUI(){
  for (const id of WIN_IDS){ placeWin(id); winEl(id).classList.toggle('min', !!UIS.min[id]); }
  delete UIS.fold.charCard;
  for (const id in UIS.fold) if (el(id)) el(id).classList.toggle('folded', !!UIS.fold[id]);
  const open = Object.keys(UIS.open); UIS.open = {}; open.forEach(openWin);
  setHideUI(UIS.hide); syncMenu();
}
document.addEventListener('pointerdown', e => {
  const w = e.target.closest('.win'); if (w) w.style.zIndex = ++zTop;
  const h = e.target.closest('[data-drag]');
  if (!h || e.target.closest('button') || compactUI()) return;
  const win = winEl(h.dataset.drag), st = brect(el('wrap')), r = brect(win);
  drag = {w:win, id:h.dataset.drag, dx:ptX(e) - r.left, dy:ptY(e) - r.top, st};
  win.style.left = (r.left - st.left) + 'px'; win.style.top = (r.top - st.top) + 'px'; win.style.right = 'auto'; win.style.bottom = 'auto';
  try { h.setPointerCapture(e.pointerId); } catch (err) {}
  e.preventDefault();
});
document.addEventListener('pointermove', e => {
  if (!drag) return;
  const {w, st} = drag;
  w.style.left = clamp((ptX(e) - st.left - drag.dx) / UIZ, 0, st.width / UIZ - w.offsetWidth) + 'px';
  w.style.top = clamp((ptY(e) - st.top - drag.dy) / UIZ, 0, st.height / UIZ - 44) + 'px';
});
document.addEventListener('pointerup', () => { if (!drag) return; UIS.pos[drag.id] = [parseFloat(drag.w.style.left), parseFloat(drag.w.style.top)]; saveUI(); drag = null; });

function drawPortrait(){
  if (!SHEETS) return;
  if (S.job === 'novice' && SPR.lookKey(S.look) === 'm00' && ART.portrait(el('portrait').getContext('2d'), 'villager', 40)) return;
  const g = el('portrait').getContext('2d'), sh = heroSheet(), f = SPR.frameAt(sh, 'idle', T);
  const fs = sh.fs, K = sh.K, c = SPR.ensure(sh, 'idle');
  // 32×32 world units around the head, drawn at exactly 1:1 sprite pixels → crisp
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, 64, 64);
  g.drawImage(c, f * fs + fs / 2 - 16 * K, sh.anchor[1] - (S.job === 'rune' ? 52 : 45) * K, 32 * K, 32 * K, 0, 0, 64, 64);
}
/* tap / click the minimap to walk there (pathfinding does the rest; a gold flag marks the spot) */
let MMGO = null;
el('minimap').addEventListener('pointerdown', e => {
  if (PAUSED || P.dead) return; e.preventDefault(); e.stopPropagation();
  const r = brect(el('minimap')), fx = clamp((ptX(e) - r.left) / r.width, 0, 1), fy = clamp((ptY(e) - r.top) / r.height, 0, 1);
  if (typeof botPauseFromManual === 'function') botPauseFromManual();
  P.sit = false; P.target = null; P.npc = null; P.loot = null; P.pending = null; P.cast = null;
  P.tx = clamp(fx * W, 8, W - 8); P.ty = clamp(fy * H, 8, H - 8); MMGO = {x:P.tx, y:P.ty, t:T};
  if (typeof SFX !== 'undefined' && SFX.play) SFX.play('click');
});
const MM_TAGS = [];   // (v229) the gate tags placed this frame
const MM_SPOT = new Map();   // (v239) where each gate tag sits, fixed per map
function drawMini(){
  if (el('mapCard').classList.contains('folded')) return;
  const mm = el('minimap'), g = mm.getContext('2d'), w = mm.width, h = mm.height;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = true;
  g.drawImage(mini, 0, 0, w, h);
  if (nightA > .01){ g.fillStyle = `rgba(14,12,48,${nightA * .6})`; g.fillRect(0, 0, w, h); }
  const kx = w / W, ky = h / H, u = w / 170;
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = u; g.strokeRect(cam.x * kx, cam.y * ky, VW * kx, VH * ky);
  for (const m of mobs){ if (m.dead) continue; const r = (m.def.boss ? 3.5 : 1.2) * u; g.fillStyle = m.def.boss ? '#ffd56a' : m.def.aggro ? '#ff9a80' : '#ff6b6b'; g.fillRect(m.x * kx - r, m.y * ky - r, r * 2, r * 2); }
  // boss lair (a crown, red and pulsing while the boss is out) and the gateways
  if (boss && !boss.dead){ const lx = 0, ly = 0, alive = true, pz = 1 + Math.sin(T * 6) * .2;
    g.save(); g.translate(alive ? boss.x * kx : lx, alive ? boss.y * ky : ly); g.scale(u * pz, u * pz);
    g.fillStyle = alive ? '#ff5a4a' : 'rgba(40,20,20,.75)'; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill();
    g.fillStyle = alive ? '#fff0a0' : '#e3b04b'; g.beginPath(); g.moveTo(-4, 2); g.lineTo(-4, -2); g.lineTo(-2, 0); g.lineTo(0, -3.5); g.lineTo(2, 0); g.lineTo(4, -2); g.lineTo(4, 2); g.closePath(); g.fill(); g.restore(); }
  // (v221) each gateway points its own way and says the monster levels of the map behind it, coloured by your level:
  // green = your level or below, gold = a little above you, red = too strong for now; a town shows «เมือง»
  MM_TAGS.length = 0; const sig = w + 'x' + h + ':' + GATES.map(q => q.to + '@' + q.x + ',' + q.y).join(';');
  for (const gt of GATES){ const mp = MAPS[gt.to], ang = {e:0, s:Math.PI / 2, w:Math.PI, n:-Math.PI / 2}[gt.side] || 0, gx = gt.x * kx, gy = gt.y * ky;
    g.save(); g.translate(gx, gy); g.rotate(ang); g.scale(u, u); g.fillStyle = '#e3b04b'; g.strokeStyle = 'rgba(60,20,10,.9)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(6, 0); g.lineTo(-2, -5); g.lineTo(-2, 5); g.closePath(); g.fill(); g.stroke(); g.restore();
    if (!mp) continue; const town = !!mp.town || mp.id === 0, lv0 = mp.lv[0], gap = lv0 - S.lvl;
    const txt = town ? L('เมือง', 'Town') : `Lv ${lv0}–${mp.lv[1]}`, col = town ? ['#e8f6ff', '#2a5a8a'] : gap <= 0 ? ['#eaffe8', '#2a7a3a'] : gap <= 8 ? ['#fff4c8', '#9a6a0a'] : ['#ffe2dc', '#b02a1a'];
    g.font = `800 ${Math.round(8.5 * u)}px Sarabun,"Noto Sans Thai",sans-serif`; g.textBaseline = 'middle'; const tw = g.measureText(txt).width + 6 * u, th = 11 * u;
    // (v229) the first free spot: beside the gate (inward), then shifted along the edge; never over another tag or your arrow
    const bx = gt.side === 'e' ? gx - 9 * u - tw : gt.side === 'w' ? gx + 9 * u : gx - tw / 2, by = gt.side === 's' ? gy - 9 * u - th : gt.side === 'n' ? gy + 9 * u : gy - th / 2;
    const vert = gt.side === 'e' || gt.side === 'w', ox = gt.side === 'e' ? gx + 9 * u : gt.side === 'w' ? gx - 9 * u - tw : bx, oy = gt.side === 's' ? gy + 9 * u : gt.side === 'n' ? gy - 9 * u - th : by;   // outward: the far side of the gate
    const cands = [[bx, by], [ox, oy], ...[1, -1, 2, -2].flatMap(k => vert ? [[bx, by + k * (th + 2 * u)], [ox, oy + k * (th + 2 * u)]] : [[bx + k * (tw * .55 + 2 * u), by], [ox + k * (tw * .55 + 2 * u), oy]])];
    // (v239) the spot is chosen once per map and minimap size and then stays put: dodging your arrow every frame made the tags jump about
    const key = `${sig}|${gt.x}|${gt.y}|${txt}`;
    let spot = MM_SPOT.get(key);
    if (!spot){ const hit = (x, y) => MM_TAGS.some(q => x < q[0] + q[2] && x + tw > q[0] && y < q[1] + q[3] && y + th > q[1]);
      spot = [clamp(bx, 1, w - tw - 1), clamp(by, 1, h - th - 1)];
      for (const [cx0, cy0] of cands){ const cx1 = clamp(cx0, 1, w - tw - 1), cy1 = clamp(cy0, 1, h - th - 1); if (!hit(cx1, cy1)){ spot = [cx1, cy1]; break; } }
      if (MM_SPOT.size > 400) MM_SPOT.clear(); MM_SPOT.set(key, spot); }
    const tx = spot[0], ty = spot[1];
    MM_TAGS.push([tx, ty, tw, th]);
    g.fillStyle = col[1]; g.beginPath(); g.roundRect ? g.roundRect(tx, ty, tw, th, 4 * u) : g.rect(tx, ty, tw, th); g.fill(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = .8 * u; g.stroke();
    g.fillStyle = col[0]; g.textAlign = 'left'; g.fillText(txt, tx + 3 * u, ty + th / 2 + .5 * u); }
  g.fillStyle = '#7ff0c4'; for (const n of NPCS) g.fillRect(n.x * kx - 2 * u, n.y * ky - 2 * u, 4 * u, 4 * u);
  if (MMGO && P.tx != null && Math.hypot(P.tx - MMGO.x, P.ty - MMGO.y) < 1){ const fx = MMGO.x * kx, fy = MMGO.y * ky, b = Math.sin(T * 6) * .8 * u;
    g.strokeStyle = 'rgba(255,240,180,.55)'; g.setLineDash([2 * u, 2 * u]); g.lineWidth = u; g.beginPath(); g.moveTo(P.x * kx, P.y * ky); g.lineTo(fx, fy); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#1c0f08'; g.fillRect(fx - .6 * u, fy - 8 * u + b, 1.6 * u, 8 * u); g.fillStyle = '#f2c444'; g.beginPath(); g.moveTo(fx + u, fy - 8 * u + b); g.lineTo(fx + 6 * u, fy - 6 * u + b); g.lineTo(fx + u, fy - 4 * u + b); g.closePath(); g.fill();
    g.strokeStyle = '#f2c444'; g.beginPath(); g.ellipse(fx, fy, 3 * u, 1.5 * u, 0, 0, 7); g.stroke(); }
  else MMGO = null;
  // you: a big gold arrow pointing where you face, a dark outline, a glow and two pulsing rings, so it never gets lost
  const px = P.x * kx, py = P.y * ky, pr = (T * 1.1) % 1, pr2 = (pr + .5) % 1;
  for (const p of [pr, pr2]){ g.strokeStyle = `rgba(255,214,90,${(1 - p) * .9})`; g.lineWidth = 1.6 * u; g.beginPath(); g.arc(px, py, (5 + p * 11) * u, 0, 7); g.stroke(); }
  const gl = g.createRadialGradient(px, py, 0, px, py, 9 * u); gl.addColorStop(0, 'rgba(255,230,120,.75)'); gl.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = gl; g.beginPath(); g.arc(px, py, 9 * u, 0, 7); g.fill();
  g.save(); g.translate(px, py); g.rotate((90 + ((P.dir || 0) & 7) * 45) * Math.PI / 180); g.scale(u, u);
  g.beginPath(); g.moveTo(7.5, 0); g.lineTo(-5, -5.5); g.lineTo(-2.2, 0); g.lineTo(-5, 5.5); g.closePath();
  g.lineJoin = 'round'; g.lineWidth = 3.2; g.strokeStyle = '#1a0c04'; g.stroke(); g.lineWidth = 1.2; g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#ffd23a'; g.fill(); g.restore();
}
function updTarget(){
  const m = P.target, box = el('target');
  if (!m || m.dead){ if (!box.hidden) box.hidden = true; lastTarget = null; return; }
  if (lastTarget !== m){
    lastTarget = m; box.hidden = false; box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
    const d = m.def, em = elemMod(DER.welem, d.elem);
    el('tName').textContent = `Lv.${d.lvl} ${nm(d)}`;
    // (v101) EXP by level gap: shown only when it is not 100%, green above, red below
    const gx = typeof expGap === 'function' ? expGap(d.lvl) : 1;
    el('tMeta').innerHTML = `${escH(`${elemName(d.elem)} · ${L(SIZE_TH[d.size], SIZE_EN[d.size])} · ${L(RACE_TH[d.race], RACE_EN[d.race])}`)}${gx !== 1 ? ` · <span class="tgx ${gx > 1 ? 'up' : 'down'}">EXP ${gx > 1 ? '+' : '−'}${Math.round(Math.abs(gx - 1) * 100)}%</span>` : ''}`;
    el('tEm').textContent = `WPN ${Math.round(em * 100)}%`; el('tEm').style.color = em > 1 ? '#9ff0c8' : em < 1 ? '#ff9a8f' : '#a39cb8';
    box.classList.toggle('boss', !!d.boss); box.title = MOB_LORE[m.type] ? L(...MOB_LORE[m.type]) : '';   // field note on hover
    el('tG').style.transition = 'none'; el('tG').style.width = (clamp(m.hp / m.maxhp, 0, 1) * 100) + '%'; void el('tG').offsetWidth; el('tG').style.transition = '';
  }
  const p = (clamp(m.hp / m.maxhp, 0, 1) * 100).toFixed(1) + '%';
  el('tI').style.width = p; el('tG').style.width = p;
}
function hud(){
  const setW = (id, v) => { const s = (clamp(v, 0, 1) * 100).toFixed(1) + '%'; const n = el(id); if (n.style.width !== s) n.style.width = s; };
  const setT = (id, s) => { const n = el(id); if (n.textContent !== s) n.textContent = s; };
  setW('hpI', S.hp / DER.maxhp); setW('hpG', S.hp / DER.maxhp); setW('spI', S.sp / DER.maxsp); setW('spG', S.sp / DER.maxsp);
  // (v221) the bars read «HP» on the left and the numbers on the right
  const setH = (id, h) => { const n = el(id); if (n.dataset.h !== h){ n.dataset.h = h; n.innerHTML = h; } };
  setH('hpT', `<b>HP</b><em>${Math.max(0, Math.round(S.hp)).toLocaleString()} / ${DER.maxhp.toLocaleString()}</em>`); setH('spT', `<b>SP</b><em>${Math.round(S.sp).toLocaleString()} / ${DER.maxsp.toLocaleString()}</em>`);
  el('hpBar').classList.toggle('low', S.hp / DER.maxhp < .25 && !P.dead);
  const nb = nextBase(S.lvl), nj = nextJob(S.jlvl), jm = S.jlvl >= JOBS[S.job].jobMax, bm = S.lvl >= LV_MAX;
  setW('bxI', bm ? 1 : S.exp / nb); setW('jxI', jm ? 1 : S.jexp / nj);
  setT('bxT', bm ? 'Base MAX' : `Base ${(Math.min(S.exp / nb, .999) * 100).toFixed(1)}%`); setT('jxT', jm ? 'Job MAX' : `Job ${(S.jexp / nj * 100).toFixed(1)}%`);
  { const a = el('ammoT'), on = usesArrows(); if (a.hidden === on) a.hidden = !on; if (on){ const n = arrowCount(); setT('ammoT', `${ammoWant() === 'star' ? '✦' : '➶'} ${n}`); a.classList.toggle('low', n < 50); } }
  setT('cJob', nm(JOBS[S.job])); setT('cLv', `Base ${S.lvl} · Job ${S.jlvl}`); setT('lvBadge', String(S.lvl));
  document.querySelectorAll('.cdv').forEach(c => {
    const id = c.dataset.cd, sk = SKILLS[id], full = sk ? skCd(sk, skl(id) || 1) : MOVES[id].cd;
    let v = clamp((P.cds[id] || 0) / (full || 1), 0, 1); if (sk && P.acd > 0 && P.acdMax && !c.closest('.mo')) v = Math.max(v, clamp(P.acd / P.acdMax, 0, 1)); const prev = +(c.dataset.p || 0);   // (v112) touch buttons: the short pause after every cast no longer darkens every skill button (it made them blink under Auto); a tap in that pause still waits as before
    c.style.setProperty('--cd', v.toFixed(3));
    if (prev > 0 && v === 0){ const b = c.parentElement; b.classList.remove('ready'); void b.offsetWidth; b.classList.add('ready'); }
    c.dataset.p = v;
  });
  // clock: real Thailand time; the after-work event (17:00–02:00) shows in gold
  const tn = thNow(), hh = tn.getUTCHours(), mm = tn.getUTCMinutes(), nightNow = isNight(), evNow = isEvent();
  setT('clock', `${evNow ? L('อีเว้นหลังเลิกงาน x1.5', 'After-work x1.5') : nightNow ? L('กลางคืน', 'Night') : L('กลางวัน', 'Day')} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}${L(' น.', '')}${typeof wxLabel === 'function' ? wxLabel() : ''}`);
  el('clock').classList.toggle('night', nightNow && !evNow); el('clock').classList.toggle('event', evNow);
  updTarget(); drawPortrait(); if (UIS.open.equip) drawEquipPrev();
  if ((hudF & 15) === 0 && el('ui').classList.contains('moba')){ const pb = el('mobaPot').querySelectorAll('.pot em'); if (pb.length === 2 && (+pb[0].textContent !== (S.inv[bestHp()] || 0) || +pb[1].textContent !== (S.inv[bestSp()] || 0))) renderMoba(); }
  updCastBar();
  if ((hudF & 7) === 0){ placeChips(); railDot(); const cu = compactUI(); if (el('ui').classList.contains('compact') !== cu) el('ui').classList.toggle('compact', cu); }
  if ((hudF++ & 1) === 0) drawMini();
}

/* status chips (Auto · FPS · online) sit right under the minimap; the menu rail follows under them */
/* chat: a fixed box bottom-left (above the hotbar row, beside the joystick in touch mode); only its height changes —
   drag the grip on its top edge or tap ▴/▾. The chosen height is remembered in this browser. */
const CHAT = {h:(() => { try { return +localStorage.getItem('vay-chat-h') || 110; } catch (e) { return 110; } })()};
function chatMax(){
  const cb = el('chatBox'), lg = el('chatLog'), gc = el('goalCard'), ui = el('ui'); if (!cb || !lg) return 240;
  const k = (brect(cb).width / (cb.offsetWidth || 1)) || 1, r = brect(cb), chrome = cb.offsetHeight - (lg.style.display === 'none' ? 0 : lg.offsetHeight);
  const top = ui.classList.contains('moba') || !gc || gc.hidden ? brect(ui).top + 60 * k : brect(gc).bottom;
  return Math.max(40, Math.floor((r.bottom - top) / k - chrome - 10));
}
function setChatH(h){ const max = Math.min(400, chatMax()); CHAT.h = clamp(Math.round(h), 0, max);
  const lg = el('chatLog'); if (lg){ lg.style.height = CHAT.h + 'px'; lg.style.display = CHAT.h < 8 ? 'none' : ''; lg.scrollTop = lg.scrollHeight; }
  try { localStorage.setItem('vay-chat-h', String(CHAT.h)); } catch (e) {} }
/* Chat follows the usual MMO layout:
   · big screens: bottom-left corner, next to the hotbar (or just above it when there is no room). While you are not
     using it the panel turns see-through, tabs and input hide and old lines fade, so it never covers the game.
     The – button tucks it into a small "แชท" button; Enter opens it and focuses the input.
   · phones / small windows: starts tucked into the "แชท" button above the joystick, with the newest line previewed
     and an unread count; tap to open the panel, – to tuck it away again. */
CHAT.open = (() => { try { const v = localStorage.getItem('vay-chat-open'); return v == null ? null : v === '1'; } catch (e) { return null; } })();
CHAT.seen = 0; CHAT.unread = 0; CHAT.act = 0;
const chatIsOpen = () => (CHAT.open == null ? !compactUI() : CHAT.open);
function chatShow(){
  const cb = el('chatBox'), bt = el('chatBtn'); if (!cb || !bt) return;
  const on = typeof NET !== 'undefined' && !!NET.room, open = on && chatIsOpen();
  cb.hidden = !open; bt.hidden = !on || open;
  if (open){ CHAT.unread = 0; CHAT.seen = NET.chat.length; }
  el('chatBadge').hidden = !CHAT.unread; el('chatBadge').textContent = CHAT.unread > 99 ? '99+' : String(CHAT.unread);
}
function chatSet(open, focus){ CHAT.open = open; try { localStorage.setItem('vay-chat-open', open ? '1' : '0'); } catch (e) {} CHAT.act = performance.now(); chatShow(); placeChat(); if (open && focus) setTimeout(() => el('chatIn') && el('chatIn').focus(), 30); }
function chatNew(){   // called after every chat render: unread count + preview line while tucked away
  if (typeof NET === 'undefined') return; const n = NET.chat.length;
  if (chatIsOpen()){ if (n > CHAT.seen) CHAT.act = performance.now(); CHAT.seen = n; return; }
  if (n > CHAT.seen){ const last = NET.chat[n - 1]; if (!last.me) CHAT.unread += n - CHAT.seen; CHAT.seen = n;
    const pv = el('chatPrev'); if (pv){ pv.textContent = (last.who ? last.who + ': ' : '') + last.text; pv.classList.add('on'); clearTimeout(CHAT.pvT); CHAT.pvT = setTimeout(() => pv.classList.remove('on'), 6000); } }
  chatShow();
}
if (typeof renderChat === 'function'){ const rc0 = renderChat; renderChat = function(){ rc0(); chatNew(); }; }
function placeChat(){
  const cb = el('chatBox'), bt = el('chatBtn'), ui = el('ui'); if (!cb || !bt) return;
  const box = !cb.hidden ? cb : !bt.hidden ? bt : null; if (!box) return;
  if (!cb.hidden && !CHAT.init){ CHAT.init = true; setChatH(CHAT.h); }
  const u = brect(ui), k = (brect(box).width / (box.offsetWidth || 1)) || 1, moba = ui.classList.contains('moba');
  let b = 12, l = 12, w = 340;
  if (moba){
    // joystick mode: chat sits bottom-centre, in the free lane between the left thumb (stick + potions) and the right one (skills)
    const R = id => { const e = el(id); if (!e || e.hidden || !e.offsetWidth) return null; const r = brect(e); return {l:r.left - u.left, r:r.right - u.left, t:r.top - u.top}; };
    const lefts = ['joy'].map(R).filter(Boolean), rights = ['mobaAct', 'mobaUtil', 'mobaPot'].map(R).filter(Boolean);
    const L0 = Math.max(12, ...lefts.map(o => o.r)) + 10, R0 = Math.min(u.width - 12, ...rights.map(o => o.l)) - 10, span = R0 - L0;
    if (span >= 220){ w = Math.min(360, Math.round(span / k)); l = Math.round((L0 + (span - w * k) / 2) / k); b = 10; }
    else { // narrow (upright phone): above the controls, beside the column of small buttons if it stands on the right
      const mu = R('mobaUtil'), col = mu && el('mobaUtil') && !el('mobaUtil').classList.contains('row'), xr = col ? mu.l - 10 : u.width - 12, avail = xr - 12;
      w = Math.min(340, Math.round(avail / k)); l = Math.round((12 + (avail - w * k) / 2) / k);
      const top = Math.min(...[...lefts, ...(col ? [R('mobaAct')].filter(Boolean) : rights)].map(o => o.t)); b = Math.round((u.height - top) / k + 10); } }
  else { // v31: on a computer the chat sits in the middle, right on top of the hotbar
    const d = el('dock'); if (d && d.offsetWidth){ w = Math.min(440, Math.round((u.width - 24) / k)); l = Math.round((u.width - w * k) / 2 / k); b = Math.round((u.bottom - brect(d).top) / k + 8); } }
  for (const n of [cb, bt]){ const B = b + 'px'; if (n.style.bottom !== B) n.style.bottom = B; if (n.style.left !== l + 'px') n.style.left = l + 'px'; }
  if (cb.style.width !== w + 'px') cb.style.width = w + 'px';
  // see-through when idle (not hovered, not typing, nothing new for a few seconds)
  const busy = cb.matches(':hover') || cb.contains(document.activeElement) || performance.now() - CHAT.act < 5000;
  if (cb.classList.contains('idle') === busy) cb.classList.toggle('idle', !busy);
  if (!cb.hidden && CHAT.h > chatMax() + 2){ const keep = CHAT.h; setChatH(keep); try { localStorage.setItem('vay-chat-h', String(keep)); } catch (e) {} }
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-chatopen],[data-chatmin]'); if (!t) return; e.preventDefault(); chatSet(!!t.dataset.chatopen, !!t.dataset.chatopen); });
document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('#chatBox')) CHAT.act = performance.now(); }, true);
/* Enter opens the chat (or puts the cursor in it when it is already open); typing Enter in the box sends (js/net/online.js) */
document.addEventListener('keydown', e => { if (e.key !== 'Enter' || typing(e) || typeof NET === 'undefined' || !NET.room || PAUSED) return; e.preventDefault();
  if (!chatIsOpen()) chatSet(true, true); else { const i = el('chatIn'); if (i) i.focus(); } }, true);
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-csz]'); if (!b) return; const steps = [0, 70, 110, 170, 240, 320];
  const up = +b.dataset.csz > 0, cur = CHAT.h; const nx = up ? steps.find(v => v > cur + 4) : [...steps].reverse().find(v => v < cur - 4); setChatH(nx == null ? (up ? 400 : 0) : nx); });
document.addEventListener('pointerdown', e => { if (!e.target.closest || !e.target.closest('#chatGrip')) return; e.preventDefault();
  const y0 = ptY(e), h0 = CHAT.h, k = (brect(el('chatBox')).width / (el('chatBox').offsetWidth || 1)) || 1;
  const mv = ev => setChatH(h0 + (y0 - ptY(ev)) / k), up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up); });
function placeChips(){
  placeChat();
  { const cb = el('castBar'), dk = el('dock'), ui = el('ui'); if (cb && dk && !cb.hidden && !ui.classList.contains('moba') && dk.offsetWidth){
      const u = brect(ui), k = (brect(cb).width / (cb.offsetWidth || 1)) || 1, B = Math.round((u.bottom - brect(dk).top) / k + 10) + 'px'; if (cb.style.bottom !== B) cb.style.bottom = B; } }
  layoutHud();
}

/* cast bar above the hotbar while a skill is being chanted: name, progress and time left */
function updCastBar(){
  const cb = el('castBar'); if (!cb) return;
  if (typeof drawHeadCast === 'function'){ if (!cb.hidden) cb.hidden = true; return; }   // (v91) only write when it changes   // the bar is drawn over the hero's head instead (render.js)
  if (!P.cast){ if (!cb.hidden){ cb.classList.add('out'); if (!cb._t) cb._t = setTimeout(() => { cb.hidden = true; cb.classList.remove('out'); cb._t = null; }, 220); } return; }
  if (cb._t){ clearTimeout(cb._t); cb._t = null; cb.classList.remove('out'); }
  const c = P.cast, sk = SKILLS[c.id], k = clamp(c.t / c.total, 0, 1);
  if (cb.hidden || cb.dataset.id !== c.id){ cb.hidden = false; cb.dataset.id = c.id; cb.dataset.el = sk.elem || 'neutral'; el('castN').textContent = `${skName(sk)} Lv ${c.lv}`; }
  el('castI').style.width = (k * 100).toFixed(1) + '%';
  el('castT').textContent = Math.max(0, c.total - c.t).toFixed(1) + 's';
}

/* the menu rail folds to one button; the choice is remembered. Folded, a dot shows if any menu item wants attention */
const RAIL = {fold:(() => { try { return localStorage.getItem('vay-rail-fold') !== '0'; } catch (e) { return true; } })()};
function setRail(f){ RAIL.fold = f; const r = el('rail'); if (!r) return; r.classList.toggle('folded', f); el('railTog').setAttribute('aria-expanded', String(!f));
  try { localStorage.setItem('vay-rail-fold', f ? '1' : '0'); } catch (e) {}
  setTimeout(() => { try { layoutHud(); } catch (e) {} }, 0); }
function railDot(){ const d = el('dotRail'); if (!d) return; const any = [...document.querySelectorAll('#rail .menu .dot')].some(x => !x.hidden); if (d.hidden === any) d.hidden = !any; }
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#railTog')) setRail(!RAIL.fold); });
setTimeout(() => setRail(RAIL.fold), 0);

/* picking something from the menu folds it away again */
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#rail .mb') && !RAIL.fold) setTimeout(() => setRail(true), 0); });

/* ---------- HUD layout: one grid for every screen ----------
   Left column: character card, then the quest card right under it, same width.
   Right column: minimap, then status chips and the menu, all the same width and right edge.
   Target card: centred in the free space between the columns; if that space is too narrow it goes under the quest card.
   Touch controls: if the right column would run into the skill cluster, chips + menu move to a row beside the minimap,
   and the little action buttons sit in a row just above the skill cluster. All gaps use one spacing unit. */
function hudPut(e, x, y, side){
  if (!e) return; const r = brect(e), k = (r.height / (e.offsetHeight || 1)) || 1;
  const T = Math.round(y / k) + 'px', X = Math.round(x / k) + 'px';
  if (e.style.top !== T) e.style.top = T;
  if (side === 'r'){ if (e.style.right !== X || e.style.left !== 'auto'){ e.style.right = X; e.style.left = 'auto'; } }
  else if (e.style.left !== X || e.style.right !== 'auto'){ e.style.left = X; e.style.right = 'auto'; }
  if (e.style.transform !== 'none') e.style.transform = 'none';
}
function layoutHud(){
  const ui = el('ui'); if (!ui || ui.classList.contains('on-title')) return;
  const u = brect(ui), vis = e => e && !e.hidden && e.offsetParent !== null && e.offsetWidth > 0;
  const R = e => { const b = brect(e); return {l:b.left - u.left, t:b.top - u.top, r:b.right - u.left, b:b.bottom - u.top, w:b.width, h:b.height}; };
  const cc = el('charCard'), gc = el('goalCard'), tg = el('target'), mc = el('mapCard'), ch = el('chips'), rl = el('rail');
  if (!vis(cc) || !vis(mc)) return;
  const c = R(cc), m = Math.round(c.l), gap = Math.max(6, Math.min(10, Math.round(m * .45)));
  // left column
  if (gc){ const w = Math.round(c.w / ((brect(gc).width / (gc.offsetWidth || 1)) || 1)) + 'px'; if (gc.style.width !== w) gc.style.width = w; hudPut(gc, m, c.b + gap); }
  const g = vis(gc) ? R(gc) : c;
  // right column: same width and right edge as the minimap
  const mp = R(mc), rm = Math.round(u.width - mp.r), mw = mc.offsetWidth + 'px';
  for (const e of [ch, rl]) if (e && e.style.minWidth !== mw) e.style.minWidth = mw;
  if (ch && ch.style.alignItems !== 'center') ch.style.alignItems = 'center';
  hudPut(ch, rm, mp.b + gap, 'r');
  const chB = vis(ch) && ch.offsetHeight ? R(ch).b : mp.b;
  hudPut(rl, rm, chB + gap, 'r');
  // touch controls: keep the right column clear of the skill cluster
  const ma = el('mobaAct'), mu = el('mobaUtil'), moba = ui.classList.contains('moba') && vis(ma);
  let rightLimit = mp.l;
  if (moba && rl){ const A = R(ma), rr = R(rl);
    if (rr.b + gap > A.t){                                   // no room under the minimap → chips + menu in a row left of it
      for (const e of [ch, rl]) if (e) e.style.minWidth = '';
      hudPut(rl, rm + mp.w + gap, m, 'r'); const r2 = R(rl);
      if (ch) hudPut(ch, rm + mp.w + gap + r2.w + gap, m, 'r');
      rightLimit = Math.min(r2.l, vis(ch) && ch.offsetHeight ? R(ch).l : r2.l); } }
  if (moba && vis(mu)){ const A = R(ma), U = R(mu), over = [mc, ch, rl].some(e => { if (!vis(e)) return false; const o = R(e); return U.l < o.r && U.r > o.l && U.t < o.b && U.b > o.t; });
    if (over || mu.classList.contains('row')){ if (!mu.classList.contains('row')) mu.classList.add('row');
      const k = (brect(mu).height / (mu.offsetHeight || 1)) || 1, B = Math.round((u.height - A.t + gap) / k) + 'px', Rr = Math.round(rm / k) + 'px';
      if (mu.style.bottom !== B) mu.style.bottom = B; if (mu.style.right !== Rr) mu.style.right = Rr; } }
  // portrait: the util buttons stand in a column right above the skill cluster, on the same right edge (plenty of height)
  if (moba && vis(mu) && u.height > u.width * 1.15){ const A = R(ma), k = (brect(mu).height / (mu.offsetHeight || 1)) || 1;
    mu.classList.remove('row'); const B = Math.round((u.height - A.t + gap) / k) + 'px', Rr = Math.round((u.width - A.r) / k + 6) + 'px';
    if (mu.style.bottom !== B) mu.style.bottom = B; if (mu.style.right !== Rr) mu.style.right = Rr; mu.style.top = 'auto'; }
  // the util buttons (dodge, mount, capture, auto) never sit on the skill cluster: slide them left of it
  else if (moba && vis(mu)){ const A = R(ma), U = R(mu);
    if (U.l < A.r && U.r > A.l && U.t < A.b && U.b > A.t && !(mu.classList.contains('row') && U.b <= A.t + 4)){ const k = (U.h / (mu.offsetHeight || 1)) || 1, cur = parseFloat(getComputedStyle(mu).right) || 0, need = cur + (U.r - A.l + gap) / k;
      mu.style.right = Math.round(need) + 'px'; } }
  // (v100) target card: always still at the top, centred on the screen. It narrows to fit between the left and right
  // columns; only when that gap is too small (a phone held upright) does it sit, still centred, under the top cards and the quest card. The choice
  // depends on the screen alone, never on the card's own size, so it can no longer jump between two places.
  if (tg){ const k0 = (brect(tg).height / (tg.offsetHeight || 1)) || 1, mid = u.width / 2, room = 2 * (Math.min(mid - c.r, rightLimit - mid) - gap), nat = 236 * k0;
    // (v110) always at the very top, centred: as wide as the gap between the left cards and the right column allows
    // (never narrower than a readable card; then it simply sits over whatever is at the top)
    // centred on the screen when it fits there; when the top row on the right has grown (Auto chip), centred in the
    // free stretch of the top edge instead (as close to the middle as it gets), so it covers no buttons
    const gapL = c.r + gap, gapR = rightLimit - gap, free = gapR - gapL, fits = room >= Math.min(nat, 200 * k0);
    const cw = fits ? Math.min(nat, room) : Math.max(Math.min(nat, free), Math.min(nat, 150 * k0));
    const w = cw >= nat ? '' : Math.floor(cw / k0) + 'px', T = Math.round(m / k0) + 'px';
    const cx = clamp(mid, gapL + cw / 2, Math.max(gapL + cw / 2, gapR - cw / 2)), Lx = Math.round(cx / k0) + 'px';
    if (tg.style.width !== w){ if (w){ tg.style.setProperty('width', w, 'important'); tg.style.minWidth = '0'; } else { tg.style.removeProperty('width'); tg.style.minWidth = ''; } }
    if (tg.style.top !== T) tg.style.top = T; if (tg.style.left !== Lx) tg.style.left = Lx; if (tg.style.right !== 'auto') tg.style.right = 'auto';
    if (tg.style.transform) tg.style.transform = ''; if (tg.dataset.mid !== '1') tg.dataset.mid = '1'; if (tg.dataset.under) delete tg.dataset.under; }
  // the left column never runs into the controls under it (joystick, potions, chat, hotbar): the quest card gets a
  // max height and fades out at the bottom; a target card that would not fit goes back to the middle at the top
  { const below = [el('joy'), el('chatBox'), el('chatBtn'), el('dock')].filter(vis).map(R);
    const floorFor = B => below.reduce((f, o) => (o.l < B.r && o.r > B.l && o.t > B.t + 10 ? Math.min(f, o.t - gap) : f), u.height - gap);
    if (vis(gc)){ const G = R(gc), k = (G.h / (gc.offsetHeight || 1)) || 1, mh = Math.max(36, Math.floor((floorFor(G) - G.t) / k));
      if (gc.style.maxHeight !== mh + 'px') gc.style.maxHeight = mh + 'px'; gc.classList.toggle('capped', gc.scrollHeight > mh + 2); }
  }
  if (rl && vis(rl)) fitRail(rl, R, u, gap, m, rm);
}
/* the open menu always fits the screen: it gets as many columns as the free height needs (up to the room on its left),
   opens from the top when there is little room under the chips, and scrolls if it still does not fit */
function fitRail(rl, R, u, gap, m, rm){
  const menu = rl.querySelector('.menu'); if (!menu) return;
  if (rl.classList.contains('folded')){ if (menu.style.maxHeight){ menu.style.maxHeight = menu.style.gridTemplateColumns = menu.style.overflowY = ''; } return; }
  const n = [...menu.children].filter(e => e.offsetWidth > 0).length, CW = 70, RH = 66;
  const k = () => (R(rl).h / (rl.offsetHeight || 1)) || 1;
  const head = () => (brect(menu).top - brect(rl).top) / k() + 10;
  let avail = (u.height - gap - R(rl).t) / k() - head();
  if (avail < RH * 3.2){ hudPut(rl, rm, m, 'r'); avail = (u.height - gap - R(rl).t) / k() - head(); }
  const maxCols = Math.max(3, Math.min(7, Math.floor(((R(rl).r - m) / k() - 20) / CW)));
  const cols = Math.min(maxCols, Math.max(3, Math.ceil(n / Math.max(1, Math.floor(avail / RH)))));
  const gt = `repeat(${cols},66px)`, mh = Math.max(RH, Math.floor(avail)) + 'px';
  if (menu.style.gridTemplateColumns !== gt) menu.style.gridTemplateColumns = gt;
  if (menu.style.maxHeight !== mh){ menu.style.maxHeight = mh; menu.style.overflowY = 'auto'; menu.style.overscrollBehavior = 'contain'; }
}
window.addEventListener('resize', () => setTimeout(layoutHud, 60));
/* keep the layout right even when frames are slow (big screens, busy maps): a light check twice a second */
setInterval(() => { try { if (typeof PAUSED !== 'undefined' && !PAUSED) placeChips(); } catch (e) {} }, 500);
