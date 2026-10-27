/* VAYRATHEN — js/sys/costume2.js — Grand wardrobe: premium outfit sets, headpieces and WINGS
   · 8 grand outfits (glowing trims, capes, sashes, chest pieces) + 6 headpieces + 8 pairs of wings, sold by the tailor.
   · Wings are drawn live (not baked into the sprite): they flap with your steps, beat faster as you run, fold
     a little when you sit, glow, and shed their own particles — feathers, embers, frost, petals, stardust.
     Facing the camera they spread behind you; from the back they open over you.
   · Sets: wearing a matching outfit + headpiece + wings lights the set's aura under your feet.
   · TRIAL: every costume and every pair of wings can be worn right now as a free trial ("ทดลองใช้"),
     with no time limit for now (COS_TRIAL.days = 0). Buying keeps it for good once trials end.
   Costumes and wings never change stats. Other players see your wings online. */
'use strict';

/* ---------- extra materials (some glow on their own) ---------- */
{
  const hx = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const add = (name, ramp, o = {}) => { if (SPR.M[name] != null) return; SPR.M[name] = SPR.MATS.length; SPR.MATS.push({name, hex:ramp, ramp:ramp.map(hx), emissive:!!o.emissive, noEdge:!!o.noEdge}); };
  add('goldLight', ['#ffffff', '#fff2b0', '#ffcf4a', '#d89020'], {emissive:true});
  add('iceGlow', ['#ffffff', '#e4fbff', '#9ee4ff', '#4aa8e0'], {emissive:true});
  add('voidGlow', ['#f4e0ff', '#c07aff', '#7a2ad8', '#3a0e78'], {emissive:true});
  add('pearl', ['#ffffff', '#fbf6f0', '#e8dccf', '#b8a898']);
  add('roseGold', ['#fff0ea', '#f2b8a4', '#c8806a', '#8a4a3e']);
  add('crimsonV', ['#ff9a9a', '#c41a2e', '#7a0a1c', '#3e0410']);
  add('abyss', ['#5a5070', '#2a2238', '#16101f', '#0a060f']);
  add('frost', ['#ffffff', '#e8f6ff', '#b8dcf4', '#7aa8d0']);
  add('emerald', ['#d8ffe8', '#3ac87a', '#1a8050', '#0a4428']);
}
const CM2 = SPR.M;
const tx2 = {
  hem:(m, y = .44) => n => (n[1] > y ? {m} : undefined),
  zip:(m) => n => (n[2] > .5 && Math.abs(n[0]) < .05 && n[1] > -.4 ? {m} : undefined),
  sash:(m) => n => (Math.abs(n[0] * .78 + n[1] * .62 - .02) < .14 ? {m} : undefined),
  chev:(m) => n => (n[2] > .3 && Math.abs(Math.abs(n[0]) * 1.4 - (n[1] + .3)) < .07 ? {m} : undefined),
  stars:(m) => n => (Math.sin(n[0] * 31) * Math.sin(n[1] * 29 + 2) > .86 ? {m} : undefined),
  scales:(m) => n => (Math.sin(n[0] * 22 + Math.sin(n[1] * 22) * 2) > .7 ? {m} : undefined),
  combo:(...fs) => n => { for (const f of fs){ const r = f(n); if (r) return r; } }
};
const G_TOP0 = {chest:null, chestTex:null, chestTrim:null, pauldron:null, cape:null, capeTex:null, runeLines:false, armband:null, cosTop:true};
/* grand outfits (set: matching headpiece + wings) */
const COS2 = {
  c_seraph:{slot:'top', set:'seraph', th:'ชุดเทวทูตสุริยัน', en:'Solar Seraph Regalia', src:'coin', price:{c:120}, look:{top:'pearl', sleeve:'pearl', forearm:'goldLight', armband:'goldLight', pants:'pearl', bootCuff:'goldLight', belt:'goldLight', chest:'pearl', chestTrim:'goldLight', pauldron:'goldLight', cape:'pearl', capeTex:'gold', skirtM:'pearl', skirtT:'goldLight', necklace:true, pendant:'sun', neckMat:'goldLight', topTex:tx2.combo(tx2.chev(CM2.goldLight), tx2.hem(CM2.goldLight))}},
  c_abyss:{slot:'top', set:'abyss', th:'ชุดจอมมารห้วงลึก', en:'Abyssal Overlord', src:'coin', price:{c:120}, look:{top:'abyss', sleeve:'abyss', forearm:'crimsonV', armband:'voidGlow', pants:'abyss', bootCuff:'crimsonV', belt:'voidGlow', chest:'abyss', chestTex:'scale', chestTrim:'crimsonV', pauldron:'crimsonV', cape:'crimsonV', capeTex:'gold', skirtM:'abyss', skirtT:'crimsonV', topTex:tx2.combo(tx2.zip(CM2.voidGlow), tx2.chev(CM2.crimsonV))}},
  c_fairy:{slot:'top', set:'fairy', th:'ชุดภูตพฤกษามรกต', en:'Emerald Fae Gown', src:'coin', price:{c:100}, look:{top:'mint', sleeve:'pearl', forearm:'pearl', armband:'jade', pants:'emerald', bootCuff:'jade', belt:'jade', skirtM:'mint', skirtT:'jade', necklace:true, pendant:'jade', neckMat:'goldLight', ribbon:'jade', topTex:tx2.combo(tx2.stars(CM2.jade), tx2.hem(CM2.emerald))}},
  c_phoenix:{slot:'top', set:'phoenix', th:'ชุดนักรบหงส์เพลิง', en:'Phoenix Vanguard', src:'coin', price:{c:120}, look:{top:'scarlet', sleeve:'sunset', forearm:'ember', armband:'goldLight', pants:'charcoal', bootCuff:'ember', belt:'goldLight', chest:'scarlet', chestTex:'scale', chestTrim:'ember', pauldron:'goldLight', cape:'sunset', capeTex:'gold', skirtM:'scarlet', skirtT:'ember', topTex:tx2.combo(tx2.chev(CM2.ember), tx2.hem(CM2.goldLight))}},
  c_frost:{slot:'top', set:'frost', th:'ชุดราชินีธารน้ำแข็ง', en:'Glacier Sovereign', src:'coin', price:{c:110}, look:{top:'frost', sleeve:'frost', forearm:'iceGlow', armband:'iceGlow', pants:'frost', bootCuff:'iceGlow', belt:'iceGlow', chest:'frost', chestTrim:'iceGlow', pauldron:'iceGlow', cape:'sky', capeTex:'gold', skirtM:'frost', skirtT:'iceGlow', necklace:true, pendant:'rune', neckMat:'iceGlow', topTex:tx2.combo(tx2.zip(CM2.iceGlow), tx2.stars(CM2.iceGlow), tx2.hem(CM2.iceGlow))}},
  c_garuda:{slot:'top', set:'garuda', th:'ชุดพญาครุฑราชสงคราม', en:'Garuda War Raiment', src:'coin', price:{c:140}, look:{top:'scarlet', sleeve:'goldLight', forearm:'goldLight', armband:'goldLight', pants:'scarlet', bootCuff:'goldLight', belt:'goldLight', chest:'gold', chestTex:'scale', chestTrim:'goldLight', pauldron:'goldLight', cape:'scarlet', capeTex:'gold', skirtM:'scarlet', skirtT:'goldLight', necklace:true, neckMat:'goldLight', topTex:tx2.combo(tx2.sash(CM2.goldLight), tx2.scales(CM2.gold))}},
  c_void:{slot:'top', set:'void', th:'ชุดนักเวทห้วงดารา', en:'Starfall Archmage', src:'coin', price:{c:110}, look:{top:'midnight', sleeve:'midnight', forearm:'voidGlow', armband:'goldLight', pants:'midnight', bootCuff:'voidGlow', belt:'goldLight', cape:'voidGlow', capeTex:'gold', skirtM:'midnight', skirtT:'voidGlow', necklace:true, pendant:'orb', neckMat:'goldLight', runeLines:true, topTex:tx2.combo(tx2.stars(CM2.goldLight), tx2.hem(CM2.voidGlow))}},
  c_kinnaree:{slot:'top', set:'kinnaree', th:'ชุดกินรีร่ายรำ', en:'Dancing Kinnaree', src:'coin', price:{c:110}, look:{top:'roseGold', sleeve:'pearl', forearm:'goldLight', armband:'goldLight', pants:'sakura', bootCuff:'goldLight', belt:'goldLight', skirtM:'sakura', skirtT:'goldLight', necklace:true, pendant:'gem', neckMat:'goldLight', topTex:tx2.combo(tx2.sash(CM2.goldLight), tx2.hem(CM2.roseGold))}},
  hc_halo:{slot:'head', set:'seraph', th:'มงกุฎแสงเทวา', en:'Seraph Crown', src:'coin', price:{c:40}, look:{hat:'crest', bandMat:'goldLight', crestMat:'goldLight', crestN:7, crestGem:true}},
  hc_horns:{slot:'head', set:'abyss', th:'เขาจอมมาร', en:'Overlord Horns', src:'coin', price:{c:40}, look:{hat:null, horns:'crimsonV', hornLen:3, hornSpread:1.2}},
  hc_chada:{slot:'head', set:'garuda', th:'กระบังหน้าพญาครุฑ', en:'Garuda Diadem', src:'coin', price:{c:50}, look:{hat:'crest', bandMat:'gold', crestMat:'gold', crestN:5, crestGem:true}},   // (v89) was a tall gold cone
  hc_frost:{slot:'head', set:'frost', th:'มงกุฎผลึกน้ำแข็ง', en:'Frost Tiara', src:'coin', price:{c:35}, look:{hat:'crest', bandMat:'frost', crestMat:'iceGlow', crestN:5, crestGem:true}},
  hc_flame:{slot:'head', set:'phoenix', th:'มงกุฎขนหงส์', en:'Phoenix Crest', src:'coin', price:{c:35}, look:{hat:'crest', bandMat:'scarlet', crestMat:'ember', crestN:5}},
  hc_star:{slot:'head', set:'void', th:'หมวกจอมเวทดารา', en:'Starfall Hat', src:'coin', price:{c:35}, look:{hat:'wizard'}}
};
for (const id in COS2){ COSTUME[id] = COS2[id]; const c = COS2[id]; SPR.GEAR_LOOK[id] = c.slot === 'top' ? {...G_TOP0, ...c.look} : {...c.look}; }

/* ---------- wings ---------- */
const WINGS = {
  w_angel:{set:'seraph', th:'ปีกนางฟ้าแสงสวรรค์', en:'Heavenly Angel Wings', kind:'ether', c:['#ffffff', '#ffeeb8', '#e8b040'], edge:'#fff0b0', glow:'255,228,150', fx:'sparkle', span:1.15, price:{c:150}, halo:true},
  w_demon:{set:'abyss', th:'ปีกปีศาจโลหิต', en:'Blood Demon Wings', kind:'bat', c:['#ff6a6a', '#a8102a', '#2a0610'], edge:'#1a0408', glow:'255,40,60', fx:'ember', span:1.15, price:{c:150}},
  w_satan:{set:null, th:'ปีกซาตานนรกันต์', en:'Satan Hellfire Wings', kind:'satan', c:['#ff8a3a', '#3a0a10', '#0a0204'], edge:'#ff5a1a', glow:'255,80,30', fx:'ember', span:.95, price:{c:220}},
  w_devil:{set:null, th:'ปีกเดวิลราตรี', en:'Midnight Devil Wings', kind:'devil', c:['#ff7aa8', '#c0124a', '#30041a'], edge:'#ffb0cc', glow:'255,70,140', fx:'sparkle', span:1, price:{c:160}},
  w_fallen:{set:null, th:'ปีกนางฟ้าตกสวรรค์', en:'Fallen Angel Wings', kind:'ether', c:['#e8e0ff', '#5a4a8a', '#1a1030'], edge:'#c8b8ff', glow:'170,140,255', fx:'star', span:1.15, price:{c:180}, halo:true, dark:true},
  w_fairy:{set:'fairy', th:'ปีกภูตแสงรุ้ง', en:'Prismatic Fae Wings', kind:'butterfly', c:['#ffffff', '#9ff0d8', '#4ab0e8'], edge:'#ffffff', glow:'160,255,220', fx:'sparkle', span:.95, price:{c:120}},
  w_phoenix:{set:'phoenix', th:'ปีกหงส์เพลิงนิรันดร์', en:'Eternal Phoenix Wings', kind:'flame', c:['#fff6c0', '#ffa030', '#e02a10'], edge:'#ff6a20', glow:'255,140,40', fx:'ember', span:1.15, price:{c:180}},
  w_frost:{set:'frost', th:'ปีกผลึกธารน้ำแข็ง', en:'Glacier Crystal Wings', kind:'crystal', c:['#ffffff', '#c8f2ff', '#5ab4f0'], edge:'#e8fbff', glow:'150,220,255', fx:'frost', span:1.05, price:{c:160}},
  w_garuda:{set:'garuda', th:'ปีกพญาครุฑกนกทอง', en:'Golden Kanok Garuda Wings', kind:'kanok', c:['#fff4b0', '#ffc83a', '#b8700e'], edge:'#6a3a06', glow:'255,200,80', fx:'gold', span:1.05, price:{c:200}},
  w_void:{set:'void', th:'ปีกห้วงจักรวาล', en:'Cosmic Void Wings', kind:'void', c:['#e8c8ff', '#5a1aa8', '#0e0420'], edge:'#c48aff', glow:'170,100,255', fx:'star', span:1.1, price:{c:170}},
  w_kinnaree:{set:'kinnaree', th:'ปีกกินรีบุษบา', en:'Lotus Kinnaree Wings', kind:'ether', c:['#ffffff', '#ffd0e4', '#e8709e'], edge:'#c84a7a', glow:'255,170,210', fx:'sparkle', span:1, price:{c:140}}
};
const COS_TRIAL = {on:true, days:0};   // free trial of every costume and wing; days 0 = no limit (for now)
const XCOS = {};   // cosmetic mounts and pets (filled by sys/cosx.js): {id: {slot:'mount'|'pet', th, en, price, c:[c1, c2]}}
const cosHave = id => (COSTUME[id] ? (COSTUME[id].src === 'free' || !!(ACC.wardrobe || {})[id]) : (WINGS[id] || XCOS[id]) ? !!(ACC.wardrobe || {})[id] : false);
const cosUsable = id => cosHave(id) || (COS_TRIAL.on && !!(COSTUME[id] || WINGS[id] || XCOS[id]) && (COSTUME[id] || {}).src !== 'event');   // festival costumes: no trial
const cosTrial = id => !cosHave(id) && cosUsable(id);
const itemName2 = id => (WINGS[id] ? L(WINGS[id].th, WINGS[id].en) : XCOS[id] ? L(XCOS[id].th, XCOS[id].en) : cosName(id));
const H2 = n => { const s = Math.sin(n * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };

/* draws a pair of wings on g (world units). x, y = the feet. dir 0..7 (0 faces the camera). part: 'back' | 'front' */
function drawWings(g, id, x, y, dir, t, o = {}){
  const W = wingDef(id); if (!W) return;
  const away = dir >= 3 && dir <= 5, side = dir === 2 || dir === 6;
  if ((o.part === 'front') !== away) return;              // behind the body unless we see your back
  const sh = y - (o.ride ? 31 : 16) + (o.sit ? 4 : 0), sp = (o.moving ? 9 : 3.2) * (W.kind === 'butterfly' ? 1.6 : 1), fl = Math.sin(t * sp) * (o.moving ? .3 : .14), fold = o.sit ? .55 : 1;
  const k = W.span * .85 * (o.scale || 1), sc = g.getTransform().a, blur = sc * 5;
  g.save(); g.translate(x, sh);
  if (W.halo && !side){ g.save(); g.globalCompositeOperation = 'lighter'; const hy = -(o.ride ? 44 : 40) + Math.sin(t * 2) * .8; g.strokeStyle = `rgba(${W.glow},.95)`; g.lineWidth = 1.4; g.shadowColor = `rgba(${W.glow},1)`; g.shadowBlur = blur * 1.4;
    g.beginPath(); g.ellipse(0, hy, 7, 2.2, 0, 0, 7); g.stroke(); g.restore(); }
  // a soft glow behind the pair
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(0, -6, 0, 0, -6, 34 * k); gr.addColorStop(0, `rgba(${W.glow},${.14 + .06 * Math.sin(t * 2)})`); gr.addColorStop(1, `rgba(${W.glow},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(0, -6, 34 * k, 22 * k, 0, 0, 7); g.fill(); g.restore();
  const sides = side ? [dir === 2 ? 1 : -1] : [-1, 1];
  for (const s of sides){
    g.save(); g.scale(s * (side ? .5 : dir === 0 || dir === 4 ? 1 : .8) * fold, fold); if (side) g.translate(-6, 0); else if (dir !== 0 && dir !== 4) g.translate((dir === 1 || dir === 5 ? 1 : -1) * s * 2, 0);
    g.translate(2.5, 0); g.rotate(-fl - (o.sit ? .3 : 0)); g.scale(k, k);
    g.shadowColor = `rgba(${W.glow},.85)`; g.shadowBlur = blur;
    wingShape(g, W, t, s);
    g.restore();
  }
  // twinkles: bright four-point glints flare on the wing tips and edges
  { const G = [[34, -24], [44, -10], [28, 8], [18, -20], [40, -28], [10, -8]], gs = g.getTransform().a;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const s of sides) for (let i = 0; i < G.length; i++){ const tw = Math.pow(Math.max(0, Math.sin(t * (2.2 + i * .37) + i * 2.1 + s * 1.3)), 8); if (tw < .04) continue;
      const px = s * G[i][0] * k * (side ? .5 : 1) * fold, py = G[i][1] * k * fold, r = (1.2 + tw * 2.6) * (W.kind === 'satan' ? 1.15 : 1);
      g.fillStyle = `rgba(${W.glow},${tw * .5})`; g.beginPath(); g.arc(px, py, r * 1.8, 0, 7); g.fill();
      g.fillStyle = `rgba(255,255,255,${tw})`; g.beginPath(); g.moveTo(px, py - r * 2.4); g.lineTo(px + r * .35, py); g.lineTo(px, py + r * 2.4); g.lineTo(px - r * .35, py); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(px - r * 2.4, py); g.lineTo(px, py + r * .35); g.lineTo(px + r * 2.4, py); g.lineTo(px, py - r * .35); g.closePath(); g.fill(); }
    g.restore(); }
  g.restore();
  wingFx(g, W, x, sh, t, o, side);
}
const wlg = (g, x0, y0, x1, y1, c) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c[0]); gr.addColorStop(.5, c[1]); gr.addColorStop(1, c[2]); return gr; };
function feather(g, x, y, ang, len, w, fill, edge, tip){
  g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(w, len * .25, w * .9, len * .8, 0, len); g.bezierCurveTo(-w * .9, len * .8, -w, len * .25, 0, 0); g.fillStyle = fill; g.fill();
  g.shadowBlur = 0; g.strokeStyle = edge; g.lineWidth = .45; g.stroke(); g.beginPath(); g.moveTo(0, len * .05); g.lineTo(0, len * .92); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .35; g.stroke();
  if (tip){ g.beginPath(); g.ellipse(0, len * .9, w * .55, len * .12, 0, 0, 7); g.fillStyle = tip; g.fill(); }
  g.restore();
}
/* one wing (the right one; the left is mirrored), root at 0,0, reaching out to +x and up */
function wingShape(g, W, t, s){
  const c = W.c;
  switch (W.kind){
    case 'feather': case 'petal': {
      const pet = W.kind === 'petal', arm = u => [u * 30, -14 * Math.sin(u * 2.4) - u * 4];
      const fill = wlg(g, 0, -20, 0, 18, [c[0], c[1], c[2]]);
      for (let i = 0; i < 9; i++){ const u = .38 + i / 8 * .62, [ax, ay] = arm(u); feather(g, ax, ay, .15 - u * 1.05, (pet ? 13 : 18) + u * (pet ? 7 : 9), pet ? 4.2 : 2.8, fill, W.edge, pet ? c[2] : null); }
      for (let i = 0; i < 8; i++){ const u = .12 + i / 7 * .5, [ax, ay] = arm(u); feather(g, ax, ay + 1, .3 - u * .7, (pet ? 10 : 12) + u * 4, pet ? 3.6 : 2.6, wlg(g, 0, -10, 0, 14, [c[0], c[0], c[1]]), W.edge, pet ? c[1] : null); }
      for (let i = 0; i < 10; i++){ const u = .05 + i / 9 * .85, [ax, ay] = arm(u); g.beginPath(); g.ellipse(ax, ay + 2, 3.2, 2.2, -.3, 0, 7); g.fillStyle = c[0]; g.fill(); g.shadowBlur = 0; g.strokeStyle = W.edge; g.lineWidth = .35; g.stroke(); }
      g.beginPath(); for (let i = 0; i <= 12; i++){ const [ax, ay] = arm(i / 12); i ? g.lineTo(ax, ay) : g.moveTo(ax, ay); } g.strokeStyle = W.edge; g.lineWidth = 1.2; g.stroke();
      break; }
    case 'bat': case 'void': {
      const tips = [[34, -22], [36, -4], [26, 10], [12, 14]], el = [8, -14];
      g.beginPath(); g.moveTo(0, 0); g.lineTo(el[0], el[1]); g.lineTo(tips[0][0], tips[0][1]);
      for (let i = 1; i < tips.length; i++){ const [px, py] = tips[i - 1], [qx, qy] = tips[i]; g.quadraticCurveTo((px + qx) / 2 - 4, (py + qy) / 2 - 3, qx, qy); }
      g.quadraticCurveTo(5, 9, 0, 3); g.closePath();
      g.fillStyle = wlg(g, 0, -22, 30, 14, [c[1], c[2], c[2]]); g.fill();
      if (W.kind === 'void'){ g.save(); g.clip(); g.shadowBlur = 0; for (let i = 0; i < 26; i++){ const sx = H2(i) * 38, sy = -22 + H2(i + 3) * 36, a = Math.pow(Math.max(0, Math.sin(t * 2.5 + i * 1.7)), 3); g.fillStyle = `rgba(255,255,255,${.25 + a * .75})`; g.fillRect(sx, sy, .9 + a * .6, .9 + a * .6); }
        const neb = g.createRadialGradient(20, -6, 0, 20, -6, 20); neb.addColorStop(0, `rgba(${W.glow},.45)`); neb.addColorStop(1, `rgba(${W.glow},0)`); g.fillStyle = neb; g.fillRect(-2, -26, 44, 44); g.restore(); }
      g.shadowBlur = 0; g.strokeStyle = W.edge; g.lineWidth = .8; g.stroke();
      g.strokeStyle = W.kind === 'void' ? `rgba(${W.glow},.9)` : '#2a0408'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(el[0], el[1]); g.stroke();
      g.lineWidth = .8; for (const [tx3, ty3] of tips){ g.beginPath(); g.moveTo(el[0], el[1]); g.lineTo(tx3, ty3); g.stroke(); }
      g.fillStyle = W.kind === 'void' ? '#ffffff' : '#e8d0c0'; g.beginPath(); g.moveTo(el[0], el[1]); g.lineTo(el[0] + 1.5, el[1] - 4); g.lineTo(el[0] + 2.2, el[1] + .4); g.fill();
      break; }
    case 'ether': {
      // angelic light: long translucent blades of light (no quills), two layers, a sweep of light running outward
      const B = [[-1.05, 40, 6.5], [-.68, 46, 7.5], [-.32, 42, 7], [.04, 34, 6], [.4, 25, 5], [.72, 16, 4]], dk = W.dark;
      for (let L2 = 0; L2 < 2; L2++){ g.globalCompositeOperation = 'source-over'; g.globalAlpha = L2 ? .9 : .7;
        for (let i = 0; i < B.length; i++){ const [a, len, w] = B[i], A = a + Math.sin(t * 2 + i * .8) * .045 + (L2 ? .07 : -.06), Ln = len * (L2 ? .78 : 1.06), Wd = w * (L2 ? .75 : 1.1);
          g.save(); g.rotate(A);
          const gr = g.createLinearGradient(0, 0, Ln, 0); gr.addColorStop(0, L2 ? c[0] : c[1]); gr.addColorStop(.35, L2 ? c[1] : c[2]); gr.addColorStop(.75, dk ? c[2] : `rgba(${W.glow},.45)`); gr.addColorStop(1, `rgba(${W.glow},0)`);
          g.beginPath(); g.moveTo(2, 0); g.bezierCurveTo(Ln * .3, -Wd, Ln * .75, -Wd * .85, Ln, -Wd * .1); g.bezierCurveTo(Ln * .72, Wd * .45, Ln * .3, Wd * .6, 2, 0); g.fillStyle = gr; g.fill();
          g.shadowBlur = 0; g.strokeStyle = `rgba(255,255,255,${L2 ? .75 : .35})`; g.lineWidth = .45; g.stroke();
          g.beginPath(); g.moveTo(3, 0); g.quadraticCurveTo(Ln * .5, -Wd * .35, Ln * .95, -Wd * .12); g.strokeStyle = `rgba(255,255,255,${L2 ? .8 : .4})`; g.lineWidth = .35; g.stroke();
          g.restore(); } }
      const ph = (t * .7 + (s > 0 ? 0 : .35)) % 1.5; if (ph < 1){ g.globalCompositeOperation = 'lighter'; const sw = g.createRadialGradient(ph * 42, -12 + ph * 6, 0, ph * 42, -12 + ph * 6, 14); sw.addColorStop(0, 'rgba(255,255,255,.55)'); sw.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sw; g.fillRect(ph * 42 - 14, -26 + ph * 6, 28, 28); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = c[0]; g.beginPath(); g.arc(2, 0, 2.2, 0, 7); g.fill(); g.fillStyle = `rgba(${W.glow},1)`; g.beginPath(); g.arc(2, 0, 1.1, 0, 7); g.fill();
      break; }
    case 'satan': {
      // vast jagged membrane: obsidian skin with lava veins, burning scalloped edge, bone spurs and a great horn claw
      const el = [10, -20], wr = [22, -31], tips = [[48, -27], [50, -7], [42, 10], [28, 19], [13, 16]];
      const mem = new Path2D(); mem.moveTo(0, 0); mem.lineTo(el[0], el[1]); mem.lineTo(wr[0], wr[1]); mem.lineTo(tips[0][0], tips[0][1]);
      for (let i = 1; i < tips.length; i++){ const [px, py] = tips[i - 1], [qx, qy] = tips[i], mx = (px + qx) / 2, my = (py + qy) / 2; mem.quadraticCurveTo(mx + (wr[0] - mx) * .38, my + (wr[1] - my) * .38, qx, qy); }
      mem.quadraticCurveTo(5, 11, 0, 4); mem.closePath();
      g.fillStyle = wlg(g, 0, -30, 40, 18, [c[1], c[2], c[2]]); g.fill(mem);
      g.save(); g.clip(mem); g.shadowBlur = 0; g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++){ let x0 = wr[0] * .4 + H2(i) * 8, y0 = -14 + H2(i + 4) * 14; g.beginPath(); g.moveTo(x0, y0); for (let j = 0; j < 4; j++){ x0 += 4 + H2(i * 7 + j) * 6; y0 += (H2(i * 3 + j) - .5) * 9; g.lineTo(x0, y0); }
        g.strokeStyle = `rgba(${W.glow},${.35 + .35 * Math.sin(t * 3 + i)})`; g.lineWidth = .7; g.stroke(); }
      const fg = g.createLinearGradient(0, 22, 0, 2); fg.addColorStop(0, `rgba(${W.glow},.7)`); fg.addColorStop(1, `rgba(${W.glow},0)`); g.fillStyle = fg; g.fillRect(-2, 0, 54, 22); g.restore();
      g.shadowBlur = 0; g.strokeStyle = W.edge; g.lineWidth = .9; g.stroke(mem);
      for (let i = 1; i < tips.length; i++){ const [qx, qy] = tips[i], fl2 = 2.5 + Math.sin(t * 11 + i * 2) * 1.6; g.fillStyle = `rgba(255,${150 + 60 * Math.sin(t * 9 + i) | 0},60,.9)`; g.beginPath(); g.moveTo(qx - 2, qy); g.quadraticCurveTo(qx + 1, qy + fl2 * .6, qx + .5, qy + fl2 + 1.5); g.quadraticCurveTo(qx + 2, qy + fl2 * .4, qx + 2, qy); g.fill(); }
      g.strokeStyle = '#140308'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(el[0], el[1]); g.lineTo(wr[0], wr[1]); g.stroke();
      g.lineWidth = 1; for (const [tx3, ty3] of tips){ g.beginPath(); g.moveTo(wr[0], wr[1]); g.lineTo(tx3, ty3); g.stroke(); }
      g.fillStyle = '#d8c0a8'; g.beginPath(); g.moveTo(el[0] - 1, el[1]); g.lineTo(el[0] - 3, el[1] - 6); g.lineTo(el[0] + 2, el[1] - 1); g.fill();
      g.beginPath(); g.moveTo(wr[0] - 1, wr[1] + 1); g.quadraticCurveTo(wr[0] - 4, wr[1] - 9, wr[0] + 5, wr[1] - 13); g.quadraticCurveTo(wr[0] + 1, wr[1] - 6, wr[0] + 2.5, wr[1] + 1); g.fill();
      for (const [tx3, ty3] of tips){ g.beginPath(); g.moveTo(tx3, ty3); g.lineTo(tx3 + 2.5, ty3 - 1.5); g.lineTo(tx3 + .6, ty3 + 1.2); g.fill(); }
      break; }
    case 'devil': {
      // sleek glossy devil wings with three sharp points and a running shine
      const p2 = new Path2D('M0 1 C5 -16 18 -27 35 -30 C29 -23 30 -17 37 -12 C29 -8 28 -2 33 5 C23 5 13 9 0 4 Z');
      g.fillStyle = wlg(g, 0, -30, 30, 8, [c[0], c[1], c[2]]); g.fill(p2); g.shadowBlur = 0; g.strokeStyle = W.edge; g.lineWidth = .6; g.stroke(p2);
      g.strokeStyle = 'rgba(20,0,10,.75)'; g.lineWidth = .8; for (const [ex, ey] of [[35, -30], [37, -12], [33, 5]]){ g.beginPath(); g.moveTo(1, 1); g.quadraticCurveTo(ex * .45, ey * .55 - 2, ex - 2, ey); g.stroke(); }
      g.save(); g.clip(p2); g.globalCompositeOperation = 'lighter'; const sp2 = ((t * .9) % 1.6) * 30 - 6, sg = g.createLinearGradient(sp2 - 5, -30, sp2 + 5, 8); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,220,240,.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(-2, -32, 42, 42); g.restore();
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .5; g.beginPath(); g.moveTo(4, -6); g.quadraticCurveTo(14, -22, 30, -27); g.stroke();
      break; }
    case 'butterfly': {
      const hue = (t * 40) % 360;
      const up = new Path2D('M0 -1 C6 -24 30 -32 34 -18 C37 -8 22 -2 0 1 Z'), lo = new Path2D('M0 1 C16 2 28 8 24 18 C20 26 6 16 0 3 Z');
      for (const [p, cy] of [[up, -14], [lo, 10]]){ const gr = g.createRadialGradient(10, cy, 2, 18, cy, 26); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, `hsla(${hue},90%,80%,.95)`); gr.addColorStop(.7, c[1]); gr.addColorStop(1, c[2]);
        g.fillStyle = gr; g.fill(p); g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = .7; g.stroke(p); }
      g.strokeStyle = 'rgba(40,90,120,.45)'; g.lineWidth = .4; for (const [ex, ey] of [[30, -22], [26, -10], [18, -26], [22, 14], [14, 18]]){ g.beginPath(); g.moveTo(1, 0); g.quadraticCurveTo(ex * .5, ey * .6, ex, ey); g.stroke(); }
      for (const [dx, dy, r] of [[24, -20, 3.2], [16, -12, 2], [18, 12, 2.4]]){ g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(dx, dy, r, 0, 7); g.fill(); g.fillStyle = `hsla(${(hue + 120) % 360},90%,65%,.9)`; g.beginPath(); g.arc(dx, dy, r * .55, 0, 7); g.fill(); }
      break; }
    case 'flame': {
      g.shadowBlur *= .5;
      for (let i = 0; i < 7; i++){ const u = i / 6, bx = u * 26, by = -12 * Math.sin(u * 2.6) - u * 2, len = 16 + u * 12, wob = Math.sin(t * 9 + i * 1.7) * 2.6, w = 4.2 - u * 1.2;
        const gr = g.createLinearGradient(bx, by, bx + len * .5, by + len); gr.addColorStop(0, 'rgba(255,240,170,.95)'); gr.addColorStop(.4, 'rgba(255,140,40,.9)'); gr.addColorStop(.8, 'rgba(210,40,14,.75)'); gr.addColorStop(1, 'rgba(160,20,10,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(bx - w, by); g.quadraticCurveTo(bx + len * .3 + wob, by + len * .4, bx + len * .55 + wob * 1.6, by + len); g.quadraticCurveTo(bx + len * .1, by + len * .35, bx + w, by - 1); g.closePath(); g.fill();
        const gr2 = g.createLinearGradient(bx, by, bx + 8, by - 18 - u * 6); gr2.addColorStop(0, 'rgba(255,170,60,.85)'); gr2.addColorStop(1, 'rgba(255,100,30,0)'); g.fillStyle = gr2; g.beginPath(); g.moveTo(bx - w * .8, by); g.quadraticCurveTo(bx + 4 + wob, by - 10, bx + 6 + wob * 1.4, by - 16 - u * 6); g.quadraticCurveTo(bx + 2, by - 6, bx + w * .8, by); g.fill(); }
      g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(255,240,180,.8)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= 10; i++){ const u = i / 10; const ax = u * 26, ay = -12 * Math.sin(u * 2.6) - u * 2; i ? g.lineTo(ax, ay) : g.moveTo(ax, ay); } g.stroke();
      break; }
    case 'crystal': {
      const shards = [[0, -2, 30, -26, 8], [2, 0, 38, -10, 7], [2, 2, 34, 6, 6], [1, 3, 24, 16, 5], [0, 3, 12, 18, 4]];
      const clipP = new Path2D();
      for (const [x0, y0, x1, y1, w] of shards){ const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1, ox = nx / l * w, oy = ny / l * w, mx = x0 + (x1 - x0) * .55, my = y0 + (y1 - y0) * .55;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(mx + ox, my + oy); g.lineTo(x1, y1); g.lineTo(mx - ox * .6, my - oy * .6); g.closePath();
        clipP.moveTo(x0, y0); clipP.lineTo(mx + ox, my + oy); clipP.lineTo(x1, y1); clipP.lineTo(mx - ox * .6, my - oy * .6); clipP.closePath();
        const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.6, 'rgba(160,225,255,.7)'); gr.addColorStop(1, 'rgba(90,170,240,.85)'); g.fillStyle = gr; g.fill();
        g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = .6; g.stroke(); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = .4; g.stroke(); }
      const sh = (t * .6) % 1.6 - .3; g.save(); g.clip(clipP); g.shadowBlur = 0; g.globalCompositeOperation = 'lighter'; const gl = g.createLinearGradient(sh * 40 - 6, -26, sh * 40 + 6, 18); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.5, 'rgba(255,255,255,.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(-2, -28, 44, 48); g.restore();
      break; }
    case 'kanok': {
      // Thai "lai kanok": every plume is a gold flame-leaf with a curled tip, layered like feathers, rubies and emeralds on the arm
      const arm = u => [u * 27, -12 * Math.sin(u * 2.4) - u * 3];
      const motif = (x, y, s2, a, dark) => { g.save(); g.translate(x, y); g.rotate(a); g.scale(s2, s2);
        const p = new Path2D('M0 0 C3 4 4 10 2 16 C1 19 -2 20 -2 17 C0 17 1 14 -1 12 C1 15 -3 17 -3 13 C-3 8 -2 4 0 0 Z');
        g.fillStyle = wlg(g, 0, 0, 0, 20, dark ? [c[1], c[2], '#7a4206'] : [c[0], c[1], c[2]]); g.fill(p); g.shadowBlur = 0; g.strokeStyle = W.edge; g.lineWidth = .6; g.stroke(p);
        g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = .35; g.beginPath(); g.moveTo(.3, 1.5); g.quadraticCurveTo(1.6, 7, .4, 13); g.stroke(); g.restore(); };
      for (let i = 0; i < 8; i++){ const u = .35 + i / 7 * .65, [ax, ay] = arm(u); motif(ax, ay, 1.05 + u * .35, .2 - u * 1.05, false); }
      for (let i = 0; i < 7; i++){ const u = .1 + i / 6 * .55, [ax, ay] = arm(u); motif(ax, ay + 1, .75 + u * .3, .35 - u * .7, true); }
      g.strokeStyle = W.edge; g.lineWidth = 2.2; g.beginPath(); for (let i = 0; i <= 12; i++){ const [ax, ay] = arm(i / 12); i ? g.lineTo(ax, ay) : g.moveTo(ax, ay); } g.stroke();
      g.strokeStyle = c[1]; g.lineWidth = 1.2; g.stroke();
      for (const [u, col] of [[.2, '#e0203a'], [.45, '#20c070'], [.7, '#e0203a'], [.92, '#20c070']]){ const [jx, jy] = arm(u); g.fillStyle = col; g.beginPath(); g.arc(jx, jy, 1.3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(jx - .5, jy - .7, .5, .5); }
      const [tx4, ty4] = arm(1); g.fillStyle = c[1]; g.beginPath(); g.moveTo(tx4, ty4 - 6); g.lineTo(tx4 + 2.2, ty4); g.lineTo(tx4, ty4 + 2); g.lineTo(tx4 - 2, ty4); g.closePath(); g.fill(); g.strokeStyle = W.edge; g.lineWidth = .5; g.stroke();
      break; }
  }
}
/* particles each pair sheds, drawn from time (no state): feathers drift down, embers rise, frost and stardust twinkle */
function wingFx(g, W, x, y, t, o, side){
  const n = W.fx === 'ember' || W.fx === 'star' ? 9 : 6;
  g.save();
  for (let i = 0; i < n; i++){
    const per = W.fx === 'feather' || W.fx === 'petal' ? 3.2 : 1.6, ph = ((t + H2(i) * per) % per) / per, cyc = Math.floor((t + H2(i) * per) / per), sd = H2(i + cyc * 7.1) < .5 ? -1 : 1;
    const bx = x + sd * (side ? 10 : 12 + H2(i * 3 + cyc) * 24) * W.span, by = y - 6 + (H2(i * 5 + cyc) - .5) * 26;
    let px = bx, py = by, a = 1 - ph;
    switch (W.fx){
      case 'feather': case 'petal': px += Math.sin(ph * 8 + i) * 4; py += ph * 30; g.save(); g.translate(px, py); g.rotate(Math.sin(ph * 6 + i) * .9); g.globalAlpha = a; g.fillStyle = W.c[W.fx === 'petal' ? 1 : 0]; g.beginPath(); g.ellipse(0, 0, 1.1, 2.6, 0, 0, 7); g.fill(); g.strokeStyle = W.edge; g.lineWidth = .3; g.stroke(); g.restore(); continue;
      case 'ember': py -= ph * 26; px += Math.sin(ph * 5 + i) * 3; g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${W.glow},${a})`; g.fillRect(px, py, 1.2, 1.2); continue;
      case 'frost': case 'sparkle': case 'gold': case 'star': { py += (W.fx === 'frost' ? ph * 12 : -ph * 8); const tw = Math.pow(Math.sin(ph * Math.PI), 2) * (W.fx === 'star' ? 1.2 : 1); g.globalCompositeOperation = 'lighter'; g.fillStyle = W.fx === 'gold' ? `rgba(255,220,120,${tw})` : `rgba(${W.glow},${tw})`;
        const r = 1.6 * tw + .4; g.beginPath(); g.moveTo(px, py - r * 1.8); g.lineTo(px + r * .4, py); g.lineTo(px, py + r * 1.8); g.lineTo(px - r * .4, py); g.closePath(); g.fill(); g.beginPath(); g.moveTo(px - r * 1.8, py); g.lineTo(px, py + r * .4); g.lineTo(px + r * 1.8, py); g.lineTo(px, py - r * .4); g.closePath(); g.fill(); continue; }
    }
  }
  g.restore();
}
/* the set aura: outfit + headpiece + wings of the same set */
const COS_SETS = {seraph:['เทวทูตสุริยัน', 'Solar Seraph'], abyss:['จอมมารห้วงลึก', 'Abyssal Overlord'], fairy:['ภูตพฤกษา', 'Emerald Fae'], phoenix:['หงส์เพลิง', 'Phoenix'], frost:['ราชินีธารน้ำแข็ง', 'Glacier Sovereign'], garuda:['พญาครุฑ', 'Garuda'], void:['ห้วงดารา', 'Starfall'], kinnaree:['กินรี', 'Kinnaree']};
function cosSetOf(cos){ if (!cos || !cos.wing || !WINGS[cos.wing]) return null; const s = WINGS[cos.wing].set; const top = cos.top && COSTUME[cos.top] && COSTUME[cos.top].set === s; return top ? s : null; }
function drawSetAura(g, set, x, y, t){
  const W = Object.values(WINGS).find(w => w.set === set); if (!W) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${W.glow},${.55 + .2 * Math.sin(t * 3)})`; g.lineWidth = .9;
  for (let i = 0; i < 2; i++){ g.beginPath(); g.ellipse(x, y, 13 + i * 4, (13 + i * 4) * .38, 0, t * (i ? -.8 : .8), t * (i ? -.8 : .8) + Math.PI * 1.6); g.stroke(); }
  for (let i = 0; i < 6; i++){ const a = t * .8 + i * 1.047, px = x + Math.cos(a) * 15, py = y + Math.sin(a) * 5.7; g.fillStyle = `rgba(${W.glow},.9)`; g.fillRect(px - .6, py - .6, 1.2, 1.2); }
  g.restore();
}

/* ---------- hooks: the hero, other players, the preview ---------- */
{
  const _draw = drawPlayerW;
  drawPlayerW = function(g){
    const id0 = S.cos && S.cos.wing, ok = id0 && WINGS[id0] && cosUsable(id0) && !P.dead, id = ok ? dyeId(id0) : null;
    const x = P.x - cam.x, y = P.y - cam.y, o = {moving:P.moving, ride:P.ride && !(typeof mountSkin === 'function' && mountSkin()), sit:P.sit || !!(typeof mountSkin === 'function' && mountSkin() && mountSkin().kind === 'beast')};
    const set = S.cos && cosSetOf(S.cos); if (set && !P.dead) drawSetAura(g, set, x, y, T);
    if (ok){ const veil = typeof hideBuff === 'function' && hideBuff() ? .4 : 1; g.save(); g.globalAlpha = veil; drawWings(g, id, x, y, P.dir || 0, T, {...o, part:'back'}); g.restore(); }
    _draw(g);
    if (ok){ const veil = typeof hideBuff === 'function' && hideBuff() ? .4 : 1; g.save(); g.globalAlpha = veil; drawWings(g, id, x, y, P.dir || 0, T, {...o, part:'front'}); g.restore(); }
  };
  drawEquipPrev = function(){
    const cv = document.getElementById('eqPrev'); if (!cv || !heroSheet()) return;
    const wing0 = EQ.tab === 'cos' && EQ.try && WINGS[EQ.try] ? EQ.try : (S.cos && S.cos.wing && cosUsable(S.cos.wing) ? S.cos.wing : null), wing = wing0 && dyeId(wing0);
    // the hero fills the frame: a tight view, a little wider when wings are out
    // (v147) in the equipment ring the hero needs room all round (wings, crowns, glows) and stands in the middle
    const ring = !!cv.closest('.eqdoll2.e6');
    const sh = (typeof eqPreviewSheet === 'function' ? eqPreviewSheet() : null) || heroSheet(), K = sh.K, w = ring ? 112 : wing ? 76 : 54, h = ring ? 112 : wing ? 92 : 70, fx = w / 2, fy = ring ? 80 : h - (wing ? 10 : 5);   // (v149) roomy enough for the widest wings
    if (cv.width !== w * K || cv.height !== h * K){ cv.width = w * K; cv.height = h * K; }
    const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(fx, fy, S.job === 'warlord' ? 22 : 12, 4, 0, 0, 7); g.fill();
    const cos = {...(S.cos || {})}; if (EQ.tab === 'cos' && EQ.try){ if (WINGS[EQ.try]) cos.wing = EQ.try; else if (COSTUME[EQ.try]) cos[COSTUME[EQ.try].slot] = EQ.try; }
    const set = cosSetOf(cos); if (set) drawSetAura(g, set, fx, fy, T);
    if (wing) drawWings(g, wing, fx, fy, EQ.dir, T, {part:'back'});
    SPR.draw(g, sh, 'idle', EQ.dir, T, fx, fy);
    if (wing) drawWings(g, wing, fx, fy, EQ.dir, T, {part:'front'});
  };
}
/* online: show your wings and set to others */
const cosPres = () => ({wg:S.cos && S.cos.wing && cosUsable(S.cos.wing) ? dyeId(S.cos.wing) : '', cset:(S.cos && cosSetOf(S.cos)) || ''});

/* ---------- wearing (trial-aware) ---------- */
cosWear = function(id){
  S.cos = S.cos || {top:null, head:null, wing:null};
  if (!id || !cosUsable(id)) return;
  const k = WINGS[id] ? 'wing' : XCOS[id] ? XCOS[id].slot : COSTUME[id].slot; S.cos[k] = S.cos[k] === id ? null : id;
  if (S.cos[k] && cosTrial(id)) toast(L(`ทดลองใช้: ${itemName2(id)}`, `Trying: ${itemName2(id)}`));
  const set = cosSetOf(S.cos); if (set && k) banner(L(`ครบเซ็ต ${COS_SETS[set][0]}!`, `${COS_SETS[set][1]} set complete!`));
  dirty = true; save(); renderEquip(); if (typeof NET !== 'undefined') NET.presT = 0;
};
/* trials off (a future switch): take off whatever is not owned */
function cosCheckTrial(){ if (COS_TRIAL.on || !S || !S.cos) return; for (const k of ['top', 'head', 'wing']) if (S.cos[k] && !cosHave(S.cos[k])) S.cos[k] = null; }
EV.on('map', cosCheckTrial);

/* ---------- the wardrobe tab, rebuilt: grand sets first, wings, outfits, headpieces ---------- */
function cosSwatch2(id, i){ if (WINGS[id]) return WINGS[id].c[i ? 2 : 1]; if (XCOS[id]) return XCOS[id].c[i ? 1 : 0]; return cosSwatch(id, i); }
renderWardrobe = function(){
  const pane = document.getElementById('pane-equip'); if (!pane) return;
  S.cos = S.cos || {top:null, head:null, wing:null};
  const sel = EQ.try, isW = sel && WINGS[sel], c = sel && (COSTUME[sel] || WINGS[sel] || XCOS[sel]), slotOf = id => (WINGS[id] ? 'wing' : XCOS[id] ? XCOS[id].slot : COSTUME[id].slot);
  const tile = id => { const own = cosHave(id), tr = cosTrial(id), on = S.cos[slotOf(id)] === id, grand = !!(COS2[id] || WINGS[id]);
    return `<button class="cosit${grand ? ' grand' : ''}${on ? ' on' : ''}${sel === id ? ' sel' : ''}${WINGS[id] ? ' wingit' : ''}" data-costry="${id}"><i class="cosw" data-cth="${id}" style="--c1:${cosSwatch2(id, 0)};--c2:${cosSwatch2(id, 1)}">${WINGS[id] ? '<svg viewBox="0 0 20 20"><path d="M10 12C7 6 3 4 1 5c1 4 4 7 9 7zm0 0c3-6 7-8 9-7-1 4-4 7-9 7z" fill="currentColor"/></svg>' : ''}</i><b>${itemName2(id)}</b>
      <small>${on ? L('สวมอยู่', 'Wearing') : own ? L('มีแล้ว', 'Owned') : tr ? `<em class="trial">${L('ทดลองใช้ฟรี', 'Free trial')}</em>` : L('ยังไม่มี', 'Locked')}</small></button>`; };
  const price = id => { const p = (COSTUME[id] || WINGS[id] || XCOS[id] || {}).price; return p ? (p.z ? `${fmtN(p.z)} ${CUR()}` : `${p.c} ${L('เหรียญ', 'coins')}`) : ''; };
  const sets = Object.keys(COS_SETS);
  pane.innerHTML = eqTabs() + `<div class="cosw2">
    <div class="eqstage"><div class="eqaura"><i></i><canvas id="eqPrev"></canvas></div>
      <div class="eqplate"><b>${escH(S.name || nm(JOBS[S.job]))}</b><small>${sel ? `${L('ลองสวม', 'Trying on')}: ${itemName2(sel)}` : L('ชุดแฟชั่นและปีกไม่เปลี่ยนค่าพลัง', 'Costumes and wings never change stats')}</small></div>
      <div class="eqrot"><button class="ibtn" data-eqrot="-1" aria-label="${L('หมุนซ้าย', 'Turn left')}">‹</button><button class="ibtn" data-eqrot="1" aria-label="${L('หมุนขวา', 'Turn right')}">›</button></div>
      ${c ? `<div class="cosact">${cosUsable(sel) ? `<button class="btn gold" data-coswear="${sel}">${S.cos[slotOf(sel)] === sel ? L('ถอดออก', 'Take off') : cosTrial(sel) ? L('ทดลองสวม', 'Try it on') : L('สวมใส่', 'Wear')}</button>` : ''}
        ${!cosHave(sel) && c.price ? `<button class="btn" data-cosbuy="${sel}">${L('ซื้อถาวร', 'Buy to keep')} · ${price(sel)}</button>` : ''}
        ${!cosUsable(sel) && COSTUME[sel] && COSTUME[sel].src === 'event' ? `<p class="hint">${L('ชุดลิมิเต็ด', 'Limited')} · ${typeof evName === 'function' ? evName(COSTUME[sel].ev) : ''} · ${L('แลกกับแม่นางเทศกาลในอาเรน', 'trade with Mae Nang Thetsakan in Aren')}</p>` : ''}
        ${cosTrial(sel) ? `<p class="hint">${L('ทดลองใช้ฟรี · ยังไม่กำหนดวันหมดอายุ', 'Free trial · no end date yet')}</p>` : ''}
        ${cosUsable(sel) && sel !== 'hc_hide' && !XCOS[sel] ? dyeUI(sel) : ''}${XCOS[sel] && XCOS[sel].slot === 'mount' ? `<p class="hint">${L('ใช้ตอนขี่พาหนะ (R)', 'Shows while riding (R)')}</p>` : ''}</div>` : ''}
    </div>
    <div class="cosgrid">
      <div class="cosbanner"><b>${L('คอลเลกชันอลังการ', 'Grand Collection')}</b><small>${L('ทดลองใช้ทุกชิ้นได้ฟรี ไม่จำกัดเวลา · สวมชุด + ปีกเซ็ตเดียวกัน = ออร่าเซ็ต', 'Every piece is a free trial for now · outfit + wings of one set light a set aura')}</small></div>
      ${Object.keys(XCOS).length ? `<div class="sec">${L('พาหนะแฟชั่น', 'Cosmetic mounts')}</div><div class="coslist">${Object.keys(XCOS).filter(i => XCOS[i].slot === 'mount').map(tile).join('')}</div>
      <div class="sec">${L('สัตว์เลี้ยงแฟชั่น', 'Cosmetic pets')}</div><div class="coslist">${Object.keys(XCOS).filter(i => XCOS[i].slot === 'pet').map(tile).join('')}</div>` : ''}
      <div class="sec">${L('ปีก', 'Wings')} <span class="ct">${Object.keys(WINGS).filter(cosHave).length}/${Object.keys(WINGS).length}</span></div>
      <div class="coslist">${Object.keys(WINGS).map(tile).join('')}</div>
      <div class="sec">${L('ชุดเซ็ตอลังการ', 'Grand outfits')}</div>
      <div class="coslist">${Object.keys(COS2).filter(i => COS2[i].slot === 'top').map(tile).join('')}</div>
      <div class="sec">${L('เครื่องประดับศีรษะเซ็ต', 'Grand headpieces')}</div>
      <div class="coslist">${Object.keys(COS2).filter(i => COS2[i].slot === 'head').map(tile).join('')}</div>
      ${Object.keys(COSTUME).some(i => COSTUME[i].src === 'event') ? `<div class="sec">${L('ชุดลิมิเต็ดเทศกาล', 'Limited festival costumes')}</div>
      <div class="coslist">${Object.keys(COSTUME).filter(i => COSTUME[i].src === 'event').map(tile).join('')}</div>` : ''}
      <div class="sec">${L('ชุดแฟชั่นทั่วไป', 'Everyday outfits')}</div>
      <div class="coslist">${Object.keys(COSTUME).filter(i => !COS2[i] && COSTUME[i].src !== 'event' && COSTUME[i].slot === 'top').map(tile).join('')}</div>
      <div class="sec">${L('เครื่องประดับศีรษะ', 'Headpieces')}</div>
      <div class="coslist">${Object.keys(COSTUME).filter(i => !COS2[i] && COSTUME[i].src !== 'event' && COSTUME[i].slot === 'head').map(tile).join('')}</div>
      <p class="hint">${L('เป็นของทั้งบัญชี ทุกตัวละครใช้ได้ · ซื้อถาวรได้ที่ช่างตัดชุดในนครอาเรน', 'Shared by your whole account · buy to keep from the tailor in Aren')}</p></div></div>`;
  drawEquipPrev();
};
/* buying wings / grand pieces from the wardrobe or the tailor */
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-cosbuy]'); if (!b) return; const id = b.dataset.cosbuy, W = WINGS[id] || XCOS[id], C = COSTUME[id]; if ((!W && !C) || cosHave(id)) return;
  e.stopImmediatePropagation();
  const p = (W || C).price; if (!p) return;
  if (p.z){ if (S.bia < p.z){ toast(L('เงินไม่พอ', 'Not enough Bia')); return; } S.bia -= p.z; }
  else { if ((ACC.coins || 0) < p.c){ toast(L('เหรียญวายราไม่พอ', 'Not enough Vayra Coins')); return; } ACC.coins -= p.c; }
  (ACC.wardrobe = ACC.wardrobe || {})[id] = 1; accSave(); SFX.play('coin'); banner(L(`ได้${W ? (XCOS[id] ? (XCOS[id].slot === 'pet' ? 'สัตว์เลี้ยง' : 'พาหนะ') : 'ปีก') : 'ชุดแฟชั่น'}: ${W ? W.th : C.th}`, `New ${W ? 'wings' : 'costume'}: ${W ? W.en : C.en}`)); save(); if (UIS.open.equip) renderEquip();
  const n = NPCS.find(x => x.id === 'tailor'); if (n && !el('dialog').hidden && el('dialog').dataset.npc === 'tailor') NPC_OPEN.tailor(n);
}, true);
// the tailor sells wings too
{
  const _t = NPC_OPEN.tailor;
  NPC_OPEN.tailor = n => { _t(n); const shop = document.querySelector('#dialog .db'); if (!shop) return;
    const rows = [...Object.keys(WINGS), ...Object.keys(XCOS)].map(id => { const W = WINGS[id] || XCOS[id], own = cosHave(id), can = (ACC.coins || 0) >= W.price.c;
      return `<div class="srow${own ? ' owned' : ''}"><span class="ic"><i class="cosw" data-cth="${id}" style="--c1:${W.c[1]};--c2:${W.c[2]}"></i></span><div class="nm"><b>${L(W.th, W.en)}</b><small>${(XCOS[id] ? (XCOS[id].slot === 'pet' ? L('สัตว์เลี้ยง', 'Pet') : L('พาหนะ', 'Mount')) : L('ปีก', 'Wings'))}${own ? ` · ${L('มีแล้ว', 'owned')}` : ` · ${L('ทดลองใช้ฟรีได้', 'free trial available')}`}</small></div>
        <span class="pr">${W.price.c} <small>${L('เหรียญ', 'coins')}</small></span><button class="btn sm" data-cosbuy="${id}" ${own || !can ? 'disabled' : ''}>${own ? '✓' : L('ซื้อ', 'Buy')}</button></div>`; }).join('');
    shop.insertAdjacentHTML('afterbegin', `<div class="sec">${L('ปีกอลังการ (เหรียญวายรา) · ลองสวมฟรีในตู้เสื้อผ้า', 'Grand wings (Vayra Coins) · try them free in the wardrobe')}</div><div class="shop">${rows}</div>`); };
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'grandcos', t:['ชุดอลังการและปีก', 'Grand costumes & wings'], b:() => `<p>${L('ตู้เสื้อผ้า (Q → ชุดแฟชั่น) มีปีก 8 แบบ ชุดเซ็ต 8 ชุด และเครื่องประดับศีรษะเซ็ต · ปีกขยับตามจังหวะเดิน วิ่งแล้วกระพือเร็วขึ้น นั่งแล้วหุบ มีแสงและอนุภาคเฉพาะตัว · สวมชุดและปีกเซ็ตเดียวกันได้ออร่าเซ็ตใต้เท้า · ตอนนี้ <b>ทดลองใช้ทุกชิ้นได้ฟรี ไม่กำหนดวันหมดอายุ</b> · ซื้อถาวรด้วยเหรียญวายราที่ช่างตัดชุด · ไม่เปลี่ยนค่าพลัง · ผู้เล่นอื่นเห็นปีกของเจ้า', 'The wardrobe (Q → Wardrobe) has 8 wings, 8 grand outfits and set headpieces · wings beat with your steps, faster when running, fold when you sit, with their own glow and particles · outfit + wings of one set light a set aura · right now <b>every piece is a free trial with no end date</b> · buy to keep with Vayra Coins at the tailor · no stat changes · other players see your wings')}</p>
  <table class="wkt"><tr><th>${L('เซ็ต', 'Set')}</th><th>${L('ปีก', 'Wings')}</th><th>${L('ชุด', 'Outfit')}</th></tr>${Object.keys(COS_SETS).map(s => { const w = Object.keys(WINGS).find(k => WINGS[k].set === s), t = Object.keys(COS2).find(k => COS2[k].set === s && COS2[k].slot === 'top'); return `<tr><td>${L(...COS_SETS[s])}</td><td>${w ? L(WINGS[w].th, WINGS[w].en) : ''}</td><td>${t ? cosName(t) : ''}</td></tr>`; }).join('')}</table>`});

/* ---------- dyes: recolour any outfit, headpiece or wings (main colour + accent), saved per account ----------
   A dyed piece becomes its own look id (base~dRRGGBBrrggbb) so the sprite cache, other players and the preview all
   see the same colours; the materials are made on demand. */
const DYE_COLS = ['#f4f0e6', '#2a2a34', '#d8243a', '#ff7a2a', '#ffc83a', '#7ad84a', '#1fa878', '#38c8e8', '#2a6ad8', '#6a3ad8', '#c84ab8', '#ff8ac0', '#8a5a3a', '#a8b4c8'];
const dyeOf = id => (ACC.dye || {})[id] || null;
const dyeId = id => { const d = dyeOf(id); if (!d) return id; const v = `${id}~d${d.p.slice(1)}${d.a.slice(1)}`; if (COSTUME[id]) dyeEnsure(v); return v; };
const dyeParse = v => { const m = /^([a-z_0-9]+)~d([0-9a-f]{6})([0-9a-f]{6})$/i.exec(v || ''); return m ? {id:m[1], p:'#' + m[2].toLowerCase(), a:'#' + m[3].toLowerCase()} : null; };
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixHex = (h, t, k) => '#' + hexRgb(h).map((v, i) => Math.round(v + (t[i] - v) * k).toString(16).padStart(2, '0')).join('');
function dyeMat(hex, emissive){
  const name = `dy_${hex.slice(1)}${emissive ? 'e' : ''}`; if (SPR.M[name] != null) return name;
  const ramp = [mixHex(hex, [255, 250, 240], .5), hex, mixHex(hex, [30, 16, 40], .35), mixHex(hex, [16, 8, 24], .6)];
  SPR.M[name] = SPR.MATS.length; SPR.MATS.push({name, hex:ramp, ramp:ramp.map(hexRgb), emissive:!!emissive, noEdge:false}); return name;
}
const DYE_MAIN = ['top', 'sleeve', 'pants', 'skirtM', 'chest', 'capMat', 'hatMat', 'bandMat', 'ribbon', 'hairpin'];
const DYE_ACC = ['belt', 'bootCuff', 'skirtT', 'armband', 'pauldron', 'cape', 'forearm', 'neckMat', 'chestTrim', 'crestMat', 'horns'];
function dyeEnsure(v){
  if (SPR.GEAR_LOOK[v]) return true; const d = dyeParse(v); if (!d || !SPR.GEAR_LOOK[d.id]) return false;
  const lk = {...SPR.GEAR_LOOK[d.id]}, emi = m => { const i = SPR.M[m]; return i != null && SPR.MATS[i] && SPR.MATS[i].emissive; };
  for (const k of DYE_MAIN) if (typeof lk[k] === 'string' && SPR.M[lk[k]] != null) lk[k] = dyeMat(d.p, emi(lk[k]));
  for (const k of DYE_ACC) if (typeof lk[k] === 'string' && SPR.M[lk[k]] != null) lk[k] = dyeMat(d.a, emi(lk[k]));
  SPR.GEAR_LOOK[v] = lk; return true;
}
const wingCache = {};
function wingDef(id){
  if (WINGS[id]) return WINGS[id]; if (wingCache[id]) return wingCache[id];
  const d = dyeParse(id); if (!d || !WINGS[d.id]) return null; const W = WINGS[d.id];
  return (wingCache[id] = {...W, c:[mixHex(d.p, [255, 255, 255], .7), d.p, mixHex(d.p, [10, 6, 20], .45)], edge:mixHex(d.a, [10, 6, 20], .3), glow:hexRgb(d.a).join(',')});
}
{
  const _vg = visGear;
  visGear = function(g){ const out = _vg(g); if (S && S.cos && g === S.gear){ if (out.armor && out.armor === S.cos.top) out.armor = dyeId(out.armor); if (out.head && out.head === S.cos.head) out.head = dyeId(out.head); } return out; };
  const _gg = ghostGear;
  ghostGear = function(str){
    if (typeof str !== 'string' || str.length > 340) return {};
    const parts = str.split(','), base = parts.map(p => { const d = dyeParse(p); return d ? d.id : p; }), out = _gg(base.join(','));
    ['head', 'armor', 'weapon', 'acc'].forEach((slot, i) => { if (out[slot] && parts[i] !== base[i] && dyeEnsure(parts[i])) out[slot] = parts[i]; });
    return out;
  };
  const _eps = eqPreviewSheet;
  eqPreviewSheet = function(){ if (EQ.tab === 'cos' && EQ.try && COSTUME[EQ.try]){ const g = {...visGear(S.gear)}; g[COSTUME[EQ.try].slot === 'top' ? 'armor' : 'head'] = dyeId(EQ.try); return heroSheet(S.job, g, S.look); } return _eps(); };
}
function dyeUI(id){
  const d = dyeOf(id) || {}, row = (k, cur) => `<div class="dyerow"><span>${k === 'p' ? L('สีหลัก', 'Main') : L('สีรอง', 'Accent')}</span><div class="dyesw">${DYE_COLS.map(c => `<button class="dy${cur === c ? ' on' : ''}" style="--c:${c}" data-dye="${id}|${k}|${c}" aria-label="${c}"></button>`).join('')}</div></div>`;
  return `<div class="dyebox"><b>${L('ย้อมสี', 'Dye')}</b>${row('p', d.p)}${row('a', d.a)}${d.p ? `<button class="btn sm" data-dyereset="${id}">${L('คืนสีเดิม', 'Original colours')}</button>` : ''}</div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-dye],[data-dyereset]'); if (!b) return;
  ACC.dye = ACC.dye || {};
  if (b.dataset.dyereset) delete ACC.dye[b.dataset.dyereset];
  else { const [id, k, c] = b.dataset.dye.split('|'), W = WINGS[id], base = W ? {p:W.c[1], a:'#' + (W.glow.split(',').map(v => (+v).toString(16).padStart(2, '0')).join(''))} : {p:'#f4f0e6', a:'#ffc83a'};
    const cur = ACC.dye[id] || {p:/^#[0-9a-f]{6}$/i.test(base.p) ? base.p.toLowerCase() : '#f4f0e6', a:base.a}; cur[k] = c; ACC.dye[id] = cur; }
  accSave(); save(); if (typeof NET !== 'undefined') NET.presT = 0; renderWardrobe();
});
