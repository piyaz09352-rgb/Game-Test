/* VAYRATHEN — js/sys/backup.js — daily cloud backups (7 days) and the smoothness test
   · BACKUPS: besides the live cloud save, each character gets one backup per weekday in your private space
     (data/users/<you>/bk_<slot>_<weekday>), refreshed on the first save of the day and every 6 hours after.
     So there is always a copy from each of the last 7 days. Settings → "Restore an older save" lists them;
     restoring replaces the current character with that copy (after a confirmation).
   · SMOOTHNESS TEST: Settings → "Test smoothness" runs each graphics preset for a few seconds, measures the
     frame rate and the worst stutters, then shows a report (device, screen, FPS per preset, recommendation)
     with a copy button so it can be sent along, and a button to use the recommended preset. */
'use strict';

const BK = {t:0, list:null, busy:false};
const bkMetaKey = () => `vayrathen-bk-${SLOT}`;
const bkDoc = (slot, dow) => `data/users/${NET.uid}/bk_${slot}_${dow}`;
function bkTick(){
  if (typeof NET === 'undefined' || !NET.db || !NET.uid || !S || !S.job || PAUSED) return;
  const dow = thaiClock().dow, day = dayKey(); let meta = {}; try { meta = JSON.parse(localStorage.getItem(bkMetaKey()) || '{}'); } catch (e) {}
  const m = meta[dow]; if (m && m.day === day && Date.now() - m.at < 6 * 3600e3) return;
  const at = Date.now(); meta[dow] = {day, at}; try { localStorage.setItem(bkMetaKey(), JSON.stringify(meta)); } catch (e) {}
  S.savedAt = at; NET.db.doc(bkDoc(SLOT, dow)).set({s:JSON.stringify(S), at, lvl:S.lvl, job:S.job, name:S.name || '', day}).catch(() => {});
}
EV.on('tick', dt => { BK.t -= dt; if (BK.t <= 0){ BK.t = 60; bkTick(); } });
async function bkLoad(){
  BK.list = null; reWin('backup'); if (!NET.db || !NET.uid){ BK.list = []; reWin('backup'); return; }
  const out = [];
  await Promise.all([0, 1, 2, 3, 4, 5, 6].map(async dow => { try { const s = await NET.db.doc(bkDoc(SLOT, dow)).get(); if (!s.exists) return; const d = s.data(); if (typeof d.s === 'string' && JOBS[d.job]) out.push({dow, at:+d.at || 0, lvl:d.lvl | 0, job:d.job, name:clean(d.name, 16), s:d.s}); } catch (e) {} }));
  BK.list = out.sort((a, b) => b.at - a.at); reWin('backup');
}
mkWin('backup', 'กู้เซฟย้อนหลัง', 'Restore a backup', '', '<path d="M4 10a6 6 0 1 0 2-4.5"/><path d="M4 3v3.5h3.5"/><path d="M10 7v3l2 1.5"/>', false);
WIN_RENDER.backup = function(){
  const pane = el('pane-backup'); if (!pane) return;
  const fmt = t => { const d = new Date(t + 7 * 3600e3); return `${d.getUTCDate()}/${d.getUTCMonth() + 1} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
  const DOW = [L('อาทิตย์', 'Sun'), L('จันทร์', 'Mon'), L('อังคาร', 'Tue'), L('พุธ', 'Wed'), L('พฤหัส', 'Thu'), L('ศุกร์', 'Fri'), L('เสาร์', 'Sat')];
  if (!NET.db || !NET.uid){ pane.innerHTML = `<p class="hint">${L('เซฟสำรองรายวันใช้ได้เมื่อเปิดเกมผ่านลิงก์ claude.ai (บันทึกบนคลาวด์ส่วนตัวของบัญชี) · ตอนนี้ยังส่งออกเซฟเป็นไฟล์ได้ในหน้าตั้งค่า', 'Daily backups work when you play from the claude.ai link (kept in your private cloud space) · you can still export a save file in Settings')}</p>`; return; }
  pane.innerHTML = `<p class="hint">${L(`ตัวละครช่อง ${SLOT + 1} · สำรองวันละครั้ง (และทุก 6 ชม.) เก็บย้อนหลัง 7 วัน · การกู้คืนจะแทนที่ความคืบหน้าปัจจุบันของตัวละครนี้`, `Character slot ${SLOT + 1} · backed up daily (and every 6 h), the last 7 days are kept · restoring replaces this character's current progress`)}</p>
    <div class="list">${BK.list == null ? `<p class="hint">${L('กำลังโหลด…', 'Loading…')}</p>` : BK.list.map((b, i) => `<div class="item bkrow"><div class="nm"><b>${DOW[b.dow]} · ${fmt(b.at)}</b><small>${escH(b.name || '')} ${nm(JOBS[b.job])} Lv ${b.lvl}${i === 0 ? ` · ${L('ล่าสุด', 'latest')}` : ''}</small></div><button class="btn sm" data-bkres="${i}">${L('กู้คืน', 'Restore')}</button></div>`).join('') || `<p class="hint">${L('ยังไม่มีเซฟสำรอง ระบบจะเริ่มสำรองให้ภายใน 1 นาที', 'No backups yet, the first one is made within a minute')}</p>`}</div>
    <button class="btn wide" data-bkreload="1">${L('โหลดรายการใหม่', 'Refresh')}</button>`;
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-bkres],[data-bkreload],#setBackup,#setPerf,[data-pfcopy],[data-pfuse],[data-pfagain]'); if (!b) return;
  if (b.id === 'setBackup'){ openWin('backup'); bkLoad(); return; }
  if (b.id === 'setPerf'){ perfTest(); return; }
  const d = b.dataset;
  if (d.bkreload) bkLoad();
  else if (d.bkres != null){ const k = BK.list && BK.list[+d.bkres]; if (!k) return;
    askConfirm(L('กู้เซฟย้อนหลัง', 'Restore backup'), L(`แทนที่ตัวละครปัจจุบัน (Lv ${S.lvl}) ด้วยเซฟสำรอง ${nm(JOBS[k.job])} Lv ${k.lvl}?`, `Replace your current character (Lv ${S.lvl}) with the backup ${nm(JOBS[k.job])} Lv ${k.lvl}?`), L('กู้คืน', 'Restore'), () => {
      try { const s = JSON.parse(k.s); if (!s || !JOBS[s.job]) throw 0; s.savedAt = Date.now(); localStorage.setItem(slotKey(SLOT), JSON.stringify(s)); } catch (er){ toast(L('เซฟสำรองเสีย', 'That backup is damaged')); return; }
      for (const w of WIN_IDS) closeWin(w); continueGame(); if (typeof cloudSave === 'function') cloudSave(true); toast(L('กู้เซฟแล้ว', 'Backup restored')); }); }
  else if (d.pfcopy){ const t = PF.report || ''; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(L('คัดลอกผลแล้ว ส่งให้ผู้พัฒนาได้เลย', 'Report copied'))).catch(() => { const ta = el('pfText'); if (ta){ ta.select(); try { document.execCommand('copy'); toast(L('คัดลอกแล้ว', 'Copied')); } catch (er) {} } }); }
  else if (d.pfuse && PF.best){ SETTINGS.gfx = PF.best; saveSettings(); setGfxMode(PF.best); toast(L(`ใช้กราฟิก "${GFX_TH[PF.best]}" แล้ว`, `Graphics set to "${GFX_TH[PF.best]}"`)); reWin('perf'); }
  else if (d.pfagain) perfTest();
});

/* ---------- smoothness test ---------- */
const PF = {run:false, res:[], report:'', best:null, stage:''};
async function perfTest(){
  if (PF.run) return; PF.run = true; PF.res = []; PF.best = null;
  const orig = GFX.mode, warned = PERF.warned; PERF.warned = true; closeWin('settings'); openWin('perf'); reWin('perf');
  const frames = ms => new Promise(res => { const d = []; let last = performance.now(), t0 = last; const f = now => { d.push(now - last); last = now; if (now - t0 < ms) requestAnimationFrame(f); else res(d); }; requestAnimationFrame(f); });
  for (const p of GFX.ORDER){
    PF.stage = p; reWin('perf'); GFX.mode = p; applyGfx(p);
    await frames(900); const d = (await frames(3200)).slice(1); if (!d.length) continue;
    const s = [...d].sort((a, b) => b - a), avg = d.reduce((a, b) => a + b, 0) / d.length, low = s[Math.max(0, Math.floor(d.length * .01))];
    PF.res.push({p, fps:Math.round(1000 / avg), low:Math.round(1000 / low), jank:d.filter(x => x > 50).length});
  }
  GFX.mode = orig; setGfxMode(orig); PERF.warned = warned;
  const ok = PF.res.filter(r => r.fps >= 50 && r.low >= 28); PF.best = (ok.length ? ok[ok.length - 1] : PF.res[0] || {p:'low'}).p;
  const nv = navigator, ua = nv.userAgent || '', dev = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Win/.test(ua) ? 'Windows' : 'Other';
  const br = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  PF.report = [`VAYRATHEN smoothness test · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    `Device: ${dev} · ${br} · ${screen.width}×${screen.height} @${(devicePixelRatio || 1).toFixed(2)}x · view ${innerWidth}×${innerHeight}${innerHeight > innerWidth ? ' (portrait)' : ''} · cores ${nv.hardwareConcurrency || '?'} · RAM ${nv.deviceMemory ? nv.deviceMemory + ' GB' : '?'}`,
    `Map ${MAP_ID} · monsters ${mobs.filter(m => !m.dead).length} · players here ${typeof NET !== 'undefined' && NET.ghosts ? NET.ghosts.size + 1 : 1}`,
    ...PF.res.map(r => `${r.p.padEnd(7)} avg ${String(r.fps).padStart(3)} fps · 1% low ${String(r.low).padStart(3)} fps · stutters ${r.jank}`),
    `Recommended: ${PF.best} · was: ${orig}`].join('\n');
  PF.run = false; PF.stage = ''; reWin('perf'); SFX.play('quest');
}
mkWin('perf', 'ทดสอบความลื่น', 'Smoothness test', '', '<path d="M3 15a7 7 0 1 1 14 0"/><path d="M10 15l3.5-4.5"/>', false);
WIN_RENDER.perf = function(){
  const pane = el('pane-perf'); if (!pane) return; const max = Math.max(60, ...PF.res.map(r => r.fps));
  pane.innerHTML = PF.run ? `<p class="hint">${L('กำลังทดสอบ… อย่าเพิ่งสลับแอป (ประมาณ 15–20 วินาที)', 'Testing… keep the game in front (about 15–20 seconds)')}</p><p><b>${GFX_TH[PF.stage] || ''}</b></p>
      <div class="pfbars">${PF.res.map(r => `<div class="pfb"><span>${GFX_TH[r.p]}</span><i style="width:${Math.round(r.fps / max * 100)}%"></i><b>${r.fps}</b></div>`).join('')}</div>`
    : PF.res.length ? `<div class="pfbars">${PF.res.map(r => `<div class="pfb${r.p === PF.best ? ' best' : ''}"><span>${GFX_TH[r.p]}</span><i style="width:${Math.round(r.fps / max * 100)}%"></i><b>${r.fps} <small>fps · ${L('ต่ำสุด', 'low')} ${r.low}</small></b></div>`).join('')}</div>
      <p class="hint">${L(`แนะนำ: <b>${GFX_TH[PF.best]}</b> (ลื่น ≥50 fps และไม่กระตุกต่ำกว่า 28 fps)`, `Recommended: <b>${GFX_TH[PF.best]}</b> (≥50 fps without dips under 28)`)}</p>
      <textarea id="pfText" class="pftext" readonly>${escH(PF.report)}</textarea>
      <div class="row"><button class="btn gold" data-pfuse="1">${L('ใช้ค่าที่แนะนำ', 'Use recommended')}</button><button class="btn" data-pfcopy="1">${L('คัดลอกผล', 'Copy report')}</button><button class="btn" data-pfagain="1">${L('ทดสอบอีกครั้ง', 'Run again')}</button></div>
      <p class="hint">${L('คัดลอกผลแล้วส่งมาในแชท จะได้ปรับเกมให้ลื่นบนเครื่องจริงของเจ้า', 'Copy the report and send it in the chat so the game can be tuned for your real device')}</p>`
    : `<p class="hint">${L('ยืนนิ่ง ๆ ในที่ที่มักเล่นแล้วกดเริ่ม · ทดสอบกราฟิกทุกระดับ ระดับละ 4 วินาที', 'Stand where you usually play and press start · each graphics level runs 4 seconds')}</p><button class="btn gold wide" data-pfagain="1">${L('เริ่มทดสอบ', 'Start test')}</button>`;
};

/* ---------- settings: festival preview, backups, smoothness test ---------- */
{
  const _rs = renderSettings;
  renderSettings = function(){ _rs();
    const ex = el('setExport'), row = ex && ex.closest('.row'); if (!row) return;
    row.insertAdjacentHTML('afterend', `<div class="row"><button class="btn" id="setBackup">${L('กู้เซฟย้อนหลัง (7 วัน)', 'Restore an older save (7 days)')}</button><button class="btn" id="setPerf">${L('ทดสอบความลื่น', 'Test smoothness')}</button></div>`);
    if (typeof EVENTS !== 'undefined'){ const cur = typeof evLive === 'function' ? evLive() : null;
      const sec = [...el('pane-settings').querySelectorAll('.sec')].find(s => /ข้อมูลเกม|Save data/.test(s.textContent));
      if (sec) sec.insertAdjacentHTML('beforebegin', `<div class="sec">${L('เทศกาล', 'Festivals')}</div><label class="set"><span><b>${L('ดูตัวอย่างฉากเทศกาล', 'Preview festival scenery')}</b><small>${cur ? L(`ตอนนี้: ${evName(cur)}`, `Now: ${evName(cur)}`) : L('ตอนนี้ไม่มีเทศกาล', 'No festival right now')} · ${L('แค่ฉาก ไม่ได้เหรียญ', 'looks only, no tokens')}</small></span>
        <select id="set-evPreview"><option value="">${L('ตามปฏิทินจริง', 'Follow the calendar')}</option>${Object.keys(EVENTS).map(k => `<option value="${k}" ${SETTINGS.evPreview === k ? 'selected' : ''}>${evName(k)}</option>`).join('')}</select></label>`); }
  };
}
document.addEventListener('change', e => { if (e.target.id !== 'set-evPreview') return; SETTINGS.evPreview = e.target.value || ''; saveSettings(); toast(SETTINGS.evPreview ? L(`ฉาก: ${evName(SETTINGS.evPreview)}`, `Scenery: ${evName(SETTINGS.evPreview)}`) : L('ฉากตามปฏิทินจริง', 'Scenery follows the calendar')); });
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'backup', t:['เซฟสำรองและทดสอบความลื่น', 'Backups & smoothness test'], b:() => `<p>${L('เมื่อเล่นผ่านลิงก์ claude.ai เกมสำรองเซฟของแต่ละตัวละครวันละชุด (อัปเดตทุก 6 ชม.) เก็บย้อนหลัง 7 วันในพื้นที่ส่วนตัวของบัญชี · กู้คืนได้ที่ ตั้งค่า → กู้เซฟย้อนหลัง · <b>ทดสอบความลื่น</b> (ตั้งค่า) วัด FPS ทุกระดับกราฟิก แนะนำค่าที่เหมาะกับเครื่อง และคัดลอกผลไปส่งต่อได้', 'Playing from the claude.ai link, each character is backed up once a day (refreshed every 6 h) and the last 7 days are kept in your private space · restore in Settings → Restore an older save · <b>Test smoothness</b> (Settings) measures FPS at every graphics level, recommends one for your device, and copies a report to share')}</p>`});
