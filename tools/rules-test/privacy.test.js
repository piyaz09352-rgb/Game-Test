/* VAYRATHEN — tools/rules-test/privacy.test.js — (v286) `node tools/firebase-backup.mjs privacy` on the emulator:
   the log-in IDs older versions published (players.acc, guilds/<g>/members.acc, market.sa) are removed, nothing else */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const path = require('path'), { execFileSync } = require('child_process');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');

test('privacy: published log-in IDs are cleared, everything else stays', { timeout: 120000 }, async () => {
  const env = await initializeTestEnvironment({ projectId: 'vayrathen', firestore: { host: '127.0.0.1', port: 8181, rules: 'rules_version = "2"; service cloud.firestore { match /{d=**} { allow read, write: if false; } }' } });
  try {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async ctx => { const f = ctx.firestore();
      await f.doc('players/u1').set({ name: 'Alice', lvl: 40, acc: 'alice_login' });
      await f.doc('players/u2').set({ name: 'Bob', lvl: 9 });
      await f.doc('guilds/gabcd1/members/u1').set({ n: 'Alice', l: 40, acc: 'alice_login' });
      await f.doc('market/m1').set({ s: 'u1', sn: 'Alice', sa: 'alice_login', i: 'redpot', n: 3, p: 700 }); });
    const out = execFileSync('node', [path.join(__dirname, '../firebase-backup.mjs'), 'privacy'], { cwd: __dirname, encoding: 'utf8',
      env: { ...process.env, FIRESTORE_EMULATOR_HOST: '127.0.0.1:8181', FIREBASE_DATABASE_EMULATOR_HOST: '127.0.0.1:9191' } });
    assert.match(out, /removed 3 published/);
    let docs; await env.withSecurityRulesDisabled(async ctx => { const f = ctx.firestore();
      docs = await Promise.all(['players/u1', 'players/u2', 'guilds/gabcd1/members/u1', 'market/m1'].map(async p => (await f.doc(p).get()).data())); });
    assert.deepStrictEqual(docs, [{ name: 'Alice', lvl: 40 }, { name: 'Bob', lvl: 9 }, { n: 'Alice', l: 40 }, { s: 'u1', sn: 'Alice', i: 'redpot', n: 3, p: 700 }]);
  } finally { await env.cleanup(); }
});
