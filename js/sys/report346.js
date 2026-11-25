/* VAYRATHEN — js/sys/report346.js — (v346) «แจ้งปัญหา»: report a problem from inside the game
   The owner kept having to take screenshots and send them by hand. Menu → แจ้งปัญหา: the player writes what went wrong,
   and the report is saved online (Firestore «reports», readable only by a GM — firebase/firestore.rules) with:
   a small picture of the game world as it was when the window opened (the drawn scene; the buttons over it are not in it), the game version,
   map and position, level and job, the screen size and device, and the last few error messages the game caught.
   GM window: the reports are listed (newest first), each with its picture; a GM deletes them when done.
   One report per minute per player; offline the button explains that it needs online play. */
'use strict';
const RPT = {errs:[], last:0, shot:'', list:null, busy:false};
// the last errors the game caught (frame errors, uncaught errors), kept short
addEventListener('error', e => { RPT.errs.push(String(e.message || e).slice(0, 180)); if (RPT.errs.length > 6) RPT.errs.shift(); });
{ const _ce = console.error; console.error = function(...a){ try { RPT.errs.push(a.map(x => String(x && x.message || x)).join(' ').slice(0, 180)); if (RPT.errs.length > 6) RPT.errs.shift(); } catch (e) {} return _ce.apply(this, a); }; }
const rptOk = () => !!(typeof NET !== 'undefined' && NET.db && NET.uid);
/* the picture: the game canvas, scaled to 560 px wide, JPEG — about 40–90 KB */
function rptShot(){ try { const cv = document.getElementById('cv'); if (!cv || !cv.width) return '';
    const w = 560, h = Math.round(cv.height * w / cv.width), c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(cv, 0, 0, w, h);
    for (const q of [.6, .45, .3]){ const u = c.toDataURL('image/jpeg', q); if (u.length < 230000) return u; } } catch (e) {}
  return ''; }
const rptDev = () => `${innerWidth}x${innerHeight} @${devicePixelRatio || 1} ${matchMedia('(pointer:coarse)').matches ? 'touch' : 'mouse'} · ${navigator.userAgent}`.slice(0, 200);

mkWin('report', 'แจ้งปัญหา', 'Report a problem', '', '<path d="M10 3l8 14H2z"/><path d="M10 8v4M10 14.5v.5"/>');
WIN_RENDER.report = function(){
  const pane = el('pane-report'); if (!pane) return;
  if (!rptOk()){ pane.innerHTML = `<p class="hint">${L('แจ้งปัญหาได้เมื่อเล่นออนไลน์ · ตอนนี้แคปหน้าจอส่งให้ผู้พัฒนาได้เลย', 'Reporting needs online play · for now, send a screenshot to the developer')}</p>`; return; }
  const wait = Math.max(0, 60 - Math.floor((Date.now() - RPT.last) / 1000));
  pane.innerHTML = `<p class="hint">${L('เล่าว่าเจออะไร ตรงไหน ทำอะไรอยู่ · ภาพหน้าจอตอนนี้ เวอร์ชัน แผนที่ และเครื่องที่ใช้จะแนบไปด้วย', 'Tell us what happened, where, and what you were doing · a picture of the screen, the version, map and device are attached')}</p>
    <textarea id="rptMsg" maxlength="500" rows="4" placeholder="${L('เช่น กดปิดหน้าต่างตลาดไม่ได้', 'e.g. the market window will not close')}"></textarea>
    ${RPT.shot ? `<img class="rptimg" src="${RPT.shot}" alt="">` : ''}
    <div class="row"><button class="btn gold" data-rpt="send"${RPT.busy || wait ? ' disabled' : ''}>${wait ? L(`ส่งได้อีกใน ${wait} วิ`, `Again in ${wait}s`) : L('ส่งรายงาน', 'Send')}</button></div>`;
  const t = el('rptMsg'); if (t) t.addEventListener('keydown', e => e.stopPropagation());
};
// the picture is taken just before the window covers the screen
{ const _ow = openWin; openWin = function(id){ if (id === 'report'){ RPT.shot = rptShot(); } return _ow.apply(this, arguments); }; }
async function rptSend(){
  const t = el('rptMsg'), msg = (t && t.value || '').trim().slice(0, 500); if (!msg){ toast(L('เขียนสั้น ๆ ว่าเจออะไร', 'Write a few words about it')); return; }
  if (!rptOk() || RPT.busy || Date.now() - RPT.last < 60000) return;
  RPT.busy = true; WIN_RENDER.report();
  const at = Date.now(), id = NET.uid + '_' + at;
  const doc = {uid:NET.uid, name:String(S && S.name || '').slice(0, 24), v:typeof GAMEV !== 'undefined' ? GAMEV | 0 : 0, msg,
    map:typeof MAP_ID !== 'undefined' ? MAP_ID : 0, x:Math.round(P.x || 0), y:Math.round(P.y || 0), lvl:clamp(S && S.lvl | 0, 0, 300), job:String(S && S.job || '').slice(0, 24),
    dev:rptDev(), err:RPT.errs.join(' | ').slice(0, 2000), img:RPT.shot && RPT.shot.length < 240000 ? RPT.shot : '', at};
  try { await NET.db.collection('reports').doc(id).set(doc); RPT.last = at; toast(L('ส่งรายงานแล้ว ขอบคุณที่ช่วยกันนะ', 'Report sent — thank you')); closeWin('report'); }
  catch (e) { toast(L('ส่งไม่สำเร็จ ลองใหม่อีกครั้ง', 'Could not send — try again')); }
  RPT.busy = false; if (UIS.open.report) WIN_RENDER.report(); }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-rpt]'); if (!b || b.disabled) return;
  if (b.dataset.rpt === 'send') rptSend();
  else if (b.dataset.rpt === 'load') rptLoad();
  else if (b.dataset.rpt === 'del'){ const id = b.dataset.id; NET.db.collection('reports').doc(id).delete().then(() => { RPT.list = (RPT.list || []).filter(r => r.id !== id); reWin('gm'); }).catch(() => toast(L('ลบไม่สำเร็จ', 'Could not delete'))); } });

/* the GM window: the reports, newest first */
async function rptLoad(){ if (!rptOk()) return; try { const q = await NET.db.collection('reports').orderBy('at', 'desc').limit(40).get(); RPT.list = q.docs.map(d => ({id:d.id, ...d.data()})); } catch (e) { RPT.list = []; toast(L('โหลดรายงานไม่ได้', 'Could not load reports')); } reWin('gm'); }
if (WIN_RENDER.gm){ const _g = WIN_RENDER.gm; WIN_RENDER.gm = function(){ const r = _g.apply(this, arguments);
    try { const pane = el('pane-gm'); if (!pane || !GM.on || !rptOk()) return r;
      const rows = (RPT.list || []).map(x => `<div class="item rptrow"><div class="nm"><b>${escH(clean(x.name, 24))} · Lv ${x.lvl | 0} · v${x.v | 0} · ${escH(MAPS[x.map] ? nm(MAPS[x.map]) : String(x.map))}</b>
          <small>${new Date(x.at || 0).toLocaleString()} · ${escH(String(x.dev || '').slice(0, 60))}</small><p>${escH(String(x.msg || ''))}</p>${x.err ? `<small class="rpterr">${escH(String(x.err).slice(0, 300))}</small>` : ''}
          ${/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(x.img || '') ? `<img class="rptimg" src="${x.img}" alt="">` : ''}</div><button class="btn sm" data-rpt="del" data-id="${escH(x.id)}">${L('ลบ', 'Delete')}</button></div>`).join('');
      pane.insertAdjacentHTML('beforeend', `<div class="sec">${L('รายงานปัญหาจากผู้เล่น', 'Problem reports')}${RPT.list ? ` · ${RPT.list.length}` : ''}</div>
        <div class="row gmrow"><button class="btn sm" data-rpt="load">${L(RPT.list ? 'โหลดใหม่' : 'โหลดรายงาน', RPT.list ? 'Reload' : 'Load reports')}</button></div><div class="list">${rows || (RPT.list ? `<p class="hint">—</p>` : '')}</div>`); } catch (e) {}
    return r; }; }
{ const st = document.createElement('style'); st.textContent = `#pane-report textarea{width:100%;box-sizing:border-box;border-radius:10px;padding:8px;font:500 14px var(--thai,sans-serif);resize:vertical;margin:6px 0}
  #pane-report .rptimg,#pane-gm .rptimg{display:block;max-width:100%;max-height:160px;border-radius:8px;margin:6px 0;border:1px solid rgba(150,130,220,.45)}
  #pane-gm .rptrow p{margin:4px 0;white-space:pre-wrap}#pane-gm .rpterr{color:#b03030}`; document.head.appendChild(st); }
