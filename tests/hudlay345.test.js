/* VAYRATHEN — tests/hudlay345.test.js — (v345) the screen while playing, at the four landscape sizes
   The owner kept finding HUD faults on a phone: chips over the skill buttons, chips spilling out of the minimap card,
   the joystick gone, the menu button that would not close the menu. Checked here every version:
   · the main pieces are on screen: portrait card, quest card, minimap card, the four corner orbs, EXP bar (and on a
     touch screen the joystick and the attack button)
   · the chips (Auto · ออนไลน์ · พักจอ · GM) are on one line, and inside the minimap card or right under it — never
     over the field's middle, never under a button
   · no two of the pieces that must stay apart overlap (cards, orbs, chips, joystick, attack/skill buttons)
   · the menu button opens the menu and a second tap closes it */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed';
const SIZES = [['pc', 1920, 1080, {}], ['laptop', 1366, 768, {}], ['tablet', 1024, 768, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 }], ['phone', 844, 390, { hasTouch: true, isMobile: true, deviceScaleFactor: 3 }]];

for (const [nm, w, h, ctx] of SIZES) test(`HUD at ${nm} ${w}×${h}: everything on screen, nothing on top of anything, chips tidy, menu opens and closes`, { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame({ width: w, height: h, ctx });
  try {
    await enterWorld(page, 'Hud', 'hud_user_' + nm);
    await page.evaluate(() => { S.tut = { done: true, i: 99 }; loadMap(71); });
    await page.waitForTimeout(2500);
    for (let i = 0; i < 4; i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(80); }
    // all four chips showing, as for a player online with GM rights
    await page.evaluate(() => { const ch = el('chips'); for (const id of ['botChip', 'restChip', 'gmBtn', 'netChip']){ const e = document.getElementById(id); if (e){ e.hidden = false; e.style.display = ''; } }
      if (!document.getElementById('netChip')){ const d = document.createElement('div'); d.className = 'netchip'; d.id = 'netChip'; d.innerHTML = '<i></i><span>ออนไลน์ 1</span>'; ch.insertBefore(d, ch.children[1] || null); }
      for (const x of WIN_IDS) if (UIS.open[x]) closeWin(x); });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(touch => {
      const U = el('ui').getBoundingClientRect(), box = e => { if (!e || !e.offsetWidth) return null; const b = e.getBoundingClientRect(); return b.width && b.height ? b : null; };
      const on = b => b && b.left >= U.left - 2 && b.top >= U.top - 2 && b.right <= U.right + 2 && b.bottom <= U.bottom + 2;
      const hit = (a, b) => a && b && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      const P = {char:box(el('charCard')), quest:box(el('goalCard')), map:box(el('mapCard')), orbs:box(el('h6Icons')), exp:box(el('h6Exp')), chips:box(el('chips'))};
      if (touch){ P.joy = box(el('joy')); P.atk = box(document.querySelector('#ui .mo.atk')); }
      const out = [];
      for (const k in P) if (!P[k]) out.push(k + ' missing'); else if (!on(P[k])) out.push(k + ' off screen');
      // the chips: one line, inside the minimap card or just under it
      const ch = el('chips'), kids = [...ch.children].filter(e => e.offsetWidth);
      const lines = new Set(kids.map(e => Math.round(e.getBoundingClientRect().top / 4))); if (lines.size > 1) out.push('chips on ' + lines.size + ' lines');
      for (const e of kids){ const b = e.getBoundingClientRect(), t = e.querySelector('span') || e; if (t.getBoundingClientRect().height > b.height + 2 || b.height > 34) out.push('a chip wraps: ' + e.textContent.trim()); }
      if (P.chips && P.map){ const inCard = ch.parentNode === el('mapCard'), under = P.chips.top >= P.map.bottom - 2 && P.chips.top < P.map.bottom + 40 && P.chips.right <= P.map.right + 4 && P.chips.left >= P.map.left - 120;
        if (inCard && (P.chips.left < P.map.left || P.chips.right > P.map.right + 1 || P.chips.bottom > P.map.bottom + 1)) out.push('chips spill out of the minimap card');
        if (!inCard && !under) out.push('chips are neither in nor under the minimap card'); }
      // nothing on top of anything
      const pairs = [['char', 'map'], ['quest', 'map'], ['orbs', 'quest'], ['chips', 'orbs'], ['chips', 'quest'], ['chips', 'char'], ['exp', 'map']];
      if (touch) pairs.push(['joy', 'atk'], ['joy', 'exp'], ['joy', 'quest'], ['atk', 'map'], ['atk', 'chips']);
      for (const [a, b] of pairs) if (hit(P[a], P[b])) out.push(`${a} overlaps ${b}`);
      for (const b of document.querySelectorAll('#ui .mo')){ const B = box(b); if (B && hit(B, P.chips)) { out.push('a touch button lies under the chips'); break; } }
      return out; }, !!ctx.hasTouch);
    // the menu: open, then the same button closes it
    const mb = await page.evaluate(() => { const b = document.querySelector('[data-h6="menu"]'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    const tap = async () => { if (ctx.hasTouch) await page.touchscreen.tap(mb[0], mb[1]); else await page.mouse.click(mb[0], mb[1]); await page.waitForTimeout(350); };
    if (!mb) r.push('menu button missing'); else {
      await tap(); const open = await page.evaluate(() => !RAIL.fold); await tap(); const shut = await page.evaluate(() => RAIL.fold);
      if (!open) r.push('the menu button does not open the menu'); if (!shut) r.push('a second tap on the menu button does not close it'); }
    assert.deepStrictEqual(r, [], nm);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
