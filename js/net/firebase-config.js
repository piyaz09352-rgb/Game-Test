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
const GM_UIDS = ['fo6F3IFoT0d3htberU9x13RKAhr1'];   // (v184) the owner's GM account
/* ซีซัน: เพิ่มเลขนี้แล้ว deploy ใหม่ = บังคับรีเซตทุกคนเริ่มจาก 0 (สำรองข้อมูลเก่าไว้ในเครื่อง/คลาวด์ส่วนตัวก่อนลบ) แม้ไม่มีสิทธิ์ GM
   Season: raise this number and deploy to force a world reset for everyone (each player's old data is archived first). */
const RESET_SEASON = 2;   // 2 = the login system was rebuilt: every account starts again from 0 (old data is archived first)
