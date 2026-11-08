/* VAYRATHEN — js/sys/beastkeeper.js — the beast keeper of Aren (ลุงบุญมา): helper robots, capture gear, the hunter's pet guide
   · (v274) HELPER ROBOTS replace the old rented animals (the owner had them removed). A helper NEVER fights and
     monsters ignore it; it fetches drops, the most important in reach first (gear by rarity, then value: helperScore).
       – FREE (3 kinds, for new players): pick one at Boonma's and keep it for good, swap between the three any time.
         No buff at all · slow: one item every 2 seconds.
       – RENTED (9 kinds, Vayra Coins by the day / week / month on the real clock): EXP +10% and Job EXP +10%, plus a
         small extra of its own · one item a second. When a rental runs out, your free robot comes back.
     Old animal rentals still running are ended once and refunded in Bia for the time left.
     Saved: S.helper = {k, left, until} (rented) or {k, free:1}; S.helperFree = the free one you picked.
     It is separate from a Hunter's fighting pet (sys/tamed.js), so both can be out at once.
   · GUIDE: a Hunter / Wildwarden with no fighting pet gets a banner at the job change, a line under the quest
     tracker and pet-skill tooltips saying how to catch one (T). */
'use strict';

/* shape: how it is drawn (drawBot) · c: body, dark, glow · b: the extra buff on DER · free: the starter robots */
const HELPERS = {
  bit:{free:1, shape:'cube', c:['#cfd8e2', '#4a5866', '#7fe0ff'], th:'บิท', en:'BIT', buff:['ไม่มีบัฟ · เก็บ 2 วิ/ชิ้น', 'No buff · 2 s per item'], b:() => {},
    say:['หุ่นกล่องตัวจิ๋ว ขยันแต่ช้าหน่อย', 'A tiny box bot: hard-working, a little slow']},
  byte:{free:1, shape:'sphere', c:['#d6e6dc', '#46604e', '#8affc0'], th:'ไบต์', en:'BYTE', buff:['ไม่มีบัฟ · เก็บ 2 วิ/ชิ้น', 'No buff · 2 s per item'], b:() => {},
    say:['ลูกบอลมีเสาอากาศ กลิ้งตามไปทุกที่', 'A ball with an antenna that rolls after you']},
  chip:{free:1, shape:'tripod', c:['#e2dacb', '#64584a', '#ffd27f'], th:'ชิป', en:'CHIP', buff:['ไม่มีบัฟ · เก็บ 2 วิ/ชิ้น', 'No buff · 2 s per item'], b:() => {},
    say:['ฝักลอยสามขา ใจดีแต่ไม่รีบ', 'A three-legged hover pod, kind but never in a hurry']},
  nexa:{shape:'quad', c:['#e8fbff', '#0f5f7a', '#38e1ff'], th:'เน็กซ่า', en:'NEXA', buff:['ความเร็วเดิน +5%', 'Move speed +5%'], b:D => { D.move *= 1.05; }, spd:1.3,
    say:['โดรนสี่ใบพัด บินไวที่สุดในรุ่น', 'A quad-rotor drone, the fastest of the line']},
  aegis:{shape:'shield', c:['#e6eeff', '#1d3a8a', '#6a9cff'], th:'อีจิส', en:'AEGIS', buff:['DEF +5% · MDEF +5%', 'DEF +5% · MDEF +5%'], b:D => { D.def = Math.round(D.def * 1.05); D.mdef = Math.round(D.mdef * 1.05); },
    say:['แกนพลังงานมีแผ่นเกราะโคจรรอบ', 'An energy core ringed by orbiting plates']},
  pulse:{shape:'orb', c:['#fffbe0', '#7a5a00', '#ffe14a'], th:'พัลส์', en:'PULSE', buff:['CRIT +3', 'CRIT +3'], b:D => { D.crit += 3; },
    say:['ลูกบอลไฟฟ้า ประกายแล่บตลอดเวลา', 'A sphere of live current, always sparking']},
  vector:{shape:'jet', c:['#eafff0', '#1a6a3a', '#5aff9a'], th:'เวกเตอร์', en:'VECTOR', buff:['HIT +8 · FLEE +8 · เก็บได้ไกล', 'HIT +8 · FLEE +8 · long reach'], b:D => { D.hit += 8; D.flee += 8; }, reach:420, spd:1.4,
    say:['เครื่องบินปีกสามเหลี่ยม สแกนไกลสุด', 'A delta-wing hover jet that scans farthest']},
  quanta:{shape:'tesseract', c:['#f4eaff', '#4a1a8a', '#c07aff'], th:'ควอนต้า', en:'QUANTA', buff:['Max SP +6%', 'Max SP +6%'], b:D => { D.maxsp = Math.round(D.maxsp * 1.06); },
    say:['ลูกบาศก์ซ้อนมิติ คำนวณทุกอย่างได้', 'A folded hyper-cube that computes everything']},
  helix:{shape:'capsule', c:['#fff0f6', '#8a1a4a', '#ff7ab8'], th:'ฮีลิกซ์', en:'HELIX', buff:['ฟื้น HP/SP 1% ทุก 5 วิ', 'Regain 1% HP/SP every 5 s'], b:() => {}, regen:.01, regenT:5,
    say:['แคปซูลแพทย์ มีวงเกลียวดีเอ็นเอหมุนรอบ', 'A medic capsule wrapped in a turning DNA ring']},
  prism:{shape:'prism', c:['#ffffff', '#3a4a7a', '#9af0ff'], th:'พริซึม', en:'PRISM', buff:['MATK +4%', 'MATK +4%'], b:D => { D.matk = Math.round(D.matk * 1.04); },
    say:['คริสตัลโฮโลแกรม แตกแสงเป็นสีรุ้ง', 'A hologram crystal that splits light into rainbows']},
  titan:{shape:'mech', c:['#fff0e4', '#7a2a0a', '#ff7a3a'], th:'ไททัน', en:'TITAN', buff:['ATK +4%', 'ATK +4%'], b:D => { D.atk = Math.round(D.atk * 1.04); },
    say:['หัวหุ่นรบจิ๋ว ติดปืนใหญ่สองบ่า', 'A mini battle-mech head with twin shoulder cannons']},
  midas:{shape:'ring', c:['#fff8dc', '#7a5a10', '#ffcc33'], th:'ไมดาส', en:'MIDAS', buff:['ขายของได้เงิน +5%', 'Selling gives +5% Bia'], b:D => { D.pas = {...D.pas, biaPct:(D.pas.biaPct || 0) + .05}; },
    say:['ยามทองคำ ตาไวกับของมีราคา', 'A golden sentinel with an eye for value']}
};
const HLP_FREE = Object.keys(HELPERS).filter(k => HELPERS[k].free), HLP_PAID = Object.keys(HELPERS).filter(k => !HELPERS[k].free);
const HLP_EXP = .10, HLP_JOB = .10;   // every rented robot: EXP +10% and Job EXP +10%
/* by the day, the week or the month, on the real clock (it keeps running while you are offline) */
const RENT_TIME = [{s:86400, c:5, th:'1 วัน', en:'1 day'}, {s:604800, c:25, th:'7 วัน', en:'7 days'}, {s:2592000, c:80, th:'30 วัน', en:'30 days'}];
const rentPrice = (k, i) => RENT_TIME[i].c;
const hlpCoins = () => (typeof ACC !== 'undefined' && ACC.coins) || 0;
const helperOf = () => (S && S.helper && HELPERS[S.helper.k] && (S.helper.free || S.helper.left > 0) ? S.helper : null);
const helperPaid = () => { const h = helperOf(); return h && !h.free ? h : null; };
const isHunter = () => !!(S && JOBS[S.job] && jobChain().includes('ranger'));
const needPet = () => isHunter() && !S.pet;
const rentLeft = s => { s = Math.max(0, Math.ceil(s)); if (s >= 86400){ const dd = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600); return L(`${dd} วัน ${hh} ชม.`, `${dd}d ${hh}h`); } const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? L(`${h} ชม. ${m} นาที`, `${h}h ${m}m`) : m ? L(`${m} นาที`, `${m} min`) : L(`${s} วินาที`, `${s}s`); };

/* how much a drop matters: gear by rarity, then value; the helper always fetches the highest score first */
function helperScore(id){
  const it = ITEMS[id]; if (!it) return 0;
  const rar = it.rar || 0, val = Math.min(900, (it.sell || 0) / 4);
  return (it.kind === 'key' ? 5000 : 0) + (it.kind === 'gear' ? 2000 + rar * 1000 + (it.lv || 0) : rar * 600) + val + (it.kind === 'use' ? 40 : 0);
}
/* the buff, on top of everything else; rented robots also add EXP and Job EXP */
{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments); const h = helperOf(); if (h && DER) HELPERS[h.k].b(DER); if (DER && S){ S.hp = Math.min(S.hp, DER.maxhp); S.sp = Math.min(S.sp, DER.maxsp); } return r; }; }
{ const _ge = gainExp; gainExp = function(b, j){ if (helperPaid()){ b = Math.round(b * (1 + HLP_EXP)); j = Math.round((j || 0) * (1 + HLP_JOB)); } return _ge.call(this, b, j); }; }

const hlpPlace = () => { HLP.x = P.x + 20; HLP.y = P.y + 10; HLP.tgt = null; HLP.cd = .5; HLP.map = MAP_ID; };
/* the free robot: chosen once, kept for good, swapped any time (a running rental stays out until it ends) */
function chooseFree(k){
  if (!HELPERS[k] || !HELPERS[k].free) return false;
  S.helperFree = k; const R = HELPERS[k];
  if (!helperPaid()){ S.helper = {k, free:1}; hlpPlace(); VFX.play && VFX.play('petcall', {x:HLP.x, y:HLP.y}); }
  banner(L(`${R.th} พร้อมช่วยเก็บของแล้ว! (ฟรี ใช้ได้ตลอด)`, `${R.en} is ready to fetch your drops! (free, for keeps)`)); SFX.play('quest');
  derive(); dirty = true; save(); return true;
}
function rentHelper(k, i){
  const R = HELPERS[k], T0 = RENT_TIME[i]; if (!R || R.free || !T0) return false;
  const price = rentPrice(k, i), nmR = L(R.th, R.en), cur = helperPaid();
  if (hlpCoins() < price){ toast(L(`เหรียญวายราไม่พอ (ต้องใช้ ◈ ${price})`, `Not enough Vayra Coins (needs ◈ ${price})`)); return false; }
  ACC.coins -= price; if (typeof accSave === 'function') accSave(true);
  if (cur && cur.k === k){ cur.until = Math.max(cur.until || 0, Date.now()) + T0.s * 1000; cur.left = (cur.until - Date.now()) / 1000; toast(L(`ต่อเวลา ${nmR} · เหลือ ${rentLeft(cur.left)}`, `${nmR} extended · ${rentLeft(cur.left)} left`)); }
  else {
    S.helper = {k, left:T0.s, until:Date.now() + T0.s * 1000}; hlpPlace();
    banner(L(`เช่า ${nmR} แล้ว! เก็บของวินาทีละชิ้น · EXP +10% · JOB +10% · ${R.buff[0]} · ${T0.th}`, `${nmR} rented! One drop a second · EXP +10% · JOB +10% · ${R.buff[1]} · ${T0.en}`));
    VFX.play && VFX.play('petcall', {x:HLP.x, y:HLP.y});
  }
  derive(); log(L(`เช่าหุ่นผู้ช่วย: ${nmR} ${T0.th} · ◈ ${price} เหรียญวายรา`, `Helper robot: ${nmR} for ${T0.en} · ◈ ${price} Vayra Coins`), 'g');
  SFX.play('coin'); bump('rentals'); dirty = true; save(); return true;
}
/* a rental ends: run out ('expire') or handed back early ('return'); the free robot comes back */
function endHelper(why){
  const h = S.helper; if (!h) return; const R = HELPERS[h.k], nmR = R ? L(R.th, R.en) : '';
  S.helper = S.helperFree && HELPERS[S.helperFree] ? {k:S.helperFree, free:1} : null; HLP.tgt = null; derive();
  if (why === 'expire'){ banner(L(`หมดเวลาเช่า ${nmR} · เช่าต่อได้ที่ลุงบุญมา นครอาเรน`, `${nmR}'s rental is over · rent again from Uncle Boonma in Aren`)); SFX.play('bf_end');
    log(L(`หมดเวลาเช่า ${nmR}${S.helper ? ` · ${HELPERS[S.helper.k].th} กลับมาช่วยแทน` : ''}`, `${nmR}'s rental ended${S.helper ? ` · ${HELPERS[S.helper.k].en} is back` : ''}`)); }
  else toast(L(`คืน ${nmR} แล้ว`, `${nmR} handed back`));
  dirty = true; save();
}

/* ---------- the helper in the world ---------- */
const HLP = {x:0, y:0, dir:0, moving:false, map:-1, tgt:null, cd:0, t:0, rg:0, picks:0, face:1};
/* old saves: a fighting pet rented long ago goes home; an animal rental from before v274 is ended and refunded */
function helperMigrate(){
  if (S.petd && S.petd.rent){ const st = S.petStash; S.petStash = null;
    if (st && st.pet && MOB[st.pet]){ S.pet = st.pet; S.petd = st.petd; } else { S.pet = null; S.petd = null; }
    if (typeof PET !== 'undefined'){ PET.type = null; PET.down = 0; } save(); }
  if (S.helper && !HELPERS[S.helper.k]){ const left = S.helper.until ? (S.helper.until - Date.now()) / 1000 : S.helper.left || 0;
    const z = left > 0 ? Math.round(left / 86400 * (300 + 22 * S.lvl) * 12 / 10) * 10 : 0; S.helper = S.helperFree && HELPERS[S.helperFree] ? {k:S.helperFree, free:1} : null;
    if (z > 0) S.bia += z; derive(); dirty = true;
    log(L(`สัตว์เช่าแบบเดิมถูกนำออกจากเกม${z ? ` · คืนเงินเวลาที่เหลือ ${fmtN(z)} เบี้ย` : ''} · ลุงบุญมามีหุ่นผู้ช่วยแทน (ฟรี 3 แบบ)`, `The old animal rentals were retired${z ? ` · ${fmtN(z)} Bia refunded for the time left` : ''} · Uncle Boonma now has helper robots (3 free)`), 'g'); save(); }
}
EV.on('tick', dt => {
  if (!S || !S.job) return;
  if ((S.petd && S.petd.rent) || (S.helper && !HELPERS[S.helper.k])) helperMigrate();
  if (!S.helper && S.helperFree && HELPERS[S.helperFree]){ S.helper = {k:S.helperFree, free:1}; derive(); }
  const h = helperOf(); if (!h){ if (S.helper){ S.helper = null; derive(); } return; }
  if (!h.free){ const was = h.left; h.left = h.until ? (h.until - Date.now()) / 1000 : h.left - (PAUSED ? 0 : dt);
    if (was > 60 && h.left <= 60) toast(L(`${HELPERS[h.k].th} จะหมดเวลาเช่าใน 1 นาที`, `${HELPERS[h.k].en}'s rental ends in 1 minute`));
    if (h.left <= 0){ endHelper('expire'); return; } }
  const R = HELPERS[h.k], spd = 300 * (R.spd || 1);
  HLP.t += dt; HLP.cd -= dt;
  if (HLP.map !== MAP_ID) hlpPlace();
  if (R.regen && !P.dead){ HLP.rg += dt; if (HLP.rg >= (R.regenT || 4)){ HLP.rg = 0; S.hp = Math.min(DER.maxhp, S.hp + Math.ceil(DER.maxhp * R.regen)); S.sp = Math.min(DER.maxsp, S.sp + Math.ceil(DER.maxsp * R.regen)); } }
  if (HLP.tgt && !LOOT.includes(HLP.tgt)) HLP.tgt = null;
  if (!HLP.tgt && HLP.cd <= 0 && !P.dead){   // the most important drop in reach
    const reach = R.reach || 300; let best = null, bs = -Infinity;
    for (const l of LOOT){ if (dist(l, P) > reach) continue; const s = helperScore(l.id) - dist(l, HLP) / 50; if (s > bs){ bs = s; best = l; } }
    HLP.tgt = best;
  }
  let tx, ty;
  if (HLP.tgt){ tx = HLP.tgt.x; ty = HLP.tgt.y; }
  else { const sp = typeof compSpot === 'function' ? compSpot(HLP, 1) : {x:P.x + 26, y:P.y + 8}; tx = sp.x; ty = sp.y; }
  const d = Math.hypot(tx - HLP.x, ty - HLP.y);
  if (d > 700){ HLP.x = tx; HLP.y = ty; }
  HLP.moving = d > (HLP.tgt ? 2 : 8);
  if (HLP.moving){ const v = HLP.tgt ? spd : Math.min(spd, Math.max(60, d * 3)), k = Math.min(1, v * dt / d); if (Math.abs(tx - HLP.x) > 1) HLP.face = tx < HLP.x ? -1 : 1; HLP.x += (tx - HLP.x) * k; HLP.y += (ty - HLP.y) * k; HLP.dir = SPR.dirFromVec(tx - HLP.x || .01, ty - HLP.y); }
  if (HLP.tgt && Math.hypot(HLP.tgt.x - HLP.x, HLP.tgt.y - HLP.y) < 8){
    const l = HLP.tgt; HLP.tgt = null; HLP.cd = h.free ? 2 : 1; HLP.picks++; HLP.zap = .35;   // free: one item every 2 s · rented: one a second
    pickLoot(l); VFX.play && VFX.play('pickup', {x:HLP.x, y:HLP.y});
  }
  if (HLP.zap > 0) HLP.zap -= dt;
});

/* ---------- the robots' look: drawn in code, glowing, hovering ---------- */
function botGlow(g, x, y, r, col, a = .55){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.globalAlpha = 1; }
function botEye(g, x, y, w, col, t){ const blink = (t % 3.2) < .12 ? .2 : 1; g.fillStyle = '#0a1420'; g.beginPath(); g.roundRect ? g.roundRect(x - w, y - 2.6, w * 2, 5.2, 2.6) : g.rect(x - w, y - 2.6, w * 2, 5.2); g.fill();
  g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 6; g.beginPath(); g.ellipse(x + Math.sin(t * .9) * w * .35, y, w * .45, 1.7 * blink, 0, 0, 7); g.fill(); g.shadowBlur = 0; }
function botMetal(g, x0, y0, x1, y1, c){ const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c[0]); gr.addColorStop(.55, c[0]); gr.addColorStop(1, c[1]); return gr; }
/* (g at the robot's centre, t time, c colours, mv moving) */
const BOT_DRAW = {
  cube(g, t, c){ g.fillStyle = botMetal(g, -9, -9, 9, 9, c); g.strokeStyle = c[1]; g.lineWidth = 1.2; g.beginPath(); g.roundRect ? g.roundRect(-9, -9, 18, 18, 4) : g.rect(-9, -9, 18, 18); g.fill(); g.stroke(); botEye(g, 0, -1, 5.5, c[2], t);
    g.fillStyle = c[1]; g.fillRect(-6, 6, 12, 1.6); },
  sphere(g, t, c){ g.fillStyle = botMetal(g, -8, -9, 8, 9, c); g.strokeStyle = c[1]; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.stroke(); botEye(g, 0, -1, 5, c[2], t);
    g.strokeStyle = c[1]; g.beginPath(); g.moveTo(3, -8); g.lineTo(6, -15); g.stroke(); g.fillStyle = c[2]; g.shadowColor = c[2]; g.shadowBlur = 6; g.beginPath(); g.arc(6, -15.5, 1.8 + Math.sin(t * 6) * .4, 0, 7); g.fill(); g.shadowBlur = 0; },
  tripod(g, t, c){ g.strokeStyle = c[1]; g.lineWidth = 1.6; for (const a of [-1, 0, 1]){ g.beginPath(); g.moveTo(a * 4, 5); g.lineTo(a * 9, 13 + Math.sin(t * 5 + a) * 1); g.stroke(); }
    g.fillStyle = botMetal(g, -9, -8, 9, 7, c); g.beginPath(); g.ellipse(0, 0, 10, 7.5, 0, 0, 7); g.fill(); g.lineWidth = 1.2; g.stroke(); botEye(g, 0, -1, 5, c[2], t); },
  quad(g, t, c){ g.strokeStyle = c[1]; g.lineWidth = 2; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]){ g.beginPath(); g.moveTo(0, 0); g.lineTo(sx * 12, sy * 6 - 3); g.stroke();
      g.save(); g.translate(sx * 12, sy * 6 - 4); g.globalAlpha = .55; g.fillStyle = c[2]; g.beginPath(); g.ellipse(0, 0, 6, 1.6, (t * 30 + sx) % 6.28, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = c[1]; g.beginPath(); g.arc(0, 0, 1.6, 0, 7); g.fill(); g.restore(); }
    g.fillStyle = botMetal(g, -7, -6, 7, 6, c); g.beginPath(); g.ellipse(0, 0, 8, 5.5, 0, 0, 7); g.fill(); g.lineWidth = 1.2; g.stroke(); botEye(g, 0, .5, 4.5, c[2], t);
    g.fillStyle = c[2]; g.globalAlpha = .5 + Math.sin(t * 8) * .3; g.beginPath(); g.arc(0, 6, 1.4, 0, 7); g.fill(); g.globalAlpha = 1; },
  shield(g, t, c){ for (let i = 0; i < 3; i++){ const a = t * 1.6 + i * 2.094, x = Math.cos(a) * 13, y = Math.sin(a) * 5; g.save(); g.translate(x, y); g.rotate(a + 1.57); g.fillStyle = botMetal(g, -4, -5, 4, 5, c); g.strokeStyle = c[2]; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, -5.5); g.lineTo(4, -2); g.lineTo(3, 4); g.lineTo(0, 6); g.lineTo(-3, 4); g.lineTo(-4, -2); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    g.fillStyle = botMetal(g, -8, -8, 8, 8, c); g.strokeStyle = c[1]; g.lineWidth = 1.3; g.beginPath(); for (let i = 0; i < 6; i++){ const a = i * 1.047 - .52; g.lineTo(Math.cos(a) * 8.5, Math.sin(a) * 8.5); } g.closePath(); g.fill(); g.stroke();
    botGlow(g, 0, 0, 7, c[2], .9); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 2, 0, 7); g.fill(); },
  orb(g, t, c){ botGlow(g, 0, 0, 16, c[2], .5); g.fillStyle = botMetal(g, -7, -7, 7, 7, ['#ffffff', c[2]]); g.beginPath(); g.arc(0, 0, 7.5, 0, 7); g.fill();
    g.strokeStyle = c[1]; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, 11, 3.5, t * 2, 0, 7); g.stroke(); g.beginPath(); g.ellipse(0, 0, 11, 3.5, -t * 2 + 1, 0, 7); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 1; g.shadowColor = c[2]; g.shadowBlur = 5; for (let i = 0; i < 2; i++){ const a = t * 7 + i * 3.1 + Math.sin(t * 13) ; g.beginPath(); g.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      g.lineTo(Math.cos(a + .3) * 12, Math.sin(a + .3) * 12 + 2); g.lineTo(Math.cos(a + .1) * 15, Math.sin(a + .1) * 15); g.stroke(); } g.shadowBlur = 0; botEye(g, 0, 0, 3.5, '#ffffff', t); },
  jet(g, t, c){ g.fillStyle = botMetal(g, -14, -6, 14, 6, c); g.strokeStyle = c[1]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(14, 0); g.lineTo(-10, -9); g.lineTo(-6, 0); g.lineTo(-10, 9); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = c[1]; g.beginPath(); g.moveTo(10, 0); g.lineTo(-2, -3); g.lineTo(-2, 3); g.closePath(); g.fill(); botGlow(g, -9, 0, 8 + Math.sin(t * 20) * 2, c[2], .8);
    g.fillStyle = c[2]; g.shadowColor = c[2]; g.shadowBlur = 6; g.beginPath(); g.ellipse(5, 0, 3, 1.4, 0, 0, 7); g.fill(); g.shadowBlur = 0; },
  tesseract(g, t, c){ const r1 = 9, r2 = 4.5, a = t * .9; const sq = (r, rot) => [0, 1, 2, 3].map(i => [Math.cos(rot + i * 1.571) * r, Math.sin(rot + i * 1.571) * r * .8]);
    const o = sq(r1, a), n = sq(r2, -a * 1.3); botGlow(g, 0, 0, 14, c[2], .35); g.strokeStyle = c[2]; g.lineWidth = 1.4; g.shadowColor = c[2]; g.shadowBlur = 5;
    for (const s of [o, n]){ g.beginPath(); s.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke(); } for (let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(o[i][0], o[i][1]); g.lineTo(n[i][0], n[i][1]); g.stroke(); }
    g.shadowBlur = 0; g.fillStyle = c[0]; g.globalAlpha = .35; g.beginPath(); n.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.fill(); g.globalAlpha = 1; g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 1.6, 0, 7); g.fill(); },
  capsule(g, t, c){ g.fillStyle = botMetal(g, -7, -11, 7, 11, c); g.strokeStyle = c[1]; g.lineWidth = 1.2; g.beginPath(); g.roundRect ? g.roundRect(-6.5, -11, 13, 22, 6.5) : g.rect(-6.5, -11, 13, 22); g.fill(); g.stroke();
    g.fillStyle = c[2]; g.fillRect(-1.2, -5, 2.4, 7); g.fillRect(-3.5, -2.7, 7, 2.4); botEye(g, 0, -7.5, 3.6, c[2], t);
    for (let i = 0; i < 10; i++){ const y = -12 + i * 2.6, ph = t * 4 + i * .7; g.globalAlpha = Math.sin(ph) > 0 ? .95 : .35; g.fillStyle = i % 2 ? c[2] : '#fff'; g.beginPath(); g.arc(Math.cos(ph) * 11, y, 1.3, 0, 7); g.fill(); g.beginPath(); g.arc(-Math.cos(ph) * 11, y, 1.3, 0, 7); g.fill(); } g.globalAlpha = 1; },
  prism(g, t, c){ const hue = (t * 60) % 360; botGlow(g, 0, 0, 16, `hsl(${hue},100%,70%)`, .45); g.save(); g.rotate(Math.sin(t) * .15);
    const gr = g.createLinearGradient(-8, -12, 8, 12); gr.addColorStop(0, `hsla(${hue},100%,90%,.95)`); gr.addColorStop(.5, 'rgba(255,255,255,.75)'); gr.addColorStop(1, `hsla(${(hue + 160) % 360},100%,70%,.9)`);
    g.fillStyle = gr; g.strokeStyle = '#fff'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -13); g.lineTo(8, -2); g.lineTo(0, 13); g.lineTo(-8, -2); g.closePath(); g.fill(); g.stroke();
    g.globalAlpha = .6; g.beginPath(); g.moveTo(0, -13); g.lineTo(0, 13); g.moveTo(-8, -2); g.lineTo(8, -2); g.stroke(); g.restore(); g.globalAlpha = 1;
    for (let i = 0; i < 3; i++){ const a = t * 2 + i * 2.1; g.fillStyle = `hsl(${(hue + i * 120) % 360},100%,75%)`; g.fillRect(Math.cos(a) * 14 - 1, Math.sin(a) * 6 - 1, 2, 2); } },
  mech(g, t, c){ for (const s of [-1, 1]){ g.fillStyle = c[1]; g.fillRect(s * 9 - 3, -9, 6, 8); g.fillStyle = botMetal(g, 0, -12, 0, -8, c); g.fillRect(s * 9 - 1.6, -15, 3.2, 7); g.fillStyle = c[2]; g.globalAlpha = .6 + Math.sin(t * 5 + s) * .3; g.fillRect(s * 9 - 1, -16, 2, 1.6); g.globalAlpha = 1; }
    g.fillStyle = botMetal(g, -8, -9, 8, 9, c); g.strokeStyle = c[1]; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-8, -8); g.lineTo(8, -8); g.lineTo(9, 3); g.lineTo(4, 9); g.lineTo(-4, 9); g.lineTo(-9, 3); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#140804'; g.beginPath(); g.moveTo(-6, -3); g.lineTo(6, -3); g.lineTo(4, 1); g.lineTo(-4, 1); g.closePath(); g.fill(); g.fillStyle = c[2]; g.shadowColor = c[2]; g.shadowBlur = 7; g.fillRect(-4 + Math.sin(t * 2) * 2, -2.2, 4, 1.8); g.shadowBlur = 0;
    g.strokeStyle = c[1]; g.beginPath(); g.moveTo(-3, 5); g.lineTo(3, 5); g.stroke(); },
  ring(g, t, c){ botGlow(g, 0, 0, 15, c[2], .4); g.strokeStyle = botMetal(g, -12, -12, 12, 12, c); g.lineWidth = 3.4; g.beginPath(); g.ellipse(0, 0, 12, 12, 0, 0, 7); g.stroke();
    g.strokeStyle = c[1]; g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, 13.8, 13.8, 0, 0, 7); g.stroke(); for (let i = 0; i < 8; i++){ const a = t * .8 + i * .785; g.fillStyle = i % 2 ? c[2] : c[0]; g.fillRect(Math.cos(a) * 12 - 1, Math.sin(a) * 12 - 1, 2, 2); }
    g.fillStyle = botMetal(g, -5, -5, 5, 5, ['#fffbe6', c[2]]); g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fill(); g.fillStyle = '#3a2400'; g.beginPath(); g.ellipse(Math.sin(t * .9) * 1.4, 0, 1.4, 3, 0, 0, 7); g.fill(); }
};
/* (v274) the owner's own pictures (assets/helpers/<id>.png) take the place of the drawn robots, brought to life:
   a soft glow in the robot's colour that breathes, a slow sway and tilt into its flight, a breathing scale, sparkles
   twinkling round it and a shine that sweeps across it every few seconds. A robot with no picture keeps its drawing. */
const HLP_IMG = {};
for (const k of Object.keys(HELPERS)){ const im = new Image(); im.onload = () => { HLP_IMG[k] = im; delete BOT_PIC[k]; }; im.onerror = () => {}; im.src = `assets/helpers/${k}.png?v=${typeof GAMEV !== 'undefined' && GAMEV ? GAMEV : 274}`; }
const HLP_SHINE = document.createElement('canvas');
const HLP_IMG_SZ = 24;   // (v274) about half the hero's height: a helper, not a second hero (34 was too big)
function drawBotImg(g, k, t, opt){
  const im = HLP_IMG[k], R = HELPERS[k], c = R.c, sz = opt.size || HLP_IMG_SZ, k2 = sz / Math.max(im.width, im.height), w = im.width * k2, h = im.height * k2;
  const still = typeof GFX !== 'undefined' && GFX.preset === 'low', ph = (k.charCodeAt(0) || 1) * .7;
  const breathe = still ? 1 : 1 + Math.sin(t * 2.4 + ph) * .035, tilt = still ? 0 : (opt.mv ? .14 * (opt.face || 1) : Math.sin(t * 1.3 + ph) * .07);
  // glow behind, in its own colour, breathing
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(0, 0, 2, 0, 0, sz * .85); gr.addColorStop(0, c[2]); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = .28 + (still ? 0 : Math.sin(t * 3 + ph) * .12); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, sz * .85, 0, 7); g.fill(); g.restore();
  // the robot: sway, tilt, breathe, face its way
  g.save(); g.rotate(tilt); g.scale(breathe * (opt.face < 0 ? -1 : 1), breathe); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(im, -w / 2, -h / 2, w, h);
  // a shine sweeping across it every ~3.4 s (only over the robot itself)
  const cyc = (t + ph) % 3.4; if (!still && cyc < .7){ const W2 = Math.ceil(w) + 2, H2 = Math.ceil(h) + 2; if (HLP_SHINE.width !== W2 || HLP_SHINE.height !== H2){ HLP_SHINE.width = W2; HLP_SHINE.height = H2; }
    const sg = HLP_SHINE.getContext('2d'); sg.clearRect(0, 0, W2, H2); sg.globalCompositeOperation = 'source-over'; sg.drawImage(im, 1, 1, w, h); sg.globalCompositeOperation = 'source-atop';
    const px = -W2 * .4 + (cyc / .7) * W2 * 1.8, lg = sg.createLinearGradient(px - 12, 0, px + 12, H2); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, 'rgba(255,255,255,.85)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
    sg.fillStyle = lg; sg.fillRect(0, 0, W2, H2); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .55; g.drawImage(HLP_SHINE, -w / 2 - 1, -h / 2 - 1); }
  g.restore();
  // sparkles twinkling round it
  if (!still){ g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++){ const a = i * 1.257 + t * .5 + ph, r = sz * (.55 + .12 * Math.sin(t * 1.7 + i)), tw = Math.max(0, Math.sin(t * 3.1 + i * 2.3 + ph)), sx = Math.cos(a) * r, sy = Math.sin(a) * r * .75, s2 = 1 + tw * 2.2;
      if (tw < .05) continue; g.globalAlpha = tw; g.fillStyle = i % 2 ? '#ffffff' : c[2]; g.beginPath(); g.moveTo(sx, sy - s2); g.lineTo(sx + s2 * .3, sy); g.lineTo(sx, sy + s2); g.lineTo(sx - s2 * .3, sy); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(sx - s2, sy); g.lineTo(sx, sy + s2 * .3); g.lineTo(sx + s2, sy); g.lineTo(sx, sy - s2 * .3); g.closePath(); g.fill(); }
    g.restore(); }
}
function drawBot(g, k, t, opt = {}){
  const R = HELPERS[k]; if (!R) return; const f = BOT_DRAW[R.shape] || BOT_DRAW.cube, c = R.c;
  if (HLP_IMG[k]) drawBotImg(g, k, t, opt);
  else { g.save(); if (opt.face < 0) g.scale(-1, 1); f(g, t, c, opt.mv); g.restore(); }
  if (opt.zap > 0){ g.save(); g.globalAlpha = opt.zap / .35; g.strokeStyle = c[2]; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 14 + (1 - opt.zap / .35) * 10, 0, 7); g.stroke(); g.restore(); }
}
/* a hover beam under it, then the robot bobbing in the air */
function drawHelperW(g){
  const h = helperOf(); if (!h || P.dead) return; const R = HELPERS[h.k];
  const x = HLP.x - cam.x, y = HLP.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) return;
  const hov = 20 + Math.sin(HLP.t * 3.2) * 3;
  shadowW(g, x, y, 8);
  g.save(); g.globalAlpha = .28; const gr = g.createLinearGradient(x, y - hov, x, y); gr.addColorStop(0, R.c[2]); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(x - 3, y - hov + 6); g.lineTo(x + 3, y - hov + 6); g.lineTo(x + 7, y); g.lineTo(x - 7, y); g.closePath(); g.fill(); g.restore();
  g.save(); g.translate(x, y - hov); drawBot(g, h.k, HLP.t, {face:HLP.face, mv:HLP.moving, zap:HLP.zap || 0}); g.restore();
  if (HLP.tgt){ g.save(); g.globalAlpha = .45 + Math.sin(HLP.t * 10) * .25; g.strokeStyle = R.c[2]; g.lineWidth = 1.2; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x, y - hov + 8); g.lineTo(HLP.tgt.x - cam.x, HLP.tgt.y - cam.y); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.arc(HLP.tgt.x - cam.x, HLP.tgt.y - cam.y, 9, 0, 7); g.stroke(); g.restore(); }
}
{ const _ents = LIVE.ents; LIVE.ents = function(list, g){ _ents(list, g); if (helperOf() && !P.dead) list.push({y:HLP.y, f:() => drawHelperW(g)}); }; }
/* a still picture for the shop (cached) */
const BOT_PIC = {};
function botPic(k){ if (BOT_PIC[k]) return BOT_PIC[k];
  if (HLP_IMG[k]) return (BOT_PIC[k] = HLP_IMG[k].src);   // the owner's picture as it is (the shop makes it float and glow)
  const cv = document.createElement('canvas'); cv.width = cv.height = 96; const g = cv.getContext('2d');
  g.translate(48, 50); g.scale(2.6, 2.6); try { drawBot(g, k, 1.1, {}); } catch (e) {} return (BOT_PIC[k] = cv.toDataURL()); }

/* ---------- capture gear: four tiers sold by Boonma ----------
   The best one in your bag is used by itself when you press Catch (T): it adds to the catch chance and to the odds
   of a high grade (B…SS). It is used up only when the catch succeeds; with none you still catch at the base odds. */
const CAP_NETS = [
  {id:'net1', name:'บ่วงเชือก', en:'Rope Snare', buy:300, lv:1, c:5, g:.05},
  {id:'net2', name:'ตาข่ายป่าน', en:'Hemp Net', buy:1500, lv:20, c:10, g:.12},
  {id:'net3', name:'กรงไม้ไผ่', en:'Bamboo Cage', buy:6000, lv:45, c:15, g:.22},
  {id:'net4', name:'บ่วงทองพราน', en:"Golden Hunter's Lasso", buy:25000, lv:75, c:20, g:.35}];
/* grades: not easy, not hard: C 55 · B 27 · A 12.5 · S 4.5 · SS 1 (was 50 · 28 · 14 · 6 · 2) */
[55, 27, 12.5, 4.5, 1].forEach((w, i) => { if (PG[i]) PG[i].w = w; });
for (const n of CAP_NETS) ITEMS[n.id] = {name:n.name, en:n.en, buy:n.buy, sell:Math.round(n.buy / 4), kind:'mat', capNet:1, lv:n.lv,
  desc:[`ที่จับสัตว์ · โอกาสจับ +${n.c}% · โอกาสได้เกรดสูง +${Math.round(n.g * 100)}% · ใช้ชิ้นดีที่สุดในกระเป๋าอัตโนมัติเมื่อกดจับ (T) หมดเมื่อจับสำเร็จ`, `Capture gear · catch chance +${n.c}% · high-grade odds +${Math.round(n.g * 100)}% · the best one in your bag is used when you press Catch (T), used up on a successful catch`]};
const capNet = () => CAP_NETS.slice().reverse().find(n => S && S.inv && S.inv[n.id] > 0) || null;
let CAP_USE = null;
{ const _pr = petRoll; petRoll = function(type, opt = {}){
    if (CAP_USE && opt.g == null){ const luk = (DER && DER.b && DER.b.luk) || 0, b = Math.min(.5, luk * .004 + (opt.elite ? .25 : 0)) + CAP_USE.g; opt = {...opt, g:rollGrade(Math.min(1.3, b))}; }
    return _pr(type, opt); }; }
{ const _rc = resolveCapture; resolveCapture = function(){
    const t = P.capTarget, n = capNet(), base = MOVES.capture.base;
    if (n && t && !t.dead){ CAP_USE = n; MOVES.capture.base = base + n.c; }
    try { _rc.apply(this, arguments); } finally { MOVES.capture.base = base; }
    if (CAP_USE && t && t.vanish && S.pet === t.type){ S.inv[n.id]--; if (S.inv[n.id] <= 0) delete S.inv[n.id];
      log(L(`ใช้ ${n.name} จับสำเร็จ (เหลือ ${S.inv[n.id] || 0})`, `${n.en} used for the catch (${S.inv[n.id] || 0} left)`), 'g'); save(); }
    CAP_USE = null; }; }


/* ---------- the keeper ---------- */
addTownNpc({id:'beastkeeper', name:'ลุงบุญมา', en:'Uncle Boonma', role:'คนเลี้ยงสัตว์ · หุ่นผู้ช่วยเก็บของ', roleEn:'Beast Keeper · Helper robots', x:115, y:1060},
  {job:'ranger', look:{sex:'m', hair:1, color:'hairSilver'}, gear:{head:'hc_leaf'}});
const netRow = n => { const ok = S.lvl >= n.lv; return `<div class="srow${ok ? '' : ' locked'}"><span class="ic">${itemIcon(n.id)}</span><div class="nm"><b>${L(n.name, n.en)} <span class="ct">${L('มี', 'have')} ${S.inv[n.id] || 0}</span></b><small class="hlpbuff">${L(`จับ +${n.c}% · เกรดสูง +${Math.round(n.g * 100)}%`, `catch +${n.c}% · high grade +${Math.round(n.g * 100)}%`)}</small><small class="${ok ? '' : 'bad'}">Lv ${n.lv}</small></div>
    <span class="pr">${fmtN(n.buy)}</span>${ok ? qtyBox(n.id, 'item') : ''}</div>`; };
const hlpPic = k => `<span class="ic botic"><img src="${botPic(k)}" alt=""></span>`;
NPC_OPEN.beastkeeper = n => {
  const h = helperOf(), cur = h ? HELPERS[h.k] : null, coins = hlpCoins();
  const freeRow = k => { const R = HELPERS[k], mine = S.helperFree === k;
    return `<div class="srow rentrow${mine ? ' owned' : ''}">${hlpPic(k)}<div class="nm"><b>${R.en} <span class="ct">${R.th}</span></b><small><b class="hlpbuff">${L(...R.buff)}</b> · ${L(...R.say)}</small></div>
      ${mine ? `<span class="pr">✓ ${L('ของคุณ', 'yours')}</span>` : `<button class="btn sm gold" data-botfree="${k}">${S.helperFree ? L('เปลี่ยนเป็นตัวนี้', 'Switch') : L('รับฟรี', 'Take free')}</button>`}</div>`; };
  const paidRow = k => { const R = HELPERS[k];
    return `<div class="srow rentrow">${hlpPic(k)}<div class="nm"><b>${R.en} <span class="ct">${R.th}</span></b><small><b class="hlpbuff">EXP +10% · JOB +10% · ${L(...R.buff)}</b> · ${L(...R.say)}</small></div>
      <div class="rentbtns">${RENT_TIME.map((t, i) => `<button class="btn sm cgo" data-rentpet="${k}" data-rt="${i}" ${coins >= rentPrice(k, i) ? '' : 'disabled'}>${L(t.th, t.en)}<br><small>◈ ${rentPrice(k, i)}</small></button>`).join('')}</div></div>`; };
  npcFrame(n, L('สมัยนี้ลุงเลี้ยงหุ่นยนต์แล้วนะ! หุ่นผู้ช่วยไม่สู้กับใคร แต่บินไปเก็บของที่ดรอปมาให้ เลือกของสำคัญก่อนเสมอ · มือใหม่รับฟรีได้ 1 ตัว', 'These days I keep robots! A helper never fights, but it flies off to fetch your drops, always the most important first · newcomers get one free.'),
    `${h ? `<div class="sec">${L('หุ่นที่อยู่กับคุณ', 'With you now')}</div><div class="shop"><div class="srow owned">${hlpPic(h.k)}<div class="nm"><b>${cur.en} <span class="ct">${cur.th}</span></b><small><b class="hlpbuff">${h.free ? L(...cur.buff) : `EXP +10% · JOB +10% · ${L(...cur.buff)}`}</b> · ${h.free ? L('ฟรี ใช้ได้ตลอด', 'free, for keeps') : `${L('เหลือ', 'left')} ${rentLeft(h.left)}`}</small></div>${h.free ? '' : `<button class="btn sm" data-rentback="1">${L('คืนหุ่น', 'Hand back')}</button>`}</div></div>` : ''}
     <div class="sec">${L('หุ่นผู้ช่วยรุ่นพรีเมียม (เช่าด้วยเหรียญวายรา)', 'Premium helper robots (Vayra Coins)')} <span class="ct">${L('เก็บวินาทีละ 1 ชิ้น', '1 item a second')} · ◈ ${fmtN(coins)}</span></div><div class="shop">${HLP_PAID.map(paidRow).join('')}</div>
     <p class="hint">${L('ทุกตัว EXP +10% และ JOB +10% พร้อมบัฟเล็ก ๆ ของตัวเอง · เวลานับตามนาฬิกาจริง · เช่าตัวเดิมซ้ำ = ต่อเวลา · เช่าตัวใหม่ = แทนตัวเดิม · หมดเวลาแล้วหุ่นฟรีของคุณกลับมาเอง', 'Each gives EXP +10% and Job EXP +10% plus a small buff of its own · real-clock time · rent the same one again to extend · a new one replaces the old · when it ends, your free robot comes back')}</p>
     <div class="sec">${L('หุ่นผู้ช่วยฟรีสำหรับมือใหม่ (เลือก 1 ตัว ใช้ได้ตลอด)', 'Free starter robots (pick one, for keeps)')} <span class="ct">${L('เก็บ 2 วินาทีต่อชิ้น · ไม่มีบัฟ', '2 s per item · no buff')}</span></div><div class="shop">${HLP_FREE.map(freeRow).join('')}</div>
     <div class="sec">${L('ที่จับสัตว์', 'Capture gear')} <span class="ct">${L('ระดับสูง = จับง่ายขึ้น ได้เกรดสูงบ่อยขึ้น', 'higher tier = easier catch, better grades')}</span></div><div class="shop">${CAP_NETS.map(netRow).join('')}</div>
     <p class="hint">${L('กดจับ (T) เมื่อมอน HP ไม่เกิน 30% · ใช้ที่จับชิ้นที่ดีที่สุดในกระเป๋าเอง หมดเมื่อจับสำเร็จ · ไม่มีก็จับได้ แต่โอกาสต่ำกว่า', 'Press Catch (T) when a monster is under 30% HP · the best gear in your bag is used, used up on success · you can catch without it, at lower odds')}</p>
     ${isHunter() ? `<div class="sec">${L('พรานอยากได้สัตว์ช่วยสู้?', 'A Hunter wants a fighting pet?')}</div><p class="hint">${L('จับเองได้ฟรีและอยู่ถาวร: ตีมอนให้ HP เหลือไม่เกิน 30% เข้าใกล้แล้วกด T (ปุ่ม จับ)', 'Catch one, free and for keeps: bring a monster under 30% HP, get close and press T (Catch)')}</p>` : ''}`);
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-rentpet],[data-rentback],[data-botfree]'); if (!b || b.disabled) return;
  if (b.dataset.botfree) chooseFree(b.dataset.botfree);
  else if (b.dataset.rentpet){ const k = b.dataset.rentpet, i = +b.dataset.rt, cur = helperPaid();
    if (cur && cur.k !== k && cur.left > 3600 && typeof sysPrompt === 'function'){ sysPrompt(L(`ตอนนี้เช่า ${HELPERS[cur.k].en} อยู่ (เหลือ ${rentLeft(cur.left)}) · เช่าตัวใหม่แล้วเวลาที่เหลือจะหายไป เช่าต่อไหม?`, `${HELPERS[cur.k].en} still has ${rentLeft(cur.left)} · a new rental replaces it and that time is lost. Rent anyway?`), () => { rentHelper(k, i); const n = NPCS.find(x => x.id === 'beastkeeper'); if (n && el('dialog').dataset.npc === 'beastkeeper') NPC_OPEN.beastkeeper(n); }); return; }
    rentHelper(k, i); }
  else endHelper('return');
  const n = NPCS.find(x => x.id === 'beastkeeper'); if (n && !el('dialog').hidden && el('dialog').dataset.npc === 'beastkeeper') NPC_OPEN.beastkeeper(n);
});
{ const st = document.createElement('style'); st.textContent = '@keyframes botFloat{0%,100%{transform:translateY(1px) rotate(-2deg)}50%{transform:translateY(-3px) rotate(2deg)}}@keyframes botGlow{0%,100%{filter:drop-shadow(0 0 3px rgba(120,210,255,.55))}50%{filter:drop-shadow(0 0 8px rgba(160,230,255,.95))}}.botic img{animation:botFloat 2.6s ease-in-out infinite,botGlow 1.9s ease-in-out infinite;transform-origin:50% 60%}html.gr-still .botic img{animation:none}.hlpbuff{color:#9ff0c8;font-weight:700}.botic{background:radial-gradient(circle at 50% 45%,#2a3a58,#0c1424) !important;border-radius:12px;box-shadow:inset 0 0 0 1.5px rgba(120,200,255,.45),0 0 8px rgba(80,180,255,.35)}.botic img{width:100%;height:100%;object-fit:contain}.rentbtns .btn.cgo{background:linear-gradient(#5ab8ff,#2a6fd0) !important;color:#fff !important;border-color:#1d4f9a !important}.rentbtns .btn.cgo small{color:#e4f4ff !important}.rentbtns .btn.cgo:disabled{filter:grayscale(.6) brightness(.85)}'; document.head.appendChild(st); }

/* ---------- the guide for hunters with no fighting pet ---------- */
const PET_HINT = () => L('ยังไม่มีสัตว์คู่ใจ? จับเอง: ตีมอนให้ HP เหลือไม่เกิน 30% เข้าใกล้แล้วกด T (ปุ่ม จับ)', 'No pet yet? Catch one: bring a monster under 30% HP, get close and press T (Catch)');
EV.on('job', () => { if (needPet()) later(2.5, () => { if (!needPet()) return; banner(L('พรานต้องมีสัตว์คู่ใจ! ตีมอนให้ HP ต่ำแล้วกด T เพื่อจับ', 'A Hunter needs a pet! Weaken a monster and press T to catch it')); }); });
/* (v58) steady.js skips a redraw of the quest card with the same markup, so the hint is added once and taken away
   when it is no longer needed (it used to stay after the hunter caught a pet) */
{ const _rg = renderGoal; renderGoal = function(){ _rg(); const g = el('goal'); if (!g) return; const h = g.querySelector('.pethint');
    if (!needPet()){ if (h){ const br = h.previousSibling; if (br && br.nodeName === 'BR') br.remove(); h.remove(); } return; }
    if (h) return;
    g.insertAdjacentHTML('beforeend', `${g.innerHTML ? '<br>' : ''}<span class="pethint"><b>${L('พราน', 'Hunter')}:</b> ${PET_HINT()}</span>`); }; }
{ const _ts = trySkill; trySkill = function(id){ const sk = SKILLS[id]; if (sk && sk.type === 'petcall' && skl(id) && !S.pet){ toast(PET_HINT()); return; } return _ts(id); }; }
for (const id of ['beasttrain', 'callpet', 'wildkin', 'instinct', 'kingbond']){ const sk = SKILLS[id]; if (!sk || !sk.desc) continue; const _d = sk.desc;
  sk.desc = lv => `${_d(lv)}${S && !S.pet ? ` · ${L('ต้องมีสัตว์: จับเอง (T)', 'Needs a pet: catch one (T)')}` : ''}`; }
if (typeof TOUR !== 'undefined') TOUR.push(['beastkeeper', 'หุ่นผู้ช่วยเก็บของ (ฟรี 1 ตัว)', 'Helper robots that fetch drops (one free)']);
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'petrent', t:['หุ่นผู้ช่วยเก็บของ', 'Helper robots'], b:() => `<p>${L(
  'ลุงบุญมา คนเลี้ยงสัตว์ทางตะวันตกเฉียงใต้ของนครอาเรน มีหุ่นผู้ช่วยเก็บของ · ไม่สู้ มอนไม่สนใจ · เก็บของสำคัญก่อน (อุปกรณ์ตามความหายาก แล้วของมีค่า)<br>· <b>ฟรี 3 แบบ</b> (BIT · BYTE · CHIP): เลือกรับ 1 ตัว ใช้ได้ตลอด เปลี่ยนได้ตลอด · ไม่มีบัฟ · เก็บ 2 วินาทีต่อชิ้น<br>· <b>พรีเมียม 9 แบบ</b> (NEXA · AEGIS · PULSE · VECTOR · QUANTA · HELIX · PRISM · TITAN · MIDAS): เช่าด้วยเหรียญวายรา 1 วัน ◈5 · 7 วัน ◈25 · 30 วัน ◈80 · EXP +10% JOB +10% และบัฟเล็ก ๆ ของแต่ละตัว · เก็บวินาทีละชิ้น · หมดเวลาแล้วหุ่นฟรีกลับมาเอง · ออกพร้อมสัตว์ต่อสู้ได้',
  'Uncle Boonma in south-west Aren keeps helper robots · they never fight and monsters ignore them · they fetch the most important drop first<br>· <b>3 free</b> (BIT · BYTE · CHIP): pick one for keeps, switch any time · no buff · one item every 2 s<br>· <b>9 premium</b> (NEXA · AEGIS · PULSE · VECTOR · QUANTA · HELIX · PRISM · TITAN · MIDAS): Vayra Coins, 1 day ◈5 · 7 days ◈25 · 30 days ◈80 · EXP +10%, Job EXP +10% and a small buff each · one item a second · your free robot returns when it ends · can be out with a fighting pet')}</p>`});
