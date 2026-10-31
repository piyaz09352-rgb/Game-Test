# VAYRATHEN — notes for Claude

- Explain work to the owner in Thai.
- The game is played in landscape only (phones held sideways; Settings can turn the picture). Check layouts at PC 1920×1080, laptop 1366×768, tablet landscape 1024×768 and phone landscape 844×390 — not portrait.
- Every finished version: bump `?v=NNN` in `index.html` for each changed file and add a section to `docs/UPDATES.md`.
  Then build the FULL game pack `updates/VAYRATHEN-vNNN-full.zip` = `index.html assets audio css js` (what firebase.json hosts)
  and send it to the owner. Never a pack of only the changed files: the owner deploys by dragging a folder (Netlify drop),
  which replaces the whole site — a partial pack (v188) left the site without its CSS. Unzip it into an empty folder,
  serve it and enter the game before sending. Full packs are git-ignored (too big).
  Only for a real update (a version with several changes); a small fix needs no pack — just commit and push.
- Tests: `npm run test:fast` (set `CHROMIUM_PATH=/opt/pw-browsers/chromium` in the cloud container).
