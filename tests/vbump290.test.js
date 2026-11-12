/* VAYRATHEN — tests/vbump290.test.js — (v290) a changed file always gets a new ?v=
   Browsers keep a script or stylesheet as long as its ?v= in index.html stays the same. v290 changed js/data/items.js
   (the stat cap removal) but not its ?v=, so every player kept the cap. This compares each file with
   tools/asset-manifest.json (written by `node tools/asset-manifest.js` after the versions are bumped). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs');
const { scan, file } = require('../tools/asset-manifest.js');

test('every changed script and stylesheet has a new ?v=', () => {
  const saved = JSON.parse(fs.readFileSync(file, 'utf8')), now = scan(), stale = [], todo = [];
  for (const [f, cur] of Object.entries(now)){ const was = saved[f]; if (!was) continue;
    if (cur.sha !== was.sha && cur.v === was.v) stale.push(`${f} (still ?v=${cur.v})`);
    else if (cur.sha !== was.sha || cur.v !== was.v) todo.push(f); }
  assert.deepStrictEqual(stale, [], 'these files changed but kept their ?v= in index.html: players would keep the old copy. Bump them');
  if (todo.length) console.log(`# ${todo.length} file(s) changed with a new ?v=: run node tools/asset-manifest.js when the version is finished`);
});
