/* VAYRATHEN — js/sys/dmgstack.js — tidy stacked damage numbers (v62)
   The numbers used to land with a random jitter and pile up, in two different looks (plain and "springy") with
   oversized digits, so a busy fight looked messy. Now every number on a target joins one neat column:
   · the newest hit pops in (a quick 1.6× → 1× punch) right above the target's head, and the older numbers slide up
     one line to make room, so fast hits read top-to-bottom like a list and never cover each other
   · the column leans a touch left and right line by line, drifts up slowly and each number fades near the end
   · one clean look: thick dark outline, white-topped gradient in the hit's colour · normal hits 26 px, criticals 34 px
     in gold with a short red-orange star burst behind · damage you take is red · heals are green
   · at most 8 numbers per target at a time (the oldest goes first).
   Words (Miss, Immune, Gear!) keep their old look. */
'use strict';

const DSTK = {max:8, seq:0, grp:0};
const droNum = s => typeof s === 'string' && s.length < 14 && /^[^\d]{0,3}[\d,]+[!+]?$/.test(s.trim());

{ const _at = addText;
  addText = function(x, y, s, col, size){
    if (!droNum(s) || typeof texts === 'undefined') return _at.apply(this, arguments);
    const crit = /!$/.test(s), hurt = col === '#ff8a80', heal = /^\+/.test(String(s).trim());
    const near = texts.filter(t => t.stk && t.t < t.life && t.stk.hurt === hurt && Math.abs(t.stk.x0 - x) < 70 && Math.abs(t.stk.y0 - y) < 90);
    while (near.length >= DSTK.max){ const i = texts.indexOf(near.shift()); if (i >= 0) texts.splice(i, 1); }
    const a = near[near.length - 1];   // join the column already on this target, at its anchor
    const n0 = texts.length; _at.call(this, a ? a.stk.x0 : x, a ? a.stk.y0 : y, s, col, size); if (texts.length === n0) return;   // numbers switched off in Settings
    const t = texts[texts.length - 1];
    t.stk = {x0:a ? a.stk.x0 : x, y0:a ? a.stk.y0 : y, g:a ? a.stk.g : ++DSTK.grp, n:++DSTK.seq, crit, heal, hurt, oy:0};
    t.size = crit ? 40 : size && size <= 24 ? Math.max(15, Math.min(size, 20)) : 26;
    if (hurt) t.col = '#ff4d4d'; else if (heal) t.col = '#3fd46a';
    t.life = crit ? 1.3 : 1.05;
  };
}

function droStar(r1, r2, n){ ctx.beginPath(); for (let i = 0; i < n * 2; i++){ const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? r2 : r1; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }

{ const _dt = drawDmgText;
  drawDmgText = function(t){
    const o = t.stk; if (!o) return _dt(t);
    const tt = t.t, k = tt / t.life, z = clamp(PX / 2.2, 1.15, 2.6);
    // how far up this number sits: one line for every newer number in its column, eased so it slides
    let want = 0; for (const u of texts) if (u.stk && u.stk.g === o.g && u.stk.n > o.n && u.t < u.life) want += (u.size * .92 + 4) * z;
    o.oy += (want - o.oy) * .35;
    const pop = tt < .1 ? (o.crit ? 1.9 : 1.6) - tt / .1 * (o.crit ? .9 : .6) : 1;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.globalAlpha = k > .72 ? 1 - (k - .72) / .28 : 1;
    ctx.translate(sx(o.x0) + (o.n % 2 ? 7 : -7) * z, sy(o.y0) - o.oy - tt * 16 * z); ctx.scale(pop * z, pop * z);
    const fs = t.size, s = o.crit ? t.s.replace(/!$/, '') : t.s;
    ctx.font = FD(900, fs);
    if (o.crit){ if (!o.w) o.w = ctx.measureText(s).width;
      // (v83) a burst that flashes out from the hit…
      if (tt < .32){ const q = tt / .32; ctx.save(); ctx.translate(0, -fs * .35); ctx.globalAlpha *= 1 - q; ctx.rotate(q * .5);
        ctx.fillStyle = '#ff5a1f'; droStar(o.w * .5 + fs * (.9 + q * .7), fs * .5, 10); ctx.fill();
        ctx.fillStyle = '#ffd34d'; droStar(o.w * .4 + fs * (.6 + q * .4), fs * .34, 10); ctx.fill(); ctx.restore(); }
      // …and a crimson plate with a gold rim that stays behind the number, wide enough for every digit
      { const pw = o.w / 2 + fs * .55, ph = fs * .62; ctx.save(); ctx.translate(0, -fs * .36); ctx.transform(1, 0, -.16, 1, 0, 0);
        const plate = (sc) => { ctx.beginPath(); for (let i = 0; i < 28; i++){ const a = i / 28 * Math.PI * 2, r = (i % 2 ? .8 : 1 + (i * 37 % 5) * .03) * sc; ctx.lineTo(Math.cos(a) * pw * r, Math.sin(a) * ph * r); } ctx.closePath(); };
        plate(1.1); ctx.fillStyle = 'rgba(58,6,2,.92)'; ctx.fill();
        plate(1); const bg = ctx.createLinearGradient(0, -ph, 0, ph); bg.addColorStop(0, '#e2401c'); bg.addColorStop(.55, '#a3180a'); bg.addColorStop(1, '#5e0a04'); ctx.fillStyle = bg; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#ffcc4d'; ctx.stroke(); ctx.restore(); }
      // the CRITICAL tag on top of the plate
      ctx.save(); ctx.font = FD(900, Math.round(fs * .32)); ctx.lineWidth = 4; ctx.strokeStyle = '#3a0500'; ctx.strokeText('CRITICAL', 0, -fs * .98);
      ctx.fillStyle = '#ffe680'; ctx.fillText('CRITICAL', 0, -fs * .98); ctx.restore(); }
    if (t.ring){ ctx.lineWidth = 10; ctx.strokeStyle = t.ring; ctx.strokeText(s, 0, 0); }
    ctx.lineWidth = 6; ctx.strokeStyle = o.crit ? '#4a0d00' : o.hurt ? '#3a0000' : 'rgba(25,15,20,.92)'; ctx.strokeText(s, 0, 0);
    const g = ctx.createLinearGradient(0, -fs * .8, 0, 0);
    if (o.crit){ g.addColorStop(0, '#ffffff'); g.addColorStop(.35, '#ffe14d'); g.addColorStop(1, '#ff8a1a'); }
    else { g.addColorStop(0, '#ffffff'); g.addColorStop(.5, t.col); g.addColorStop(1, t.col); }
    ctx.fillStyle = g; ctx.fillText(s, 0, 0);
    ctx.restore();
  };
}
