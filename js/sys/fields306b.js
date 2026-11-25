/* VAYRATHEN — js/sys/fields306b.js — (v306) no monsters in town (the second half of js/world/fields306.js)
   · Aren spawns nothing and has no boss clock;
   · the tutorial: before «attack», a step that leads out of the east gate to the Suwannin Fields (a gold arrow over the
     gate, «take me there» walks you); steps that need an NPC lead back through the west gate when you are in the fields;
   · Auto switched on inside Aren walks out to the fields instead of standing in town;
   · an old save in the middle of the first story chapter keeps it (the chapter now belongs to the new map). */
'use strict';
{ const _ss = setupSpawns; setupSpawns = function(id){ if (id === 0){ bossTimer = 1e12; return; }
    if (typeof FIELDS306 !== 'undefined' && id === FIELDS306.id){ f306Spawns(); bossTimer = bossFirst(); return; }
    return _ss.apply(this, arguments); }; }
/* (v320) the fields keep Aren's old order of danger. A new hero on Auto died about every 30 s here: every kind of monster
   was spread over the whole map, so Lv 9 boars and Lv 13 lanterns (which attack on sight) stood right by the gate a
   Lv 1 hero comes in by. As in Aren before v306: the weak ones by the west gate (from Aren), the middle ones in the
   middle, boars to the east, and the lanterns only at night, far east */
const F306Z = () => [{x0:180, y0:140, x1:1750, y1:H - 120}, {x0:1650, y0:140, x1:3450, y1:H - 120}, {x0:3350, y0:140, x1:W - 180, y1:H - 120}];
function f306Spawns(){ const [a, b, c] = F306Z();
  addSlots('dewblob', 16, a); addSlots('hare', 10, a); addSlots('kobna', 8, a);
  addSlots('hare', 6, b); addSlots('kaipa', 10, b); addSlots('kobna', 4, b);
  addSlots('boar', 12, c); addSlots('kaipa', 4, c); addSlots('lantern', 10, c, true); }
/* Auto roams the part of the fields that suits its level */
/* (v347) at night the Lv 13 lanterns (they attack on sight) wake in the east part from x 3350, and the middle part reached
   3450: a Lv 8 hero on Auto was killed there by two of them (tools/first-play.js, LONG=1). At night the middle part ends
   500 px short of them. */
const f306Zone = () => { if (typeof FIELDS306 === 'undefined' || MAP_ID !== FIELDS306.id) return null; const z = F306Z(), i = S.lvl < 6 ? 0 : S.lvl < 10 ? 1 : 2;
  return i >= 1 && S.lvl < 14 && typeof isNight === 'function' && isNight() ? {...z[1], x1:z[2].x0 - 500} : z[i]; };   // up to Lv 13 (the lanterns' own level) at night
{ const _br = bossRecall; bossRecall = function(id){ if (id === 0){ bossTimer = 1e12; return; } return _br.apply(this, arguments); }; }
const f306Gate = to => (typeof GATES !== 'undefined' ? GATES.find(g => g.to === to) : null);
function f306Fix(){ if (typeof S === 'undefined' || !S || S._f306) return; const o = S.ms;
  if (o && typeof o === 'object'){ if (o.done && o.done[0]){ o.done[FIELDS306.id] = o.done[0]; delete o.done[0]; } if (o.cur && o.cur.map === 0) o.cur.map = FIELDS306.id; }
  S._f306 = 1; }
if (typeof EV !== 'undefined'){ EV.on('map', () => { try { f306Fix(); } catch (e) {} }); }
/* the tutorial */
if (typeof TUT !== 'undefined'){ const i = TUT.findIndex(s => s.arrow === 'mob');
  if (i >= 0 && !TUT.some(s => s.f306)) TUT.splice(i, 0, {f306:1, t:['ออกไปทุ่งสุวรรณิน', 'Out to the Suwannin Fields'], arrow:'gate306', go:'fields306', done:() => MAP_ID === FIELDS306.id,
    d:['ในเมืองไม่มีมอนสเตอร์ · เดินออกประตูทิศตะวันออก (ลูกศรสีทองชี้อยู่) ไปทุ่งสุวรรณิน หรือกด «พาไป»', 'There are no monsters in town · walk out of the east gate (the gold arrow points at it) to the Suwannin Fields, or press «Take me there»']}); }
document.addEventListener('click', e => { const g = e.target.closest && e.target.closest('[data-tutgo]'); if (!g || typeof tutOn !== 'function' || !tutOn()) return;
  const want = g.dataset.tutgo === 'fields306' ? (MAP_ID === 0 ? FIELDS306.id : null) : (MAP_ID === FIELDS306.id ? 0 : null); if (want == null) return;
  const gt = f306Gate(want); if (!gt) return; e.stopPropagation(); if (want === 0 && typeof TUTGO !== 'undefined') TUTGO.id = g.dataset.tutgo;   /* (v346) once in Aren, on to the NPC (tutorial.js) */
  P.npc = null; P.target = null; P.cast = null; P.tx = gt.x; P.ty = gt.y; }, true);
if (typeof EV !== 'undefined') EV.on('draw', () => { const st = typeof tutOn === 'function' && tutOn(); if (!st || PAUSED) return;
  const gt = st.arrow === 'gate306' && MAP_ID === 0 ? f306Gate(FIELDS306.id) : st.arrow === 'npc' && MAP_ID === FIELDS306.id ? f306Gate(0) : null; if (!gt) return;
  const x = clamp(sx(gt.x), 40, SW - 40), y = clamp(sy(gt.y - 60), 70, SH - 60) - Math.abs(Math.sin(T * 4)) * 10, z = clamp(PX / 2, .5, 2.6);
  ctx.save(); ctx.fillStyle = '#ffd76a'; ctx.strokeStyle = '#3a1a04'; ctx.lineWidth = 2.5 * z; ctx.shadowColor = 'rgba(255,200,80,.9)'; ctx.shadowBlur = 12 * z;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10 * z, y - 12 * z); ctx.lineTo(x - 4 * z, y - 12 * z); ctx.lineTo(x - 4 * z, y - 24 * z); ctx.lineTo(x + 4 * z, y - 24 * z); ctx.lineTo(x + 4 * z, y - 12 * z); ctx.lineTo(x + 10 * z, y - 12 * z); ctx.closePath();
  ctx.stroke(); ctx.fill(); ctx.restore(); });
/* Auto switched on in Aren: there is nothing to hunt in town, so it walks out of the east gate to the Suwannin Fields
   (Auto never uses a gate by itself — js/sys/botgate.js — so this one walk is led from here) */
{ const _ub = updBot; let said = 0;
  updBot = function(dt){ const r = _ub.apply(this, arguments);
    if (BOT.on && MAP_ID === 0 && !(BOT.pause > 0) && !P.dead && !BOT.resting && BOT.state !== 'rest' &&   /* (v347) not while it rests to heal in town (bot.js) */ !(typeof DG !== 'undefined' && DG.active) && !(typeof S !== 'undefined' && S.aq) && typeof FIELDS306 !== 'undefined'){ const gt = f306Gate(FIELDS306.id);
      if (gt){ if (T - said > 20){ said = T; toast(L('ในเมืองไม่มีมอนสเตอร์ · Auto พาออกไปทุ่งสุวรรณิน', 'No monsters in town · Auto is heading out to the Suwannin Fields')); }
        P.target = null; P.pending = null; BOT.roam = null; P.tx = gt.x; P.ty = gt.y; BOT.state = 'roam';
        if (Math.hypot(gt.x - P.x, gt.y - P.y) < 70) travel(FIELDS306.id, 0); } }
    return r; }; }
