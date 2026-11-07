/* VAYRATHEN — js/sys/marketgear221.js — (v221) the market buys worn gear too
   The owner asked for Taokae Hong at the central market to buy equipment like the blacksmith does. His dialog has a
   «ขายอุปกรณ์สวมใส่» button that opens the blacksmith's sell window on its own (only the sell tab, the same prices,
   grade picks, locks and «keep better than worn» guards), titled as the market's. */
'use strict';
{ const _wr = WIN_RENDER.forge;
  WIN_RENDER.forge = function(){ const r = _wr.apply(this, arguments);
    const sp = document.querySelector('#win-forge header .wt b span, #win-forge header.wt b span'); if (sp){ const mk = RF.only === 'sell';
      const th = mk ? 'ขายอุปกรณ์ · ตลาดกลาง' : 'โรงตีเหล็ก', en = mk ? 'Sell gear · Central Market' : 'Forge';
      if (sp.dataset.th !== th){ sp.dataset.th = th; sp.dataset.en = en; sp.textContent = L(th, en); } }
    return r; }; }
