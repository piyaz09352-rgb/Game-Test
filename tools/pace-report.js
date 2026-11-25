/* VAYRATHEN — tools/pace-report.js — (v346) how long each class takes to level, from the balance measurements
   Reads docs/balance-rows.json (EXP per minute measured by tools/balance-report.js with Auto hunting a map of its level,
   Lv 15 / 45 / 80 / 115) and the EXP curve (nextBase, js/data/items.js). Between measured levels EXP per minute is
   interpolated (log scale); outside them it is carried at the nearest measurement's rate, scaled by how the monsters' EXP
   grows with level. Writes docs/PACE.md: hours of plain hunting per level band, for each class, and the slowest band.
   Plain hunting only — quests, bounties, party bonus and events make every band faster for every class alike.
   Usage: node tools/pace-report.js        (after a balance run) */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const nextBase = L => Math.floor(9 * Math.pow(L, 1.8) + 6);
{ const src = fs.readFileSync(path.join(ROOT, 'js/data/items.js'), 'utf8'), m = src.match(/const nextBase = L => (.+);/);
  if (!m || !/9 \* Math\.pow\(L, 1\.8\) \+ 6/.test(m[1])) throw new Error('nextBase changed in js/data/items.js — update tools/pace-report.js'); }
const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance-rows.json'), 'utf8'));
const BANDS = [[1, 15], [15, 45], [45, 80], [80, 115], [115, 150], [150, 200]];
const lines = {};
for (const r of rows) if (r.expPm > 0) (lines[r.line] = lines[r.line] || {name:r.lineName, pts:[]}).pts.push([r.lv, r.expPm]);
const rate = (pts, L) => { pts = pts.slice().sort((a, b) => a[0] - b[0]);
  if (L <= pts[0][0]) return pts[0][1] * Math.pow(Math.max(1, L) / pts[0][0], 1.1);
  const last = pts[pts.length - 1]; if (L >= last[0]) return last[1] * Math.pow(L / last[0], 1.1);
  for (let i = 1; i < pts.length; i++) if (L <= pts[i][0]){ const [a, ea] = pts[i - 1], [b, eb] = pts[i], t = (L - a) / (b - a); return Math.exp(Math.log(ea) + (Math.log(eb) - Math.log(ea)) * t); } };
const out = [];
for (const [k, v] of Object.entries(lines)){ const h = BANDS.map(([a, b]) => { let m = 0; for (let L = a; L < b; L++) m += nextBase(L) / rate(v.pts, L); return m / 60; });
  out.push({k, name:v.name, h, tot:h.reduce((s, x) => s + x, 0)}); }
out.sort((a, b) => a.tot - b.tot);
const avg = BANDS.map((_, i) => out.reduce((s, r) => s + r.h[i], 0) / out.length);
const f = x => x < 10 ? x.toFixed(1) : Math.round(x).toString();
let md = `# VAYRATHEN — leveling pace (hours of plain hunting)\n\nFrom docs/balance-rows.json (Auto, a map of its level, EXP/min measured at Lv 15/45/80/115) and the EXP curve. ` +
  `Quests, bounties, party and events are not counted. A cell more than 25% slower than the average for its band is **bold**.\n\n` +
  `| สาย | ${BANDS.map(([a, b]) => `Lv ${a}–${b}`).join(' | ')} | รวม 1–200 |\n|${'---|'.repeat(BANDS.length + 2)}\n`;
for (const r of out) md += `| ${r.name} | ${r.h.map((x, i) => x > avg[i] * 1.25 ? `**${f(x)}**` : f(x)).join(' | ')} | ${f(r.tot)} |\n`;
md += `| *เฉลี่ย* | ${avg.map(f).join(' | ')} | ${f(avg.reduce((s, x) => s + x, 0))} |\n`;
fs.writeFileSync(path.join(ROOT, 'docs/PACE.md'), md); console.log(md);
