#!/usr/bin/env node
/* VAYRATHEN — tools/asset-manifest.js — (v290) remember each script/stylesheet's content and its ?v= in index.html
   tests/vbump290.test.js fails when a file's content changed but its ?v= did not (players' browsers would keep the old
   file: v290 shipped the "no stat cap" fix in js/data/items.js without a new ?v=, and the cap stayed for everyone).
   Run after bumping the versions of a finished version:  node tools/asset-manifest.js */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
function scan(){ const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), out = {};
  for (const m of html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)\?v=(\d+)"/g)){ const f = path.join(ROOT, m[1]); if (!fs.existsSync(f)) continue;
    out[m[1]] = { v: +m[2], sha: crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 16) }; }
  return out; }
module.exports = { scan, file: path.join(ROOT, 'tools', 'asset-manifest.json') };
if (require.main === module){ const m = scan(); fs.writeFileSync(module.exports.file, JSON.stringify(m, null, 0).replace(/\},"/g, '},\n"') + '\n'); console.log(`asset manifest: ${Object.keys(m).length} files`); }
