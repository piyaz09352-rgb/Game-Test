/* VAYRATHEN — js/sys/skill5_209.js — (v209) every class has exactly 5 skills a tier (docs/PROPOSAL_5SKILLS.md, the
   owner said go). The counts were uneven (ninja 15 · hunter 16 · mage 22 · the rest 23–24) and the owner found them too
   many. Each tier keeps 1 passive · 1 buff or support · 3 attacks, keeping the reworked skills and the line signatures.
   The hunter's Spike Trap moves to the Warden and the ninja's Star Rain to the Shinobi so those tiers reach five.
   Points in a skill that is gone come back to spend again. */
'use strict';
const SK5 = {
  blade:['swordmastery', 'warcry', 'waveslash', 'charge', 'quake'],
  warlord:['warpath', 'goldshield', 'earthsplit', 'bladestorm', 'tuskcharge'],
  bulwark:['peerless', 'shieldbash', 'judgement', 'warking', 'warbanner'],
  rune:['focus', 'barrier', 'firebolt', 'icebolt', 'thunder'],
  astro:['astrowisdom', 'starveil', 'meteor', 'gravity', 'starstep'],
  archsage:['fourelements', 'cataclysm', 'deluge', 'tempest', 'earthswallow'],
  ranger:['hawkeye', 'hunterfocus', 'doubleshot', 'arrowrain', 'backstep'],
  warden:['mountedarcher', 'wildkin', 'deadeye', 'pierce', 'spiketrap'],
  sylvan:['forestblood', 'packcall', 'eaglearrow', 'stormvolley', 'rootsnare'],
  muay:['muaymastery', 'waikhru', 'combo', 'roundkick', 'flyingknee'],
  grandmaster:['thousandfists', 'ramwai', 'crocodile', 'hanuman', 'grabthrow'],
  ringlord:['kardchuek', 'drumrally', 'finisher', 'kneeclinch', 'nakmuay'],
  healer:['herbalism', 'herbheal', 'herbdart', 'thread', 'holywater'],   // (v209) Herbal Dart kept over Antidote: one attack alone left the first tier far behind
  physician:['royaltext', 'elixir', 'revive', 'holycircle', 'divinewrath'],
  divinehealer:['divinehand', 'amrita', 'blessing', 'holylight', 'judgment'],
  rogue:['dualwield', 'thiefsense', 'backstab', 'shadowlunge', 'smokebomb'],
  bandit:['tigerheart', 'venomblade', 'assassinate', 'knifevolley', 'shadowstep'],
  tigershade:['tigerfang', 'thousandcuts', 'deathmark', 'tigerpounce', 'shadowexec'],
  summoner:['sumlore', 'soulpact', 'callsingha', 'callnaga', 'spiritburst'],
  sovereign:['sovlore', 'unity', 'callgaruda', 'callerawan', 'goldenhong'],
  himmaemperor:['emperorgrace', 'royaledict', 'kaisorn', 'himmapanlord', 'heavenfall'],
  occult:['darklore', 'spiritward', 'curse', 'voodoo', 'darkbolt'],
  shaman:['nightmind', 'sleephex', 'plaguecurse', 'lifedrain', 'grimreap'],
  hexlord:['hexmastery', 'masshex', 'doomcurse', 'abyssgate', 'shadowlance'],
  merchant:['axemastery', 'merchantcry', 'cleavestrike', 'axewhirl', 'coinbash'],
  tradelord:['bigaxe', 'tradewind', 'axestorm', 'goldrush', 'debtcollect'],
  tycoon:['tycoonaxe', 'goldbody', 'goldenarc', 'midasstrike', 'coinstorm'],
  catfolk:['catreflex', 'purr', 'scratch', 'pounce', 'tailwhip'],
  lynx:['wildclaws', 'cuteface', 'furyswipe', 'moonpounce', 'catcyclone'],
  catqueen:['royalclaws', 'hunterinstinct', 'thousandscratch', 'starpounce', 'royalcharm'],
  dogfolk:['loyalheart', 'shieldwall', 'howl', 'bite', 'guardbark'],
  houndknight:['guardianpaw', 'ironfur', 'packhowl', 'crunch', 'fangspin'],
  bangkaew:['bangkaewblood', 'guardianangel', 'kingfang', 'wolfstorm', 'lunarhowl'],
  ninja:['shinobiway', 'smokescreen', 'quickslash', 'katon', 'suiton'],
  shinobi:['bladeart', 'kagebunshin', 'fuuton', 'shurikenstorm', 'kunairain'],
  kage:['kagemastery', 'thousandshadows', 'shadowflash', 'kirin', 'silentkill']
};
const SK5_KEEP = new Set(Object.values(SK5).flat());
const SK5_GONE = [];
for (const [job, ids] of Object.entries(SK5)){ if (!JOBS[job]) continue;
  for (const id of JOBS[job].skills || []) if (!SK5_KEEP.has(id)) SK5_GONE.push(id);
  const ok = ids.filter(id => SKILLS[id]);
  for (const id of ok){ const s = SKILLS[id]; if (s.job !== job){ s.job = job; s.req = undefined; } }   // the two that move tier
  JOBS[job].skills = ok;
  if (typeof SK8 !== 'undefined' && SK8[job]){ const st = id => (typeof SK8_OF !== 'undefined' && SK8_OF[id]) || 'c';
    SK8[job] = {a:ok.filter(id => st(id) === 'a'), b:ok.filter(id => st(id) === 'b'), c:ok.filter(id => !['a', 'b'].includes(st(id)))}; }
}
// prerequisites only on skills still in the same tier
for (const job of Object.keys(SK5)){ for (const id of (JOBS[job] && JOBS[job].skills) || []){ const s = SKILLS[id]; if (!s.req) continue;
  for (const q of Object.keys(s.req)) if (!JOBS[job].skills.includes(q)) delete s.req[q]; if (!Object.keys(s.req).length) s.req = undefined; } }
function sk5Refund(){ if (!S || !S.skills) return; let n = 0;
  for (const id of Object.keys(S.skills)){ const s = SKILLS[id]; if (!s || SK5_KEEP.has(id) || !SK5_GONE.includes(id)) continue; n += S.skills[id] | 0; delete S.skills[id]; }
  if (Array.isArray(S.hot)) S.hot = S.hot.map(h => (typeof h === 'string' && SK5_GONE.includes(h) ? null : h));
  if (n){ S.skPts = (S.skPts || 0) + n; derive(); dirty = true; if (typeof renderHotbar === 'function') renderHotbar();
    if (typeof log === 'function') log(L(`ทุกอาชีพเหลือ 5 สกิลต่อขั้น: คืน ${n} แต้มสกิลจากสกิลที่ถูกนำออก`, `Every class now has 5 skills a tier: ${n} skill points returned from removed skills`), 'g'); } }
EV.on('tick', () => { if ((sk5Refund.t = (sk5Refund.t || 0) + 1) % 30 === 0) sk5Refund(); });
{ const _d0 = derive; derive = function(){ if (S && S.skills && !sk5Refund.busy && SK5_GONE.some(id => S.skills[id])){ sk5Refund.busy = 1; try { sk5Refund(); } finally { sk5Refund.busy = 0; } } return _d0.apply(this, arguments); }; }
