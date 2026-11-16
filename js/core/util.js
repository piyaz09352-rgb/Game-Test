/* VAYRATHEN — js/core/util.js */
'use strict';

let W = 2400, H = 1600;   // world size of the current map (field maps are larger, set in loadMap)
/* (v305) the owner asked for wider maps: hunting maps are half as wide and tall again (5100 × 3390, 2.25× the room;
   first a quarter, then the owner said «another 50%»).
   Aren keeps its own size; the crossroad towns keep theirs too (their streets and squares are laid out for it). */
const MAP_WH = id => id === 0 ? [2400, 1600] : (typeof isTown === 'function' && isTown(id)) ? [3400, 2260] : [5100, 3390];
const RATE = 1, JRATE = 1,   // server rates: (v192) back to x1 (EXP x2 · Job x2 until v191; the curves in data/world.js are tuned for x1)
      SPEED = 95, KEY = 'vayrathen-proto-v1';
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (a, b) => a + Math.random() * (b - a);
