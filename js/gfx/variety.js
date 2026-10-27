/* VAYRATHEN — js/gfx/variety.js — (v96) no two monsters alike
   Many regional species were the same body in another colour (a cat in every land, a hawk in every sky).
   Each monster listed in VARIETY gets a makeover: a set of body parts and proportions of its own (wings, extra heads,
   horns, tails, manes, shells, long necks, crests, capes…) so it reads as a new creature, not a recolour.
   The numbers come from a silhouette comparison of every monster (shape only, colours ignored): inside each group of
   look-alikes the lowest-level one keeps its look and the others take makeover 1, 2, 3… of their body type.
   Loaded after gfx/beasts.js and before data/world.js, which registers the monsters through BEAST.make. */
'use strict';

const MAKEOVER = {
  quad:[
    {wing:'#d8e4f4'},
    {heads:2, ruff:true},
    {horns:'buffalo', girth:1.28, leg:.78},
    {tusks:'curved', mane:'#3a2a1a', ruff:true, len:1.35, leg:.7},
    {fishTail:'#4ab0c8', leg:.72, len:1.15},
    {horns:'unicorn', leg:1.32, len:.86, tailUp:true},
    {shaggy:true, girth:1.38, len:.8, crown:true, mane:'#f0e8d8'},
    {horns:'spike', tailUp:true, len:1.3, leg:.82, spots:true},
    {heads:3, horns:'spike'},
    {wing:'#f0c060', horns:'antler', mane:'#e3b04b'},
    {horns:'antler', leg:1.25, girth:.82, ruff:true},
    {heads:2, wing:'#3a4250', tusks:true}
  ],
  bird:[
    {tail:'long', crest:'#ffd04a', neckLen:1.5},
    {tail:'fan', casque:'#e8c860', legLen:1.5},
    {horns:'#2a1a1a', mantle:'#f4f4f0', beakLen:1.6, hook:true, fly:false, neckLen:1.5},
    {neckLen:.6, size:1.3, beakW:1.6, tail:'short'},
    {crest:'#ff3a1a', tail:'fan', wingGlow:'#ffe08a', legLen:.6},
    {mantle:'#e8a030', neckLen:1.85, legLen:1.75, beakLen:1.5},
    {horns:'#f0e8d0', tail:'long', casque:'#e8c860'},
    {fly:false, legLen:1.6, neckLen:1.3, size:1.2, tail:'fan'},
    {beakLen:.55, beakW:1.5, crest:'#fff4c0', tail:'short', size:1.15},
    {mantle:'#e3b04b', horns:'#2a1a1a', tail:'fan', neckLen:1.4},
    {fly:false, size:1.35, neckLen:1.6, legLen:1.9, tail:'long', crest:'#d8302a'},
    {hook:true, beakLen:1.3, casque:'#f0d070', wingGlow:'#c8f4ff', tail:'long'}
  ],
  serpent:[
    {heads:3, spread:2.2},
    {hood:'#e8c060', rise:14},
    {legs:true, len:.8},
    {crest:'#e3b04b', thick:1.4, rise:12},
    {len:1.5, thick:.78},
    {crown:true, hood:'#e3b04b', rise:16},
    {heads:2, legs:true},
    {grub:true, thick:1.3},
    {heads:5, spread:2.6, crown:true},
    {wing:'#c8d8f0', rise:10}
  ],
  bug:[
    {legLen:1.6, spines:true},
    {horn:true, elytra:'#c8a040'},
    {shellHouse:'#e8d0b0'},
    {stinger:true, eyeStalks:true},
    {elytra:'#3a6a9a', crown:true},
    {legLen:1.8, stinger:true},
    {shellHouse:'#c8e8f8', crown:true},
    {horn:true, spines:true, legLen:.75},
    {elytra:'#b03a2a', legLen:1.35, eyeStalks:true},
    {stinger:true, spines:true}
  ],
  squat:[
    {horns:'#f0e8d0', crown:true},
    {tail:'#5a8a4a', spines:'#d8c8a0'},
    {spines:'#e8dcc0', pearl:'#f0f8ff'},
    {horns:'#3a2a1a', tail:'#6a4a2a'},
    {tail:'#c8604a', crown:true},
    {spines:'#3a3a3a', horns:'#3a3a3a', size:1.2},
    {lotus:true, tail:'#4a7a8a'},
    {horns:'#e3b04b', spines:'#e3b04b', tail:'#a8402a'}
  ],
  floater:[
    {tails:7, spikes:5},
    {hood:'#e8e0f0', puffs:true, veil:true},
    {spikes:6, ring:'#a8e0ff'},
    {lamp:'#ffd36a', ring:'#ffd36a', spikes:8},
    {veil:true, spikes:4, tails:0},
    {ring:'#ffd36a', puffs:true, tails:2},
    {hood:'#e3b04b', bands:true, spikes:14},
    {tails:6, veil:true, ring:'#a8e0ff'},
    {arms:true, horns:'#2a1a1a'},
    {batWings:'#3a2a3a', orbit:'#ffd36a'},
    {chain:true, horns:'#e3b04b'},
    {orbit:'#a8f0ff', arms:true, tails:1}
  ],
  slime:[
    {top:'crown', spikes:true},
    {top:'mushroom', topCol:'#d84a3a'},
    {jelly:true},
    {top:'lotus', spikes:true},
    {top:'halo', jelly:true},
    {top:'leaf', size:1.25},
    {top:'mushroom', topCol:'#8a5ac8', spikes:true},
    {top:'crown', jelly:true}
  ],
  rock:[
    {form:'spire', crystals:'#c8f0ff'},
    {tree:true, moss:'#7ac06a'},
    {coral:true, bulk:1.15},
    {veins:'#ff6a1a', tree:true, bulk:.85},
    {glowCrystal:true, crystals:'#8a5ac8', form:'spire'},
    {form:'tree', moss:'#e8f4ff'},
    {strata:true, crystals:'#e8f8ff', bulk:1.2},
    {veins:'#7ae0ff', coral:true},
    {horns:'#2a1a1a', pauldrons:'#5a4a3a'},
    {fourArms:true, horns:'#e8dcc0'},
    {pauldrons:'#c8f0ff', fourArms:true},
    {fourArms:true, crystals:'#ff8a4a'}
  ],
  bat:[
    {horns:'#2a1a1a', whip:'#3a2a2a'},
    {wings2:'#5a3a4a', ears:1.6},
    {whip:'#8a2a2a', snout:true},
    {horns:'#e8dcc0', wings2:'#3a3a4a', ears:.6},
    {noseLeaf:'#c87a6a', whip:'#2a2a2a', ears:1.4},
    {mantle:'#e8e0d8', horns:'#a83a2a', wings2:'#6a4a3a'}
  ],
  human:[
    {wings:'#f0e8d0'},
    {body:'brute', horns:'#2a1a1a', hornLen:3},
    {cape:'#c83a1a', hat:'lomphok', weapon:'staff'},
    {body:'gaunt', longHair:true, weapon:'fist'},
    {tail:'#3ab0a8', tailUp:true, body:'ape'},
    {shell:'#e3b04b'},
    {hat:'ngob', weapon:'bow', beard:true},
    {wings:'#f0d070', horns:'#f0e8d0', hornLen:4},
    {body:'brute', cape:'#a8d0f0', weapon:'sword'},
    {tailFin:true, longHair:true},
    {hat:'headwrap', spikes:14, spikeLen:4, weapon:'staff'},
    {body:'gaunt', wings:'#3a4250', horns:'#2a1a1a', hornLen:3}
  ]
};
/* which makeover each look-alike takes (generated; see the note above) */
const VARIETY = {abyssjelly:4,abyssturtle:6,agnilord:5,agnipriest:17,airavata:3,ashbat:2,ashwolf:5,ashwolfking:7,asura:4,asurabird:1,asuraking:10,asuramaze_cat:23,asuramaze_elephant:22,asuramaze_hawk:9,asuramaze_jelly:4,asuramaze_lantern:6,asuramaze_lizard:1,asuramaze_longtail:10,asuramaze_lord:1,asuramaze_scorpion:13,asuramaze_warrior:5,aurora_cat:12,aurora_elephant:3,aurora_hawk:22,aurora_jelly:7,aurora_lord:6,aurora_mask:3,aurora_shaman:5,aurora_stag:1,aurora_toad:5,ayutsoldier:13,ayutyaksha:17,banditghost:6,banteng:4,basalt_cat:8,basalt_elephant:16,basalt_fiend:23,basalt_golem:7,basalt_hawk:6,basalt_leafling:3,basalt_longtail:23,basalt_shaman:7,basalt_warrior:17,blizzard_bear:3,blizzard_cat:20,blizzard_hawk:16,blizzard_jelly:3,blizzard_lord:6,blizzard_serpent:2,blizzard_spider:9,blizzard_warrior:12,blizzard_wisp:5,boatlamp:10,boatscarecrow:4,cactus_beetle:6,cactus_cat:5,cactus_crocodile:1,cactus_fiend:4,cactus_hawk:6,cactus_jarspirit:1,cactus_lord:6,cactus_scorpion:1,cactus_warrior:5,cactus_wisp:6,canyonspider:1,cavematriarch:6,cavespider:6,celadonjar:12,celestialsingha:11,chapelbat:8,charredent:7,cinder_cat:12,cinder_crawler:3,cinder_elephant:5,cinder_fiend:1,cinder_golem:2,cinder_hawk:12,cinder_leafling:2,cinder_serpent:1,cinder_warrior:8,cinder_wisp:1,cinderbeetle:8,cinderimp:1,cloudedleopard:3,crimsonlake_archer:12,crimsonlake_cat:22,crimsonlake_crab:5,crimsonlake_elephant:11,crimsonlake_fiend:5,crimsonlake_hawk:22,crimsonlake_longtail:9,crimsonlake_lord:18,crimsonlake_mask:7,crimsonlake_warrior:2,crystalgolem:1,devaguard:10,dunevulture:3,dustdevil:3,dvarapala:4,embergolem:9,emeraldcrab:8,fallenstar:3,firefly_crab:12,firefly_crawler:1,firefly_golem:4,firefly_lord:1,firefly_pheasant:2,firefly_turtle:4,firefly_wolf:1,firejelly:7,firekingfisher:20,firelizard:1,fjord_golem:7,fjord_lord:16,fjord_mask:17,fjord_serpent:1,fjord_spider:14,fjord_warrior:11,fjord_wisp:23,flamegaruda:24,frostknight:5,frostnaga:3,frostqueen:1,frostspider:16,frosttoad:12,frostwisp:11,frostwraith:10,frostyaksha:4,galegorge_beetle:4,galegorge_cat:3,galegorge_fiend:10,galegorge_gaur:1,galegorge_golem:10,galegorge_hawk:3,galegorge_lord:3,galegorge_toad:1,galegorge_warrior:4,galegorge_wolf:3,gandharva:8,garudaking:20,gempalace_cat:28,gempalace_fiend:18,gempalace_finch:3,gempalace_hawk:3,gempalace_jelly:5,gempalace_krasue:2,gempalace_longtail:8,gempalace_lord:3,gempalace_pearlspirit:1,gempalace_starwisp:1,gempalace_warrior:3,ghostcrab:2,ghostelephant:23,giantclam:6,giantscorpion:2,giantsquid:3,glacierhawk:6,gloom_cat:19,gloom_elephant:11,gloom_hawk:1,gloom_jelly:2,gloom_lantern:11,gloom_longtail:3,gloom_spider:2,gloom_warrior:12,glowcap_elephant:24,glowcap_fiend:10,glowcap_hawk:1,glowcap_longtail:13,glowcap_lord:10,glowcap_pheasant:24,glowcap_serpent:1,glowcap_stag:4,goldbloom_clam:2,goldbloom_crab:16,goldbloom_golem:5,goldbloom_jelly:9,goldbloom_lord:10,goldbloom_lotusjelly:2,goldbloom_pheasant:5,goldbloom_shroom:3,goldbloom_wolf:1,goldfrog:7,goldgaruda:23,goldhamsa:6,goldkinnaree:7,goldnaga:3,goldscarab:5,goldshrimp:1,goldsingha:4,guardiandeva:12,hauntedurn:10,heavenhamsa:9,hemaraj:4,hermitcrab:1,hexspire_cat:21,hexspire_elephant:23,hexspire_finch:20,hexspire_halojelly:8,hexspire_hawk:5,hexspire_mask:2,hexspire_spider:9,himogre:6,hornbill:2,icebat:5,icecrab:1,icefisher:1,icegargoyle:11,icesentinel:11,icesentry:7,iceslime:5,iceturtlelord:3,icewolf:9,isanscarecrow:4,junglefowl:4,karawek:15,khankhak:2,khmerghost:1,kilen:1,kingcobra:1,kingtomb_crab:9,kingtomb_elephant:9,kingtomb_hawk:19,kingtomb_jelly:2,kingtomb_longtail:7,kingtomb_lord:7,kingtomb_serpent:1,kingtomb_spider:8,kingtomb_turtle:7,kingtomb_warrior:13,kingtomb_wisp:4,kinnorn:5,kotchasi:17,krahang:2,krahangluang:3,kraisorn:24,krasue:3,laplaefolk:5,laplaelord:8,laplaemist:9,lavadrake:2,leatherback:1,lightjelly:4,lordkotchasi:14,lostmermaid:1,lotusjelly:3,lotusturtle:6,magmariver_crawler:1,magmariver_fiend:12,magmariver_golem:1,magmariver_hawk:7,magmariver_lizard:2,magmariver_lord:1,magmariver_pheasant:3,magmariver_shaman:6,magmariver_vortex:1,magmariver_wolf:6,magmatoad:7,mammoth:4,mammothking:7,mangrove_beetle:14,mangrove_elephant:11,mangrove_fiend:3,mangrove_golem:7,mangrove_lantern:12,mangrove_lord:1,mangrove_pheasant:1,mangrove_wisp:1,maninmangkon:4,matchanu:2,milkyway_cat:26,milkyway_crab:7,milkyway_elephant:15,milkyway_hawk:24,milkyway_mask:9,milkyway_pheasant:8,milkyway_scorpion:4,milkyway_spire:7,milkyway_starwisp:5,milkyway_warrior:2,milkyway_wisp:6,minerspirit:10,mistspirit:8,misttiger:20,nagaking:5,oasis_fiend:1,oasis_hawk:3,oasis_lord:2,oasis_spider:14,obsidiangolem:9,omencrow:18,orchard_beetle:1,orchard_clam:6,orchard_crab:9,orchard_crawler:1,orchard_fiend:2,orchard_finch:1,orchard_frog:1,orchard_lantern:9,orchard_lord:1,orchard_pheasant:6,paddyturtle:15,phantomgeneral:12,phoenixchick:4,pirategull:20,rainbowfall_crab:1,rainbowfall_frog:2,rainbowfall_golem:7,rainbowfall_lord:1,rainbowfall_turtle:2,rainbowfall_wisp:8,rainbowfall_wolf:2,redgolem:11,redpuma:4,rockhawk:6,sakuna:11,saming:11,sanctuarybat:11,sandcity_cat:17,sandcity_fiend:5,sandcity_golem:12,sandcity_hawk:1,sandcity_jarspirit:9,sandcity_pheasant:8,sandcity_shaman:13,sandcity_warrior:24,sandgolem:10,sandscorpion:9,sapphire_elephant:5,sapphire_finch:12,sapphire_golem:12,sapphire_hawk:13,sapphire_longtail:1,sapphire_lord:4,sapphire_shaman:10,sapphire_warrior:10,sapphire_wisp:1,seaogress:4,seawraith:19,serow:2,skygarden_archer:14,skygarden_crab:6,skygarden_elephant:12,skygarden_fiend:1,skygarden_krasue:10,skygarden_lantern:1,skygarden_longtail:11,skygarden_mask:8,skygarden_warrior:14,skylotus:9,smokewisp:11,snowdeva:11,snowfox:8,snowking:6,snowlion:15,snowowl:24,snowpine_bear:1,snowpine_crawler:2,snowpine_longtail:22,snowpine_lord:5,snowpine_mask:12,snowpine_serpent:4,snowpine_toad:3,snowpine_warrior:9,snowpine_wisp:12,snowsingha:13,spiritkoel:2,spiritpearl:1,stalagwalker:4,stoneapsara:18,stonesingha:5,stuccoyaksha:10,sulphur_beetle:7,sulphur_cat:7,sulphur_golem:5,sulphur_hawk:2,sulphur_lord:24,sulphur_shaman:5,sulphur_warrior:1,sulphur_wisp:18,sulphur_wolf:4,suncourt_cat:29,suncourt_elephant:4,suncourt_fiend:1,suncourt_hawk:2,suncourt_jarspirit:4,suncourt_lord:1,suncourt_pheasant:3,suncourt_spire:7,suncourt_stag:2,suncourt_starwisp:2,suncourt_warrior:2,sunflower_golem:1,sunflower_lantern:18,templecolossus:2,templelantern:16,tenfacedogre:19,termiteshroom:14,thaktho:7,treasurespirit:19,vampirebat:11,vengefulshade:6,vessavana:23,vulture:20,walkcoral:7,wanderdurian:3,waterbug:9,waterelephant:2,waterelephantking:3,watermonitor:1,whiteraven:3,wildbuffalo:2,wingedhorse:5,woodsentinel:1,wreck_bear:2,wreck_cat:2,wreck_crab:10,wreck_jelly:3,wreck_lord:18,wreck_serpent:1,wreck_spider:4,wreck_toad:6,wreck_warrior:11,wreck_wolf:10,youngerawan:16,younggaruda:15};
/* (v118) bosses keep the body their legend gives them: no random makeover (antlers on the Saming tiger, extra parts
   on the Naga King…). Each boss is one of a kind already, and its look is drawn from the real animal or the legend. */
for (const b of ['lotusturtle', 'dvarapala', 'cavematriarch', 'saming', 'khankhak', 'templecolossus', 'seaogress', 'phantomgeneral',
  'lordkotchasi', 'waterelephantking', 'laplaelord', 'nagaking', 'tenfacedogre', 'garudaking', 'vessavana']) delete VARIETY[b];
/* (v131) the same for the creatures of Thai legend and literature (Himmapan beasts, nagas, garudas, kinnaree, the ghosts
   of Thai belief, temple yakshas and lions): their look is drawn from the stories, so no random fins, antlers or spears */
for (const b of ['kraisorn', 'kotchasi', 'kilen', 'maninmangkon', 'hemaraj', 'goldsingha', 'snowsingha', 'celestialsingha', 'thaktho', 'karawek',
  'goldhamsa', 'heavenhamsa', 'sakuna', 'younggaruda', 'goldgaruda', 'flamegaruda', 'matchanu', 'kinnorn', 'goldkinnaree', 'gandharva', 'lakenaga',
  'goldnaga', 'celestialnaga', 'nagaretainer', 'wingednaga', 'airavata', 'youngerawan', 'waterelephant', 'krasue', 'phipop', 'kongkoi', 'lankypreta',
  'krahang', 'krahangluang', 'nangtani', 'asura', 'stuccoyaksha', 'ayutyaksha', 'himogre', 'stonesingha', 'khmerlion', 'stonenaga', 'stoneapsara',
  'frostyaksha', 'guardiandeva', 'devaguard', 'snowlion', 'frostnaga']) delete VARIETY[b];

function makeoverOf(key, spec){
  const n = VARIETY[key], P = MAKEOVER[spec.arch === 'bird' && spec.bat ? 'bat' : spec.arch]; if (!n || !P) return null;
  const a = P[(n - 1) % P.length];
  return n > P.length ? {...a, ...P[(n - 1 + 5) % P.length]} : a;   // past the end of the list: two makeovers at once
}
{ const _mk = BEAST.make;
  BEAST.make = function(key, spec){ const m = spec && makeoverOf(key, spec); return _mk.call(this, key, m ? {...spec, ...m} : spec); }; }
