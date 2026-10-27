/* VAYRATHEN — js/sys/stdfont.js — one standard font on the game canvas too (v33)
   Name tags, damage numbers and labels drawn on the canvas asked for Mali or Pridi; every font set on a canvas now uses
   Sarabun, the same plain, easy-to-read Thai font as the menus. */
'use strict';
{ const P2 = CanvasRenderingContext2D.prototype, d = Object.getOwnPropertyDescriptor(P2, 'font'), cache = new Map();
  if (d && d.set) Object.defineProperty(P2, 'font', {configurable:true, enumerable:d.enumerable, get:d.get,
    set(v){ let s = cache.get(v); if (s === undefined){ s = typeof v === 'string' ? v.replace(/"?(Mali|Pridi|Cinzel)"?/g, 'Sarabun') : v; if (cache.size < 800) cache.set(v, s); } d.set.call(this, s); } }); }
