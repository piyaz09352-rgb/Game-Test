/* VAYRATHEN — js/net/firebase-config.js
   ค่าจาก Firebase Console → Project settings → Your apps → Config (โปรเจกต์ vayrathen)
   Values from Firebase Console → Project settings → Your apps → Config (project vayrathen). Not secret: security lives in the Rules. */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCtDQcwGvOXeMTRqbtMZ4cmdnmSajYq0KQ',
  authDomain: 'vayrathen.firebaseapp.com',
  databaseURL: 'https://vayrathen-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'vayrathen',
  storageBucket: 'vayrathen.firebasestorage.app',
  messagingSenderId: '721220672312',
  appId: '1:721220672312:web:9c65ec30fd8b4a1945bfcd'
};

/* GM (ผู้ดูแลเกม) บนเว็บ Firebase: ใส่ uid ของบัญชีที่เป็น GM (Firebase Console → Authentication → Users → User UID)
   แล้วใส่ uid เดียวกันใน firebase/firestore.rules (ฟังก์ชัน gmUids) ด้วย ไม่งั้นปุ่มฝั่งเซิร์ฟเวอร์จะถูกปฏิเสธ
   On claude.ai the GM is the artifact's owner instead (this list is not used there). See SETUP_ONLINE.md "GM และการรีเซตโลก". */
/* (v284) App Check (กันสคริปต์/บอทที่ไม่ได้มาจากเว็บเกมจริง): สมัคร reCAPTCHA v3 ที่ https://www.google.com/recaptcha/admin
   ใส่โดเมนเว็บเกม แล้วนำ "site key" มาใส่ตรงนี้ จากนั้น Firebase Console → App Check → ลงทะเบียนแอปเว็บด้วย secret key
   ดูยอดคำขอสัก 1–2 วันว่าเป็น "verified" ทั้งหมด แล้วกด Enforce ทั้ง Firestore, Realtime Database และ Authentication
   ปล่อยว่าง = ปิด (เกมทำงานเหมือนเดิม). Site key is public (it is meant to sit in the page). See SETUP_ONLINE.md. */
const APPCHECK_KEY = '';   // (v289) off: Firebase no longer registers new apps with classic reCAPTCHA v3 (the owner's v3 site key could not be registered)
/* (v289) App Check with Fraud Defense (reCAPTCHA Enterprise): create a key in Google Cloud Console → Security → Fraud Defense
   (type Website, the game's domain), register it in Firebase Console → App Check → Fraud Defense, then put its key here.
   Leave empty = App Check off (the game works the same; the Firestore / Realtime Database rules still protect the data). */
const APPCHECK_ENTERPRISE_KEY = '';

const GM_UIDS = ['fo6F3IFoT0d3htberU9x13RKAhr1'];   // (v184) the owner's GM account
/* ซีซัน: เพิ่มเลขนี้แล้ว deploy ใหม่ = บังคับรีเซตทุกคนเริ่มจาก 0 (สำรองข้อมูลเก่าไว้ในเครื่อง/คลาวด์ส่วนตัวก่อนลบ) แม้ไม่มีสิทธิ์ GM
   Season: raise this number and deploy to force a world reset for everyone (each player's old data is archived first). */
const RESET_SEASON = 2;   // 2 = the login system was rebuilt: every account starts again from 0 (old data is archived first)
