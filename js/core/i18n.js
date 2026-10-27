/* VAYRATHEN — js/core/i18n.js
   Two languages, switchable live in Settings. Thai mode keeps game terms in English
   (Skill, Job, Level, HP, SP, ATK, EXP, Passive, Active, Cooldown, Cast, Buff…) the way Thai players use them.
   Code writes both strings side by side: L('ไทย', 'English'). Data objects carry `name` (Thai) and `en`.
   Static HTML: an element with data-en="…" swaps its text; data-en-label swaps aria-label/title. */
'use strict';

let LANG = (() => { try { return JSON.parse(localStorage.getItem('vayrathen-settings-v1') || '{}').lang || 'th'; } catch (e) { return 'th'; } })();
const L = (th, en) => (LANG === 'en' ? en : th);
const nm = o => (o ? (LANG === 'en' ? (o.en || o.name) : o.name) : '');

function applyStaticLang(){
  document.documentElement.lang = LANG;
  for (const e of document.querySelectorAll('[data-en]')){
    if (e.dataset.th == null) e.dataset.th = e.innerHTML;
    e.innerHTML = LANG === 'en' ? e.dataset.en : e.dataset.th;
  }
  for (const e of document.querySelectorAll('[data-en-label]')){
    if (e.dataset.thLabel == null) e.dataset.thLabel = e.getAttribute('aria-label') || e.getAttribute('title') || '';
    const v = LANG === 'en' ? e.dataset.enLabel : e.dataset.thLabel;
    if (e.hasAttribute('aria-label')) e.setAttribute('aria-label', v);
    if (e.hasAttribute('title')) e.setAttribute('title', v);
  }
}
function setLang(l){
  LANG = l === 'en' ? 'en' : 'th';
  applyStaticLang();
  if (typeof dirty !== 'undefined') dirty = true;
  if (typeof renderPanel === 'function' && typeof DER !== 'undefined' && DER) renderPanel();
  if (typeof renderSettings === 'function') renderSettings();
  if (typeof renderGoal === 'function' && typeof DER !== 'undefined' && DER) renderGoal();
  if (typeof showTitleTexts === 'function') showTitleTexts();
}

/* the realm's money: เบี้ย in Thai, Bia in English */
const CUR = () => L('เบี้ย', 'Bia');
/* (v111) the money is เบี้ย (Bia), the cowrie shell once traded across the old Thai kingdoms. Saves written before
   kept it in a field called "zeny": move it over, once, wherever a save or a bank is read (1 old unit = 1 เบี้ย). */
function biaMig(o){ const OLD = 'ze' + 'ny';
  if (o && typeof o === 'object' && OLD in o){ if (!(+o.bia > 0)) o.bia = +o[OLD] || 0; delete o[OLD]; }
  return o; }
