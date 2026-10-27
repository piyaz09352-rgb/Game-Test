/* VAYRATHEN — js/sys/npctag.js — short NPC name tags
   The tag over each NPC is now just "name • job" in a few words (บุญมา • คนเลี้ยงสัตว์) instead of the full title
   and every service. The full name and services still show when you talk to them. NPCs not listed here get
   their own name and the first part of their role.
   v32: the tag shows only the job (ร้านยา, ช่างหลอม …) in bigger lettering; the nickname is gone. */
'use strict';

const NPC_TAG = {
  job:['วายรา', 'เปลี่ยนอาชีพ', 'Vayra', 'Job Master'],
  shop:['บัวคำ', 'ร้านยา', 'Buakham', 'Potions'],
  trader:['ฮง', 'ตลาด', 'Hong', 'Market'],
  boatman:['พุ่ม', 'วาร์ป', 'Phum', 'Warp'],
  banker:['ทองดี', 'คลัง', 'Thongdee', 'Bank'],
  tailor:['ลดา', 'ช่างตัดชุด', 'Lada', 'Tailor'],
  teller:['ยายเล่า', 'เล่าเรื่อง', 'Grandma Lao', 'Stories'],
  forger:['อินทร์', 'ช่างหลอม', 'In', 'Crafting'],
  registrar:['แก้ว', 'กิลด์', 'Kaew', 'Guilds'],
  gatekeeper:['แสง', 'ดันเจี้ยน', 'Saeng', 'Dungeons'],
  festival:['แม่นาง', 'เทศกาล', 'Mae Nang', 'Festivals'],
  general:['ไชยันต์', 'สงครามปราสาท', 'Chaiyan', 'Siege'],
  smith:['เพชร', 'ตีบวก', 'Phet', 'Refine'],
  beastkeeper:['บุญมา', 'คนเลี้ยงสัตว์', 'Boonma', 'Beast Keeper'],
  cook:['สายใจ', 'แม่ครัว', 'Saijai', 'Cook'],
  campcook:['สายใจ', 'แม่ครัว', 'Saijai', 'Cook'],
  herbal:['เพ็ง', 'หมอยา', 'Pheng', 'Herbalist'],
  warp:['ผู้เฝ้าศาล', 'วาร์ป', 'Shrine Keeper', 'Warp'],
  quarter:['ลุงเสบียง', 'แคมป์', 'Uncle Sabiang', 'Camp'],
};
function npcTag(n){
  const t = NPC_TAG[n.id];
  if (t) return L(t[1], t[3]);   // v32: just the job, no nickname
  const role = String(L(n.role, n.roleEn) || '').split('·')[0].trim();
  return role || nm(n);
}
/* v32: the NPC tag is drawn larger and bolder than player tags: cream lettering on a warm brown pill with a gold rim */
function npcNameTag(x, y, s){
  if (!SETTINGS.nameTags) return;
  const z = clamp(PX / 2, .5, 2.6), fs = Math.round(15 * z); ctx.font = F(700, fs);
  const w = ctx.measureText(s).width + 16 * z, h = fs + 8 * z, top = y - fs - 1 * z;
  ctx.fillStyle = 'rgba(74,38,12,.86)'; ctx.strokeStyle = 'rgba(255,214,110,.9)'; ctx.lineWidth = Math.max(1, 1.2 * z);
  ctx.beginPath(); ctx.roundRect(x - w / 2, top, w, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff1c4'; ctx.textAlign = 'center'; ctx.fillText(s, x, y + 2 * z);
}
