/* VAYRATHEN — js/sys/fame.js — Hall of Fame (หอเกียรติยศ): the server's record book
   · Records: FIRST DISCOVERY of each party dungeon and each far region (Hidden City of Laplae onwards) ·
     FIRST CLEAR of each special boss (every region boss, every dungeon guardian, Rahu the world boss) ·
     FASTEST KILL of each of those bosses (first hit → death, only when you saw it at full HP) ·
     FIRST TO reach adventure milestones (Lv 50/99/150/200/300, 3rd class, every region, the main story, the side
     story, a Legendary item, +15, 10 world bosses, every achievement of a category, every achievement).
   · A party gets the record together: everyone in the party (on the same map for kills) is named and rewarded.
   · Online it lives in the shared database at fame/<recordId> = {names, uids, party, t, at, lv, prev}. A "first"
     is written once and never replaced; a speed record only by a faster time (the old one is kept as prev).
     Claims go through a Firestore transaction, or a claude.ai lease (acquire) + read, or read → write → re-read.
   · Announcements: room event 'fame' (just a nudge: the record is re-read from the database before it is shown or
     rewarded) and, if that topic is refused, the live database snapshot. Big banner + log + chat line for everyone.
   · Rewards (each credited character, once per record): Vayra Coins, Bia and a Hall of Fame title, kept for good
     even after a speed record is beaten (the wiki then lists you as the former record holder).
   · Offline: nothing is shared; your own firsts and best times are kept as personal records (S.fame.mine).
   Window: Wiki (K) → Hall of Fame. Everything read from the database or the room is untrusted and drawn as text. */
'use strict';

const FAME_RE = /^(disc|clr|spd|mile)_[a-z0-9_]{1,40}$/;
const FM = {recs:{}, shown:new Set(), busy:{}, loaded:false, unsub:null, t0:Date.now(), tag:Math.random().toString(36).slice(2, 6), syncNeed:false, syncT:0, mileT:3, tab:'clr'};
const fmS = () => { const f = S.fame = S.fame && typeof S.fame === 'object' ? S.fame : {}; for (const k of ['mine', 'tried', 'got', 'titles']) if (!f[k] || typeof f[k] !== 'object') f[k] = {}; return f; };
const fmPlaying = () => !!(S && S.name && S.lvl && el('title') && el('title').hidden);
const fmWait = ms => new Promise(r => setTimeout(r, ms));
const fmTime = ms => { const s = Math.max(0, ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`; };
const fmDate = at => { const d = new Date(at); return `${d.toLocaleDateString(LANG === 'en' ? 'en-GB' : 'th-TH')} ${d.toTimeString().slice(0, 5)}`; };

/* ---------- what can be recorded ---------- */
const FAME_SPECIAL_MAP = 16;   // the far regions: Hidden City of Laplae and everything beyond it
const FAME_MILE = [
  ['lv50', 'ถึง Base Lv 50', 'reach Base Lv 50', () => S.lvl >= 50],
  ['lv99', 'ถึง Base Lv 99', 'reach Base Lv 99', () => S.lvl >= 99],
  ['lv150', 'ถึง Base Lv 150', 'reach Base Lv 150', () => S.lvl >= 150],
  ['lv200', 'ถึง Base Lv 200', 'reach Base Lv 200', () => S.lvl >= 200],
  ['lv300', 'ถึงเลเวลตัน 300', 'reach the Lv 300 cap', () => S.lvl >= 300],
  ['job3', 'เปลี่ยนเป็นอาชีพขั้นที่ 3', 'become a 3rd-tier class', () => jobTier() >= 3],
  ['maps', 'ไปครบทุกแคว้น', 'visit every region', () => visitedN() >= MAPS.length],
  ['story', 'จบเนื้อเรื่องหลัก (ศิลาผนึกครบ)', 'finish the main story (every seal shard)', () => (S.shards || 0) >= QUESTS.length],
  ['side', 'จบบันทึกครูวายราทุกตอน', "finish Vayra's Journal", () => sv('side') >= 10],
  ['legend', 'ได้ไอเทมตำนาน', 'obtain a Legendary item', () => sv('legend') >= 1],
  ['ref15', 'ตีบวกถึง +15', 'refine a piece to +15', () => (typeof maxRefine === 'function' ? maxRefine() : S.refine || 0) >= 15],
  ['wb10', 'ร่วมล้มบอสโลก 10 ครั้ง', 'help defeat 10 world bosses', () => sv('wbkills') >= 10],
  ...ACH_CAT.map(([c, th, en]) => ['ach_' + c, `ปลดล็อกความสำเร็จหมวด${th}ครบ`, `unlock every ${en} achievement`, () => ACH.filter(a => a.cat === c).every(a => S.ach && S.ach[a.id])]),
  ['achall', 'ปลดล็อกความสำเร็จครบทุกอย่าง', 'unlock every achievement', () => ACH.every(a => S.ach && S.ach[a.id])]];
let FAME_IX = null;
function fameIx(){
  if (FAME_IX) return FAME_IX;
  const disc = [...DUNGEONS.map(D => ['dg_' + D.id, () => `⚔ ${nm(D)}`]), ...MAPS.filter(m => m.id >= FAME_SPECIAL_MAP).map(m => ['map_' + m.id, () => nm(m)])];
  const seen = new Set(), boss = [];
  for (const mp of MAPS) if (MOB[mp.boss] && !seen.has(mp.boss)){ seen.add(mp.boss); boss.push(['b_' + mp.boss, () => nm(MOB[mp.boss])]); }
  for (const D of DUNGEONS) boss.push(['dg_' + D.id, () => `${nm(MOB[MAPS[D.base].boss])} · ${nm(D)}`]);
  boss.push(['wb', () => L('ราหูอสูรจันทรคราส (บอสโลก)', 'Rahu, the Eclipse Asura (world boss)')]);
  return (FAME_IX = {disc, boss, mile:FAME_MILE.map(M => [M[0], () => L(M[1], M[2])])});
}
/* the readable name of a record id */
function fameWhat(id){
  const [kind, ...r] = id.split('_'), key = r.join('_'), ix = fameIx();
  const e = (kind === 'disc' ? ix.disc : kind === 'mile' ? ix.mile : ix.boss).find(x => x[0] === key);
  return e ? e[1]() : key;
}
/* a record read from the database or a room event: untrusted, cleaned and clamped */
function fameSane(d){
  if (!d || typeof d !== 'object' || !Array.isArray(d.names) || !d.names.length) return null;
  const names = d.names.slice(0, 12).map(x => clean(x, 18) || '?'), uids = Array.isArray(d.uids) ? d.uids.slice(0, 12).map(x => clean(x, 64)) : [];
  const num = (v, a, b) => (Number.isFinite(+v) && v !== null && +v > 0 ? clamp(Math.round(+v), a, b) : null);
  const p = d.prev && typeof d.prev === 'object' && Array.isArray(d.prev.names) ? {names:d.prev.names.slice(0, 12).map(x => clean(x, 18) || '?'), t:num(d.prev.t, 1000, 864e5), at:num(d.prev.at, 1, 1e14) || 0} : null;
  return {names, uids, party:!!d.party, t:num(d.t, 1000, 864e5), at:num(d.at, 1, 1e14) || 0, lv:clamp(d.lv | 0, 0, 999), ...(p ? {prev:p} : {})};
}
/* who gets the credit: 'solo' you alone · 'map' you + party members on this map · 'party' you + the whole party */
function fameCrew(mode){
  const out = [{n:netName(), u:NET.uid || ''}], seen = new Set([out[0].u]);
  if (mode !== 'solo' && NET.room && NET.party && typeof partyMembers === 'function') for (const p of partyMembers()){
    const q = p.presence || {}, u = clean(p.by, 64); if (p.isMe || !u || seen.has(u) || (mode === 'map' && q.m !== MAP_ID)) continue;
    seen.add(u); out.push({n:clean(q.n, 18) || '?', u}); if (out.length >= 12) break; }
  return out;
}

/* ---------- writing a record (first-come, or faster-wins) ---------- */
async function fameClaim(id, mk){   // mk(current) → the doc to write, or null when the current record stands
  const db = NET.db, ref = db.doc(`fame/${id}`);
  if (typeof db.runTransaction === 'function') return db.runTransaction(async tx => { const s = await tx.get(ref), d = mk(s.exists ? fameSane(s.data()) : null); if (d) tx.set(ref, d); return d; });   // Firebase
  let lk = null;
  if (typeof ref.acquire === 'function') for (let i = 0; i < 3; i++){ lk = await ref.acquire({holder:`${NET.uid}${FM.tag}`, ttlMs:5000}).catch(() => null); if (!lk || lk.acquired) break; await fmWait(700 + Math.random() * 600); }
  if (lk && !lk.acquired) return null;   // someone else is mid-claim: theirs comes first
  const s = await ref.get(), d = mk(s.exists ? fameSane(s.data()) : null); if (!d) return null;
  await ref.set(d);
  if (!lk || !lk.acquired){ await fmWait(500); const s2 = await ref.get(), c = s2.exists ? fameSane(s2.data()) : null; if (!c || c.at !== d.at || c.uids[0] !== d.uids[0]) return null; }   // no lease: re-check
  return d;
}
async function fameRecord(rid, o = {}){
  if (!FAME_RE.test(rid) || !S || !S.lvl) return; const F = fmS(), spd = rid.startsWith('spd_'), now = Date.now(), mine = F.mine[rid];
  if (spd && !(o.t >= 1000)) return;
  // a personal record, online or not
  if (spd){ if (!mine || o.t < mine.t){ F.mine[rid] = {t:o.t, at:now}; if (mine) toast(L(`สถิติส่วนตัวใหม่! ${fameWhat(rid)} ${fmTime(o.t)}`, `Personal best! ${fameWhat(rid)} ${fmTime(o.t)}`)); } }
  else if (!mine) F.mine[rid] = {at:now, ...(o.t ? {t:o.t} : {})};
  dirty = true;
  if (!NET.db || !NET.uid) return;
  const cur = FM.recs[rid]; if (cur && (!spd || cur.t <= o.t)) return; if (FM.busy[rid]){ (FM.pend = FM.pend || {})[rid] = o; return; } FM.busy[rid] = 1;   // a claim in flight: try this one right after it
  const crew = fameCrew(o.crew || 'solo'), base = {names:crew.map(c => c.n), uids:crew.map(c => c.u), party:crew.length > 1, at:now, lv:clamp(S.lvl | 0, 1, 999), ...(o.t ? {t:Math.round(o.t)} : {})};
  try {
    const d = await fameClaim(rid, c => (spd ? (c && c.t && c.t <= o.t ? null : {...base, ...(c ? {prev:{names:c.names, t:c.t, at:c.at}} : {})}) : (c ? null : base)));
    if (d){ const rec = fameSane(d); FM.recs[rid] = rec; fameAnnounce(rid, rec); FM.syncNeed = true; fameReWiki();
      if (NET.room) try { NET.room.emit('fame', {k:'rec', id:rid, at:d.at, n:d.names, t:d.t || null, pt:d.party}).catch(() => {}); } catch (e) {} }
  } catch (e) {} finally { delete FM.busy[rid]; const p = FM.pend && FM.pend[rid]; if (p){ delete FM.pend[rid]; setTimeout(() => fameRecord(rid, p), 0); } }
}

/* ---------- announcing ---------- */
function fameLine(id, r){
  const who = r.names.join(', ') + (r.party ? L(' (ปาร์ตี้)', ' (party)') : ''), what = fameWhat(id), k = id.split('_')[0];
  if (k === 'disc') return [`🧭 ${L(`${who} ค้นพบ ${what} เป็นคนแรกของเซิร์ฟเวอร์!`, `${who}: first on the server to discover ${what}!`)}`];
  if (k === 'clr') return [`♛ ${L(`${who} ปราบ ${what} ได้เป็นคนแรกของเซิร์ฟเวอร์!`, `${who}: first on the server to defeat ${what}!`)}`];
  if (k === 'spd') return [`⏱ ${L(`สถิติใหม่! ${who} ปราบ ${what} ใน ${fmTime(r.t)}`, `New record! ${who} defeated ${what} in ${fmTime(r.t)}`)}${r.prev ? L(` (เดิม ${fmTime(r.prev.t)})`, ` (was ${fmTime(r.prev.t)})`) : ''}`];
  return [`★ ${L(`${who} เป็นคนแรกของเซิร์ฟเวอร์ที่${what}!`, `${who}: first on the server to ${what}!`)}`];
}
function fameAnnounce(id, r){
  if (!r) return; const key = `${id}@${r.at}`; if (FM.shown.has(key)) return; FM.shown.add(key);
  const [txt] = fameLine(id, r);
  banner(`<b class="fmban">${L('หอเกียรติยศ', 'Hall of Fame')}</b> ${escH(txt)}`); log(escH(txt), 'g'); SFX.play('ach');
  if (typeof NET !== 'undefined'){ NET.chat.push({ch:'sys', who:'', text:`🏆 ${txt}`, at:Date.now()}); if (NET.chat.length > NET_MAX_CHAT) NET.chat.shift(); if (typeof renderChat === 'function') renderChat(); }
}
/* a room nudge: re-read the record before showing or rewarding it */
async function onFame(msg){
  const d = msg.data || {}; if (msg.isMe || d.k !== 'rec' || typeof d.id !== 'string' || !FAME_RE.test(d.id)) return;
  if (!NET.db){ const r = fameSane({names:d.n, uids:[], party:d.pt, t:d.t, at:d.at}); if (r) fameAnnounce(d.id, r); return; }   // shown, never rewarded
  try { const s = await NET.db.doc(`fame/${d.id}`).get(), r = s.exists ? fameSane(s.data()) : null; if (!r || r.at !== +d.at) return;
    FM.recs[d.id] = r; fameAnnounce(d.id, r); FM.syncNeed = true; fameReWiki(); } catch (e) {}
}
EV.on('netready', () => {
  if (NET.room) try { NET.room.on('fame', onFame, () => {}); } catch (e) {}   // a refused topic only loses the instant nudge
  if (NET.db && !FM.unsub) try {
    FM.unsub = NET.db.collection('fame').onSnapshot(s => {
      const first = !FM.loaded, recs = {}; FM.loaded = true;
      for (const d of s.docs){ if (!FAME_RE.test(d.id)) continue; const r = fameSane(d.data()); if (r) recs[d.id] = r; }
      if (!first) for (const id in recs){ const r = recs[id], o = FM.recs[id]; if ((!o || o.at !== r.at) && r.at > FM.t0 - 6e4) fameAnnounce(id, r); }
      FM.recs = recs; FM.syncNeed = true; fameReWiki();
    }, () => {});
  } catch (e) {}
});

/* ---------- rewards: every credited character, once per record ---------- */
const FAME_TITLES = {fm_disc:['ผู้ค้นพบคนแรก', 'First Discoverer'], fm_clr:['ผู้พิชิตคนแรก', 'First Conqueror'], fm_spd:['เจ้าแห่งความเร็ว', 'Swiftest Blade'],
  fm_mile:['ผู้นำแห่งยุค', 'Trailblazer'], fm_story:['ผู้กอบกู้วายราคนแรก', 'First Savior of Vayra']};
for (const k in FAME_TITLES) ACH_BY[k] = {id:k, cat:'fame', tier:3, th:'หอเกียรติยศ', en:'Hall of Fame', title:FAME_TITLES[k], coin:0};
const FAME_RW = {disc:{c:10, z:5000, t:'fm_disc'}, clr:{c:20, z:20000, t:'fm_clr'}, spd:{c:15, z:10000, t:'fm_spd'}, mile:{c:30, z:30000, t:'fm_mile'}};
const FAME_EXTRA = {mile_story:{t:'fm_story', cos:'c_starlight'}, clr_wb:{cos:'hc_mala'}};
function fameSync(){
  if (!fmPlaying() || !NET.uid) return; const F = fmS(), me = netName();
  for (const id in FM.recs){ const r = FM.recs[id], i = r ? r.uids.indexOf(NET.uid) : -1; if (i < 0 || r.names[i] !== clean(me, 18) || F.got[id] === r.at) continue; F.got[id] = r.at; fameGrant(id, r); }
}
function fameGrant(id, r){
  const F = fmS(), R = FAME_RW[id.split('_')[0]], X = FAME_EXTRA[id] || {}, tid = X.t || R.t, newT = !F.titles[tid];
  S.bia += R.z; coinAdd(R.c, L('หอเกียรติยศ', 'Hall of Fame')); F.titles[tid] = F.titles[tid] || Date.now(); if (!S.title) S.title = tid;
  if (X.cos && typeof cosGrant === 'function' && !cosGrant(X.cos)) coinAdd(10, L('ชุดซ้ำ', 'duplicate costume'));
  log(L(`รางวัลหอเกียรติยศ: ${fameWhat(id)} · +${fmtN(R.z)} เบี้ย${newT ? ` · ฉายา «${FAME_TITLES[tid][0]}»` : ''}`, `Hall of Fame reward: ${fameWhat(id)} · +${fmtN(R.z)} Bia${newT ? ` · title «${FAME_TITLES[tid][1]}»` : ''}`), 'g');
  toast(L(`🏆 รางวัลหอเกียรติยศ · ◈ ${R.c}`, `🏆 Hall of Fame reward · ◈ ${R.c}`)); SFX.play('ach'); dirty = true; save(); if (typeof NET !== 'undefined') NET.presT = 0; reWin('ach');
}

/* ---------- what triggers a record ---------- */
/* a boss's clock: from the first damage it takes (only when this game saw it at full HP) */
EV.on('tick', dt => {
  for (const m of mobs){ if (m.dead || !m.def || !m.def.boss || m.minion) continue;
    if (!m.fmSeen){ m.fmSeen = 1; m.fmFull = m.hp >= m.maxhp * .97; } if (!m.fmT0 && m.hp < m.maxhp) m.fmT0 = Date.now(); }
  if (FM.syncNeed && (FM.syncT -= dt) <= 0){ FM.syncT = 1; if (fmPlaying()){ FM.syncNeed = false; fameSync(); } }
  if ((FM.mileT -= dt) <= 0){ FM.mileT = 5; fameMile(); }
});
function fameBossKey(m){
  if (!m || !m.def || !m.def.boss || m.minion || m.dummy) return null;
  if (m.wb) return 'wb'; if (m.dg) return DG.did ? 'dg_' + DG.did : null;
  return MAPS.some(mp => mp.boss === m.type) ? 'b_' + m.type : null;
}
EV.on('kill', m => {
  const k = fameBossKey(m); if (!k) return; const t = m.fmT0 && m.fmFull ? Math.round(Date.now() - m.fmT0) : 0, ok = t >= 1000 && t <= 36e5;
  fameRecord('clr_' + k, {crew:'map', t:ok ? t : null}); if (ok) fameRecord('spd_' + k, {crew:'map', t});
});
EV.on('map', id => { if (!(typeof DG !== 'undefined' && DG.active) && MAPS[id] && id >= FAME_SPECIAL_MAP) fameRecord('disc_map_' + id, {crew:'map'}); });
if (typeof dgEnter === 'function'){ const _dge = dgEnter; dgEnter = function(did, ...a){ const r = _dge(did, ...a); if (DG.active && DG.did === did) fameRecord('disc_dg_' + did, {crew:'party'}); return r; }; }
function fameMile(){
  if (!fmPlaying()) return; const F = fmS(), on = NET.db && NET.uid && FM.loaded;
  for (const M of FAME_MILE){ const rid = 'mile_' + M[0]; let ok = false; try { ok = M[3](); } catch (e) {} if (!ok) continue;
    if (!F.mine[rid]){ F.mine[rid] = {at:Date.now()}; dirty = true; }
    if (on && !F.tried[rid]){ F.tried[rid] = 1; if (!FM.recs[rid]) fameRecord(rid, {}); } }
}
['level', 'job', 'map', 'chapter', 'side', 'refine', 'wboss', 'netready'].forEach(n => EV.on(n, () => { FM.mileT = Math.min(FM.mileT, .5); }));

/* ---------- the wiki tab ---------- */
GLYPH.crown = '<path d="M7 29l-2-15 8 6 7-11 7 11 8-6-2 15z"/><path d="M8 33h24"/>';
WIKI_TABS.push(['fame', 'หอเกียรติยศ', 'Hall of Fame', 'crown']);
const FAME_CATS = [['clr', '♛ ปราบบอสคนแรก', '♛ First clears'], ['spd', '⏱ สถิติเวลา', '⏱ Speed records'], ['disc', '🧭 ค้นพบคนแรก', '🧭 First discoveries'], ['mile', '★ ทำได้คนแรก', '★ Firsts'], ['me', '◆ สถิติของฉัน', '◆ My records']];
function fameReWiki(){ if (typeof winOpen === 'function' && winOpen('wiki') && WIKI.tab === 'fame' && document.activeElement !== el('wkQ')) renderWiki(); }
function fameWho(r){
  return `${r.names.map((n, i) => `<span class="fmn${NET.uid && r.uids[i] === NET.uid ? ' me' : ''}">${escH(n)}</span>`).join(', ')}${r.party ? ` <span class="fmpt">${L('ปาร์ตี้', 'party')}</span>` : ''}`;
}
function famePage(cat){
  const ix = fameIx(), none = `<span class="fmnone">— ${L('ยังไม่มีใคร', 'unclaimed')} —</span>`, F = fmS(), off = !NET.db;
  const note = off ? `<p class="hint">${L('ตอนนี้ออฟไลน์: หอเกียรติยศของเซิร์ฟเวอร์ดูได้เมื่อเล่นออนไลน์ · ด้านล่างคือสถิติส่วนตัวของคุณ', 'Offline: the server\'s Hall of Fame shows when you play online · below are your personal records')}</p>` : '';
  if (cat === 'me'){
    const rows = Object.keys(F.mine).filter(id => FAME_RE.test(id)).sort((a, b) => F.mine[b].at - F.mine[a].at);
    const ts = Object.keys(F.titles).filter(k => FAME_TITLES[k]);
    return `<h3>${L('สถิติของฉัน', 'My records')}</h3>${note}<p>${L('ฉายาหอเกียรติยศ', 'Hall of Fame titles')}: ${ts.map(k => `<span class="wchip" style="color:${ACH_TIER[3].c}">«${L(...FAME_TITLES[k])}»</span>`).join(' ') || '—'}</p>
      <table class="wkt fmt"><tr><th>${L('รายการ', 'Record')}</th><th>${L('เวลา', 'Time')}</th><th>${L('วันที่', 'Date')}</th><th>${L('ของเซิร์ฟเวอร์', 'Server')}</th></tr>
      ${rows.map(id => { const m = F.mine[id], r = FM.recs[id], held = r && NET.uid && r.uids.includes(NET.uid);
        return `<tr class="${held ? 'me' : ''}"><td>${escH(fameWhat(id))}<small class="fmk">${L(...FAME_CATS.find(c => c[0] === id.split('_')[0]).slice(1))}</small></td><td>${m.t ? fmTime(m.t) : '—'}</td><td>${fmDate(m.at)}</td><td>${held ? '🏆' : r ? (r.t ? fmTime(r.t) : '✓') : off ? '' : '—'}</td></tr>`; }).join('') || `<tr><td colspan="4">${L('ยังไม่มี · ปราบบอส ค้นพบดินแดน หรือทำเป้าหมายให้สำเร็จ', 'Nothing yet · defeat bosses, discover places, reach milestones')}</td></tr>`}</table>`;
  }
  const list = cat === 'disc' ? ix.disc : cat === 'mile' ? ix.mile : ix.boss, spd = cat === 'spd';
  const head = `<h3>${L(...FAME_CATS.find(c => c[0] === cat).slice(1))}</h3>${note}<p class="hint">${spd ? L('เวลาตั้งแต่บอสโดนตีครั้งแรกจนตาย · ทำลายสถิติได้เรื่อย ๆ · ทั้งปาร์ตี้ได้ชื่อและรางวัล', 'Time from the boss\'s first wound to its death · records can be beaten · the whole party is named and rewarded') : L('คนแรกของเซิร์ฟเวอร์ถูกบันทึกตลอดไป · ทำเป็นปาร์ตี้ได้ชื่อทั้งปาร์ตี้ · ทุกคนได้เหรียญวายรา เงิน และฉายา', 'The first on the server is recorded for good · done as a party, the whole party is named · everyone gets Vayra Coins, Bia and a title')}</p>`;
  return head + `<table class="wkt fmt"><tr><th>${cat === 'mile' ? L('เป้าหมาย', 'Milestone') : cat === 'disc' ? L('สถานที่', 'Place') : L('บอส', 'Boss')}</th>${spd ? `<th>${L('เวลา', 'Time')}</th>` : ''}<th>${L('ผู้ทำได้', 'Holders')}</th><th>${L('วันที่', 'Date')}</th></tr>
    ${list.map(([key, name]) => { const id = `${cat}_${key}`, r = FM.recs[id], me = r && NET.uid && r.uids.includes(NET.uid);
      return `<tr class="${me ? 'me' : ''}"><td>${escH(name())}</td>${spd ? `<td class="fmtime">${r && r.t ? fmTime(r.t) : '—'}</td>` : ''}<td>${r ? fameWho(r) : none}${spd && r && r.prev ? `<small class="fmprev">${L('สถิติเดิม', 'Former')}: ${r.prev.names.map(escH).join(', ')} · ${r.prev.t ? fmTime(r.prev.t) : ''}</small>` : ''}</td><td>${r ? fmDate(r.at) : ''}</td></tr>`; }).join('')}</table>`;
}
{ const _wl = wikiList, _wp = wikiPage;
  wikiList = function(){
    if (WIKI.tab !== 'fame') return _wl(); const q = WIKI.q.trim().toLowerCase();
    return FAME_CATS.filter(c => !q || (c[1] + c[2]).toLowerCase().includes(q)).map(([k, th, en]) => { const n = k === 'me' ? Object.keys(fmS().mine).length : Object.keys(FM.recs).filter(id => id.startsWith(k + '_')).length;
      return {id:k, h:`<span class="wkic">${tabIcon('crown')}</span><span class="wn"><b>${L(th, en)}</b><small>${n} ${L('รายการ', 'records')}</small></span>`}; });
  };
  wikiPage = function(){ return WIKI.tab === 'fame' ? (WIKI.sel == null ? '' : famePage(WIKI.sel)) : _wp(); };
}
WIKI_SYS.push({id:'fame', t:['หอเกียรติยศ', 'Hall of Fame'], b:() => L(
  `<p>สมุดบันทึกของทั้งเซิร์ฟเวอร์ (แท็บ <b>หอเกียรติยศ</b>): <b>ค้นพบคนแรก</b> (ดันเจี้ยนปาร์ตี้ และดินแดนตั้งแต่เมืองลับแลขึ้นไป) · <b>ปราบบอสคนแรก</b> (บอสทุกแคว้น ผู้พิทักษ์ดันเจี้ยน ราหู) · <b>สถิติเวลา</b>ปราบบอสเร็วที่สุด · <b>ทำได้คนแรก</b> (Lv 50/99/150/200/300 อาชีพขั้น 3 ครบทุกแคว้น จบเนื้อเรื่อง ไอเทมตำนาน +15 ความสำเร็จครบหมวด)</p>
   <ul><li>ทำเป็นปาร์ตี้ ทุกคนในปาร์ตี้ (ที่อยู่แผนที่เดียวกันตอนบอสตาย) ได้ชื่อและรางวัล</li><li>ประกาศทั้งเซิร์ฟเวอร์ทันที · เปิดเกมทีหลังก็เห็นในวิกิ</li>
   <li>รางวัล: ค้นพบ ◈10 + 5,000 เบี้ย · ปราบคนแรก ◈20 + 20,000 · สถิติเวลา ◈15 + 10,000 · ทำได้คนแรก ◈30 + 30,000 · พร้อมฉายาหอเกียรติยศ (เก็บไว้ตลอดแม้สถิติถูกทำลาย) · จบเนื้อเรื่องคนแรกได้ชุดเทพธิดาดวงดาว · ปราบราหูคนแรกได้มาลาทองศึก</li><li>ออฟไลน์: เก็บเป็นสถิติส่วนตัว</li></ul>`,
  `<p>The server's record book (the <b>Hall of Fame</b> tab): <b>first discoveries</b> (party dungeons and every region from the Hidden City of Laplae on) · <b>first clears</b> (every region boss, dungeon guardian and Rahu) · the <b>fastest kill</b> of each boss · <b>firsts</b> (Lv 50/99/150/200/300, 3rd class, every region, the main story, a Legendary item, +15, every achievement of a category)</p>
   <ul><li>Done as a party, everyone in the party (on the boss's map when it falls) is named and rewarded</li><li>Announced to the whole server at once · players who log in later see it in the wiki</li>
   <li>Rewards: discovery ◈10 + 5,000 Bia · first clear ◈20 + 20,000 · speed record ◈15 + 10,000 · milestone ◈30 + 30,000 · plus a Hall of Fame title (kept even after a record is beaten) · first to finish the story gets the Starlight Celestial costume · first to fell Rahu the Golden War Mala</li><li>Offline: kept as personal records</li></ul>`)});
{ const st = document.createElement('style');
  st.textContent = `.fmt td{vertical-align:top}.fmt tr.me td{background:rgba(255,215,106,.13)}.fmn.me{color:#ffe08a;font-weight:800}.fmnone{opacity:.45}.fmpt{display:inline-block;padding:0 5px;border-radius:6px;background:rgba(120,230,170,.18);color:#9ff0c8;font-size:10px}
    .fmprev,.fmk{display:block;opacity:.65;font-size:10px}.fmtime{color:#ffe08a;font-variant-numeric:tabular-nums}.fmban{color:#ff9cf0;margin-right:4px}`;
  document.head.appendChild(st); }
