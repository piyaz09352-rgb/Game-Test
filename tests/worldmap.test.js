/* VAYRATHEN — tests/worldmap.test.js — the painted world map (M): the picture loads, every region has a marker on
   land inside the picture, markers and labels don't pile up, tapping a marker selects that region, and the map fits
   the window on a desktop, a phone held upright and a phone on its side ("cover": the picture fills the whole view, no
   empty bands, and pans to show the rest). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

async function openMap(page){
  await page.evaluate(() => { S.visited = S.visited || {}; [1, 2, 9, 13].forEach(i => { S.visited[i] = 1; }); openWin('world'); });
  await page.waitForFunction(() => { const im = document.querySelector('#wmPic .wmimg'); return im && im.complete && im.naturalWidth > 0; }, null, { timeout: 30000 });
  await page.waitForTimeout(400);
}
/* marker, label and picture boxes as the player sees them */
const boxes = () => {
  const r = e => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const img = document.querySelector('#wmPic .wmimg'), view = document.getElementById('wmView'), win = document.getElementById('win-world');
  return { n: MAPS.length, here: MAP_ID, img: r(img), view: r(view), win: r(win), vw: innerWidth, vh: innerHeight, nat: [img.naturalWidth, img.naturalHeight],
    marks: [...document.querySelectorAll('#wmPic .wmk')].map(e => ({ id: +e.dataset.wmsel, ...r(e) })),
    labels: [...document.querySelectorAll('#wmPic .wml')].filter(e => getComputedStyle(e).display !== 'none').map(e => ({ id: +e.dataset.wml, ...r(e) })) };
};
const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

test('world map: picture, a marker on land for every region, no pile-ups, click selects', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Mapper');
    await openMap(page);
    const B = await page.evaluate(boxes);
    assert.ok(B.nat[0] >= 512 && B.nat[1] >= 512, 'the world picture loaded: ' + B.nat);
    assert.strictEqual(B.marks.length, B.n, 'one marker per region');
    assert.deepStrictEqual(B.marks.map(m => m.id).sort((a, b) => a - b), [...Array(B.n).keys()], 'every region id has its marker');
    for (const m of B.marks){ const cx = m.l + m.w / 2, cy = m.t + m.h / 2;
      assert.ok(cx > B.img.l && cx < B.img.r && cy > B.img.t && cy < B.img.b, `marker ${m.id} sits inside the picture`); }
    for (let i = 0; i < B.marks.length; i++) for (let j = i + 1; j < B.marks.length; j++){ const a = B.marks[i], b = B.marks[j];
      assert.ok(overlap(a, b) < .25 * Math.min(a.w * a.h, b.w * b.h), `markers ${a.id} and ${b.id} do not overlap`); }
    assert.ok(B.labels.length >= 10, 'most region names are shown at the fitted size: ' + B.labels.length);
    for (let i = 0; i < B.labels.length; i++){ const a = B.labels[i];
      for (let j = i + 1; j < B.labels.length; j++) assert.ok(overlap(a, B.labels[j]) < 2, `labels ${a.id} and ${B.labels[j].id} do not overlap`);
      for (const m of B.marks) assert.ok(overlap(a, m) < 2, `label ${a.id} does not cover marker ${m.id}`); }
    // every marker stands on land: sample the picture around each spot and count deep-sea pixels
    const sea = await page.evaluate(() => { const im = document.querySelector('#wmPic .wmimg'), c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0); const out = {};
      MAPS.forEach((m, i) => { const [fx, fy] = wmPic(i), x = Math.round(fx * c.width), y = Math.round(fy * c.height), d = g.getImageData(x - 6, y - 6, 13, 13).data; let n = 0, t = 0;
        for (let k = 0; k < d.length; k += 8){ t++; const r = d[k], gg = d[k + 1], b = d[k + 2]; if (b > 140 && r < 90 && b > gg + 30) n++; } out[i] = n / t; });
      return out; });
    for (const i in sea) assert.ok(sea[i] < .6, `region ${i} is on land, not in the sea (${(sea[i] * 100).toFixed(0)}% sea)`);
    // the capital is marked as one, the current region carries the you-are-here pin
    assert.ok(await page.$('#wmPic .wmk.cap[data-wmsel="0"]'), 'Aren has the capital marker');
    assert.ok(await page.$(`#wmPic .wmk.here[data-wmsel="${await page.evaluate(() => MAP_ID)}"]`), 'the current region pulses');
    assert.ok(await page.$('#wmPic .wmhere'), 'you-are-here pin');
    // routes: one dotted path per link (31 regions on a tree of roads: at least 30), lit when both ends are visited
    const R = await page.evaluate(() => ({ n: document.querySelectorAll('#wmPic .wmr').length, links: wmLinks().length, lit: document.querySelectorAll('#wmPic .wmr.lit').length }));
    assert.ok(R.links >= 30 && R.n === R.links, 'a route for every link: ' + JSON.stringify(R));
    assert.ok(R.lit >= 2, 'routes between visited regions are lit');
    // unvisited regions are fogged and dimmed
    const fog = await page.evaluate(() => ({ fog: document.querySelectorAll('#wmPic .wmfog').length, unk: document.querySelectorAll('#wmPic .wmk.unk').length, unseen: MAPS.filter((m, i) => !S.visited[i]).length }));
    assert.ok(fog.fog === fog.unseen && fog.unk === fog.unseen, 'fog over every unvisited region: ' + JSON.stringify(fog));
    // tap a marker: that region is selected and the side panel shows it
    for (const id of [13, 23]){
      await page.click(`#wmPic .wmk[data-wmsel="${id}"]`);
      const sel = await page.evaluate(() => ({ sel: WM.sel, ban: document.querySelector('#pane-world .wmban b').textContent, name: nm(MAPS[WM.sel]), warp: +document.querySelector('#pane-world [data-warp]').dataset.warp,
        selMark: !!document.querySelector(`#wmPic .wmk.sel[data-wmsel="${WM.sel}"]`) }));
      assert.strictEqual(sel.sel, id, `clicking marker ${id} selects it`);
      assert.strictEqual(sel.ban, sel.name, 'the side panel shows the selected region');
      assert.strictEqual(sel.warp, id, 'the warp button is for the selected region');
      assert.ok(sel.selMark, 'the selected marker is ringed');
    }
    // zoom in: the picture grows and pans, the selection stays
    const w0 = await page.evaluate(() => document.getElementById('wmPic').offsetWidth);
    await page.click('[data-wmz="1"]');
    const z = await page.evaluate(() => { const v = document.getElementById('wmView'); return { w: document.getElementById('wmPic').offsetWidth, sw: v.scrollWidth, cw: v.clientWidth }; });
    assert.ok(z.w > w0 * 1.3 && z.sw > z.cw, 'zoom makes the picture larger and pannable: ' + JSON.stringify(z));
    await page.click('[data-wmz="-1"]');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('world map covers the view: desktop, phone portrait and landscape', { skip, timeout: 300000 }, async () => {
  for (const [w, h] of [[1280, 720], [390, 844], [844, 390]]){
    const { page, errors, close } = await openGame({ width: w, height: h });
    try {
      await enterWorld(page, 'Fit');
      await openMap(page);
      const B = await page.evaluate(boxes), tag = `${w}x${h}`;
      assert.ok(B.view.l >= -1 && B.view.r <= B.vw + 1 && B.view.t >= -1 && B.view.b <= B.vh + 1, `${tag}: the map view is on screen ${JSON.stringify(B.view)}`);
      // "cover": the picture fills the whole view (no empty bands left/right or above/below), the rest pans
      assert.ok(B.img.w >= B.view.w - 1 && B.img.h >= B.view.h - 1, `${tag}: the picture covers the view ${JSON.stringify({ img: B.img, view: B.view })}`);
      assert.ok(Math.abs(B.img.w - Math.max(B.view.w, B.view.h)) <= 2, `${tag}: at the default zoom the picture is exactly as large as the view's larger side`);
      assert.ok(B.img.l <= B.view.l + 1 && B.img.r >= B.view.r - 1 && B.img.t <= B.view.t + 1 && B.img.b >= B.view.b - 1, `${tag}: no empty band inside the view`);
      assert.ok(B.view.h > 150, `${tag}: the map view is not tiny (${B.view.h}px)`);
      const here = B.marks.find(m => m.id === B.here), hx = here.l + here.w / 2, hy = here.t + here.h / 2;
      assert.ok(hx > B.view.l && hx < B.view.r && hy > B.view.t && hy < B.view.b, `${tag}: the view opens on the player's region`);
      // zooming out never goes below cover; zooming in and back keeps covering
      await page.click('[data-wmz="-1"]'); await page.click('[data-wmz="1"]'); await page.click('[data-wmz="-1"]');
      const Z = await page.evaluate(boxes);
      assert.ok(Z.img.w >= Z.view.w - 1 && Z.img.h >= Z.view.h - 1, `${tag}: still covering after - / + zoom`);
      for (const m of B.marks){ const cx = m.l + m.w / 2, cy = m.t + m.h / 2; assert.ok(cx > B.img.l && cx < B.img.r && cy > B.img.t && cy < B.img.b, `${tag}: marker ${m.id} inside the picture`); }
      const id = 9; await page.click(`#wmPic .wmk[data-wmsel="${id}"]`);
      assert.strictEqual(await page.evaluate(() => WM.sel), id, `${tag}: tap selects`);
    } finally { await close(); }
    assert.deepStrictEqual(errors, [], `no runtime errors at ${w}x${h}`);
  }
});
