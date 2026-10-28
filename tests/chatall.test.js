/* VAYRATHEN — tests/chatall.test.js — (v159) the chat shows what players say, nothing else */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('the All tab', { skip, timeout: 90000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Chat');
    const r = await page.evaluate(async () => {
      const boss = Object.keys(MOB).find(k => MOB[k].boss);
      log('Base Level 12! ได้ Stat Point +3', 'g');
      for (let i = 0; i < 4; i++) log(`${nm(MOB[boss])}: หนีไปไหนก็ไม่พ้น!!! ${i}`, 'r');
      for (let i = 0; i < 3; i++) sysMsg('หมูป่า: EXP +' + (120 + i), 'exp');
      log('ได้ Card: ★ Card ยักษ์ทศพักตร์', 'c');
      NET.chat.push({ch:'sys', who:'', text:'ได้ Card: ★ ของคนอื่น', at:Date.now() - 60000}); NET.chat.push({ch:'all', who:'Ann', text:'สวัสดีโลก', at:Date.now()});
      chatTab = 'world'; renderChat(); const world = el('chatLog').textContent;
      chatTab = 'all'; renderChat(); const all = el('chatLog').textContent;
      chatTab = 'sys'; renderChat(); const sys = el('chatLog').textContent; chatTab = 'all'; renderChat();
      return {all, sys, world, bossName:nm(MOB[boss])}; });
    // (v159) the chat is for players only: one list, no tabs, and no level ups, EXP, boss cries or item finds in it
    assert.ok(r.all.includes('สวัสดีโลก'), 'what players say shows');
    assert.ok(!r.all.includes('Base Level 12'), 'level ups stay out');
    assert.ok(!r.all.includes(r.bossName + ': หนีไปไหน'), 'boss battle cries stay out');
    assert.ok(!r.all.includes('EXP +120'), 'EXP lines stay out');
    assert.ok(!r.all.includes('Card ยักษ์') && !r.all.includes('ได้ Card'), 'item finds stay out');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
