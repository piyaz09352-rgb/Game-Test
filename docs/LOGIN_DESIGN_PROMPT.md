# ข้อความสำหรับส่งให้ ChatGPT ออกแบบหน้าล็อกอิน VAYRATHEN

วิธีใช้: คัดลอกทั้งหมดในกรอบด้านล่างไปวางใน ChatGPT แล้วเติมส่วน «สไตล์ที่อยากได้» ตามใจ
แนบรูปหน้าล็อกอินตอนนี้ (แคปจากเกม) ไปด้วยจะดีมาก ได้ CSS กลับมาแล้วส่งให้ Claude ใส่เข้าเกมและทดสอบให้

```
ช่วยออกแบบหน้าล็อกอินใหม่ให้เกมเว็บ 2D ชื่อ VAYRATHEN (อาณาจักรวายรา · "ตำนานแห่งเทพผู้ถูกผนึก")
เกมแนว RPG ไทย-หิมพานต์ ภาพการ์ตูนน่ารัก สีสดใส เล่นแนวนอนเท่านั้น

ข้อบังคับ (สำคัญมาก ห้ามเปลี่ยน ไม่งั้นระบบล็อกอินพัง):
1. ขอเป็น CSS อย่างเดียว (ไฟล์เดียว ชื่อ css/login-new.css) ห้ามแก้ HTML ห้ามเขียน JavaScript
   ห้ามเปลี่ยนหรือลบ id / class / data-attribute ใด ๆ — JavaScript ของเกมสร้าง HTML นี้เองและผูกกับชื่อเหล่านี้
2. ห้ามใช้ไลบรารีภายนอก (ไม่มี Tailwind/Bootstrap/Google Fonts ใหม่) ใช้ฟอนต์ที่มีอยู่: Sarabun, "Noto Sans Thai", sans-serif
   รูปภาพใช้ได้แค่ CSS gradient / SVG data URI เล็ก ๆ (ไม่มีไฟล์รูปใหม่)
3. ทุก selector ให้ขึ้นต้นด้วย  html body #title  เพื่อให้ชนะ CSS เดิม และใส่ !important เฉพาะที่จำเป็น
4. ต้องดูดีและไม่ล้นจอที่ขนาด (แนวนอน): 1920×1080 · 1366×768 · 1024×768 · มือถือ 844×390
   มือถือแนวนอนสูงแค่ 390px: การ์ดต้องเลื่อนอ่านได้ (overflow-y:auto) ปุ่มสูงอย่างน้อย 40px
5. ห้ามมีอนิเมชันวนไม่หยุด (เกมปิดไว้เพื่อประหยัดแบตมือถือ) ใช้ได้แค่ transition สั้น ๆ ตอน hover/focus
6. หลังการ์ดเป็นภาพแผนที่เกมเบลอ ๆ (canvas) อย่าบังทั้งจอ ให้การ์ดลอยอยู่ตรงกลาง

โครงสร้าง HTML ที่เกมสร้าง (ห้ามแก้ ใช้เป็น selector เท่านั้น):
<div class="title" id="title">
  <div class="title-card authing">
    <p class="t-eyebrow">อาณาจักรวายรา</p>
    <h2>VAYRATHEN</h2>
    <p class="t-sub">ตำนานแห่งเทพผู้ถูกผนึก</p>
    <div id="titleBody">
      <div class="au-box" id="auBox" data-m="login|reg">        ← data-m บอกว่าอยู่แท็บไหน
        <i class="au-cn tl"></i><i class="au-cn tr"></i><i class="au-cn bl"></i><i class="au-cn br"></i>   ← มุมประดับ 4 มุม
        (ปุ่ม EN/TH: [data-aulang])
        <div role="tablist">
          <button role="tab" data-autab="login" aria-selected="true|false">เข้าสู่ระบบ</button>
          <button role="tab" data-autab="reg" aria-selected="true|false">สมัครสมาชิก</button>
        </div>
        <div class="au-pane au-login">  ← แสดงเมื่อ #auBox[data-m="login"]
          <div class="au-grid one">
            <label class="au-f" data-f="auLId"><span class="au-l">ไอดี</span><span class="au-in"><span class="au-ic">(svg)</span><input id="auLId"></span></label>
            <label class="au-f" data-f="auLPw"> … <input id="auLPw" type="password"> <button data-aueye>(ไอคอนตา)</button></label>
          </div>
        </div>
        <div class="au-pane au-reg">    ← แสดงเมื่อ #auBox[data-m="reg"]
          <div class="au-grid"> ช่อง #auId · #auPw · #auPw2 (โครงเดียวกับข้างบน) </div>
          <div class="au-meter" id="auMeter" data-k="0-4"><i></i><i></i><i></i><i></i><span>ความแข็งแรงของรหัสผ่าน</span></div>
        </div>
        (ช่องติ๊ก "จดจำฉันในเครื่องนี้": input#auKeep)
        <p class="au-err" id="auErr"></p>              ← ข้อความผิดพลาด มี class "show" เมื่อมีข้อความ
        (ช่องที่ผิด: label.au-f มี class "bad")
        <button class="au-go" data-auth="go"><span class="au-t-login">เข้าสู่ระบบ</span><span class="au-t-reg">สมัครสมาชิก</span></button>
                                                      ← มี class "busy" ตอนกำลังโหลด, disabled ระหว่างรอ
        (ข้อความใต้ปุ่ม: p.au-hint)
        (ปุ่ม "เล่นแบบแขก ไม่ต้องสมัคร": [data-auguest]) (ลืมรหัส: [data-auforgot])
      </div>
    </div>
    <div class="t-btns"><button class="tbtn" id="btnTitleSettings">ตั้งค่า</button></div>
    (ปุ่ม "ติดต่อเรา · Discord" อยู่ใต้การ์ด)
  </div>
</div>

สถานะที่ต้องออกแบบให้ครบ: แท็บที่เลือก / ไม่ได้เลือก · ช่องกรอกปกติ / focus / ผิด (.au-f.bad) ·
มาตรวัดรหัสผ่าน data-k = 0,1,2,3,4 (แดง→ส้ม→เหลือง→เขียว) · ปุ่มหลักปกติ / hover / busy / disabled ·
ข้อความผิดพลาด .au-err.show · ปุ่มแขก และปุ่มลืมรหัสเป็นปุ่มรอง

ธีมเดิมของเกม (ให้เข้ากัน): พื้นการ์ดครีม #fffaf0 · ขอบทอง #e3b04b / #c9a057 · ตัวอักษรน้ำตาลเข้ม #3a2410 ·
ปุ่มหลักทองไล่สี #ffd65c → #f5a623 · สีฟ้าท้องฟ้า #3fa2f0 สำหรับลิงก์/แท็บ · โลโก้ VAYRATHEN ตัวอักษรทองเว้นช่องห่าง

สไตล์ที่อยากได้: (เติมเอง เช่น "แบบวัดไทยสีทองแดง มีลายกนกที่มุม" หรือ "หน้าต่างแก้วใสลอยบนท้องฟ้า")

ส่งกลับมาเป็นโค้ด CSS ไฟล์เดียว พร้อมคอมเมนต์ภาษาไทยสั้น ๆ ว่าแต่ละส่วนแต่งอะไร
```
