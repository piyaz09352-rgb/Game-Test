/* VAYRATHEN — js/sys/beastart.js — hand-drawn summons: the Sming Tiger (เสือสมิง), Erawan (ช้างเอราวัณ), the Kinnaree (กินรี), the Naga (นาคา) and the Garuda (ครุฑ)
   Each summon here is drawn from a sheet in assets/characters/<id>/<id>.png: 8 directions across (S SW W NW N NE E SE,
   the game's dir order), one feet-anchored cell per pose down. A pose with `frames` is an animation across its row
   (Erawan's fall). The skill ids stay the same (callsingha / callerawan), so saves, hotkeys and skill points carry
   over. Until a picture has loaded the old procedural beast is drawn instead.
   · Sming Tiger — replaces the Summoner's Singha: idle, walk, run, claw slash, roar, hit, fallen.
   · Erawan — the Sovereign's three-headed elephant: idle, walk, golden tusk sweep, trunks-raised blessing, fall (7 frames).
   · Kinnaree — the Summoner's healer: idle (8 ways), flight and feather slash (mirrored west), golden dance of life, fall.
   · Naga — the Summoner's water mage: coiled idle and slither (8 ways each), tail-lash wave (9 frames), jade water pillar (6), fall (8).
   · Garuda — the Sovereign's striker: stance and stride (8 ways each), talon dash (7, mirrored west), golden pillar (6), fall (7). */
'use strict';

const BEAST_ART = {
  singha:{file:'sming', cw:100, ch:88, ax:50, ay:85, body:70, h:50, rows:{idle:0, walk:1, run:2, attack:3, skill:4, hit:5, dead:6}, dead:.45},
  erawan:{file:'erawan', cw:112, ch:132, ax:56, ay:129, body:84, h:62, rows:{idle:0, walk:1, attack:2, skill:3, dead:4}, deadFrames:7, dead:.8},
  // the Kinnaree flies: idle faces the 8 ways; her flight and feather slash are drawn facing east and mirrored for the west
  kinnaree:{file:'kinnaree', cw:140, ch:110, ax:70, ay:107, body:96, h:58, lift:12, rows:{idle:0, walk:1, attack:2, skill:3, dead:4}, deadFrames:7, dead:.9,
    anim:{walk:{n:8, fps:11, side:true}, attack:{n:8, side:true, key:'atkT', len:.45}, skill:{n:3, fps:7}}},
  // the Naga coils in 8 ways and slithers in 8; its tail-lash with a wave, and the jade water-pillar it rises in, play across their rows
  naga:{file:'naga', cw:110, ch:97, ax:55, ay:94, body:80, h:58, rows:{idle:0, walk:1, attack:2, skill:3, dead:4}, deadFrames:8, dead:.9,
    anim:{attack:{n:9, key:'atkT', len:.45}, skill:{n:6, key:'skT', len:.7}}},
  // the Garuda stands in 8 ways and strides in 8; its talon dash is drawn facing east (mirrored west), its skill a pillar of gold
  garuda:{file:'garuda', cw:156, ch:101, ax:78, ay:98, body:86, h:64, rows:{idle:0, walk:1, attack:2, skill:3, dead:4}, deadFrames:7, dead:.9,
    anim:{attack:{n:7, side:true, key:'atkT', len:.45}, skill:{n:6, key:'skT', len:.7}}}
};
for (const k in BEAST_ART){ const A = BEAST_ART[k], im = new Image(); im.onload = () => { A.img = im; A.ready = true; }; im.src = `assets/characters/${A.file}/${A.file}.png`; }
const SMING = BEAST_ART.singha;   // (kept for tests and other systems)

/* the drawn sheets are switched OFF for now (the player asked for the summons' old look back). The pictures stay in
   assets/ and beastArtUse(true) brings them back. The Sming Tiger keeps its name and uses the old-style tiger. */
let BEAST_ART_ON = false;
const BEAST_ORIG = {}; for (const k in BEAST_ART) BEAST_ORIG[k] = {mob:HIMMA[k].mob, scale:HIMMA[k].scale};
BEAST_ORIG.singha = {mob:'misttiger', scale:.9};
BEAST_ORIG.erawan.scale = 1.35;   // (v126) the elephant still stands over the tiger, without filling the screen (was 1.9)
HIMMA.erawan.reach = 30;
const BEAST_ART_MOB = {singha:'smingtiger', erawan:'erawanart', kinnaree:'kinnareeart', naga:'nagaart', garuda:'garudaart'};
function beastArtUse(on){ BEAST_ART_ON = !!on; for (const k in BEAST_ART) Object.assign(HIMMA[k], on ? {mob:BEAST_ART_MOB[k], scale:k === 'erawan' ? 1.05 : 1}   /* (v126) Erawan art was drawn too big (1.4) */ : BEAST_ORIG[k]); }
/* the Sming Tiger takes the Singha's place */
Object.assign(HIMMA.singha, {name:['เสือสมิง', 'Sming Tiger'], aura:'auraGold'});
HIMMA.singha.skill.name = ['คำรามเสือสมิง', 'Sming Roar'];
MOB_H0.smingtiger = SMING.h + 6;   // name plate just above the ears
Object.assign(SKILLS.callsingha, {name:'อัญเชิญเสือสมิง', en:'Call the Sming Tiger', short:'เสือสมิง', shortEn:'Sming'});
{ const _d = SKILLS.callsingha.desc; SKILLS.callsingha.desc = lv => String(_d(lv)).replace(/ราชสีห์ผู้พิทักษ์/g, 'เสือสมิงผู้พิทักษ์').replace(/ราชสีห์/g, 'เสือสมิง').replace(/สีหนาทพิทักษ์/g, 'คำรามเสือสมิง')
  .replace(/guardian Singha/gi, 'guardian Sming Tiger').replace(/Singha/g, 'Sming Tiger').replace(/Guardian Roar/g, 'Sming Roar'); }
/* Erawan keeps its name; its plate sits above the tallest crown */
MOB_H0.erawanart = BEAST_ART.erawan.h + 4;
/* the Kinnaree keeps her name; drawn full size, floating above her shadow */
MOB_H0.kinnareeart = BEAST_ART.kinnaree.h + BEAST_ART.kinnaree.lift + 4;
/* the Naga keeps its name too */
MOB_H0.nagaart = BEAST_ART.naga.h + 4;
/* the Garuda keeps its name too */
MOB_H0.garudaart = BEAST_ART.garuda.h + 4;

beastArtUse(BEAST_ART_ON);

/* which pose: the skill while it fires, the attack while striking, a flinch when hit, run when charging a far target */
function beastPose(s, A){
  if (s.beast !== 'bound' && s.dur - s.t < A.dead) return 'dead';
  if (s.skT > 0) return 'skill'; if (s.atkT > 0) return 'attack'; if (s.hurt > 0 && A.rows.hit != null) return 'hit';
  if (s.moving) return A.rows.run != null && s.target && Math.hypot(s.target.x - s.x, s.target.y - s.y) > 90 ? 'run' : 'walk';
  return 'idle';
}
const garudaPose = s => beastPose(s, BEAST_ART.garuda);
const nagaPose = s => beastPose(s, BEAST_ART.naga);
const kinPose = s => beastPose(s, BEAST_ART.kinnaree);
const smingPose = s => ({skill:'roar'}[beastPose(s, SMING)] || beastPose(s, SMING));
{
  const _db = drawBeast;
  const fallback = {singha:'goldsingha', erawan:'youngerawan', kinnaree:'goldkinnaree', naga:'lakenaga', garuda:'goldgaruda'};
  drawBeast = function(g, s){
    const A = BEAST_ART[s.beast];
    if (!BEAST_ART_ON || !A || !A.ready){ if (A && SHEETS && BEAST_ART_ON){ const B = beastDef(s); if (!SHEETS[B.mob]) SHEETS[B.mob] = SHEETS[fallback[s.beast]]; } return _db(g, s); }
    const B = beastDef(s), rc = ROLE_RGB[B.role || 'tank'];
    const lk = s.atkT > 0 && s.lx != null ? Math.sin(clamp(1 - s.atkT / .45, 0, 1) * Math.PI) * 6 / (Math.hypot(s.lx, s.ly) || 1) : 0;
    const x = s.x - cam.x + (s.lx || 0) * lk, y = s.y - cam.y + (s.ly || 0) * lk * .6;
    if (x < -100 || x > VW + 100 || y < -130 || y > VH + 100) return;
    const fade = Math.max(0, Math.min(1, s.t * 2.5, (s.dur - s.t) * 1.5)), warn = s.dur - s.t < 3 && Math.sin(T * 14) > 0 ? .6 : 1;
    const pose = beastPose(s, A), k = A.h / A.body, d8 = (s.dir || 0) & 7, an = A.anim && A.anim[pose];
    let row = A.rows[pose], col = d8, flip = false;
    if (pose === 'dead' && A.deadFrames) col = Math.min(A.deadFrames - 1, Math.floor((1 - (s.dur - s.t) / A.dead) * A.deadFrames));
    else if (an && pose === 'walk' && (d8 === 0 || d8 === 4)) row = A.rows.idle;   // straight toward or away: the facing pose, bobbing
    else if (an){ col = an.key ? clamp(Math.floor((1 - s[an.key] / an.len) * an.n), 0, an.n - 1) : Math.floor(s.t * an.fps) % an.n; flip = !!an.side && d8 >= 1 && d8 <= 3; }
    const lift = (A.lift && pose !== 'dead' ? A.lift + Math.sin(s.t * 3.2) * 2.5 : 0) + (s.diveT > 0 ? Math.sin(s.diveT / .35 * Math.PI) * 26 : 0);   // a dive swoops up and down
    // life in a single frame: breathing, a stepping bob, a swell on the skill
    const tt = s.t, heavy = s.beast === 'erawan', bob = pose === 'walk' ? Math.abs(Math.sin(tt * (heavy ? 6 : 9))) * (heavy ? 1.2 : 1.6) : pose === 'run' ? Math.abs(Math.sin(tt * 13)) * 2.6 : 0;
    const breathe = pose === 'idle' ? 1 + Math.sin(tt * 2.4) * .018 : 1, swell = pose === 'skill' ? 1 + Math.sin(clamp(s.skT / .7, 0, 1) * Math.PI) * .06 : 1;
    const tilt = pose === 'walk' ? Math.sin(tt * (heavy ? 6 : 9)) * (heavy ? .015 : .03) : pose === 'run' ? Math.sin(tt * 13) * .05 : 0;
    g.save();
    g.globalAlpha = fade; g.strokeStyle = `rgba(${rc},${.55 + Math.sin(T * 3 + s.x) * .15})`; g.lineWidth = 1; g.setLineDash([4, 3]); g.lineDashOffset = -T * 10;
    g.beginPath(); g.ellipse(x, y, heavy ? 26 : 19, heavy ? 9 : 7, 0, 0, 7); g.stroke(); g.setLineDash([]);
    shadowW(g, x, y, pose === 'dead' ? (heavy ? 26 : 20) : heavy ? 20 : 14);
    g.translate(x, y - bob - lift); g.rotate(tilt); g.scale(k * swell * (flip ? -1 : 1), k * swell * breathe);
    g.globalAlpha = fade * warn; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(A.img, col * A.cw, row * A.ch, A.cw, A.ch, -A.ax, -A.ay, A.cw, A.ch);
    if (s.hurt > 0){ g.globalCompositeOperation = 'lighter'; g.globalAlpha = .4 * fade * warn; g.drawImage(A.img, col * A.cw, row * A.ch, A.cw, A.ch, -A.ax, -A.ay, A.cw, A.ch); }
    g.restore();
    if (s.guard > 0){ g.save(); const a = Math.min(1, s.guard) * (.55 + Math.sin(T * 6) * .15), top = A.h;
      g.strokeStyle = `rgba(${rc},${a})`; g.lineWidth = 1.4; g.beginPath(); g.ellipse(x, y - top * .5, heavy ? 30 : 24, top * .62, 0, 0, 7); g.stroke();
      g.globalAlpha = a * .18; g.fillStyle = `rgb(${rc})`; g.fill(); g.restore(); }
    s.tagFade = fade;
  };
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'sming', t:['เสือสมิงและช้างเอราวัณ', 'Sming Tiger & Erawan'], b:() => L(
  '<p><b>อัญเชิญเสือสมิง</b> (สายอัญเชิญ): เสือสมิง ผีเสือในตำนานไทยที่สิงร่างคนจนกลายเป็นเสือ มาเป็นแทงค์ ยั่วมอนเข้าหาตัวเอง ตะปบด้วยกรงเล็บ และ <b>คำรามเสือสมิง</b> ดึงมอนทั้งฝูงพร้อมกางโล่</p><p><b>อัญเชิญช้างเอราวัณ</b> (ราชันย์หิมพานต์): ช้างสามเศียรพาหนะพระอินทร์ ฟาดงาทองกวาดศัตรู และชูงวงทั้งสามเรียกแสงศักดิ์สิทธิ์กระทืบธรณี</p>',
  '<p><b>Call the Sming Tiger</b> (Summoner): the were-tiger of Thai legend, a man taken by a tiger spirit, fights as your tank: it draws monsters onto itself, rakes them with its claws, and its <b>Sming Roar</b> taunts the whole pack and raises a shield.</p><p><b>Call Erawan</b> (Sovereign): Indra\'s three-headed white elephant sweeps foes with golden tusks and raises its three trunks to call down holy light as it stomps the earth.</p>')});
