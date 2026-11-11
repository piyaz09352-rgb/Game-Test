/* VAYRATHEN — js/world/links280.js — (v280–v281) the lands join up: crossroads in four directions
   The owner: every region should connect to the ones around it, with some maps opening in all four directions.
   Before, the world was a star: Aren in the middle and four long roads (east Lv 5–100, south 70–214, west 150–214,
   north 210–300), each a single chain, so the only crossroads was Aren itself.
   · ROADS (LINKS280): 21 new roads between maps that sit side by side on the world map picture (wmPic, what the
     player sees) and are close in level (within about 15). Inside each region the zig-zag rows are joined across.
     (v281) v280 chose them from the data's own coordinates, which are not where the picture draws the maps: some roads
     ran across the whole island. Now every road is short on the picture.
   · SEA ROUTES (SEA280): the regions meet in level on opposite coasts, so they are joined by ship: east <-> south
     (Lv 81–100), south <-> west (150–173 and 197–214), west <-> north (209–218). The world map draws them as dashed
     blue routes over the sea with a boat; in the world they are ordinary gates.
   Eleven maps are crossroads in all four directions (Aren and ten more). A gate always leads back to the map you came
   from (maps.js travel); the quest arrow and Auto find the shorter ways by themselves. Each pair is checked: both maps
   exist and the side is free; tests/connect272.test.js walks every gate of every map. */
'use strict';
const LINKS280 = [
  [7, 'n', 45, 's'],
  [57, 'e', 58, 'w'],
  [48, 's', 49, 'n'],
  [10, 'w', 38, 'e'],
  [26, 'n', 47, 's'],
  [19, 's', 29, 'n'],
  [11, 'n', 33, 's'],
  [49, 's', 50, 'n'],
  [8, 'w', 16, 'e'],
  [53, 'w', 54, 'e'],
  [45, 'n', 46, 's'],
  [51, 'e', 52, 'w'],
  [24, 'w', 25, 'e'],
  [16, 'w', 17, 'e'],
  [1, 's', 2, 'n'],
  [38, 'w', 39, 'e'],
  [13, 'w', 21, 'e'],
  [15, 's', 61, 'n'],
  [31, 's', 32, 'n'],
  [5, 'e', 6, 'w'],
  [59, 'e', 60, 'w']];
const SEA280 = [
  [62, 'n', 10, 'e'],
  [63, 'e', 7, 's'],
  [66, 'e', 50, 's'],
  [50, 'w', 5, 'w']];
for (const [a, da, b, db] of [...LINKS280, ...SEA280]){ const A = MAPS[a], B = MAPS[b]; if (!A || !B) continue; A.links = A.links || {}; B.links = B.links || {};
  if (A.links[da] != null || B.links[db] != null || Object.values(A.links).includes(b)) continue; A.links[da] = b; B.links[db] = a; }
const SEA_SET = new Set(SEA280.map(([a, , b]) => Math.min(a, b) + ',' + Math.max(a, b)));
/* (v283) the floating temple city (map 70, a town between the inner Himmapan and the sacred lake) stood on top of the
   Eternal Ice Cave's marker on the world map: it now sits halfway between the two maps it joins */
if (typeof WM_PIC !== 'undefined' && MAPS[70] && MAPS[70].links && Object.values(MAPS[70].links).includes(56) && Object.values(MAPS[70].links).includes(18)) WM_PIC[70] = [.81, .40];
/* (v283) the sandstone city (map 68, a town between the Khmer stone castle and the buried city) had its marker out in the
   sea on the far side of the island: it now stands on land between the two maps it joins */
if (typeof WM_PIC !== 'undefined' && MAPS[68] && MAPS[68].links && Object.values(MAPS[68].links).includes(10) && Object.values(MAPS[68].links).includes(38)) WM_PIC[68] = [.276, .148];
