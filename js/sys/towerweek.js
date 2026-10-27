/* VAYRATHEN — js/sys/towerweek.js — (v103) the Vayra Tower's weekly ranking, paid by mail
   · Every climb counts for the week it ends in (weeks turn over on Monday 00:00 Thailand time, like the weekly tasks).
     Your best floor this week is S.twk {w, f}; when a run ends higher, it is written to towerwk/<week>_<uid>.
     One document per player per week, never overwritten by a later week, so last week's board stays as it was.
   · The Tower window gets two boards: "สัปดาห์นี้" (this week, with the time left) and "ตลอดกาล" (all-time best).
   · Rewards: the first time you are online in a new week, your game reads last week's board, finds your place and
     mails you the prize (js/sys/mail.js): Bia by floor and rank, Vayra Coins by rank, and the 1st place / top-10
     achievements with their titles. Climb at least TWK_MIN floors to be ranked. Paid once (S.twkPaid = the week).
   One read when the window opens or every 30 s while it is open, one read a week for the prize; nothing per frame. */
'use strict';

const TWK_MIN = 5;
const TWK_PRIZE = [[1, 30, 3, '🥇'], [2, 20, 2.5, '🥈'], [3, 15, 2, '🥉'], [10, 8, 1.5, '🏅'], [20, 4, 1.2, '🎖'], [1e9, 1, 1, '🗼']];   // [up to rank, ◈, Bia ×, mark]
const TWK = {view:'week', rows:[], w:-1, at:0, busy:false, t:0, payT:0};
const twkWeek = () => (typeof weekKey === 'function' ? weekKey() : Math.floor((dayKey() + 3) / 7));
const twkPrize = rank => TWK_PRIZE.find(p => rank <= p[0]);
const twkBia = (f, rank) => Math.round(f * 1500 * twkPrize(rank)[2]);
const twkMine = () => { const w = twkWeek(); if (!S.twk || S.twk.w !== w) S.twk = {w, f:0, pub:0}; return S.twk; };
const twkLeft = () => { const d = 7 - ((dayKey() + 3) % 7), c = thaiClock(), h = (d - 1) * 24 + (23 - c.h); return h >= 24 ? L(`${Math.floor(h / 24)} วัน ${h % 24} ชม.`, `${Math.floor(h / 24)}d ${h % 24}h`) : L(`${h} ชม. ${59 - c.m} นาที`, `${h}h ${59 - c.m}m`); };

/* every floor cleared counts for this week */
{ const _c = twClear; twClear = function(){ const f = TW.f, r = _c.apply(this, arguments); const k = twkMine(); if (f > k.f) k.f = f; return r; }; }
{ const _f = twFinish; twFinish = function(){ const was = TW.active, r = _f.apply(this, arguments); if (was) twkPublish(); return r; }; }
async function twkPublish(){
  const k = twkMine(); if (!mlOk() || k.f < 1 || k.pub >= k.f) return false;
  try { await NET.db.doc(`towerwk/${k.w}_${NET.uid}`).set({w:k.w, uid:NET.uid, f:k.f, name:netName(), job:S.job, lvl:S.lvl, at:Date.now()}); k.pub = k.f; dirty = true; TWK.at = 0; reWin('tower'); return true; }
  catch (e){ return false; }
}
/* one week's board, best floor first (the earlier climb wins a tie) */
async function twkBoard(w){
  const s = await NET.db.collection('towerwk').where('w', '==', w).limit(500).get();
  return s.docs.map(d => d.data()).filter(r => r && typeof r.uid === 'string' && (r.f | 0) > 0).sort((a, b) => (b.f - a.f) || (a.at - b.at));
}
async function twkLoad(force){
  if (!mlOk() || TWK.busy || (!force && TWK.w === twkWeek() && Date.now() - TWK.at < 30000)) return;
  TWK.busy = true; try { TWK.rows = await twkBoard(twkWeek()); TWK.w = twkWeek(); TWK.at = Date.now(); } catch (e) {} TWK.busy = false; reWin('tower');
}
/* last week's prize, once, by mail */
async function twkPay(){
  const pw = twkWeek() - 1; if (!mlOk() || !S || !S.lvl || (S.twkPaid | 0) >= pw || TWK.paying) return;
  TWK.paying = true;
  try {
    const rows = await twkBoard(pw), ranked = rows.filter(r => (r.f | 0) >= TWK_MIN), i = ranked.findIndex(r => r.uid === NET.uid);
    if (i >= 0){ const rank = i + 1, f = ranked[i].f | 0, p = twkPrize(rank), z = twkBia(f, rank);
      const ok = await mlSystem(L(`${p[3]} รางวัลหอคอยรายสัปดาห์ · อันดับ ${rank}`, `${p[3]} Weekly tower prize · rank ${rank}`),
        L(`สัปดาห์ที่แล้วคุณปีนหอคอยวายราถึงชั้น ${f} ได้อันดับ ${rank} จาก ${ranked.length} คน · รับรางวัลได้เลย`, `Last week you climbed the Vayra Tower to floor ${f}: rank ${rank} of ${ranked.length}. Here is your prize.`), {z, c:p[1]});
      if (!ok) throw new Error('mail');
      if (rank === 1) bump('twTop1'); if (rank <= 10) bump('twTop10'); bump('twRanked');
      banner(L(`📬 รางวัลหอคอยสัปดาห์ที่แล้ว (อันดับ ${rank}) ส่งเข้าจดหมายแล้ว`, `📬 Last week's tower prize (rank ${rank}) is in your mail`));
      if (typeof achCheck === 'function') achCheck(); }
    S.twkPaid = pw; dirty = true; save();
  } catch (e) {}
  TWK.paying = false;
}
EV.on('netready', () => setTimeout(() => { twkPay(); twkPublish(); }, 4000));
EV.on('tick', dt => { if ((TWK.payT += dt) < 60) return; TWK.payT = 0; twkPay(); if (winOpen('tower') && TWK.view === 'week') twkLoad(); });

/* ---------- the Tower window: this week / all time ---------- */
{ const _r = WIN_RENDER.tower; WIN_RENDER.tower = function(){
    _r.apply(this, arguments); const pane = el('pane-tower'); if (!pane) return;
    const secs = pane.querySelectorAll('.twsec'), head = secs[secs.length - 1], board = pane.querySelector('.twrank'); if (!head || !board) return;
    const k = twkMine();
    head.innerHTML = `<div class="twktabs"><button class="btn sm${TWK.view === 'week' ? ' gold' : ''}" data-twkv="week">${L('สัปดาห์นี้', 'This week')}</button><button class="btn sm${TWK.view === 'all' ? ' gold' : ''}" data-twkv="all">${L('ตลอดกาล', 'All time')}</button></div>`;
    if (TWK.view !== 'week') return;
    if (!mlOk()){ board.innerHTML = `<p class="hint">${L('อันดับใช้ได้เมื่อออนไลน์', 'The ranking works online')}</p>`; return; }
    twkLoad(); const me = TWK.rows.findIndex(r => r.uid === NET.uid);
    const prize = `<details class="twkprz"><summary>${L(`รางวัลรายสัปดาห์ (ปีนอย่างน้อย ${TWK_MIN} ชั้น) · ส่งทางจดหมายวันจันทร์`, `Weekly prizes (climb ${TWK_MIN}+ floors) · mailed on Monday`)}</summary><ul>
      ${TWK_PRIZE.map((p, i) => `<li>${p[3]} ${i === TWK_PRIZE.length - 1 ? L('คนอื่นทุกคน', 'everyone else') : p[0] <= 3 ? L(`อันดับ ${p[0]}`, `rank ${p[0]}`) : L(`อันดับ ${TWK_PRIZE[i - 1][0] + 1}–${p[0]}`, `ranks ${TWK_PRIZE[i - 1][0] + 1}–${p[0]}`)} · ◈ ${p[1]} · ${L('เบี้ย', 'Bia')} = ${L('ชั้น', 'floor')} × ${fmtN(1500 * p[2])}</li>`).join('')}
      <li>${L('อันดับ 1 ได้ฉายา «ราชันหอคอย» · ติด 10 อันดับได้ฉายา «ยอดนักปีน»', 'Rank 1 earns the title “Tower Sovereign” · the top 10 “Elite Climber”')}</li></ul></details>`;
    board.innerHTML = `<div class="twkme"><span>${L('ของคุณสัปดาห์นี้', 'Yours this week')} <b>${L('ชั้น', 'floor')} ${k.f}</b>${me >= 0 ? ` · ${L('อันดับ', 'rank')} <b>${me + 1}</b>` : ''}</span><small>${L('รีเซ็ตใน', 'Resets in')} ${twkLeft()}</small></div>${prize}
      ${TWK.rows.length ? TWK.rows.slice(0, 20).map((r, i) => `<div class="twr${r.uid === NET.uid ? ' me' : ''}"><i class="rk${i < 3 ? ' top' + i : ''}">${i + 1}</i><b class="pn"></b><small>${JOBS[r.job] ? nm(JOBS[r.job]) : ''}</small><em>${L('ชั้น', 'F')} ${clamp(r.f | 0, 0, 99999)}</em></div>`).join('')
        : `<p class="hint">${TWK.busy || TWK.w !== twkWeek() ? L('กำลังโหลด…', 'Loading…') : L('สัปดาห์นี้ยังไม่มีใครปีน · เป็นคนแรกเลย!', 'Nobody has climbed this week · be the first!')}</p>`}`;
    board.querySelectorAll('.twr .pn').forEach((b, i) => { b.textContent = clean(TWK.rows[i] && TWK.rows[i].name, 18) || L('นักผจญภัย', 'Adventurer'); });
  }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-twkv]'); if (!t) return; TWK.view = t.dataset.twkv; if (TWK.view === 'week') twkLoad(true); reWin('tower'); });

/* a GM backup holds the weekly boards, and a world reset clears them with the rest (js/sys/gm.js) */
if (typeof GM_COLS !== 'undefined' && !GM_COLS.some(c => c[0] === 'towerwk')) GM_COLS.push(['towerwk']);
/* ---------- titles for the weekly top ---------- */
if (typeof ACH !== 'undefined' && typeof ACH_BY !== 'undefined'){
  for (const [id, tier, th, en, k, dth, den, coin] of [['twtop10', 2, 'ยอดนักปีน', 'Elite Climber', 'twTop10', 'ติด 10 อันดับแรกของหอคอยรายสัปดาห์', 'Finish a week in the tower top 10', 15],
      ['twtop1', 3, 'ราชันหอคอย', 'Tower Sovereign', 'twTop1', 'จบสัปดาห์เป็นอันดับ 1 ของหอคอย', 'Finish a week first in the tower', 50]]){
    const a = {id, cat:'hunt', tier, th, en, dth, den, prog:() => [(S.st && S.st[k]) || 0, 1], coin, title:[th, en]}; ACH.push(a); ACH_BY[id] = a; }
}
if (typeof WIKI_SYS !== 'undefined'){ const w = WIKI_SYS.find(a => a.id === 'tower'); if (w){ const _b = w.b;
  w.b = () => `${_b()}<p><b>${L('อันดับรายสัปดาห์', 'Weekly ranking')}</b> · ${L(`ทุกการปีนนับในสัปดาห์ที่จบ (รีเซ็ตวันจันทร์ 00:00) · ปีนอย่างน้อย ${TWK_MIN} ชั้นจึงติดอันดับ · รางวัลส่งทางจดหมายเมื่อออนไลน์ครั้งแรกของสัปดาห์ใหม่: อันดับ 1 ◈30 · 2 ◈20 · 3 ◈15 · 4–10 ◈8 · 11–20 ◈4 · คนอื่น ◈1 พร้อมเงินตามชั้น · อันดับ 1 ได้ฉายาราชันหอคอย ติด 10 อันดับได้ฉายายอดนักปีน`, `Every climb counts for the week it ends in (resets Monday 00:00) · climb ${TWK_MIN}+ floors to be ranked · prizes come by mail the first time you are online in the new week: 1st ◈30 · 2nd ◈20 · 3rd ◈15 · 4–10 ◈8 · 11–20 ◈4 · everyone else ◈1, plus Bia by floor · 1st earns “Tower Sovereign”, the top 10 “Elite Climber”`)}</p>`; } }

{ const st = document.createElement('style'); st.textContent = `
.twktabs{display:flex;gap:6px}.twkme{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 8px;border-radius:8px;background:#fff6e0;border:1.5px solid #f0d890}.twkme b{color:#5a2ad8}.twkme small{color:#6a5a3a}
.twkprz summary{cursor:pointer;color:#3a2a8a;font-weight:600;font-size:12.5px}.twkprz ul{margin:4px 0;padding-left:18px;font-size:12.5px;line-height:1.45}`; document.head.appendChild(st); }
