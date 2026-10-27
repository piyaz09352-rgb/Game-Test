/* VAYRATHEN — tests/mock-net.js — a fake online backend for multiplayer tests.
   Each page gets a `window.claude` that offers 'user' and 'room' exactly like js/net/firebase-shim.js does,
   but every room message goes through this Node process instead of Firebase. Presence works the way the
   Firebase shim stores it: each presence() call REPLACES that player's record (pass merge:true to merge).
   With db:true it also offers 'db' (an in-memory document store shared by every page, with the claude.ai rules the
   game expects: data/users/<uid>/ is private, server/ and backups/ are written by owners only) and the user's
   isOwner()/canEdit() (true for the uids in `owners`). */
'use strict';

/* runs in the page, before the game's scripts */
function clientScript({ uid, owner = false, db = false }){
  const rooms = new Map();   // room name -> local state
  const send = msg => window.__mockNet(msg);
  const subs = new Set();    // db listeners, re-read after any write anywhere
  window.__mockRecv = msg => {
    if (msg.type === 'dbchange'){ for (const s of subs) s(); return; }
    const r = rooms.get(msg.room); if (!r) return;
    if (msg.type === 'peers'){
      r.peers = new Map(msg.list.map(p => [p.peer, { peer: p.peer, by: p.by, presence: p.presence, kind: 'viewer', guest: false, isMe: p.peer === r.me, sameTab: p.peer === r.me }]));
      for (const f of r.peerCbs) try { f([...r.peers.values()]); } catch (e) {}
    } else if (msg.type === 'ev'){
      for (const f of r.topics[msg.topic] || []) try { f({ topic: msg.topic, data: msg.data, peer: msg.peer, by: msg.by, isMe: msg.peer === r.me }); } catch (e) {}
    }
  };
  async function makeRoom(name){
    const me = await send({ op: 'join', room: name, uid });
    const r = { me, peers: new Map(), topics: {}, peerCbs: [], left: false }; rooms.set(name, r);
    send({ op: 'hello', room: name });
    return {
      emit: async (topic, data) => { if (r.left) throw new Error('left'); await send({ op: 'emit', room: name, topic: String(topic), data: JSON.parse(JSON.stringify(data ?? null)) }); },
      on: (topic, fn) => { (r.topics[topic] = r.topics[topic] || []).push(fn); return () => { r.topics[topic] = r.topics[topic].filter(f => f !== fn); }; },
      presence: async patch => { if (r.left) return; await send({ op: 'pres', room: name, patch: JSON.parse(JSON.stringify(patch ?? null)) }); },
      peers: () => [...r.peers.values()],
      onPeers: fn => { r.peerCbs.push(fn); fn([...r.peers.values()]); return () => {}; },
      onConnection: fn => fn(true),
      join: async n => makeRoom(n),
      leave: async () => { r.left = true; rooms.delete(name); await send({ op: 'leave', room: name }); },
    };
  }
  /* db: same shapes as the claude.ai runtime (snapshots with exists/data(), queries with where/orderBy/limit) */
  const meta = { fromCache: false, hasPendingWrites: false };
  const dsnap = d => ({ id: d.id, exists: d.exists, data: () => (d.exists ? JSON.parse(JSON.stringify(d.data)) : undefined), metadata: meta });
  const call = async m => { const r = await send({ op: 'db', ...m }); if (r && r.err){ const e = new Error(r.err); e.code = r.err; throw e; } return r; };
  const live = (read, next, err) => { let on = true; const f = () => { if (on) read().then(next, e => { if (err) err(e); }); }; subs.add(f); setTimeout(f, 0); return () => { on = false; subs.delete(f); }; };
  function query(path, q = { where: [], order: null, limit: 0 }){
    const get = async () => { const r = await call({ k: 'query', path, q }); const docs = r.docs.map(d => dsnap({ ...d, exists: true }));
      return { docs, size: docs.length, empty: !docs.length, metadata: meta, docChanges: () => docs.map((doc, i) => ({ type: 'added', doc, oldIndex: -1, newIndex: i })) }; };
    return { path, get, onSnapshot: (next, err) => live(get, next, err),
      where: (f, op, v) => query(path, { ...q, where: [...q.where, [f, op, v]] }), orderBy: (f, dir = 'asc') => query(path, { ...q, order: [f, dir] }), limit: n => query(path, { ...q, limit: n }),
      doc: id => doc(`${path}/${id || Math.random().toString(36).slice(2, 12)}`), add: async data => { const d = doc(`${path}/${Math.random().toString(36).slice(2, 12)}`); await d.set(data); return d; } };
  }
  function doc(path){
    const get = async () => dsnap(await call({ k: 'get', path }));
    return { id: path.split('/').pop(), path, get, onSnapshot: (next, err) => live(get, next, err),
      set: async data => { await call({ k: 'set', path, data: JSON.parse(JSON.stringify(data)) }); },
      update: async data => { await call({ k: 'update', path, data: JSON.parse(JSON.stringify(data)) }); },
      delete: async () => { await call({ k: 'delete', path }); },
      acquire: async o => call({ k: 'acquire', path, o: JSON.parse(JSON.stringify(o || {})) }), collection: p => query(`${path}/${p}`) };
  }
  const dbApi = { doc, collection: p => query(p) };
  window.claude = { mock: true, use: async n => {
    if (n === 'user') return { id: async () => uid, me: async () => ({ id: uid, name: uid, isOwner: owner, canEdit: owner }), isOwner: async () => owner, canEdit: async () => owner };
    if (n === 'room') return makeRoom('lobby');
    if (n === 'db' && db) return dbApi;
    return null;
  } };
}

/* the shared store behind every page's db, with the access rules of the game's claude.ai deployment */
function createStore(owners){
  const docs = new Map(), writes = {}, leases = new Map();   // path -> data · write count per path · short leases
  const priv = (path, uid) => { const s = path.split('/'); return s[0] === 'data' && s[1] === 'users' && s[2] !== uid; };
  const ownerOnly = path => /^(server|backups)\//.test(path);
  const val = (d, f) => d[f];
  const cmp = (a, op, b) => op === '==' ? a === b : op === '!=' ? a !== b : op === '<' ? a < b : op === '<=' ? a <= b : op === '>' ? a > b : op === '>=' ? a >= b : op === 'in' ? (b || []).includes(a) : op === 'not-in' ? !(b || []).includes(a) : op === 'array-contains' ? Array.isArray(a) && a.includes(b) : false;
  function handle(uid, m){
    const segs = m.path.split('/');
    if (m.k === 'get'){ const ok = !priv(m.path, uid) && docs.has(m.path); return { id: segs[segs.length - 1], exists: ok, data: ok ? docs.get(m.path) : null }; }
    if (m.k === 'query'){ let out = [];
      for (const [p, d] of docs){ const s = p.split('/'); if (s.length !== segs.length + 1 || s.slice(0, -1).join('/') !== m.path || priv(p, uid)) continue; if (m.q.where.every(([f, op, v]) => cmp(val(d, f), op, v))) out.push({ id: s[s.length - 1], data: d }); }
      out.sort((a, b) => (a.id < b.id ? -1 : 1));
      if (m.q.order){ const [f, dir] = m.q.order; out.sort((a, b) => { const x = val(a.data, f), y = val(b.data, f); if (x === y) return 0; if (x === undefined) return 1; if (y === undefined) return -1; return (x < y ? -1 : 1) * (dir === 'desc' ? -1 : 1); }); }
      if (m.q.limit) out = out.slice(0, m.q.limit);
      return { docs: out };
    }
    if (priv(m.path, uid) || (ownerOnly(m.path) && !owners.includes(uid))) return { err: 'invalid_argument' };
    if (m.k === 'acquire'){ const l = leases.get(m.path), now = Date.now(), holder = String((m.o || {}).holder || uid);
      if (l && l.until > now && l.holder !== holder) return { acquired: false, expiresAt: new Date(l.until).toISOString() };
      const until = now + Math.min(600000, Math.max(1000, (m.o || {}).ttlMs || 30000)); leases.set(m.path, { holder, until }); return { acquired: true, version: 1, holder, expiresAt: new Date(until).toISOString() }; }
    if (m.k !== 'delete') writes[m.path] = (writes[m.path] || 0) + 1;
    if (m.k === 'set') docs.set(m.path, m.data);
    else if (m.k === 'update'){ if (!docs.has(m.path)) return { err: 'invalid_argument' }; docs.set(m.path, { ...docs.get(m.path), ...m.data }); }
    else if (m.k === 'delete') docs.delete(m.path);
    return { ok: true, changed: true };
  }
  return { docs, writes, handle };
}

/* the broker, in Node: rooms of peers, relays events and presence between pages with a small delay */
function createBroker({ merge = false, delay = 25, db = false, owners = [] } = {}){
  const rooms = new Map();   // name -> Map(peerId -> {page, by, presence})
  const store = createStore(owners), pages = new Set();
  let seq = 0;
  const room = n => { if (!rooms.has(n)) rooms.set(n, new Map()); return rooms.get(n); };
  const deliver = (page, msg) => setTimeout(() => page.evaluate(m => window.__mockRecv && window.__mockRecv(m), msg).catch(() => {}), delay);
  const pushPeers = name => { const r = room(name), list = [...r.values()].map(p => ({ peer: p.peer, by: p.by, presence: p.presence }));
    for (const p of r.values()) deliver(p.page, { type: 'peers', room: name, list }); };
  async function attach(page, uid){
    pages.add(page); page.on('close', () => pages.delete(page));
    await page.exposeBinding('__mockNet', (src, msg) => {
      if (msg.op === 'db'){ const r = store.handle(uid, msg); if (r.changed) for (const p of pages) deliver(p, { type: 'dbchange' }); return r; }
      const r = room(msg.room);
      const mine = [...r.values()].find(p => p.page === page);
      switch (msg.op){
        case 'join': { const peer = `p${(++seq).toString().padStart(3, '0')}${uid}`; r.set(peer, { peer, page, by: uid, presence: null }); return peer; }
        case 'hello': pushPeers(msg.room); return null;
        case 'leave': if (mine){ r.delete(mine.peer); pushPeers(msg.room); } return null;
        case 'pres': if (mine){ mine.presence = merge ? { ...(mine.presence || {}), ...(msg.patch || {}) } : msg.patch; pushPeers(msg.room); } return null;
        case 'emit': if (mine) for (const p of r.values()) deliver(p.page, { type: 'ev', room: msg.room, topic: msg.topic, data: msg.data, peer: mine.peer, by: uid }); return null;
      }
      return null;
    });
    await page.addInitScript(clientScript, { uid, owner: owners.includes(uid), db });
  }
  return { attach, rooms, store, db: store.docs, writes: store.writes };
}

module.exports = { createBroker };
