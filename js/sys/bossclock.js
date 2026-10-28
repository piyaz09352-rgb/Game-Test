/* VAYRATHEN — js/sys/bossclock.js — region bosses follow the world clock
   · v20b: a region boss comes back 15 minutes (real time) after it dies. Never killed, or its 15 minutes are up: it
     is there the moment you walk into the map. Leaving the map, pausing or closing the game does not stop the clock.
   · Online the kill time comes from the shared MVP board (mvp/<bossId>.at), so every player sees the same clock.
   · A map with no kill on record yet: the boss appears at the next quarter hour of the world clock (:00 :15 :30 :45).
   · A boss you left alive is still there (with the HP it had) — maps.js keeps that part.
   · (v58) Every player now sees the same boss: the world clock is cut into 15-minute rounds (:00 :15 :30 :45) and
     each round has one boss, named after its round. It is up from the start of its round until someone kills it; then
     the next one comes at the start of the next round. The kill time no longer moves the schedule (it used to, and a
     player who had not heard of a kill, or whose own clock was off, got a different boss at a different time). */
'use strict';

const BCK = {gap:15 * 60e3, kill:{}, prev:null, prevMap:-1};
/* (v137) the kill times are kept on this device too: a boss killed this round stays down after you close the game and
   come back (before, the record lived only in memory, so a reload brought this round's boss back) */
try { const k = JSON.parse(localStorage.getItem('vay-bck') || '{}'); if (k && typeof k === 'object') for (const [m, t] of Object.entries(k)) if (+t > 0) BCK.kill[m] = +t; } catch (e) {}
BCK.saved = {...BCK.kill};
function bckNote(map, t){ if (!(t > (BCK.kill[map] || 0))) return; BCK.kill[map] = t; BCK.saved[map] = t; bckSave(); }
function bckSave(){
  try { const keep = {}, old = Date.now() - 6 * 3600e3; for (const [m, v] of Object.entries(BCK.kill)) if (v > old) keep[m] = v; localStorage.setItem('vay-bck', JSON.stringify(keep)); } catch (e) {} }
BOSS_GAP[0] = BOSS_GAP[1] = 15 * 60;                       // fallback for any code that still reads the old timer
const bckSlot = now => Math.ceil(now / BCK.gap) * BCK.gap;   // next :00 / :15 / :30 / :45
const bckCyc = now => Math.floor(now / BCK.gap) * BCK.gap;   // start of this round
/* the last kill we know of, from our own game or the shared MVP board */
function bckKillAt(map){ const id = MAPS[map] && MAPS[map].boss, r = typeof MVP !== 'undefined' && id ? MVP.recs[id] : null;
  return Math.max(BCK.kill[map] || 0, r && r.at && !r.up ? r.at : 0); }
/* (v166) a boss that has just died never comes straight back: the next one waits for the first quarter-hour mark that is
   at least BCK.rest (10 min) after the kill. It still follows the world clock (:00 :15 :30 :45) and the shared kill time,
   so every player sees it at the same moment, but a kill at :44 no longer brings a new boss at :45 (it comes at :00). */
BCK.rest = 10 * 60e3;
const bckNext = map => { const k = bckKillAt(map); return k ? bckSlot(k + BCK.rest) : 0; };
const bckKilled = (map, now) => (now == null ? wNow() : now) < bckNext(map);   // the last boss is down and its rest is not over
function bckDue(map){ const now = wNow(); return bckKilled(map, now) ? bckNext(map) : now; }
const bckSkip = () => typeof bossTimer === 'undefined' || bossTimer >= 1e8 || (typeof DG !== 'undefined' && DG.active) || (typeof BOSS_RESTORE !== 'undefined' && BOSS_RESTORE && T < BOSS_RESTORE.until);
EV.on('tick', () => {
  if (typeof boss === 'undefined') return;
  // the boss we saw is gone and dead: it fell just now
  const world = typeof nmWorld === 'function' && nmWorld();   // world clock mode: the kill time comes with the kill event (netmob.js), the same for everyone
  if (!world && BCK.prev && !boss && BCK.prevMap === MAP_ID && BCK.prev.dead && !BCK.prev.wb && !BCK.prev.dg) bckNote(MAP_ID, wNow());
  // world clock: this round's boss is known dead (killed here, or by another player) → keep that on this device too
  // (a stamp everyone computes alike: the start of this round, so two players never record different kill times)
  if (world && typeof NM !== 'undefined' && NM.deadX && NM.deadX.has(`wB${MAP_ID}.r${Math.floor(wNow() / BCK.gap)}`) && !bckKilled(MAP_ID)) bckNote(MAP_ID, bckCyc(wNow()) + 1);
  // whatever set the kill time (our kill, the shared board, the kill event) is kept on this device too
  for (const m in BCK.kill) if (BCK.kill[m] !== BCK.saved[m]) { BCK.saved[m] = BCK.kill[m]; bckSave(); break; }
  BCK.prev = boss && !boss.wb ? boss : null; BCK.prevMap = MAP_ID;
  if (boss){ BCK.forced = false; BCK.last = null; return; }
  if (bckSkip()) return;
  // a GM / test that pulls the timer down ("bring it now") is obeyed until that boss appears
  if (BCK.last != null ? bossTimer < BCK.last - .5 : bossTimer <= 1) BCK.forced = true;
  if (BCK.forced) return;
  bossTimer = BCK.last = Math.max(0, (bckDue(MAP_ID) - wNow()) / 1000);
});
EV.on('map', () => { BCK.prev = null; BCK.prevMap = -1; BCK.forced = false; BCK.last = null; });
EV.on('kill', m => { if (typeof nmWorld === 'function' && nmWorld()) return; if (m && m.def && m.def.boss && !m.minion && !m.wb && !m.dg && MAPS[MAP_ID] && MAPS[MAP_ID].boss === m.type) bckNote(MAP_ID, wNow()); });   // world clock: the shared kill time comes with the kill event (netmob.js)

/* the boss line in the quest tracker: how long until the next one */
function bossClockText(){
  if (typeof boss === 'undefined' || boss || bckSkip()) return '';
  const s = Math.max(0, Math.ceil((bckDue(MAP_ID) - wNow()) / 1000)), d = new Date(bckDue(MAP_ID));
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return L(`♛ บอสเกิดใน ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} (เวลา ${hm})`, `♛ Boss in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} (at ${hm})`);
}
