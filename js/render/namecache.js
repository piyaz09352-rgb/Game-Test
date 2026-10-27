/* VAYRATHEN — js/render/namecache.js — hero name tags are painted once, not every frame (v59)
   The gilded name over each hero (yours, your party's, everyone online) was the costliest thing drawn per frame: a
   glowing plate, carved flourishes, a blurred halo, gradients and a twinkle — several canvas shadow blurs per name,
   60 times a second, for every player on screen. Now each tag is painted once into a small picture of its own and
   that picture is simply stamped above the hero. It looks the same, only the moving shimmer and twinkle are gone
   (the tag stays still, which also fits "nothing blinks"). A tag is repainted only when its text, guild, title,
   level badge or size changes; the 24 most recent tags are kept. */
'use strict';

const HNC = {map:new Map(), scratch:null};
{ const _hn = heroName;
  heroName = function(x, headY, s, kind = 'me', opt = {}){
    if (!SETTINGS.nameTags || typeof NCTX === 'undefined') return _hn.apply(this, arguments);
    const z = TAG_Z() * NAME_K, lv = opt.lv | 0, key = [s, kind, opt.guild || '', lv >= 120 ? 2 : lv >= 100 ? 1 : 0, opt.title || '', opt.tier | 0, z.toFixed(3), DPR].join('|');
    let e = HNC.map.get(key);
    if (!e){
      // paint into a roomy scratch canvas, then keep just the part the tag covers
      const SWd = 1000, SHt = Math.ceil(200 * z), sc = HNC.scratch || (HNC.scratch = document.createElement('canvas'));
      if (sc.width !== Math.ceil(SWd * DPR) || sc.height !== Math.ceil(SHt * DPR)){ sc.width = Math.ceil(SWd * DPR); sc.height = Math.ceil(SHt * DPR); }
      const g = sc.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, sc.width, sc.height); g.setTransform(DPR, 0, 0, DPR, 0, 0);
      const cx = SWd / 2, hy = SHt - 8 * z, t0 = T;
      T = (1.4 * Math.ceil(cx * .003 / 1.4 + 1) - cx * .003) / .35;   // a moment when the twinkle is out of sight
      NCTX = g; let top; try { top = _hn.call(this, cx, hy, s, kind, opt); } finally { NCTX = null; T = t0; }
      const fs = Math.round(15 * z); g.font = `800 ${fs}px "Mali", system-ui, sans-serif`;
      const w = Math.max(g.measureText(s).width, opt.title ? String(opt.title).length * fs * .62 : 0, opt.guild ? String(opt.guild).length * fs * .55 : 0);
      const half = Math.min(SWd / 2, w / 2 + 64 * z), y0 = Math.max(0, top - 30 * z), y1 = Math.min(SHt, hy + 6 * z);
      const c = document.createElement('canvas'), cw = Math.ceil(half * 2), ch = Math.ceil(y1 - y0); c.width = Math.ceil(cw * DPR); c.height = Math.ceil(ch * DPR);
      c.getContext('2d').drawImage(sc, (cx - half) * DPR, y0 * DPR, c.width, c.height, 0, 0, c.width, c.height);
      e = {c, cw, ch, ox:half, oy:hy - y0, dTop:top - hy}; HNC.map.set(key, e);
      if (HNC.map.size > 24){ const k0 = HNC.map.keys().next().value; const old = HNC.map.get(k0); if (old) old.c.width = old.c.height = 0; HNC.map.delete(k0); }
    } else { HNC.map.delete(key); HNC.map.set(key, e); }   // most recently used last
    MAINCTX.drawImage(e.c, x - e.ox, headY - e.oy, e.cw, e.ch);
    return headY + e.dTop;
  }; }
