# เปิดเซิร์ฟเวอร์ VAYRATHEN ออนไลน์ด้วย Firebase (ทีละขั้น)

เกมเป็นไฟล์เว็บล้วน (HTML/JS) ไม่ต้องมีเครื่องเซิร์ฟเวอร์ของตัวเอง
ระบบออนไลน์ใช้ Firebase ของ Google:

| ส่วน | ใช้ทำอะไร |
| --- | --- |
| Authentication | ล็อกอิน (Google หรือ Guest) |
| Cloud Firestore | เซฟ อันดับ กิลด์ ตลาด บ้าน |
| Realtime Database | เห็นกันในแผนที่ แชท ปาร์ตี้ สู้มอนร่วมกัน |
| Hosting (หรือ Netlify) | ที่วางไฟล์เกมให้คนเปิด |

ใช้แพ็กเกจฟรี (Spark) เริ่มได้ ถ้าคนเล่นเยอะจนเกินโควตา ค่อยอัปเป็น Blaze (จ่ายตามใช้)

---

## ขั้นที่ 1 · สร้างโปรเจกต์ Firebase

1. เข้า https://console.firebase.google.com แล้วล็อกอินด้วยบัญชี Google
2. กด **Create a project** → ตั้งชื่อ เช่น `vayrathen` → ปิด Google Analytics ได้ → **Create project**

## ขั้นที่ 2 · เปิดระบบล็อกอิน

1. เมนูซ้าย **Build → Authentication → Get started**
2. แท็บ **Sign-in method**:
   - **Email/Password** → Enable (ปิด Email link ไว้ได้) → Save · ระบบสมัคร/เข้าสู่ระบบของเกมใช้ตัวนี้ (ไอดีของผู้เล่นกลายเป็น `ไอดี@vayrathen.game` ภายใน Firebase ผู้เล่นไม่ต้องมีอีเมลจริง)
   - ไม่ต้องเปิด Google หรือ Anonymous แล้ว
3. แท็บ **Settings → Authorized domains** → **Add domain** ใส่โดเมนเว็บของคุณ
   - เช่น `ชื่อเว็บ.netlify.app` (ถ้าใช้ Firebase Hosting มีให้แล้ว ไม่ต้องเพิ่ม)

## ขั้นที่ 3 · สร้าง Cloud Firestore

1. **Build → Firestore Database → Create database**
2. เลือกตำแหน่ง `asia-southeast1 (Singapore)` → **Production mode** → Create
3. แท็บ **Rules** → ลบของเดิม → คัดลอกทั้งหมดจากไฟล์ `firebase/firestore.rules` มาวาง → **Publish**

## ขั้นที่ 4 · สร้าง Realtime Database

1. **Build → Realtime Database → Create Database**
2. เลือก `Singapore (asia-southeast1)` → **Start in locked mode** → Enable
3. แท็บ **Rules** → วางทั้งหมดจาก `firebase/database.rules.json` → **Publish**
4. คัดลอก URL ด้านบนของหน้า เช่น `https://vayrathen-default-rtdb.asia-southeast1.firebasedatabase.app`

## ขั้นที่ 5 · เอาค่าตั้งค่ามาใส่ในเกม

1. กดรูปเฟือง ⚙ ข้าง Project Overview → **Project settings**
2. เลื่อนลงที่ **Your apps** → กดไอคอน `</>` (Web) → ตั้งชื่อแอป → **Register app**
3. จะเห็นโค้ด `const firebaseConfig = { apiKey: "...", ... }`
4. เปิดไฟล์ `js/net/firebase-config.js` ในโฟลเดอร์เกม แล้วคัดลอกแต่ละค่ามาใส่ให้ครบ
   - `databaseURL` ใช้ URL จากขั้นที่ 4

```js
const FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'vayrathen.firebaseapp.com',
  databaseURL: 'https://vayrathen-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'vayrathen',
  storageBucket: 'vayrathen.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123'
};
```

ค่า `apiKey` เปิดเผยได้ ไม่ใช่รหัสลับ ความปลอดภัยอยู่ที่ Rules ในขั้นที่ 3–4

## ขั้นที่ 6 · อัปเกมขึ้นเว็บ (เลือกทางเดียว)

### ทาง A · Netlify (ง่ายสุด ลากวาง)

1. เข้า https://app.netlify.com/drop แล้วล็อกอิน
2. ลากทั้งโฟลเดอร์เกม (ที่มี `index.html`) ไปวาง
3. ได้ลิงก์ `https://xxxx.netlify.app`
4. **อย่าลืม** เอาโดเมนนี้ไปใส่ใน Authorized domains (ขั้นที่ 2 ข้อ 3)
5. เวลาอัปเดตเกม: หน้า Site → **Deploys** → ลากโฟลเดอร์ใหม่ไปวาง

### ทาง B · Firebase Hosting (ทุกอย่างอยู่ที่เดียว)

1. ติดตั้ง Node.js จาก https://nodejs.org
2. เปิด Terminal / Command Prompt ในโฟลเดอร์เกม แล้วพิมพ์ทีละบรรทัด:
   ```
   npm install -g firebase-tools
   firebase login
   firebase use --add        (เลือกโปรเจกต์ vayrathen)
   firebase deploy
   ```
3. ได้ลิงก์ `https://vayrathen.web.app`
   - คำสั่ง deploy ส่ง Rules ทั้งสองไฟล์ขึ้นไปให้ด้วย จากไฟล์ `firebase.json`

## ขั้นที่ 7 · ทดสอบ

1. เปิดลิงก์เกม → หน้าแรกมีแท็บ **"เข้าสู่ระบบ / สมัครสมาชิก"** (ไอดี + รหัสผ่าน) สมัครไอดีใหม่ได้เลย
2. เปิดอีกเครื่อง (หรือหน้าต่างไม่ระบุตัวตน) แล้วล็อกอินอีกบัญชี
3. เข้าแผนที่เดียวกัน → ควรเห็นกัน แชทได้ ชวนปาร์ตี้ได้
4. ป้ายสถานะมุมจอขึ้น **"ออนไลน์ 2"**

---

## ใช้ได้ฟรีแค่ไหน (แพ็กเกจ Spark)

- **Realtime Database:**
  - เชื่อมต่อพร้อมกันได้ 100 คน
  - ดาวน์โหลด 10 GB/เดือน
  - เกมส่งตำแหน่งบ่อย: 10 คนเล่นพร้อมกันวันละไม่กี่ชั่วโมงยังพอ
  - ถ้าคนเยอะขึ้นให้อัปเป็น Blaze
- **Firestore:** อ่าน 50,000 / เขียน 20,000 ครั้งต่อวัน เกินพอสำหรับเซฟและอันดับ
- ดูการใช้งานได้ที่ Firebase Console → **Usage and billing**

## ความปลอดภัย: กันคนเจาะระบบ (v284)

เกมทั้งเกมรันอยู่ในเบราว์เซอร์ของผู้เล่น สิ่งที่ปกป้องข้อมูลได้จริงคือ **Rules บนเซิร์ฟเวอร์ Firebase** ส่วนโค้ดเกมทำได้แค่เป็นด่านแรก

### 1. Publish กฎชุดใหม่ (สำคัญที่สุด ต้องทำทุกครั้งที่ไฟล์กฎเปลี่ยน)
1. Firebase Console → **Firestore Database** → แท็บ **Rules** → ลบของเดิม → วางทั้งหมดจาก `firebase/firestore.rules` → **Publish**
2. Firebase Console → **Realtime Database** → แท็บ **Rules** → วางทั้งหมดจาก `firebase/database.rules.json` → **Publish**

ถ้าใช้ Firebase CLI ก็ใช้ `firebase deploy --only firestore:rules,database` ได้ คำสั่งเดียวจบ

กฎชุดนี้ตรวจทุกเอกสารที่ผู้เล่นใช้ร่วมกัน ทีละช่อง:
- **ตลาด:** แก้ราคาหรือลบของคนอื่นไม่ได้ ซื้อในชื่อคนอื่นไม่ได้ ของชิ้นเดียวขายได้ครั้งเดียว ขายแล้วผู้ขายถอนคืนไม่ได้ และรับเงินได้ครั้งเดียว
- **จดหมาย:** ส่งในชื่อคนอื่นไม่ได้ ปลอมจดหมายระบบไม่ได้ ส่งเหรียญวายราไม่ได้ ของแนบรับได้ครั้งเดียว คนอื่นแอบอ่านไม่ได้
- **กิลด์:** แก้ประกาศหรือยึดกิลด์คนอื่นไม่ได้ ประกาศยึดปราสาทได้เฉพาะสมาชิกกิลด์ที่ชนะ
- **อันดับและการ์ดผู้เล่น:** เขียนได้เฉพาะของตัวเอง ค่าต้องอยู่ในช่วงที่เป็นไปได้ (เลเวล 1–300, ชื่อไม่เกิน 24 ตัว ฯลฯ) จำนวน MVP เพิ่มได้ครั้งละ 1
- **ห้องออนไลน์ (แชต ปาร์ตี้):** พูดในนามคนอื่นไม่ได้ ส่งคำสั่ง GM ไม่ได้ ข้อความใหญ่เกินกำหนดไม่ได้

ทดสอบกฎกับฐานข้อมูลจำลองได้ด้วย `npm run test:rules` (ต้องมี Java) ชุดนี้ลองโจมตีจริงทุกแบบข้างบน แล้วรันเกมจริงด้วยผู้เล่น 2 คน นำทุกคำสั่งที่เกมเขียนไปเล่นซ้ำ เพื่อยืนยันว่าผู้เล่นสุจริตยังเล่นได้ครบ

### 1.5 ไฟล์ `_headers` (Netlify) · ล้างไอดีเก่า
- แพ็กเต็มของเกมมีไฟล์ `_headers` อยู่ข้าง `index.html` ต้องลากขึ้นไปด้วย Netlify อ่านไฟล์นี้แล้วส่ง Content-Security-Policy กับ header ความปลอดภัยอื่น ๆ ส่วน Firebase Hosting ใช้ค่าเดียวกันจาก `firebase.json`
- ถ้าเปลี่ยนสคริปต์สั้น ๆ ที่เขียนอยู่ใน `index.html` ต้องอัปเดตแฮชใน `_headers` และ `firebase.json` ด้วย ไม่งั้นสคริปต์นั้นจะไม่รัน (`npm run test:fast` จะบอกแฮชใหม่ให้)
- ไอดีล็อกอินที่เวอร์ชันเก่าเคยเผยแพร่ไว้: รัน `node tools/firebase-backup.mjs backup` ก่อน แล้วค่อยรัน `node tools/firebase-backup.mjs privacy`

### 2. เปิด App Check (กันสคริปต์และบอทที่ไม่ได้มาจากเว็บเกม)

> (v289) Firebase เลิกรับ reCAPTCHA v3 แบบเดิมสำหรับแอปใหม่แล้ว ใช้ **Fraud Defense (reCAPTCHA Enterprise)** แทน: Google Cloud Console → Security → Fraud Defense → สร้าง key แบบ Website ใส่โดเมนเกม → Firebase Console → App Check → Apps → **Fraud Defense** → วาง key → Save → ใส่ key เดียวกันใน `APPCHECK_ENTERPRISE_KEY` (อาจต้องผูกบัญชีชำระเงินกับโปรเจกต์ ใช้ฟรีได้ถึงโควตารายเดือนของ Google) ขั้นตอนแบบ v3 ด้านล่างใช้ได้เฉพาะแอปที่ลงทะเบียนไว้ก่อนแล้ว
1. ไปที่ https://www.google.com/recaptcha/admin → สร้างแบบ **reCAPTCHA v3** → ใส่โดเมนเว็บเกม (เช่น `vayrathen.netlify.app`) → จะได้ **site key** และ **secret key**
2. Firebase Console → **App Check** → **Apps** → เลือกแอปเว็บ → **reCAPTCHA** → วาง **secret key** → Save
3. ใส่ **site key** ใน `js/net/firebase-config.js` → `const APPCHECK_KEY = 'site key';` แล้วอัปเกมขึ้นเว็บ
4. รอ 1–2 วัน ดูหน้า App Check ว่าคำขอเกือบทั้งหมดขึ้นเป็น **Verified**
5. กด **Enforce** ทั้ง Cloud Firestore, Realtime Database และ Authentication

ถ้ากด Enforce ก่อนใส่ site key ในเกม ทุกคนจะเข้าเกมออนไลน์ไม่ได้ ต้องทำตามลำดับข้างบน

### 3. ระบบล็อกอิน
- Firebase บล็อกการเดารหัสผ่านถี่ ๆ ให้อัตโนมัติ (ขึ้นข้อความ too-many-requests) และรหัสผ่านในเครื่องเก็บแบบเข้ารหัส PBKDF2 ไม่ใช่ข้อความตรง ๆ
- Authentication → Settings → **Authorized domains**: ให้เหลือเฉพาะโดเมนเว็บเกมของคุณกับ `localhost`

### สิ่งที่ Rules กันไม่ได้
เงิน ไอเทม และเลเวลของผู้เล่นเก็บอยู่ในเซฟของผู้เล่นเอง คนที่แก้เซฟของตัวเองได้ก็โกงได้เฉพาะตัวเขาเอง กฎชุดนี้ช่วยให้ความเสียหายไม่ลามไปถึงคนอื่น (ขโมยของ ลบของ ปลอมอันดับเกินจริง) ถ้าวันหนึ่งต้องการกันการโกงในเซฟด้วย ต้องย้ายการคำนวณสำคัญ (ดรอป การซื้อขาย) ไปไว้บนเซิร์ฟเวอร์ (Cloud Functions ซึ่งต้องใช้แพ็กเกจ Blaze)

## แก้ปัญหาเบื้องต้น

| อาการ | วิธีแก้ |
| --- | --- |
| สมัคร/เข้าสู่ระบบแล้วขึ้น "เซิร์ฟเวอร์ยังไม่เปิดระบบอีเมล/รหัสผ่าน" (`auth/operation-not-allowed`) | เปิด Email/Password ใน Authentication → Sign-in method |
| ขึ้น `auth/unauthorized-domain` | เพิ่มโดเมนใน Authorized domains |
| ล็อกอินได้แต่ไม่เห็นกัน | เช็กว่าใส่ `databaseURL` และ Publish Rules ของ Realtime Database แล้ว |
| เซฟไม่ขึ้นคลาวด์ | เช็ก Rules ของ Firestore |
| ไม่มีกล่องล็อกอินเลย | `firebase-config.js` ยังว่างอยู่ เกมจะเล่นออฟไลน์ |
| เปิดไฟล์ `index.html` ตรงๆ จากเครื่องแล้วล็อกอิน Google ไม่ได้ | ต้องเปิดผ่านเว็บ (`https://`) เท่านั้น |

ลิงก์ claude.ai เดิมยังใช้ได้ตามปกติ ไฟล์ Firebase จะไม่ทำงานเมื่อเปิดใน claude.ai

---

## GM และการรีเซตโลก

### ใครเป็น GM

| เปิดเกมที่ | GM คือ | ตั้งค่า |
| --- | --- | --- |
| ลิงก์ claude.ai | **เจ้าของอาร์ติแฟกต์** (`user.isOwner()`) | ไม่ต้องทำอะไร · ถ้าอยากให้ Editor เป็น GM ด้วย ตั้ง `GM_EDITORS = true` ใน `js/sys/gm.js` |
| เว็บ Firebase | uid ที่อยู่ใน `GM_UIDS` | ดูขั้นตอนด้านล่าง |
| เปิดไฟล์ในเครื่อง (ทดสอบ) | ใส่ `?gm=1` ท้ายลิงก์ เช่น `http://127.0.0.1:8080/?gm=1` | ใช้ได้เฉพาะ `localhost` / `file://` และ **ต้องไม่ได้ต่อออนไลน์** · ตัวละครที่แก้ในโหมดนี้จะไม่ถูกส่งขึ้นคลาวด์ |

**ทำบัญชี Firebase ให้เป็น GM**
1. เข้าเกมด้วย Google หนึ่งครั้ง → Firebase Console → **Authentication → Users** → คัดลอก **User UID**
2. ใส่ใน `js/net/firebase-config.js` → `const GM_UIDS = ['uid ที่คัดลอก'];`
3. ใส่ uid เดียวกันใน `firebase/firestore.rules` → `function gmUids() { return ['uid ที่คัดลอก']; }` แล้ว Publish (หรือ `firebase deploy`)
4. (ให้ประกาศ GM ผ่านห้องได้) รัน `node tools/firebase-backup.mjs gms` เพื่อคัดลอก GM_UIDS ไปที่ Realtime Database `/gms`

GM เห็นปุ่ม **GM** สีแดงที่มุมจอ (หรือกด **F8**) ผู้เล่นอื่นเห็นป้าย **[GM]** หน้าชื่อและในแชท
ทุกปุ่มตรวจสิทธิ์ใหม่ทุกครั้งที่กด และบันทึกลง log (ในเครื่อง + `server/gmlog/entries` บนเซิร์ฟเวอร์)

**แผง GM ทำอะไรได้:** วาร์ปไปแผนที่/พิกัดใดก็ได้ · ตั้ง Base/Job Lv · เปลี่ยนอาชีพ · ตั้งแต้ม Stat/Skill · เพิ่มเงินและเหรียญวายรา · ให้ไอเทม/อุปกรณ์ (ค้นหาได้ เลือกความหายาก) · เรียกมอน/บอส · ฆ่าทั้งแผนที่ · ฟื้นเต็ม · อมตะ · ล่องหน · วิ่งเร็ว ×1.5–3 · ปลดทุกแผนที่ · ล้างเควสต์ · ดูตัวอย่างกลางวัน/กลางคืนและเทศกาล · ดูผู้เล่นออนไลน์และวาร์ปไปหา · ประกาศทั้งเซิร์ฟเวอร์ · สำรอง/กู้คืน/รีเซตโลก

### ตั้งค่าบน claude.ai (ตอน publish อาร์ติแฟกต์)

ให้ GM เท่านั้นเขียนข้อมูลเซิร์ฟเวอร์ได้ ต้องประกาศ rules ของ `db` (ถ้าไม่ประกาศ ผู้เล่นระดับ Contributor เขียน `server/season` ได้):
```js
capabilities: {
  db: { rules: [
    { path: "server",  read: "view",  write: "owner" },   // ซีซัน รายชื่อ GM log
    { path: "backups", read: "owner", write: "owner" },   // แบ็กอัปเซิร์ฟเวอร์
    { path: "players", read: "view",  write: "owner" },   // (แนะนำ) ลบการ์ดคนอื่นได้เฉพาะ GM
    { path: "players/{self}", write: "interact" }
  ] },
  room: { topics: { /* หัวข้อเดิม… */ gm: "admin" } },     // ประกาศ GM · ไม่ใส่ก็ได้ (หัวข้อที่ไม่ประกาศ = admin เท่านั้น)
  downloads: {}                                         // ไฟล์แบ็กอัป
}
```

### สำรองข้อมูล (Backup)

| แบบ | ทำที่ | ได้อะไร |
| --- | --- | --- |
| เซฟสำรอง 7 วันของผู้เล่น | อัตโนมัติ · ตั้งค่า → กู้เซฟย้อนหลัง | เซฟของตัวละคร วันละชุด |
| ส่งออกเซฟ | ตั้งค่า → ส่งออกเซฟ | ไฟล์ .json ของตัวละคร |
| **สำรองเซิร์ฟเวอร์** (GM) | แผง GM → **สำรองเซิร์ฟเวอร์** | ข้อมูลกลางทั้งหมด (`players` `guilds` + สมาชิก `market` `fame` `server`) เก็บที่ `backups/<id>` + ดาวน์โหลดไฟล์ `vayrathen-server-<id>.json` |
| **สำรองทั้งหมด** (Firebase, เจ้าของโปรเจกต์) | `node tools/firebase-backup.mjs backup` | ทุกอย่างใน Firestore รวมเซฟส่วนตัว + Realtime Database เป็นไฟล์เดียว |

- แบ็กอัปเซิร์ฟเวอร์แบ่งเป็นชิ้นละ 60,000 ตัวอักษร (เอกสาร db จำกัด 256 KiB) · ทั้งเซิร์ฟเวอร์มีได้ ~25,000 เอกสาร ถ้าเต็มให้ลบแบ็กอัปเก่าใน db
- เซฟส่วนตัว (`data/users/...`) GM อ่านไม่ได้ (เป็นความเป็นส่วนตัวของผู้เล่น) ตอนรีเซต แต่ละคนเก็บสำรองของตัวเองให้อัตโนมัติ
- **กู้คืน:** แผง GM → รายการแบ็กอัป → กู้คืน (หรือ กู้จากไฟล์) → ยืนยัน → พิมพ์ `RESTORE` · เขียนทับเอกสารที่ชื่อซ้ำ ไม่ย้อนซีซัน
- **สคริปต์ Firebase:** `npm install firebase-admin` → Firebase Console → Project settings → **Service accounts → Generate new private key** → เก็บเป็น `service-account.json` ในโฟลเดอร์เกม (**ห้าม**อัปโหลด/แชร์ ไฟล์นี้อยู่ใน .gitignore แล้ว)
  - สำรอง: `node tools/firebase-backup.mjs backup`
  - กู้คืน: `node tools/firebase-backup.mjs restore vayrathen-full-XXXX.json --yes` (`--no-rtdb` ไม่แตะ Realtime Database · `--only players,guilds` เฉพาะบางคอลเลกชัน)

### จบช่วงทดสอบเปิด → รีเซตโลก (ทุกคนเริ่มจาก 0)

**ทางที่ 1 · ปุ่ม GM (แนะนำ)**
1. (Firebase) รัน `node tools/firebase-backup.mjs backup` เก็บไฟล์ไว้ก่อน
2. แผง GM → **รีเซตโลก** → ยืนยัน → พิมพ์ `RESET`
3. เกมจะ: สำรองเซิร์ฟเวอร์ (ถ้าสำรองไม่สำเร็จจะไม่รีเซต) → ลบข้อมูลกลาง (ผู้เล่น กิลด์ ตลาด หอเกียรติยศ) → เขียน `server/season` เป็นซีซันใหม่ → แจ้งทุกคนที่ออนไลน์
4. ผู้เล่นแต่ละคน (ออนไลน์อยู่ = ทันที, ออฟไลน์อยู่ = ตอนเปิดเกมครั้งถัดไป): เก็บสำรองของตัวเองไว้ที่ `vayrathen-archive-<ซีซันเก่า>` ในเครื่อง และ `data/users/<uid>/archive_<ซีซันเก่า>` บนคลาวด์ส่วนตัว → ลบเซฟทั้ง 3 ช่อง บัญชี เซฟคลาวด์ และเซฟสำรอง 7 วัน → กลับหน้าแรกพร้อมข้อความ "การทดสอบเปิดจบแล้ว การผจญภัยครั้งใหม่เริ่มจาก 0"

**ทางที่ 2 · ไม่มีสิทธิ์ GM ก็ทำได้:** เปิด `js/net/firebase-config.js` เปลี่ยน `const RESET_SEASON = 1;` เป็น `2` (ครั้งถัดไป 3, 4 …) แล้ว deploy ใหม่ · ทุกเครื่องที่เปิดเกมเวอร์ชันนี้จะเก็บสำรองแล้วเริ่มจาก 0 (ข้อมูลกลางบนเซิร์ฟเวอร์ต้องลบเองหรือใช้ปุ่ม GM)

เซฟ/ไฟล์ที่มาจากซีซันเก่าจะโหลดหรือนำเข้าไม่ได้อีก (เซฟที่ไม่มีเลขซีซันนับเป็นซีซัน 1)
