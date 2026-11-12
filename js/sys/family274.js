/* VAYRATHEN — js/sys/family274.js — (v274) pack leaders live with their families
   The owner first asked for animals that live together, then (too many families) for families round the pack leaders only:
   every ★ pack leader (elite) that turns up on a hunting map brings its family —
   · sometimes its mate (father or mother): a little bigger, HP ×1.5–1.6, hits ×1.25–1.3, EXP and drops a little better;
   · one or two young: small, HP ×0.45, hits ×0.55, less EXP — they keep close to the leader and follow it about.
   Hit any one of them and the whole family turns on you. Their names say who they are (✦ พ่อ / แม่ / ลูก).
   Never in a dungeon, the tower, an invasion, a festival or a story fight; families are made by whoever spawns the
   map's monsters (the room's host online). */
'use strict';
const FAM = {n:0, making:false, mate:.5};
const FAM_ROLE = {father:{th:'พ่อ', en:'Father', hp:1.6, atk:1.3, exp:1.6, sz:1.18}, mother:{th:'แม่', en:'Mother', hp:1.5, atk:1.25, exp:1.5, sz:1.12},
  young:{th:'ลูก', en:'Young', hp:.45, atk:.55, exp:.4, sz:.72}};
const famOk = m => m && !m.dead && m.def && !m.def.boss && !m.wb && !m.dg && !m.tw && !m.inv && !m.evb && !m.tagTxt && !m.fam && m.zone && !FAM.making
  && MAP_ID > 0 && !(typeof DG !== 'undefined' && DG.active) && !(typeof TW !== 'undefined' && TW.active) && !(typeof isTown === 'function' && isTown(MAP_ID)) && !(typeof nmSlave === 'function' && nmSlave())
  && !(typeof INV !== 'undefined' && INV.key && typeof invMap === 'function' && MAP_ID === invMap(INV.key));
function famDress(m, role, id){ const R = FAM_ROLE[role]; if (m.elite){ m.elite = false; m.eSk = null; }   // a family member is never a second leader
  m.def = {...m.def, hp:Math.round(m.def.hp * R.hp), atk:m.def.atk.map(v => Math.max(1, Math.round(v * R.atk))), exp:Math.round((m.def.exp || 0) * R.exp), jexp:Math.round((m.def.jexp || 0) * R.exp),
    drops:role === 'young' ? (m.def.drops || []).map(([k, p]) => [k, p * .5]) : (m.def.drops || []).map(([k, p]) => [k, Math.min(.5, p * 1.25)])};
  m.maxhp = m.hp = m.def.hp; m.fam = id; m.famRole = role; m.famSz = R.sz; m.tagTxt = [R.th, R.en]; }
/* a leader's family gathers round it */
function famRaise(m){
  if (!famOk(m)) return; FAM.making = true;
  try { const id = ++FAM.n, x = m.x, y = m.y, opt = {zone:m.zone}; m.fam = id; m.famLead = true;
    const at = (dx, dy) => { const px = x + dx, py = y + dy; return walkable(px, py, 10) ? [px, py] : [x, y]; };
    if (Math.random() < FAM.mate){ const [px, py] = at(30, 6), p2 = spawnMob(m.type, px, py, opt); famDress(p2, Math.random() < .5 ? 'father' : 'mother', id); p2.famHead = m; p2.famOx = 30; p2.famOy = 6; }
    const kids = 1 + (Math.random() < .55 ? 1 : 0);
    for (let i = 0; i < kids; i++){ const [px, py] = at(-24 + i * 20, 20 + i * 6), k = spawnMob(m.type, px, py, opt); famDress(k, 'young', id); k.famHead = m; k.famOx = -24 + i * 20; k.famOy = 20 + i * 6; }
  } catch (e) {} FAM.making = false;
}
/* a pack leader is made right after it spawns; a festival / story / siege one gets its own label just after, so look a moment later */
if (typeof makeElite === 'function'){ const _me = makeElite; makeElite = function(m){ const r = _me.apply(this, arguments); if (m && !FAM.making) setTimeout(() => famRaise(m), 0); return r; }; }
/* hit one, and the whole family comes for you */
{ const _ad = applyDamage; applyDamage = function(m){ const r = _ad.apply(this, arguments);
    if (m && m.fam && !P.dead) for (const o of mobs) if (o !== m && o.fam === m.fam && !o.dead && !o.aggro && Math.hypot(o.x - m.x, o.y - m.y) < 520){ o.aggro = true; o.wait = 0; }
    return r; }; }
/* the young (and the second parent) keep close to the family's head while nobody is fighting them */
{ let t = 0; EV.on('tick', dt => { if ((t += dt) < .8) return; t = 0; if (typeof nmSlave === 'function' && nmSlave()) return;
    for (const m of mobs){ const h = m.famHead; if (!h || m.dead || m.aggro) continue; if (h.dead){ m.famHead = null; continue; }
      const tx = h.x + (m.famOx || 26), ty = h.y + (m.famOy || 8); if (Math.hypot(m.x - tx, m.y - ty) > 46){ m.hx = tx; m.hy = ty; m.tx = tx; m.ty = ty; m.wait = 0; } } }); }
/* bigger parents, small young (drawn round their feet) */
{ const _dm = drawMobW; drawMobW = function(g, m){ const k = m && m.famSz; if (!k || k === 1) return _dm.apply(this, arguments);
    const x = m.x - cam.x, y = m.y - cam.y; g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y); try { return _dm.apply(this, arguments); } finally { g.restore(); } }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'family', t:['ครอบครัวมอนสเตอร์', 'Monster families'], b:() => L(
  '<p>หัวหน้าฝูง (★) ในแผนที่ล่ามาพร้อมครอบครัว: บางทีมีคู่ (พ่อ/แม่ ตัวใหญ่กว่า แข็งแรงกว่า EXP และดรอปดีกว่า) · ลูก 1–2 ตัว ตัวเล็ก อ่อนแอ เดินตาม · ตีตัวไหนก็ตาม ทั้งครอบครัวจะเข้ามาช่วยกัน</p>',
  '<p>Pack leaders (★) on the hunting maps come with their families: sometimes a mate (father or mother, bigger and tougher, better EXP and drops) · one or two young, small and weak, following along · hit any of them and the whole family comes for you</p>')});
/* online: the room's host tells everyone who is father, mother or young (world2.js mobEx field, after a '|') */
if (typeof mobEx === 'function' && typeof mobExApply === 'function'){
  const _ex = mobEx, _ap = mobExApply, code = {father:'f', mother:'m', young:'y'}, role = {f:'father', m:'mother', y:'young'};
  mobEx = function(m){ const base = _ex.apply(this, arguments); return m && code[m.famRole] ? `${base}|${code[m.famRole]}` : base; };
  mobExApply = function(m, s){ const [base, fr] = String(s || '').split('|'); const r = _ap.call(this, m, base);
    const R = role[fr] && FAM_ROLE[role[fr]]; if (m && R && m.famRole !== role[fr]){ m.famRole = role[fr]; m.famSz = R.sz; m.tagTxt = [R.th, R.en]; }
    return r; }; }
