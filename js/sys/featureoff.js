/* VAYRATHEN — js/sys/featureoff.js — (v104) switch whole systems off for now (they made the game stutter)
   FEATURE_OFF.festival : no festival runs (events.js + festivals2.js). No decorations (sky lanterns, krathong boats,
                          Songkran drops, fireworks), no festival spirit every 15 minutes, no tokens, no +10% EXP,
                          no login banner, no "preview festival" scenery. Mae Nang Thetsakan says festivals are paused.
                          Costumes already earned stay with their owners.
   FEATURE_OFF.weather  : the sky stays clear (world2.js: no rain, storm, fog or haze, no lightning, no rain sounds,
                          no fire/water/wind damage change, monsters see as far as usual) and the drifting biome
                          particles are gone (mist puffs, snow, dust, petals, embers, bubbles in render.js).
                          Caves and graveyards keep their darkness and torchlight: that is lighting, not weather.
   To bring a system back, set its switch to false. Loaded last, so it only overrides; nothing else is removed. */
'use strict';

const FEATURE_OFF = {festival:true, weather:true};

/* ---------- festivals ---------- */
if (FEATURE_OFF.festival && typeof EVENTS !== 'undefined'){
  evOnDate = () => null;   // evLive / evShow / evNext all ask this: no festival today, and none ahead
  SETTINGS.evPreview = ''; EVD.p.length = 0; EVD.fw.length = 0;
  // the GM festival preview stays off too: the setting can be written but always reads empty (no frame needed to undo it)
  try { Object.defineProperty(SETTINGS, 'evPreview', {get:() => '', set:() => {}, configurable:true, enumerable:true}); } catch (e) { EV.on('tick', () => { if (SETTINGS.evPreview) SETTINGS.evPreview = ''; }); }
  if (NPC_OPEN.festival) NPC_OPEN.festival = n => npcFrame(n, L('ช่วงนี้งดจัดเทศกาลไว้ก่อนนะจ๊ะ ชุดที่เคยแลกไปแล้วยังเป็นของเจ้าเหมือนเดิม', 'Festivals are paused for now, dear. Costumes you already earned are still yours.'), '');
  // the Settings "Preview festival" row and the GM festival picker have nothing to show
  { const st = document.createElement('style'); st.textContent = '#set-evPreview,label.set:has(#set-evPreview),label:has(#gmFest){display:none!important}'; document.head.appendChild(st); }
}

/* ---------- weather ---------- */
if (FEATURE_OFF.weather){
  if (typeof WXS !== 'undefined'){
    wxRoll = () => 'clear';
    Object.assign(WXS, {cur:'clear', next:null, k:0, flash:0, strikeT:1e9}); WXS.bolts.length = 0; WXS.drops.length = 0;
    // (v115) and no natural lightning ever: the storm clock is held off every frame, whatever sets the sky
    EV.on('tick', () => { if (WXS.cur !== 'clear' || WXS.next){ WXS.cur = 'clear'; WXS.next = null; WXS.k = 0; } WXS.strikeT = 1e9; WXS.flash = 0; });
  }
  if (typeof drawWeather === 'function'){
    /* keep the tint and the darkness of caves; skip the drifting particles (they draw only while GFX.fx is on) */
    const _dw = drawWeather;
    drawWeather = function(g){ if (typeof GFX === 'undefined') return _dw.apply(this, arguments);
      const fx = GFX.fx; GFX.fx = 0; try { return _dw.apply(this, arguments); } finally { GFX.fx = fx; } };
    if (typeof WX !== 'undefined') WX.parts.length = 0;
  }
}

if (typeof WIKI_SYS !== 'undefined'){
  const off = [FEATURE_OFF.festival && L('เทศกาล', 'festivals'), FEATURE_OFF.weather && L('สภาพอากาศ', 'weather')].filter(Boolean);
  if (off.length) WIKI_SYS.push({id:'featureoff', t:['ระบบที่ปิดชั่วคราว', 'Systems paused for now'], b:() => `<p>${L(`ปิดไว้ก่อนเพื่อให้เกมลื่นขึ้น: ${off.join(' · ')} · ชุดเทศกาลที่ได้ไปแล้วยังใช้ได้ · ถ้ำและสุสานยังมืดเหมือนเดิม`, `Paused so the game runs smoother: ${off.join(' · ')} · festival costumes you own still work · caves and graveyards stay dark`)}</p>`});
}
