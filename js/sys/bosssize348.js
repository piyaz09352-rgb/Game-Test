/* VAYRATHEN — js/sys/bosssize348.js — (v348) the largest bosses drawn smaller (the owner: «ปรับบอสที่ใหญ่แบบนี้ให้เล็กลงหน่อย»)
   Measured against the hero (each drawn alone at the game scale, its picture height): the Naga king stood 8 heroes
   tall, the elephant kings, Garuda and Vessavana about 4½ and filled half the screen, so the hero and the
   boss's warnings were lost behind them. Every boss over 2.4 heroes now keeps only 30% of the height above that
   (8.2 → 4.1, 4.7 → 3.1, 3.5 → 2.7, 3 → 2.6); smaller bosses are untouched, so the order of sizes is kept.
   The drawing (d.bsz), the name plate height and the body radius follow; strength and skills are unchanged. */
'use strict';
const BOSS_SHRINK = {nagaking:.51, hexspire_lord:.57, waterelephantking:.65, boss:.92, garudaking:.67, lordkotchasi:.67, mammothking:.68,
  vessavana:.68, blizzard_lord:.72, iceturtlelord:.72, dragondemonking:.72, wyvernqueen:.72, mangrove_lord:.73,
  elderdragon:.73, dvarapala:.73, magmariver_lord:.74, glowcap_lord:.74, aurora_lord:.74, phantomgeneral:.74,
  templecolossus:.75, scorpionking:.75, cactus_lord:.75, cinder_lord:.77, skygarden_lord:.78, asuraking:.78,
  wreck_lord:.81, sulphur_lord:.81, saming:.82, snowpine_lord:.83, basalt_lord:.83, tenfacedogre:.84, lotusturtle:.84,
  suncourt_lord:.86, oasis_lord:.86, asuramaze_lord:.86, aikhiam:.86, firenaga:.87, rainbowfall_lord:.88,
  orchard_lord:.88, firefly_lord:.88, redcliffgiant:.9, snowking:.9, ashwolfking:.9, milkyway_lord:.91, narakawarden:.93,
  andamancrab:.95, gempalace_lord:.96, fjord_lord:.96};
for (const k in BOSS_SHRINK){ const d = MOB[k], f = BOSS_SHRINK[k]; if (!d || !d.boss || d.__bs348) continue; d.__bs348 = 1;
  d.bsz = +((d.bsz || 1.6) * f).toFixed(3);
  if (MOB_H[k]) MOB_H[k] = Math.round(MOB_H[k] * f);
  if (d.r) d.r = Math.max(14, Math.round(d.r * (.5 + .5 * f))); }
