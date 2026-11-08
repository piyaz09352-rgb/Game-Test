/* VAYRATHEN — js/sys/bosssig.js — every boss has its own signature move (ท่าไม้ตาย)
   Every 16–22 s in a fight a boss calls out its move by name and the ground shows where it will land (red marks):
   dodge-roll or step out before it goes off. Eight kinds of move, each boss with its own name and colour:
     pounce   vanishes and leaps out behind you: a heavy blow and a short stun
     meteor   marks five spots around you, then fire (or ice, or stone) falls on them
     wave     a straight line from the boss: a wave or blast sweeps along it and knocks you back
     quake    three rings roll out from the boss one after another
     web      a net lands where you stand: caught = held in place
     curse    a dark seal follows you, then bursts
     pillars  four columns of light come down in a cross around you
     vortex   drags you toward the boss, then strikes
   Rolling through any of them avoids the hit. */
'use strict';

const SIG = {
  boss:['ฝนเจลลี่ทองคำ', 'Golden Jelly Rain', 'meteor', '255,210,80'],
  whitemonkeyking:['หนุมานกระโจนเงา', 'Shadow Leap of the Monkey King', 'pounce', '255,240,200'],
  lotusturtle:['คลื่นบัวหลวง', 'Lotus Tide', 'wave', '120,210,255'],
  aikhiam:['หางฟาดน้ำวน', 'Whirlpool Tail', 'vortex', '90,170,220'],
  marketmatron:['ตะกร้าผีสาป', 'Cursed Basket', 'curse', '170,120,255'],
  dvarapala:['กระบองถล่มธรณี', 'Earthshaker Club', 'quake', '230,180,110'],
  cavematriarch:['พุ่งเหล็กในมรณะ', 'Death Sting Dive', 'pounce', '255,190,90'],
  saming:['เงาสมิงตะครุบ', 'Saming\'s Phantom Pounce', 'pounce', '255,170,60'],
  elderpop:['คำสาปปอบ', 'Curse of the Pop', 'curse', '150,255,140'],
  khankhak:['ฝนพญาคันคาก', 'Rain of the Toad King', 'meteor', '120,200,255'],
  templecolossus:['คำรามสะเทือนเทวาลัย', 'Temple-shaking Roar', 'quake', '240,210,140'],
  andamancrab:['ฟองคลื่นอันดามัน', 'Andaman Foam', 'web', '200,240,255'],
  seaogress:['คลื่นยักษ์ผีเสื้อสมุทร', 'The Ogress\'s Great Wave', 'wave', '80,200,240'],
  phantomgeneral:['ทัพผีบุกตะลุย', 'Charge of the Ghost Army', 'wave', '200,170,255'],
  lordkotchasi:['คชสีห์เหยียบปฐพี', 'Kotchasi Stomp', 'quake', '255,200,90'],
  waterelephantking:['งวงวารีวน', 'Trunk of the Whirling Waters', 'vortex', '80,170,255'],
  laplaelord:['ม่านหมอกลับแล', 'Veil of Laplae', 'curse', '220,220,255'],
  nagaking:['พญานาคพ่นน้ำ', 'Naga\'s Torrent', 'vortex', '90,230,200'],
  tenfacedogre:['สิบพักตร์ถล่มฟ้า', 'Ten Faces Bring Down the Sky', 'meteor', '255,120,60'],
  garudaking:['ปีกครุฑพายุ', 'Storm of the Garuda\'s Wings', 'vortex', '255,200,120'],
  vessavana:['ตะบองท้าวเวสสุวรรณ', 'Vessavana\'s Mace', 'pillars', '120,180,255'],
  scorpionking:['พายุทรายแมงป่อง', 'Scorpion Sandstorm', 'web', '230,200,140'],
  redcliffgiant:['หินผาถล่ม', 'Cliff Fall', 'meteor', '220,120,80'],
  firenaga:['ลาวาพญานาค', 'Naga Lava Flood', 'wave', '255,120,40'],
  ashwolfking:['เขี้ยวเถ้าตะครุบ', 'Ash Fang Pounce', 'pounce', '200,190,180'],
  agnilord:['อัคนีพิโรธ', 'Wrath of Agni', 'meteor', '255,90,30'],
  iceturtlelord:['ธารน้ำแข็งคลืบคลาน', 'Creeping Glacier', 'quake', '170,230,255'],
  frostqueen:['ฝูงผึ้งน้ำแข็ง', 'Ice Swarm', 'meteor', '190,235,255'],
  mammothking:['ช้างศึกถล่มน้ำแข็ง', 'Mammoth Avalanche', 'quake', '210,235,255'],
  snowking:['พายุหิมะราชา', 'The Snow King\'s Blizzard', 'pillars', '220,245,255'],
  asuraking:['อสูรวัชระ', 'Vajra of the Asura', 'pillars', '255,80,120']
};
const SIG_ELEM = {fire:'meteor', water:'wave', earth:'quake', wind:'vortex', holy:'pillars', shadow:'curse', poison:'web', neutral:'pounce'};
const sigOf = m => { const d = m.def, o = SIG[m.type]; if (o) return {th:o[0], en:o[1], kind:o[2], col:o[3]};
  return {th:'ท่าไม้ตาย', en:'Signature Move', kind:SIG_ELEM[d.elem] || 'quake', col:'255,140,90'}; };
const SG2 = {marks:[]};
const sigHit = (m, mult, x, y, r) => { if (P.dead || P.roll) return false; if (Math.hypot(P.x - x, (P.y - y) * 1.6) > r) return false; mobAttack(m, mult, true); return true; };
function sigStart(m){
  const s = sigOf(m), M0 = {m, s, t:0, kind:s.kind, x:P.x, y:P.y};
  if (s.kind === 'meteor'){ M0.spots = [[P.x, P.y]]; for (let i = 0; i < 4; i++){ const a = i / 4 * Math.PI * 2 + Math.random(); M0.spots.push([P.x + Math.cos(a) * 75, P.y + Math.sin(a) * 45]); } M0.dur = 1.6; }
  else if (s.kind === 'pillars'){ M0.spots = [[P.x + 55, P.y], [P.x - 55, P.y], [P.x, P.y + 34], [P.x, P.y - 34], [P.x, P.y]]; M0.dur = 1.5; }
  else if (s.kind === 'wave'){ const d = Math.hypot(P.x - m.x, P.y - m.y) || 1; M0.ux = (P.x - m.x) / d; M0.uy = (P.y - m.y) / d; M0.dur = 1.3; }
  else if (s.kind === 'quake') M0.dur = 2.2;
  else if (s.kind === 'web') M0.dur = 1.1;
  else if (s.kind === 'curse') M0.dur = 1.8;
  else if (s.kind === 'vortex') M0.dur = 2;
  else M0.dur = 1.2;   // pounce
  m.sig = M0; m.busy = Math.max(m.busy || 0, M0.dur + .3); m.charge = null;
  if (typeof bossShout === 'function') bossShout(m, 'rage', L(s.th, s.en)); else banner(L(`${nm(m.def)} · ${s.th}!`, `${m.def.en} · ${s.en}!`)); SFX.play('roar'); VFX.shake(3);
  if (s.kind === 'pounce'){ m.hiddenSig = true; VFX.play('smokeBomb', {x:m.x, y:m.y}); }
}
function sigStep(m, dt){
  const g = m.sig, k0 = g.t; g.t += dt; const t = g.t, s = g.s, d = m.def;
  if (g.kind === 'pounce'){ if (t >= .7 && k0 < .7){ const bx = P.x - (P.dir != null && P.face ? P.face : 1) * 40, by = P.y + 6; m.x = clamp(bx, 30, W - 30); m.y = clamp(by, 40, H - 30); m.hiddenSig = false; VFX.play('smokeBomb', {x:m.x, y:m.y}); }
    if (t >= .95 && k0 < .95){ if (sigHit(m, 1.8, m.x, m.y, 70)){ P.stunT = Math.max(P.stunT || 0, 1); VFX.play('stunStars', {}); } VFX.play('slashHit', {x:P.x, y:P.y - 20, gold:true, big:true}); VFX.shake(5); } }
  else if (g.kind === 'meteor' || g.kind === 'pillars'){ if (t >= g.dur - .25 && k0 < g.dur - .25){ let hit = false;
      for (const [x, y] of g.spots){ VFX.play(g.kind === 'meteor' ? 'quake' : 'grand', g.kind === 'meteor' ? {x, y, r:30} : {x, y, p:.6, col:`rgba(${s.col},1)`}); if (!hit && sigHit(m, g.kind === 'meteor' ? 1.4 : 1.5, x, y, 36)) hit = true; }
      VFX.shake(6); } }
  else if (g.kind === 'wave'){ if (t >= 1 && k0 < 1){ const px = P.x - m.x, py = P.y - m.y, along = px * g.ux + py * g.uy, side = Math.abs(px * g.uy - py * g.ux);
      VFX.play('pierce', {x:m.x, y:m.y, ux:g.ux, uy:g.uy, len:380});
      if (along > 0 && along < 380 && side < 34 && !P.roll && !P.dead){ mobAttack(m, 1.5, true); P.x = clamp(P.x + g.ux * 70, 30, W - 30); P.y = clamp(P.y + g.uy * 45, 40, H - 30); if (typeof pushOut === 'function') pushOut(P, 10); } VFX.shake(5); } }
  else if (g.kind === 'quake'){ for (const at of [.5, 1.1, 1.7]) if (t >= at && k0 < at){ const r = 60 + (at - .5) * 110; VFX.play('quake', {x:m.x, y:m.y, r}); VFX.shake(4);
      const dd = Math.hypot(P.x - m.x, (P.y - m.y) * 1.6); if (dd < r + 18 && dd > r - 40 && !P.roll && !P.dead) mobAttack(m, 1.1, true); } }
  else if (g.kind === 'web'){ if (t >= .9 && k0 < .9){ if (sigHit(m, 1, g.x, g.y, 46)){ P.stunT = Math.max(P.stunT || 0, 2); P.tx = null; addText(P.x, P.y - 66, L('ติดใย!', 'Webbed!'), '#e8e8f0', 16); } } }
  else if (g.kind === 'curse'){ if (t < 1.4){ g.x += (P.x - g.x) * Math.min(1, dt * 2.2); g.y += (P.y - g.y) * Math.min(1, dt * 2.2); }
    if (t >= 1.6 && k0 < 1.6){ VFX.play('grand', {x:g.x, y:g.y, p:.5, col:`rgba(${s.col},1)`}); sigHit(m, 1.8, g.x, g.y, 46); VFX.shake(4); } }
  else if (g.kind === 'vortex'){ if (t < 1.5 && !P.dead && !P.roll){ const dx = m.x - P.x, dy = m.y - P.y, dd = Math.hypot(dx, dy) || 1; if (dd > 50 && dd < 420){ const v = 110 * dt; P.x += dx / dd * v; P.y += dy / dd * v; if (typeof pushOut === 'function') pushOut(P, 10); } }
    if (t >= 1.6 && k0 < 1.6){ VFX.play('quake', {x:m.x, y:m.y, r:80}); sigHit(m, 1.6, m.x, m.y, 85); VFX.shake(5); } }
  if (t >= g.dur){ m.sig = null; m.hiddenSig = false; m.sigCd = 16 + Math.random() * 6; }
}
{ const _ub = updBoss;
  updBoss = function(m, dt){
    if (m.dead) return _ub.apply(this, arguments);
    if (m.sig){ if (P.dead){ m.sig = null; m.hiddenSig = false; } else { sigStep(m, dt); return true; } }
    m.sigCd = (m.sigCd ?? 9) - dt;
    if (m.sigCd <= 0 && m.aggro && !P.dead && !m.charge && !(m.busy > 0) && Math.hypot(P.x - m.x, P.y - m.y) < 420 && !inVillage(P)){ sigStart(m); return true; }
    return _ub.apply(this, arguments);
  };
}
/* a boss in the middle of its vanishing pounce is not drawn */
if (typeof drawMobW === 'function'){ const _dm = drawMobW; drawMobW = function(g, m){ if (m && m.hiddenSig) return; return _dm.apply(this, arguments); }; }
/* the warning marks on the ground */
if (typeof LIVE !== 'undefined'){ const _u = LIVE.drawUnder;
  LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a);
    for (const m of mobs){ const s = m.sig; if (!s || m.dead) continue; const k = Math.min(1, s.t / Math.max(.3, s.dur - .25)), col = s.s.col, pulse = .35 + Math.sin(T * 16) * .12;
      const mark = (x, y, rx, ry) => { g.save(); g.fillStyle = `rgba(${col},${.12 + k * .2})`; g.strokeStyle = `rgba(255,60,40,${pulse + k * .3})`; g.lineWidth = 2;
        g.beginPath(); g.ellipse(x - cam.x, y - cam.y, rx, ry, 0, 0, 7); g.fill(); g.stroke();
        g.fillStyle = `rgba(255,70,50,${.25 + k * .3})`; g.beginPath(); g.ellipse(x - cam.x, y - cam.y, rx * k, ry * k, 0, 0, 7); g.fill(); g.restore(); };
      if (s.kind === 'meteor' || s.kind === 'pillars') for (const [x, y] of s.spots) mark(x, y, 36, 22);
      else if (s.kind === 'web' || s.kind === 'curse') mark(s.x, s.y, 46, 28);
      else if (s.kind === 'vortex') mark(m.x, m.y, 85, 52);
      else if (s.kind === 'quake'){ for (const at of [.5, 1.1, 1.7]) if (s.t < at){ const rr = 60 + (at - .5) * 110; g.save(); g.strokeStyle = `rgba(255,60,40,${.3 + pulse * .4})`; g.lineWidth = 3; g.beginPath(); g.ellipse(m.x - cam.x, m.y - cam.y, rr, rr * .62, 0, 0, 7); g.stroke(); g.restore(); } }
      else if (s.kind === 'wave' && s.t < 1){ g.save(); g.translate(m.x - cam.x, m.y - cam.y); g.rotate(Math.atan2(s.uy, s.ux)); g.fillStyle = `rgba(255,60,40,${.15 + k * .25})`; g.strokeStyle = `rgba(255,60,40,${pulse + .2})`; g.lineWidth = 2; g.fillRect(0, -34, 380, 68); g.strokeRect(0, -34, 380, 68); g.fillStyle = `rgba(${col},.35)`; g.fillRect(0, -34, 380 * k, 68); g.restore(); }
      else if (s.kind === 'pounce' && s.t < .7) mark(P.x, P.y, 40, 24);
    }
    return r; };
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'bosssig', t:['ท่าไม้ตายบอส', 'Boss signature moves'], b:() => `<p>${L('บอสทุกตัวมีท่าไม้ตายของตัวเอง ใช้ทุก 16–22 วิ · พื้นจะขึ้นวงแดงเตือนก่อน · กลิ้งหลบหรือเดินออกจากวงทัน = ไม่โดน', 'Every boss has its own signature move every 16–22 s · red marks warn you first · roll or step out in time and it misses')}</p>
  <table class="wkt"><tr><th>${L('บอส', 'Boss')}</th><th>${L('ท่าไม้ตาย', 'Move')}</th></tr>${Object.keys(SIG).filter(k => MOB[k]).map(k => `<tr><td>${nm(MOB[k])}</td><td>${L(SIG[k][0], SIG[k][1])}</td></tr>`).join('')}</table>`});
