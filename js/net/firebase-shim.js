/* VAYRATHEN — js/net/firebase-shim.js — play online on your own website with Firebase
   The game's online code (net/online.js and the systems) talks to `window.claude.use('user' | 'db' | 'room')`,
   the claude.ai artifact runtime. When the game runs on your own site and FIREBASE_CONFIG is filled in, this file
   provides the same three things on top of Firebase, so nothing else in the game has to change:
   · user  → Firebase Authentication (Email/Password: the title screen's ID + password panel, js/sys/auth.js)
   · db    → Cloud Firestore (same paths: players/<uid>, data/users/<uid>/save, guilds/…, market/…)
   · room  → Realtime Database: rooms/<name>/peers/<peer> holds each player's presence (removed automatically when
             they disconnect) and rooms/<name>/ev/<id> carries events (chat, party, hits…), each removed after 15 s.
   Opened on claude.ai, or with an empty config, this file does nothing. */
'use strict';
(function(){
  const C = typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG : null;
  const onClaude = /(^|\.)claude\.ai$|claudeusercontent|claude\.site/.test(location.hostname);
  if (!C || !C.apiKey || !C.projectId || onClaude || window.claude) return;
  if (window.VAYFB) return;   // someone already provides it (a test stand-in): leave it alone

  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  let fb = null, auth = null, fs = null, rtdb = null, offset = 0, OFF = false, state = 'init';   // state: init → fb (Firebase answered) | off (failed / play offline)
  const cbs = [];
  const fire = u => { for (const f of cbs) try { f(u); } catch (e) {} };
  let signedRes; const signedIn = new Promise(r => { signedRes = r; });   // true once someone is logged in, false when playing offline
  const boot = (async () => {
    for (const f of ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js', 'firebase-database-compat.js']) await load(SDK + f);
    fb = window.firebase; fb.initializeApp(C); auth = fb.auth(); fs = fb.firestore(); try { fs.settings({ignoreUndefinedProperties:true, merge:true}); } catch (e) {}
    rtdb = C.databaseURL ? fb.database() : null;
    if (rtdb) await new Promise(res => { const t = setTimeout(res, 2500); rtdb.ref('.info/serverTimeOffset').on('value', s => { offset = s.val() || 0; clearTimeout(t); res(); }); });   // server clock, so a phone with a wrong clock still hears chat
    await new Promise(res => { let first = true; auth.onAuthStateChanged(u => {   // the log-in itself is js/sys/auth.js's panel; this only reports who is signed in
      if (first){ first = false; if (state === 'init') state = 'fb'; res(); }
      if (u && !/@vayrathen\.game$/.test(u.email || '')){ auth.signOut().catch(() => {}); return; }   // an old Google / guest log-in from before the ID + password system: drop it (this fires again with null)
      if (u) signedRes(true);
      fire(u); }); });
    return true;
  })().catch(e => { console.warn('Firebase failed to start', e); return false; });
  const ready = Promise.race([boot, new Promise(r => setTimeout(() => r(false), 20000))]).then(ok => { if (!ok && state === 'init'){ state = 'off'; signedRes(false); fire(null); } return ok; });

  /* ---------- accounts: ID + password through Firebase Authentication (Email/Password; the ID becomes <id>@vayrathen.game) ---------- */
  const mail = id => String(id).trim().toLowerCase() + '@vayrathen.game';
  const persist = keep => auth.setPersistence(fb.auth.Auth.Persistence[keep === false ? 'SESSION' : 'LOCAL']).catch(() => {});
  window.VAYFB = {
    state:() => (OFF ? 'off' : state),
    user:() => (auth && auth.currentUser) || null,
    onChange:f => { cbs.push(f); if (state !== 'init') setTimeout(() => { try { f(auth && auth.currentUser || null); } catch (e) {} }, 0); },
    signUp:async (id, pw, keep) => { await ready; await persist(keep); const c = await auth.createUserWithEmailAndPassword(mail(id), pw); try { await c.user.updateProfile({displayName:String(id).trim()}); } catch (e) {} return auth.currentUser || c.user; },
    signIn:async (id, pw, keep) => { await ready; await persist(keep); return (await auth.signInWithEmailAndPassword(mail(id), pw)).user; },
    signOut:async () => { if (auth) await auth.signOut(); },
    changePw:async (oldPw, newPw) => { const u = auth.currentUser; if (!u) throw {code:'auth/no-user'};   // Firebase wants a fresh sign-in before a new password
      await u.reauthenticateWithCredential(fb.auth.EmailAuthProvider.credential(u.email, oldPw)); await u.updatePassword(newPw); },
    offline:() => { OFF = true; signedRes(false); }
  };

  /* ---------- user ---------- */
  const userApi = {id:async () => auth.currentUser.uid, me:async () => ({id:auth.currentUser.uid, name:auth.currentUser.displayName || ''})};

  /* ---------- room over the Realtime Database ---------- */
  const safe = n => String(n).replace(/[.#$\[\]\/]/g, '_').slice(0, 80);
  const TAG = Math.random().toString(36).slice(2, 10);
  function makeRoom(name){
    const key = safe(name), base = rtdb.ref(`rooms/${key}`), uid = auth.currentUser.uid, me = `${TAG}${key === 'lobby' ? '' : ''}`;
    const peersRef = base.child('peers'), myRef = peersRef.child(me), evRef = base.child('ev');
    const peers = new Map(), topics = {}, peerCbs = [], conCbs = [], subs = [];
    let myPres = null, joinedAt = Date.now() + offset, left = false, conn = false;
    /* leftovers of my own earlier sessions in this room (page reloaded, tab crashed, second device): remove them, the newest session wins */
    peersRef.orderByChild('by').equalTo(uid).once('value').then(sn => { sn.forEach(c => { if (c.key !== me) c.ref.remove().catch(() => {}); }); }).catch(() => {});
    myRef.onDisconnect().remove(); myRef.set({by:uid, j:'null', t:fb.database.ServerValue.TIMESTAMP});
    const firePeers = () => { for (const f of peerCbs) try { f(list()); } catch (e) {} };
    const parse = s => { try { return JSON.parse(s); } catch (e){ return null; } };
    const onPeer = s => { const v = s.val() || {}; peers.set(s.key, {peer:s.key, by:v.by, presence:parse(v.j), kind:'viewer', guest:false, isMe:s.key === me, sameTab:s.key === me, t:typeof v.t === 'number' ? v.t : 0}); firePeers(); };
    /* a hero whose browser died without the server noticing stays in the room forever (a frozen "ghost" standing on the map):
       every client re-sends its presence at least every 10 s (online.js), so a peer silent for 45 s is dropped from the list */
    const pruneT = setInterval(() => { const now = Date.now() + offset; let ch = false;
      for (const [k, p] of peers) if (!p.isMe && p.t && now - p.t > 45000){ peers.delete(k); ch = true; }
      if (ch) firePeers(); }, 5000);
    subs.push(() => clearInterval(pruneT));
    peersRef.on('child_added', onPeer); peersRef.on('child_changed', onPeer); peersRef.on('child_removed', s => { peers.delete(s.key); firePeers(); });
    subs.push(() => { peersRef.off(); });
    const q = evRef.orderByChild('t').startAt(joinedAt - 3000);
    q.on('child_added', s => { const v = s.val() || {}; if ((v.t || 0) < joinedAt - 3000) return; const fns = topics[v.topic]; if (!fns) return;
      const msg = {topic:v.topic, data:parse(v.j), peer:v.peer, by:v.by, isMe:v.peer === me}; for (const f of fns) try { f(msg); } catch (e) {} });
    subs.push(() => q.off());
    const list = () => [...peers.values()].filter(p => p.isMe || p.by !== uid);   // never show my own account's other sessions (an old tab, a reload leftover, a second device): that was the "stuck copy of me"
    const api = {
      emit:async (topic, data) => { if (left) throw new Error('left'); const j = JSON.stringify(data ?? null); if (j.length > 60000) throw new Error('too big');
        const r = evRef.push(); await r.set({topic:String(topic), j, peer:me, by:uid, t:fb.database.ServerValue.TIMESTAMP}); setTimeout(() => r.remove().catch(() => {}), 15000); },
      on:(topic, fn) => { (topics[topic] = topics[topic] || []).push(fn); return () => { topics[topic] = (topics[topic] || []).filter(f => f !== fn); }; },
      presence:async patch => { if (left) return; myPres = patch; await myRef.set({by:uid, j:JSON.stringify(patch ?? null), t:fb.database.ServerValue.TIMESTAMP}); },   // set (not update) with `by`: after a reconnect the server has already removed my node, and the rules reject a node without `by`
      peers:list,
      onPeers:fn => { peerCbs.push(fn); fn(list()); return () => { const i = peerCbs.indexOf(fn); if (i >= 0) peerCbs.splice(i, 1); }; },
      onConnection:fn => { conCbs.push(fn); if (conn) fn(true); },
      join:async n => makeRoom(n),
      leave:async () => { left = true; for (const f of subs) f(); try { myRef.onDisconnect().cancel(); await myRef.remove(); } catch (e) {} }
    };
    void myPres;
    /* every room (not only the lobby): each time the connection comes back (phone slept, wifi blip) the server has already removed my node,
       so re-arm onDisconnect and write my node again with the latest presence — otherwise I stay invisible on that map until I change map */
    const conRef = rtdb.ref('.info/connected');
    const onCon = s => { const c = !!s.val(); if (name === 'lobby'){ conn = c; for (const f of conCbs) try { f(c); } catch (e) {} }
      if (c && !left) myRef.onDisconnect().remove().then(() => { if (!left) return myRef.set({by:uid, j:JSON.stringify(myPres ?? null), t:fb.database.ServerValue.TIMESTAMP}); }).catch(() => {}); };
    conRef.on('value', onCon); subs.push(() => conRef.off('value', onCon));
    return api;
  }

  window.claude = {
    firebase:true,
    use:async name => {
      const ok = await ready; if (!ok || OFF || !auth) return null;
      if (!(await signedIn) || OFF || !auth.currentUser) return null;   // waits here until the title's log-in is done
      if (name === 'user') return userApi;
      if (name === 'db') return fs;
      if (name === 'room') return rtdb ? makeRoom('lobby') : null;
      return null;   // downloads etc.: the game falls back to a normal browser download
    }
  };
})();
