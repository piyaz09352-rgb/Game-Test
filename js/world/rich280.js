/* VAYRATHEN — js/world/rich280.js — (v280) every hunting map as full as the first ones
   The owner: the early maps (thick trees, ponds with lilies, palms, flowers) look rich; many later ones were a flat
   ground with a few things on it — "มาตรฐานอยู่ไหน". Measured: the early forests place 110–150 props with trees as
   the main piece and two ponds; deserts, canyons, heavens, glaciers, lava and demon lands placed 70–100, often with no
   tree at all and no water. This brings every land up to the same standard, in its own style:
   · at least 140 props, with the land's own big tree as the main piece (palms in the desert, pines on the ice,
     bodhi-like heaven trees in the heavens, dead and thorn trees on lava and in the demon lands);
   · at least two ponds or pools (the land's own water: lilies, ice, lava) — caves and the sea keep theirs;
   · lands with grass get flower patches and more bushes;
   · the Ancient Amber Fen loses the bog band that cut the map in two (pools instead).
   Towns, camps, the tower and dungeons are untouched. Runs once at load, before any map is built. */
'use strict';
{ const TREEY = new Set(['tree', 'palm', 'pine', 'himtree', 'bamboo', 'banana', 'treefern', 'araucaria', 'deadtree', 'thorntree', 'cycad']);
  const BIG = {desert:'palm', dryplain:'palm', canyon:'deadtree', glacier:'pine', frostcitadel:'pine', frozenlake:'pine', kailash:'pine', meru:'himtree', tavatimsa:'himtree', anodat:'himtree',
    lavafield:'deadtree', crater:'deadtree', ashforest:'deadtree', dragonvale:'deadtree', dragonroost:'araucaria', naraka:'thorntree', demonthrone:'thorntree', badan:null, cave:null, icecave:null,
    beach:'palm', isle:'palm', khmer:'tree', ayodhya:'tree', templeruins:'tree', cemetery:'deadtree', laplae:'tree', floatmarket:'palm', himmapan:'himtree', innerhim:'himtree'};
  const SKIP = new Set(['fields', 'oasis', 'town', 'tower', 'dungeon']);
  const SNOWY = new Set(['glacier', 'frostcitadel', 'frozenlake', 'kailash', 'icecave', 'snowpeak', 'tundra']);
  const MIX = {desert:['palm', 'cycad', 'deadtree'], dryplain:['palm', 'cycad', 'tree'], canyon:['deadtree', 'thorntree', 'cycad'],
    glacier:['pine', 'araucaria', 'deadtree'], frostcitadel:['pine', 'araucaria', 'deadtree'], frozenlake:['pine', 'deadtree', 'araucaria'], kailash:['pine', 'araucaria', 'himtree'],
    meru:['himtree', 'tree', 'treefern'], tavatimsa:['himtree', 'tree', 'banana'], anodat:['himtree', 'treefern', 'tree'], himmapan:['himtree', 'tree', 'bamboo'], innerhim:['himtree', 'treefern', 'deadtree'],
    lavafield:['deadtree', 'thorntree', 'araucaria'], crater:['deadtree', 'thorntree'], ashforest:['deadtree', 'thorntree', 'araucaria'], dragonvale:['deadtree', 'araucaria', 'treefern'], dragonroost:['araucaria', 'deadtree', 'treefern'],
    naraka:['thorntree', 'deadtree'], demonthrone:['thorntree', 'deadtree'], beach:['palm', 'banana', 'tree'], isle:['palm', 'banana', 'treefern'], floatmarket:['palm', 'banana', 'tree'],
    khmer:['tree', 'banana', 'palm', 'bamboo'], ayodhya:['tree', 'palm', 'banana'], templeruins:['tree', 'bamboo', 'banana', 'treefern'], laplae:['tree', 'bamboo', 'banana'], cemetery:['deadtree', 'tree', 'thorntree'],
    highland:['pine', 'tree', 'araucaria', 'bamboo'], bamboo:['bamboo', 'tree', 'banana'], marsh:['tree', 'banana', 'treefern'], river:['tree', 'palm', 'banana', 'bamboo'], cave:[], icecave:[], badan:[]};
  function treeMix(k, B){
    if (typeof PROP_TYPES !== 'undefined' && Array.isArray(B.props)){
      const mix = (MIX[k] || []).filter(t => PROP_TYPES[t]); const trees = () => B.props.filter(p => TREEY.has(p[0]) && PROP_TYPES[p[0]]);
      const tw = trees().reduce((a, p) => a + p[1], 0);
      for (const t of mix) if (!B.props.some(p => p[0] === t)) B.props.push([t, Math.max(1, Math.round(tw * .2)), 8]);
      const tw2 = trees().reduce((a, p) => a + p[1], 0);
      const each = Math.max(1, Math.round(tw2 / Math.max(1, trees().length)));   // every tree kind the same share
      for (const p of trees()){ p[1] = each; p[2] = Math.max(p[2] || 1, 8);
        if (p[0] === 'pine' && !SNOWY.has(k)) p[3] = 'green'; }
    }
    // (v286) composed maps (props4.js zones) plant their edge belt, groves and scatter from their own lists: every tree
    // kind in a list (the land's own and its mix) gets the same share, with 8 shapes each
    if (B.zones) for (const part of ['edge', 'groves', 'scatter', 'banks']){ const Zp = B.zones[part]; if (!Zp || !Array.isArray(Zp.props)) continue;
      const L = Zp.props.map(t => (Array.isArray(t) ? [t[0], t[1]] : [t, 4])), cnt = {};
      for (const [nm] of L) if (TREEY.has(nm)) cnt[nm] = (cnt[nm] || 0) + 1;
      if (!Object.keys(cnt).length || part === 'banks') { Zp.props = L; continue; }
      for (const t of MIX[k] || []) if (PROP_TYPES[t] && !cnt[t]) cnt[t] = 0;
      const top = Math.max(...Object.values(cnt));
      for (const nm in cnt) for (let i = cnt[nm]; i < top; i++) L.push([nm, 8]);
      for (const e of L) if (TREEY.has(e[0])) e[1] = Math.max(e[1], 8);
      Zp.props = L; }
  }
  MIX.oasis = ['palm', 'cycad', 'banana'];
  for (const [k, B] of Object.entries(typeof BIOME !== 'undefined' ? BIOME : {})){
    if (B && k === 'oasis' && Array.isArray(B.props)){ B.props = B.props.map(p => p.slice()); treeMix(k, B); }
    if (!B || SKIP.has(k) || !Array.isArray(B.props)) continue;
    B.props = B.props.map(p => p.slice());
    const big = BIG[k];
    if (big && typeof PROP_TYPES !== 'undefined' && PROP_TYPES[big]){
      const row = B.props.find(p => p[0] === big), tw = B.props.filter(p => TREEY.has(p[0])).reduce((a, p) => a + p[1], 0), all = B.props.reduce((a, p) => a + p[1], 0);
      if (tw < all * .4){ if (row){ row[1] = Math.max(row[1], Math.ceil(all * .45)); row[2] = Math.max(row[2] || 1, 3); } else B.props.push([big, Math.ceil(all * .45), 3]); } }
    if (B.blades){ const bush = B.props.find(p => p[0] === 'bush'); if (bush) bush[1] += 2; else if (PROP_TYPES.bush) B.props.push(['bush', 3, 3]); B.flowerN = Math.max(B.flowerN || 0, 450); }
    B.propN = Math.max(B.propN || 0, 140);
    // (v286) the owner: "the same tree over and over". The land's big tree had 45 % of every prop with only 3 shapes.
    // Now its share is split over a mix of trees that belong in that land, no one kind is more than 40 % of the trees,
    // no kind outnumbers another, and every tree kind has 8 shapes (pines in green lands only take the green ones, the odd shapes are snowy)
    treeMix(k, B);
    // (v280) the Ancient Amber Fen: a bog band ran the full width of the map and cut it in two (both gates on its bank).
    // The fen is now pools of amber and bog water spread over the land instead
    if (k === 'amberfen' && B.band){ delete B.band; B.ponds = Math.max(B.ponds || 0, 7); B.pondR = [70, 140]; }
    if (!['cave', 'icecave', 'badan', 'beach'].includes(k)) B.ponds = Math.max(B.ponds || 0, 2);
  }
}

/* (v280) the owner: no crocodiles at all. They look like monitor lizards now (data/world3.js w3Look) and are called monitors; their ids
   stay, so quests and saves that name them still work */
for (const k in MOB){ const d = MOB[k]; if (!d || typeof d.name !== 'string') continue;
  if (d.name.includes('จระเข้')) d.name = d.name.replace('จระเข้', 'ตะกวด');
  if (typeof d.en === 'string' && /Crocodile/.test(d.en)) d.en = d.en.replace('Crocodile', 'Monitor'); }
