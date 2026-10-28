/* VAYRATHEN — js/ui/icons.js
   Skill and item icons for the hotbar, skill window and MOBA buttons: a lacquer tile tinted by element with a
   gold ring and a glyph chosen from what the skill does (fist, sword, arrow, flame, snowflake, lightning…). */
'use strict';

const ICON_EL = {fire:['#ff8a3a', '#7a1a0c'], water:['#6cc6ff', '#0f3a6a'], wind:['#8af0c0', '#0f4a3a'], earth:['#e0b060', '#4a2e10'],
  holy:['#fff0a0', '#7a5a10'], shadow:['#c08aff', '#2e1450'], neutral:['#f0d8a0', '#4a2a18'], heal:['#9fe8a0', '#14402a'], poison:['#b8e06a', '#2e4010']};
const GLYPH = {
  fist:'<path d="M12 22v-6.5a2 2 0 014 0V14a2 2 0 014 0v1a2 2 0 014 0v2a2 2 0 014 0v6c0 4-3 7-7.5 7S12 26.5 12 22z"/>',
  kick:'<path d="M11 9l6 9 4 1 8 6c1.5 1 1 3.4-1 3.4h-9.5L13 20 8.5 12z"/>',
  sword:'<path d="M28 8l-12 12m12-12h-4m4 0v4M16 20l-3-3m3 3l-3 3m0-6l-5 5m-.5 3.5l2.5-2.5"/>',
  dagger:'<path d="M27 9L16 20m0 0l-2.5-2.5M16 20l2.5 2.5M14.5 21.5l-5 5M27 9l-3 .5m3-.5l-.5 3"/><path d="M11 29l2-2"/>',
  arrow:'<path d="M9 31L29 11m0 0h-6m6 0v6M9 31l2.5-.5M9 31l.5-2.5M13 27l-3-1m3 1l1 3"/>',
  flame:'<path d="M20 31c-5 0-8-3.4-8-7.6 0-4.6 4-6.4 3.6-11.4 3 2 4 4.2 3.6 6.6 1.4-1 2.2-3 2-5.2 3.4 2.6 6.8 6.2 6.8 10.4C28 28 24.6 31 20 31z"/><path d="M20 31c-2 0-3.2-1.4-3.2-3.2 0-2 1.6-2.8 1.6-4.8 2.4 1.2 4.8 2.8 4.8 5 0 1.8-1.4 3-3.2 3z"/>',
  snow:'<path d="M20 8v24M9.6 14l20.8 12M9.6 26L30.4 14M20 8l-2.6 2.6M20 8l2.6 2.6M20 32l-2.6-2.6M20 32l2.6-2.6"/>',
  bolt:'<path d="M22 7l-9 14h6.5L17 33l10-15h-6.5z"/>',
  sun:'<circle cx="20" cy="20" r="5"/><path d="M20 8v4M20 28v4M8 20h4M28 20h4M11.5 11.5l2.8 2.8M25.7 25.7l2.8 2.8M11.5 28.5l2.8-2.8M25.7 14.3l2.8-2.8"/>',
  meteor:'<circle cx="24" cy="24" r="5"/><path d="M8 8l12 12M12 7l10 10M7 12l10 10"/>',
  heal:'<path d="M17 9h6v8h8v6h-8v8h-6v-8H9v-6h8z"/>',
  leaf:'<path d="M10 30c0-12 7-19 20-20-1 13-8 20-20 20z"/><path d="M10 30l11-11"/>',
  shield:'<path d="M20 7l10 4v7c0 7-4.4 11.4-10 14-5.6-2.6-10-7-10-14v-7z"/>',
  lotus:'<path d="M20 30c-4-3-6-7-6-11 3 1 5 3 6 6 1-3 3-5 6-6 0 4-2 8-6 11z"/><path d="M20 25c-2-4-2-9 0-14 2 5 2 10 0 14zM9 22c3 0 6 2 8 6M31 22c-3 0-6 2-8 6"/>',
  eye:'<path d="M7 20s5-8 13-8 13 8 13 8-5 8-13 8-13-8-13-8z"/><circle cx="20" cy="20" r="3.5"/>',
  spike:'<path d="M8 30h24M11 30l4-12 4 12M19 30l4-14 4 14M27 30l2-7 2 7"/>',
  paw:'<circle cx="13" cy="15" r="2.6"/><circle cx="20" cy="11.5" r="2.6"/><circle cx="27" cy="15" r="2.6"/><path d="M13 26c0-4.6 3.2-8 7-8s7 3.4 7 8c0 3-3 4.4-7 3-4 1.4-7 0-7-3z"/>',
  mask:'<path d="M8 15c4-3 20-3 24 0-1 8-5 12-12 12S9 23 8 15z"/><path d="M13 18l4 2M27 18l-4 2"/>',
  coin:'<ellipse cx="20" cy="20" rx="9" ry="9"/><path d="M20 14v12M16.5 17c0-1.6 1.6-2.4 3.5-2.4s3.5.8 3.5 2.2-1.6 2-3.5 2.4-3.5 1-3.5 2.4 1.6 2.4 3.5 2.4 3.5-.8 3.5-2.4"/>',
  swirl:'<path d="M20 20c0-2 2-3 3.5-2s1.5 4.5-1.5 5.5-6.5-1-6.5-4.5S19 12 23 12.5s7.5 4.5 6.5 9-6 8-11 7-9-6-8-11"/>',
  drop:'<path d="M20 8c5 7 8 11 8 15a8 8 0 01-16 0c0-4 3-8 8-15z"/><path d="M17 24a3 3 0 003 3"/>',
  crack:'<path d="M7 28h26M20 28l-3-6 4-3-3-6 3-5M20 28l5-4 2 4M14 28l-3-3"/>',
  shout:'<path d="M12 16v8l6 4V12zM22 15c2 1.4 2 8.6 0 10M25.5 12c4 3 4 13 0 16M29 9c5.6 4.6 5.6 17.4 0 22"/>',
  spiral:'<path d="M20 9l3 8-3 3-3-3zM31 20l-8 3-3-3 3-3zM20 31l-3-8 3-3 3 3zM9 20l8-3 3 3-3 3z"/>',
  web:'<path d="M20 8v24M8 20h24M11.5 11.5l17 17M28.5 11.5l-17 17"/><path d="M20 13l5 2 2 5-2 5-5 2-5-2-2-5 2-5z"/>',
  pot:'<path d="M17 8h6M17.5 8v5L12 22a8 8 0 1016 0l-5.5-9V8"/><path d="M13 23h14a7 7 0 01-14 0z"/>',
  scroll:'<path d="M12 9h14a3 3 0 013 3v16a3 3 0 01-3 3H14"/><path d="M12 9a3 3 0 00-3 3v2h6v-2a3 3 0 00-3-3z"/><path d="M15 14v14a3 3 0 01-6 0"/><path d="M18 16h7M18 20h7M18 24h5"/>',
  armor:'<path d="M14 8l-6 4 2 6 3-1v14h14V17l3 1 2-6-6-4c-1 2.6-3.2 4-6 4s-5-1.4-6-4z"/><path d="M20 16v15"/>',
  helm:'<path d="M9 25c0-7 5-13 11-13s11 6 11 13z"/><path d="M8 25h24v4H8zM20 12V7M17 7h6"/><path d="M14 20h12"/>',
  ore:'<path d="M10 26l4-11 9-4 7 7-2 10-11 3z"/><path d="M14 15l6 6 10-3M20 21l-1 10"/>',
  bundle:'<path d="M11 15h18l-2 15H13z"/><path d="M15 15c0-3 2-6 5-6s5 3 5 6"/><path d="M17 20l6 0"/>',
  card:'<rect x="11" y="7" width="18" height="26" rx="2.5"/><path d="M15 12h10v9H15zM15 25h10M15 28h7"/>',
  gem:'<path d="M12 14l4-5h8l4 5-8 17z"/><path d="M12 14h16M16 9l4 22 4-22"/>',
  bird:'<path d="M7 21c6 0 9-4 12-11 1 5 4 8 11 8-3 3-7 4-11 4l-2.6 7.4L15 23c-3 0-5.6-.6-8-2z"/><path d="M21 13.6l-.1.1"/>',
  elephant:'<path d="M10 29v-9c0-6 4.4-10 10-10s10 4 10 10v9h-4.4v-5h-3.4v5h-4.4v-5h-3.4v5z"/><path d="M10 20c-3 .4-4.4 3-4 6.4.2 1.6 1.4 2.4 2.6 2"/><path d="M24 16.4l.1.1"/>',
  tiger:'<path d="M9 16l4-6 4 4h6l4-4 4 6-2 10-9 6-9-6z"/><path d="M15 19l2 1M25 19l-2 1M18 24h4l-2 2z"/>'
};
function skillGlyph(sk){
  const a = sk.act || '', t = sk.type, fx = sk.fx || '';
  if (t === 'heal') return sk.elem === 'holy' ? 'sun' : 'heal';
  if (t === 'restore') return 'drop';
  if (['punch', 'flurry', 'uppercut'].includes(a) || fx === 'punch') return 'fist';
  if (['kick', 'spinkick', 'teep', 'knee'].includes(a)) return 'kick';
  if (a === 'wai' || a === 'ramwai') return 'lotus';
  if (a === 'whistle') return fx === 'tiger' || sk.type === 'summon' ? 'tiger' : 'paw';
  if (sk.type === 'conjure') return {singha:'tiger', naga:'swirl', kinnaree:'lotus', garuda:'bird', erawan:'elephant'}[sk.beast] || 'paw';
  if (sk.type === 'command') return 'shout';
  if (sk.type === 'bond') return 'web';
  if (fx === 'himmagate') return 'sun'; if (fx === 'spiritburst') return 'spiral';
  if (a === 'crouch') return 'mask'; if (a === 'snatch' || t === 'steal') return 'coin';
  if (a === 'settrap') return 'spike'; if (a === 'heave') return 'web'; if (a === 'shout') return 'shout';
  if (a === 'whirl') return 'spiral'; if (a === 'slam' || fx === 'quake') return 'crack'; if (a === 'guard') return 'shield';
  if (t === 'blink' || t === 'backstep') return 'swirl';
  if (a === 'stab') return 'dagger';
  if (fx === 'meteor' || fx === 'firerain') return 'meteor';
  if (sk.elem === 'fire') return 'flame'; if (sk.elem === 'water') return 'snow'; if (sk.elem === 'wind' && sk.magic) return 'bolt'; if (sk.elem === 'holy') return 'sun';
  if (t === 'ranged' || a === 'aimup' || fx === 'arrow' || fx === 'pierce' || fx === 'poison' && !sk.magic) return 'arrow';
  if (t === 'buff') return 'shield'; if (t === 'debuff') return 'eye'; if (t === 'trap') return 'spike';
  if (t === 'stone' || fx === 'dart') return 'dagger';
  if (t === 'passive') return sk.pas && /atk|crit|dbl/i.test(Object.keys(sk.pas(1) || {}).join()) ? 'sword' : 'leaf';
  return 'sword';
}
function iconSvg(glyph, el){
  const [hi, lo] = ICON_EL[el] || ICON_EL.neutral, id = 'g' + glyph + el;
  return `<svg class="sico" viewBox="0 0 40 40" aria-hidden="true"><defs><radialGradient id="${id}" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="${hi}" stop-opacity=".55"/><stop offset="1" stop-color="${lo}"/></radialGradient></defs>
    <rect x="1.5" y="1.5" width="37" height="37" rx="8" fill="url(#${id})" stroke="#e3b04b" stroke-width="1.4"/><rect x="4" y="4" width="32" height="32" rx="6" fill="none" stroke="rgba(255,236,170,.25)"/>
    <g fill="none" stroke="#fff8e0" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 2px ${hi})">${GLYPH[glyph] || GLYPH.sword}</g></svg>`;
}
const skillIcon = id => { const sk = SKILLS[id]; return iconSvg(skillGlyph(sk), sk.type === 'heal' ? 'heal' : sk.fx === 'poison' || sk.fx === 'poisonblade' || sk.fx === 'smokeCloud' ? 'poison' : sk.elem || 'neutral'); };
const ETC_EL = ['earth', 'wind', 'water', 'fire', 'shadow', 'holy', 'neutral', 'poison'];
const itemIcon = id => (typeof itemArt === 'function' ? itemArt(id) : itemGlyph(id));
const itemGlyph = id => { const it = ITEMS[id] || {};
  if (it.kind === 'use') return it.recall ? iconSvg('scroll', 'holy') : iconSvg('pot', it.spheal ? 'water' : id === 'elixirpot' ? 'holy' : id === 'whitepot' ? 'neutral' : id === 'orangepot' ? 'earth' : 'fire');
  if (it.kind === 'ammo' && it.st && it.st.star) return iconSvg(GLYPH.star ? 'star' : 'spike', it.st.elem || 'neutral');
  if (it.kind === 'ammo') return iconSvg('arrow', (it.st && it.st.elem) || 'neutral');
  if (it.kind === 'gear'){ const tier = it.lv >= 100 ? 'holy' : it.lv >= 75 ? 'shadow' : it.lv >= 50 ? 'fire' : it.lv >= 25 ? 'water' : 'neutral';
    if (it.slot === 'weapon') return iconSvg({sword:'sword', dagger:'dagger', staff:'meteor', fist:'fist', bow:'arrow', shuriken:GLYPH.star ? 'star' : 'spike'}[it.wtype] || 'sword', tier);
    if (it.slot === 'acc') return iconSvg('gem', tier);
    return iconSvg(it.slot === 'head' ? 'helm' : 'armor', tier); }
  if (it.kind === 'mat') return iconSvg('ore', 'water');
  if (id === 'shard') return iconSvg('gem', 'water');
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return iconSvg(it.sell >= 1000 ? 'gem' : 'bundle', ETC_EL[Math.abs(h) % ETC_EL.length]); };
const cardIcon = () => iconSvg('card', 'holy');
