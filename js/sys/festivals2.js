/* VAYRATHEN — js/sys/festivals2.js — four more Thai festivals on the calendar (events.js runs them)
   ตรุษจีน (Chinese New Year, 25 Jan – 15 Feb) · บุญบั้งไฟ (Rocket Festival, 8–20 May) · ผีตาโขน (Phi Ta Khon, 25 Jun – 10 Jul) ·
   แห่เทียนพรรษา (Candle Procession, 15–31 Jul). Each has its own tokens, festival spirit and two limited costumes at
   Mae Nang Thetsakan; Chinese New Year and the Rocket Festival light the night sky. */
'use strict';

Object.assign(EVENTS, {
  cny:{th:'ตรุษจีน', en:'Chinese New Year', from:[1, 25], to:[2, 15], col:'#ff5a4a', tok:['เหรียญอั่งเปา', 'Ang Pao token'], sp:['ภูตสิงโตทอง', 'Golden Lion Spirit']},
  bungfai:{th:'บุญบั้งไฟ', en:'Rocket Festival', from:[5, 8], to:[5, 20], col:'#ffb04a', tok:['เหรียญบั้งไฟ', 'Rocket token'], sp:['ภูตพญาแถน', 'Phaya Thaen Spirit']},
  phitakhon:{th:'ผีตาโขน', en:'Phi Ta Khon', from:[6, 25], to:[7, 10], col:'#c86aff', tok:['เหรียญผีตาโขน', 'Phi Ta Khon token'], sp:['ภูตหน้ากากผีตาโขน', 'Masked Ghost Spirit']},
  candle:{th:'แห่เทียนพรรษา', en:'Candle Procession', from:[7, 15], to:[7, 31], col:'#ffd27a', tok:['เหรียญเทียนพรรษา', 'Candle token'], sp:['ภูตเทียนแกะสลัก', 'Carved Candle Spirit']}
});
{
  const ev = {
    c_ev_cny:{slot:'top', ev:'cny', th:'ชุดกี่เพ้ามังกรแดง', en:'Red Dragon Qipao', tok:40, look:{top:'scarlet', sleeve:'scarlet', forearm:'skin', armband:'gold', pants:'scarlet', bootCuff:'gold', belt:'gold', skirtM:'scarlet', skirtT:'gold', necklace:true, neckMat:'gold'}},
    hc_ev_cny:{slot:'head', ev:'cny', th:'ปิ่นดอกเหมยทอง', en:'Golden Plum Pin', tok:20, look:{hat:null, hairpin:'gold'}},
    c_ev_bungfai:{slot:'top', ev:'bungfai', th:'ชุดหมอลำบั้งไฟ', en:'Rocket Festival Mor Lam Wear', tok:40, look:{top:'sun', sleeve:'sun', forearm:'skin', armband:'ember', pants:'indigo', bootCuff:'ember', belt:'ember', skirtM:'indigo', skirtT:'sun'}},
    hc_ev_bungfai:{slot:'head', ev:'bungfai', th:'ผ้าโพกหัวพญาแถน', en:'Phaya Thaen Headwrap', tok:20, look:{hat:'band', bandMat:'ember'}},
    c_ev_phitakhon:{slot:'top', ev:'phitakhon', th:'ชุดผีตาโขนผ้าหลากสี', en:'Phi Ta Khon Patchwork', tok:40, look:{top:'plum', sleeve:'jade', forearm:'sun', armband:'scarlet', pants:'indigo', bootCuff:'sun', belt:'scarlet', cape:'jade', capeTex:'gold'}},
    hc_ev_phitakhon:{slot:'head', ev:'phitakhon', th:'หน้ากากผีตาโขน', en:'Phi Ta Khon Mask', tok:20, look:{hat:'crest', bandMat:'scarlet', crestMat:'jade', crestN:5}},
    c_ev_candle:{slot:'top', ev:'candle', th:'ชุดผ้าไหมแห่เทียน', en:'Candle Procession Silk', tok:40, look:{top:'ivory', sleeve:'ivory', forearm:'skin', armband:'gold', pants:'ochre', bootCuff:'gold', belt:'gold', skirtM:'ochre', skirtT:'gold', necklace:true, neckMat:'gold'}},
    hc_ev_candle:{slot:'head', ev:'candle', th:'มงกุฎเทียนแกะสลัก', en:'Carved Candle Crown', tok:20, look:{hat:'crest', bandMat:'gold', crestMat:'ivory', crestN:7}}
  };
  for (const id in ev){ const c = {...ev[id], src:'event'}; COSTUME[id] = c; SPR.GEAR_LOOK[id] = c.slot === 'top' ? {...TOP0, ...c.look} : {...c.look}; (window.EV_COS = window.EV_COS || {})[id] = c; }   // (v213) kept aside: the new wardrobe (fashion30.js) clears COSTUME
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'festivals2', t:['ปฏิทินเทศกาล', 'Festival calendar'], b:() => `<table class="wkt"><tr><th>${L('เทศกาล', 'Festival')}</th><th>${L('ช่วงเวลา', 'When')}</th><th>${L('เหรียญ', 'Token')}</th></tr>
  ${Object.keys(EVENTS).map(k => { const E = EVENTS[k]; return `<tr><td>${L(E.th, E.en)}</td><td>${E.from[1]}/${E.from[0]} – ${E.to[1]}/${E.to[0]}</td><td>${L(...E.tok)}</td></tr>`; }).join('')}</table>
  <p>${L('ระหว่างเทศกาล: EXP +10% · เหรียญเทศกาลดรอป · ภูตเทศกาลโผล่ทุก 15 นาที · แลกชุดลิมิเต็ดกับแม่นางเทศกาลในอาเรน', 'During a festival: +10% EXP · festival tokens drop · a festival spirit every 15 minutes · trade for limited costumes with Mae Nang Thetsakan in Aren')}</p>`});
