/* VAYRATHEN — js/world/links280.js — (v280) the lands join up: crossroads in four directions
   The owner: every region should connect to the ones around it, with some maps opening in all four directions.
   Before, the world was a star: Aren in the middle and four long roads (east Lv 5–100, south 70–214, west 150–214,
   north 210–300), each a single chain, so the only crossroads was Aren itself.
   Now 26 new roads join maps that lie side by side on the world map and are close in level (within about 15):
   · inside each road, the two rows of the zig-zag are joined across, so a land is a web, not a line;
   · the roads join each other where their levels meet: east <-> south (Lv 70–100), south <-> west (150–214),
     west <-> north (209–218);
   · seven maps are crossroads in all four directions (Aren and six more), most others have three ways.
   A gate always leads back to the map you came from (maps.js travel), the world map draws the new roads, the quest
   arrow and Auto find the shorter ways by themselves. Each pair is checked: both maps exist and the side is free.
   Sides where water or cliffs block the way to the other gates were left out (tests/connect272.test.js walks them all). */
'use strict';
const LINKS280 = [
  [7, 's', 45, 'n'],
  [18, 'w', 56, 'e'],
  [10, 'e', 38, 'w'],
  [57, 'e', 70, 'w'],
  [34, 's', 67, 'n'],
  [13, 'e', 68, 'w'],
  [26, 's', 69, 'n'],
  [20, 'w', 60, 'e'],
  [24, 'e', 44, 'w'],
  [5, 'e', 52, 'w'],
  [8, 'e', 51, 'w'],
  [14, 'w', 59, 'e'],
  [17, 'e', 53, 'w'],
  [16, 'e', 55, 'w'],
  [30, 'w', 58, 'e'],
  [1, 's', 32, 'n'],
  [3, 's', 31, 'n'],
  [19, 's', 50, 'n'],
  [28, 's', 49, 'n'],
  [29, 's', 48, 'n'],
  [62, 'e', 38, 'e'],
  [63, 'w', 7, 'n'],
  [66, 'w', 50, 's'],
  [50, 'w', 5, 'w'],
  [36, 'n', 9, 'e'],
  [65, 'w', 29, 'n']];
for (const [a, da, b, db] of LINKS280){ const A = MAPS[a], B = MAPS[b]; if (!A || !B) continue; A.links = A.links || {}; B.links = B.links || {};
  if (A.links[da] != null || B.links[db] != null || Object.values(A.links).includes(b)) continue; A.links[da] = b; B.links[db] = a; }
