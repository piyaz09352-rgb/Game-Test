/* VAYRATHEN — js/sys/mvp.js — the MVP board (กระดาน MVP)
   Every region's boss (MVP) on one board, in map order: its portrait, level, element, the region and its level range,
   and what is happening to it right now —
   · ปรากฏตัวอยู่ (up): someone on that map has it on their screen (reported when it appears);
   · ถูกปราบแล้ว (down): when, by whom (the whole party on that map is named), and about when it returns
     (a boss comes back 15 minutes of real-world time after it falls — js/sys/bossclock.js);
   · ยังไม่มีข้อมูล: nobody has reported it yet this season.
   A second tab ranks the MVP hunters by how many region bosses they have brought down.
   Online it lives in the shared database: mvp/<bossId> = {up, sp, at, names, uids, map, n, lv} and
   mvphunt/<uid> = {name, n, at}. Offline the board shows what this game saw. Everything read from the
   database is untrusted and drawn as text. A GM backup/reset covers both collections. */
'use strict';

const MVP_RESPAWN = 15 * 60e3, MVP_STALE = 20 * 60e3, MVP_RE = /^[a-z0-9_]{1,40}$/;
const MVP = {recs:{}, hunt:{}, unsub:null, unsubH:null, tab:'board', lastBoss:null, pt:{}, img:{}};
const mvpList = () => MAPS.map((mp, i) => ({map:i, id:mp.boss})).filter(x => x.id && MOB[x.id] && MVP_RE.test(x.id)).sort((a, b) => ((MAPS[a.map].lv || [0])[0] - (MAPS[b.map].lv || [0])[0]) || a.map - b.map);   // easiest first
const mvpIsMapBoss = m => !!(m && m.def && m.def.boss && !m.minion && !m.dummy && !m.wb && !m.dg && !(typeof DG !== 'undefined' && DG.active) && MAPS[MAP_ID] && MAPS[MAP_ID].boss === m.type);
const mvpSane = d => { if (!d || typeof d !== 'object') return null;
  const names = Array.isArray(d.names) ? d.names.slice(0, 12).map(n => clean(n, 18)) : [], uids = Array.isArray(d.uids) ? d.uids.slice(0, 12).map(u => clean(u, 64)) : [];
  return {up:!!d.up, sp:+d.sp || 0, at:+d.at || 0, names, uids, map:d.map | 0, n:Math.max(0, d.n | 0), lv:d.lv | 0}; };
const mvpOn = () => typeof NET !== 'undefined' && NET.db && NET.uid;
const mvpS = () => { const o = S.mvp = S.mvp && typeof S.mvp === 'object' ? S.mvp : {}; if (!o.kills || typeof o.kills !== 'object') o.kills = {}; return o; };

/* ---------- reporting ---------- */
async function mvpWrite(id, patch){
  const cur = MVP.recs[id] || {}, next = {...cur, ...patch}; MVP.recs[id] = mvpSane(next); reWin('mvp');
  if (!mvpOn()) return;
  try { const ref = NET.db.doc(`mvp/${id}`), s = await ref.get(), old = s.exists ? mvpSane(s.data()) || {} : {};
    const d = {...old, ...patch}; if (patch.kill){ delete d.kill; d.n = (old.n || 0) + 1; }
    delete d.kill; await ref.set(d); MVP.recs[id] = mvpSane(d); reWin('mvp'); } catch (e) {}
}
/* a boss appeared in this game (only the game that runs the map's monsters reports it) */
EV.on('tick', () => {
  if (typeof boss === 'undefined') return;
  if (boss && boss !== MVP.lastBoss && !boss.dead){ MVP.lastBoss = boss; const slave = typeof nmSlave === 'function' && nmSlave();
    if (mvpIsMapBoss(boss) && (!slave || (typeof nmLeader === 'function' && nmLeader()))) mvpWrite(boss.type, {up:true, sp:Date.now(), map:MAP_ID}); }
  if (!boss) MVP.lastBoss = null;
});
EV.on('kill', m => {
  if (!mvpIsMapBoss(m)) return;
  const crew = typeof fameCrew === 'function' ? fameCrew('map') : [{n:S.name || '?', u:(typeof NET !== 'undefined' && NET.uid) || ''}];
  const bk = typeof BCK !== 'undefined' ? BCK.kill[MAP_ID] : 0, at = typeof nmWorld === 'function' && nmWorld() && bk && wNow() - bk < 3000 ? bk : wNow(), K = mvpS(); /* world clock: the same stamp the kill event carried */ K.kills[m.type] = (K.kills[m.type] || 0) + 1; K.total = (K.total || 0) + 1; dirty = true;
  const rec = MVP.recs[m.type] || {};
  MVP.recs[m.type] = mvpSane({...rec, up:false, at, names:crew.map(c => c.n), uids:crew.map(c => c.u), map:MAP_ID, n:(rec.n || 0) + 1, lv:S.lvl});
  mvpWrite(m.type, {up:false, at, names:crew.map(c => c.n), uids:crew.map(c => c.u), map:MAP_ID, lv:clamp(S.lvl | 0, 1, 999), kill:1});
  { const who = escH(crew.map(c => c.n).join(', ')); banner(L(`MVP! ${MOB[m.type].name} ถูกปราบโดย ${who}`, `MVP! ${MOB[m.type].en} defeated by ${who}`)); }
  if (mvpOn()) (async () => { try { const ref = NET.db.doc(`mvphunt/${NET.uid}`), s = await ref.get(), n = (s.exists ? (s.data().n | 0) : 0) + 1;
    await ref.set({name:clean(netName(), 18), n, at}); MVP.hunt[NET.uid] = {name:clean(netName(), 18), n, at}; reWin('mvp'); } catch (e) {} })();
});
EV.on('netready', () => {
  if (!NET.db) return;
  if (!MVP.unsub) try { MVP.unsub = NET.db.collection('mvp').onSnapshot(s => { const r = {}; for (const d of s.docs){ if (!MVP_RE.test(d.id)) continue; const v = mvpSane(d.data()); if (v) r[d.id] = v; } MVP.recs = r; reWin('mvp'); }, () => {}); } catch (e) {}
  if (!MVP.unsubH) try { MVP.unsubH = NET.db.collection('mvphunt').onSnapshot(s => { const h = {}; for (const d of s.docs){ const v = d.data() || {}; h[d.id] = {name:clean(v.name, 18) || '?', n:Math.max(0, v.n | 0), at:+v.at || 0}; } MVP.hunt = h; reWin('mvp'); }, () => {}); } catch (e) {}
});
if (typeof GM_COLS !== 'undefined') GM_COLS.push(['mvp'], ['mvphunt']);

/* ---------- the board ---------- */
/* (v91) the portraits are drawn one at a time in idle moments after the board shows (drawing every boss at once
   froze the game for about a second the first time the board opened) */
const MVPQ = {q:[], on:false};
function mvpPortrait(id){
  if (MVP.img[id] !== undefined) return MVP.img[id];
  if (!MVPQ.q.includes(id)) MVPQ.q.push(id);
  if (!MVPQ.on){ MVPQ.on = true; mvpPortNext(); }
  return '';
}
function mvpPortNext(){
  const go = dl => { do { const id = MVPQ.q.shift(); if (!id){ MVPQ.on = false; return; }
      const url = mvpPortraitNow(id);
      if (url) for (const e of document.querySelectorAll(`.mvprow[data-mvpid="${id}"] .mvpic`)) e.style.setProperty('--pic', `url(${url})`);
    } while (dl && dl.timeRemaining && dl.timeRemaining() > 8);   // as many as fit in the idle moment
    mvpPortNext(); };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(go, {timeout:300}); else setTimeout(go, 30);
}
function mvpPortraitNow(id){
  if (MVP.img[id] !== undefined) return MVP.img[id];
  let url = '';
  // (v95) the boss fills its box: cropped to its drawn pixels, then fitted (was a small figure in an empty cell)
  try { if (SPR.MOBS[id]){ const img = SPR.renderFrame('mob', id, 'idle', 1, 0, 2), W = img.width, H = img.height, D = img.data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (D[(y * W + x) * 4 + 3] > 8){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
    if (x1 >= 0){ const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').putImageData(img, 0, 0);
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1, N = 128, m = 6, s = Math.min((N - m * 2) / cw, (N - m * 2) / ch);
      const o = document.createElement('canvas'); o.width = o.height = N; const g = o.getContext('2d'); g.imageSmoothingQuality = 'high';
      g.drawImage(c, x0, y0, cw, ch, (N - cw * s) / 2, N - m - ch * s, cw * s, ch * s); url = o.toDataURL(); } } } catch (e) {}
  return (MVP.img[id] = url);
}
const mvpAgo = ms => { const m = Math.floor(ms / 60e3); return m < 1 ? L('เมื่อสักครู่', 'just now') : m < 60 ? L(`${m} นาทีที่แล้ว`, `${m} min ago`) : m < 1440 ? L(`${Math.floor(m / 60)} ชม.ที่แล้ว`, `${Math.floor(m / 60)} h ago`) : L(`${Math.floor(m / 1440)} วันที่แล้ว`, `${Math.floor(m / 1440)} d ago`); };
const mvpClock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function mvpState(id, map){
  const r = MVP.recs[id], now = Date.now(), here = MAP_ID === map && typeof boss !== 'undefined' && boss && !boss.dead && boss.type === id;
  if (here) return {k:'up', t:L('ปรากฏตัวอยู่ · แมพนี้', 'Up · on this map')};
  if (r && r.up && now - r.sp < MVP_STALE) return {k:'up', t:L(`ปรากฏตัวอยู่ · ${mvpAgo(now - r.sp)}`, `Up · ${mvpAgo(now - r.sp)}`)};
  if (r && r.at){ const left = r.at + MVP_RESPAWN - now;
    return left > 0 ? {k:'down', t:L(`ถูกปราบ · กลับมาใน ~${mvpClock(left)}`, `Down · back in ~${mvpClock(left)}`), left}
      : {k:'ready', t:L('พร้อมปรากฏเมื่อมีคนเข้าแมพ', 'Ready · appears when someone is on the map')}; }
  return {k:'none', t:L('ยังไม่มีข้อมูล', 'No reports yet')};
}
WIN_RENDER.mvp = function(){
  const pane = document.getElementById('pane-mvp'); if (!pane) return;
  const K = mvpS(), tabs = `<div class="mvptabs"><button class="btn sm${MVP.tab === 'board' ? ' gold' : ''}" data-mvptab="board">${L('บอส MVP', 'MVP bosses')}</button><button class="btn sm${MVP.tab === 'hunt' ? ' gold' : ''}" data-mvptab="hunt">${L('อันดับนักล่า MVP', 'Top MVP hunters')}</button></div>`;
  if (MVP.tab === 'hunt'){
    const rows = Object.entries(MVP.hunt).sort((a, b) => b[1].n - a[1].n || a[1].at - b[1].at).slice(0, 30);
    pane.innerHTML = tabs + (mvpOn() ? (rows.length ? `<ol class="mvphunt">${rows.map(([u, h], i) => `<li class="${u === NET.uid ? 'me' : ''}"><b>${i + 1}</b><span>${escH(h.name)}</span><em>${fmtN(h.n)} MVP</em></li>`).join('')}</ol>`
      : `<p class="empty">${L('ยังไม่มีใครล้มบอส MVP ในซีซันนี้', 'Nobody has brought down an MVP this season yet')}</p>`) : `<p class="empty">${L('ต้องออนไลน์เพื่อดูอันดับทั้งเซิร์ฟ', 'Go online to see the server ranking')}</p>`)
      + `<p class="hint">${L(`คุณล้มบอส MVP ไปแล้ว ${fmtN(K.total || 0)} ครั้ง`, `You have brought down ${fmtN(K.total || 0)} MVPs`)}</p>`;
    return;
  }
  const list = mvpList(), cnt = {up:0}; for (const x of list) if (mvpState(x.id, x.map).k === 'up') cnt.up++;
  pane.innerHTML = tabs + `<p class="mvpsum">${L(`บอส MVP ${list.length} ตัว · ปรากฏตัวอยู่ ${cnt.up} ตัว`, `${list.length} MVP bosses · ${cnt.up} up now`)}${mvpOn() ? '' : ` · <em>${L('ออฟไลน์: เห็นแค่ในเกมนี้', 'offline: this game only')}</em>`}</p>
    <div class="mvplist">${list.map(x => { const d = MOB[x.id], mp = MAPS[x.map], st = mvpState(x.id, x.map), r = MVP.recs[x.id], pic = mvpPortrait(x.id);
      return `<div class="mvprow st-${st.k}" data-mvpid="${x.id}"><span class="mvpic"${pic ? ` style="--pic:url(${pic})"` : ''}></span>
        <div class="mvpnm"><b>${escH(L(d.name, d.en))}</b><small>Lv ${d.lvl || d.lv || '?'} · ${L(ELEM_TH[d.elem] || '', ELEM_EN[d.elem] || '')} · ${escH(L(mp.name, mp.en))}${mp.lv ? ` (Lv ${mp.lv[0]}–${mp.lv[1]})` : ''}</small>
          ${r && r.at ? `<small class="mvpby">${L('ล้มล่าสุด', 'Last down')} ${mvpAgo(Date.now() - r.at)} · ${escH(r.names.join(', ') || '?')}${r.n ? ` · ${L('รวม', 'total')} ${fmtN(r.n)}` : ''}</small>` : ''}</div>
        <div class="mvpst"><i></i><span data-mvpclock="${x.id}">${st.t}</span>${K.kills[x.id] ? `<small>${L(`คุณล้ม ${K.kills[x.id]} ครั้ง`, `you: ${K.kills[x.id]}`)}</small>` : ''}</div>
        <button class="mvpdt" data-mvpdrop="${x.id}" aria-expanded="${MVP.open === x.id}">${MVP.open === x.id ? L('ซ่อนของดรอป ▲', 'Hide drops ▲') : L('ดูของดรอป ▼', 'See drops ▼')}</button>
        ${MVP.open === x.id ? mvpDropsHTML(x.id, x.map) : ''}</div>`; }).join('')}</div>
    <p class="hint">${L('บอสเกิดใหม่ 15 นาทีหลังถูกปราบ นับตามเวลาจริงของโลก (เวลาเดียวกันทั้งเซิร์ฟ) · ปาร์ตี้ที่อยู่แมพเดียวกันได้ชื่อทั้งตี้', 'A boss returns 15 minutes after it falls, counted in real-world time (the same clock for the whole server) · a party on the same map is named together')}</p>`;
};
/* (v97) what a boss drops: everything killMob and the boss hooks can give, with the chance of each, so a player can
   pick which boss to hunt */
function mvpDropsHTML(id, mapId){
  const d = MOB[id], lvl = d.lvl || 1, mp = MAPS[mapId] || {}, pc = ch => `${Math.round(ch * 1000) / 10}%`, row = [];
  const chip = (icon, name, ch, sub) => `<div class="mvpdi">${icon}<span><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</span><em>${ch}</em></div>`;
  for (const [it, ch] of d.drops || []) if (ITEMS[it]) row.push(chip(itemIcon(it), escH(nm(ITEMS[it])), ch >= 1 ? L('แน่นอน', 'Always') : pc(ch)));
  row.push(chip('<span class="mvpdg">⚔</span>', L('อุปกรณ์สำหรับอาชีพของคุณ 1–3 ชิ้น', '1–3 gear pieces for your class'), L('แน่นอน', 'Always'), `Lv ${Math.max(1, Math.min(lvl, LV_MAX) - 30)}–${lvl + 5} · ${L('ชิ้นที่ 2: 60% · ชิ้นที่ 3: 20%', '2nd: 60% · 3rd: 20%')}`));
  if (typeof g10BossLine === 'function'){ const ln = g10BossLine({type:id, def:d}); if (ln && JOBS[ln]) row.push(chip('<span class="mvpdg">✦</span>', L(`อาวุธ/ชุดสาย${nm(JOBS[ln])}`, `${nm(JOBS[ln])} line weapon or set`), '35%', L('มีโอกาสได้ระดับหายาก', 'can be rare'))); }
  if (typeof ZS_LANDS !== 'undefined' && ZS_LANDS[mp.land]) row.push(chip('<span class="mvpdg">◆</span>', L(`ชิ้นส่วนเซต${ZS_LANDS[mp.land][0]}`, `${ZS_LANDS[mp.land][1]} set piece`), '25%'));
  if (lvl >= 150 && typeof csetDrop === 'function') row.push(chip('<span class="mvpdg">★</span>', L('ชิ้นส่วนชุดประจำสายของคุณ', 'Your class set piece'), '6%'));
  if (ITEMS.drill_d) row.push(chip(itemIcon('drill_d'), escH(nm(ITEMS.drill_d)), '12%'));
  if (d.card && CARDS[d.card]){ const c = CARDS[d.card]; row.push(chip('<span class="mvpdg cd">🂠</span>', escH(nm(c)), pc(d.cardRate || 0), escH(L(c.desc[0], c.desc[1])))); }
  row.push(chip('<span class="mvpdg"><i class="biaI"></i></span>', L('เงินรางวัล MVP 3,000 เบี้ย', 'MVP reward 3,000 Bia'), L('แน่นอน', 'Always')));
  return `<div class="mvpdrop">${row.join('')}</div>`;
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-mvpdrop]'); if (!b) return; MVP.open = MVP.open === b.dataset.mvpdrop ? null : b.dataset.mvpdrop; WIN_RENDER.mvp(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-mvptab]'); if (!b) return; MVP.tab = b.dataset.mvptab; WIN_RENDER.mvp(); });
/* the countdowns tick once a second while the board is open */
setInterval(() => { if (!winOpen('mvp') || MVP.tab !== 'board') return; for (const n of document.querySelectorAll('[data-mvpclock]')){ const id = n.dataset.mvpclock, x = mvpList().find(v => v.id === id); if (!x) continue;
  const st = mvpState(id, x.map), row = n.closest('.mvprow'); if (n.textContent !== st.t) n.textContent = st.t; if (row && !row.classList.contains('st-' + st.k)) reWin('mvp'); } }, 1000);

if (typeof MENU_ICONS !== 'undefined') MENU_ICONS.mvp = ['#ffd27a', '#8a1e14', `<path d="M8 11l3.6 3.2L16 7l4.4 7.2L24 11l-1.8 10.5H9.8z" fill="#ffd34a" stroke="#fff8e6" stroke-width="1.1" stroke-linejoin="round"/><path d="M10 24h12" stroke="#fff8e6" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="17" r="1.8" fill="#c8302a"/>`];
mkWin('mvp', 'กระดาน MVP', 'MVP Board', '', '<path d="M4 7l3 3 3-5 3 5 3-3-1.5 8h-9z"/><path d="M5.5 17h9"/>');
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'mvp', t:['กระดาน MVP', 'MVP Board'], b:() => L(
  '<p>เมนู → <b>กระดาน MVP</b> รวมบอสประจำแคว้นทุกตัว บอกว่าตัวไหน <b>ปรากฏตัวอยู่</b> ตัวไหน <b>ถูกปราบ</b> ไปเมื่อไหร่ โดยใคร (ปาร์ตี้ในแมพเดียวกันได้ชื่อทั้งตี้) และอีกนานแค่ไหนจะกลับมา (15 นาทีหลังถูกปราบ นับตามเวลาจริงของโลก) แท็บ <b>อันดับนักล่า MVP</b> จัดอันดับผู้เล่นตามจำนวนบอสที่ล้มได้</p>',
  '<p>Menu → <b>MVP Board</b> lists every region boss: which are <b>up</b>, which are <b>down</b>, when and by whom (a party on the same map is named together) and roughly when each returns (15 minutes of real-world time after it falls). The <b>Top MVP hunters</b> tab ranks players by how many they have brought down.</p>')});
