/* VAYRATHEN — tests/data.test.js — consistency of the game data (jobs, skills, monsters, items, maps, quests).
   Runs in plain Node, no browser: `node --test tests/data.test.js`. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { load, DATA } = require('./load');

const g = load(DATA);
const JOBS = g('JOBS'), SKILLS = g('SKILLS'), MOB = g('MOB'), ITEMS = g('ITEMS'), CARDS = g('CARDS'), MAPS = g('MAPS'),
  QUESTS = g('QUESTS'), GEAR_LIST = g('GEAR_LIST'), ELEM = g('ELEM'), BOSSES = g('BOSSES');
const bad = (list, what) => assert.deepStrictEqual(list, [], what);

test('jobs: parents, next jobs and skills all exist', () => {
  const out = [];
  for (const [id, j] of Object.entries(JOBS)){
    if (j.parent && !JOBS[j.parent]) out.push(`${id}.parent → ${j.parent}`);
    for (const n of j.next || []) if (!JOBS[n]) out.push(`${id}.next → ${n}`);
    for (const n of j.next || []) if (JOBS[n] && JOBS[n].parent !== id) out.push(`${id}.next → ${n} but ${n}.parent is ${JOBS[n].parent}`);
    for (const s of j.skills || []) if (!SKILLS[s]) out.push(`${id} skill ${s} missing`);
    for (const s of j.skills || []) if (SKILLS[s] && SKILLS[s].job !== id) out.push(`${id} skill ${s} belongs to ${SKILLS[s].job}`);
    if (!j.name || !j.en) out.push(`${id} missing Thai or English name`);
    if (!j.weapon || !j.weapon.type) out.push(`${id} has no weapon type`);
  }
  bad(out);
});

test('jobs: skill points fit exactly (sum of max skill levels = Job Lv max − 1)', () => {
  const out = [];
  for (const [id, j] of Object.entries(JOBS)){
    const sum = (j.skills || []).reduce((a, s) => a + ((SKILLS[s] && SKILLS[s].max) || 0), 0);
    if (sum !== j.jobMax - 1) out.push(`${id}: skills add up to ${sum}, Job Lv max is ${j.jobMax}`);
  }
  bad(out);
});

test('skills: every skill belongs to a job that lists it and has the basics', () => {
  const out = [];
  for (const [id, sk] of Object.entries(SKILLS)){
    if (!JOBS[sk.job]) out.push(`${id}.job → ${sk.job}`);
    else if (!(JOBS[sk.job].skills || []).includes(id)) out.push(`${id} is not in ${sk.job}.skills`);
    if (!(sk.max >= 1)) out.push(`${id}.max = ${sk.max}`);
    if (!sk.name || !sk.en) out.push(`${id} missing Thai or English name`);
    if (sk.type !== 'passive' && typeof sk.sp !== 'function') out.push(`${id} has no SP cost`);
    if (sk.elem && !ELEM.includes(sk.elem)) out.push(`${id}.elem ${sk.elem}`);
    for (let lv = 1; lv <= sk.max; lv++){
      if (sk.type !== 'passive'){ const c = sk.sp(lv); if (!Number.isFinite(c) || c < 0) out.push(`${id} Lv${lv} SP cost ${c}`); }
      if (typeof sk.desc === 'function'){ try { const d = sk.desc(lv); if (typeof d !== 'string' || !d || /undefined|NaN/.test(d)) out.push(`${id} Lv${lv} desc "${d}"`); } catch (e){ out.push(`${id} Lv${lv} desc throws ${e.message}`); } }
    }
  }
  bad(out);
});

test('monsters: drops and cards point at real items, stats are sane', () => {
  const out = [];
  for (const [id, m] of Object.entries(MOB)){
    if (!m.name || !m.en) out.push(`${id} missing Thai or English name`);
    if (!(m.hp > 0)) out.push(`${id}.hp = ${m.hp}`);
    if (!(m.lvl >= 1)) out.push(`${id}.lvl = ${m.lvl}`);
    if (!Array.isArray(m.atk) || m.atk.length !== 2 || m.atk[0] > m.atk[1]) out.push(`${id}.atk = ${JSON.stringify(m.atk)}`);
    if (m.elem && !ELEM.includes(m.elem)) out.push(`${id}.elem ${m.elem}`);
    for (const d of m.drops || []){
      if (!ITEMS[d[0]]) out.push(`${id} drops unknown item ${d[0]}`);
      if (!(d[1] > 0 && d[1] <= 1)) out.push(`${id} drop ${d[0]} rate ${d[1]}`);
    }
    if (m.card && !CARDS[m.card]) out.push(`${id}.card → ${m.card}`);
    if (m.card && !(m.cardRate > 0)) out.push(`${id} has card but cardRate ${m.cardRate}`);
  }
  bad(out);
});

test('items and cards have names in both languages', () => {
  const out = [];
  for (const [id, it] of Object.entries(ITEMS)) if (!it.name || !it.en) out.push(`item ${id}`);
  for (const [id, c] of Object.entries(CARDS)){
    if (!c.name || !c.en) out.push(`card ${id}`);
    if (!Array.isArray(c.desc) || c.desc.length !== 2) out.push(`card ${id} desc`);
  }
  bad(out);
});

test('market (GEAR_LIST): every entry is an item, ids are unique', () => {
  const out = [], seen = new Set();
  for (const e of GEAR_LIST){
    if (seen.has(e[0])) out.push(`duplicate ${e[0]}`); seen.add(e[0]);
    if (!ITEMS[e[0]]) out.push(`${e[0]} not in ITEMS`);
  }
  bad(out);
});

test('maps: ids match positions, monsters and bosses exist, links are two-way', () => {
  const out = [];
  MAPS.forEach((m, i) => {
    if (m.id !== i) out.push(`MAPS[${i}].id = ${m.id}`);
    if (!m.name || !m.en) out.push(`map ${i} missing a name`);
    for (const k of m.mobs || []) if (!MOB[k]) out.push(`map ${i} spawns unknown ${k}`);
    if (m.boss && !MOB[m.boss]) out.push(`map ${i} boss ${m.boss} missing`);
    for (const [dir, to] of Object.entries(m.links || {})){
      if (!MAPS[to]){ out.push(`map ${i} ${dir} → ${to} missing`); continue; }
      const back = Object.values(MAPS[to].links || {});
      if (!back.includes(i)) out.push(`map ${i} → ${to} but ${to} has no way back`);
    }
  });
  bad(out);
});

test('every map can be reached from the town', () => {
  const seen = new Set([0]), q = [0];
  while (q.length){ const i = q.shift(); for (const to of Object.values(MAPS[i].links || {})) if (!seen.has(to)){ seen.add(to); q.push(to); } }
  bad([...MAPS].map(m => m.id).filter(i => !seen.has(i)), 'unreachable maps');
});

test('main story: every chapter targets real maps, monsters, items and bosses', () => {
  const out = [];
  for (const q of QUESTS){
    if (!MAPS[q.map]) out.push(`${q.id} map ${q.map}`);
    if (!Array.isArray(q.title) || q.title.length !== 2) out.push(`${q.id} title`);
    for (const goal of q.goals || []){
      if (!(goal.n > 0)) out.push(`${q.id} goal ${goal.k}:${goal.t} n=${goal.n}`);
      if ((goal.k === 'kill' || goal.k === 'boss') && !MOB[goal.t]) out.push(`${q.id} ${goal.k} ${goal.t} not a monster`);
      if (goal.k === 'item' && !ITEMS[goal.t]) out.push(`${q.id} item ${goal.t} not an item`);
      if (goal.k === 'kill' && MAPS[q.map] && !(MAPS[q.map].mobs || []).includes(goal.t)) out.push(`${q.id} asks to kill ${goal.t}, which does not live on map ${q.map}`);
    }
  }
  bad(out);
});

test('experience curves rise and stay finite', () => {
  const nextBase = g('nextBase'), nextJob = g('nextJob'), LV_MAX = g('LV_MAX');
  for (let L = 1; L < LV_MAX; L++){
    assert.ok(Number.isFinite(nextBase(L)) && nextBase(L + 1) > nextBase(L), `base EXP at Lv ${L}`);
    if (L < 70) assert.ok(nextJob(L + 1) > nextJob(L), `job EXP at Lv ${L}`);
  }
});

test('element table: every attack element against every defence element has a value', () => {
  const elemMod = g('elemMod'), out = [];
  for (const a of ELEM) for (const d of ELEM){ const v = elemMod(a, d); if (!Number.isFinite(v)) out.push(`${a}→${d}`); }
  bad(out);
});

test('element table: water > fire > earth > wind > water, each beats one and loses to one (v230)', () => {
  const elemMod = g('elemMod'), out = [], four = ['water', 'fire', 'earth', 'wind'];
  four.forEach((e, i) => { const prey = four[(i + 1) % 4], foe = four[(i + 3) % 4];
    if (elemMod(e, prey) !== 1.5) out.push(`${e} should beat ${prey}`); if (elemMod(prey, e) !== .5) out.push(`${prey} should be weak against ${e}`);
    const strong = four.filter(d => elemMod(e, d) > 1), weak = four.filter(d => d !== e && elemMod(e, d) < 1);
    if (strong.length !== 1) out.push(`${e} beats ${strong.length} elements`); if (weak.length !== 1) out.push(`${e} is weak against ${weak.length} other elements`); void foe; });
  bad(out);
});

test('English mode: names switch language', () => {
  const en = load(DATA, { lang: 'en' });
  assert.strictEqual(en('nm(JOBS.novice)'), JOBS.novice.en);
  assert.strictEqual(en("L('ไทย', 'English')"), 'English');
  assert.strictEqual(g("L('ไทย', 'English')"), 'ไทย');
});

test('every script parses (a stray quote breaks the whole file)', () => {
  const { execFileSync } = require('node:child_process'), fs = require('node:fs'), path = require('node:path');
  const root = path.join(__dirname, '..'), html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const bad = [];
  for (const [, src] of html.matchAll(/<script src="([^"]+\.js)"/g)){
    try { execFileSync(process.execPath, ['--check', path.join(root, src)], { stdio: 'pipe' }); } catch (e){ bad.push(src + ': ' + String(e.stderr).split('\n').slice(0, 4).join(' ')); }
  }
  assert.deepStrictEqual(bad, []);
});

/* ---------- monster identity: every monster has its own field note, names and look ---------- */
const MOB_LORE = g('MOB_LORE'), SPECIES = g('SPECIES');
const LOOKS = [...SPECIES, ...BOSSES].map(r => ({ id: r[0], arch: r[4], look: r[5] }));

test('monsters: every monster has a Thai and an English field note (MOB_LORE)', () => {
  const out = [];
  for (const id of Object.keys(MOB)){
    const l = MOB_LORE[id];
    if (!Array.isArray(l) || l.length !== 2) { out.push(`${id}: no lore`); continue; }
    if (!/[฀-๿]/.test(l[0]) || l[0].length < 40) out.push(`${id}: Thai lore missing or too short`);
    if (!/^[\x20-\x7E‐-‧]+$/.test(l[1]) || l[1].length < 40) out.push(`${id}: English lore missing, too short or not English`);
  }
  bad(out);
});

test('monsters: no two share a Thai name, an English name or a field note', () => {
  const out = [], seen = {};
  const norm = s => String(s).toLowerCase().replace(/[\s'’.,-]+/g, '');
  const once = (kind, text, id) => { const k = kind + ':' + norm(text); if (seen[k]) out.push(`${kind} "${text}": ${seen[k]} / ${id}`); else seen[k] = id; };
  for (const [id, m] of Object.entries(MOB)){ once('th', m.name, id); once('en', m.en, id); }
  for (const [id, l] of Object.entries(MOB_LORE)){ once('loreTH', l[0], id); once('loreEN', l[1], id); }
  bad(out);
});

/* signature = archetype + every look key, colours lower-cased; "near" = differs in fewer than 2 features
   (a colour only counts as different when one channel moves by more than 40, a number by more than .15) */
const isCol = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v), rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), on = v => v != null && v !== false;
const sig = ({ arch, look }) => arch + JSON.stringify(Object.keys(look).filter(k => on(look[k])).sort().map(k => [k, isCol(look[k]) ? look[k].toLowerCase() : look[k]]));
function lookDiff(a, b){
  let n = 0;
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])){ const x = a[k], y = b[k];
    if (!on(x) && !on(y)) continue;
    if (isCol(x) && isCol(y)){ const p = rgb(x), q = rgb(y); if (p.some((v, i) => Math.abs(v - q[i]) > 40)) n++; }
    else if (typeof x === 'number' || typeof y === 'number'){ if (Math.abs((x ?? 1) - (y ?? 1)) > .15) n++; }
    else if (x !== y) n++; }
  return n;
}
test('monsters: no two share an archetype + look signature, and none are near-copies', () => {
  const out = [], seen = {};
  for (const m of LOOKS){ const s = sig(m); if (seen[s]) out.push(`same look: ${seen[s]} / ${m.id}`); else seen[s] = m.id; }
  for (let i = 0; i < LOOKS.length; i++) for (let j = i + 1; j < LOOKS.length; j++){ const a = LOOKS[i], b = LOOKS[j];
    if (a.arch === b.arch && lookDiff(a.look, b.look) < 2) out.push(`near-copy (${a.arch}): ${a.id} ~ ${b.id}`); }
  bad(out);
});

/* cooking and brewing (sys/cooking.js): the data half runs here without a browser */
test('cooking & brewing: every recipe\'s materials and results exist, and every monster material has a use', () => {
  const fs = require('node:fs'), path = require('node:path'), c = load(DATA);
  const src = fs.readFileSync(path.join(__dirname, '..', 'js/sys/cooking.js'), 'utf8');
  c(src.slice(0, src.indexOf('/* ---------- runtime ---------- */')));
  const R = c('CK_RCP'), IT = c('ITEMS'), M = c('MOB'), out = [], used = new Set();
  assert.ok(R.filter(r => r.who === 'cook').length >= 24, 'the cook has a full menu');
  assert.ok(R.filter(r => r.who === 'apo').length >= 24, 'the herbalist has a full shelf');
  for (const r of R){
    if (!IT[r.out]) out.push(`${r.id}: result ${r.out} missing`);
    if (!(r.fee > 0) || !(r.n >= 1)) out.push(`${r.id}: fee ${r.fee} · makes ${r.n}`);
    if (!r.need.length) out.push(`${r.id}: needs nothing`);
    for (const q of r.need){ if (!q.ids || !q.ids.length || !(q.n >= 1)) out.push(`${r.id}: empty need ${q.k}`);
      for (const id of q.ids || []){ if (!IT[id]) out.push(`${r.id}: material ${id} missing`); used.add(id); } }
    const it = IT[r.out];
    if (r.id.startsWith('ck_') || r.id.startsWith('ap_') && !r.id.startsWith('ap_brew_')){
      if (r.who === 'cook' && !(it.food && it.food.t > 0)) out.push(`${r.id}: a dish without a food buff`);
      if (r.who === 'apo' && !(it.tonic && it.tonic.t > 0)) out.push(`${r.id}: a tonic without a buff`);
      if (!it.name || !it.en || !it.desc) out.push(`${r.id}: missing Thai/English name or description`);
    }
  }
  for (const k in M) if (!M[k].boss && IT['m_' + k] && !used.has('m_' + k)) out.push(`m_${k} (${k}) is never used`);
  bad(out);
  // buffs grow with the band
  const atk = R.filter(r => /^ck_meat\d$/.test(r.id)).map(r => IT[r.out].food.atkPct);
  assert.ok(atk.every((v, i) => !i || v > atk[i - 1]), 'meat dishes get stronger band by band');
  // potions moved from the Crafting window: brewed only here
  for (const p of ['redpot', 'bluepot', 'orangepot', 'whitepot', 'elixirpot', 'talisman']) assert.ok(R.some(r => r.out === p), `${p} is brewed by the herbalist`);
});
