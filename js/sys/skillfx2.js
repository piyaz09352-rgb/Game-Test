/* VAYRATHEN — js/sys/skillfx2.js — (v116) no two skills look alike
   Pairs that shared one effect and one pose now each have their own (poses in js/gfx/sprites.js):
   · หงส์ทอง (Golden Hamsa)        was the Spirit Burst blast → a golden swan glides down, wings beating, feathers drifting;
                                    pose "hongcall": arms rise like wings, up onto the toes, then sweep forward
   · เงาพิฆาต (Shadow Execution)   was the assassinate cut   → a crescent of shadow falls like a blade, a rift opens;
                                    pose "dive": crouch, leap with the blade high, drop and cut
   · ประทับเงามรณะ (Death Mark)    was the assassinate cut   → a rune seal turns over the target, shrinks and bursts;
                                    pose "seal": the free hand draws the sign, eyes shut, the blade thrusts through
   · พยัคฆ์พุ่งเงา (Tiger Pounce)  was the Shadow Lunge charge → a striped arc leap and three claw marks on landing;
                                    pose "pounce": down low, spring, both hands forward like claws
   And the Shadow Clones skill (แยกร่างเงา) is gone; in its place:
   · กรงเล็บจันทรา (Moon Claws), a buff like the one it replaces: for 20 s each hit has a 35% chance of a moon-claw rake
     (a pale crescent rises, three claw streaks cross the foe) for 80% + 8% per level of ATK, with a chance of bleeding.
     Pose "rake": the hands claw up in turn.
     Points put into Shadow Clones come back once.
   Effects are drawn on screen over the world (no new images), each about a second long. */
'use strict';

/* ---------- the skills ---------- */
Object.assign(SKILLS.goldenhong, {fx:'goldenSwan', act:'hongcall'});
if (SKILLS.shadowexec) Object.assign(SKILLS.shadowexec, {fx:'shadowGuillotine', act:'dive'});
Object.assign(SKILLS.deathmark, {fx:'deathSeal', act:'seal'});
Object.assign(SKILLS.tigerpounce, {act:'pounce', fxDash:'tigerLeap', short:'กระโจน', shortEn:'Pounce'});
/* Moon Claws takes the clones' place as the line's one summon-like buff (each class line keeps 4 attacks · 1 buff · 1 passive) */
SKILLS.moonclaw = {job:'tigershade', name:'กรงเล็บจันทรา', en:'Moon Claws', short:'จันทรา', shortEn:'Moon', max:10, type:'buff', sp:() => 50, cd:30,
  fx:'moonClaw', anim:'skill', act:'rake', kind:'buff', req:{tigerfang:3}, buff:lv => ({t:20, moonclaw:lv}),
  desc:lv => L(`20 วิ: ทุกครั้งที่ตีโดน มีโอกาส 35% ที่กรงเล็บจันทราจะตะปบซ้ำ ${pct(.8 + lv * .08)} ATK และอาจทำให้เลือดไหล`, `20s: every hit has a 35% chance of a Moon Claw rake for ${pct(.8 + lv * .08)} ATK that may cause bleeding`)};
const MCL = {inner:false};
HK.dmgAfter.push((m, res, sk) => { const b = P.buffs && P.buffs.moonclaw; if (!b || MCL.inner || !m || m.dead || !res || res.miss || Math.random() >= .35) return;
  const lv = b.moonclaw | 0 || 1;
  later(.12, () => { if (m.dead) return; VFX.play('moonClaw', {x:m.x, y:m.y, small:true}); MCL.inner = true;
    try { applyDamage(m, physDamage(m, .8 + lv * .08), SKILLS.moonclaw); if (!m.dead && Math.random() < .3) applyStatus(m, {bleed:[.03, 3]}); } catch (e) {} finally { MCL.inner = false; } }); });
JOBS.tigershade.skills = JOBS.tigershade.skills.map(id => (id === 'shadowclone' ? 'moonclaw' : id));
if (!JOBS.tigershade.skills.includes('moonclaw')) JOBS.tigershade.skills.push('moonclaw');
delete SKILLS.shadowclone;
/* points from Shadow Clones come back once */
{ const _d = derive; derive = function(){ if (S && S.skills && !S._sfx2){ S._sfx2 = 1; const back = S.skills.shadowclone | 0;
      if (back){ delete S.skills.shadowclone; S.skPts = (S.skPts || 0) + back; setTimeout(() => toast(L(`แยกร่างเงาเปลี่ยนเป็นกรงเล็บจันทรา: คืน Skill Point ${back} แต้ม`, `Shadow Clones became Moon Claws: ${back} Skill Points back`)), 2100); }
      if (S.hot) S.hot = S.hot.map(h => (h === 'shadowclone' ? null : h));
      if (P.buffs && P.buffs.shadowclone) delete P.buffs.shadowclone; }
    return _d.apply(this, arguments); }; }
/* every class sheet carries the poses its skills use */
for (const j of Object.keys(JOBS)){ const acts = new Set(SPR.CHAR_ACTIONS[j] || SPR.CHAR_ACTIONS.novice || []);
  for (let k = j; k && JOBS[k]; k = JOBS[k].parent) for (const id of JOBS[k].skills || []) if (SKILLS[id] && SKILLS[id].act) acts.add(SKILLS[id].act);
  SPR.CHAR_ACTIONS[j] = [...acts]; }

/* ---------- the effects ---------- */
const FX2 = [];
const fx2Add = o => { o.t = 0; FX2.push(o); };
const fxZ = () => (typeof PX !== 'undefined' ? PX : 2);
EV.on('tick', dt => { for (let i = FX2.length - 1; i >= 0; i--){ const f = FX2[i]; f.t += dt; if (f.t >= f.life) FX2.splice(i, 1); } });
EV.on('draw', () => { if (!FX2.length) return; const g = ctx; g.save();
  for (const f of FX2){ const k = f.t / f.life; try { f.draw(g, k, fxZ()); } catch (e) {} g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.setLineDash([]); }
  g.restore(); });
const ease = k => 1 - Math.pow(1 - k, 3);

/* a golden swan (hamsa) glides down onto the target */
function fxGoldenSwan(o){
  const feathers = Array.from({length:14}, () => ({x:rand(-50, 50), y:rand(-140, -40), vx:rand(-12, 12), vy:rand(18, 40), a:rand(0, 6), va:rand(-3, 3), d:rand(.1, .5)}));
  fx2Add({life:1.25, draw(g, k, z){
    const X = sx(o.x), Y = sy(o.y), land = Math.min(1, k / .62), fly = ease(land), s = z * (1.15 - .25 * fly);
    const cx = X - (1 - fly) * 70 * z, cy = Y - (130 - 95 * fly) * z, flap = Math.sin(k * 26) * (land < 1 ? 1 : .35);
    // glow under it
    g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(cx, cy, 0, cx, cy, 60 * z); gl.addColorStop(0, `rgba(255,230,150,${.5 * (1 - k * .7)})`); gl.addColorStop(1, 'rgba(255,200,80,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, 60 * z, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';
    // the swan: body, curved neck, crowned head, two beating wings
    g.globalAlpha = k < .85 ? 1 : (1 - k) / .15; g.save(); g.translate(cx, cy); g.scale(s, s);
    const wing = side => { g.save(); g.scale(side, 1); g.rotate(-.35 - flap * .55); const wg = g.createLinearGradient(0, 0, 46, -26); wg.addColorStop(0, '#fff3c0'); wg.addColorStop(1, '#e8a52a');
      g.fillStyle = wg; g.beginPath(); g.moveTo(2, -2); g.bezierCurveTo(14, -30, 38, -36, 50, -24); g.bezierCurveTo(40, -18, 44, -10, 34, -8); g.bezierCurveTo(30, -2, 18, 2, 2, 4); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(160,100,20,.55)'; g.lineWidth = 1; for (let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(14 + i * 8, -12 - i * 3); g.lineTo(22 + i * 8, -6 - i * 2); g.stroke(); } g.restore(); };
    wing(-1); const bg = g.createLinearGradient(-16, -8, 16, 10); bg.addColorStop(0, '#fff8d6'); bg.addColorStop(1, '#f0b43a'); g.fillStyle = bg;
    g.beginPath(); g.ellipse(0, 2, 18, 9, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(12, -1); g.bezierCurveTo(24, -8, 20, -24, 13, -27); g.lineWidth = 5; g.strokeStyle = '#f6cf6a'; g.lineCap = 'round'; g.stroke();
    g.fillStyle = '#f9d978'; g.beginPath(); g.arc(13, -28, 4.2, 0, 7); g.fill(); g.fillStyle = '#d2701c'; g.beginPath(); g.moveTo(16, -28); g.lineTo(23, -26); g.lineTo(16, -25.5); g.fill();
    g.fillStyle = '#ffe9a0'; for (let i = -1; i <= 1; i++){ g.beginPath(); g.moveTo(11 + i * 2.5, -31); g.lineTo(12 + i * 2.5, -37 + Math.abs(i) * 2); g.lineTo(13 + i * 2.5, -31); g.fill(); }
    g.fillStyle = '#2a1606'; g.beginPath(); g.arc(14.5, -28.6, .9, 0, 7); g.fill();
    g.fillStyle = '#f0b43a'; g.beginPath(); g.moveTo(-17, 1); g.quadraticCurveTo(-27, -4, -30, 4); g.quadraticCurveTo(-24, 6, -16, 6); g.fill();
    wing(1); g.restore(); g.globalAlpha = 1;
    // on landing: a soft ring and a puff of feathers
    if (k > .55){ const q = (k - .55) / .45; g.strokeStyle = `rgba(255,215,110,${(1 - q) * .9})`; g.lineWidth = 3 * z * (1 - q) + .5; g.beginPath(); g.ellipse(X, Y, (20 + q * 80) * z, (9 + q * 34) * z, 0, 0, 7); g.stroke(); }
    for (const p of feathers){ const t = k * 1.25, px = X + (p.x + p.vx * t * 3) * z, py = Y + (p.y + p.vy * t * 3) * z, a = p.a + p.va * t; if (k < p.d) continue;
      g.globalAlpha = Math.max(0, 1 - k) * .95; g.save(); g.translate(px, py); g.rotate(a); g.fillStyle = '#fff1bd'; g.beginPath(); g.ellipse(0, 0, 4.5 * z * .5, 1.6 * z * .5, 0, 0, 7); g.fill();
      g.strokeStyle = '#d9a03a'; g.lineWidth = .6; g.beginPath(); g.moveTo(-2.4 * z * .5, 0); g.lineTo(2.4 * z * .5, 0); g.stroke(); g.restore(); }
  }});
}
/* a crescent of shadow drops like a blade; a rift opens and violet shards fly */
function fxShadowGuillotine(o){
  const shards = Array.from({length:10}, () => ({a:rand(-Math.PI, 0), v:rand(40, 90), s:rand(2, 5)}));
  fx2Add({life:.8, draw(g, k, z){
    const X = sx(o.tx != null ? o.tx : o.x), Y = sy((o.ty != null ? o.ty : o.y) - 14), drop = ease(Math.min(1, k / .35));
    if (k < .5){ const y = Y - (1 - drop) * 120 * z; g.globalAlpha = Math.min(1, k * 6);
      const gr = g.createLinearGradient(X, y - 50 * z, X, y + 10 * z); gr.addColorStop(0, 'rgba(60,20,90,0)'); gr.addColorStop(.6, 'rgba(70,30,110,.85)'); gr.addColorStop(1, 'rgba(200,170,255,1)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(X - 26 * z, y - 46 * z); g.quadraticCurveTo(X + 22 * z, y - 20 * z, X - 2 * z, y + 10 * z); g.quadraticCurveTo(X + 8 * z, y - 22 * z, X - 26 * z, y - 46 * z); g.fill(); }
    if (k >= .3){ const q = (k - .3) / .7; g.globalAlpha = 1 - q;
      g.strokeStyle = '#140a22'; g.lineWidth = (6 - 4 * q) * z * .6; g.beginPath(); g.moveTo(X - 30 * z * (q + .3), Y); g.lineTo(X + 30 * z * (q + .3), Y); g.stroke();
      g.strokeStyle = 'rgba(190,150,255,.9)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X - 28 * z * (q + .3), Y - 1); g.lineTo(X + 28 * z * (q + .3), Y - 1); g.stroke();
      g.fillStyle = 'rgba(120,70,190,.9)'; for (const s of shards){ const d = s.v * q * z * .6; g.beginPath(); g.moveTo(X + Math.cos(s.a) * d, Y + Math.sin(s.a) * d); g.lineTo(X + Math.cos(s.a + .2) * (d - s.s * z), Y + Math.sin(s.a + .2) * (d - s.s * z)); g.lineTo(X + Math.cos(s.a - .2) * (d - s.s * z), Y + Math.sin(s.a - .2) * (d - s.s * z)); g.fill(); } }
  }});
}
/* a rune seal turns over the target, closes in and bursts crimson */
function fxDeathSeal(o){
  fx2Add({life:.95, draw(g, k, z){
    const X = sx(o.tx != null ? o.tx : o.x), Y = sy((o.ty != null ? o.ty : o.y) - 16), shrink = k < .6 ? 1 - ease(k / .6) * .55 : .45 - (k - .6) * 1.1, R = Math.max(2, 34 * z * .6 * shrink);
    if (k < .7){ g.globalAlpha = Math.min(1, k * 5); g.save(); g.translate(X, Y); g.rotate(k * 4);
      g.strokeStyle = 'rgba(140,40,180,.95)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, R * .72, 0, 7); g.stroke();
      g.strokeStyle = 'rgba(230,180,255,.9)'; g.lineWidth = 1.4;
      for (let i = 0; i < 6; i++){ const a = i * Math.PI / 3; g.beginPath(); g.moveTo(Math.cos(a) * R * .72, Math.sin(a) * R * .72); g.lineTo(Math.cos(a + 2.1) * R * .72, Math.sin(a + 2.1) * R * .72); g.stroke();
        g.beginPath(); g.arc(Math.cos(a) * R * .86, Math.sin(a) * R * .86, 1.6, 0, 7); g.fill && (g.fillStyle = 'rgba(230,180,255,.9)', g.fill()); }
      g.restore(); }
    if (k >= .62){ const q = (k - .62) / .38; g.globalAlpha = 1 - q; g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(X, Y, 0, X, Y, 36 * z * .6 * (.4 + q)); gr.addColorStop(0, 'rgba(255,90,110,.95)'); gr.addColorStop(1, 'rgba(120,0,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(X, Y, 36 * z * .6 * (.4 + q), 0, 7); g.fill();
      g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(40,0,20,.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X, Y - 22 * z * .6 * (.3 + q)); g.lineTo(X + 3, Y); g.lineTo(X - 2, Y + 18 * z * .6 * (.3 + q)); g.stroke(); }
  }});
}
/* a striped leap from where you stood to where you land, and three claw marks */
function fxTigerLeap(o){
  fx2Add({life:.6, draw(g, k, z){
    const x1 = sx(o.x), y1 = sy(o.y), x2 = sx(o.x2), y2 = sy(o.y2), mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 46 * z * .6;
    const upTo = Math.min(1, k / .35);
    g.globalAlpha = 1 - Math.max(0, (k - .35) / .65); g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,150,40,.85)'; g.lineWidth = 9 * z * .5; g.beginPath(); g.moveTo(x1, y1);
    for (let i = 1; i <= 16; i++){ const t = i / 16 * upTo, x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2; g.lineTo(x, y); } g.stroke();
    g.strokeStyle = 'rgba(30,18,10,.85)'; g.lineWidth = 9 * z * .5; g.setLineDash([3 * z, 7 * z]); g.stroke(); g.setLineDash([]);
    if (k > .3){ const q = Math.min(1, (k - .3) / .2); g.globalAlpha = 1 - Math.max(0, (k - .5) / .5); g.strokeStyle = '#fff2d8'; g.lineWidth = 2.4;
      for (let i = -1; i <= 1; i++){ g.beginPath(); g.moveTo(x2 - 14 * z * .6 + i * 7, y2 - 26 * z * .6); g.lineTo(x2 - 14 * z * .6 + i * 7 + 24 * z * .6 * q, y2 - 26 * z * .6 + 22 * z * .6 * q); g.stroke(); }
      g.fillStyle = 'rgba(190,160,120,.4)'; g.beginPath(); g.ellipse(x2, y2 + 2, 22 * z * .6 * q, 6 * z * .6 * q, 0, 0, 7); g.fill(); }
  }});
}
/* a pale crescent rises behind the target and three claw rakes cross it */
function fxMoonClaw(o){
  const motes = Array.from({length:12}, () => ({x:rand(-40, 40), y:rand(-50, 10), d:rand(0, .5)}));
  fx2Add({life:.95, draw(g, k, z){
    const X = sx(o.x), Y = sy(o.y - 16), m = z * .6;
    g.globalAlpha = Math.min(1, k * 4) * (1 - Math.max(0, (k - .7) / .3));
    g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(X + 10 * m, Y - 30 * m, 0, X + 10 * m, Y - 30 * m, 46 * m); gl.addColorStop(0, 'rgba(210,225,255,.55)'); gl.addColorStop(1, 'rgba(120,140,255,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(X + 10 * m, Y - 30 * m, 46 * m, 0, 7); g.fill(); g.restore();
    g.fillStyle = 'rgba(235,240,255,.95)'; g.beginPath(); g.arc(X + 10 * m, Y - 30 * m, 22 * m, 0, 7); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(X + 19 * m, Y - 35 * m, 20 * m, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';
    for (let r = 0; r < 3; r++){ const st = .18 + r * .13, q = (k - st) / .2; if (q <= 0) continue; const a = Math.min(1, q), fade = Math.max(0, 1 - (k - st - .2) / .35);
      g.globalAlpha = fade; g.lineCap = 'round';
      for (let i = -1; i <= 1; i++){ const ox = (r - 1) * 16 * m + i * 6 * m, x0 = X - 26 * m + ox, y0 = Y + 18 * m - r * 6 * m, x1 = x0 + 46 * m * a, y1 = y0 - 46 * m * a;
        g.strokeStyle = 'rgba(160,190,255,.55)'; g.lineWidth = 5.5; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 18 * m * a, y0 - 8 * m * a, x1, y1); g.stroke();
        g.strokeStyle = '#ffffff'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 18 * m * a, y0 - 8 * m * a, x1, y1); g.stroke(); } }
    g.fillStyle = '#e8eeff'; for (const p of motes){ if (k < p.d) continue; const q = (k - p.d) / (1 - p.d); g.globalAlpha = (1 - q) * .9; g.beginPath(); g.arc(X + p.x * m, Y + (p.y - q * 30) * m, 1.4, 0, 7); g.fill(); }
  }});
}
const FX2_PLAY = {goldenSwan:fxGoldenSwan, shadowGuillotine:fxShadowGuillotine, deathSeal:fxDeathSeal, tigerLeap:fxTigerLeap, moonClaw:fxMoonClaw};
let FX2_CUR = null;   // the skill being used right now (so a dash can play its own leap)
{ const _ts = trySkill; trySkill = function(id){ const prev = FX2_CUR; FX2_CUR = id; try { return _ts.apply(this, arguments); } finally { FX2_CUR = prev; } }; }
{ const _p = VFX.play;
  VFX.play = function(key, o = {}){
    if (key === 'charge' && FX2_CUR && SKILLS[FX2_CUR] && SKILLS[FX2_CUR].fxDash) key = SKILLS[FX2_CUR].fxDash;
    const f = FX2_PLAY[key]; if (f){ f(o); if (key === 'shadowGuillotine' || key === 'deathSeal') VFX.shake(3); return; }
    return _p.apply(this, arguments); }; }
