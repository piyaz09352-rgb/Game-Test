/* VAYRATHEN — js/sys/classfx301.js — (v301) every class line has its own grand signature on its skills
   The owner asked for skill, attack and buff effects that look better, fit each class and feel grander. Until now the
   big layers on top of a skill (rings, a seal, sparks) were the same for all twelve lines. Each line now has a token
   of its own, drawn as a real shape, and every kind of skill uses it:
     blade = swords · rune = rune stones (or flames, ice, lightning, rock by the spell's element) · ranger = feathers ·
     muay = impact stars · healer = lotus petals · rogue = crescent moons · summoner = kanok flames · occult = spirit
     wisps · merchant = old coins · catfolk = paw prints · dogfolk = fangs · ninja = shuriken (or the jutsu's element)
   · buffs / restores : a class seal opens under the hero, tokens circle up round the body in a helix (behind and in
     front of the hero), soft rings rise; the biggest buffs add a second ring turning the other way and a crown
   · heals            : the seal, petals and light rising
   · area spells      : a class seal the size of the spell, tokens raining into it with streaks and landing rings;
     tier 3–4 add light spears standing round the edge
   · self-centred     : the seal and a fan of tokens flying out along the ground, crescents turning round the hero
   · lines and dashes : an escort of tokens along the path and a crescent where it ends
   · summons, tricks  : tokens spiral into the seal and shoot up · tokens close in on the target and mark it
   · the hit itself   : the line's own mark — a sword crescent, crossed moon cuts, claw rakes, closing fangs,
     an impact star, a fountain of coins, spinning shuriken, a burst of feathers / petals / runes
   · normal attacks get a small version of the hit mark.
   No full-screen flash and nothing that hides the hero (the owner's earlier rules): shapes are drawn with outlines,
   lights are soft. Fewer pieces on lower graphics. Only drawing: no skill's numbers change. */
'use strict';

const CFX = {cur:null, lastBasic:0};
const cfxQ = () => ([.45, .75, 1][GFX.fx] ?? 1);
const cfxN = n => Math.max(1, Math.round(n * cfxQ()));
const cfxE = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
const cfxH = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
const CFX_LINETOK = {blade:'sword', rune:'rune', ranger:'feather', muay:'star8', healer:'petal', rogue:'moon', summoner:'kanok', occult:'wisp',
  merchant:'coin', catfolk:'paw', dogfolk:'fang', ninja:'shuriken', novice:'cross'};
const CFX_ELTOK = {fire:'flame', water:'shard', wind:'bolt', earth:'rock', holy:'cross', shadow:'wisp', poison:'leaf'};
const CFX_EMB = {blade:[8, 3], rune:[6, 2], ranger:[9, 3], muay:[8, 2], healer:[8, 0], rogue:[5, 2], summoner:[12, 5], occult:[7, 3], merchant:[4, 1], catfolk:[10, 4], dogfolk:[8, 1], ninja:[4, 1], novice:[6, 1]};
const cfxLine = job => (typeof lfxLine === 'function' ? lfxLine(job) : job) || 'novice';
function cfxLook(sk){ const line = cfxLine(sk ? sk.job : S.job), el = sk && sk.elem !== 'neutral' && SKFX_EL[sk.elem] ? sk.elem : null;   // «neutral» and the ninja's four-element mix keep the class's own colour
  const col = el && SKFX_EL[el] ? SKFX_EL[el] : sk && sk.type === 'heal' && line !== 'healer' ? SKFX_EL.heal : (typeof LFX_LINE_COL !== 'undefined' && LFX_LINE_COL[line]) || (sk ? skfxCol(sk) : SKFX_EL.neutral);
  const tok = (line === 'rune' || line === 'ninja' || line === 'novice') && CFX_ELTOK[el] ? CFX_ELTOK[el] : CFX_LINETOK[line] || 'cross';
  return {line, col, tok, emb:CFX_EMB[line] || [6, 1]}; }

/* ---------- the tokens: drawn at the origin, pointing up, s = half the height ---------- */
const CFX_TOK = {
  sword(g, s, c){ g.lineWidth = Math.max(.5, s * .07); g.strokeStyle = c[2];
    g.fillStyle = '#f6f8fc'; g.beginPath(); g.moveTo(0, -s); g.lineTo(s * .17, -s * .72); g.lineTo(s * .14, s * .3); g.lineTo(-s * .14, s * .3); g.lineTo(-s * .17, -s * .72); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = c[0]; g.beginPath(); g.moveTo(0, -s); g.lineTo(s * .17, -s * .72); g.lineTo(s * .14, s * .3); g.lineTo(0, s * .3); g.closePath(); g.fill();
    g.fillStyle = c[1]; g.fillRect(-s * .4, s * .3, s * .8, s * .13); g.strokeRect(-s * .4, s * .3, s * .8, s * .13); g.fillStyle = c[2]; g.fillRect(-s * .07, s * .43, s * .14, s * .38);
    g.fillStyle = c[1]; g.beginPath(); g.arc(0, s * .88, s * .12, 0, 7); g.fill(); },
  rune(g, s, c){ g.lineJoin = 'round'; g.fillStyle = c[2]; g.strokeStyle = c[1]; g.lineWidth = Math.max(.6, s * .1);
    g.beginPath(); g.moveTo(0, -s); g.lineTo(s * .62, -s * .3); g.lineTo(s * .5, s * .7); g.lineTo(-s * .5, s * .7); g.lineTo(-s * .62, -s * .3); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = c[0]; g.lineWidth = Math.max(.6, s * .11); g.beginPath(); g.moveTo(-s * .12, s * .45); g.lineTo(-s * .12, -s * .55); g.lineTo(s * .25, -s * .28); g.lineTo(-s * .12, -s * .02); g.lineTo(s * .28, s * .45); g.stroke(); },
  flame(g, s, c){ g.fillStyle = c[1]; g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * .15, -s * .45, s * .8, -s * .1, s * .52, s * .5); g.bezierCurveTo(s * .3, s * .95, -s * .3, s * .95, -s * .52, s * .5); g.bezierCurveTo(-s * .8, 0, -s * .25, -s * .2, 0, -s); g.fill();
    g.fillStyle = c[0]; g.beginPath(); g.moveTo(s * .04, -s * .35); g.bezierCurveTo(s * .4, 0, s * .3, s * .6, 0, s * .68); g.bezierCurveTo(-s * .32, s * .6, -s * .3, s * .1, s * .04, -s * .35); g.fill(); },
  shard(g, s, c){ g.fillStyle = c[1]; g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(.5, s * .07); g.beginPath(); g.moveTo(0, -s); g.lineTo(s * .34, -s * .35); g.lineTo(s * .26, s * .6); g.lineTo(0, s); g.lineTo(-s * .26, s * .6); g.lineTo(-s * .34, -s * .35); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = c[0]; g.beginPath(); g.moveTo(0, -s); g.lineTo(s * .34, -s * .35); g.lineTo(s * .26, s * .6); g.lineTo(0, s); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.moveTo(0, -s); g.lineTo(0, s); g.stroke(); },
  bolt(g, s, c){ g.fillStyle = c[0]; g.strokeStyle = c[1]; g.lineWidth = Math.max(.6, s * .1); g.lineJoin = 'round'; g.beginPath(); g.moveTo(s * .3, -s); g.lineTo(-s * .42, s * .08); g.lineTo(-s * .02, s * .08); g.lineTo(-s * .3, s); g.lineTo(s * .45, -s * .14); g.lineTo(s * .04, -s * .14); g.closePath(); g.fill(); g.stroke(); },
  rock(g, s, c){ g.fillStyle = c[2]; g.strokeStyle = '#2a1c10'; g.lineWidth = Math.max(.5, s * .07); g.beginPath(); g.moveTo(-s * .1, -s); g.lineTo(s * .6, -s * .45); g.lineTo(s * .7, s * .4); g.lineTo(s * .1, s * .9); g.lineTo(-s * .62, s * .5); g.lineTo(-s * .7, -s * .3); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = c[1]; g.beginPath(); g.moveTo(-s * .1, -s); g.lineTo(s * .6, -s * .45); g.lineTo(s * .1, -s * .05); g.lineTo(-s * .7, -s * .3); g.closePath(); g.fill(); g.fillStyle = c[0]; g.beginPath(); g.moveTo(-s * .1, -s); g.lineTo(s * .25, -s * .7); g.lineTo(-s * .2, -s * .5); g.closePath(); g.fill(); },
  feather(g, s, c){ g.fillStyle = c[0]; g.strokeStyle = c[2]; g.lineWidth = Math.max(.5, s * .06); g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * .62, -s * .3, s * .22, s * .55); g.lineTo(0, s * .7); g.lineTo(-s * .22, s * .55); g.quadraticCurveTo(-s * .62, -s * .3, 0, -s); g.fill(); g.stroke();
    g.fillStyle = c[1]; g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * .62, -s * .3, s * .22, s * .55); g.lineTo(0, s * .7); g.closePath(); g.fill();
    g.strokeStyle = c[2]; g.beginPath(); g.moveTo(0, -s * .9); g.lineTo(0, s); g.moveTo(0, -s * .2); g.lineTo(s * .3, -s * .45); g.moveTo(0, s * .15); g.lineTo(s * .28, -s * .08); g.moveTo(0, -s * .2); g.lineTo(-s * .3, -s * .45); g.moveTo(0, s * .15); g.lineTo(-s * .28, -s * .08); g.stroke(); },
  star8(g, s, c){ g.fillStyle = c[1]; g.beginPath(); for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? s * .36 : i % 4 ? s * .72 : s; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
    g.fillStyle = c[0]; g.beginPath(); for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2 - Math.PI / 2, r = (i % 2 ? s * .2 : i % 4 ? s * .4 : s * .62); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); },
  petal(g, s, c){ g.fillStyle = '#ffd9ea'; g.strokeStyle = '#d9628f'; g.lineWidth = Math.max(.5, s * .06); g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * .7, -s * .4, s * .55, s * .5, 0, s); g.bezierCurveTo(-s * .55, s * .5, -s * .7, -s * .4, 0, -s); g.fill(); g.stroke();
    g.fillStyle = '#ff9cc2'; g.beginPath(); g.moveTo(0, -s * .2); g.bezierCurveTo(s * .34, 0, s * .3, s * .6, 0, s); g.bezierCurveTo(-s * .3, s * .6, -s * .34, 0, 0, -s * .2); g.fill(); g.strokeStyle = c[1]; g.beginPath(); g.moveTo(0, -s * .7); g.lineTo(0, s * .1); g.stroke(); },
  leaf(g, s, c){ g.fillStyle = c[1]; g.strokeStyle = c[2]; g.lineWidth = Math.max(.5, s * .06); g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * .75, -s * .1, 0, s); g.quadraticCurveTo(-s * .75, -s * .1, 0, -s); g.fill(); g.stroke(); g.strokeStyle = c[0]; g.beginPath(); g.moveTo(0, -s * .8); g.lineTo(0, s * .85); g.stroke(); },
  moon(g, s, c){ g.fillStyle = c[0]; g.strokeStyle = c[1]; g.lineWidth = Math.max(.6, s * .09); g.beginPath(); g.arc(0, 0, s, -Math.PI * .5 - 1.25, -Math.PI * .5 + 1.25 + Math.PI, false); g.arc(s * .42, -s * .06, s * .78, Math.PI * .5 + .95, -Math.PI * .5 - .95, true); g.closePath(); g.fill(); g.stroke(); },
  kanok(g, s, c){ g.fillStyle = c[1]; g.strokeStyle = c[2]; g.lineWidth = Math.max(.5, s * .06);
    g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * .5, -s * .5, s * .2, -s * .1, s * .62, s * .1); g.bezierCurveTo(s * .7, s * .6, s * .3, s * .95, 0, s * .9); g.bezierCurveTo(-s * .3, s * .95, -s * .7, s * .6, -s * .62, s * .1); g.bezierCurveTo(-s * .2, -s * .1, -s * .5, -s * .5, 0, -s); g.fill(); g.stroke();
    g.strokeStyle = c[0]; g.lineWidth = Math.max(.6, s * .1); g.beginPath(); g.moveTo(0, -s * .55); g.bezierCurveTo(s * .3, -s * .1, s * .36, s * .5, 0, s * .55); g.bezierCurveTo(-s * .3, s * .5, -s * .26, s * .12, 0, s * .1); g.stroke(); },
  wisp(g, s, c){ g.fillStyle = c[1]; g.beginPath(); g.moveTo(0, -s * .15); g.arc(0, -s * .45, s * .48, Math.PI * .85, Math.PI * .15, false); g.bezierCurveTo(s * .5, s * .2, s * .05, s * .3, s * .3, s); g.bezierCurveTo(-s * .25, s * .6, -s * .1, s * .25, -s * .46, -s * .2); g.fill();
    g.fillStyle = c[0]; g.beginPath(); g.arc(0, -s * .45, s * .26, 0, 7); g.fill(); },
  coin(g, s, c){ g.fillStyle = '#f5c842'; g.strokeStyle = '#8a5a08'; g.lineWidth = Math.max(.6, s * .1); g.beginPath(); g.arc(0, 0, s * .82, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = '#fff3b0'; g.lineWidth = Math.max(.5, s * .08); g.beginPath(); g.arc(0, 0, s * .58, Math.PI * .9, Math.PI * 1.7); g.stroke(); g.fillStyle = '#8a5a08'; g.fillRect(-s * .22, -s * .22, s * .44, s * .44); g.fillStyle = '#5a3a04'; g.fillRect(-s * .14, -s * .14, s * .28, s * .28); },
  paw(g, s, c){ g.fillStyle = c[1]; g.strokeStyle = c[2]; g.lineWidth = Math.max(.5, s * .06); g.beginPath(); g.moveTo(0, -s * .1); g.bezierCurveTo(s * .6, -s * .1, s * .7, s * .7, 0, s * .8); g.bezierCurveTo(-s * .7, s * .7, -s * .6, -s * .1, 0, -s * .1); g.fill(); g.stroke();
    for (const [x, y, r] of [[-s * .58, -s * .28, .2], [-s * .22, -s * .68, .23], [s * .22, -s * .68, .23], [s * .58, -s * .28, .2]]){ g.beginPath(); g.ellipse(x, y, s * r, s * r * 1.25, x / s * .5, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = c[0]; g.beginPath(); g.ellipse(0, s * .38, s * .22, s * .16, 0, 0, 7); g.fill(); },
  fang(g, s, c){ g.fillStyle = '#fdfaf0'; g.strokeStyle = c[2]; g.lineWidth = Math.max(.5, s * .07); g.beginPath(); g.moveTo(-s * .42, -s * .8); g.quadraticCurveTo(0, -s, s * .42, -s * .8); g.quadraticCurveTo(s * .38, s * .2, s * .05, s); g.quadraticCurveTo(-s * .38, s * .25, -s * .42, -s * .8); g.fill(); g.stroke();
    g.fillStyle = c[1]; g.beginPath(); g.moveTo(-s * .42, -s * .8); g.quadraticCurveTo(0, -s, s * .42, -s * .8); g.quadraticCurveTo(0, -s * .5, -s * .42, -s * .8); g.fill(); },
  shuriken(g, s, c){ g.fillStyle = '#dfe6f2'; g.strokeStyle = '#1c2030'; g.lineWidth = Math.max(.5, s * .07); g.beginPath(); for (let i = 0; i < 4; i++){ const a = i * Math.PI / 2 - Math.PI / 2; g.lineTo(Math.cos(a) * s, Math.sin(a) * s); g.lineTo(Math.cos(a + .95) * s * .34, Math.sin(a + .95) * s * .34); } g.closePath(); g.fill(); g.stroke();
    g.fillStyle = c[1]; g.beginPath(); g.arc(0, 0, s * .2, 0, 7); g.fill(); g.stroke(); },
  cross(g, s, c){ g.fillStyle = c[1]; g.beginPath(); for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? s * .2 : i % 4 ? s * .55 : s; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? s * .1 : i % 4 ? s * .28 : s * .55; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }
};
function cfxTok(g, kind, x, y, s, rot, c, a){ if (a <= .02 || s <= .3) return; s *= 1.4; g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.globalAlpha = Math.min(1, a); (CFX_TOK[kind] || CFX_TOK.cross)(g, s, c); g.restore(); }

/* ---------- moving tokens: one effect, many pieces; it.fn(q) → [x, y, z] in the world, q = 0..1 of that piece's own time ---------- */
function cfxToks(items, tok, c, o = {}){ if (!items.length) return; let life = 0; for (const it of items){ it.t0 = it.t0 || 0; it.dur = it.dur || .6; life = Math.max(life, it.t0 + it.dur); }
  const mk = (layer, pick) => skfxAdd({life, layer, draw(g, k){ const t = k * life;
    for (const it of items){ const q = (t - it.t0) / it.dur; if (q <= 0 || q >= 1) continue; const p = it.fn(q); if (pick && !pick(p, it, q)) continue;
      const a = (q < .12 ? q / .12 : q > .72 ? (1 - q) / .28 : 1) * (it.a ?? 1), X = p[0], Y = p[1] - p[2];
      if (o.trail){ const p0 = it.fn(Math.max(0, q - o.trail)); g.globalAlpha = a * .5; g.strokeStyle = c[1]; g.lineCap = 'round'; g.lineWidth = Math.max(.8, it.s * .32); g.beginPath(); g.moveTo(p0[0], p0[1] - p0[2]); g.lineTo(X, Y); g.stroke();
        g.globalAlpha = a * .7; g.strokeStyle = c[0]; g.lineWidth = Math.max(.5, it.s * .12); g.stroke(); }
      let rot = (it.rot || 0) + (it.spin || 0) * q; if (o.face){ const p1 = it.fn(Math.min(1, q + .03)); rot = Math.atan2((p1[1] - p1[2]) - Y, p1[0] - X) + Math.PI / 2; }
      if (o.land && q > .82 && p[2] < 6){ const e = (q - .82) / .18; g.globalAlpha = (1 - e) * .8; g.strokeStyle = c[0]; g.lineWidth = 1.4; g.beginPath(); g.ellipse(p[0], p[1], it.s * (.6 + e * 2.2), it.s * (.3 + e * 1.1), 0, 0, 7); g.stroke(); }
      cfxTok(g, tok, X, Y, it.s * (it.grow ? .5 + .5 * Math.min(1, q * 4) : 1) * (o.flip ? 1 : 1), rot, c, a); } }});
  if (o.split){ mk('under', p => p[3] < 0); mk('over', p => p[3] >= 0); } else mk(o.layer || 'over'); }

/* ---------- the class seal on the ground ---------- */
function cfxEmblem(x, y, r, L, life = 1.3, o = {}){ const c = L.col, [n, step] = L.emb, rot0 = cfxH(x, y) * 6.28, follow = o.follow, dirS = o.spin ?? .7;
  const up = o.up ? 1 : .5, zz = o.z || 0, ox = follow ? x - P.x : 0, oy = follow ? y - P.y : 0;
  skfxAdd({life, t:-(o.delay || 0), layer:o.up ? 'over' : 'under', draw(g, k){ const a = (k < .14 ? k / .14 : k > .7 ? (1 - k) / .3 : 1) * (o.a ?? .9), e = .55 + .45 * cfxE(k * 4), R = r * e, X = follow ? P.x + ox : x, Y = (follow ? P.y + oy : y) - zz;
    g.save(); g.translate(X, Y); g.scale(1, up); g.rotate(rot0 + k * life * dirS); g.lineJoin = 'round';
    g.globalAlpha = a * .22; g.strokeStyle = c[1]; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke();
    g.globalAlpha = a; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); g.strokeStyle = c[0]; g.lineWidth = 1.1; g.beginPath(); g.arc(0, 0, R * .86, 0, 7); g.stroke();
    for (let i = 0; i < n * 4; i++){ const q = i / (n * 4) * Math.PI * 2, r0 = R * (i % 4 ? .9 : .86), r1 = R * .97; g.beginPath(); g.moveTo(Math.cos(q) * r0, Math.sin(q) * r0); g.lineTo(Math.cos(q) * r1, Math.sin(q) * r1); g.stroke(); }
    const Ri = R * .8; g.strokeStyle = c[1]; g.lineWidth = 1.5;
    if (!step){ for (let i = 0; i < n; i++){ g.save(); g.rotate(i / n * Math.PI * 2); g.beginPath(); g.moveTo(0, -Ri * .16); g.bezierCurveTo(Ri * .36, -Ri * .4, Ri * .26, -Ri * .86, 0, -Ri); g.bezierCurveTo(-Ri * .26, -Ri * .86, -Ri * .36, -Ri * .4, 0, -Ri * .16); g.globalAlpha = a * .16; g.fillStyle = c[1]; g.fill(); g.globalAlpha = a; g.stroke(); g.restore(); } }
    else { const loops = (() => { let p = n, q = step; while (q){ [p, q] = [q, p % q]; } return p; })();
      for (let s0 = 0; s0 < loops; s0++){ g.beginPath(); for (let i = 0, v = s0; i <= n / loops; i++, v = (v + step) % n){ const q = v / n * Math.PI * 2 - Math.PI / 2; g.lineTo(Math.cos(q) * Ri, Math.sin(q) * Ri); } g.closePath(); g.globalAlpha = a * .1; g.fillStyle = c[1]; g.fill(); g.globalAlpha = a; g.stroke(); }
      if (L.line === 'merchant' || L.line === 'ninja' || L.line === 'dogfolk'){ g.rotate(Math.PI / 4); g.strokeRect(-Ri * .36, -Ri * .36, Ri * .72, Ri * .72); g.rotate(-Ri && -Math.PI / 4); } }
    g.rotate(-(rot0 + k * life * dirS) * 2);                     // the inner ring of tokens turns the other way
    const m = Math.min(n, 8), ts = Math.max(3, R * .13); for (let i = 0; i < m; i++){ const q = i / m * Math.PI * 2; g.save(); g.translate(Math.cos(q) * R * .93, Math.sin(q) * R * .93); g.rotate(q + Math.PI / 2); g.scale(1, o.up ? 1 : 1.5); g.globalAlpha = a; (CFX_TOK[L.tok] || CFX_TOK.cross)(g, ts, c); g.restore(); }
    g.restore();
    if (o.center !== false && (R > 30 || o.up)){ g.globalAlpha = a * .5; g.save(); g.translate(X, Y); g.scale(1, up); g.rotate(Math.sin(k * 5) * .1); (CFX_TOK[L.tok] || CFX_TOK.cross)(g, R * .34, c); g.restore(); } }}); }

/* soft light spears standing round an edge (the biggest spells) */
function cfxSpears(x, y, r, c, n, life = 1.1, h = 90){ const N = cfxN(n); skfxAdd({life, add:true, draw(g, k){
  for (let i = 0; i < N; i++){ const q0 = i / N * .35, q = (k - q0) / (1 - .35); if (q <= 0 || q >= 1) continue; const a = i / N * Math.PI * 2 + 1, X = x + Math.cos(a) * r, Y = y + Math.sin(a) * r * .5, hh = h * (.7 + cfxH(i, 3) * .6) * cfxE(q * 3), al = (q < .15 ? q / .15 : 1 - (q - .15) / .85) * .5;
    const gr = g.createLinearGradient(0, Y - hh, 0, Y); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.7, c[1]); gr.addColorStop(1, '#ffffff'); g.globalAlpha = al; g.fillStyle = gr; g.beginPath(); g.moveTo(X, Y - hh); g.lineTo(X + 3, Y - hh * .2); g.lineTo(X, Y); g.lineTo(X - 3, Y - hh * .2); g.closePath(); g.fill(); } }}); }
/* rings rising round the hero */
function cfxWaves(c, n = 3, life = 1.2, o = {}){ skfxAdd({life, layer:o.layer || 'over', draw(g, k){ for (let i = 0; i < n; i++){ const q = k * 1.5 - i * .22; if (q <= 0 || q >= 1) continue;
  g.globalAlpha = Math.sin(q * Math.PI) * .7; g.strokeStyle = i % 2 ? c[0] : c[1]; g.lineWidth = 1.8; g.beginPath(); g.ellipse(P.x, P.y - q * (o.h || 50), 22 - q * 8, 11 - q * 4, 0, o.back ? Math.PI : 0, o.back ? Math.PI * 2 : Math.PI); g.stroke(); } }}); }

/* ---------- the hit marks ---------- */
function cfxCrescent(x, y, z, ang, r, c, life = .58, sweep = 2.3, thick = .34, delay = 0, flat = .62){ skfxAdd({life, t:-delay, add:true, draw(g, k){ const lead = ang - sweep / 2 + sweep * cfxE(k * 3.2), tail = ang - sweep / 2 + sweep * .9 * cfxE((k - .5) * 2), N = 14;   // the whole crescent hangs in the air for a moment before its tail follows
  if (Math.abs(lead - tail) < .05) return; g.save(); g.translate(x, y - z); g.scale(1, flat);
  for (const [w, col, al] of [[1, c[1], .8], [.45, '#ffffff', .95]]){ g.globalAlpha = al * (1 - k * k * k); g.fillStyle = col; g.beginPath();
    for (let i = 0; i <= N; i++){ const a = tail + (lead - tail) * i / N; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    for (let i = N; i >= 0; i--){ const a = tail + (lead - tail) * i / N, rr = r - Math.sin(Math.PI * Math.pow(i / N, 1.6)) * thick * r * w; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fill(); }
  g.restore(); }}); }
function cfxStreak(g, x0, y0, x1, y1, w, col, a){ const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d * w, ny = dx / d * w, mx = x0 + dx * .55, my = y0 + dy * .55;
  g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.moveTo(x0, y0); g.lineTo(mx + nx, my + ny); g.lineTo(x1, y1); g.lineTo(mx - nx, my - ny); g.closePath(); g.fill(); }
function cfxCuts(x, y, z, r, c, angs, life = .46, gap = .07, delay = 0){ skfxAdd({life:life + gap * (angs.length - 1), t:-delay, add:true, draw(g, k){ const t = k * this.life;
  angs.forEach((an, i) => { const q = (t - i * gap) / life; if (q <= 0 || q >= 1) return; const e = cfxE(q * 3.4), ux = Math.cos(an), uy = Math.sin(an) * .7, a = 1 - q * q * q;
    const x0 = x - ux * r, y0 = y - z - uy * r, x1 = x - ux * r + ux * 2 * r * e, y1 = y - z - uy * r + uy * 2 * r * e;
    cfxStreak(g, x0, y0, x1, y1, r * .16, c[1], a * .8); cfxStreak(g, x0, y0, x1, y1, r * .06, '#ffffff', a); }); }}); }
function cfxClaws(x, y, z, dir, r, c){ const an = dir + Math.PI * .28; skfxAdd({life:.52, add:true, draw(g, k){ const e = cfxE(k * 3.2), a = 1 - k * k * k, ux = Math.cos(an), uy = Math.sin(an) * .7, nx = -Math.sin(an), ny = Math.cos(an) * .7;
  for (let i = -1; i <= 1; i++){ const ox = nx * i * r * .34, oy = ny * i * r * .34, l = r * (i ? .85 : 1), x0 = x + ox - ux * l, y0 = y - z + oy - uy * l;
    cfxStreak(g, x0, y0, x0 + ux * 2 * l * e, y0 + uy * 2 * l * e, r * .13, c[1], a * .85); cfxStreak(g, x0, y0, x0 + ux * 2 * l * e, y0 + uy * 2 * l * e, r * .05, '#ffffff', a); } }}); }
function cfxJaws(x, y, z, r, c){ skfxAdd({life:.6, draw(g, k){ const close = cfxE(k * 3.6), a = k > .55 ? (1 - k) / .45 : 1, open = 1 - close, cy = y - z;
  g.lineJoin = 'round'; g.lineWidth = 1.1;
  for (const up of [1, -1]){ const jy = cy - up * (r * .2 + r * 1.1 * open);            // each jaw: a gum arc with fangs hanging from it, the corner fangs longest
    g.globalAlpha = a * .85; g.strokeStyle = c[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(x - r * 1.05, jy + up * r * .32); g.quadraticCurveTo(x, jy - up * r * .5, x + r * 1.05, jy + up * r * .32); g.stroke();
    g.lineWidth = 1.1; g.strokeStyle = c[2];
    for (let i = 0; i < 6; i++){ const u = (i + .5) / 6 * 2 - 1, fx = x + u * r * .92, by = jy + up * (u * u * r * .62 - r * .2), h = r * (Math.abs(u) > .55 ? .78 : .5), w = r * .15;
      g.globalAlpha = a; g.fillStyle = '#fdfaf0'; g.beginPath(); g.moveTo(fx - w, by); g.quadraticCurveTo(fx - w * .5, by + up * h * .65, fx + u * w * .4, by + up * h); g.quadraticCurveTo(fx + w * .5, by + up * h * .65, fx + w, by); g.closePath(); g.fill(); g.stroke(); } }
  if (close >= .98){ g.globalCompositeOperation = 'lighter'; const f = Math.max(0, 1 - (k - .28) * 4); g.globalAlpha = f * .9; g.fillStyle = c[0]; g.beginPath(); g.ellipse(x, cy, r * 1.3 * (1.2 - f * .2), r * .16 * f + .5, 0, 0, 7); g.fill(); } }}); }
function cfxStarHit(x, y, z, r, c){ const rot = Math.random() * 6; skfxAdd({life:.46, add:true, draw(g, k){ const e = cfxE(k * 4), a = 1 - k * k * k; g.save(); g.translate(x, y - z); g.rotate(rot + k * .5);
  for (const [m, col, al] of [[1, c[1], .85], [.55, '#ffffff', 1]]){ g.globalAlpha = a * al; g.fillStyle = col; g.beginPath(); for (let i = 0; i < 16; i++){ const q = i / 16 * Math.PI * 2, rr = r * e * m * (i % 2 ? .3 : i % 4 ? .7 : 1.15); g.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); } g.closePath(); g.fill(); }
  g.restore(); g.globalAlpha = a * .8; g.strokeStyle = c[0]; g.lineWidth = 2.2 * (1 - k); for (const s of [-1, 1]){ g.beginPath(); g.ellipse(x, y - z, r * (1 + e * .9), r * (.5 + e * .45), 0, s > 0 ? -.6 : Math.PI - .6, s > 0 ? .6 : Math.PI + .6); g.stroke(); } }}); }
/* tokens thrown out from a point, falling back in an arc */
function cfxBurst(x, y, z, L, n, sc, o = {}){ const items = []; for (let i = 0; i < cfxN(n); i++){ const a = (o.dir != null ? o.dir + (Math.random() - .5) * 1.8 : Math.random() * 6.28), d = (18 + Math.random() * 30) * sc * (o.far || 1), up = (14 + Math.random() * 26) * sc * (o.up ?? 1);
    items.push({s:(4 + Math.random() * 2.6) * sc, dur:.6 + Math.random() * .4, t0:Math.random() * .06, rot:Math.random() * 6, spin:(Math.random() - .5) * 14,
      fn:q => { const e = 1 - (1 - q) * (1 - q); return [x + Math.cos(a) * d * e, y + Math.sin(a) * d * .5 * e, Math.max(0, z + up * 4 * q * (1 - q) - z * q * q)]; }}); }
  cfxToks(items, L.tok, L.col, {trail:o.trail}); }
function cfxImpact(m, L, sc, dir, tier){ const h = (typeof MOB_H !== 'undefined' ? MOB_H[m.type] : 30) || 30, x = m.x, y = m.y, z = h * .55, c = L.col, r = 27 * sc;
  switch (L.line){
    case 'blade': cfxCrescent(x - Math.cos(dir) * r * 1.05, y - Math.sin(dir) * r * .6, z, dir, r * 1.5, c); if (tier >= 3) cfxCuts(x, y, z, r * 1.2, c, [dir + .9, dir - .9], .26, .08); cfxBurst(x, y, z, L, tier >= 3 ? 3 : 1, sc * .9, {dir}); break;
    case 'muay': cfxStarHit(x, y, z, r * 1.05, c); if (tier >= 3) cfxBurst(x, y, z, L, 3, sc * .8, {dir}); break;
    case 'rogue': cfxCuts(x, y, z, r * 1.25, c, [.75, Math.PI - .75], .26, .09); cfxBurst(x, y, z, L, 2 + (tier >= 3), sc * .85, {up:1.3}); break;
    case 'merchant': cfxStarHit(x, y, z, r * .7, SKFX_EL.neutral); cfxBurst(x, y, z, L, 5 + tier * 2, sc * .9, {up:1.6, far:1.2}); break;
    case 'catfolk': cfxClaws(x, y, z, dir, r * 1.15, c); cfxBurst(x, y, z, L, 1 + (tier >= 3), sc, {up:1.5, far:.6}); break;
    case 'dogfolk': cfxJaws(x, y, z, r * .95, c); if (tier >= 3) cfxBurst(x, y, z, L, 2, sc * .8, {dir}); break;
    case 'ninja': cfxCuts(x, y, z, r * 1.3, c, [dir + 1.2, dir - .5, dir + .35], .2, .05); cfxBurst(x, y, z, L, 2 + (tier >= 3), sc * .85, {dir, far:1.3}); break;
    case 'ranger': cfxStarHit(x, y, z, r * .6, c); cfxBurst(x, y, z, L, 3 + tier, sc * .95, {up:1.5}); break;
    default: cfxStarHit(x, y, z, r * .65, c); cfxBurst(x, y, z, L, 3 + tier, sc * .9, {up:1.2}); }
}

/* ---------- per kind of skill, at the cast ---------- */
function cfxOrbit(L, sc, n, life, dirS = 1, o = {}){ const items = []; n = cfxN(n);
  for (let i = 0; i < n; i++){ const ph = i / n * Math.PI * 2; items.push({s:(4.6 + (i % 2)) * sc, dur:life * .82, t0:i / n * life * .18,
    fn:q => { const a = ph + q * Math.PI * 2 * 1.6 * dirS, rr = (o.r || 24) * (1 + .15 * Math.sin(q * Math.PI)) * (q > .8 ? 1 - (q - .8) * 2.2 : 1); return [P.x + Math.cos(a) * rr, P.y + Math.sin(a) * rr * .45, (o.z0 ?? 4) + q * (o.rise ?? 52), Math.sin(a)]; }}); }
  cfxToks(items, L.tok, L.col, {trail:.07, split:true}); }
function cfxRise(x, y, L, sc, n, o = {}){ const items = []; for (let i = 0; i < cfxN(n); i++){ const dx = (Math.random() - .5) * (o.w || 44), dy = (Math.random() - .5) * (o.w || 44) * .4, sway = Math.random() * 6, hgt = (o.h || 60) * (.7 + Math.random() * .6);
    items.push({s:(3.4 + Math.random() * 2) * sc, dur:.9 + Math.random() * .6, t0:Math.random() * (o.spread ?? .5), rot:(Math.random() - .5) * .8, spin:(Math.random() - .5) * 3, fn:q => [(o.follow ? P.x : x) + dx + Math.sin(q * 5 + sway) * 5, (o.follow ? P.y : y) + dy, 4 + q * hgt]}); }
  cfxToks(items, o.tok || L.tok, L.col); }
function cfxRain(x, y, r, L, sc, n, o = {}){ const items = []; for (let i = 0; i < cfxN(n); i++){ const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * r * .92, tx = x + Math.cos(a) * d, ty = y + Math.sin(a) * d * .5, lean = (o.lean ?? 26) + Math.random() * 10;
    items.push({s:(5 + Math.random() * 2.5) * sc, dur:.3 + Math.random() * .1, t0:Math.random() * (o.over || .55), rot:Math.PI, fn:q => { const e = q * q; return [tx - lean * (1 - e), ty, 150 * (1 - e)]; }}); }
  cfxToks(items, L.tok, L.col, {trail:.16, land:true, face:L.tok !== 'coin' && L.tok !== 'shuriken' && L.tok !== 'paw' && L.tok !== 'star8'}); }
function cfxFan(x, y, r, L, sc, n){ const items = []; n = cfxN(n); const a0 = Math.random() * 6;
  for (let i = 0; i < n; i++){ const a = a0 + i / n * Math.PI * 2; items.push({s:(4.6 + (i % 2) * 1.6) * sc, dur:.5, t0:(i % 3) * .03, spin:10, rot:a,
    fn:q => { const e = cfxE(q * 1.4); return [x + Math.cos(a) * (10 + r * e), y + Math.sin(a) * (5 + r * .5 * e), 10 + Math.sin(q * Math.PI) * 14]; }}); }
  cfxToks(items, L.tok, L.col, {trail:.12, face:L.tok === 'sword' || L.tok === 'feather' || L.tok === 'fang' || L.tok === 'flame' || L.tok === 'shard' || L.tok === 'bolt'}); }
function cfxEscort(x0, y0, x1, y1, L, sc, n, o = {}){ const d = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / d, uy = (y1 - y0) / d, items = []; n = cfxN(n);
  for (let i = 0; i < n; i++){ const side = (i % 2 ? 1 : -1) * (8 + Math.floor(i / 2) * 7), back = Math.floor(i / 2) * 12; items.push({s:(4.6 + (i < 2 ? 1.6 : 0)) * sc, dur:Math.min(.6, .22 + d / 700), t0:Math.floor(i / 2) * .04 + (o.delay || 0), spin:L.tok === 'shuriken' || L.tok === 'coin' || L.tok === 'star8' ? 18 : 0,
    fn:q => { const e = q * (2 - q), l = Math.max(0, d * e - back * (1 - q)); return [x0 + ux * l - uy * side, y0 + uy * l + ux * side * .5, 20 + Math.sin(q * Math.PI) * 6]; }}); }
  cfxToks(items, L.tok, L.col, {trail:.14, face:!(L.tok === 'shuriken' || L.tok === 'coin' || L.tok === 'star8' || L.tok === 'paw')}); }
function cfxConverge(x, y, z, L, sc, n, o = {}){ const items = []; n = cfxN(n); const a0 = Math.random() * 6;
  for (let i = 0; i < n; i++){ const a = a0 + i / n * Math.PI * 2, R0 = (o.r || 46); items.push({s:(4.4 + (i % 2)) * sc, dur:o.dur || .55, t0:i * .02, rot:a - Math.PI / 2,
    fn:q => { const e = q * q, aa = a + (o.twist ?? 1.4) * e, rr = R0 * (1 - e) + 3; return [x + Math.cos(aa) * rr, y + Math.sin(aa) * rr * .5, z + (o.lift || 0) * e]; }}); }
  cfxToks(items, L.tok, L.col, {trail:.1}); }
/* a crown of tokens above the hero that closes and bursts (the biggest buffs) */
function cfxCrown(L, sc){ const n = cfxN(7), items = []; for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2; items.push({s:5.4 * sc, dur:1, t0:.5, rot:0,
    fn:q => { const rr = 26 * (1 - cfxE(q * 1.3) * .55), aa = a + q * 2.4; return [P.x + Math.cos(aa) * rr, P.y + Math.sin(aa) * rr * .4, 62 + Math.sin(q * Math.PI) * 6, Math.sin(aa)]; }}); }
  cfxToks(items, L.tok, L.col, {split:true}); later(1.45, () => { skfxGlow(P.x, P.y - 64, 20, L.col[1], .35, .6); cfxBurst(P.x, P.y, 62, L, 6, sc * .8, {up:.6}); }); }

/* ---------- (the owner: «it must fit the pose») each action pose gets its own piece, placed on the body part that
   moves and timed inside the pose: a blade arc where the weapon swings, a star on the fist, an arc at the leg for a
   kick, light gathering over raised hands, a sigil before a hand sign, sound from a shout, a shield before a guard ---------- */
function cfxSound(x, y, z, ang, c, n, life = .7, reach = 54){ skfxAdd({life, draw(g, k){ g.lineCap = 'round';
  for (let i = 0; i < n; i++){ const q = k * 1.4 - i * .16; if (q <= 0 || q >= 1) continue; const rr = 10 + reach * cfxE(q); g.globalAlpha = (1 - q) * .85; g.strokeStyle = i % 2 ? c[0] : c[1]; g.lineWidth = 3 * (1 - q) + .8;
    g.save(); g.translate(x, y - z); g.scale(1, .7); g.beginPath(); g.arc(0, 0, rr, ang - .62, ang + .62); g.stroke(); g.restore(); } }}); }
function cfxShield(ang, c, life = 1){ skfxAdd({life, draw(g, k){ const a = (k < .15 ? k / .15 : k > .65 ? (1 - k) / .35 : 1), cx = P.x + Math.cos(ang) * 4, cy = P.y - 24 + Math.sin(ang) * 2, r = 26 + Math.sin(k * 9) * .8, N = 12, sw = 1.9;
  g.save(); g.translate(cx, cy); g.scale(1, .8);
  g.globalAlpha = a * .3; g.fillStyle = c[1]; g.beginPath(); for (let i = 0; i <= N; i++){ const q = ang - sw / 2 + sw * i / N; g.lineTo(Math.cos(q) * r, Math.sin(q) * r); } for (let i = N; i >= 0; i--){ const q = ang - sw / 2 + sw * i / N; g.lineTo(Math.cos(q) * (r - 7), Math.sin(q) * (r - 7)); } g.closePath(); g.fill();
  g.globalAlpha = a * .95; g.strokeStyle = c[0]; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, r, ang - sw / 2, ang + sw / 2); g.stroke(); g.strokeStyle = c[1]; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r - 7, ang - sw / 2, ang + sw / 2); g.stroke();
  for (let i = 1; i < 6; i++){ const q = ang - sw / 2 + sw * i / 6; g.beginPath(); g.moveTo(Math.cos(q) * (r - 7), Math.sin(q) * (r - 7)); g.lineTo(Math.cos(q) * r, Math.sin(q) * r); g.stroke(); }
  g.restore(); }}); }
const CFX_WEAPON_LINES = {blade:1, muay:1, rogue:1, merchant:1, catfolk:1, dogfolk:1, ninja:1, ranger:0};
function cfxPose(sk, L, sc, tier, ang, dur){
  const act = sk.act || '', c = L.col, ux = Math.cos(ang), uy = Math.sin(ang), hx = P.x + ux * 16, hy = P.y + uy * 8, side = ux >= 0 ? 1 : -1, px = P.x, py = P.y;
  const at = (q, f) => later(Math.max(0, dur * q), () => { try { f(); } catch (e) {} });
  switch (act){
    case 'crossslash': cfxCuts(hx + ux * 8, hy + uy * 4, 22, 24 * sc, c, [ang + .8, ang - .8], .42, .1, dur * .25); break;
    case 'stab': case 'snatch': case 'teep': cfxCuts(hx + ux * 14, hy + uy * 7, act === 'teep' ? 16 : 22, 22 * sc, c, [ang], .36, 0, dur * .3); if (act === 'teep') at(.3, () => cfxStarHit(hx + ux * 26, hy + uy * 13, 16, 12 * sc, c)); break;
    case 'slam': case 'heave': cfxCrescent(px + ux * 6, py, 26, -Math.PI / 2 + side * 1.0, 30 * sc, c, .5, side * 2.6, .36, dur * .3, 1);       // over the head and down in front
      at(.55, () => { skfxRing(hx + ux * 14, hy + uy * 7, 30 * sc, c[0], .4, 4); skfxDust(hx + ux * 14, hy + uy * 7, 6); }); break;
    case 'whirl': case 'spin': case 'twinspin': for (let i = 0; i < 4; i++) cfxCrescent(px, py, 20 + (i % 2) * 6, ang + i * 1.7, 32 * sc, c, .4, 2.8, .3, i * dur / 5); break;
    case 'flurry': for (let i = 0; i < 4; i++) at(.12 + i * .18, () => cfxStarHit(hx + ux * 8 + (Math.random() - .5) * 12, hy + uy * 4, 16 + Math.random() * 18, 9 * sc, c)); break;
    case 'rake': at(.25, () => cfxClaws(hx + ux * 8, hy + uy * 4, 22, ang, 20 * sc, c)); break;
    case 'punch': at(.3, () => cfxStarHit(hx + ux * 8, hy + uy * 4, 26, 11 * sc, c)); break;
    case 'uppercut': cfxCuts(hx + ux * 4, hy + uy * 2, 30, 20 * sc, c, [-Math.PI / 2 + side * .25], .4, 0, dur * .3); at(.42, () => cfxStarHit(hx + ux * 6, hy + uy * 3, 44, 10 * sc, c)); break;
    case 'knee': at(.3, () => cfxStarHit(hx + ux * 4, hy + uy * 2, 16, 11 * sc, c)); break;
    case 'kick': case 'spinkick': cfxCrescent(px, py, 13, ang, 32 * sc, c, .46, act === 'spinkick' ? 4.6 : 3, .28, dur * .25); break;
    case 'invoke': cfxConverge(px, py, 54, L, sc * .8, 5 + tier, {r:30, dur:Math.max(.3, dur * .7), twist:2}); at(.7, () => { skfxGlow(P.x, P.y - 54, 13 + tier * 2, c[1], .3, .7); cfxBurst(P.x, P.y, 54, L, 2 + tier, sc * .7, {up:.5, far:.6}); }); break;
    case 'point': cfxEmblem(hx, hy, 9 + tier, L, Math.max(.5, dur), {up:true, z:30, follow:true, center:false, a:.85}); at(.25, () => cfxEscort(hx, hy, hx + ux * 60, hy + uy * 30, L, sc * .75, 2 + (tier >= 3) * 2)); break;
    case 'wai': case 'ramwai': cfxEmblem(px, py, 15 + tier, L, dur + .7, {up:true, z:50, follow:true, center:false, a:.8, spin:1.2}); break;   // a halo behind the bowed head
    case 'seal': cfxEmblem(hx, hy, 11 + tier, L, dur + .4, {up:true, z:28, follow:true, a:.9, spin:2}); break;
    case 'shout': cfxSound(px + ux * 4, py + uy * 2, 36, ang, c, 4, .8, 46 + tier * 8); break;
    case 'whistle': cfxSound(px + ux * 4, py + uy * 2, 36, ang, c, 2, .6, 30); break;
    case 'crouch': skfxRing(px, py, 30, c[1], .5, 3); cfxConverge(px, py, 4, L, sc * .8, 5, {r:38, dur:.45}); break;
    case 'guard': cfxShield(ang, c, Math.max(.9, dur + .4)); break;
    case 'aimup': { const items = []; for (let i = 0; i < cfxN(3 + tier); i++){ const dx = (i - 2) * 5; items.push({s:5 * sc, dur:.4, t0:dur * .3 + i * .05, fn:q => [px + ux * 8 + dx * q, py + uy * 4, 34 + 150 * q * q]}); } cfxToks(items, L.tok, c, {trail:.2}); break; }
    case 'tend': case 'drink': cfxRise(hx, hy, L, sc * .7, 4, {w:14, h:36, spread:.3, tok:'leaf'}); break;
    case 'settrap': case 'plant': at(.4, () => { skfxRing(hx + ux * 6, hy + uy * 3, 22, c[1], .45, 3); cfxEmblem(hx + ux * 6, hy + uy * 3, 16, L, .8, {center:false}); }); break;
    case 'lunge': case 'pounce': case 'dive': case 'hongcall': case 'throw': break;
    default: if (CFX_WEAPON_LINES[L.line] && ['melee', 'line', 'aoeSelf', 'dash', 'debuff'].includes(sk.type)){                                   // a plain weapon swing
      if (L.line === 'muay') at(.3, () => cfxStarHit(hx + ux * 8, hy + uy * 4, 26, 11 * sc, c)); else if (L.line === 'catfolk') at(.25, () => cfxClaws(hx + ux * 8, hy + uy * 4, 22, ang, 18 * sc, c));
      else cfxCrescent(px, py, 22, ang, 28 * sc, c, .46, 2.4, .32, dur * .22); }
  }
}

function cfxCast(id, lv, t, from){
  if (typeof SETTINGS !== 'undefined' && SETTINGS.classFx === false) return;   // (v302) Settings: class skill effects off
  const sk = SKILLS[id]; if (!sk || sk.type === 'passive') return;
  const cat = SKFX_CAT[sk.type] === 'beam' ? 'line' : SKFX_CAT[sk.type] || 'strike', tier = skfxTier(sk), L = cfxLook(sk), c = L.col, sc = .85 + tier * .1, big = tier >= 4 && (sk.cd || 0) >= 5;
  const tgt = t && typeof t.x === 'number' && !t.dead ? t : null, tx = tgt ? tgt.x : P.x, ty = tgt ? tgt.y : P.y, px = P.x, py = P.y;
  { const dv = typeof dirVec === 'function' ? dirVec(P.dir || 0) : [1, 0], ang = tgt && (tgt.x !== px || tgt.y !== py) ? Math.atan2(ty - py, tx - px) : Math.atan2(dv[1], dv[0]);
    try { cfxPose(sk, L, sc, tier, ang, Math.min(1.2, Math.max(.3, P.skillAnim || P.atkAnim || .5))); } catch (e) { console.warn('classfx pose', e); } }
  switch (cat){
    case 'buff': { const life = big ? 2 : 1.6; cfxEmblem(px, py, 34 + tier * 4, L, life + .3, {follow:true}); cfxOrbit(L, sc, 5 + tier, life); cfxWaves(c, 3, 1.2); cfxWaves(c, 3, 1.2, {back:true, layer:'under'});
      if (tier >= 3) cfxRise(px, py, L, sc * .8, 5 + tier, {follow:true, h:70});
      if (big){ cfxOrbit(L, sc * .85, 6, life, -1, {r:36, rise:30, z0:8}); cfxCrown(L, sc); cfxSpears(px, py, 44, c, 8, 1.3, 70); } break; }
    case 'heal': cfxEmblem(px, py, 30 + tier * 4, L, 1.5, {follow:true}); cfxRise(px, py, L, sc, 7 + tier * 2, {follow:true, h:64, tok:L.line === 'healer' || L.line === 'novice' ? 'petal' : L.tok}); cfxWaves(SKFX_EL.heal, 3, 1.1); cfxWaves(SKFX_EL.heal, 3, 1.1, {back:true, layer:'under'});
      if (tier >= 3) cfxOrbit(L, sc * .85, 5, 1.4, 1, {rise:44}); break;
    case 'summon': cfxEmblem(px, py, 40 + tier * 4, L, 1.5); cfxConverge(px, py, 6, L, sc, 8 + tier, {r:58, lift:10, dur:.6});
      later(.6, () => { cfxRise(px, py, L, sc, 6 + tier, {w:22, h:110, spread:.15}); if (tier >= 3) cfxSpears(px, py, 40, c, 7, 1, 80); }); break;
    case 'sky': { const r = sk.radius || 80, lead = sk.fx === 'meteor' ? .55 : .3; cfxEmblem(tx, ty, r * 1.12, L, lead + 1.25 + (big ? .4 : 0), {a:.8});
      later(lead * .6, () => cfxRain(tx, ty, r, L, sc, 7 + tier * 3, {over:big ? .8 : .5}));
      if (tier >= 3) later(lead, () => cfxSpears(tx, ty, r * 1.05, c, big ? 14 : 9, 1.1, big ? 120 : 90));
      if (big) later(lead + .25, () => { cfxFan(tx, ty, r * 1.1, L, sc, 10); cfxRain(tx, ty, r, L, sc * 1.1, 8, {over:.5}); }); break; }
    case 'slam': { const r = sk.radius || 80; cfxEmblem(px, py, r * 1.05, L, 1.2 + (big ? .4 : 0), {a:.8}); cfxFan(px, py, r, L, sc, 7 + tier * 2);
      if (big) { cfxSpears(px, py, r, c, 12, 1.2, 100); later(.22, () => cfxFan(px, py, r * 1.25, L, sc * 1.1, 10)); } break; }
    case 'line': { const d = Math.hypot(tx - px, ty - py) || 1, len = sk.len || 200, ex = px + (tx - px) / d * len, ey = py + (ty - py) / d * len; cfxEmblem(px, py, 26 + tier * 3, L, .9, {center:false});
      cfxEscort(px, py, ex, ey, L, sc, 4 + tier * 2); later(Math.min(.5, .2 + len / 700), () => { cfxCrescent(ex, ey, 18, Math.atan2(ey - py, ex - px), 26 * sc, c); cfxBurst(ex, ey, 16, L, 3 + tier, sc); if (big) cfxSpears(ex, ey, 36, c, 7, 1, 90); }); break; }
    case 'dash': { const d = Math.hypot(px - from.x, py - from.y); if (d > 6){ cfxEscort(from.x, from.y, px, py, L, sc, 4 + tier); cfxCrescent(px, py, 20, Math.atan2(py - from.y, px - from.x), 26 * sc, c, .36, 2.6, .36, .05); }
      if (tier >= 3) cfxEmblem(px, py, 30, L, .8, {center:false}); break; }
    case 'blink': cfxConverge(from.x, from.y, 20, L, sc * .9, 6, {r:30, dur:.35, twist:2.4}); cfxEmblem(px, py, 28, L, .9, {center:false}); cfxBurst(px, py, 22, L, 5 + tier, sc, {up:.8}); break;
    case 'trick': { const z = tgt ? ((typeof MOB_H !== 'undefined' && MOB_H[tgt.type]) || 30) * .55 : 16; cfxEmblem(tx, ty, 28 + tier * 3, L, 1.1, {center:false}); cfxConverge(tx, ty, z, L, sc, 6 + tier, {r:44});
      if (tier >= 3) later(.5, () => cfxBurst(tx, ty, z, L, 4, sc * .8)); break; }
    case 'shot': { const d = Math.hypot(tx - px, ty - py) || 1, ux = (tx - px) / d, uy = (ty - py) / d; cfxEmblem(px, py, 22 + tier * 3, L, .7, {center:false, a:.75});
      if (tier >= 3) cfxEscort(px + ux * 14, py + uy * 7, px + ux * Math.min(d, 90), py + uy * Math.min(d, 90), L, sc * .8, big ? 6 : 4); break; }
    default: cfxEmblem(px, py, 22 + tier * 3, L, .7, {center:false, a:.7}); if (tgt) cfxEscort(px, py, tx, ty, L, sc * .8, tier >= 3 ? 4 : 2);
  }
}

/* ---------- wiring ---------- */
{ const _ex = execSkill;
  execSkill = function(id, lv, t){ const from = {x:P.x, y:P.y}; CFX.cur = {id, t:T, n:0}; const r = _ex.apply(this, arguments); try { cfxCast(id, lv, t, from); } catch (e) { console.warn('classfx', e); } return r; }; }
HK.dmgAfter.push((m, res, sk) => { if (!m || !res || !(res.dmg > 0) || res.poison || res.dot || (typeof SETTINGS !== 'undefined' && SETTINGS.classFx === false)) return;
  try {
    const dir = Math.atan2(m.y - P.y, m.x - P.x), c = CFX.cur;
    if (sk && sk.id && c && c.id === sk.id && T - c.t < 4){ c.n++; const def = SKILLS[sk.id] || sk, tier = skfxTier(def), L = cfxLook(def);
      if (c.n === 1){ cfxImpact(m, L, .9 + tier * .12 + (res.crit ? .15 : 0), dir, tier); const cat = SKFX_CAT[def.type] || 'strike';
        if (cat === 'strike' || cat === 'shot'){ cfxEmblem(m.x, m.y, 26 + tier * 5, L, .95, {center:false, a:.8}); if (tier >= 3) cfxRise(m.x, m.y, L, .8 + tier * .08, 3 + tier, {w:30, h:54, spread:.2}); if (tier >= 4) cfxSpears(m.x, m.y, 34, L.col, 7, .9, 80); } }
      else if (c.n <= 8 && c.n % 2 === 0) cfxImpact(m, L, .7 + tier * .06, dir + (Math.random() - .5), 1);
      return; }
    if (sk) return;                                               // other skill damage (pets, fields): their own effects
    if (T - CFX.lastBasic < .16) return; CFX.lastBasic = T;       // a normal attack: the small mark
    const L = cfxLook(null); L.col = (typeof LFX_LINE_COL !== 'undefined' && LFX_LINE_COL[L.line]) || SKFX_EL.neutral; cfxImpact(m, L, res.crit ? .85 : .62, dir, 1);
  } catch (e) { console.warn('classfx', e); } });
