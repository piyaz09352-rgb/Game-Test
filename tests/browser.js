/* VAYRATHEN — tests/browser.js — shared helpers for the browser tests: launch Chromium, open the game offline,
   collect every uncaught error and console.error, and get past the account + character screens. */
'use strict';
const { serve } = require('./serve');
let chromium = null;
try { ({ chromium } = require('playwright')); } catch (e) {}

async function openGame({ width = 1280, height = 720, path = '', ctx = {} } = {}){   // ctx: extra page options (a phone: isMobile, hasTouch)
  const { srv, url } = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width, height }, ...ctx });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) errors.push('console.error: ' + m.text()); });
  await page.route(u => !u.href.startsWith(url), r => r.abort());   // offline: no Firebase, no web fonts
  await page.addInitScript(() => { window.__VTEST__ = 1; });   // (v272) the hourly world boss / invasion do not turn up by the real clock in a test (a test can still force one)
  await page.goto(url + path);
  await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
  const close = async () => { await browser.close(); srv.close(); };
  return { page, errors, url, close };
}

/* the title's sign-up / log-in (js/sys/auth.js, local mode: offline): log in when this browser already has the account,
   otherwise register it; resolves when the slots show */
const TEST_PASS = 'test-pass-1';
async function signIn(page, acc = 'smoketest', pass = TEST_PASS){
  await page.waitForSelector('#auBox, [data-make], [data-play]', { timeout: 30000 });
  if (!(await page.$('#auBox'))) return;
  const login = await page.evaluate(n => ACC.name === n && !!ACC.pw, acc);
  if (login){ await page.click('#auBox [data-autab="login"][role="tab"]'); await page.fill('#auLId', acc); await page.fill('#auLPw', pass); }
  else { await page.click('#auBox [data-autab="reg"][role="tab"]'); await page.fill('#auId', acc); await page.fill('#auPw', pass); await page.fill('#auPw2', pass); }
  await page.click('#auBox [data-auth="go"]');
  await page.waitForFunction(() => !el('auBox') || (!AUTH.busy && !!el('auErr').textContent), null, { timeout: 30000 });
  const err = await page.evaluate(() => (el('auErr') ? el('auErr').textContent : ''));
  if (err) throw new Error(`sign-in as ${acc} failed: ${err}`);
}

/* account → new character → in the world */
async function enterWorld(page, name = 'Tester', acc = 'smoketest'){
  await signIn(page, acc);
  await page.waitForSelector('[data-make], [data-play]', { timeout: 30000 });
  // with the shared database (openPlayers db:true) the account's one slot may already hold a fresh hero: play it under this name
  const slot = await page.$('[data-make]') ? null : await page.$('[data-play]');
  if (slot) await slot.click();
  else { await page.click('[data-make]'); await page.waitForSelector('[data-mkgo]'); await page.fill('#mkName', name); await page.click('[data-mkgo]'); }
  await page.waitForFunction(() => !PAUSED && document.getElementById('title').hidden, null, { timeout: 30000 });   // the title fades out after play starts
  if (slot) await page.evaluate(n => { S.name = n; const c = el('confirm'); if (c) c.hidden = true; }, name);
}

module.exports = { chromium, openGame, enterWorld, signIn, TEST_PASS };

/* two (or more) players in separate browsers, sharing one fake online backend (tests/mock-net.js) */
async function openPlayers(n = 2, { merge = false, db = false } = {}){
  const { createBroker } = require('./mock-net');
  const { serve } = require('./serve');
  const { srv, url } = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const broker = createBroker({ merge, db });
  const players = [];
  for (let i = 0; i < n; i++){
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });   // own storage: own account and save
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(`P${i} pageerror: ` + (e.stack || e.message)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) errors.push(`P${i} console.error: ` + m.text()); });
    await page.route(u => !u.href.startsWith(url), r => r.abort());
    await broker.attach(page, 'u' + i);
    await page.goto(url);
    await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
    players.push({ page, errors });
  }
  const close = async () => { await browser.close(); srv.close(); };
  return { players, broker, close };
}
module.exports.openPlayers = openPlayers;
