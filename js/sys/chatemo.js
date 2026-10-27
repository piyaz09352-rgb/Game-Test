/* VAYRATHEN — js/sys/chatemo.js — (v160) emoticons in the chat, and an emote wheel you can see the game behind
   · The smile button in the chat box opened the emote wheel, and the wheel hid the whole game: the light theme
     painted every pop-up panel cream, including the wheel's full-screen backdrop. The labels under the faces were
     dark on dark and the twelve buttons crowded each other on a small ring.
   · Now the smile button opens a small panel just above the chat input with two tabs:
       อีโมจิ  — 48 faces and symbols in a grid; a tap puts one into your message at the cursor (the panel stays open
                 so you can add more; Enter still sends)
       ท่าทาง — your character's emotes (wave, wai, dance …) as one tap each, the same ones as the wheel
   · The wheel (key V) keeps the game visible behind a light dim, is bigger so no two buttons touch, and its labels
     are light on the dark ring. */
'use strict';

const CHEMO = {tab:'emoji', open:false};
const CHEMO_LIST = ['😀', '😁', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤩', '🥳', '😇', '🤔', '😅', '😴', '😭',
  '😢', '😡', '🤬', '😱', '🙄', '😏', '🤗', '🙏', '👍', '👎', '👏', '🙌', '💪', '✌️', '👋', '🤝',
  '❤️', '💔', '🔥', '✨', '⭐', '🎉', '🎁', '💰', '⚔️', '🛡️', '🏹', '🔮', '💀', '👑', '🐘', '🐉'];
function chemoPanel(){
  let p = document.getElementById('chatEmo');
  if (!p){ p = document.createElement('div'); p.id = 'chatEmo'; p.className = 'chemo'; const f = document.getElementById('chatForm'); if (!f) return null; f.parentNode.insertBefore(p, f); }
  const emo = typeof EMOTES !== 'undefined' ? EMOTES : [];
  p.innerHTML = `<div class="chemotabs"><button type="button" class="${CHEMO.tab === 'emoji' ? 'on' : ''}" data-chemotab="emoji">${L('อีโมจิ', 'Emoji')}</button><button type="button" class="${CHEMO.tab === 'emote' ? 'on' : ''}" data-chemotab="emote">${L('ท่าทาง', 'Emotes')}</button><button type="button" class="chemox" data-chemox="1" aria-label="${L('ปิด', 'Close')}">✕</button></div>
    ${CHEMO.tab === 'emoji' ? `<div class="chemogrid">${CHEMO_LIST.map(e => `<button type="button" data-chemoji="${e}">${e}</button>`).join('')}</div>`
      : `<div class="chemogrid act">${emo.map(e => `<button type="button" data-emo="${e.id}"><i>${e.e}</i><small>${L(e.th || e.name || e.id, e.en || e.id)}</small></button>`).join('')}</div>`}`;
  return p;
}
function chemoShow(on){ CHEMO.open = on; const p = on ? chemoPanel() : document.getElementById('chatEmo'); if (p) p.hidden = !on; }
/* the chat's smile button opens the panel instead of the wheel */
{ const b = document.querySelector('#chatForm .cemo'); if (b){ b.removeAttribute('data-emopen'); b.dataset.chemo = '1'; b.title = L('อีโมจิ · ท่าทาง', 'Emoji · emotes'); } }
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-chemo],[data-chemotab],[data-chemoji],[data-chemox],#chatEmo [data-emo]');
  if (!t){ if (CHEMO.open && !(e.target.closest && e.target.closest('#chatEmo,#chatForm'))) chemoShow(false); return; }
  e.preventDefault();
  if (t.dataset.chemo){ chemoShow(!CHEMO.open); return; }
  if (t.dataset.chemotab){ CHEMO.tab = t.dataset.chemotab; chemoPanel(); return; }
  if (t.dataset.chemox){ chemoShow(false); return; }
  if (t.dataset.chemoji){ const i = document.getElementById('chatIn'); if (!i) return; const a = i.selectionStart ?? i.value.length, z = i.selectionEnd ?? a, add = t.dataset.chemoji;
    if ((i.value.length - (z - a) + add.length) > (+i.maxLength || 120)) return;
    i.value = i.value.slice(0, a) + add + i.value.slice(z); const c = a + add.length; i.focus(); try { i.setSelectionRange(c, c); } catch (er) {} return; }
  // an emote from the panel: the wheel's own handler plays it (it listens for [data-emo]); just close the panel after
  setTimeout(() => chemoShow(false), 0);
}, true);
{ const st = document.createElement('style');
  st.textContent = `
html body .ui .emowheel,html body .emowheel{background:rgba(10,6,4,.22) !important;border:0 !important;box-shadow:none !important;border-radius:0 !important;padding:0 !important;backdrop-filter:none !important}
html body .emoring{width:310px !important;height:310px !important}
html body .emob{width:60px !important;height:60px !important;margin:-30px 0 0 -30px !important;transform:translate(calc(var(--x) * 1.36),calc(var(--y) * 1.36)) !important;
  background:radial-gradient(circle at 40% 30%,#6a4a2a,#2a1a0e) !important;box-shadow:inset 0 0 0 2px rgba(240,195,90,.7) !important;display:flex !important;flex-direction:column;align-items:center;justify-content:center}
html body .emob i{font-size:22px !important}
html body .emob small{color:#ffe9b0 !important;-webkit-text-fill-color:#ffe9b0 !important;font:700 10px var(--thai,sans-serif) !important;text-shadow:0 1px 2px #000}
.chemo{margin:0 0 6px;padding:6px;border-radius:12px;background:#fffaf0;box-shadow:inset 0 0 0 1.5px #dcbf86,0 4px 12px rgba(60,30,0,.18)}
.chemotabs{display:flex;gap:6px;align-items:center;margin-bottom:6px}
.chemotabs button{border:1.5px solid #dcbf86;background:#fff;color:#5a3d12;border-radius:10px;padding:2px 12px;font:700 12px var(--display,sans-serif);cursor:pointer}
.chemotabs button.on{background:#f5a623;border-color:#d4882a;color:#fff}
.chemotabs .chemox{margin-left:auto;padding:2px 8px}
.chemogrid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:4px;max-height:132px;overflow:auto}
.chemogrid button{aspect-ratio:1/1;border:0;border-radius:8px;background:#f6ecd8;font-size:19px;line-height:1;cursor:pointer;display:grid;place-items:center;padding:0}
.chemogrid button:hover{background:#ffe6b0}
.chemogrid.act{grid-template-columns:repeat(4,minmax(0,1fr))}
.chemogrid.act button{aspect-ratio:auto;padding:5px 2px;display:flex;flex-direction:column;align-items:center;gap:2px}
.chemogrid.act i{font-style:normal;font-size:20px}.chemogrid.act small{font:700 10.5px var(--thai,sans-serif);color:#5a3d12}`;
  document.head.appendChild(st); }
