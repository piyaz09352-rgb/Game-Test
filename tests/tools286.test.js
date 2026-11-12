/* VAYRATHEN — tests/tools286.test.js — (v286) the owner's command-line tools still start
   v285 broke tools/firebase-backup.mjs without anyone noticing: a star-slash inside its opening comment (in a path like guilds/star/members) closed
   the comment early and the rest became code (`node --check` passes, running it fails). Every tool is started here the cheap way. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const path = require('path'), fs = require('fs'), { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

test('firebase-backup.mjs starts and prints its usage', () => {
  const r = spawnSync('node', [path.join(ROOT, 'tools/firebase-backup.mjs')], { encoding: 'utf8', timeout: 30000 });
  assert.strictEqual(r.status, 1, 'it exits with the usage, not a crash: ' + r.stderr);
  assert.match(r.stderr, /usage: node tools\/firebase-backup\.mjs backup\|restore <file> --yes\|gms\|privacy/);
  assert.doesNotMatch(r.stderr, /Error/);
});

test('every tool parses', () => {
  const files = [...fs.readdirSync(path.join(ROOT, 'tools')).filter(f => /\.(m?js)$/.test(f)).map(f => 'tools/' + f)];
  for (const f of files){ const r = spawnSync('node', ['--check', path.join(ROOT, f)], { encoding: 'utf8' }); assert.strictEqual(r.status, 0, f + ': ' + r.stderr); }
});
