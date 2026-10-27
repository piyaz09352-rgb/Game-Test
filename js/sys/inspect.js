/* VAYRATHEN — js/sys/inspect.js — (v125) two tools for checking the game on a real device
   1. โหมดตรวจหน้าตา (Look inspector) — Settings → "เปิดโหมดตรวจหน้าตา". Pick any monster or boss (filter: bosses,
      real animals, fantasy, all; or search by name), see it large on a stage, and play each move: idle, walk, attack,
      hurt, die — turning it round with ⟲ ⟳, at normal or half speed. Bosses walk and breathe at their own slower
      pace (as in the game). Nothing is spawned; the game world is untouched.
   2. ตัววัดความลื่น (Smoothness meter) — Settings → "แสดงตัววัดความลื่น". A small box in the corner: frames per
      second, the longest frame in the last 5 s, and how many hitches (frames over 50 ms) in the last minute, with the
      picture preset. A screenshot of it says where the game stutters. Updated twice a second; costs almost nothing. */
'use strict';

/* ---------- 1. the look inspector ---------- */
const INS = {f:'boss', q:'', id:null, act:'idle', dir:1, slow:false, t0:0, raf:0};
const insList = () => { const out = [];
  for (const [k, d] of Object.entries(MOB || {})){ if (!SHEETS[k]) continue;
    const real = typeof isRealAnimal === 'function' && isRealAnimal(k, {arch:SPECIES_ARCH[k]});
    if (INS.f === 'boss' && !d.boss) continue; if (INS.f === 'real' && (d.boss || !real)) continue; if (INS.f === 'fant' && (d.boss || real)) continue;
    const n = `${d.name || ''} ${d.en || ''} ${k}`; if (INS.q && !n.toLowerCase().includes(INS.q.toLowerCase())) continue;
    out.push(k); }
  return out.sort((a, b) => (MOB[a].lv || 0) - (MOB[b].lv || 0)); };
mkWin('inspect', 'โหมดตรวจหน้าตา', 'Look inspector', '', '<circle cx="9" cy="9" r="5.5"/><path d="M13 13l4.5 4.5"/>', false);   // opened from Settings, not the menu
WIN_RENDER.inspect = function(){
  const pane = el('pane-inspect'); if (!pane) return;
  const list = insList(); if (!list.includes(INS.id)) INS.id = list[0] || null;
  const d = INS.id && MOB[INS.id], i = list.indexOf(INS.id);
  const f = (k, th, en) => `<button class="btn sm${INS.f === k ? ' gold' : ''}" data-insf="${k}">${L(th, en)}</button>`;
  const a = (k, th, en) => `<button class="btn sm${INS.act === k ? ' gold' : ''}" data-insa="${k}">${L(th, en)}</button>`;
  pane.innerHTML = `<div class="insbox">
    <div class="insrow">${f('boss', 'บอส', 'Bosses')}${f('real', 'สัตว์จริง', 'Real animals')}${f('fant', 'แฟนตาซี', 'Fantasy')}${f('all', 'ทั้งหมด', 'All')}
      <input id="insQ" placeholder="${L('ค้นหาชื่อ…', 'Search…')}" value=""></div>
    <div class="insmain"><canvas id="insCv" width="320" height="260"></canvas>
      <div class="insside"><div class="insnm"><b id="insName"></b><small id="insInfo"></small></div>
        <div class="insrow"><button class="btn sm" data-insn="-1">‹</button><span class="insidx">${list.length ? i + 1 : 0}/${list.length}</span><button class="btn sm" data-insn="1">›</button></div>
        <div class="insrow">${a('idle', 'ยืน', 'Idle')}${a('walk', 'เดิน', 'Walk')}${a('attack', 'โจมตี', 'Attack')}${a('hurt', 'โดนตี', 'Hurt')}${a('die', 'ตาย', 'Die')}</div>
        <div class="insrow"><button class="btn sm" data-insd="-1">⟲</button><button class="btn sm" data-insd="1">⟳</button><button class="btn sm${INS.slow ? ' gold' : ''}" data-insslow="1">${L('ช้า ½', 'Half speed')}</button></div>
        <small class="hint">${L('ไม่มีการเรียกมอนจริง โลกในเกมไม่เปลี่ยน · ถ้าตัวไหนดูแปลก จดชื่อแล้วบอกได้เลย', 'Nothing is spawned; the world is untouched · note the name of anything that looks wrong')}</small></div></div></div>`;
  const q = el('insQ'); q.value = INS.q;
  if (d){ el('insName').textContent = `${d.name || INS.id}`; el('insInfo').textContent = `${d.en || ''} · Lv ${d.lv || '?'} · ${SPECIES_ARCH[INS.id] || ''}${d.boss ? ` · ${L('ขนาด', 'size')} ×${d.bsz || 1.6}` : ''}`; }
  insLoop();
};
function insLoop(){ cancelAnimationFrame(INS.raf);
  const step = () => { const cv = el('insCv'); if (!cv || !winOpen('inspect')) return; const g = cv.getContext('2d'), id = INS.id, sh = id && SHEETS[id];
    g.setTransform(1, 0, 0, 1, 0, 0); const bg = g.createLinearGradient(0, 0, 0, cv.height); bg.addColorStop(0, '#cfe8b8'); bg.addColorStop(1, '#8fbf6a'); g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height);
    if (sh){ try {
      SPR.ensure(sh, INS.act, INS.dir);
      const fs = sh.fs || 96, k = Math.min(3, (cv.height - 40) / fs * 1.15), now = performance.now() / 1000 * (INS.slow ? .5 : 1), d = MOB[id];
      const pace = d && d.boss ? Math.sqrt(d.bsz || 1.6) : 1, t = (INS.act === 'idle' || INS.act === 'walk') ? (now - INS.t0) / pace : ((now - INS.t0) % (INS.act === 'die' ? 1.6 : .8)) * (INS.act === 'die' ? .6 : 1);
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(cv.width / 2, cv.height - 24, 46, 12, 0, 0, 7); g.fill();
      g.save(); g.translate(cv.width / 2, cv.height - 24); g.scale(k, k); SPR.draw(g, sh, INS.act, INS.dir, t, 0, 0); g.restore();
    } catch (e) { g.fillStyle = '#7a1a1a'; g.font = '12px sans-serif'; g.fillText(String(e).slice(0, 48), 8, 20); } }
    INS.raf = requestAnimationFrame(step); };
  INS.raf = requestAnimationFrame(step); }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-insf],[data-insa],[data-insn],[data-insd],[data-insslow],[data-insopen]'); if (!t) return; const d = t.dataset;
  if (d.insopen){ openWin('inspect'); return; }
  if (d.insf){ INS.f = d.insf; INS.id = null; }
  if (d.insa){ INS.act = d.insa; INS.t0 = performance.now() / 1000 * (INS.slow ? .5 : 1); }
  if (d.insn){ const l = insList(); if (l.length){ INS.id = l[(l.indexOf(INS.id) + +d.insn + l.length) % l.length]; INS.t0 = performance.now() / 1000; } }
  if (d.insd) INS.dir = (INS.dir + +d.insd + 8) % 8;
  if (d.insslow) INS.slow = !INS.slow;
  reWin('inspect'); });
document.addEventListener('input', e => { if (e.target && e.target.id === 'insQ'){ INS.q = e.target.value; INS.id = null; const p = e.target.selectionStart; reWin('inspect'); const q = el('insQ'); if (q){ q.focus(); try { q.setSelectionRange(p, p); } catch (x) {} } } });

/* ---------- 2. the smoothness meter ---------- */
const FPSM = {box:null, fr:[], hitches:[], last:0, t:0};
function fpsmOn(){ return !!(typeof SETTINGS !== 'undefined' && SETTINGS.fpsMeter); }
function fpsmTick(now){
  if (FPSM.last){ const d = now - FPSM.last; FPSM.fr.push([now, d]); if (d > 50) FPSM.hitches.push(now); }
  FPSM.last = now;
  while (FPSM.fr.length && now - FPSM.fr[0][0] > 5000) FPSM.fr.shift();
  while (FPSM.hitches.length && now - FPSM.hitches[0] > 60000) FPSM.hitches.shift();
  if (now - FPSM.t > 500){ FPSM.t = now; fpsmShow(now); }
  if (fpsmOn()) requestAnimationFrame(fpsmTick); else { FPSM.last = 0; if (FPSM.box) FPSM.box.hidden = true; }
}
function fpsmShow(now){
  if (!FPSM.box){ FPSM.box = document.createElement('div'); FPSM.box.id = 'fpsMeter'; document.body.appendChild(FPSM.box); }
  const last1 = FPSM.fr.filter(f => now - f[0] < 1000), fps = last1.length, worst = FPSM.fr.reduce((m, f) => Math.max(m, f[1]), 0), h = FPSM.hitches.length;
  FPSM.box.hidden = false; FPSM.box.className = fps >= 50 ? 'ok' : fps >= 30 ? 'mid' : 'bad';
  FPSM.box.textContent = `${fps} FPS · ${L('ช้าสุด', 'worst')} ${Math.round(worst)}ms · ${L('สะดุด', 'hitches')} ${h}/${L('นาที', 'min')} · ${GFX.preset || ''}`;
}
function fpsmStart(){ if (fpsmOn()){ FPSM.last = 0; requestAnimationFrame(fpsmTick); } else if (FPSM.box) FPSM.box.hidden = true; }
setTimeout(fpsmStart, 1500);

/* ---------- both in Settings ---------- */
if (typeof renderSettings === 'function'){ const _rs = renderSettings;
  renderSettings = function(){ const r = _rs.apply(this, arguments); const pane = el('pane-settings'); if (!pane || el('insSet')) return r;
    pane.insertAdjacentHTML('beforeend', `<div class="sec" id="insSet">${L('ตรวจเกม', 'Checking the game')}</div>
      <label class="set"><span><b>${L('แสดงตัววัดความลื่น', 'Show the smoothness meter')}</b><small>${L('FPS · เฟรมที่ช้าสุด · จำนวนครั้งที่สะดุด (มุมจอ) — แคปจอส่งมาได้เลยถ้ากระตุก', 'FPS · worst frame · hitches (in a corner) — send a screenshot if it stutters')}</small></span><input type="checkbox" id="set-fpsm" ${fpsmOn() ? 'checked' : ''}></label>
      <div class="set"><span><b>${L('โหมดตรวจหน้าตา', 'Look inspector')}</b><small>${L('ดูมอนและบอสทุกตัว ทุกท่า ทีละตัว', 'Every monster and boss, every move, one by one')}</small></span><button class="btn sm" data-insopen="1">${L('เปิด', 'Open')}</button></div>`);
    return r; }; }
document.addEventListener('change', e => { if (e.target && e.target.id === 'set-fpsm'){ SETTINGS.fpsMeter = e.target.checked; if (typeof saveSettings === 'function') saveSettings(); fpsmStart(); } });

{ const st = document.createElement('style'); st.textContent = `
#win-inspect{width:min(680px,96vw)}
.insbox{display:flex;flex-direction:column;gap:8px;color:#1b1b1b}.insrow{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
.insrow input{flex:1;min-width:120px;font:inherit;padding:5px 8px;border-radius:8px;border:1.5px solid #d8c8a0;min-height:32px}
.insmain{display:flex;gap:10px;flex-wrap:wrap}#insCv{border-radius:12px;border:2px solid #e3c88a;background:#8fbf6a;max-width:100%;height:auto}
.insside{flex:1;min-width:220px;display:flex;flex-direction:column;gap:8px}.insnm b{display:block;font-size:17px}.insnm small{color:#5a4a30}.insidx{min-width:64px;text-align:center;font-weight:700}
#fpsMeter{position:fixed;left:8px;bottom:8px;z-index:99999;padding:4px 9px;border-radius:999px;font:700 12px/1.3 Sarabun,system-ui,sans-serif;color:#fff;background:rgba(20,30,20,.78);pointer-events:none}
#fpsMeter.mid{background:rgba(120,90,10,.85)}#fpsMeter.bad{background:rgba(150,20,20,.88)}`; document.head.appendChild(st); }
