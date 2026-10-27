/* VAYRATHEN — js/sys/npclook.js — townsfolk look like townsfolk, not like players
   The NPCs added around Aren were drawn with the player classes' sprites and the same costumes players can buy,
   so they looked like other players. Each one now has its own NPC-only figure: everyday Thai village clothes
   (pha sin skirts, sarongs, farmer's indigo, aprons, head wraps, leaf hats), their own colours, beards and buns for
   the elders, a walking stick here and there — nothing a player class or the costume shop gives you. */
'use strict';

const NPCF = {lashes:true, cute:true, slim:.88, bodyScale:.94};
const NPC_UNIQUE = {
  beastkeeper:{hair:'hairAsh', beard:'hairAsh', top:'brownCl', sleeve:'skin', forearm:'skin', pants:'kram', boots:'wood', belt:'rope', hat:'leaf', spikes:6, spikeLen:1.8, weapon:'staff'},
  healer_oon:{...NPCF, hair:'hairBlack', iris:'irisBr', top:'white', sleeve:'white', pants:'rose', boots:'wood', belt:'gold', skirt:[11.2, 5.6, 6.1, 8.2, 'rose', 'white'], bun:true, hairpin:'rose', sideLocks:6, necklace:true},
  festival:{...NPCF, hair:'hairChestnut', iris:'irisGd', top:'sunset', sleeve:'ivory', pants:'sakura', boots:'wood', belt:'gold', skirt:[11.4, .9, 6.6, 8.6, 'sakura', 'gold'], skirtStripes:true, hat:'mongkhon', bandMat:'gold', backHair:true, backLen:14, backW:9.6, necklace:true},
  tailor:{...NPCF, hair:'hairChestnut', iris:'irisBr', top:'lilac', sleeve:'lilac', pants:'plum', boots:'wood', belt:'gold', skirt:[11.4, .9, 6.6, 8.6, 'plum', 'lilac'], skirtStripes:true, ponytail:true, ribbon:'plum', necklace:true},
  banker:{hair:'hairBlack', iris:'irisBr', top:'ivory', sleeve:'ivory', pants:'midnight', boots:'wood', belt:'gold', hat:'cap', capMat:'charcoal', spikes:6, spikeLen:1.6, necklace:true, beard:'hairBlack'},
  smith:{hair:'hairBrown', iris:'irisBr', top:'leather', sleeve:'skin', forearm:'skin', pants:'kram', boots:'boots', belt:'red', hat:'headwrap', bandMat:'ember', spikes:10, spikeLen:2.4, beard:'hairBrown', bodyScale:1.06},
  teller:{...NPCF, hair:'hairWhite', iris:'irisBr', top:'jade', sleeve:'jade', pants:'sarong', boots:'wood', belt:'gold', skirt:[11.4, .9, 6.6, 8.6, 'sarong', 'jade'], skirtStripes:true, bun:true, weapon:'staff', bodyScale:.88},
  forger:{hair:'hairCrimson', iris:'irisBr', top:'obsid', sleeve:'skin', forearm:'skin', pants:'charcoal', boots:'boots', belt:'ochre', hat:'headwrap', bandMat:'ochre', spikes:12, spikeLen:2.6, beard:'hairCrimson', bodyScale:1.04},
  general:{hair:'hairBlack', iris:'irisRd', top:'steel', sleeve:'red', pants:'red', boots:'steel', belt:'gold', hat:'crest', bandMat:'red', crestMat:'gold', crestN:3, pauldron:'gold', cape:'red', spikes:8, spikeLen:2, weapon:'sword', bodyScale:1.06},
  registrar:{...NPCF, hair:'hairBlack', iris:'irisBr', top:'sky', sleeve:'white', pants:'navy', boots:'wood', belt:'gold', skirt:[11.2, 5.6, 6.1, 8.2, 'midnight', 'sky'], sideLocks:8, spikes:12, spikeLen:3.2, hairpin:'sky'},
  gatekeeper:{hair:'hairSilver', iris:'irisGd', top:'ivory', sleeve:'ivory', pants:'ivory', boots:'skin', belt:'gold', skirt:[11.6, .8, 6.4, 9.2, 'ivory', 'gold'], hat:'mala', weapon:'staff', aura:'auraWhite', beard:'hairSilver', spikes:6, spikeLen:1.8},
  cook:{...NPCF, hair:'hairBrown', iris:'irisBr', top:'cream', sleeve:'skin', forearm:'skin', pants:'red', boots:'wood', belt:'cloth', skirt:[11.4, .9, 6.6, 8.6, 'red', 'cream'], hat:'headwrap', bandMat:'red', bun:true, bodyScale:.98},
  herbal:{hair:'hairWhite', iris:'irisGr', top:'mint', sleeve:'mint', pants:'brownCl', boots:'wood', belt:'rope', hat:'leaf', beard:'hairWhite', weapon:'staff', spikes:5, spikeLen:1.6}
};
for (const id in NPC_UNIQUE){
  const n = NPCS_HOME.find(x => x.id === id), key = 'npc_' + id;
  SPR.CHARS[key] = {name:n ? n.name : id, en:(n ? n.en : id) + ' (NPC)', paint:true, iris:'irisBr', jag:.06, bangF:6, strands:7, spikes:6, spikeLen:1.8, ...NPC_UNIQUE[id]};
  SPR.CHAR_ACTIONS[key] = ['idle'];
  NPC_SPR[id] = key; delete NPC_LOOKS[id];
}
{ const _ns = npcSheet; npcSheet = function(id){ return NPC_UNIQUE[id] && typeof SHEETS !== 'undefined' && SHEETS ? SHEETS['npc_' + id] || null : _ns.apply(this, arguments); }; }
