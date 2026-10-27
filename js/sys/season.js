/* VAYRATHEN — js/sys/season.js — seasons: everyone starts again from 0 after the open test
   · A season is a number. Saves (S.season), the account (ACC.season) and this browser (localStorage vayrathen-season)
     remember the season they belong to; anything without one belongs to season 1.
   · The live season is the higher of RESET_SEASON (js/net/firebase-config.js: the owner forces a reset by deploying a
     bigger number, no GM needed) and the db doc server/season {n, id, at, by}, which only a GM writes (js/sys/gm.js).
   · When this browser or this account's private cloud space holds data from an older season, it is ARCHIVED first
     (localStorage vayrathen-archive-<old> and data/users/<uid>/archive_<old> [+ _<i> parts]), then the 3 save slots,
     the account, the cloud saves and the 7-day backups are wiped, and the game goes back to the title screen.
   · Checked at start (offline too), when going online, every minute, and at once when a GM announces a reset, so a
     player who was offline during the reset is reset the next time they connect. */
'use strict';

const SEASON_KEY = 'vayrathen-season', SEASON = {cur:1, srv:0, cloud:0, busy:false, note:false, pollT:60, t:60};
const seasonBase = () => Math.max(1, typeof RESET_SEASON !== 'undefined' ? RESET_SEASON | 0 : 1);
const seasonOf = o => Math.max(1, (o && o.season) | 0);   // no season = the first season
const seasonOld = o => seasonOf(o) < SEASON.cur;
const seasonRaw = raw => { try { return seasonOf(JSON.parse(raw)); } catch (e){ return 1; } };
const SEASON_PART = 60000;   // characters per archive/backup part (db documents stay far below 256 KiB)
// this browser's season: the stored one, or the newest season any local save or the account says
try { SEASON.cur = Math.max(1, +localStorage.getItem(SEASON_KEY) || 0, seasonOf(ACC));
  for (let i = 0; i < SLOTS; i++){ const r = localStorage.getItem(slotKey(i)); if (r) SEASON.cur = Math.max(SEASON.cur, seasonRaw(r)); } } catch (e) {}
const seasonLive = () => Math.max(seasonBase(), SEASON.srv | 0);

/* saves and the account carry their season; old-season data never loads again */
{ const _save = save; save = function(){ if (SEASON.busy) return; if (S) S.season = SEASON.cur; return _save.apply(this, arguments); }; }
{ const _load = load; load = function(i){ const s = _load.apply(this, arguments); return s && seasonOld(s) ? null : s; }; }
{ const _acc = accSave; accSave = function(){ if (SEASON.busy) return; ACC.season = SEASON.cur; return _acc.apply(this, arguments); }; }

/* wipe this browser's old-season data (archived to vayrathen-archive-<old> first); returns the archive or null */
function seasonLocalWipe(to){
  const old = SEASON.cur, arch = {game:'vayrathen', kind:'archive', season:old, at:Date.now(), slots:[], acc:null}; let any = false;
  try {
    for (let i = 0; i < SLOTS; i++){ const r = localStorage.getItem(slotKey(i)); if (r && seasonRaw(r) < to){ arch.slots[i] = r; any = true; localStorage.removeItem(slotKey(i)); } else arch.slots[i] = null; localStorage.removeItem(`vayrathen-bk-${i}`); }
    const a = localStorage.getItem(ACCKEY); if (a && seasonRaw(a) < to){ arch.acc = a; any = any || !!ACC.name; localStorage.removeItem(ACCKEY); ACC = accBlank(); }
    if (seasonOf(S) < to) S = newS();
    localStorage.setItem(SEASON_KEY, String(to)); setSlot(0);
    if (any) localStorage.setItem(`vayrathen-archive-${old}`, JSON.stringify(arch));
  } catch (e) {}   // a full storage can drop the local archive: the cloud archive still has it
  SEASON.cur = to;
  return any ? arch : null;
}
/* wipe the private cloud space's old-season docs (archived to data/users/<uid>/archive_<old> first) */
async function seasonCloudWipe(to, local){
  const db = NET.db, base = `data/users/${NET.uid}`; let cs = 1;
  try { const c = await db.doc(`${base}/season`).get(); if (c.exists) cs = Math.max(1, c.data().n | 0); } catch (e){ return false; }
  if (cs >= to){ SEASON.cloud = cs; return false; }
  const names = ['save', 'save1', 'save2', 'account']; for (let s = 0; s < SLOTS; s++) for (let d = 0; d < 7; d++) names.push(`bk_${s}_${d}`);
  const docs = {}, old = [];
  await Promise.all(names.map(async n => { try { const g = await db.doc(`${base}/${n}`).get(); if (!g.exists) return; const d = g.data() || {};
    if (seasonRaw(n === 'account' ? d.a : d.s) < to){ docs[n] = d; old.push(n); } } catch (e) {} }));
  const any = old.some(n => n !== 'account' || (() => { try { return !!JSON.parse(docs[n].a).name; } catch (e){ return false; } })());
  if (old.length || local){
    const str = JSON.stringify({game:'vayrathen', kind:'archive', season:cs, at:Date.now(), docs, local:local || null}), parts = Math.ceil(str.length / SEASON_PART);
    try { for (let i = 0; i < parts; i++) await db.doc(`${base}/archive_${cs}_${i}`).set({i, d:str.slice(i * SEASON_PART, (i + 1) * SEASON_PART)});
      await db.doc(`${base}/archive_${cs}`).set({season:cs, at:Date.now(), parts, size:str.length, docs:old}); } catch (e) { console.warn('season: cloud archive failed', e && e.message); }
  }
  for (const n of old) try { await db.doc(`${base}/${n}`).delete(); } catch (e) {}
  try { await db.doc(`players/${NET.uid}`).delete(); } catch (e) {}
  try { await db.doc(`${base}/season`).set({n:to, at:Date.now()}); SEASON.cloud = to; } catch (e) {}
  return any;
}
/* move this browser and this account to season `to` */
async function seasonReset(to){
  if (SEASON.busy) return false; SEASON.busy = true;
  const playing = !PAUSED, oldChar = playing && seasonOf(S) < to; let got = false, local = null;
  if (oldChar){ PAUSED = true; if (typeof BOT !== 'undefined') BOT.on = false; }
  try {
    if (SEASON.cur < to){ local = seasonLocalWipe(to); got = !!local; }
    if (typeof NET !== 'undefined' && NET.db && NET.uid) got = (await seasonCloudWipe(to, local)) || got;
  } finally { SEASON.busy = false; }
  if (oldChar || local || (got && PAUSED)){
    if (typeof NET !== 'undefined'){ NET.dirSig = ''; NET.cloudT = Date.now(); NET.cloudNote = null; }
    if (typeof S !== 'undefined' && seasonOf(S) < to) S = newS();
    for (const w of WIN_IDS) closeWin(w); if (typeof closeDialog === 'function') closeDialog();
    SEASON.note = true; showTitle();
  }
  return got || oldChar;
}
/* the live season from the db (only a GM's word counts) */
function seasonTrust(v){
  if (!v || !Number.isInteger(v.n) || v.n < 1 || v.n > 1e6) return false;
  const ids = typeof gmIds === 'function' ? gmIds() : []; return !ids.length || ids.includes(v.by);
}
async function seasonFetch(){
  if (typeof NET === 'undefined' || !NET.db) return SEASON.srv;
  try { const d = await NET.db.doc('server/season').get(); if (d.exists){ let v = d.data(); if (!seasonTrust(v) && typeof gmLoadIds === 'function'){ await gmLoadIds(); } if (seasonTrust(v)) SEASON.srv = v.n; } } catch (e) {}
  return SEASON.srv;
}
/* at connect (online.js netInit awaits this before loading cloud saves) and on every check */
async function seasonNet(){
  if (typeof NET === 'undefined' || !NET.db || !NET.uid || SEASON.busy) return false;
  await seasonFetch(); const to = seasonLive();
  if (SEASON.cur >= to && SEASON.cloud >= to) return false;
  return seasonReset(to);
}
/* boot: a deployed RESET_SEASON above this browser's season resets it before anything loads */
if (SEASON.cur < seasonBase()){ if (seasonLocalWipe(seasonBase())) SEASON.note = true; }
{ const _st = showTitle; showTitle = function(){ _st.apply(this, arguments); if (SEASON.note){ SEASON.note = false; setTimeout(seasonNotice, 400); } }; }
function seasonNotice(){
  const d = el('confirm'); if (!d) return;
  d.innerHTML = `<h3>${L('การทดสอบเปิดจบแล้ว', 'The open test has ended')}</h3><p>${L(`ขอบคุณที่ร่วมทดสอบ! โลกถูกรีเซตเข้าสู่ซีซัน ${SEASON.cur} · การผจญภัยครั้งใหม่เริ่มจาก 0 · ข้อมูลเก่าของคุณถูกเก็บสำรองไว้แล้ว`, `Thank you for testing! The world has been reset to season ${SEASON.cur} · a new adventure begins from 0 · your old data was archived first`)}</p><div class="row"><button class="btn gold" data-cf="ok">${L('เริ่มใหม่', 'Start again')}</button></div>`;
  d.hidden = false; d.dataset.season = '1'; d.onclick = e => { if (e.target.closest('[data-cf]')){ d.hidden = true; delete d.dataset.season; } };
}
/* every minute, even on the title screen (PAUSED stops the game loop, not this) */
if (typeof setInterval === 'function') setInterval(() => { if (typeof NET === 'undefined' || !NET.db || SEASON.busy) return; SEASON.t -= 5; if (SEASON.t > 0) return; SEASON.t = SEASON.pollT; seasonNet(); }, 5000);
