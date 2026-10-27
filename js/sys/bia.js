/* VAYRATHEN — js/sys/bia.js — (v111) เบี้ย (Bia): the kingdom's money
   The cowrie shell was real money in the old Thai kingdoms, carried up from the Andaman shore. In Vayrathen it is the
   everyday money (prices, rewards, refining, trade); Vayra Coins ◈ stay the special money. The shell icon is drawn
   here as an SVG and used as a CSS background on <i class="biaI">, wherever a price shows its icon. */
'use strict';

const BIA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 20"><defs><radialGradient id="g" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#fffbe8"/><stop offset=".55" stop-color="#f3d58a"/><stop offset="1" stop-color="#c8902e"/></radialGradient></defs><ellipse cx="12" cy="10" rx="10.6" ry="8.6" fill="url(#g)" stroke="#8a5a14" stroke-width="1.3"/><path d="M4.6 10.4c2.4.9 4.9 1.3 7.4 1.3s5-.4 7.4-1.3" fill="none" stroke="#6a3f08" stroke-width="1.6" stroke-linecap="round"/><path d="M7 10.6v1.6M9.4 11.1v1.5M12 11.3v1.5M14.6 11.1v1.5M17 10.6v1.6" stroke="#6a3f08" stroke-width="1" stroke-linecap="round"/><ellipse cx="9" cy="6" rx="3" ry="1.6" fill="#fff" opacity=".55"/></svg>`;
{ const st = document.createElement('style');
  st.textContent = `.biaI{display:inline-block;width:1.15em;height:.95em;vertical-align:-.12em;margin-right:.15em;background:url("data:image/svg+xml,${encodeURIComponent(BIA_SVG)}") center/contain no-repeat;font-style:normal}
  i.cz .biaI,.cz > .biaI{margin-right:0}`;
  document.head.appendChild(st); }

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'bia', t:['เบี้ย · เงินของอาณาจักร', 'Bia · the kingdom\'s money'], b:() => `<p><i class="biaI"></i>${L(
  'เบี้ย คือเปลือกหอยเล็กๆ ที่พ่อค้าขนขึ้นมาจากฝั่งทะเลอันดามัน คนทั้งอาณาจักรวายราใช้แลกข้าวของกันมาแต่โบราณ ทุกวันนี้ร้านค้า รางวัลเควสต์ ค่าตีบวก ค่าเจาะรู และการแลกของระหว่างผู้เล่น ล้วนใช้เบี้ย ส่วนเหรียญวายรา ◈ เป็นเงินพิเศษที่ได้จากความสำเร็จและอันดับ',
  'Bia are small cowrie shells that traders carried up from the Andaman shore; the whole kingdom of Vayrathen has paid in them since the old days. Shops, quest rewards, refining, socket drilling and trades between players all use Bia. Vayra Coins ◈ are the special money earned from achievements and rankings.')}</p>`});
