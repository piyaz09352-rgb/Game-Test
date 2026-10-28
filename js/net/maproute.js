/* VAYRATHEN — js/net/maproute.js — (v185) map-only messages go to the map's own room, not to the whole server
   Monster hits and kills, skill effects, the world-monster sync, boss moves, ally buffs and world-boss damage were all
   sent through the lobby room that every online player listens to, so every player downloaded every hit of everyone
   on every map (the traffic grows with players × players and ran the free Realtime Database quota out). Each message
   already said which map it was for and every client threw away the ones for other maps — now they are sent to the
   map room (NET.mapRoom, the room of the map or dungeon you stand in), so only the players on that map receive them.
   mapEmit(topic, data) sends to the current map room (nothing when there is none); mapOn(topic, fn) listens on
   whichever map room you are in, and moves with you when you change maps. */
'use strict';

const MR = {subs:[], room:null};
function mapEmit(topic, data){ const r = NET.mapRoom; if (!r || !NET.on) return Promise.resolve(); try { return r.emit(topic, data); } catch (e){ return Promise.resolve(); } }
function mapOn(topic, fn){ if (MR.subs.some(([t, f]) => t === topic && f === fn)) return; MR.subs.push([topic, fn]); if (MR.room) try { MR.room.on(topic, fn, () => {}); } catch (e) {} }
function mapRouteSync(){ if (NET.mapRoom === MR.room) return; MR.room = NET.mapRoom;
  if (MR.room) for (const [t, f] of MR.subs) try { MR.room.on(t, f, () => {}); } catch (e) {} }
EV.on('tick', mapRouteSync);
