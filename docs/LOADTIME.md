**HTTP/2 (แบบ CDN ของ itch.io)** · gzip เปิด

# VAYRATHEN — load time on a phone's network (tools/load-time.js)

Empty cache, phone screen 844×390, text files gzip-compressed as a web host sends them (GZIP=0: raw), served over HTTP/1.1 (6 files at a time) or, with H2=key,cert, over HTTP/2 as a CDN such as itch.io's serves it (many files at once). Fast 3G = 1.6 Mbit/s, 560 ms · 4G = 9 Mbit/s, 170 ms.

| เน็ต | ถึงหน้าแรก (วิ) | โหลดก่อนหน้าแรก | กดสร้างตัว → อยู่ในโลก (วิ) | โหลดทั้งหมด | ไฟล์ |
|---|---|---|---|---|---|
| 3g | 18.2 | 2.53 MB | 1.2 | 2.57 MB | 527 |
| 4g | 5.7 | 3.25 MB | 1.2 | 4.00 MB | 538 |

## ไฟล์ใหญ่สุดก่อนหน้าแรก (3g)

| ไฟล์ | ขนาด |
|---|---|
| js/gfx/sprites.js?v=368 | 0.09 MB |
| js/gfx/beasts.js?v=342 | 0.06 MB |
| js/data/lore.js?v=326 | 0.05 MB |
| js/sys/changelog272.js?v=397 | 0.04 MB |
| js/render/vfx.js?v=287 | 0.03 MB |
| js/data/world.js?v=326 | 0.03 MB |
| js/sys/fashion30.js?v=274 | 0.02 MB |
| css/systems.css?v=190 | 0.02 MB |
| js/render/render.js?v=338 | 0.02 MB |
| js/game/skills.js?v=274 | 0.02 MB |
| js/world/towns216.js?v=263 | 0.02 MB |
| js/data/mapstory_south.js?v=326 | 0.02 MB |

## แยกตามชนิด (ทั้งหมด)

| ชนิด | ขนาด |
|---|---|
| js | 2.40 MB |
| css | 0.12 MB |
| webp | 0.04 MB |
| other | 0.01 MB |
| png | 0.00 MB |
| jpg | 0.00 MB |
