# VAYRATHEN — notes for Claude

- Explain work to the owner in Thai.
- The game is played in landscape only (phones held sideways; Settings can turn the picture). Check layouts at PC 1920×1080, laptop 1366×768, tablet landscape 1024×768 and phone landscape 844×390 — not portrait.
- Every finished version: bump `?v=NNN` in `index.html` for each changed file, add a section to `docs/UPDATES.md`, then build an upload pack
  `updates/VAYRATHEN-vNNN-update.zip` holding only the files changed since the previous version (same folders as the game)
  plus a Thai `READ-ME-vNNN.txt` (how to upload + what each file is). Commit it, push, and send it to the owner.
  Only for a real update (a version with several changes); a small fix needs no pack — just commit and push.
- Tests: `npm run test:fast` (set `CHROMIUM_PATH=/opt/pw-browsers/chromium` in the cloud container).
