/* VAYRATHEN — js/sys/nohouse.js — (v159) no houses or pavilions in the levelling maps
   Players found the houses, stilt houses and red-pillared sala pavilions (one beside every camp, more scattered by
   some lands) just in the way out in the hunting grounds. They are now built only where the story needs them:
     · the town of Aren (map 0)
     · ตลาดน้ำร้าง, the abandoned floating market (map 4): its stilt houses are the market
     · เมืองลับแล, the hidden city (map 16): a city has houses
   Everywhere else no house, stilt house or sala is placed (temples, ruins and statues stay: they are not houses). */
'use strict';

const NOHOUSE = {types:new Set(['house', 'sala', 'stilt']), keep:new Set([0, 4, 16])};
{ const _ap = addProp;
  addProp = function(type, x, y, v){
    if (NOHOUSE.types.has(type) && typeof MAP_ID !== 'undefined' && !NOHOUSE.keep.has(MAP_ID)) return null;
    return _ap.apply(this, arguments); }; }
