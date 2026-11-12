/* VAYRATHEN — js/gfx/nocroc286.js — (v286) nothing that looks like a crocodile
   v280 turned the crocodiles into monitor lizards, but they kept the crocodile's build (a long low tube of a body on
   short legs, a long flat head), and the owner still saw crocodiles: "you said they were all gone". Every long-bodied
   lizard (the monitors, salamander, lava drake, makara: head 'croc' or 'lizard' and a long body, or a monitor by name)
   is now a hog badger (หมูหริ่ง): a stocky furred Thai animal with a pig's snout. Same species id, level, skills,
   drops and quests; the names and the bestiary say hog badger. Loaded after every BEAST.make wrapper (themepal.js)
   and before the species are registered (world3.js, world4.js, world.js). */
'use strict';

const NOCROC = new Set();
const NOCROC_RE = /monitor|crocodile|lizard|salamander|makara/i;
{ const _mk = BEAST.make;
  BEAST.make = function(key, spec){
    if (spec && (spec.head === 'croc' || spec.head === 'lizard') && ((spec.len || 1) >= 1.15 || NOCROC_RE.test(key))){
      NOCROC.add(key);
      spec = {...spec, head:'boar', len:1, leg:Math.max(.72, spec.leg || 0), girth:Math.max(1.12, spec.girth || 1), mane:spec.stripe || spec.skin};
      delete spec.spots; delete spec.ridges; }
    return _mk.call(this, key, spec); }; }

/* the names and the bestiary, once every species exists (when the page has loaded all its scripts) */
const NOCROC_TH = [[/ซาลาแมนเดอร์/, 'หมูหริ่ง'], [/มังกรลาวาน้อย/, 'หมูหริ่งลาวา'], [/มกร/, 'หมูหริ่ง'], [/ตะกวด|จระเข้|กิ้งก่า/, 'หมูหริ่ง']];
const NOCROC_EN = /\b(Monitor|Lizard|Salamander|Drake|Makara|Crocodile)\b/;
function nocrocNames(){
  if (typeof MOB === 'undefined') return false;
  for (const k of NOCROC){ const d = MOB[k]; if (!d || d.__nocroc) continue; d.__nocroc = 1;
    let th = d.name || ''; for (const [re, to] of NOCROC_TH) if (re.test(th)){ th = th.replace(re, to); break; } if (th === d.name) th = 'หมูหริ่ง' + th; d.name = th;
    d.en = NOCROC_EN.test(d.en || '') ? d.en.replace(NOCROC_EN, 'Hog Badger') : 'Hog Badger ' + (d.en || '');
    if (typeof MOB_LORE !== 'undefined' && Array.isArray(MOB_LORE[k])) MOB_LORE[k] = [`หมูหริ่ง สัตว์ป่าตัวป้อมขนหยาบ จมูกเหมือนหมู ขุดดินหาหนอนและรากไม้ ดุเมื่อถูกต้อนจนมุม`, 'A hog badger: a stocky, coarse-furred wild animal with a pig\'s snout that digs for grubs and roots, and fights hard when cornered.'];
  }
  return true;
}
document.addEventListener('DOMContentLoaded', nocrocNames);
