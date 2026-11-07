/* VAYRATHEN — js/sys/festival213.js — (v213) festivals are back (the owner asked; js/sys/featureoff.js switch off)
   · The new wardrobe (fashion30.js) cleared every old costume when it arrived, the sixteen limited festival costumes
     with them, so Mae Nang Thetsakan had nothing to trade. They are put back here (events.js and festivals2.js keep
     them aside in EV_COS): a top and a headpiece for each of the eight festivals, tokens only, no free trial.
   · Loy Krathong now runs the whole of November (Yi Peng lanterns from the first of the month) and strings paper
     lanterns over Aren like Ok Phansa. The sky lanterns, krathong boats and fireworks are lighter than before. */
'use strict';
if (typeof EV_COS !== 'undefined') for (const id in EV_COS){ const c = EV_COS[id]; if (COSTUME[id]) continue;
  COSTUME[id] = {...c, grand:c.slot === 'top', sw:[c.look.top || c.look.hairpin || c.look.bandMat || c.look.crestMat, c.look.forearm || c.look.crestMat || c.look.bandMat || c.look.hairpin]};
  SPR.GEAR_LOOK[id] = c.slot === 'top' ? {...(typeof F_TOP0 !== 'undefined' ? F_TOP0 : TOP0), ...c.look} : {...c.look}; }
if (typeof COS_SRC !== 'undefined') COS_SRC.event = ['เทศกาล (แลกด้วยเหรียญเทศกาลที่แม่นางเทศกาล)', 'Festival (tokens at Mae Nang Thetsakan)'];
