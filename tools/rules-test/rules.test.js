/* VAYRATHEN — tools/rules-test/rules.test.js — (v284) the Firebase rules, attacked on the emulators
   Each test plays an honest player (what the game itself writes must still work) and a cheater with the browser
   console open (what the rules must refuse). Run: npm run test:rules (from the project root). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');

const A = 'aliceUid0000000000000000001', B = 'bobUid000000000000000000002', C = 'carolUid00000000000000000003', GM = 'fo6F3IFoT0d3htberU9x13RKAhr1';
let env;
const now = () => Date.now();

test.before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-vayrathen',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '../../firebase/firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8181 },
    database: { rules: fs.readFileSync(path.join(__dirname, '../../firebase/database.rules.json'), 'utf8'), host: '127.0.0.1', port: 9191 } });
});
test.after(async () => { if (env) await env.cleanup(); });
test.beforeEach(async () => { await env.clearFirestore(); await env.clearDatabase(); });

const db = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
const rt = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).database();
const seed = fn => env.withSecurityRulesDisabled(async ctx => fn(ctx.firestore(), ctx.database()));

/* what the game writes (online.js, social2.js, mail.js, guild.js …) */
const card = (o = {}) => ({ name: 'Alice', job: 'swordsman', lvl: 42, map: 3, shards: 5, acc: 'alice', title: '', guild: '', ach: 12, pvp: 1000, house: { w: 'teak', f: 'teak', s: {} }, tower: 7, at: now(), ...o });
const listing = (o = {}) => ({ s: A, sn: 'Alice', sa: 'alice', i: 'potion_red', n: 5, x: null, p: 500, at: now(), sold: null, paid: false, ...o });
const letter = (o = {}) => ({ to: B, tn: 'Bob', from: A, fn: 'Alice', s: 'hi', m: 'a gift', z: 100, i: null, n: 0, x: null, c: 0, at: now(), sys: 0, rd: 0, taken: false, ...o });

test('nobody signed out reads or writes anything', async () => {
  await assertFails(db(null).doc('players/' + A).get());
  await assertFails(db(null).doc('market/abcdef123').set(listing()));
  await assertFails(rt(null).ref('rooms/lobby/peers').once('value'));
});

test('player cards: your own, sane values only', async () => {
  await assertSucceeds(db(A).doc('players/' + A).set(card()));
  await assertSucceeds(db(B).doc('players/' + A).get());
  await assertFails(db(B).doc('players/' + A).set(card({ name: 'Bob' })));               // someone else's card
  await assertFails(db(B).doc('players/' + A).delete());
  await assertFails(db(A).doc('players/' + A).set(card({ lvl: 99999 })));               // level beyond the cap
  await assertFails(db(A).doc('players/' + A).set(card({ name: 'x'.repeat(500) })));     // a huge name
  await assertFails(db(A).doc('players/' + A).set(card({ admin: true })));               // unknown fields
  await assertFails(db(A).doc('players/' + A).set(card({ lvl: '42' })));
  await assertSucceeds(db(A).doc('players/' + A).set(card({ map: 'tower' })));
  await assertSucceeds(db(GM).doc('players/' + A).delete());
});

test('private saves: only the owner', async () => {
  await assertSucceeds(db(A).doc(`data/users/${A}/save`).set({ s: '{}', at: now(), lvl: 10, job: 'novice' }));
  await assertSucceeds(db(A).doc(`data/users/${A}/account`).set({ a: '{}', at: now() }));
  await assertFails(db(B).doc(`data/users/${A}/save`).get());
  await assertFails(db(B).doc(`data/users/${A}/account`).get());
  await assertFails(db(B).doc(`data/users/${A}/save`).set({ s: '{}', at: now(), lvl: 10 }));
  await assertFails(db(A).doc(`data/users/${A}/save`).set({ s: '{}', at: now(), lvl: 5000 }));
});

test('market: list, buy once, collect once, no stealing', async () => {
  const id = 'aaaaaa' + now().toString(36);
  await assertFails(db(A).doc('market/' + id).set(listing({ s: B })));                  // listing as someone else
  await assertFails(db(A).doc('market/' + id).set(listing({ sold: { b: A } })));         // already "sold"
  await assertFails(db(A).doc('market/' + id).set(listing({ p: 0 })));
  await assertSucceeds(db(A).doc('market/' + id).set(listing()));
  // another player cannot change, delete or re-price it
  await assertFails(db(B).doc('market/' + id).update({ p: 1 }));
  await assertFails(db(B).doc('market/' + id).delete());
  await assertFails(db(B).doc('market/' + id).update({ sold: { b: C, bn: 'Carol', at: now() } }));   // buying in someone else's name
  await assertFails(db(A).doc('market/' + id).update({ sold: { b: A, bn: 'Alice', at: now() } }));   // the seller buying their own
  await assertFails(db(B).doc('market/' + id).update({ sold: { b: B, bn: 'Bob', at: now() }, n: 999 }));   // and a bigger stack
  // the game's purchase: a transaction
  { const f = db(B); await assertSucceeds(f.runTransaction(async tx => { const r = f.doc('market/' + id); await tx.get(r); tx.update(r, { sold: { b: B, bn: 'Bob', at: now() } }); })); }
  // a second buyer cannot buy it again, the seller cannot cancel it (and take the item back) once sold
  await assertFails(db(C).doc('market/' + id).update({ sold: { b: C, bn: 'Carol', at: now() } }));
  await assertFails(db(A).doc('market/' + id).delete());
  await assertFails(db(B).doc('market/' + id).update({ paid: true }));                    // only the seller collects
  await assertSucceeds(db(A).doc('market/' + id).update({ paid: true }));
  await assertFails(db(A).doc('market/' + id).update({ paid: false }));
  await assertSucceeds(db(A).doc('market/' + id).delete());
  // an unsold listing: only its seller cancels it
  await assertSucceeds(db(A).doc('market/bbbbbb1').set(listing()));
  await assertFails(db(C).doc('market/bbbbbb1').delete());
  await assertSucceeds(db(A).doc('market/bbbbbb1').delete());
});

test('mail: as yourself, no fake system letters, no coins, attachments taken once', async () => {
  await assertFails(db(C).doc('mail/m000001').set(letter()));                           // writing as Alice
  await assertFails(db(A).doc('mail/m000002').set(letter({ c: 500 })));                 // mailing Vayra Coins
  await assertFails(db(A).doc('mail/m000003').set(letter({ sys: 1, fn: 'ระบบวายรา' }))); // a fake system letter
  await assertFails(db(A).doc('mail/m000004').set(letter({ taken: true })));
  await assertFails(db(A).doc('mail/m000005').set(letter({ m: 'x'.repeat(5000) })));
  await assertSucceeds(db(A).doc('mail/m000006').set(letter()));
  await assertSucceeds(db(A).doc('mail/m000007').set(letter({ to: A, sys: 1, c: 3, fn: 'ระบบวายรา' })));   // the game writing to you
  // only the two of them read it
  await assertSucceeds(db(B).doc('mail/m000006').get());
  await assertSucceeds(db(A).doc('mail/m000006').get());
  await assertFails(db(C).doc('mail/m000006').get());
  // the sender cannot take it back, the recipient takes it once and cannot rewrite it
  await assertFails(db(A).doc('mail/m000006').update({ taken: true }));
  await assertFails(db(B).doc('mail/m000006').update({ z: 999999 }));
  { const f = db(B); await assertSucceeds(f.runTransaction(async tx => { const r = f.doc('mail/m000006'); await tx.get(r); tx.update(r, { taken: true, rd: 1 }); })); }
  await assertFails(db(B).doc('mail/m000006').update({ taken: false }));
  await assertFails(db(C).doc('mail/m000006').delete());
  await assertSucceeds(db(B).doc('mail/m000006').delete());
});

test('guilds: the founder owns the card, members only their own line, the castle only for the winners', async () => {
  await assertFails(db(A).doc('guilds/gabcd1').set({ name: 'Tigers', leader: B, leaderName: 'Bob', notice: '', at: now() }));
  await assertSucceeds(db(A).doc('guilds/gabcd1').set({ name: 'Tigers', leader: A, leaderName: 'Alice', notice: '', at: now() }));
  await assertFails(db(B).doc('guilds/gabcd1').update({ notice: 'hacked' }));
  await assertFails(db(B).doc('guilds/gabcd1').update({ leader: B }));
  await assertFails(db(A).doc('guilds/gabcd1').update({ leader: B }));
  await assertSucceeds(db(A).doc('guilds/gabcd1').update({ notice: 'Welcome' }));
  await assertFails(db(B).doc('guilds/gabcd1').delete());
  await assertSucceeds(db(A).doc(`guilds/gabcd1/members/${A}`).set({ n: 'Alice', j: 'swordsman', l: 42, at: now(), acc: 'alice' }));
  await assertSucceeds(db(B).doc(`guilds/gabcd1/members/${B}`).set({ n: 'Bob', j: 'mage', l: 30, at: now(), acc: 'bob' }));
  await assertFails(db(B).doc(`guilds/gabcd1/members/${A}`).delete());
  await assertFails(db(B).doc(`guilds/gabcd1/members/${C}`).set({ n: 'Carol', j: 'mage', l: 30, at: now() }));
  await assertSucceeds(db(A).doc(`guilds/gabcd1/members/${B}`).delete());               // the leader may remove a member
  // the castle
  await assertFails(db(C).doc('guilds/_siege').set({ gid: 'gabcd1', gn: 'Tigers', by: 'Carol', at: now() }));   // not a member
  await assertSucceeds(db(A).doc('guilds/_siege').set({ gid: 'gabcd1', gn: 'Tigers', by: 'Alice', at: now() }));
  await assertFails(db(A).doc('guilds/_siege').delete());
});

test('server, version, fame, tower, MVP', async () => {
  await assertFails(db(A).doc('server/season').set({ n: 99, at: now() }));
  await assertFails(db(A).doc('server/kick').set({ names: ['bob'] }));
  await assertSucceeds(db(GM).doc('server/kick').set({ names: ['bob'], at: now() }));
  await assertSucceeds(db(GM).doc('server/version').set({ v: 280, at: now(), by: GM }));
  await assertSucceeds(db(A).doc('server/version').set({ v: 284, at: now(), by: A }));
  await assertFails(db(A).doc('server/version').set({ v: 9999, at: now(), by: A }));
  await assertFails(db(A).doc('server/version').set({ v: 200, at: now(), by: A }));
  await assertFails(db(A).doc('backups/x').get());
  // fame: created once, by one of the named players; speed only faster
  await assertSucceeds(db(A).doc('fame/spd_boss1').set({ names: ['Alice'], uids: [A], party: false, t: 60000, at: now() }));
  await assertFails(db(B).doc('fame/clr_boss1').set({ names: ['Alice'], uids: [A], party: false, at: now() }));
  await assertFails(db(B).doc('fame/spd_boss1').set({ names: ['Bob'], uids: [B], party: false, t: 90000, at: now() }));
  await assertSucceeds(db(B).doc('fame/spd_boss1').set({ names: ['Bob'], uids: [B], party: false, t: 30000, at: now() }));
  await assertFails(db(B).doc('fame/spd_boss1').delete());
  // tower: your own row
  const w = 2900;
  await assertSucceeds(db(A).doc(`towerwk/${w}_${A}`).set({ w, uid: A, f: 12, name: 'Alice', job: 'mage', lvl: 40, at: now() }));
  await assertFails(db(A).doc(`towerwk/${w}_${B}`).set({ w, uid: B, f: 12, name: 'Bob', job: 'mage', lvl: 40, at: now() }));
  await assertFails(db(A).doc(`towerwk/${w}_${A}`).set({ w, uid: A, f: 99999, name: 'Alice', job: 'mage', lvl: 40, at: now() }));
  // MVP: the kill count only ever goes up by one
  await assertSucceeds(db(A).doc('mvp/boss_x').set({ up: true, sp: now(), map: 4 }));
  await assertSucceeds(db(A).doc('mvp/boss_x').set({ up: false, at: now(), names: ['Alice'], uids: [A], map: 4, lv: 40, n: 1 }));
  await assertFails(db(B).doc('mvp/boss_x').set({ up: false, at: now(), n: 500 }));
  await assertSucceeds(db(A).doc('mvphunt/' + A).set({ name: 'Alice', n: 1, at: now() }));
  await assertFails(db(A).doc('mvphunt/' + A).set({ name: 'Alice', n: 1000, at: now() }));
  await assertFails(db(B).doc('mvphunt/' + A).set({ name: 'Bob', n: 2, at: now() }));
});

test('realtime rooms: presence and events as yourself, sane sizes', async () => {
  const peerA = rt(A).ref('rooms/lobby/peers/pA'), T = { '.sv': 'timestamp' };
  await assertSucceeds(peerA.set({ by: A, j: '{"n":"Alice"}', t: T }));
  await assertSucceeds(peerA.update({ k: '{"x":1}', t: T }));
  await assertFails(rt(B).ref('rooms/lobby/peers/pA').set({ by: B, j: '{}', t: T }));     // taking over someone's presence
  await assertFails(rt(B).ref('rooms/lobby/peers/pA').remove());
  await assertFails(rt(B).ref('rooms/lobby/peers/pB').set({ by: B, j: 'x'.repeat(30000), t: T }));
  await assertFails(rt(B).ref('rooms/lobby/peers/pB').set({ by: B, j: '{}', t: T, admin: true }));
  await assertSucceeds(rt(B).ref('rooms/lobby/peers/pB').set({ by: B, j: '{}', t: T }));
  // events: from your own peer, stamped with your uid
  await assertSucceeds(rt(A).ref('rooms/lobby/ev/e1').set({ topic: 'chat', j: '{"m":"hi"}', peer: 'pA', by: A, t: T }));
  await assertFails(rt(B).ref('rooms/lobby/ev/e2').set({ topic: 'chat', j: '{}', peer: 'pA', by: B, t: T }));   // speaking as Alice's peer
  await assertFails(rt(B).ref('rooms/lobby/ev/e3').set({ topic: 'chat', j: '{}', peer: 'pB', by: A, t: T }));
  await assertFails(rt(B).ref('rooms/lobby/ev/e4').set({ topic: 'gm', j: '{}', peer: 'pB', by: B, t: T }));     // a GM command
  await assertFails(rt(B).ref('rooms/lobby/ev/e5').set({ topic: 'chat', j: 'x'.repeat(70000), peer: 'pB', by: B, t: T }));
  await assertFails(rt(B).ref('rooms/lobby/ev/e1').remove());
  await assertSucceeds(rt(A).ref('rooms/lobby/ev/e1').remove());
  await assertFails(rt(A).ref('gms/' + A).set(true));
  await seed(async (f, d) => { await d.ref('gms/' + GM).set(true); await d.ref('rooms/lobby/peers/pG').set({ by: GM, j: '{}', t: now() }); });
  await assertSucceeds(rt(GM).ref('rooms/lobby/ev/e6').set({ topic: 'gm', j: '{}', peer: 'pG', by: GM, t: T }));
});

/* the game's own dbClaim (js/net/online.js) on real Firestore: two buyers press Buy at the same moment, one gets it */
test('dbClaim: two buyers at once, exactly one buys', async () => {
  const src = fs.readFileSync(path.join(__dirname, '../../js/net/online.js'), 'utf8');
  const fn = src.slice(src.indexOf('async function dbClaim'), src.indexOf('\n}\n', src.indexOf('async function dbClaim')) + 2);
  const make = uid => { const NET = { db: env.authenticatedContext(uid).firestore(), uid }; return { NET, claim: new Function('NET', fn + '\nreturn dbClaim;')(NET) }; };
  await seed(async f => { await f.doc('market/race0001').set(listing()); });
  const buy = ({ NET, claim }) => claim(NET.db.doc('market/race0001'), cur => cur && !cur.sold && cur.s !== NET.uid ? { set: { sold: { b: NET.uid, bn: 'x', at: now() } } } : null);
  const [rb, rc] = await Promise.all([buy(make(B)), buy(make(C))]);
  assert.strictEqual([rb, rc].filter(r => r.did).length, 1, 'exactly one buyer: ' + JSON.stringify([rb.did, rc.did]));
  let sold; await env.withSecurityRulesDisabled(async ctx => { sold = (await ctx.firestore().doc('market/race0001').get()).data().sold; });
  assert.strictEqual(sold.b, rb.did ? B : C, 'the listing names the winner');
  // the seller cannot cancel it now (the game's cancel claims only unsold listings, and the rules refuse it anyway)
  const s = make(A); const rs = await s.claim(s.NET.db.doc('market/race0001'), cur => cur && !cur.sold ? { del: true } : null);
  assert.strictEqual(rs.did, false);
});
