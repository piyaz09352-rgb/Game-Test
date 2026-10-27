/* VAYRATHEN — js/sys/onlineclean.js — an online game: no save buttons, festivals on the real calendar
   · Settings no longer show anything about saving: no auto-save switch, no save now, no export/import file,
     no restore of an older save. The game saves by itself all the time (and to the cloud when online).
   · Festivals follow the real date only: the festival preview is gone from Settings and from the GM tools;
     the Wiki explains when each festival runs.
   · There is no Auto Loot at all any more (drops land on the ground; a rented helper animal can fetch them).
   · No "delete character & restart" button in Settings (characters are still managed on the title screen). */
'use strict';

SETTINGS.autoSave = true; SETTINGS.evPreview = ''; SETTINGS.autoLoot = false;
try { saveSettings(); } catch (e) {}
const OC_GONE = ['set-autoSave', 'setExport', 'setImport', 'setSave', 'setBackup', 'set-evPreview', 'set-autoLoot', 'setDelete'];
{
  const _rs = renderSettings;
  renderSettings = function(){
    _rs.apply(this, arguments);
    const pane = el('pane-settings'); if (!pane) return;
    for (const id of OC_GONE){ const n = el(id); if (!n) continue;
      const row = n.closest('.set') || n.closest('.row'); if (n.closest('.row')) n.remove(); else if (row) row.remove(); }
    pane.querySelectorAll('.row').forEach(r => { if (!r.querySelector('button, input, select')) r.remove(); });
    pane.querySelectorAll('.lootcats').forEach(n => n.remove());
    for (const sec of [...pane.querySelectorAll('.sec')]){
      if (/^(เทศกาล|Festivals)$/.test(sec.textContent.trim())) sec.remove();
      else if (/ข้อมูลเกม|Save data/.test(sec.textContent)) sec.textContent = L('อื่น ๆ', 'Other');
    }
    pane.querySelectorAll('p.empty, p.hint').forEach(p => { if (/เซฟ|บันทึก|คลาวด์|save|backed up/i.test(p.textContent)) p.remove(); });
  };
}
/* the GM tools: no festival override either */
if (typeof WIN_RENDER !== 'undefined' && WIN_RENDER.gm){ const _g = WIN_RENDER.gm; WIN_RENDER.gm = function(){ const r = _g.apply(this, arguments); const f = el('gmFest'); if (f){ const l = f.closest('label'); (l || f).remove(); } return r; }; }
EV.on('tick', () => { if (SETTINGS.evPreview) SETTINGS.evPreview = ''; });
if (typeof WIKI_SYS !== 'undefined'){ const i = WIKI_SYS.findIndex(w => w.id === 'backup'); if (i >= 0) WIKI_SYS.splice(i, 1); }
