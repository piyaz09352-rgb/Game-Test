/* VAYRATHEN — js/gfx/realism.js — (v122) ordinary monsters that are real animals look and size like real animals
   variety.js gives look-alike monsters a "makeover" so no two are the same body in another colour — but for real
   animals that meant wings on a jackal, antlers on a squirrel, extra heads on a cobra. Here, for every monster that
   is a real animal (a known animal word in its name or id, and nothing mythical in it), the makeover comes from what
   really tells such animals apart instead: body length and leg length, build, coat (spots, a shaggy coat, pale
   "socks"), a mane or ruff, a raised tail; for birds tail shape, crest, neck and leg length (waders), bill size,
   barred breast; for snakes length and thickness and a diamond back; for insects and crabs leg length and size; for
   frogs and turtles size, spots and keels. Mythical monsters keep their fantastic makeovers.
   SIZE — real animals are drawn at a size from life against a 1.7 m hero: small (rats, frogs, crabs, insects),
   middle (monkeys, jackals, otters, snakes), large (deer, bears, big cats, crocodiles), very large (buffalo, gaur,
   banteng), giant (elephants, rhinos). Loaded after variety.js and before data/world.js. */
'use strict';

const REAL_ANIMAL = new RegExp(`\\b(${'kingfisher|junglefowl|flying fox|tarantula|millipede|crocodile|centipede|scorpion|squirrel|terrapin|tortoise|pheasant|fireback|hornbill|pangolin|elephant|mongoose|vulture|serpent|gharial|chicken|panther|muntjac|leopard|macaque|banteng|octopus|catfish|buffalo|bittern|peacock|monitor|swallow|spider|shrimp|turtle|jackal|rabbit|mantis|langur|pigeon|bulbul|beetle|sambar|python|hornet|monkey|weasel|parrot|lizard|gibbon|squid|mouse|cobra|tiger|otter|snake|eagle|shark|crane|tapir|goose|viper|serow|egret|krait|jelly|raven|stork|rhino|skink|civet|prawn|gecko|heron|crab|boar|toad|wasp|bats|grub|bees|rats|gull|gaur|deer|hawk|bear|fish|wolf|crow|duck|frog|tern|fowl|hare|kite|dove|myna|goat|ants|ant|eel|fox|hog|dog|owl|cow|rat|pig|bat|hen|bee|cat|ray|ox'})(e?s)?\\b`, 'i');   // whole words only (no "owl" in "snowlion", no "ant" in "treant")
const MYTHIC = /spirit|ghost|phantom|demon|naga|garuda|kinnar|deva|yaksha|asura|gold|crystal|lava|flame|fire|ice|frost|thunder|storm|shadow|void|star|moon|sun|jade|ember|wraith|curse|holy|sacred|celestial|dragon|kirin|kilen|erawan|hamsa|himma|mangkon|elemental|golem|imp\b|wisp|lantern|ogre|giant|king|lord|queen|bone|skelet|undead|zombie|soul|magic|rune|astral|nymph|fairy|sprite|mermaid|kappa|vault|mist|abyss|emerald|water elephant|treant/i;   // (flavour words like temple, offering, pirate or omen still name real animals)
/* realistic distinguishing traits per body plan (each is something real animals of that kind differ by) */
const REAL_MAKEOVER = {
  quad:[{len:1.22, leg:.84}, {girth:1.18, leg:.9, shaggy:true}, {len:.86, leg:1.16}, {spots:true}, {tailUp:true, len:1.08}, {socks:'#efe8da'},
    {ruff:true}, {tuft:true, len:1.1}, {leg:.72, len:1.3, girth:.86}, {girth:.86, leg:1.26, len:.92}, {girth:1.28, leg:.8}, {spots:true, len:1.15, leg:.9}],
  bird:[{tail:'long'}, {crest:'#2a2420'}, {neckLen:1.45, legLen:1.55}, {size:1.18, beakLen:1.3}, {tail:'fan'}, {bars:'#3a3028'}, {neckLen:.8, beakW:1.3},
    {legLen:1.7, neckLen:1.6, beakLen:1.4}, {tail:'short', size:.9}, {crest:'#f0e8d8', tail:'long'}, {beakLen:1.6, neckLen:1.2}, {size:1.25, tail:'fan'}],
  serpent:[{len:1.3}, {thick:1.28, len:.9}, {diamond:true}, {len:1.15, thick:.85}, {thick:1.15, diamond:true}, {len:.85}],
  bug:[{legLen:1.3}, {legLen:.82, size:1.12}, {size:.88}, {legLen:1.15, size:1.08}, {legLen:1.45, size:.9}, {size:1.2}],
  squat:[{size:1.18}, {size:.86}, {ridges:true}, {size:1.1, ridges:true}, {size:.92}, {size:1.25}]};
/* size from life (relative to the usual drawing) */
const REAL_SIZE = [
  [/elephant|rhino/i, 1.45], [/buffalo|banteng|gaur|\box\b|cow|tapir/i, 1.28], [/bear|tiger|leopard|panther|crocodile|gharial|sambar|python/i, 1.16],
  [/deer|serow|boar|goat|monitor|vulture|eagle|hornbill|heron|stork|crane|jackal|wolf|dog|cobra/i, 1.0],
  [/monkey|macaque|langur|gibbon|otter|civet|fox|pangolin|turtle|tortoise|snake|krait|viper|gull|crow|raven|fowl|fireback|pheasant|peacock|duck/i, .92],
  [/rat\b|rats|mouse|squirrel|frog|toad|crab|spider|scorpion|centipede|beetle|ant\b|wasp|bee\b|hornet|mantis|grub|gecko|myna|bulbul|kingfisher|bat\b|shrimp|prawn/i, .8]];
const REAL = {spec:null};
function realName(key){ if (!REAL.spec && typeof SPECIES !== 'undefined'){ REAL.spec = {}; for (const r of SPECIES) REAL.spec[r[0]] = r[2] || ''; } return (REAL.spec && REAL.spec[key]) || ''; }
const isRealAnimal = (key, spec) => { const nm = realName(key) || key; return spec && spec.arch !== 'human' && !spec.boss && REAL_ANIMAL.test(nm) && !MYTHIC.test(nm); };
{ const _mk = BEAST.make;   // this wraps variety.js's wrapper: real animals skip its fantastic makeover
  BEAST.make = function(key, spec){
    if (!isRealAnimal(key, spec)) return _mk.call(this, key, spec);
    const n = typeof VARIETY !== 'undefined' ? VARIETY[key] : 0, P = REAL_MAKEOVER[spec.arch];
    const extra = n && P ? P[(n - 1) % P.length] : null, nm = realName(key) || key;
    let sc = 1; for (const [re, k] of REAL_SIZE) if (re.test(nm)){ sc = k; break; }
    const saved = typeof VARIETY !== 'undefined' ? VARIETY[key] : undefined; if (saved !== undefined) delete VARIETY[key];
    try { return _mk.call(this, key, {...spec, ...(extra || {}), scale:Math.min(2.2, (spec.scale || 1) * sc)}   /* never bigger than a boss */); }
    finally { if (saved !== undefined) VARIETY[key] = saved; }
  }; }
