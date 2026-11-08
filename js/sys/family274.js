/* VAYRATHEN — js/sys/family274.js — (v274) monsters that live as families
   The owner asked for animals that live together. On every hunting map about one animal spawn in four (race 'brute',
   never a boss, never in a dungeon, the tower or an invasion) comes as a family:
   · a parent — father or mother (sometimes both): a little bigger, HP ×1.6, hits ×1.3, EXP and drops a little better;
   · one or two young: small, HP ×0.45, hits ×0.55, less EXP — they keep close to their parent and follow it about.
   Hit any one of them and the whole family turns on you (the young come too). Their names say who they are
   (✦ พ่อ / แม่ / ลูก). Families are made by whoever spawns the map's monsters (the room's host online). */
'use strict';
const FAM = {chance:.25, n:0, making:false};
const FAM_ROLE = {father:{th:'พ่อ', en:'Father', hp:1.6, atk:1.3, exp:1.6, sz:1.18}, mother:{th:'แม่', en:'Mother', hp:1.5, atk:1.25, exp:1.5, sz:1.12},
  young:{th:'ลูก', en:'Young', hp:.45, atk:.55, exp:.4, sz:.72}};
const famOk = (type, opt) => { const d = MOB[type]; return d && d.race === 'brute' && !d.boss && !d.wb && !d.dg && !d.inv && opt && opt.zone && !FAM.making
  && !(typeof DG !== 'undefined' && DG.active) && !(typeof TW !== 'undefined' && TW.active) && !(typeof isTown === 'function' && isTown(MAP_ID)) && !(typeof nmSlave === 'function' && nmSlave())
  && !(typeof INV !== 'undefined' && INV.key && typeof invMap === 'function' && MAP_ID === invMap(INV.key)); };   // not the invading army
function famDress(m, role, id){ const R = FAM_ROLE[role];
  m.def = {...m.def, hp:Math.round(m.def.hp * R.hp), atk:m.def.atk.map(v => Math.max(1, Math.round(v * R.atk))), exp:Math.round((m.def.exp || 0) * R.exp), jexp:Math.round((m.def.jexp || 0) * R.exp),
    drops:role === 'young' ? (m.def.drops || []).map(([k, p]) => [k, p * .5]) : (m.def.drops || []).map(([k, p]) => [k, Math.min(.5, p * 1.25)])};
  m.maxhp = m.hp = m.def.hp; m.fam = id; m.famRole = role; m.famSz = R.sz; m.tagTxt = [R.th, R.en]; }
{ const _sm = spawnMob; spawnMob = function(type, x, y, opt){ const m = _sm.apply(this, arguments);
    try { if (m && famOk(type, opt) && Math.random() < FAM.chance){ FAM.making = true; const id = ++FAM.n, both = Math.random() < .35, first = Math.random() < .5 ? 'father' : 'mother';
        famDress(m, first, id); m.famLead = true;
        const kids = 1 + (Math.random() < .55 ? 1 : 0), at = (dx, dy) => { const px = x + dx, py = y + dy; return walkable(px, py, 10) ? [px, py] : [x, y]; };
        if (both){ const [px, py] = at(28, 6), p2 = _sm.call(this, type, px, py, opt); famDress(p2, first === 'father' ? 'mother' : 'father', id); p2.famHead = m; }
        for (let i = 0; i < kids; i++){ const [px, py] = at(-22 + i * 18, 18 + i * 6), k = _sm.call(this, type, px, py, opt); famDress(k, 'young', id); k.famHead = m; k.famOx = -22 + i * 18; k.famOy = 18 + i * 6; }
        FAM.making = false; } } catch (e) { FAM.making = false; }
    return m; }; }
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
  '<p>สัตว์ในแผนที่ล่าราว 1 ใน 4 อยู่เป็นครอบครัว: พ่อ/แม่ (บางทีมาทั้งคู่) ตัวใหญ่กว่า แข็งแรงกว่า EXP และดรอปดีกว่า · ลูก 1–2 ตัว ตัวเล็ก อ่อนแอ เดินตามพ่อแม่ · ตีตัวไหนก็ตาม ทั้งครอบครัวจะเข้ามาช่วยกัน</p>',
  '<p>About one animal in four on the hunting maps lives in a family: a father or mother (sometimes both), bigger and tougher, with better EXP and drops · one or two young, small and weak, following their parent · hit any of them and the whole family comes for you</p>')});
