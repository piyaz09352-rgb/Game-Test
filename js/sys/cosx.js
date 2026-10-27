/* VAYRATHEN — js/sys/cosx.js — cosmetic mounts & pets, player emotes, photo mode
   · Mounts (wardrobe → พาหนะแฟชั่น): replace the look of your ride while riding (R) — a lucky cloud, a floating
     lotus, a Thai-patterned flying carpet (you stand on them), or a golden Singha / young Erawan / Garuda (you sit).
   · Pets (wardrobe → สัตว์เลี้ยงแฟชั่น): a small Himmapan companion that trots or flutters after you, sparkling.
     Both use the free trial like the other costumes, and other players see them.
   · Emotes (V, or the smile button): a wheel of 10 — wave, wai, dance, cheer, laugh, cry, love, angry, cool, sleep.
     A bubble over your head and a little body motion; moving or fighting ends it. Others see it too.
   · Photo mode (F2, or the camera button in the menu): hides the interface, filters (warm film, sepia, black & white,
     dreamy pastel, night), an ornate frame with your name and the date, names on/off, zoom, and save a PNG. */
'use strict';

/* ---------- mounts and pets ---------- */
const XMOUNT = {
  m_cloud:{slot:'mount', th:'เมฆมงคล', en:'Auspicious Cloud', kind:'cloud', lift:12, c:['#ffffff', '#ffd36a'], price:{c:60}},
  m_lotus:{slot:'mount', th:'บัวลอยสวรรค์', en:'Heavenly Lotus', kind:'lotus', lift:10, c:['#ffd0e4', '#e8709e'], price:{c:70}},
  m_carpet:{slot:'mount', th:'พรมวิเศษลายไทย', en:'Thai Magic Carpet', kind:'carpet', lift:9, c:['#c8283a', '#ffc83a'], price:{c:70}},
  m_singha:{slot:'mount', th:'ราชสีห์ทองคำ', en:'Golden Singha', kind:'beast', mob:'goldsingha', scale:1, lift:20, c:['#ffd36a', '#b8700e'], price:{c:90}},
  m_erawan:{slot:'mount', th:'ช้างเอราวัณน้อย', en:'Little Erawan', kind:'beast', mob:'youngerawan', scale:.9, lift:24, c:['#f4f0e6', '#c8a050'], price:{c:90}},
  m_garuda:{slot:'mount', th:'พญาครุฑทะยานฟ้า', en:'Soaring Garuda', kind:'beast', mob:'goldgaruda', scale:.95, lift:22, fly:8, c:['#e02a1a', '#ffc83a'], price:{c:110}}};
const XPET = {
  p_singha:{slot:'pet', th:'ลูกราชสีห์', en:'Singha Cub', mob:'goldsingha', scale:.42, c:['#ffd36a', '#b8700e'], price:{c:40}},
  p_erawan:{slot:'pet', th:'ช้างน้อยสามเศียร', en:'Tiny Erawan', mob:'youngerawan', scale:.38, c:['#f4f0e6', '#c8a050'], price:{c:40}},
  p_garuda:{slot:'pet', th:'ลูกครุฑ', en:'Garuda Chick', mob:'goldgaruda', scale:.4, fly:14, c:['#e02a1a', '#ffc83a'], price:{c:45}},
  p_kinnaree:{slot:'pet', th:'กินรีน้อย', en:'Little Kinnaree', mob:'goldkinnaree', scale:.42, fly:12, c:['#ffd0e4', '#e8b858'], price:{c:45}},
  p_naga:{slot:'pet', th:'นาคน้อย', en:'Baby Naga', mob:'lakenaga', scale:.42, c:['#9ff0e4', '#2a8a9a'], price:{c:45}},
  p_hamsa:{slot:'pet', th:'หงส์ทองน้อย', en:'Golden Hamsa', mob:'goldhamsa', scale:.45, fly:10, c:['#fff4b0', '#e8b858'], price:{c:45}}};
for (const k in XMOUNT) XCOS[k] = XMOUNT[k];
for (const k in XPET) if (MOB[XPET[k].mob]) XCOS[k] = XPET[k];
const mountSkin = () => (P.ride && S.cos && S.cos.mount && XMOUNT[S.cos.mount] && cosUsable(S.cos.mount) ? XMOUNT[S.cos.mount] : null);

function drawMountX(g, M, x, y, dir, t, moving, part){
  if (M.kind === 'beast'){
    if (part !== 'under' || !SHEETS || !SHEETS[M.mob]) return;
    const fly = M.fly ? M.fly + Math.sin(t * 3) * 2 : 0; shadowW(g, x, y, 15);
    g.save(); g.translate(x, y - fly); g.scale(M.scale, M.scale); SPR.draw(g, SHEETS[M.mob], moving ? 'walk' : 'idle', dir, t, 0, 0); g.restore(); return;
  }
  const by = y - M.lift + Math.sin(t * 2.4) * 1.5;
  if (part === 'under'){ g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y, 16, 5, 0, 0, 7); g.fill(); }
  g.save();
  if (M.kind === 'cloud'){
    if (part !== 'under') { g.restore(); return; }
    for (let i = 0; i < 7; i++){ const a = i / 7 * 6.283 + t * .4, cx = x + Math.cos(a) * 11, cy = by + 3 + Math.sin(a) * 3.5, r = 6 + Math.sin(i * 2.3 + t * 2) * 1.2;
      const gr = g.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#e0e8f4'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(255,211,106,.85)'; g.lineWidth = .9; for (const s of [-1, 1]){ g.beginPath(); g.arc(x + s * 13, by + 3, 3, s > 0 ? 3.1 : 0, s > 0 ? 7.6 : 4.6); g.stroke(); }
    if (moving) for (let i = 0; i < 4; i++){ const ph = (t * 1.5 + i / 4) % 1; g.fillStyle = `rgba(255,255,255,${.6 * (1 - ph)})`; g.beginPath(); g.arc(x - (dir >= 1 && dir <= 3 ? -1 : 1) * (14 + ph * 16), by + 4, 3 * (1 - ph) + 1, 0, 7); g.fill(); }
  } else if (M.kind === 'lotus'){
    if (part !== 'under') { g.restore(); return; }
    g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, by + 3, 0, x, by + 3, 22); gl.addColorStop(0, 'rgba(255,170,210,.35)'); gl.addColorStop(1, 'rgba(255,170,210,0)'); g.fillStyle = gl; g.beginPath(); g.ellipse(x, by + 3, 22, 9, 0, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#4f9a4a'; g.beginPath(); g.ellipse(x, by + 5, 17, 5, 0, 0, 7); g.fill();
    for (let i = 0; i < 9; i++){ const a = -Math.PI + i / 8 * Math.PI, px = x + Math.cos(a) * 11, py = by + 3 + Math.sin(a) * 2; g.save(); g.translate(px, py); g.rotate(a + Math.PI / 2);
      const gr = g.createLinearGradient(0, -9, 0, 2); gr.addColorStop(0, '#fff4fa'); gr.addColorStop(1, '#e8709e'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 2); g.quadraticCurveTo(4, -4, 0, -10); g.quadraticCurveTo(-4, -4, 0, 2); g.fill(); g.restore(); }
  } else if (M.kind === 'carpet'){
    if (part !== 'under') { g.restore(); return; }
    const w = 30, h = 10; g.beginPath(); for (let i = 0; i <= 12; i++){ const u = i / 12, xx = x - w / 2 + u * w, yy = by + Math.sin(u * 6 + t * 6) * 1.6; i ? g.lineTo(xx, yy - h / 2) : g.moveTo(xx, yy - h / 2); } for (let i = 12; i >= 0; i--){ const u = i / 12, xx = x - w / 2 + u * w, yy = by + Math.sin(u * 6 + t * 6) * 1.6; g.lineTo(xx, yy + h / 2); } g.closePath();
    g.fillStyle = '#b81e30'; g.fill(); g.strokeStyle = '#ffc83a'; g.lineWidth = 1.2; g.stroke();
    g.save(); g.clip(); g.strokeStyle = 'rgba(255,200,60,.8)'; g.lineWidth = .6; for (let i = 0; i < 6; i++){ const xx = x - w / 2 + 3 + i * 5; g.beginPath(); g.moveTo(xx, by - 3); g.lineTo(xx + 2.5, by); g.lineTo(xx, by + 3); g.lineTo(xx - 2.5, by); g.closePath(); g.stroke(); } g.restore();
    g.strokeStyle = '#ffc83a'; g.lineWidth = .6; for (let i = 0; i < 5; i++){ const yy = by - 4 + i * 2 + Math.sin(t * 6) * 1.6; g.beginPath(); g.moveTo(x - w / 2, yy); g.lineTo(x - w / 2 - 3, yy + 1); g.stroke(); g.beginPath(); g.moveTo(x + w / 2, yy); g.lineTo(x + w / 2 + 3, yy + 1); g.stroke(); }
  }
  g.restore();
}
/* your mount: the hero stands on (or sits on) it; the sprite's own ride pose is not used */
{
  const _act = playerAct;
  playerAct = function(){ const M = mountSkin(); if (M && !P.dead && !P.roll && !P.cast && !(P.atkAnim > 0) && !(P.skillAnim > 0)) return M.kind === 'beast' ? 'sit' : (P.moving ? 'idle' : 'idle'); return _act(); };
  const _dp = drawPlayerW;
  drawPlayerW = function(g){
    const M = mountSkin(), x = P.x - cam.x, y = P.y - cam.y, em = emoMotion(P.emo, T);
    if (M) drawMountX(g, M, x, y, P.dir || 0, T, P.moving, 'under');
    const lift = (M ? M.lift + (M.fly ? M.fly + Math.sin(T * 3) * 2 : 0) + (M.kind !== 'beast' ? Math.sin(T * 2.4) * 1.5 : 0) : 0) - em.dy;
    g.save(); g.translate(em.dx, -lift); _dp(g); g.restore();
    if (M) drawMountX(g, M, x, y, P.dir || 0, T, P.moving, 'over');
  };
}
/* pets follow you; other players' pets follow them */
const PETF = {x:0, y:0, dir:0, moving:false, map:-1};
function petStep(o, tx, ty, dt){ const d = Math.hypot(tx - o.x, ty - o.y); if (d > 400){ o.x = tx; o.y = ty; } o.moving = d > 6; if (o.moving){ const k = Math.min(1, dt * (d > 80 ? 6 : 3.2)); o.x += (tx - o.x) * k; o.y += (ty - o.y) * k; o.dir = SPR.dirFromVec(tx - o.x, ty - o.y); } }
EV.on('tick', dt => {
  if (PETF.map !== MAP_ID){ PETF.map = MAP_ID; PETF.x = P.x; PETF.y = P.y; }
  const sp = typeof compSpot === 'function' ? compSpot(PETF, -1) : {x:P.x - 22, y:P.y + 6}; petStep(PETF, sp.x, sp.y, dt);
  for (const gh of (typeof NET !== 'undefined' && NET.ghosts ? NET.ghosts.values() : [])){ const q = gh.q || {}; if (!XPET[q.pe]) continue; gh.pf = gh.pf || {x:gh.x, y:gh.y, dir:0}; petStep(gh.pf, gh.x - 44, gh.y + 18, dt); }
});
function drawPetX(g, def, o, t){
  if (!def || !SHEETS || !SHEETS[def.mob]) return; const x = o.x - cam.x, y = o.y - cam.y; if (x < -40 || x > VW + 40 || y < -60 || y > VH + 30) return;
  const fly = def.fly ? def.fly + Math.sin(t * 4) * 2.5 : 0, hop = !def.fly && o.moving ? Math.abs(Math.sin(t * 9)) * 2 : 0;
  shadowW(g, x, y, 6); g.save(); g.translate(x, y - fly - hop); g.scale(def.scale, def.scale); SPR.draw(g, SHEETS[def.mob], o.moving ? 'walk' : 'idle', o.dir || 0, t, 0, 0);
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = .12 + Math.sin(t * 3) * .05; SPR.draw(g, SHEETS[def.mob], o.moving ? 'walk' : 'idle', o.dir || 0, t, 0, 0); g.restore();
  for (let i = 0; i < 3; i++){ const ph = (t * .7 + i / 3) % 1; g.fillStyle = `rgba(255,236,160,${Math.sin(ph * Math.PI) * .8})`; g.fillRect(x + Math.sin(i * 2 + t) * 8, y - fly - 8 - ph * 14, 1.2, 1.2); }
}
{
  const _ents = LIVE.ents;
  LIVE.ents = function(list, g){ _ents(list, g);
    const id = S.cos && S.cos.pet; if (id && XPET[id] && cosUsable(id) && !P.dead) list.push({y:PETF.y, f:() => drawPetX(g, XPET[id], PETF, T)});
    if (typeof NET !== 'undefined' && NET.ghosts) for (const gh of NET.ghosts.values()){ const q = gh.q || {}; if (SETTINGS.oPet !== false && XPET[q.pe] && gh.pf && !q.dead) list.push({y:gh.pf.y, f:() => drawPetX(g, XPET[q.pe], gh.pf, T + 1.3)}); } };
}

/* ---------- emotes ---------- */
const EMOTES = [
  {id:'wave', e:'👋', th:'โบกมือ', en:'Wave', m:'sway'}, {id:'wai', e:'🙏', th:'ไหว้', en:'Wai', m:'bow'}, {id:'dance', e:'💃', th:'เต้น', en:'Dance', m:'dance'},
  {id:'cheer', e:'🎉', th:'เย้!', en:'Cheer', m:'jump'}, {id:'laugh', e:'😂', th:'หัวเราะ', en:'Laugh', m:'shake'}, {id:'cry', e:'😢', th:'ร้องไห้', en:'Cry', m:'droop'},
  {id:'love', e:'❤️', th:'รัก', en:'Love', m:'sway'}, {id:'angry', e:'💢', th:'โกรธ', en:'Angry', m:'shake'}, {id:'cool', e:'😎', th:'เท่', en:'Cool', m:'none'}, {id:'sleep', e:'💤', th:'นอน', en:'Sleep', m:'sit'}];
const EMO_BY = Object.fromEntries(EMOTES.map(e => [e.id, e]));
function emoMotion(em, t){
  const out = {dx:0, dy:0}; if (!em || !EMO_BY[em.id]) return out; const k = (t - em.t0);
  if (k > 3.2 || k < 0) return out;
  switch (EMO_BY[em.id].m){
    case 'jump': out.dy = Math.abs(Math.sin(k * 6)) * 7 * Math.max(0, 1 - k / 3); break;
    case 'dance': out.dy = Math.abs(Math.sin(k * 8)) * 3; out.dx = Math.sin(k * 4) * 2.5; break;
    case 'shake': out.dx = Math.sin(k * 30) * .8; break;
    case 'sway': out.dx = Math.sin(k * 5) * 1.2; break;
    case 'bow': out.dy = -Math.sin(Math.min(1, k * 2) * Math.PI) * 1.5; break;
    case 'droop': out.dy = -1; break;
  }
  return out;
}
function doEmote(id){
  if (!EMO_BY[id] || P.dead) return; P.emo = {id, t0:T}; P.emoAt = Date.now();
  if (EMO_BY[id].m === 'sit'){ P.sit = true; P.tx = null; P.target = null; }
  if (EMO_BY[id].m === 'dance') P.danceT = 3;
  closeEmoWheel(); if (typeof NET !== 'undefined') NET.presT = 0; SFX.play('tut');
}
EV.on('tick', dt => {
  if (P.emo && (T - P.emo.t0 > 3.2 || (P.moving && T - P.emo.t0 > .3) || P.cast || P.atkAnim > 0)) P.emo = null;
  if (P.danceT > 0){ P.danceT -= dt; if (P.emo && P.emo.id === 'dance' && !P.moving) P.dir = Math.floor(T * 4) % 8; }
});
const emoPres = () => ({em:P.emo && EMO_BY[P.emo.id] ? `${P.emo.id}:${Math.round(P.emoAt / 1000)}` : '', mt:mountSkin() ? S.cos.mount : '', pe:S.cos && S.cos.pet && XPET[S.cos.pet] && cosUsable(S.cos.pet) ? S.cos.pet : ''});
const ghostEmo = q => { if (typeof q.em !== 'string' || !q.em) return null; const [id, s] = q.em.split(':'); if (!EMO_BY[id]) return null; const age = Date.now() / 1000 - (+s || 0); return age >= 0 && age < 3.2 ? {id, t0:T - age} : null; };
function drawEmoBubble(x, y, em){
  const e = EMO_BY[em.id], k = T - em.t0; if (!e || k > 3.2) return; const z = typeof TAG_Z === 'function' ? TAG_Z() : 1, pop = k < .18 ? .4 + k / .18 * .7 : k < .3 ? 1.1 - (k - .18) / .12 * .1 : 1, fade = Math.min(1, (3.2 - k) / .3);
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + 16 * z, y - 6 * z + Math.sin(k * 4) * 1.5); ctx.scale(pop * z, pop * z);
  ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = 'rgba(40,24,10,.85)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, 15, 13, 0, 0, 7); ctx.moveTo(-7, 9); ctx.lineTo(-13, 17); ctx.lineTo(-1, 11); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 12, 0, 0, 7); ctx.fill();
  ctx.font = '16px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e.e, 0, 1);
  if (e.id === 'sleep' || e.id === 'love') for (let i = 0; i < 3; i++){ const ph = (k * .8 + i / 3) % 1; ctx.globalAlpha = fade * (1 - ph); ctx.font = '700 9px Mali, sans-serif'; ctx.fillStyle = e.id === 'love' ? '#e84a6a' : '#5a6ab8'; ctx.fillText(e.id === 'love' ? '♥' : 'z', 16 + ph * 8, -10 - ph * 16); }
  ctx.restore();
}
EV.on('draw', () => {
  if (P.emo && !P.dead) drawEmoBubble(sx(P.x), P.tagTop != null ? P.tagTop : sy(P.y - 60), P.emo);
  if (typeof NET !== 'undefined' && NET.ghosts) for (const gh of NET.ghosts.values()){ const em = ghostEmo(gh.q || {}); if (em) drawEmoBubble(sx(gh.x), gh.tagTop != null ? gh.tagTop : sy(gh.y - 60), em); }
});
function openEmoWheel(){
  let w = el('emoWheel'); if (!w){ w = document.createElement('div'); w.id = 'emoWheel'; w.className = 'emowheel'; el('ui').appendChild(w); }
  w.innerHTML = `<div class="emoring">${EMOTES.map((e, i) => { const a = i / EMOTES.length * Math.PI * 2 - Math.PI / 2; return `<button class="emob" data-emo="${e.id}" style="--x:${(Math.cos(a) * 86).toFixed(1)}px;--y:${(Math.sin(a) * 86).toFixed(1)}px"><i>${e.e}</i><small>${L(e.th, e.en)}</small></button>`; }).join('')}
    <button class="emoclose" data-emox="1" aria-label="${L('ปิด', 'Close')}">✕</button></div>`;
  w.hidden = false; requestAnimationFrame(() => w.classList.add('show'));
}
function closeEmoWheel(){ const w = el('emoWheel'); if (w){ w.classList.remove('show'); w.hidden = true; } }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-emo],[data-emox],[data-emopen]'); if (!b) return; if (b.dataset.emo) doEmote(b.dataset.emo); else if (b.dataset.emopen) openEmoWheel(); else closeEmoWheel(); });
addEventListener('keydown', e => { if (typing(e)) return; if (keyOf(e) === 'v' && plainKey(e) && !PAUSED){ const w = el('emoWheel'); if (w && !w.hidden) closeEmoWheel(); else openEmoWheel(); } if (e.key === 'F2'){ e.preventDefault(); photoToggle(); } });
// a smile button among the touch util buttons, and in the menu
{
  const _rm = renderMoba;
  renderMoba = function(){ _rm(); };   // emotes moved into the menu (less clutter on the play field)
}

/* ---------- photo mode ---------- */
const PHOTO = {on:false, f:'none', frame:true, names:true, prevNames:true};
const PH_FILTERS = {none:['ปกติ', 'Natural', 'none'], warm:['ฟิล์มอบอุ่น', 'Warm film', 'sepia(.25) saturate(1.25) contrast(1.05) brightness(1.04)'], sepia:['ซีเปีย', 'Sepia', 'sepia(.85) contrast(1.05)'],
  mono:['ขาวดำ', 'Black & white', 'grayscale(1) contrast(1.15)'], dream:['ฝันพาสเทล', 'Dreamy', 'saturate(.8) brightness(1.12) contrast(.9) hue-rotate(-8deg)'], night:['ราตรี', 'Night', 'brightness(.75) saturate(.9) hue-rotate(195deg) contrast(1.1)'], vivid:['สดใส', 'Vivid', 'saturate(1.6) contrast(1.08)']};
function photoToggle(){
  PHOTO.on = !PHOTO.on; const ui = el('ui');
  ui.classList.toggle('photo', PHOTO.on); closeEmoWheel();
  if (PHOTO.on){ PHOTO.prevNames = SETTINGS.nameTags; let b = el('photoBar'); if (!b){ b = document.createElement('div'); b.id = 'photoBar'; b.className = 'photobar'; ui.appendChild(b); } photoBar(); b.hidden = false; }
  else { const b = el('photoBar'); if (b) b.hidden = true; SETTINGS.nameTags = PHOTO.prevNames; el('cv').style.filter = ''; }
}
function photoBar(){
  const b = el('photoBar'); if (!b) return;
  b.innerHTML = `<div class="phrow">${Object.keys(PH_FILTERS).map(k => `<button class="phf${PHOTO.f === k ? ' on' : ''}" data-phf="${k}">${L(PH_FILTERS[k][0], PH_FILTERS[k][1])}</button>`).join('')}</div>
    <div class="phrow"><button class="phb${PHOTO.frame ? ' on' : ''}" data-pht="frame">${L('กรอบ', 'Frame')}</button><button class="phb${SETTINGS.nameTags ? ' on' : ''}" data-pht="names">${L('ชื่อ', 'Names')}</button>
      <button class="phb" data-phz="-1">−</button><button class="phb" data-phz="1">+</button><button class="phb" data-phe="1">${L('ท่าทาง', 'Emote')}</button>
      <button class="btn gold" data-phshot="1">📷 ${L('ถ่ายรูป', 'Take photo')}</button><button class="btn" data-phx="1">${L('ออก', 'Exit')}</button></div>`;
  el('cv').style.filter = PH_FILTERS[PHOTO.f][2] === 'none' ? '' : PH_FILTERS[PHOTO.f][2];
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-phf],[data-pht],[data-phz],[data-phshot],[data-phx],[data-phe],[data-photo]'); if (!b) return; const d = b.dataset;
  if (d.photo){ if (!PHOTO.on) photoToggle(); return; }
  if (d.phf){ PHOTO.f = d.phf; photoBar(); }
  else if (d.pht === 'frame'){ PHOTO.frame = !PHOTO.frame; photoBar(); }
  else if (d.pht === 'names'){ SETTINGS.nameTags = !SETTINGS.nameTags; photoBar(); }
  else if (d.phz){ if (typeof zoomStep === 'function') zoomStep(+d.phz); }
  else if (d.phe) openEmoWheel();
  else if (d.phshot) photoShot();
  else if (d.phx) photoToggle();
});
async function photoShot(){
  const cv = el('cv'), w = cv.width, h = cv.height, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.filter = PH_FILTERS[PHOTO.f][2]; g.drawImage(cv, 0, 0); g.filter = 'none';
  if (PHOTO.frame){ const s = Math.max(1, w / 900), pad = 14 * s;
    g.strokeStyle = 'rgba(240,195,90,.95)'; g.lineWidth = 3 * s; g.strokeRect(pad, pad, w - pad * 2, h - pad * 2); g.strokeStyle = 'rgba(60,30,10,.8)'; g.lineWidth = 1.2 * s; g.strokeRect(pad + 5 * s, pad + 5 * s, w - pad * 2 - 10 * s, h - pad * 2 - 10 * s);
    for (const [cx, cy] of [[pad, pad], [w - pad, pad], [pad, h - pad], [w - pad, h - pad]]){ g.fillStyle = '#f0c35a'; g.beginPath(); g.moveTo(cx, cy - 9 * s); g.lineTo(cx + 9 * s, cy); g.lineTo(cx, cy + 9 * s); g.lineTo(cx - 9 * s, cy); g.closePath(); g.fill(); }
    const d = new Date(), txt = `VAYRATHEN · ${S.name || nm(JOBS[S.job])} · ${nm(MAPS[MAP_ID])} · ${d.toLocaleDateString(LANG === 'en' ? 'en-GB' : 'th-TH')}`;
    g.font = `700 ${Math.round(15 * s)}px Mali, sans-serif`; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.lineWidth = 4 * s; g.strokeStyle = 'rgba(20,10,4,.85)'; g.strokeText(txt, w - pad - 14 * s, h - pad - 12 * s); g.fillStyle = '#ffe9a8'; g.fillText(txt, w - pad - 14 * s, h - pad - 12 * s); }
  VFX.shake(0); const fl = document.createElement('div'); fl.className = 'phflash'; el('ui').appendChild(fl); setTimeout(() => fl.remove(), 450); SFX.play('pickup');
  const blob = await new Promise(r => c.toBlob(r, 'image/png')); if (!blob) return;
  const filename = `vayrathen-${(S.name || S.job).replace(/[^\w฀-๿-]+/g, '')}-${Date.now().toString(36)}.png`;
  const dl = window.claude && window.claude.use ? await window.claude.use('downloads').catch(() => null) : null;
  if (dl){ try { await dl.save({filename, data:blob}); toast(L('บันทึกรูปแล้ว', 'Photo saved')); } catch (e){ toast(L('ยกเลิกการบันทึก', 'Save cancelled')); } return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast(L('บันทึกรูปแล้ว', 'Photo saved'));
}
// a camera button in the menu rail
// emotes live in the chat box: a smile button at the start of the chat input row
{ const f = document.getElementById('chatForm'); if (f) f.insertAdjacentHTML('afterbegin', `<button type="button" class="cemo" data-emopen="1" aria-label="${L('ท่าทาง', 'Emotes')}" title="${L('ท่าทาง (V)', 'Emotes (V)')}"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="10" cy="10" r="7.2"/><path d="M7 12c.8 1.2 1.8 1.8 3 1.8s2.2-.6 3-1.8"/><circle cx="7.6" cy="8.2" r=".6" fill="currentColor"/><circle cx="12.4" cy="8.2" r=".6" fill="currentColor"/></svg></button>`); }
/* (v28) the photo-mode button left the menu */

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'cosx', t:['พาหนะ · สัตว์เลี้ยง · ท่าทาง · ถ่ายรูป', 'Mounts · pets · emotes · photos'], b:() => `<p>${L('ตู้เสื้อผ้า (Q → ชุดแฟชั่น) มี <b>พาหนะแฟชั่น</b> 6 แบบ (เมฆมงคล บัวลอยสวรรค์ พรมวิเศษลายไทย ราชสีห์ทองคำ ช้างเอราวัณน้อย พญาครุฑทะยานฟ้า — แสดงตอนขี่ R) และ <b>สัตว์เลี้ยงแฟชั่น</b> ที่เดินตามตัว · ทดลองใช้ฟรีเหมือนชุดอื่น · <b>ย้อมสี</b>ชุด เครื่องประดับศีรษะ และปีกได้ 2 สี · <b>ท่าทาง</b> กด V หรือปุ่มหน้ายิ้ม 10 ท่า · <b>โหมดถ่ายรูป</b> F2 หรือปุ่มกล้องในเมนู: ซ่อน UI ฟิลเตอร์ 7 แบบ กรอบพร้อมชื่อและวันที่ บันทึกเป็น PNG', 'The wardrobe (Q → Wardrobe) has 6 <b>cosmetic mounts</b> (shown while riding, R) and <b>cosmetic pets</b> that follow you · free trial like the rest · <b>dye</b> outfits, headpieces and wings in 2 colours · <b>emotes</b> with V or the smile button (10) · <b>photo mode</b> with F2 or the camera button: hides the UI, 7 filters, a frame with your name and the date, saves a PNG')}</p>`});

