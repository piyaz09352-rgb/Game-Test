/* VAYRATHEN — js/sys/allybuff.js — support skills reach your friends too
   Every class's support skills (heals, shields, DEF and regen buffs, beast buffs) now also land on the other
   heroes standing near you (within 400) on the same map — party or not — as well as on yourself:
     ปฐมพยาบาล · ยาสมุนไพร · ยาทิพย์ (heal) · เกราะมนตร์ · สายสิญจน์ป้องกัน (shield) · โล่ทองคำ · ด้ายสายสิญจน์ (DEF)
     ลูกประคบ (regen) · สายใยวิญญาณ · สามัคคีสรรพสัตว์ (summons)
   The caster sends one message on the room topic 'sbuf'; each receiver checks it (same map room, close enough,
   a known skill, every number clamped) before applying it. Nothing from the network is trusted. */
'use strict';

const AB = {R:400, heal:['firstaid', 'herbheal', 'elixir'], buff:['barrier', 'ward', 'goldshield', 'thread', 'poultice', 'spiritlink', 'unity']};
const abShared = id => AB.heal.includes(id) || AB.buff.includes(id);
/* the only buff fields a friend may give you, each with a hard ceiling */
const AB_CAP = {def:120, reflect:.2, riposte:2.5, regenPct:.12,   // (v283) riposte: Riposte (ตอบโต้, v204) in the old Gold Shield's place — it was dropped here, so a friend got an empty buff
  every:[1, 5], sumAtkB:.3, sumHaste:.4, t:[1, 90]};
function abClean(b){
  const o = {}; if (!b || typeof b !== 'object') return null;
  for (const k in AB_CAP){ const v = +b[k]; if (!isFinite(v) || v <= 0) continue; const c = AB_CAP[k]; o[k] = Array.isArray(c) ? clamp(v, c[0], c[1]) : Math.min(v, c); }
  const br = +b.barrier; if (isFinite(br) && br > 0) o.barrier = Math.round(Math.min(br, DER.maxhp * 1.25, 1e6));
  if (!o.t) return null; return o;
}
const abNear = () => (typeof NET === 'undefined' ? [] : [...NET.ghosts.values()]).filter(g => g.q && !g.q.dead && Math.hypot(g.x - P.x, g.y - P.y) <= AB.R);

/* ---------- casting: after your own effect, the same goes out to the heroes around you ---------- */
{ const _ex = execSkill;
  execSkill = function(id, lv, t){
    const out = _ex.apply(this, arguments);
    try {
      const sk = SKILLS[id]; if (!sk || !abShared(id) || !NET.room || !NET.mapRoom || P.dead) return out;
      const near = abNear(); if (!near.length) return out;
      const d = {r:NET.mapName, x:Math.round(P.x), y:Math.round(P.y), k:id, lv:clamp(lv | 0, 1, sk.max || 10), n:netName()};
      if (AB.heal.includes(id)) d.h = Math.round(sk.heal(lv)); else d.b = sk.buff(lv);
      mapEmit('sbuf', d).catch(() => {});
      for (const g of near) VFX.play(sk.fx === 'goldshield' || sk.fx === 'barrier' ? sk.fx : 'heal', {x:g.x, y:g.y});
      addText(P.x, P.y - 66, L(`ส่งให้เพื่อน ${near.length} คน`, `Shared with ${near.length}`), '#9ff0c8', 12);
    } catch (e) {}
    return out;
  };
}
/* ---------- receiving ---------- */
function onSbuf(msg){
  const d = msg.data || {}; if (msg.isMe || !S || P.dead || d.r !== NET.mapName) return;
  const id = String(d.k || ''), sk = SKILLS[id]; if (!sk || !abShared(id)) return;
  if (Math.hypot((+d.x || 0) - P.x, (+d.y || 0) - P.y) > AB.R + 40) return;
  const who = clean(d.n, 18) || '?';
  if (AB.heal.includes(id)){
    const h = Math.round(clamp(+d.h || 0, 0, DER.maxhp)); if (!h) return;
    S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 50, `+${h}`, '#c4ffe0'); VFX.play(sk.fx || 'heal', {x:P.x, y:P.y});
  } else {
    const b = abClean(d.b); if (!b) return;
    const cur = P.buffs[id];
    if (cur && (cur.barrier || 0) >= (b.barrier || 0) && cur.t >= b.t * .6) return;   // what you already have is as good: keep it
    addBuff(id, b); VFX.play(sk.fx || 'heal', {x:P.x, y:P.y});
  }
  SFX.play(AB.heal.includes(id) ? 'heal' : 'buff');
  log(L(`${who} ใช้ ${nm(sk)} ให้คุณ`, `${who} cast ${nm(sk)} on you`), 'g'); dirty = true;
}
EV.on('netready', () => { if (NET.room) mapOn('sbuf', onSbuf, () => {}); });

/* the skill tooltips say so */
for (const id of [...AB.heal, ...AB.buff]){ const sk = SKILLS[id]; if (!sk || !sk.desc) continue; const _d = sk.desc;
  sk.desc = lv => _d(lv) + L(' · ส่งให้ผู้เล่นรอบตัวด้วย', ' · also reaches players around you'); }
