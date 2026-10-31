/* VAYRATHEN — js/sys/last3206.js — (v206) the healer, summoner and hexer lines, from docs/PROPOSAL_LAST3.md (the owner
   said go). Nothing is removed. Effects in soft, natural shapes.
   หมอยา      ทัณฑ์สวรรค์ → ระฆังศักดิ์สิทธิ์: a golden bell comes down and tolls; its sound hurts everything round the
              target and stuns ghosts and dark things · พรเทวดา → ต้นโพธิ์ศักดิ์สิทธิ์: a glowing bodhi tree for 12 s,
              its leaves falling, healing whoever stands beneath · แสงแห่งชีวิต → ฝนสมุนไพร: green rain for 5 s that
              heals you and burns the monsters in it
   ผู้อัญเชิญ  สามัคคีสรรพสัตว์ → ประสานใจ: every summoned beast heals 50% and draws the monsters onto itself 5 s ·
              ราชปัญญาหิมพานต์: beasts stay 50% longer and each comes back once when it falls · ราชโองการ: every beast
              rushes your target, 50% faster, for 8 s · สวรรค์ทลาย: pillars of heavenly light strike down, gold feathers fall
   ไสยเวท     จิตทมิฬ: MATK +2% for every cursed monster near you (to +20%) · มนต์สะกดหมู่ → สาปลาม: the curse on the target
              spreads to 5 more monsters · หอกเงา: a spear of shadow is thrown, pins its target 3 s and leaves a pool of
              shadow that slows whatever walks in it */
'use strict';
const LTD = (id, o) => { const s = SKILLS[id]; if (s) Object.assign(s, o); return s; };
const ltP = v => Math.round(v * 100) + '%';
const ltD = id => lv => ltP(SKILLS[id].dmg(lv));
const ltLv = id => (S && S.skills && S.skills[id]) || 0;
/* ---------- หมอยา ---------- */
LTD('divinewrath', {name:'ระฆังศักดิ์สิทธิ์', en:'Sacred Bell', short:'ระฆัง', shortEn:'Bell', type:'aoeTarget', fx:'none', radius:90, hits:() => 1, dmg:lv => 3 + lv * .4, st2:undefined,
  desc:lv => L(`ระฆังทองลอยลงมาตีดังกังวาน · รอบเป้า 90 · ${ltD('divinewrath')(lv)} MATK · มอนผี/ธาตุมืดมึน 2 วิ · ธาตุศักดิ์สิทธิ์`, `A golden bell comes down and tolls · around the target (90) · ${ltD('divinewrath')(lv)} MATK · ghosts and dark things stunned 2 s · holy`)});
LTD('blessing', {name:'ต้นโพธิ์ศักดิ์สิทธิ์', en:'Sacred Bodhi', short:'ต้นโพธิ์', shortEn:'Bodhi', fx:'none', cd:40, team:undefined, buff:lv => ({t:12, bodhi:1}),
  desc:lv => L(`ปลูกต้นโพธิ์เรืองแสง 12 วิ · อยู่ใต้ต้น (รัศมี 110) ฟื้น HP ${ltP(.04 + lv * .004)} ทุก 2 วิ`, `Plant a glowing bodhi tree for 12 s · beneath it (110) heal ${ltP(.04 + lv * .004)} HP every 2 s`)});
LTD('holylight', {name:'ฝนสมุนไพร', en:'Herbal Rain', short:'ฝนสมุนไพร', shortEn:'Rain', fx:'none', radius:130, hits:() => 10, every:.5, dmg:lv => .5 + lv * .07,
  desc:lv => L(`ฝนสมุนไพรตก 5 วิ รัศมี 130 · มอนในวงโดน 10 ครั้ง ครั้งละ ${ltD('holylight')(lv)} MATK · ตัวเองอยู่ในวงฟื้น HP 2% ทุกครึ่งวิ`, `Herbal rain for 5 s (130) · monsters in it take 10 hits of ${ltD('holylight')(lv)} MATK · you heal 2% HP every half second while inside`)});
/* ---------- ผู้อัญเชิญ ---------- */
LTD('unity', {name:'ประสานใจ', en:'Bond of Hearts', short:'ประสานใจ', shortEn:'Bond', fx:'none', cd:20, buff:lv => ({t:5, bondCall:1}),
  desc:lv => L(`สัตว์อัญเชิญทุกตัวฟื้น HP 50% · มอนรอบ ๆ หันไปตีสัตว์อัญเชิญแทนเรา 5 วิ`, `Every summoned beast heals 50% · monsters around turn on the beasts instead of you for 5 s`)});
LTD('sovlore', {pas:lv => ({matkPct:lv * .01, sumMax:lv >= 10 ? 2 : lv >= 5 ? 1 : 0, sumDurPct:+(lv * .05).toFixed(2), sumRevive:1}),
  desc:lv => L(`ติดตัว · สัตว์อัญเชิญอยู่นานขึ้น ${lv * 5}% · ล้มแล้วกลับมาเกิดใหม่ 1 ครั้ง · เรียกพร้อมกันได้ +${lv >= 10 ? 2 : lv >= 5 ? 1 : 0} ตัว · MATK +${lv}%`, `Passive · beasts stay ${lv * 5}% longer · each comes back once when it falls · +${lv >= 10 ? 2 : lv >= 5 ? 1 : 0} at a time · MATK +${lv}%`)});
LTD('royaledict', {buff:lv => ({t:8, sumHaste:.5, focus:1}), cd:30,
  desc:lv => L(`8 วิ · สั่งสัตว์อัญเชิญทุกตัวรุมเป้าของเรา ตีเร็วขึ้น 50%`, `8 s · every beast rushes your target, attacking 50% faster`)});
LTD('heavenfall', {fx:'none'});
/* ---------- ไสยเวท ---------- */
LTD('nightmind', {pas:lv => ({castPct:+(lv * .02).toFixed(2)}),
  desc:lv => L(`ติดตัว · MATK +2% ต่อมอนที่ติดคำสาปรอบตัว (สูงสุด +20%) · เวลาร่าย −${lv * 2}%`, `Passive · MATK +2% for every cursed monster near you (up to +20%) · cast time −${lv * 2}%`)});
LTD('masshex', {name:'สาปลาม', en:'Spreading Curse', short:'สาปลาม', shortEn:'Spread', type:'debuff', fx:'none', radius:undefined, dmg:undefined, st:lv => ({curse:[+(.12 + lv * .01).toFixed(2), 8, +(.25 + lv * .03).toFixed(2)]}),
  desc:lv => L(`สาปเป้า แล้วคำสาปลามไปติดมอนรอบ ๆ อีก 5 ตัว (180) · ศัตรูรับดาเมจ +${ltP(.12 + lv * .01)} และเสีย ${ltP(.25 + lv * .03)} MATK/วิ 8 วิ`, `Curse the target, and the curse spreads to 5 more monsters (180) · they take +${ltP(.12 + lv * .01)} damage and lose ${ltP(.25 + lv * .03)} MATK a second for 8 s`)});
LTD('shadowlance', {type:'debuff', fx:'none', len:undefined, width:undefined, st:() => ({}), dmgL:lv => 7 + lv * .25,
  desc:lv => L(`ขว้างหอกเงาปักเป้า ${ltP(7 + lv * .25)} MATK · ตรึง 3 วิ · ทิ้งแอ่งเงา 5 วิ มอนที่เหยียบช้าลง 40% · DEF ศัตรู −25% 6 วิ · ธาตุมืด`, `Throw a spear of shadow: ${ltP(7 + lv * .25)} MATK · pinned 3 s · leaves a pool of shadow for 5 s that slows whatever walks in it 40% · DEF −25% for 6 s · shadow`)});

/* ---------- the mechanics ---------- */
const ltNear = (x, y, r, skip) => mobs.filter(m => !m.dead && !m.pvp && m !== skip && Math.hypot(m.x - x, m.y - y) < r + m.def.r);
const ltBeasts = () => (typeof SUMMONS !== 'undefined' ? SUMMONS.filter(s => s.kind === 'beast' && !s.dead) : []);
const LT = {trees:[], rains:[], pools:[], pillars:[]};
{ const _ex = execSkill; execSkill = function(id, lv, t){
    const tg = t && !t.dead ? t : null, r = _ex.apply(this, arguments);
    if (id === 'divinewrath' && tg){ ltBellFx(tg.x, tg.y); later(.55, () => { for (const m of ltNear(tg.x, tg.y, 90)) if (m.def.elem === 'shadow' || m.def.elem === 'undead' || m.def.race === 'undead') applyStatus(m, {stun:2}); }); }
    if (id === 'blessing') LT.trees.push({x:P.x + 18, y:P.y - 6, t0:T, until:T + 12, lv, heal:0});
    if (id === 'holylight' && tg) LT.rains.push({x:tg.x, y:tg.y, r:130, t0:T, until:T + 5.2, heal:0});
    if (id === 'unity'){ for (const s of ltBeasts()){ s.hp = Math.min(s.maxhp, s.hp + s.maxhp * .5); addText(s.x, s.y - 40, '+50%', '#c4ffe0', 11); }
      const bs = ltBeasts(); if (bs.length) for (const m of ltNear(P.x, P.y, 230)){ m.foe = bs.sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y))[0]; m.aggro = true; m._bondT = T + 5; }
      ltBondFx(); }
    if (id === 'heavenfall' && tg){ const sk = SKILLS.heavenfall; for (let i = 0; i < sk.hits(lv); i++) later(.05 + i * (sk.every || .3), () => ltPillarBurst(tg.x, tg.y, sk.radius)); }
    if (id === 'masshex' && tg) later(.15, () => { const c = tg.st && tg.st.curse > 0 ? [tg.st.curseAmp, tg.st.curse, (tg.st.curseDps || 0) / Math.max(1, DER.matk)] : SKILLS.masshex.st(lv).curse;
      const near = ltNear(tg.x, tg.y, 180, tg).sort((a, b) => Math.hypot(a.x - tg.x, a.y - tg.y) - Math.hypot(b.x - tg.x, b.y - tg.y)).slice(0, 5);
      near.forEach((m, i) => later(i * .08, () => { if (m.dead) return; applyStatus(m, {curse:[c[0], Math.max(4, c[1]), c[2]]}); ltWispFx(tg, m); })); });
    if (id === 'shadowlance' && tg){ const x0 = P.x, y0 = P.y; ltSpearFx(x0, y0, tg);
      later(.32, () => { if (tg.dead) return; const sk = SKILLS.shadowlance; applyDamage(tg, skillMagic(tg, sk.dmgL(lv), 'shadow'), sk); if (!tg.def.boss) applyStatus(tg, {root:3}); applyStatus(tg, {defDown:[.25, 6]});
        LT.pools.push({x:tg.x, y:tg.y, t0:T, until:T + 5}); }); }
    return r; }; }
// สัตว์อัญเชิญ revive once (ราชปัญญาหิมพานต์)
if (typeof hitBeast === 'function'){ const _hb = hitBeast; hitBeast = function(s){ const r = _hb.apply(this, arguments);
    if (s && s.dead && s.beast !== 'bound' && !s._rev && DER && DER.pas && DER.pas.sumRevive){ s.dead = false; s._rev = 1; s.hp = s.maxhp; addText(s.x, s.y - 44, L('กลับมาเกิดใหม่!', 'Reborn!'), '#ffe08a', 12); ltRebornFx(s.x, s.y); }
    return r; }; }
// จิตทมิฬ: stronger with every cursed monster around
{ const _md = magicDamage; magicDamage = function(m){ const r = _md.apply(this, arguments); const lv = ltLv('nightmind');
    if (lv && r && r.dmg > 0 && jobChain().includes('shaman')){ const n = mobs.filter(o => !o.dead && o.st && o.st.curse > 0 && Math.hypot(o.x - P.x, o.y - P.y) < 260).length; if (n) r.dmg = Math.round(r.dmg * (1 + Math.min(.2, n * .02))); }
    return r; }; }
EV.on('tick', dt => {
  // the bodhi tree heals whoever stands beneath it
  LT.trees = LT.trees.filter(o => T < o.until);
  for (const o of LT.trees) if ((o.heal -= dt) <= 0){ o.heal = 2; if (!P.dead && Math.hypot(P.x - o.x, P.y - o.y) < 110 && S.hp < DER.maxhp){ const h = Math.round(DER.maxhp * (.04 + o.lv * .004)); S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 52, `+${h}`, '#c4ffe0', 12); } }
  // the herbal rain heals you while you stand in it
  LT.rains = LT.rains.filter(o => T < o.until);
  for (const o of LT.rains) if ((o.heal -= dt) <= 0){ o.heal = .5; if (!P.dead && Math.hypot(P.x - o.x, P.y - o.y) < o.r && S.hp < DER.maxhp){ S.hp = Math.min(DER.maxhp, S.hp + Math.round(DER.maxhp * .02)); } }
  // the pool of shadow slows whatever walks in it
  LT.pools = LT.pools.filter(o => T < o.until);
  for (const o of LT.pools) for (const m of ltNear(o.x, o.y, 55)) applyStatus(m, {slow:[.4, .6]});
  // the edict: every beast goes for your target
  if (P.buffs && P.buffs.royaledict && P.buffs.royaledict.focus && P.target && !P.target.dead) for (const s of ltBeasts()) s.target = P.target;
  // the bond: monsters keep after the beasts while it lasts
  for (const m of mobs) if (m._bondT > T && (!m.foe || m.foe.dead)){ const bs = ltBeasts(); if (bs.length) m.foe = bs[0]; }
});

/* ---------- the looks ---------- */
const ltH = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
function ltSoft(g, x, y, r, a, col){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.6, `rgba(${col},${a * .45})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
// the sacred bell: comes down, swings and tolls; rings of sound roll out
function ltBellFx(x, y){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:1.3, t:0, draw(g, k){ const drop = Math.min(1, k / .35), by = y - 70 - (1 - drop * drop) * 90, sw = k > .35 ? Math.sin((k - .35) * 18) * .35 * (1 - k) : 0, al = k > .85 ? (1 - k) / .15 : 1;
      g.save(); g.globalAlpha = al; g.globalCompositeOperation = 'lighter'; ltSoft(g, x, by + 10, 36, .4, '255,220,130'); g.globalCompositeOperation = 'source-over';
      g.translate(x, by - 16); g.rotate(sw); g.strokeStyle = '#8a5a20'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -6); g.lineTo(0, 0); g.stroke();
      const bg = g.createLinearGradient(-14, 0, 14, 0); bg.addColorStop(0, '#a8701e'); bg.addColorStop(.35, '#ffe08a'); bg.addColorStop(.6, '#e8b040'); bg.addColorStop(1, '#8a5a14');
      g.fillStyle = bg; g.beginPath(); g.moveTo(-5, 0); g.quadraticCurveTo(-7, 2, -9, 14); g.quadraticCurveTo(-11, 24, -15, 27); g.lineTo(15, 27); g.quadraticCurveTo(11, 24, 9, 14); g.quadraticCurveTo(7, 2, 5, 0); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(120,70,20,.8)'; g.lineWidth = .8; g.stroke(); g.fillStyle = '#ffeaa8'; g.beginPath(); g.ellipse(0, 27, 15, 2.6, 0, 0, 7); g.fill();
      g.fillStyle = '#8a5a14'; g.beginPath(); g.arc(Math.sin(sw * 3) * 4, 28, 2.6, 0, 7); g.fill(); g.restore();
      if (k > .35){ for (let i = 0; i < 3; i++){ const q = (k - .35) * 1.6 - i * .18; if (q < 0 || q > 1) continue; g.globalAlpha = (1 - q) * .7 * al; g.strokeStyle = 'rgba(255,230,160,.95)'; g.lineWidth = 3 * (1 - q) + .5; g.beginPath(); g.ellipse(x, y - 4, 20 + q * 80, (20 + q * 80) * .5, 0, 0, 7); g.stroke(); } g.globalAlpha = 1; } }});
  later(.4, () => { try { skfxShake(2); } catch (e) {} }); }
// summoned beasts: soft gold threads from you to each, hearts rising
function ltBondFx(){ if (typeof skfxAdd !== 'function') return; const bs = ltBeasts();
  skfxAdd({life:1, t:0, add:true, draw(g, k){ for (const s of bs){ g.globalAlpha = (1 - k) * .8; g.strokeStyle = 'rgba(255,220,140,.9)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(P.x, P.y - 20); g.quadraticCurveTo((P.x + s.x) / 2, Math.min(P.y, s.y) - 40, s.x, s.y - 20); g.stroke();
      ltSoft(g, s.x, s.y - 20 - k * 20, 14, .6, '160,255,190'); } g.globalAlpha = 1; }}); }
function ltRebornFx(x, y){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:1, t:0, add:true, draw(g, k){ g.globalAlpha = 1 - k; ltSoft(g, x, y - 20, 20 + k * 30, .7, '255,230,150');
    for (let i = 0; i < 8; i++){ const a = i / 8 * 6.283, rr = 10 + k * 26; ltSoft(g, x + Math.cos(a) * rr, y - 20 - k * 30 + Math.sin(a) * rr * .4, 3, .9, '255,245,200'); } g.globalAlpha = 1; }}); }
// heavenly pillars striking down at points in the circle, a puff of light where they land, a feather or two
function ltPillarBurst(cx, cy, R){ if (typeof skfxAdd !== 'function') return;
  for (let j = 0; j < 4; j++){ const a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * R * .85, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .5;
    skfxAdd({life:.7, t:-j * .05, draw(g, k){ const H = 220, w = 10 * (1 - k * .5), al = k < .15 ? k / .15 : 1 - (k - .15) / .85;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = al;
      const pg = g.createLinearGradient(x - w, 0, x + w, 0); pg.addColorStop(0, 'rgba(255,230,150,0)'); pg.addColorStop(.5, 'rgba(255,250,225,.95)'); pg.addColorStop(1, 'rgba(255,230,150,0)');
      g.fillStyle = pg; g.beginPath(); g.moveTo(x - w * .6, y - H); g.lineTo(x + w * .6, y - H); g.lineTo(x + w, y); g.lineTo(x - w, y); g.closePath(); g.fill();
      ltSoft(g, x, y, 30 * (1 - k * .3), .8, '255,230,150'); g.restore();
      g.save(); g.globalAlpha = al * .9; g.fillStyle = 'rgba(255,225,140,.9)'; const fx = x + Math.sin(k * 6 + j) * 10, fy = y - 60 + k * 50; g.translate(fx, fy); g.rotate(Math.sin(k * 5 + j) * .8);
      g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(4, -1, 0, 6); g.quadraticCurveTo(-3, -1, 0, -6); g.fill(); g.restore(); }}); }
  try { skfxShake(2); } catch (e) {} }
// the curse creeping from one monster to the next: a dark violet wisp curving through the air
function ltWispFx(a, b){ if (typeof skfxAdd !== 'function') return; const x0 = a.x, y0 = a.y - (MOB_H[a.type] || 30) * .6, x1 = b.x, y1 = b.y - (MOB_H[b.type] || 30) * .6, mx = (x0 + x1) / 2 + (ltH(b.id || 1) - .5) * 40, my = Math.min(y0, y1) - 30;
  skfxAdd({life:.7, t:0, draw(g, k){ const n = 10; for (let i = 0; i < n; i++){ const u = Math.max(0, Math.min(1, k * 1.5 - i * .04)), px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
      g.globalAlpha = (1 - k) * (1 - i / n) * .8; ltSoft(g, px, py, 7 - i * .4, .8, i < 3 ? '170,90,240' : '60,20,90'); } g.globalAlpha = 1; }}); }
// the shadow spear: a long dark spear with a violet edge flying straight to its target, smoke trailing
function ltSpearFx(x0, y0, m){ if (typeof skfxAdd !== 'function') return; const x1 = m.x, y1 = m.y - (MOB_H[m.type] || 30) * .5, a = Math.atan2(y1 - (y0 - 26), x1 - x0);
  skfxAdd({life:.32, t:0, draw(g, k){ const x = x0 + (x1 - x0) * k, y = y0 - 26 + (y1 - y0 + 26) * k;
    for (let i = 1; i <= 6; i++){ const u = Math.max(0, k - i * .04); g.globalAlpha = .5 * (1 - i / 7); ltSoft(g, x0 + (x1 - x0) * u, y0 - 26 + (y1 - y0 + 26) * u, 8, .7, '50,20,80'); }
    g.save(); g.globalAlpha = 1; g.translate(x, y); g.rotate(a); g.strokeStyle = '#2a1238'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-22, 0); g.lineTo(6, 0); g.stroke();
    g.fillStyle = '#4a2068'; g.beginPath(); g.moveTo(16, 0); g.quadraticCurveTo(8, -5, 4, -3.5); g.lineTo(4, 3.5); g.quadraticCurveTo(8, 5, 16, 0); g.closePath(); g.fill(); g.strokeStyle = 'rgba(200,140,255,.9)'; g.lineWidth = .9; g.stroke(); g.restore(); }}); }
/* trees, rain and pools drawn with the world */
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a);
    for (const o of LT.pools){ const x = o.x - cam.x, y = o.y - cam.y, al = Math.min(1, (T - o.t0) * 4, (o.until - T) * 1.5);
      g.save(); g.globalAlpha = al; g.translate(x, y); g.scale(1, .5); const pg = g.createRadialGradient(0, 0, 0, 0, 0, 58); pg.addColorStop(0, 'rgba(20,6,30,.85)'); pg.addColorStop(.7, 'rgba(50,20,80,.55)'); pg.addColorStop(1, 'rgba(80,30,120,0)'); g.fillStyle = pg; g.beginPath();
      for (let i = 0; i < 24; i++){ const q = i / 24 * 6.283, rr = 58 * (1 + Math.sin(q * 3 + T * 2) * .06 + Math.sin(q * 7 - T) * .04); i ? g.lineTo(Math.cos(q) * rr, Math.sin(q) * rr) : g.moveTo(Math.cos(q) * rr, Math.sin(q) * rr); } g.closePath(); g.fill(); g.restore();
      for (let i = 0; i < 5; i++){ const ph = (T * .6 + ltH(i)) % 1; g.globalAlpha = al * (1 - ph) * .5; ltSoft(g, x + (ltH(i, 2) - .5) * 70, y + (ltH(i, 3) - .5) * 26 - ph * 24, 6 + ph * 6, .6, '90,40,140'); } }
    for (const o of LT.rains){ const x = o.x - cam.x, y = o.y - cam.y, al = Math.min(1, (T - o.t0) * 3, (o.until - T) * 1.5);
      g.save(); g.globalAlpha = al; g.translate(x, y); g.scale(1, .5); const rg = g.createRadialGradient(0, 0, 0, 0, 0, o.r); rg.addColorStop(0, 'rgba(120,220,140,.32)'); rg.addColorStop(.8, 'rgba(90,200,120,.2)'); rg.addColorStop(1, 'rgba(90,200,120,0)'); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, o.r, 0, 7); g.fill(); g.restore(); }
    return r; }; }
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a);
    // herbal rain: soft green drops falling, little leaves drifting, splashes
    for (const o of LT.rains){ const x = o.x - cam.x, y = o.y - cam.y, al = Math.min(1, (T - o.t0) * 3, (o.until - T) * 1.5);
      g.save(); g.globalAlpha = al * .8; g.strokeStyle = 'rgba(170,240,180,.8)'; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath();
      for (let i = 0; i < 50; i++){ const ph = (T * 2.2 + ltH(i, 5)) % 1, rx = (ltH(i, 6) - .5) * o.r * 2, ry = (ltH(i, 7) - .5) * o.r; if (rx * rx / (o.r * o.r) + ry * ry / (o.r * o.r * .25) > 1) continue; const px = x + rx, py = y + ry - 110 + ph * 110; g.moveTo(px, py); g.lineTo(px - 1.5, py - 9); } g.stroke();
      for (let i = 0; i < 8; i++){ const ph = (T * .5 + ltH(i, 8)) % 1, px = x + (ltH(i, 9) - .5) * o.r * 1.6 + Math.sin(T * 2 + i) * 8, py = y - 90 + ph * 90; g.globalAlpha = al * Math.sin(ph * Math.PI);
        g.save(); g.translate(px, py); g.rotate(T * 2 + i); g.fillStyle = i % 2 ? '#7ad06a' : '#a8e87a'; g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(3, 0, 0, 4); g.quadraticCurveTo(-3, 0, 0, -4); g.fill(); g.restore(); }
      g.restore(); }
    // the bodhi tree: a twisting trunk, a broad crown of heart-shaped leaves glowing gold-green, leaves falling
    for (const o of LT.trees){ const x = o.x - cam.x, y = o.y - cam.y, grow = Math.min(1, (T - o.t0) / .8), al = Math.min(1, (o.until - T) * 1.2);
      g.save(); g.globalAlpha = al;
      g.save(); g.translate(x, y); g.scale(1, .5); const pg = g.createRadialGradient(0, 0, 0, 0, 0, 110); pg.addColorStop(0, 'rgba(255,240,170,.22)'); pg.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = pg; g.beginPath(); g.arc(0, 0, 110, 0, 7); g.fill(); g.restore();
      const H = 64 * grow, tr = g.createLinearGradient(x - 6, 0, x + 6, 0); tr.addColorStop(0, '#5a3a20'); tr.addColorStop(.5, '#8a6038'); tr.addColorStop(1, '#4a2e18');
      g.fillStyle = tr; g.beginPath(); g.moveTo(x - 7, y); g.quadraticCurveTo(x - 4, y - H * .5, x - 3 + Math.sin(T) * .5, y - H); g.lineTo(x + 3 + Math.sin(T) * .5, y - H); g.quadraticCurveTo(x + 5, y - H * .5, x + 8, y); g.closePath(); g.fill();
      g.strokeStyle = '#6a4628'; g.lineWidth = 2; g.lineCap = 'round'; for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(x, y - H * .7); g.quadraticCurveTo(x + sd * 10, y - H * .85, x + sd * 18 * grow, y - H * .95); g.stroke(); }
      if (grow > .3){ g.globalCompositeOperation = 'lighter'; ltSoft(g, x, y - H - 6, 44 * grow, .3, '255,235,140'); g.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 26; i++){ const a = ltH(i, 11) * 6.283, rr = Math.sqrt(ltH(i, 12)) * 30 * grow, lx = x + Math.cos(a) * rr * 1.2, ly = y - H - 4 + Math.sin(a) * rr * .65 + Math.sin(T * 1.5 + i) * .8, s = (5 + ltH(i, 13) * 2.5) * grow;
          g.save(); g.translate(lx, ly); g.rotate(a + Math.sin(T + i) * .15); g.fillStyle = i % 3 ? '#5aa83a' : i % 2 ? '#8ad050' : '#c8e870';
          g.beginPath(); g.moveTo(0, s); g.bezierCurveTo(-s * 1.1, s * .2, -s * .7, -s * .9, 0, -s * .5); g.bezierCurveTo(s * .7, -s * .9, s * 1.1, s * .2, 0, s); g.fill(); g.restore(); }
        for (let i = 0; i < 5; i++){ const ph = (T * .35 + ltH(i, 14)) % 1, lx = x + (ltH(i, 15) - .5) * 60 + Math.sin(T * 1.8 + i) * 10, ly = y - H + ph * (H + 6); g.globalAlpha = al * Math.sin(ph * Math.PI) * .9;
          g.save(); g.translate(lx, ly); g.rotate(T * 2 + i); g.fillStyle = '#d8e880'; const s = 3.5; g.beginPath(); g.moveTo(0, s); g.bezierCurveTo(-s, 0, -s * .6, -s, 0, -s * .5); g.bezierCurveTo(s * .6, -s, s, 0, 0, s); g.fill(); g.restore(); } }
      g.restore(); }
    return r; }; }
