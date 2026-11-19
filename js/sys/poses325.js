/* VAYRATHEN — js/sys/poses325.js — (v325) each skill plays the pose that fits it
   The owner asked whether the skills look right. Counted per class line: the mage's 22 skills played 2 poses, the
   ninja's 20 played 3, the summoner's 22 played 4. New poses (js/gfx/sprites.js: push, skyraise, sweep, kneelshot,
   sealfire, sealsky, fanthrow) and the line's own skills are matched to them by what they do:
     mage      bolts push · lances point · meteors, storms, lightning skyraise · seas and waves sweep · earth plant
     hexer     dark bolts push · spreading curses sweep · falling dooms skyraise · gates plant
     summoner  each beast is called its own way (a naga or an Erawan from the ground, a garuda from the sky)
     ninja     fire jutsu at the mouth · wind and lightning above the head · fans of shuriken · real cuts and dashes
     hunter    the aimed shots from one knee */
'use strict';
const POSE325 = {
  firebolt:'push', thunder:'skyraise', meteor:'skyraise', wrath:'skyraise', frostsea:'sweep', stonespike:'plant', earthrage:'plant', solarfall:'skyraise', deluge:'sweep', tempest:'skyraise', earthswallow:'plant',
  darkbolt:'push', soulrend:'sweep', plaguecurse:'sweep', lifedrain:'push', ghostfire:'sweep', doomcurse:'skyraise', abyssgate:'plant', darkstar:'skyraise', shadowlance:'push',
  callnaga:'plant', callgaruda:'skyraise', callerawan:'plant', kaisorn:'plant', spiritburst:'push', himmagate:'skyraise', gatestorm:'skyraise', emperorwrath:'shout',
  quickslash:'crossslash', ninjadash:'lunge', katon:'sealfire', dragonflame:'sealfire', fuuton:'sealsky', raiton:'sealsky', kirin:'sealsky', iai:'stab', shurikenstorm:'fanthrow', kunairain:'fanthrow', shadowflash:'lunge', blinkstrike:'twinspin',
  pierce:'kneelshot', eaglearrow:'kneelshot'};
for (const id in POSE325) if (SKILLS[id]) SKILLS[id].act = POSE325[id];
/* every class sheet carries the poses its skills use (as js/sys/skillfx2.js does for the older ones) */
for (const j of Object.keys(JOBS)){ const acts = new Set(SPR.CHAR_ACTIONS[j] || SPR.CHAR_ACTIONS.novice || []); let add = false;
  for (let k = j; k && JOBS[k]; k = JOBS[k].parent) for (const id of JOBS[k].skills || []) if (SKILLS[id] && SKILLS[id].act && SPR.ACTIONS[SKILLS[id].act] && !acts.has(SKILLS[id].act)){ acts.add(SKILLS[id].act); add = true; }
  if (add) SPR.CHAR_ACTIONS[j] = [...acts]; }
for (const key in SPR.CHAR_ACTIONS){ const j = String(key).split('|')[0]; if (j !== key && JOBS[j] && SPR.CHAR_ACTIONS[j]) SPR.CHAR_ACTIONS[key] = SPR.CHAR_ACTIONS[j]; }
