/* VAYRATHEN — js/sys/rune200.js — (v200) the mage line, reworked from docs/PROPOSAL_RUNE.md (the owner said go)
   Every element still has its spells (they answer the monsters' elements) but each element now plays differently:
   fire hits hard and burns · water slows, freezes and pushes · wind jumps from monster to monster and shocks ·
   earth holds monsters and drags them together.
   นักเวท       ศรเพลิง 4 heavy bolts (was 10 light ones) that set the target burning · ศรน้ำแข็ง → หอกน้ำแข็ง, one lance
                through everything in a line, slows · อัสนีบาตน้อย → โซ่สายฟ้า, strikes the target and jumps on to 4 more
   มหาโหรา      removed: พายุหิมะ · สายฟ้าพิโรธ · ธรณีพิโรธ (copies of other tiers' spells; their points come back) ·
                ม่านดารา → ดวงชะตารุ่ง, 30 s of faster casting and cheaper spells (it was a second copy of เกราะมนตร์) ·
                แรงโน้มถ่วงดารา drags the monsters around into the middle, then holds them · new: ก้าวดารา, a blink
   จอมเวทจตุธาตุ สุริยาถล่ม the ground keeps burning whoever stands on it · มหาอุทกภัย a great wave throws monsters out of
                the circle and slows them · พายุอสนีบาต lightning leaps from monster to monster · ธรณีสูบ the pit holds
                everything it catches, then bursts */
'use strict';
const RN_DROP = {astro:['frostsea', 'wrath', 'earthrage']};
const RN_GONE = Object.values(RN_DROP).flat();
for (const [j, ids] of Object.entries(RN_DROP)){ if (JOBS[j]) JOBS[j].skills = JOBS[j].skills.filter(id => !ids.includes(id));
  if (typeof SK8 !== 'undefined' && SK8[j]) for (const k of ['a', 'b', 'c']) SK8[j][k] = SK8[j][k].filter(id => !ids.includes(id)); }
for (const id in SKILLS){ const s = SKILLS[id]; if (!s.req) continue; for (const q of Object.keys(s.req)) if (RN_GONE.includes(q)) delete s.req[q]; if (!Object.keys(s.req).length) s.req = undefined; }
function rnRefund(){ if (!S || !S.skills) return; let n = 0;
  for (const id of RN_GONE) if (S.skills[id]){ n += S.skills[id]; delete S.skills[id]; }
  if (Array.isArray(S.hot)) S.hot = S.hot.map(h => (RN_GONE.includes(h) ? null : h));
  if (n){ S.skPts = (S.skPts || 0) + n; derive(); dirty = true; if (typeof renderHotbar === 'function') renderHotbar();
    if (typeof log === 'function') log(L(`สกิลนักเวทปรับใหม่: คืน ${n} แต้มสกิลจากสกิลที่ถูกนำออก`, `Mage skills reworked: ${n} skill points returned from removed skills`), 'g'); } }
EV.on('tick', () => { if ((rnRefund.t = (rnRefund.t || 0) + 1) % 30 === 0) rnRefund(); });
{ const _d0 = derive; derive = function(){ if (S && S.skills && !rnRefund.busy && RN_GONE.some(id => S.skills[id])){ rnRefund.busy = 1; try { rnRefund(); } finally { rnRefund.busy = 0; } } return _d0.apply(this, arguments); }; }

const RND = (id, o) => { const s = SKILLS[id]; if (s) Object.assign(s, o); return s; };
const rnP = v => Math.round(v * 100) + '%';
const rnD = id => lv => rnP(SKILLS[id].dmg(lv));
const RN = {chainR:140, chainMul:.8};
/* ---------- นักเวท ---------- */
RND('firebolt', {hits:() => 4, dmg:lv => .5 + lv * .2,
  desc:lv => L(`ศรเพลิง 4 ลูก ลูกละ ${rnD('firebolt')(lv)} MATK · ติดไฟลุก ${rnP(.06 + lv * .006)} MATK/วิ 4 วิ · ธาตุไฟ · ร่าย ${SKILLS.firebolt.cast(lv).toFixed(1)} วิ`, `4 fire bolts of ${rnD('firebolt')(lv)} MATK · sets the target burning (${rnP(.06 + lv * .006)} MATK a second, 4 s) · fire · cast ${SKILLS.firebolt.cast(lv).toFixed(1)} s`)});
RND('icebolt', {name:'หอกน้ำแข็ง', en:'Ice Lance', short:'หอกน้ำแข็ง', shortEn:'Lance', type:'line', fx:'iceLance', len:240, width:26, hits:undefined, freeze:undefined, cast:lv => 2 - lv * .05,
  dmg:lv => 2 + lv * .5,
  desc:lv => L(`หอกน้ำแข็งพุ่งทะลุทุกตัวในแนว 240 · ${rnD('icebolt')(lv)} MATK · ช้าลง 40% 3 วิ · ธาตุน้ำ`, `An ice lance through everything in a 240 line · ${rnD('icebolt')(lv)} MATK · slowed 40% for 3 s · water`)});
RND('thunder', {name:'โซ่สายฟ้า', en:'Chain Lightning', short:'โซ่สายฟ้า', shortEn:'Chain', radius:40,
  desc:lv => L(`ฟาดเป้า ${rnD('thunder')(lv)} MATK แล้วเด้งต่อไปอีก 4 ตัว (ตัวละ 80% ของครั้งก่อน) · ช็อต · ธาตุลม`, `Strikes the target for ${rnD('thunder')(lv)} MATK, then jumps on to 4 more (80% each jump) · shock · wind`)});
/* ---------- มหาโหรา ---------- */
RND('starveil', {name:'ดวงชะตารุ่ง', en:'Rising Fortune', short:'ดวงรุ่ง', shortEn:'Fortune', fx:'manaRestore', cd:45, buff:lv => ({t:30, fortune:+(.1 + lv * .02).toFixed(2)}),
  desc:lv => L(`30 วิ · ร่ายเร็วขึ้น ${rnP(.1 + lv * .02)} · ดีเลย์หลังร่ายสั้นลง ${rnP(.1 + lv * .02)} · ใช้ SP น้อยลง ${rnP(.1 + lv * .02)}`, `30 s · ${rnP(.1 + lv * .02)} faster casting · ${rnP(.1 + lv * .02)} shorter after-cast delay · spells cost ${rnP(.1 + lv * .02)} less SP`)});
RND('gravity', {radius:130,
  desc:lv => L(`ดูดมอนรอบ ๆ (130) เข้ากลางวง · ${rnD('gravity')(lv)} MATK · ตรึง 2 วิ · ช้าลง 50% 4 วิ · ธาตุดิน`, `Drags the monsters around (130) into the middle · ${rnD('gravity')(lv)} MATK · held 2 s · slowed 50% for 4 s · earth`)});
SKILLS.starstep = {id:'starstep', job:'astro', name:'ก้าวดารา', en:'Star Step', short:'ก้าวดารา', shortEn:'Step', max:10, type:'blink', kind:'active', sp:lv => 20 - lv, cd:lv => 9 - lv * .3, fx:'shadowBlink', anim:'skill', act:'invoke',
  dist:lv => 110 + lv * 6, desc:lv => L(`วาร์ป ${110 + lv * 6} ไปทางที่หัน · คูลดาวน์ ${(9 - lv * .3).toFixed(1)} วิ`, `Blink ${110 + lv * 6} the way you face · cooldown ${(9 - lv * .3).toFixed(1)} s`)};
if (JOBS.astro && !JOBS.astro.skills.includes('starstep')) JOBS.astro.skills.push('starstep');
if (typeof SK8 !== 'undefined' && SK8.astro && !SK8.astro.c.includes('starstep')) SK8.astro.c.push('starstep');
if (typeof SK8_OF !== 'undefined') SK8_OF.starstep = 'c';
if (typeof SK_GLYPH !== 'undefined') SK_GLYPH.starstep = 'star';
/* ---------- จอมเวทจตุธาตุ ---------- */
const rnGrandDesc = (id, th, en) => { const s = SKILLS[id]; if (!s) return; s.desc = lv => L(`${th} · ${s.hits(lv)} ครั้ง ครั้งละ ${rnP(s.dmg(lv))} MATK · รัศมี ${s.radius} · ร่าย ${s.cast(lv)} วิ แล้วร่ายค้าง 3 วิ`, `${en} · ${s.hits(lv)} hits of ${rnP(s.dmg(lv))} MATK · radius ${s.radius} · cast ${s.cast(lv)} s, then held 3 s`); };
rnGrandDesc('solarfall', 'ดวงไฟถล่ม พื้นลุกไฟ 6 วิ มอนที่ยืนอยู่โดนเผาตลอด · ธาตุไฟ', 'Suns crash down and the ground burns for 6 s, burning whoever stands on it · fire');
RND('deluge', {});
rnGrandDesc('deluge', 'คลื่นยักษ์ซัดมอนออกนอกวง · ช้าลง 50% 4 วิ · เปียก (โดนลมแรงขึ้น 30%) · ธาตุน้ำ', 'A great wave throws monsters out of the circle · slowed 50% for 4 s · soaked (+30% wind damage) · water');
RND('tempest', {hits:() => 4});
rnGrandDesc('tempest', 'พายุ + สายฟ้าเด้งไปมาระหว่างมอน 10 ครั้ง (ครั้งละ 100% MATK) · ช็อต · ลดต้านเวท · ธาตุลม', 'A storm, and lightning leaping monster to monster 10 times (100% MATK each) · shock · lowers magic defence · wind');
RND('earthswallow', {dmg:lv => 1 + lv * .2});
rnGrandDesc('earthswallow', 'หลุมดำดูดมอนลงหลุม ตรึง 3 วิ แล้วระเบิด (600% MATK) · ธาตุดิน', 'A black pit drags monsters in and holds them 3 s, then bursts (600% MATK) · earth');

/* ---------- the mechanics ---------- */
const rnMine = () => { const ch = jobChain(); return ch[1] === 'rune'; };
const rnBolt = (x0, y0, x1, y1, col = '#bfe8ff') => { if (typeof skfxAdd !== 'function') return;
  const pts = []; for (let i = 0; i <= 7; i++){ const k = i / 7; pts.push([x0 + (x1 - x0) * k + (i && i < 7 ? (Math.random() - .5) * 14 : 0), y0 + (y1 - y0) * k + (i && i < 7 ? (Math.random() - .5) * 14 : 0)]); }
  skfxAdd({life:.28, t:0, add:true, draw(g, k){ g.save(); g.globalAlpha = 1 - k; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [w, c] of [[4, 'rgba(120,190,255,.5)'], [1.6, col], [.7, '#ffffff']]){ g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); } g.restore(); }}); };
/* lightning that jumps from monster to monster */
function rnChain(sk, lv, from, n, mul, hit, delay = .09){
  if (n <= 0 || !from) return; const fy = from.y - (MOB_H[from.type] || 30) * .5;
  const next = mobs.filter(o => !o.dead && !o.pvp && !hit.has(o) && Math.hypot(o.x - from.x, o.y - from.y) < RN.chainR + o.def.r).sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0];
  if (!next) return; hit.add(next);
  later(delay, () => { if (next.dead) return; rnBolt(from.x, fy, next.x, next.y - (MOB_H[next.type] || 30) * .5);
    applyDamage(next, {...skillMagic(next, sk.dmg(lv) * mul, sk.elem), _rnChain:1}, sk); applyStatus(next, {shock:1});
    rnChain(sk, lv, next, n - 1, mul * (sk.id === 'tempest' ? 1 : RN.chainMul), sk.id === 'tempest' ? new Set([next]) : hit, delay); });
}
const rnPull = (cx, cy, r, near = 18) => { for (const m of mobs){ if (m.dead || m.pvp || m.def.boss) continue; const d = Math.hypot(m.x - cx, m.y - cy); if (d > r + m.def.r || d < near) continue;
    const k = (d - near) / d; m.x -= (m.x - cx) * k; m.y -= (m.y - cy) * k; if (typeof pushOut === 'function') pushOut(m, m.def.r * .4); } };
{ const _ex = execSkill; execSkill = function(id, lv, t){
    const tg = t && !t.dead ? t : null;
    if (id === 'gravity' && tg) rnPull(tg.x, tg.y, SKILLS.gravity.radius);
    const r = _ex.apply(this, arguments);
    if (id === 'thunder' && tg) rnChain(SKILLS.thunder, lv, tg, 4, RN.chainMul, new Set([tg]), .25);
    if (id === 'tempest' && tg){ const sk = SKILLS.tempest; for (let i = 0; i < 1; i++) later(.5, () => rnChain({...sk, dmg:l => sk.dmg(l) * .7, id:'tempest'}, lv, tg, 10, 1, new Set([tg]), .14)); }
    if (id === 'deluge' && tg) P._rnWave = {x:tg.x, y:tg.y, t:T, hit:new Set()};
    if (id === 'solarfall' && tg) RN_FIRE.push({x:tg.x, y:tg.y, r:SKILLS.solarfall.radius, until:T + 6.5});
    if (id === 'earthswallow' && tg){ const x = tg.x, y = tg.y, rr = SKILLS.earthswallow.radius;
      for (const m of mobs) if (!m.dead && !m.def.boss && Math.hypot(m.x - x, m.y - y) < rr + m.def.r) applyStatus(m, {root:3});
      later(3.2, () => { for (const m of mobs) if (!m.dead && Math.hypot(m.x - x, m.y - y) < rr + m.def.r) applyDamage(m, skillMagic(m, 6, 'earth'), SKILLS.earthswallow);
        try { skfxShake(5); } catch (e) {} }); }   // (v201) the eruption itself is drawn by grandfx200.js
    return r; }; }
{ const _ad = applyDamage; applyDamage = function(m, res, sk){ const r = _ad.apply(this, arguments), id = sk && sk.id;
    if (m && !m.dead && res && !res.miss && !res.poison){
      if (id === 'icebolt') applyStatus(m, {slow:[.4, 3]});
      if (id === 'deluge' && P._rnWave && T - P._rnWave.t < 5 && !P._rnWave.hit.has(m)){ const w = P._rnWave; w.hit.add(m); applyStatus(m, {slow:[.5, 4]});
        if (!m.def.boss){ const d = Math.hypot(m.x - w.x, m.y - w.y) || 1, push = Math.max(0, SKILLS.deluge.radius + 30 - d); m.x += (m.x - w.x) / d * push; m.y += (m.y - w.y) / d * push; if (typeof pushOut === 'function') pushOut(m, m.def.r * .5); } }
    }
    return r; }; }
/* สุริยาถล่ม: the burning ground keeps whoever stands on it alight */
const RN_FIRE = [];
EV.on('tick', () => { for (let i = RN_FIRE.length - 1; i >= 0; i--){ const f = RN_FIRE[i]; if (T > f.until){ RN_FIRE.splice(i, 1); continue; }
    for (const m of mobs) if (!m.dead && Math.hypot(m.x - f.x, m.y - f.y) < f.r + m.def.r){ m.burnT = Math.max(m.burnT || 0, T + 1.2); m.burnDps = Math.max(m.burnDps || 0, DER.matk * .25); } } });
/* ดวงชะตารุ่ง: faster casting, shorter delay, cheaper spells while it lasts */
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); const b = P.buffs && P.buffs.starveil;
    if (DER && b && b.fortune){ DER.castMul = (DER.castMul || 1) * (1 - b.fortune); DER.acdMul = (DER.acdMul || 1) * (1 - b.fortune); } return r; }; }
{ let was = 0; EV.on('tick', () => { const v = P.buffs && P.buffs.starveil ? 1 : 0; if (v !== was){ was = v; derive(); } }); }
for (const id in SKILLS){ const s = SKILLS[id]; if (!['rune', 'astro', 'archsage'].includes(s.job) || typeof s.sp !== 'function' || s._rnSp) continue;
  const o = s.sp; s._rnSp = 1; s.sp = lv => { const b = typeof P !== 'undefined' && P.buffs && P.buffs.starveil; return b && b.fortune ? Math.max(1, Math.round(o(lv) * (1 - b.fortune))) : o(lv); }; }
