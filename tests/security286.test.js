/* VAYRATHEN — tests/security286.test.js — (v286) what one player's game sends the others is held to sane amounts:
   shared party EXP is capped by what a kill on this map can give and rate-limited per teammate; chat floods are dropped */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('party EXP is capped and rate-limited, chat floods are dropped', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const cap = pexpCap(), best = Math.max(...MAPS[MAP_ID].mobs.map(t => MOB[t].exp), MOB[MAPS[MAP_ID].boss].exp);
      // a forged share of a billion EXP from a "teammate"
      NET.party = 'p1'; const me = typeof ptyMe === 'function' ? ptyMe() : null; let got = 0; const _g = gainExp; gainExp = (b, j) => { got += b; };
      onPartyExp({isMe:false, by:'cheater', peer:'x', data:{pt:'p1', m:MAP_ID, x:P.x, y:P.y, e:1e9, j:1e9, mode:'even', to:[me]}});
      gainExp = _g;
      let ok = 0; for (let i = 0; i < 20; i++) if (pexpRate('spammer')) ok++;
      let chat = 0; const n0 = NET.chat.length; for (let i = 0; i < 20; i++) onChat({isMe:false, by:'flooder', data:{c:'all', t:'spam ' + i, n:'F'}}); chat = NET.chat.length - n0;
      NET.party = null;
      return {cap, best, got, ok, chat};
    });
    assert.ok(r.cap.e >= r.best * 1.5 && r.cap.e < r.best * 10 + 100, 'the cap covers a real kill here, no more: ' + JSON.stringify(r));
    assert.ok(r.got > 0 && r.got <= r.cap.e, 'a forged billion gives at most the cap: ' + JSON.stringify(r));
    assert.strictEqual(r.ok, 6, 'six shares a second from one teammate');
    assert.strictEqual(r.chat, 5, 'five lines in four seconds from one sender');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
