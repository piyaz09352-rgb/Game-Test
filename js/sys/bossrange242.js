/* VAYRATHEN — js/sys/bossrange242.js — (v242) casters and archers among the bosses
   The owner had never met a boss that casts or shoots: all 67 fought hand to hand, and a boss leapt onto anyone who
   stood back, so a bow or a staff never had to worry about distance. Fourteen bosses whose look fits now fight from
   afar, spread over every level band:
   · casters: bolts of their element that land on MDEF instead of DEF and cannot be sidestepped by Flee (a dodge-roll
     still gets out of the way): Sun Shaman Lord 27 · Market Ghost 49 · Sea Ogress 65 · Buried-Sand Shaman 104 ·
     Fire Archmage 169 · Ice Spider Queen 198 · Old Pop Ghost 269 · Tomb Shaman 281 · Curse Serpent 293 · Vessavana 340;
   · archers: Sand Scorpion King 121 (venom) · Fire Naga 143 (flame) · Garuda King 222 (feathers) · Naga King 294 (water);
   · they shoot from 230–260 away and walk only until you are in range (no leap onto you); stand next to one and it
     blinks back out of reach (every 6 s);
   · their hand-to-hand moves (charge, blade whirl, slam) become bolts, meteors and waves; the rest of their skills, the
     aura, berserk and party scaling (boss192.js) are unchanged. */
'use strict';
const BRG = {
  sunflower_lord:{range:230, shot:'holy', magic:1}, marketmatron:{range:230, shot:'dark', magic:1}, seaogress:{range:230, shot:'ice', magic:1},
  sandcity_lord:{range:230, shot:'dark', magic:1}, agnilord:{range:240, shot:'fire', magic:1}, frostqueen:{range:230, shot:'ice', magic:1},
  elderpop:{range:230, shot:'dark', magic:1}, kingtomb_lord:{range:240, shot:'dark', magic:1}, hexspire_lord:{range:230, shot:'dark', magic:1},
  vessavana:{range:250, shot:'holy', magic:1},
  scorpionking:{range:240, shot:'dart'}, firenaga:{range:250, shot:'fire'}, garudaking:{range:260, shot:'bolt'}, nagaking:{range:250, shot:'ice'}};
for (const k in BRG){ const d = MOB[k]; if (!d || !d.boss) continue; Object.assign(d, {range:BRG[k].range, shot:BRG[k].shot, bossCaster:!!BRG[k].magic, bossRanged:true});
  // hand-to-hand moves (a charge, a whirl of blades, a ground slam) become ranged ones: bolts, a meteor fall, a wave
  if (Array.isArray(d.bossSkills)){ const swap = {charge:BRG[k].magic ? 'boltvolley' : 'barrage', bladestorm:BRG[k].magic ? 'meteor' : 'barrage', slam:'wave'};
    const out = []; for (const id of d.bossSkills){ let n = swap[id] || id; if (out.includes(n)) n = ['barrage', 'meteor', 'field', 'wave', 'boltvolley'].find(x => !out.includes(x) && !d.bossSkills.includes(x)) || null; if (n && !out.includes(n)) out.push(n); }
    d.bossSkills = out; } }
/* no leap onto a hero who stands back: a ranged boss walks until you are in range (mobs.js does the shooting) */
{ const _h = bossHunt; bossHunt = function(m){ if (m && m.def && m.def.bossRanged) m.leapCd = 99; return _h.apply(this, arguments); }; }
/* a caster's bolt: lands on MDEF, Flee does not sidestep it (a roll still does). Every hero has far less MDEF than DEF
   and cannot dodge it, so a bolt hits for 55% of the boss's blow: measured solo, the Sea Ogress killed heroes three
   times as often as a melee boss of her level at full strength (tools/balance-report.js BOSS=1 BOSSTYPE=seaogress) */
const BRG_BOLT = .55;
{ const _a = mobAttack; mobAttack = function(m, mult = 1, noDodge = false){
    if (!m || !m.def || !m.def.bossCaster || !DER || P.roll) return _a.apply(this, arguments);
    const keep = DER.def; DER.def = DER.mdef || 0; try { return _a.call(this, m, mult * BRG_BOLT, true); } finally { DER.def = keep; } }; }
/* stand next to one and it blinks back out of reach */
EV.on('tick', dt => { if (!S || P.dead) return;
  for (const m of mobs){ const d = m.def; if (m.dead || m.vanish || !d || !d.bossRanged || !m.aggro || m.charge || m.leapT > 0) continue;
    m.brgCd = (m.brgCd || 0) - dt; const dp = Math.hypot(P.x - m.x, P.y - m.y); if (dp > 90 || m.brgCd > 0 || (m.st && (m.st.stun > 0 || m.st.freeze > 0 || m.st.stop > 0 || m.st.root > 0))) continue;
    const a0 = Math.atan2(m.y - P.y, m.x - P.x);
    for (const da of [0, .6, -.6, 1.2, -1.2, 2]){ const a = a0 + da, x = clamp(P.x + Math.cos(a) * 200, 40, W - 40), y = clamp(P.y + Math.sin(a) * 200, 60, H - 40);
      if (typeof walkable === 'function' && !walkable(x, y, 14)) continue;
      const x0 = m.x, y0 = m.y; m.x = x; m.y = y; m.brgCd = 6; m.tx = null;
      if (typeof VFX !== 'undefined') VFX.play('blink', {x:x0, y:y0, x2:x, y2:y});
      if (typeof SFX !== 'undefined' && SFX.play) SFX.play('blink');
      break; } } });
