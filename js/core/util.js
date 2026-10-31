/* VAYRATHEN — js/core/util.js */
'use strict';

let W = 2400, H = 1600;   // world size of the current map (field maps are larger, set in loadMap)
const MAP_WH = id => id === 0 ? [2400, 1600] : [3400, 2260];   // field maps: twice the area of the village map
const RATE = 1, JRATE = 1,   // server rates: (v192) back to x1 (EXP x2 · Job x2 until v191; the curves in data/world.js are tuned for x1)
      SPEED = 95, KEY = 'vayrathen-proto-v1';
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (a, b) => a + Math.random() * (b - a);
