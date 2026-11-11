/* VAYRATHEN — js/world/aren266.js — (v266) Aren comes alive
   The owner: the fountain in the middle of town is a still picture — make it live, with the fire and the water
   belonging together; and the shopkeepers should not stand frozen, they should have more going on.
   · THE FOUNTAIN (over the garden picture, plaza.jpg): water springs from the top spout in arcs, spills over each tier
     in shimmering sheets, rings spread across the basin, droplets sparkle and a fine mist drifts — all drawn with the
     same soft light as the tower's fire, cool blue against its warm orange.
   · THE LANTERNS painted in the garden burn with the tower's particle fire (smaller), and throw warm light.
   · THE SHOPKEEPERS (every NPC with a shop in Aren) potter about in front of their shop: they stroll a few steps,
     stop, turn to their counter and work at it (the smiths strike sparks, the cook's pot steams, the herbalist's
     leaves drift…), look at you when you come close and say a line about their trade now and then. Talking to one
     stops them where they are. */
'use strict';

/* ---------- where the garden picture lies (same as towerimg263.js) ---------- */
const ARN = {fl:[], drops:[], rings:[], mist:[]};
const arnPlaza = () => { const im = typeof TIMG !== 'undefined' && TIMG.plaza; if (!im || typeof ARC === 'undefined') return null;
  const w = (typeof SHOPR !== 'undefined' ? SHOPR.rx - 100 : ARC.r) / .44, h = w * im.naturalHeight / im.naturalWidth; return {cx:ARC.x, cy:ARC.y, w, h}; };
const arnAt = (p, fx, fy) => [p.cx + (fx - .5) * p.w, p.cy + (fy - .5) * p.h];
const arnOn = () => typeof MAP_ID !== 'undefined' && MAP_ID === 0 && !(typeof DG !== 'undefined' && DG.active) && !!arnPlaza();
// fountain parts (fractions of the picture): the spout, the middle tier, the basin
const ARN_SPOUT = [.5, .543], ARN_TIER = [.5, .603, .03, .012], ARN_TIER2 = [.5, .575, .016], ARN_BASIN = [.5, .627, .045, .03];
const ARN_FIRE = [[.426, .866, .7], [.573, .863, .7], [.164, .132, .6], [.835, .128, .6], [.935, .368, .55], [.065, .368, .55]];
const arnFL = ARN_FIRE.map(() => []);

EV.on('tick', dt => {
  if (!arnOn()){ ARN.drops.length = ARN.rings.length = ARN.mist.length = 0; for (const l of arnFL) l.length = 0; return; }
  const p = arnPlaza(), [sx0, sy0] = arnAt(p, ...ARN_SPOUT), bw = ARN_BASIN[2] * p.w, bh = ARN_BASIN[3] * p.h, [bx, by] = arnAt(p, ARN_BASIN[0], ARN_BASIN[1]);
  // water from the spout: droplets thrown up and out in arcs, falling back into the tiers
  for (let k = 0, n = Math.round(dt * 60); k < n; k++){ const a = Math.random() * 6.283, sp = 5 + Math.random() * 7;
    ARN.drops.push({x:sx0, y:sy0, vx:Math.cos(a) * sp, vy:-26 - Math.random() * 12, vz:Math.sin(a) * sp * .45, t:0, life:.7 + Math.random() * .3}); }
  for (const d of ARN.drops){ d.t += dt; d.x += d.vx * dt; d.y += (d.vy + d.vz) * dt; d.vy += 90 * dt; }
  for (let i = ARN.drops.length - 1; i >= 0; i--){ const d = ARN.drops[i]; if (d.t > d.life || (d.vy > 0 && d.y > sy0 + 14)){ if (Math.random() < .08) ARN.rings.push({x:d.x, y:Math.min(d.y, by + 4), t:0}); ARN.drops.splice(i, 1); } }
  if (ARN.drops.length > 260) ARN.drops.splice(0, ARN.drops.length - 260);
  // rings across the basin, mist over it
  if (Math.random() < dt * 2.5){ const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * .8; ARN.rings.push({x:bx + Math.cos(a) * bw * r, y:by + Math.sin(a) * bh * r, t:0}); }
  for (const r of ARN.rings) r.t += dt; for (let i = ARN.rings.length - 1; i >= 0; i--) if (ARN.rings[i].t > 1.4) ARN.rings.splice(i, 1);
  if (ARN.mist.length < 5 && Math.random() < dt * 1.2) ARN.mist.push({x:bx + (Math.random() - .5) * bw * 1.4, y:by - 10 - Math.random() * 20, t:0, life:3 + Math.random() * 2});
  for (const m of ARN.mist){ m.t += dt; m.y -= 6 * dt; m.x += Math.sin(T + m.life) * 4 * dt; } for (let i = ARN.mist.length - 1; i >= 0; i--) if (ARN.mist[i].t > ARN.mist[i].life) ARN.mist.splice(i, 1);
  // the lanterns' fire (the tower's particles, smaller)
  ARN_FIRE.forEach((f, i) => { const l = arnFL[i], s = f[2], [x, y] = arnAt(p, f[0], f[1]), n = dt * 60 * s; for (let k = 0; k < Math.floor(n) + (Math.random() < n % 1 ? 1 : 0); k++) l.push({x:x + (Math.random() - .5) * 6 * s, y:y - 3 * s, vx:(Math.random() - .5) * 6 * s, vy:-(20 + Math.random() * 22) * s, t:0, life:.5 + Math.random() * .4, r:(4 + Math.random() * 2.4) * s, ph:Math.random() * 6.28});
    for (const q of l){ q.t += dt; q.x += (q.vx + Math.sin(T * 7 + q.ph) * 5 * s) * dt + (x - q.x) * dt * 1.6; q.y += q.vy * dt; } for (let k = l.length - 1; k >= 0; k--) if (l[k].t >= l[k].life) l.splice(k, 1); if (l.length > 90) l.splice(0, l.length - 90); });
});
/* the fountain draws under the hero (it is ground-level water in the picture); the lanterns' fire over it */
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (!arnOn()) return r;
    const p = arnPlaza(), [bx, by] = arnAt(p, ARN_BASIN[0], ARN_BASIN[1]), bw = ARN_BASIN[2] * p.w, bh = ARN_BASIN[3] * p.h, [tx, ty] = arnAt(p, ARN_TIER[0], ARN_TIER[1]), tw = ARN_TIER[2] * p.w, [sx0, sy0] = arnAt(p, ...ARN_SPOUT);
    g.save(); const X = x => x - cam.x, Y = y => y - cam.y;
    // the basin's water: a slow shimmer of light bands and a soft glow
    g.save(); g.beginPath(); g.ellipse(X(bx), Y(by), bw, bh, 0, 0, 7); g.clip(); g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 6; k++){ const ph = T * .9 + k * 1.05, xx = X(bx) + Math.sin(ph) * bw * .7, yy = Y(by) + Math.cos(ph * 1.3) * bh * .6; const gr = g.createRadialGradient(xx, yy, 1, xx, yy, bw * .45); gr.addColorStop(0, 'rgba(170,230,255,.14)'); gr.addColorStop(1, 'rgba(170,230,255,0)'); g.fillStyle = gr; g.fillRect(xx - bw, yy - bh, bw * 2, bh * 2); }
    g.restore();
    // ripples
    g.lineWidth = 1.2; for (const rr of ARN.rings){ const u = rr.t / 1.4; g.strokeStyle = `rgba(230,250,255,${.55 * (1 - u)})`; g.beginPath(); g.ellipse(X(rr.x), Y(rr.y), 2 + u * 14, (2 + u * 14) * .45, 0, 0, 7); g.stroke(); }
    // the sheets of water spilling over the middle tier and the top: falling bands of light
    g.globalCompositeOperation = 'lighter';
    g.globalCompositeOperation = 'screen';
    { const [t2x, t2y] = arnAt(p, ARN_TIER2[0], ARN_TIER2[1]), t2w = ARN_TIER2[2] * p.w;
      for (const [cx, cy, ww, hh, n] of [[X(tx), Y(ty), tw, 9, 9], [X(t2x), Y(t2y), t2w, 8, 6]]) for (let k = 0; k < n; k++){ const xx = cx + (k / (n - 1) - .5) * ww * 1.8, yy = cy + ((T * 26 + k * 3.7) % hh);
        g.strokeStyle = 'rgba(220,248,255,.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + 3); g.stroke(); } }
    // cool light round the fountain (the counterpart of the lanterns' warm light)
    { const pu = .75 + Math.sin(T * 1.7) * .15, gr = g.createRadialGradient(X(bx), Y(by) - 10, 4, X(bx), Y(by) - 10, bw * 2.2); gr.addColorStop(0, `rgba(120,200,255,${.12 * pu})`); gr.addColorStop(1, 'rgba(120,200,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(X(bx), Y(by) - 10, bw * 2.2, bh * 2.2, 0, 0, 7); g.fill(); }
    // the lanterns' warm light on the ground
    ARN_FIRE.forEach(f => { const [x, y] = arnAt(p, f[0], f[1]), fl = .8 + Math.sin(T * 9 + f[0] * 20) * .12; const gr = g.createRadialGradient(X(x), Y(y) + 8, 2, X(x), Y(y) + 8, 60 * f[2] * fl); gr.addColorStop(0, `rgba(255,160,70,${.3 * fl})`); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(X(x), Y(y) + 8, 60 * f[2] * fl, 30 * f[2] * fl, 0, 0, 7); g.fill(); });
    g.restore(); return r; }; }
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); if (!arnOn()) return r;
    g.save(); g.globalCompositeOperation = 'lighter';
    // the droplets: small bright beads of water with a sparkle now and then
    for (const d of ARN.drops){ const x = d.x - cam.x, y = d.y - cam.y, u = d.t / d.life; g.fillStyle = `rgba(210,245,255,${.8 * (1 - u * .5)})`; g.beginPath(); g.arc(x, y, .9, 0, 7); g.fill();
      if ((d.t * 10 + d.x) % 7 < .4){ g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(x - 2.5, y - .5, 5, 1); g.fillRect(x - .5, y - 2.5, 1, 5); } }
    for (const m of ARN.mist){ const u = m.t / m.life, x = m.x - cam.x, y = m.y - cam.y, gr = g.createRadialGradient(x, y, 1, x, y, 14); gr.addColorStop(0, `rgba(220,245,255,${.1 * Math.sin(u * Math.PI)})`); gr.addColorStop(1, 'rgba(220,245,255,0)'); g.fillStyle = gr; g.fillRect(x - 14, y - 14, 28, 28); }
    // the lanterns' fire (the tower's sprites)
    if (typeof TIMG_SPR !== 'undefined') ARN_FIRE.forEach((f, i) => { for (const q of arnFL[i]){ const u = q.t / q.life, rr = q.r * (1 - u * .75), spr = TIMG_SPR[u < .18 ? 0 : u < .45 ? 1 : u < .75 ? 2 : 3];
      g.globalAlpha = Math.min(1, (1 - u) * 1.15) * (u < .1 ? u * 10 : 1); g.drawImage(spr, q.x - cam.x - rr, q.y - cam.y - rr, rr * 2, rr * 2); } });
    g.restore(); return r; }; }

/* ---------- the shopkeepers' life ---------- */
// what each one does at the counter, and what they say about it
const ARN_JOB = {
  shop:{fx:'glint', say:[['ยาสดใหม่ทุกวันเลยจ้ะ', 'Fresh potions every day'], ['บาดเจ็บมาเหรอ แวะซื้อยาก่อนออกไปนะ', 'Hurt? Get a potion before you go']]},
  banker:{fx:'coin', say:[['ฝากของกับคลังปลอดภัยที่สุด', 'Your things are safest with the bank'], ['นับเบี้ยไม่หวาดไม่ไหวเลยวันนี้', 'So much Bia to count today']]},
  healer_oon:{fx:'heal', say:[['ใครบาดเจ็บ มาให้หมอดูหน่อย', 'Anyone hurt? Let me take a look'], ['บัฟฟรีนะจ๊ะ ก่อนออกล่า', 'Free blessings before the hunt']]},
  tailor:{fx:'thread', say:[['ผ้าไหมล็อตใหม่เพิ่งมาถึง', 'A new bolt of silk just came in'], ['ชุดนี้ใส่แล้วสวยแน่นอน', 'This one will look lovely on you']]},
  festival:{fx:'confetti', say:[['ชุดเทศกาลมีจำนวนจำกัดนะ', 'Festival outfits are limited'], ['เก็บเหรียญเทศกาลครบหรือยัง', 'Got all your festival coins?']]},
  registrar:{fx:'paper', say:[['นักผจญภัยหน้าใหม่ลงทะเบียนที่นี่', 'New adventurers sign up here'], ['ตั้งกิลด์กับเพื่อนสิ สนุกกว่าเยอะ', 'Start a guild with friends — far more fun']]},
  smith:{fx:'spark', say:[['ไฟกำลังได้ที่ ตีบวกเลยไหม', 'The fire is just right — refine now?'], ['ฟังเสียงค้อนสิ เพราะไหมล่ะ', 'Hear that hammer? Music']]},
  forger:{fx:'spark', say:[['แร่ดี ๆ หลอมออกมาก็ดี', 'Good ore makes good metal'], ['ระวังร้อนนะ เพิ่งเทเหล็กเสร็จ', 'Careful, hot — just poured']]},
  driller:{fx:'glint', say:[['เจาะรูการ์ดไหม ถอดการ์ดก็ได้นะ', 'Socket a card? I take them out too'], ['การ์ดดี ๆ ต้องใส่ของดี ๆ', 'A good card wants good gear']]},
  herbal:{fx:'leaf', say:[['สมุนไพรเพิ่งเก็บจากป่าเมื่อเช้า', 'Herbs picked this morning'], ['หม้อนี้ต้มยาบำรุงอยู่ อย่าเพิ่งแตะนะ', 'That pot is brewing a tonic — no touching']]},
  cook:{fx:'steam', say:[['หอมไหม แกงเพิ่งยกลงจากเตา', 'Smell that? The curry is just done'], ['กินก่อนออกล่า แรงดีขึ้นเยอะ', 'Eat before the hunt — you\'ll feel it']]},
  trader:{fx:'coin', say:[['รับซื้อทุกอย่าง ราคาดี', 'I buy everything, good prices'], ['วัตถุดิบล็อตนี้ขายดีมาก', 'These materials sell fast']]},
  beastkeeper:{fx:'heart', say:[['เจ้าตัวเล็กหิวแล้ว ขอไปให้อาหารก่อน', 'The little ones are hungry'], ['อยากได้สัตว์เลี้ยงสักตัวไหม', 'Fancy a pet?']]}
};
const ARN_L = new Map();
function arnLife(n){ let s = ARN_L.get(n); if (!s){ const home = typeof VNPC_AT !== 'undefined' && VNPC_AT[n.id] ? VNPC_AT[n.id] : [n.x, n.y]; s = {hx:home[0], hy:home[1], st:'idle', t:1 + Math.random() * 3, tx:home[0], ty:home[1], dir:0, sayCd:4 + Math.random() * 8, fx:[]}; ARN_L.set(n, s); n.x = s.hx; n.y = s.hy; } return s; }
EV.on('map', () => ARN_L.clear());
EV.on('tick', dt => {
  if (typeof MAP_ID === 'undefined' || MAP_ID !== 0 || (typeof DG !== 'undefined' && DG.active) || PAUSED) return;
  const dlg = document.getElementById('dialog'), talk = dlg && !dlg.hidden ? dlg.dataset.npc : null;
  for (const n of NPCS){ const job = ARN_JOB[n.id]; if (!job) continue; const s = arnLife(n), dP = Math.hypot(P.x - n.x, P.y - n.y);
    if (talk === n.id || P.npc === n || dP < 70){ s.st = 'look'; s.dir = SPR.dirFromVec(P.x - n.x, P.y - n.y); s.moving = false;
      if ((s.sayCd -= dt) <= 0 && dP < 120 && talk !== n.id && typeof tlSay === 'function'){ s.sayCd = 14 + Math.random() * 10; tlSay(n, job.say[(Math.random() * job.say.length) | 0]); if (typeof TL !== 'undefined') TL.map = MAP_ID; }
      continue; }
    if (s.st === 'look'){ s.st = 'idle'; s.t = 1; }
    s.sayCd -= dt;
    if (s.st === 'walk'){ const dx = s.tx - n.x, dy = s.ty - n.y, d = Math.hypot(dx, dy); if (d < 2){ s.st = Math.random() < .55 ? 'work' : 'idle'; s.t = s.st === 'work' ? 3 + Math.random() * 3 : 1.5 + Math.random() * 3; s.moving = false; continue; }
      const sp = 22 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); s.dir = SPR.dirFromVec(dx, dy); s.moving = true; continue; }
    if ((s.t -= dt) > 0){ if (s.st === 'work'){ s.dir = 4; if (Math.random() < dt * 5) arnWorkFx(n, s, job.fx); } continue; }   // 4 = facing back (the counter)
    // a few steps somewhere in front of the shop
    for (let k = 0; k < 6; k++){ const tx = s.hx + (Math.random() - .5) * 90, ty = s.hy + Math.random() * 28 - 6; if (typeof walkable !== 'function' || walkable(tx, ty, 10)){ s.tx = tx; s.ty = ty; s.st = 'walk'; break; } }
    if (s.st !== 'walk'){ s.st = 'idle'; s.t = 2; }
    if (s.sayCd <= 0 && dP < 260 && Math.random() < .3 && typeof tlSay === 'function'){ s.sayCd = 18 + Math.random() * 14; tlSay(n, job.say[(Math.random() * job.say.length) | 0]); if (typeof TL !== 'undefined') TL.map = MAP_ID; }
  }
  for (const s of ARN_L.values()){ for (const f of s.fx){ f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.g || 0) * dt; } s.fx = s.fx.filter(f => f.t < f.life); }
});
function arnWorkFx(n, s, kind){ const x = n.x + (Math.random() - .5) * 10, y = n.y - 30;
  const add = o => s.fx.push({x, y, t:0, ...o});
  if (kind === 'spark') for (let k = 0; k < 3; k++) add({vx:(Math.random() - .5) * 60, vy:-30 - Math.random() * 30, g:90, life:.5, c:'255,180,60', r:1.4});
  else if (kind === 'steam') add({vx:(Math.random() - .5) * 6, vy:-14, life:1.6, c:'240,240,245', r:5, puff:true});
  else if (kind === 'leaf') add({vx:(Math.random() - .5) * 14, vy:-10, g:6, life:1.8, c:'120,200,90', r:2.2});
  else if (kind === 'coin') add({vx:(Math.random() - .5) * 20, vy:-36, g:80, life:.7, c:'255,215,90', r:1.8});
  else if (kind === 'heal') add({vx:0, vy:-16, life:1.2, c:'140,255,170', r:2, plus:true});
  else if (kind === 'heart') add({vx:(Math.random() - .5) * 8, vy:-14, life:1.3, c:'255,120,160', r:2.4, heart:true});
  else if (kind === 'confetti') add({vx:(Math.random() - .5) * 40, vy:-30, g:50, life:1, c:['255,110,150', '120,200,255', '255,220,90'][(Math.random() * 3) | 0], r:1.6});
  else add({vx:(Math.random() - .5) * 10, vy:-12, life:1, c:'255,250,220', r:1.4});
}
// drawn walking or turned to their counter; their little work effects over them
{ const _d = drawNpcW; drawNpcW = function(g, n){ const s = n && ARN_L.get(n); if (!s || typeof MAP_ID === 'undefined' || MAP_ID !== 0) return _d.apply(this, arguments);
    const x = n.x - cam.x, y = n.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) return;
    const sh = (typeof NPC_LOOKS !== 'undefined' && NPC_LOOKS[n.id] && npcSheet(n.id)) || SHEETS[NPC_SPR[n.id] || 'aunt']; shadowW(g, x, y, 9);
    const act = s.moving && sh && sh.index && sh.index.walk ? 'walk' : 'idle';
    SPR.draw(g, sh, act, s.dir || 0, T + (n.x % 7), x, y, {lazy:true});
    for (const f of s.fx){ const u = f.t / f.life, fx = f.x - cam.x, fy = f.y - cam.y; g.globalAlpha = 1 - u;
      if (f.puff){ g.fillStyle = `rgba(${f.c},.5)`; g.beginPath(); g.arc(fx, fy, f.r * (1 + u * 1.5), 0, 7); g.fill(); }
      else if (f.plus){ g.fillStyle = `rgba(${f.c},1)`; g.fillRect(fx - 3, fy - 1, 6, 2); g.fillRect(fx - 1, fy - 3, 2, 6); }
      else if (f.heart){ g.fillStyle = `rgba(${f.c},1)`; g.beginPath(); g.arc(fx - 1.4, fy, 1.6, 0, 7); g.arc(fx + 1.4, fy, 1.6, 0, 7); g.moveTo(fx - 3, fy + .4); g.lineTo(fx, fy + 3.6); g.lineTo(fx + 3, fy + .4); g.fill(); }
      else { g.fillStyle = `rgba(${f.c},1)`; g.beginPath(); g.arc(fx, fy, f.r, 0, 7); g.fill(); } }
    g.globalAlpha = 1; }; }
