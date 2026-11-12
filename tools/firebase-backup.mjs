#!/usr/bin/env node
/* VAYRATHEN — tools/firebase-backup.mjs — full backup / restore of the Firebase deployment (admin, run on your own computer)
   Uses firebase-admin with a service-account key, so it reads and writes EVERYTHING, private saves included
   (data/users/<uid>/… — the in-game GM backup cannot see those). Never upload the key or the backups anywhere public.

   Setup (once):  npm install firebase-admin
                  Firebase Console → Project settings → Service accounts → Generate new private key → save as
                  service-account.json next to this folder (it is in .gitignore and firebase.json ignores tools/)
   Commands:
     node tools/firebase-backup.mjs backup  [--key service-account.json] [--out vayrathen-full-<time>.json]
         Firestore (every collection and subcollection, recursively) + the whole Realtime Database → one JSON file.
     node tools/firebase-backup.mjs restore <file.json> --yes [--key …] [--no-rtdb] [--only players,guilds]
         Writes every document of the file back (overwrites docs with the same path; never deletes others).
     node tools/firebase-backup.mjs gms [--key …]
         Copies GM_UIDS from js/net/firebase-config.js into the Realtime Database /gms (lets GMs send the 'gm' topic).
     node tools/firebase-backup.mjs privacy [--key …]
         (v284) Removes the log-in IDs older versions published: `acc` on players/* and guilds/*/members/*, `sa` on
         market/*. The game no longer writes them on the Firebase site; this clears the copies already there.
   The database URL and project come from js/net/firebase-config.js (override with --db <url>). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2), cmd = argv[0];
const opt = (k, d = null) => { const i = argv.indexOf(`--${k}`); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const die = m => { console.error(m); process.exit(1); };
if (!['backup', 'restore', 'gms', 'privacy'].includes(cmd)) die('usage: node tools/firebase-backup.mjs backup|restore <file> --yes|gms|privacy [--key service-account.json] [--db <url>]');

/* config from the game's own file (no need to repeat it here) */
const cfgSrc = fs.readFileSync(path.join(ROOT, 'js/net/firebase-config.js'), 'utf8');
const cfg = k => (cfgSrc.match(new RegExp(`${k}:\\s*'([^']*)'`)) || [])[1] || '';
const GM_UIDS = (() => { const m = cfgSrc.match(/const GM_UIDS\s*=\s*\[([^\]]*)\]/); return m ? [...m[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map(x => x[1] || x[2]) : []; })();

let admin;
try { admin = { app: await import('firebase-admin/app'), fs: await import('firebase-admin/firestore'), db: await import('firebase-admin/database') }; }
catch (e){ die('firebase-admin is not installed: run  npm install firebase-admin'); }
const keyPath = opt('key') || process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(ROOT, 'service-account.json');
if (!fs.existsSync(keyPath)) die(`service-account key not found: ${keyPath} (Firebase Console → Project settings → Service accounts)`);
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const databaseURL = opt('db') || cfg('databaseURL');
admin.app.initializeApp({ credential: admin.app.cert(key), projectId: key.project_id || cfg('projectId'), databaseURL: databaseURL || undefined });
const fsdb = admin.fs.getFirestore(), rtdb = databaseURL ? admin.db.getDatabase() : null;
const { Timestamp, GeoPoint, DocumentReference } = admin.fs;

/* Firestore values ↔ JSON (the game stores plain JSON; other types survive a round trip too) */
const enc = v => v instanceof Timestamp ? { __t: 'ts', s: v.seconds, n: v.nanoseconds } : v instanceof GeoPoint ? { __t: 'geo', lat: v.latitude, lng: v.longitude }
  : v instanceof DocumentReference ? { __t: 'ref', p: v.path } : Buffer.isBuffer(v) || v instanceof Uint8Array ? { __t: 'bytes', b: Buffer.from(v).toString('base64') }
  : Array.isArray(v) ? v.map(enc) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) : v;
const dec = v => Array.isArray(v) ? v.map(dec) : v && typeof v === 'object' ? (v.__t === 'ts' ? new Timestamp(v.s, v.n) : v.__t === 'geo' ? new GeoPoint(v.lat, v.lng) : v.__t === 'ref' ? fsdb.doc(v.p)
  : v.__t === 'bytes' ? Buffer.from(v.b, 'base64') : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dec(x)]))) : v;

async function dumpCollection(col, out){
  // listDocuments() also finds "missing" parents that only hold subcollections (guilds/<id>/members, data/users/<uid>/…)
  for (const ref of await col.listDocuments()){
    const snap = await ref.get(); if (snap.exists) out[ref.path] = enc(snap.data());
    for (const sub of await ref.listCollections()) await dumpCollection(sub, out);
  }
}

if (cmd === 'backup'){
  const at = Date.now(), firestore = {};
  for (const col of await fsdb.listCollections()){ process.stdout.write(`firestore ${col.id} … `); const n0 = Object.keys(firestore).length; await dumpCollection(col, firestore); console.log(Object.keys(firestore).length - n0); }
  const rt = rtdb ? (await rtdb.ref('/').once('value')).val() : null;
  const file = opt('out') || `vayrathen-full-${new Date(at).toISOString().replace(/\D/g, '').slice(0, 14)}.json`;
  fs.writeFileSync(file, JSON.stringify({ game: 'vayrathen', kind: 'firebase-full-backup', v: 1, at, project: key.project_id, databaseURL, firestore, rtdb: rt }));
  console.log(`saved ${file}: ${Object.keys(firestore).length} Firestore docs${rtdb ? ' + Realtime Database' : ''}`);
}
if (cmd === 'restore'){
  const file = argv[1]; if (!file || !fs.existsSync(file)) die('restore: give the backup file');
  const data = JSON.parse(fs.readFileSync(file, 'utf8')); if (data.kind !== 'firebase-full-backup') die('not a full backup made by this tool');
  const only = opt('only') ? String(opt('only')).split(',') : null, paths = Object.keys(data.firestore).filter(p => !only || only.includes(p.split('/')[0]));
  if (opt('yes') !== true) die(`restore would write ${paths.length} Firestore docs${opt('no-rtdb') || !rtdb ? '' : ' and REPLACE the whole Realtime Database'} into ${key.project_id}. Add --yes to do it.`);
  for (let i = 0; i < paths.length; i += 400){ const b = fsdb.batch(); for (const p of paths.slice(i, i + 400)) b.set(fsdb.doc(p), dec(data.firestore[p])); await b.commit(); console.log(`firestore ${Math.min(i + 400, paths.length)}/${paths.length}`); }
  if (rtdb && !opt('no-rtdb') && data.rtdb) { await rtdb.ref('/').set(data.rtdb); console.log('realtime database restored'); }
  console.log('done');
}
if (cmd === 'gms'){
  if (!rtdb) die('no databaseURL in js/net/firebase-config.js');
  await rtdb.ref('gms').set(Object.fromEntries(GM_UIDS.map(u => [u, true])));
  console.log(`gms: ${GM_UIDS.length ? GM_UIDS.join(', ') : '(none: GM_UIDS is empty)'}`);
}
if (cmd === 'privacy'){
  const del = admin.fs.FieldValue.delete(); let n = 0;
  const strip = async (snap, field) => { for (const d of snap.docs) if (d.get(field) !== undefined){ await d.ref.update({[field]:del}); n++; } };
  await strip(await fsdb.collection('players').get(), 'acc');
  await strip(await fsdb.collectionGroup('members').get(), 'acc');
  await strip(await fsdb.collection('market').get(), 'sa');
  console.log(`privacy: removed ${n} published log-in ID(s)`);
}
process.exit(0);
