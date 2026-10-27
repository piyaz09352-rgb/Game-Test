/* VAYRATHEN — js/sys/banner2.js — a small, tidy announcement instead of the big centre banner
   The old banner was a huge pill in the middle of the screen that hid the fight. Now it is a slim card near the top:
   a short headline (bold) and, if the message is long, one quiet line under it that is cut with "…".
   Boss news gets a red edge, festivals a gold edge, everything else blue. The full text still goes to the log. */
'use strict';

const bannerText = s => { try { return (new DOMParser().parseFromString(String(s), 'text/html').body.textContent || '').trim(); } catch (e) { return String(s).replace(/<[^>]*>/g, '').trim(); } };   // DOMParser never runs anything
function bannerSplit(s){
  const t = bannerText(s);
  // headline: up to the first "!" (if it comes early), otherwise up to the first " · "
  let i = t.indexOf('!'); if (i < 0 || i > 64) i = -1;
  if (i >= 0) return [t.slice(0, i + 1).trim(), t.slice(i + 1).replace(/^[\s·]+/, '').trim()];
  const j = t.indexOf(' · '); if (j > 0 && j < 64) return [t.slice(0, j).trim(), t.slice(j + 3).trim()];
  return [t, ''];
}
banner = function(s){
  const b = $('#banner'); if (!b) return;
  const plain = bannerText(s), kind = /boss|บอส|♛|☠|ราหู|MVP/i.test(plain) ? 'bz' : /🎉|เทศกาล|festival/i.test(plain) ? 'fe' : 'nf';
  const [h, sub] = bannerSplit(s);
  b.className = `banner bn2 ${kind}`;
  b.innerHTML = `<b class="bnh"></b>${sub ? '<small class="bns"></small>' : ''}`;
  b.querySelector('.bnh').textContent = h; if (sub) b.querySelector('.bns').textContent = sub;
  // an achievement card is showing at the top: sit just under it instead of on top of it
  const ap = document.getElementById('achPop'); b.style.marginTop = ''; if (ap && !ap.hidden && ap.classList.contains('show')){ const r = ap.getBoundingClientRect(), u = (document.getElementById('ui') || document.body).getBoundingClientRect(), top = parseFloat(getComputedStyle(b).top) || 0; b.style.marginTop = Math.max(0, r.bottom - u.top + 6 - top) + 'px'; }
  // (v132) restart the slide-in on the next frame instead of forcing a full page layout right now (~80 ms with the HUD up)
  b.hidden = false; b.classList.remove('show'); requestAnimationFrame(() => b.classList.add('show')); bannerT = sub ? 4 : 3;
};
{ const st = document.createElement('style');
  st.textContent = `
#banner.bn2{top:76px !important;left:50% !important;transform:translateX(-50%) !important;max-width:min(420px,84vw) !important;min-width:0;padding:6px 16px 7px !important;
  border-radius:12px !important;border:2px solid #fff !important;background:rgba(255,255,255,.93) !important;box-shadow:0 2px 0 rgba(120,160,210,.55),0 6px 16px rgba(20,40,80,.22) !important;
  font:600 14px/1.25 var(--display,sans-serif) !important;letter-spacing:0 !important;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1px;pointer-events:none}
#banner.bn2::before{content:"";position:absolute;left:8px;right:8px;top:-2px;height:3px;border-radius:2px;background:#6fb2ff}
#banner.bn2::after{display:none}
#banner.bn2.bz::before{background:linear-gradient(90deg,#ff5a4a,#ffb04a)}#banner.bn2.fe::before{background:linear-gradient(90deg,#ffcf4a,#ff8ac8)}
#banner.bn2 .bnh{font-size:14px;font-weight:700;color:#24324a !important;-webkit-text-fill-color:#24324a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#banner.bn2.bz .bnh{color:#a3241a !important;-webkit-text-fill-color:#a3241a}
#banner.bn2 .bns{font-size:11.5px;font-weight:500;color:#5a6a84 !important;-webkit-text-fill-color:#5a6a84;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#banner.bn2.show{animation:bn2In .35s cubic-bezier(.2,.9,.3,1.2)}
@keyframes bn2In{from{opacity:0;transform:translate(-50%,-10px) scale(.96)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
@media (max-height:500px){#banner.bn2{top:52px !important;padding:4px 12px 5px !important}#banner.bn2 .bnh{font-size:13px}#banner.bn2 .bns{font-size:10.5px}}`;
  document.head.appendChild(st); }
