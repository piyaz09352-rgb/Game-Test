/* VAYRATHEN — js/sys/core.js
   Shared plumbing for the newer systems (rarity, wardrobe, achievements, dailies, crafting, guilds, trade,
   world boss, tutorial, accounts):
   · EV — a tiny event bus. The game emits 'kill', 'level', 'job', 'card', 'refine', 'chapter', 'pickup',
     'craft', 'potion', 'capture', 'npc', 'win', 'stat', 'skill', 'map', 'trade', 'wboss' … and the systems listen.
   · bump(key) — per-character life counters in S.st (kills, bosses, crafts …) that achievements read.
   · mkWin(...) — builds a floating window + its menu button the same way the hand-written ones are made,
     and WIN_RENDER[id] is called whenever that window opens.
   · dayKey() — the current day in Thailand time (dailies reset at 00:00 Thai). */
'use strict';

const EV = {h:{}, on(n, f){ (this.h[n] = this.h[n] || []).push(f); },
  emit(n, d){ const a = this.h[n]; if (a) for (const f of a){ try { f(d); } catch (e){ console.error('EV', n, e); } } }};
const stc = () => S.st || (S.st = {});
function bump(k, n = 1){ const s = stc(); s[k] = (s[k] || 0) + n; EV.emit('stat', {k, v:s[k]}); }
const dayKey = () => Math.floor(((typeof wNow === 'function' ? wNow() : Date.now()) + 7 * 3600e3) / 864e5);
/* (v27) world time: this device's clock nudged to the median of the players on the map (netmob.js keeps WCLK.off),
   so respawns, bosses and day/night line up even when someone's phone clock is a minute off */
const WCLK = {off:0, n:0}, wNow = () => Date.now() + WCLK.off;
const thaiClock = () => { const d = new Date(wNow() + 7 * 3600e3); return {h:d.getUTCHours(), m:d.getUTCMinutes(), s:d.getUTCSeconds(), dow:d.getUTCDay()}; };
const fmtN = n => Math.round(n || 0).toLocaleString();
/* a tiny seeded hash so data generated from ids is the same on every machine */
const hashS = s => { let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/* ---------- windows built from code ---------- */
const WIN_RENDER = {};
const WIN_SVG = p => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
function mkWin(id, th, en, key, icon, rail = true){
  if (document.getElementById('win-' + id)) return;
  const help = document.getElementById('win-help'); if (!help) return;
  const minI = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 10l4-4 4 4"/></svg>';
  const xI = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  help.insertAdjacentHTML('afterend', `<section class="win" id="win-${id}" hidden><header class="wt" data-drag="${id}"><i class="gem"></i><b><span data-en="${en}">${th}</span></b>${key ? `<kbd>${key}</kbd>` : ''}<button class="ibtn minb" data-min="${id}" aria-label="ย่อ" data-en-label="Minimize">${minI}</button><button class="ibtn" data-wclose="${id}" aria-label="ปิด" data-en-label="Close">${xI}</button></header><div class="wb"><div class="pane" id="pane-${id}"></div></div></section>`);
  if (!WIN_IDS.includes(id)) WIN_IDS.push(id);
  if (rail){ const hb = document.querySelector('.mb[data-win="help"]');
    if (hb) hb.insertAdjacentHTML('beforebegin', `<button class="mb" data-win="${id}" aria-label="${th}" data-en-label="${en}">${WIN_SVG(icon)}<span class="tip"><span data-en="${en}">${th}</span>${key ? `<kbd>${key}</kbd>` : ''}</span></button>`); }
}
/* re-render an open window (cheap no-op when closed) */
const winOpen = id => typeof UIS !== 'undefined' && UIS.open[id] && !winEl(id).hidden;
function reWin(id){ if (winOpen(id) && WIN_RENDER[id]) WIN_RENDER[id](); }

/* extra NPCs in Aren: drawn with hero sprites (class + look + gear), so each has its own look */
const NPC_LOOKS = {};
function npcSheet(id){
  const d = NPC_LOOKS[id]; if (!d || typeof heroSheet !== 'function') return null;
  const sh = heroSheet(d.job, d.gear || {}, d.look || null); if (sh && typeof NPC_SPR !== 'undefined') NPC_SPR[id] = SPR.heroKey(d.job, d.gear || {}, d.look || null); return sh;
}
function addTownNpc(n, look){
  NPC_LOOKS[n.id] = look; if (!n._vx){ n.x += VX; n._vx = 1; }
  if (typeof NPCS_HOME !== 'undefined' && !NPCS_HOME.some(x => x.id === n.id)){ NPCS_HOME.push(n); if (typeof MAP_ID !== 'undefined' && MAP_ID === 0 && !NPCS.some(x => x.id === n.id)) NPCS.push(n); }
}
/* the NPC dialog for the new NPCs: a portrait header like the others and a body from the system */
const NPC_OPEN = {};
function npcFrame(n, say, body){
  const d = $('#dialog');
  d.innerHTML = `<header class="dh"><div class="dpw"><canvas class="dp" width="64" height="64"></canvas></div>
      <div class="dn"><h3>${nm(n)}</h3><small>${L(n.role, n.roleEn)}</small></div><span class="wallet">${S.bia.toLocaleString()} <small>${CUR()}</small></span>
      <button class="ibtn dx" data-close="1" aria-label="${L('ปิด', 'Close')}">${IC.x}</button></header>
    <div class="db"><p class="say"><span class="sayt">${say}</span></p>${body}</div>`;
  d.hidden = false; d.dataset.npc = n.id; d.dataset.say = say;
  const cv = d.querySelector('.dp'), sh = npcSheet(n.id);
  if (cv && sh){ const K = sh.K, fs = sh.fs, c = SPR.ensure(sh, 'idle'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 64, 64); g.drawImage(c, fs / 2 - 16 * K, sh.anchor[1] - 46 * K, 32 * K, 32 * K, 0, 0, 64, 64); }
}
