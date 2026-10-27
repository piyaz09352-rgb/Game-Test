/* VAYRATHEN — js/ui/skicons2.js — (v161) every skill of a class has its own picture
   Icons were picked from what a skill does (sword, shield, leaf …), so a class with eight skills often showed the
   same sword three times. Now each skill has its own glyph, chosen from its name and what it is: a war banner, a
   castle tower, a vajra, planets on their orbits, a comet, a crosshair, a drum, a skull mark, a moon claw … No two
   skills of the same class share a picture. The tile, colours and ring are unchanged (ui/icons.js). */
'use strict';

Object.assign(GLYPH, {
  swords2:'<path d="M9 9l17 17M31 9L14 26M9 9h4M9 9v4M31 9h-4M31 9v4M24 28l4-4M16 28l-4-4M27 29l2.5 2.5M13 29l-2.5 2.5"/>',
  rhythm:'<path d="M27 8L14 21m0 0l-2.5-2.5M14 21l2.5 2.5M12.5 22.5l-4 4"/><path d="M22 27c2 0 3 1.5 5 1.5s3-1.5 5-1.5M22 32c2 0 3 1.5 5 1.5s3-1.5 5-1.5"/>',
  wave:'<path d="M7 26c4-12 14-17 26-15-8 2-13 7-15 15"/><path d="M7 26c3 2 7 3 11 0M11 31c3 1 7 1 10-2"/>',
  dash:'<path d="M17 20h15m0 0l-5-5m5 5l-5 5"/><path d="M7 14h8M5 20h9M7 26h8"/>',
  anger:'<path d="M14 9v5M9 14h5M26 9v5M31 14h-5M14 31v-5M9 26h5M26 31v-5M31 26h-5"/>',
  guard:'<path d="M20 7l10 4v7c0 7-4.4 11.4-10 14-5.6-2.6-10-7-10-14v-7z"/><path d="M20 12v14M15 17h10"/>',
  chevron:'<path d="M10 28l10-7 10 7M10 21l10-7 10 7M10 14l10-7 10 7"/>',
  axe:'<path d="M14 31L27 12"/><path d="M22 9c4-2 9 0 10 5-3 0-6 2-7 5-3-2-4-6-3-10z"/>',
  tusk:'<path d="M9 30c2-10 8-18 20-21-6 5-9 11-10 19"/><path d="M19 28c3 1 6 0 8-2"/>',
  roar:'<path d="M9 16c3-4 8-6 12-4 2 1 3 4 2 6l-4 2 4 2c1 2 0 5-2 6-4 2-9 0-12-4"/><path d="M27 13c2 2 3 4.5 3 7s-1 5-3 7M31 10c3 3 4 6.5 4 10s-1 7-4 10"/>',
  heartshield:'<path d="M20 7l10 4v7c0 7-4.4 11.4-10 14-5.6-2.6-10-7-10-14v-7z"/><path d="M20 25c-3-2.4-5-4.2-5-6.4 0-1.6 1.2-2.6 2.6-2.6 1 0 1.8.6 2.4 1.4.6-.8 1.4-1.4 2.4-1.4 1.4 0 2.6 1 2.6 2.6 0 2.2-2 4-5 6.4z"/>',
  crown:'<path d="M8 28h24M9 28l-1-14 7 6 5-10 5 10 7-6-1 14"/><circle cx="20" cy="9" r="1.2"/>',
  hammer:'<path d="M12 31l12-12"/><path d="M19 10l11 11 3-3-11-11z"/>',
  shieldbash:'<path d="M17 8l9 3.6v6.4c0 6.4-4 10.2-9 12.6-5-2.4-9-6.2-9-12.6v-6.4z"/><path d="M30 12l4-2M31 19h4M30 26l4 2"/>',
  banner:'<path d="M11 33V7"/><path d="M11 8h18l-4 6 4 6H11"/>',
  tower:'<path d="M11 33V14h18v19M11 14V9h3v3h3V9h6v3h3V9h3v5M17 33v-6a3 3 0 016 0v6M18 19h4"/>',
  vajra:'<path d="M20 8v24M16 17h8M16 23h8"/><path d="M20 12c-4-1-6 1-6 5h12c0-4-2-6-6-5zM20 28c-4 1-6-1-6-5h12c0 4-2 6-6 5z"/>',
  target:'<circle cx="20" cy="20" r="11"/><circle cx="20" cy="20" r="6"/><circle cx="20" cy="20" r="1.4"/>',
  stream:'<path d="M8 13c4-3 8 3 12 0s8-3 12 0M8 20c4-3 8 3 12 0s8-3 12 0M8 27c4-3 8 3 12 0s8-3 12 0"/>',
  bubble:'<circle cx="20" cy="20" r="12"/><path d="M13 16c1-3 3.5-4.5 6-5"/>',
  nova:'<circle cx="20" cy="20" r="4"/><path d="M20 6v6M20 28v6M6 20h6M28 20h6M10 10l4 4M26 26l4 4M10 30l4-4M26 14l4-4"/>',
  book:'<path d="M20 11c-3-2-7-2-11-1v19c4-1 8-1 11 1 3-2 7-2 11-1V10c-4-1-8-1-11 1zM20 11v19"/>',
  orbits:'<circle cx="20" cy="20" r="3"/><ellipse cx="20" cy="20" rx="13" ry="5.5"/><ellipse cx="20" cy="20" rx="13" ry="5.5" transform="rotate(60 20 20)"/><circle cx="31" cy="17" r="1.6"/>',
  waves:'<path d="M6 17c3-4 6-4 9 0s6 4 9 0 6-4 9 0M6 25c3-4 6-4 9 0s6 4 9 0 6-4 9 0"/><path d="M20 8v4"/>',
  bolt2:'<path d="M17 6l-7 12h5l-2 10 8-13h-5zM28 12l-5 9h4l-2 9 7-11h-4z"/>',
  mountain:'<path d="M5 31l10-17 5 8 4-5 11 14z"/><path d="M13 17l2 2 2-2"/>',
  star:'<path d="M20 7l3.6 8 8.6.8-6.6 5.8 2 8.6L20 25.6 12.4 30l2-8.6-6.6-5.8 8.6-.8z"/>',
  gravity:'<ellipse cx="20" cy="27" rx="13" ry="4.5"/><ellipse cx="20" cy="27" rx="7" ry="2.4"/><path d="M20 8v12m0 0l-4-4m4 4l4-4"/>',
  four:'<circle cx="13" cy="13" r="4.5"/><circle cx="27" cy="13" r="4.5"/><circle cx="13" cy="27" r="4.5"/><circle cx="27" cy="27" r="4.5"/>',
  vortex:'<path d="M20 20c0-1.6 1.6-2.4 2.8-1.6s1.2 3.6-1.2 4.4-5.2-.8-5.2-3.6S20 14 23.2 14.4s6 3.6 5.2 7.2-4.8 6.4-8.8 5.6-7.2-4.8-6.4-8.8 4.8-8 10.4-8"/><path d="M8 32l4-4M32 8l-4 4"/>',
  rain:'<path d="M12 16a6 6 0 0111-3 5 5 0 017 4.6c0 2.4-2 4.4-4.4 4.4H13a4 4 0 01-1-6z"/><path d="M14 26l-2 5M20 26l-2 5M26 26l-2 5"/>',
  tornado:'<path d="M8 9h24M10 14h20M13 19h14M16 24h9M18 29h5M20 33h2"/>',
  comet:'<circle cx="26" cy="26" r="6"/><path d="M6 6l15 15M10 5l13 13M5 10l13 13"/><path d="M24 23l3 3"/>',
  seal:'<circle cx="20" cy="20" r="12"/><path d="M20 9l6.5 20L9.5 16.6h21L13.5 29z"/>',
  crosshair:'<circle cx="20" cy="20" r="10"/><path d="M20 6v8M20 26v8M6 20h8M26 20h8"/>',
  arrows3:'<path d="M8 28L26 10m0 0h-5m5 0v5M13 31l14-14m0 0h-4m4 0v4M5 23L19 9m0 0h-4m4 0v4"/>',
  arrow2:'<path d="M8 24L26 6m0 0h-5m5 0v5M14 34l18-18m0 0h-5m5 0v5"/>',
  arrowdown:'<path d="M12 7v18m0 0l-3-3m3 3l3-3M20 9v20m0 0l-3-3m3 3l3-3M28 7v18m0 0l-3-3m3 3l3-3"/>',
  back:'<path d="M28 12c-6-4-15-2-17 6-1 4 1 8 5 10"/><path d="M11 12v7h7"/>',
  bow:'<path d="M12 6c10 3 16 8 16 14s-6 11-16 14M12 6v28"/><path d="M12 20h18"/>',
  pin:'<path d="M8 32l14-14"/><path d="M20 13l7 7M23 10c2-2 5-2 7 0s2 5 0 7l-3 3-7-7z"/>',
  net:'<path d="M8 10l24 20M32 10L8 30M8 20h24M20 7v26"/><circle cx="20" cy="20" r="12"/>',
  tree:'<path d="M20 33V20M20 24l-4-3M20 22l4-3"/><path d="M20 6c-6 0-10 4-10 9 0 4 4 7 10 7s10-3 10-7c0-5-4-9-10-9z"/>',
  feather:'<path d="M28 7c-9 2-16 10-17 20l-3 6"/><path d="M28 7c1 8-4 16-17 20M15 22h6M18 17h7"/>',
  arrowup:'<path d="M20 34V8m0 0l-5 5m5-5l5 5"/><path d="M13 26l7-4 7 4M14 31l6-3 6 3"/>',
  root:'<path d="M20 7v13M20 20c-4 2-6 6-6 12M20 20c4 2 6 6 6 12M20 20c-1 4-1 8 0 12M14 32c-2 0-4-1-5-2M26 32c2 0 4-1 5-2"/>',
  glove:'<path d="M13 30V17c0-4 3-8 8-8s8 3 8 7v4l-3 3v7z"/><path d="M13 22h-2c-2 0-3-2-2-4l2-3M13 30h13"/>',
  knee:'<path d="M10 9l7 11-4 12M17 20l10-5 4 3"/><circle cx="17" cy="20" r="2.6"/>',
  elbow:'<path d="M10 30l10-12-9-7"/><circle cx="20" cy="18" r="2.6"/><path d="M24 14l5-3M25 19h6M24 23l5 3"/>',
  shin:'<path d="M15 7l3 22h8"/><path d="M13 12h8M14 18h8M15 24h8"/>',
  fists:'<path d="M8 20v-4a2 2 0 014 0v-1a2 2 0 014 0v6c0 3-2 5-4 5s-4-2-4-6zM22 24v-4a2 2 0 014 0v-1a2 2 0 014 0v6c0 3-2 5-4 5s-4-2-4-6z"/><path d="M6 10l3 2M14 8v3M24 12l2 2M32 14l-2 2"/>',
  croc:'<path d="M6 22h26c2 0 2-3 0-3L18 17l-6-4H6z"/><path d="M8 22l2 3 2-3 2 3 2-3 2 3 2-3M10 17l2-2 2 2 2-2"/>',
  monkey:'<circle cx="20" cy="19" r="8"/><circle cx="10" cy="17" r="3"/><circle cx="30" cy="17" r="3"/><path d="M15 23c3 2 7 2 10 0M17 17h0M23 17h0"/><path d="M26 27c4 2 6 5 4 8"/>',
  hand:'<path d="M13 30V14a2 2 0 014 0v6V11a2 2 0 014 0v9-7a2 2 0 014 0v8-4a2 2 0 014 0v7c0 6-4 9-9 9-4 0-6-2-8-5l-4-6c-1-2 1-4 3-2z"/>',
  rock:'<path d="M8 27l4-11 8-5 9 4 3 12z"/><path d="M12 16l6 5 2 6M20 11l1 10 8-6"/>',
  drum:'<ellipse cx="20" cy="13" rx="10" ry="4"/><path d="M10 13v13c0 2 4.5 4 10 4s10-2 10-4V13M10 19l4 9M30 19l-4 9M20 17v13"/>',
  rope:'<path d="M9 13c3-4 9-4 11 0s8 4 11 0M9 21c3-4 9-4 11 0s8 4 11 0M9 29c3-4 9-4 11 0s8 4 11 0"/>',
  burst:'<path d="M20 6l3 9 9-4-5 8 8 4-9 2 2 9-8-5-8 5 2-9-9-2 8-4-5-8 9 4z"/>',
  belt:'<path d="M5 17h30v7H5z"/><rect x="16" y="15" width="8" height="11" rx="1.5"/><circle cx="20" cy="20.5" r="1.6"/>',
  bandage:'<rect x="7" y="15" width="26" height="10" rx="5" transform="rotate(-35 20 20)"/><path d="M18 17l4 6M17 21l2 3M21 16l2 3"/>',
  flask:'<path d="M16 7h8M17 7v8l-7 12c-1 2 0 5 3 5h14c3 0 4-3 3-5l-7-12V7"/><path d="M12 25h16"/>',
  dart:'<path d="M8 32l16-16"/><path d="M24 16l6-8 2 2-8 6M10 26l4 4M8 28l4 4"/>',
  thread:'<path d="M10 30c4-8 16-4 20-12 2-4-1-9-6-9-6 0-8 7-4 10s10 1 10-4"/><path d="M8 32l3-3"/>',
  sparkle:'<path d="M17 8l2.4 7.6L27 18l-7.6 2.4L17 28l-2.4-7.6L7 18l7.6-2.4zM28 24l1.2 3.8L33 29l-3.8 1.2L28 34l-1.2-3.8L23 29l3.8-1.2z"/>',
  scroll:'<path d="M12 9h16a3 3 0 010 6H12a3 3 0 010-6zM12 15v13a3 3 0 003 3h16V15"/><path d="M17 20h9M17 25h9"/>',
  halo:'<ellipse cx="20" cy="12" rx="9" ry="3.5"/><path d="M20 18v14M14 24h12"/>',
  phoenix:'<path d="M20 30c-2-4-2-8 0-12 2 4 2 8 0 12z"/><path d="M18 20c-5-2-9-7-10-12 4 3 8 4 12 4 4 0 8-1 12-4-1 5-5 10-10 12M14 31c2 2 10 2 12 0"/>',
  temple:'<path d="M6 32h28M9 32V18M31 32V18M15 32V18M25 32V18M7 18h26L20 7z"/>',
  chalice:'<path d="M11 9h18c0 7-4 11-9 11s-9-4-9-11zM20 20v8M14 31h12"/>',
  wings:'<path d="M20 16c-4-6-10-8-15-7 1 6 6 10 13 11M20 16c4-6 10-8 15-7-1 6-6 10-13 11"/><path d="M8 18c2 4 6 6 10 6M32 18c-2 4-6 6-10 6M20 16v14"/>',
  daggers2:'<path d="M10 8l12 12M30 8L18 20M10 8l3 .5M10 8l.5 3M30 8l-3 .5M30 8l-.5 3M22 20l3 3-2 2M18 20l-3 3 2 2M24 26l5 5M16 26l-5 5"/>',
  cut:'<path d="M8 30L30 8"/><path d="M14 14l3 3M23 23l3 3M10 20h5M25 20h5"/>',
  smoke:'<path d="M10 28a5 5 0 010-10 7 7 0 0113-3 5 5 0 017 4 4.5 4.5 0 01-1 9z"/><path d="M14 22c2-1 4-1 6 0"/>',
  heart:'<path d="M20 31c-7-5-12-9-12-14a6 6 0 0112-1 6 6 0 0112 1c0 5-5 9-12 14z"/>',
  skull:'<path d="M11 19a9 9 0 0118 0v4l-2 2v4h-3v-3h-2v3h-4v-3h-2v3h-3v-4l-2-2z"/><circle cx="16" cy="20" r="2.4"/><circle cx="24" cy="20" r="2.4"/>',
  daggers3:'<path d="M9 31L23 17M15 33L27 21M7 25L19 13"/><path d="M23 17l3-1-1 3M27 21l3-1-1 3M19 13l3-1-1 3"/>',
  moon:'<path d="M25 8a12 12 0 100 24 10 10 0 010-24z"/><path d="M28 14l4-2M29 20h4M28 26l4 2"/>',
  fang:'<path d="M9 10h22c0 6-3 9-6 10l-2 11-3-9-3 9-2-11c-3-1-6-4-6-10z"/>',
  cuts:'<path d="M8 12l12 4M9 19l14 3M10 26l14 2M22 9l10 6M24 18l9 4M26 27l7 1"/>',
  scythe:'<path d="M14 33L26 9"/><path d="M26 9c-6-2-14 0-18 6 6-1 11 0 15 3"/>',
  ghost:'<path d="M11 31V18a9 9 0 0118 0v13l-3-2-3 2-3-2-3 2-3-2z"/><circle cx="16.5" cy="18" r="1.6"/><circle cx="23.5" cy="18" r="1.6"/>',
  serpent:'<path d="M9 31c4 0 6-3 6-6s-3-4-3-7 3-6 8-6 8 3 8 6-3 4-3 7 2 6 6 6"/><path d="M17 10l-2-3M23 10l2-3"/>',
  orb:'<circle cx="20" cy="18" r="8"/><path d="M14 30h12M16 26l-2 4M24 26l2 4M16 15c1-2 2.5-3 4.5-3"/>',
  wing:'<path d="M8 30c2-10 10-18 24-21-2 7-6 11-11 13 3 0 6 0 8-1-3 5-9 8-16 9z"/><path d="M14 26c4-3 8-6 13-10"/>',
  chain:'<rect x="6" y="15" width="15" height="10" rx="5" transform="rotate(-30 13.5 20)"/><rect x="19" y="15" width="15" height="10" rx="5" transform="rotate(-30 26.5 20)"/>',
  swan:'<path d="M27 9c-3 0-5 2-5 5 0 4 4 6 4 10 0 3-3 6-8 6-5 0-9-3-10-7 4 2 8 2 11 0"/><path d="M27 9l5 2-4 1"/>',
  horn:'<path d="M8 28c8 0 18-4 24-18-1 8-5 14-11 18-3 2-8 3-13 0z"/><path d="M12 26c1-2 1-4 0-6"/>',
  gate:'<path d="M7 32V16c0-5 6-9 13-9s13 4 13 9v16M7 32h26"/><path d="M14 32V20a6 6 0 0112 0v12M20 14v18"/>'
});

const SK_GLYPH = {
  // swordsman line
  swordmastery:'swords2', bladerhythm:'rhythm', warcry:'shout', waveslash:'wave', charge:'dash', quake:'crack', provoke:'anger', guardstance:'guard',
  warpath:'chevron', cleave:'axe', earthsplit:'crack', bladestorm:'spiral', tuskcharge:'tusk', roar:'roar', goldshield:'shield', guardheart:'heartshield',
  peerless:'crown', vanguard:'chevron', judgement:'hammer', shieldbash:'shieldbash', warking:'swords2', warbanner:'banner', bastion:'tower', vajrabody:'vajra',
  // mage line
  focus:'target', manastream:'stream', firebolt:'flame', icebolt:'snow', thunder:'bolt', stonespike:'spike', barrier:'bubble', frostnova:'nova',
  astrowisdom:'book', navagraha:'orbits', meteor:'meteor', frostsea:'waves', wrath:'bolt2', earthrage:'mountain', starveil:'star', gravity:'gravity',
  fourelements:'four', arcanestorm:'vortex', solarfall:'sun', deluge:'rain', tempest:'tornado', earthswallow:'crack', cataclysm:'comet', elemseal:'seal',
  // hunter line
  hunterfocus:'crosshair', rapidfire:'arrows3', doubleshot:'arrow2', arrowrain:'arrowdown', backstep:'back', spiketrap:'spike', hawkeye:'eye', beastbond:'paw',
  mountedarcher:'bow', deadeye:'target', pierce:'arrow', firerain:'meteor', pinarrow:'pin', tiger:'tiger', wildkin:'leaf', snarefield:'net',
  packcall:'paw', forestblood:'tree', thousandarrows:'arrows3', eaglearrow:'bird', stormvolley:'tornado', spiritarrow:'feather', heavenpiercer:'arrowup', rootsnare:'root',
  // muay line
  waikhru:'lotus', muaymastery:'glove', jabflow:'fists', combo:'fist', roundkick:'kick', flyingknee:'knee', elbowback:'elbow', shinguard:'shin',
  ramwai:'lotus', thousandfists:'fists', crocodile:'croc', hanuman:'monkey', monkick:'kick', grabthrow:'hand', flowart:'swirl', stoneskin:'rock',
  drumrally:'drum', kardchuek:'rope', elbowstorm:'elbow', shinstorm:'kick', finisher:'burst', kneeclinch:'knee', nakmuay:'belt', unbreakable:'heartshield',
  // healer line
  herbheal:'heal', poultice:'bandage', antidote:'flask', herbalism:'leaf', holywater:'drop', herbdart:'dart', zealot:'sun', thread:'thread',
  elixir:'flask', purify:'sparkle', royaltext:'scroll', holycircle:'halo', divinewrath:'bolt', revive:'phoenix', tonic:'pot', sanctum:'temple',
  amrita:'chalice', divinehand:'hand', lifeweave:'thread', holylight:'sun', judgment:'hammer', sanctuary:'temple', massrevive:'wings', blessing:'lotus',
  // rogue line
  dualwield:'daggers2', vitalspot:'target', thiefsense:'eye', backstab:'dagger', shadowlunge:'dash', hamstring:'cut', smokebomb:'smoke', evasion:'swirl',
  tigerheart:'heart', bladedance:'spiral', assassinate:'skull', knifevolley:'daggers3', ambush:'mask', shadowstep:'back', plunder:'coin', venomblade:'drop',
  moonclaw:'moon', tigerfang:'fang', thousandcuts:'cuts', deathmark:'skull', tigerpounce:'paw', tigerclaw:'tiger', shadowexec:'scythe', phantom:'ghost',
  // summoner line
  callsingha:'tiger', callnaga:'serpent', sumlore:'book', spiritburst:'spiral', spiritbolt:'orb', spiritmind:'eye', callkinnaree:'wing', soulpact:'chain',
  callgaruda:'bird', callerawan:'elephant', sovlore:'crown', royalbond:'chain', goldenhong:'swan', astralray:'star', unity:'hand', beastward:'shield',
  beastcharge:'horn', kaisorn:'tiger', emperorgrace:'crown', himmapanlord:'tree', gatestorm:'gate', emperorwrath:'bolt2', heavenfall:'comet', royaledict:'scroll'
};
/* which skill an object is (SKILLS entries carry no id of their own) */
const SKG_ID = new Map();
const skgId = sk => { let id = SKG_ID.get(sk); if (id) return id; for (const k in SKILLS) SKG_ID.set(SKILLS[k], k); return SKG_ID.get(sk); };
{ const _sg = skillGlyph;
  skillGlyph = function(sk){ const id = sk && skgId(sk), g = id && SK_GLYPH[id]; return g && GLYPH[g] ? g : _sg.apply(this, arguments); }; }
