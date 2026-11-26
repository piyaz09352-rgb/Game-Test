/* VAYRATHEN — js/sys/dgsolo348.js — (v348) a dungeon's monsters with a damage factor (dgDef dmgMul) hit that much softer
   Loaded last so it wraps every other layer of mobAttack: the factor scales the attack's power (mult), which the plain hit,
   the boss formula (bosshard.js bossPunch) and every skill layer all multiply through. Used for a party of one, whose
   guardian killed every class every few seconds (DUNGEON=1 node tools/balance-report.js → docs/BALANCE_DUNGEON.md).
   Any other call passes through untouched — the same arguments, so layers that look at how they were called (bossact.js:
   a plain swing is one argument) behave exactly as before. */
'use strict';
{ const _ma = mobAttack; mobAttack = function(m){ const k = m && m.def && m.def.dmgMul; if (!k || k === 1) return _ma.apply(this, arguments);
    const a = [...arguments]; a[1] = (a.length > 1 && a[1] != null ? a[1] : 1) * k; return _ma.apply(this, a); }; }
