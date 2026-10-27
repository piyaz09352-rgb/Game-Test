/* VAYRATHEN — js/sys/foodstack.js — dishes of different kinds stack; the same kind does not
   Each dish counts by what it boosts (ATK, CRIT, DEF, HP regen, SP regen, status resist…). You can have several dishes
   going at once as long as none of them boosts the same thing; a dish that would boost something another dish already
   boosts can't be eaten until that one runs out (the bag keeps it). Every dish shows as its own buff tile. */
'use strict';

const FOOD_SKIP = new Set(['t', 'every', 'spEvery', 'name', 'cureAll', 'max', 'rt', 'st']);
const FOOD_LAB = {atkPct:'ATK', matkPct:'MATK', crit:'CRIT', def:'DEF', mdef:'MDEF', regenPct:'REGEN', spPct:'SP', resPct:'RES', aspdPct:'ASPD', hpPct:'HP', flee:'FLEE', hit:'HIT'};
const foodKeys = f => Object.keys(f || {}).filter(k => !FOOD_SKIP.has(k) && f[k]);
const foodBuffs = () => Object.keys(P.buffs || {}).filter(k => k === 'food' || k.startsWith('food_'));
/* the food buff already covering one of these stats, if any */
function foodClash(keys){ for (const b of foodBuffs()){ const have = foodKeys(P.buffs[b]); const k = keys.find(x => have.includes(x)); if (k) return {b, k}; } return null; }
const foodLab = k => FOOD_LAB[k] || k.toUpperCase();
{ const _u = useItem;
  useItem = function(id){
    const it = ITEMS[id]; if (!it || !it.food || !S.inv[id] || P.dead) return _u.apply(this, arguments);
    const keys = foodKeys(it.food), c = foodClash(keys);
    if (c){ toast(L(`มีอาหารเพิ่ม ${foodLab(c.k)} อยู่แล้ว · กินอาหารประเภทอื่นได้`, `A dish already boosts ${foodLab(c.k)} · eat a different kind`)); return; }
    const key = 'food_' + keys.slice().sort().join('_'), lab = keys.map(foodLab).slice(0, 2).join('+');
    if (!BUFF_TH[key]) BUFF_TH[key] = BUFF_TH.food || ['อาหาร', 'Food'];
    if (!BUFF_CAP[key]) BUFF_CAP[key] = [lab, lab];
    if (!BUFF_IC[key] && BUFF_IC.food) BUFF_IC[key] = BUFF_IC.food;
    addBuff(key, {t:180, ...it.food, name:it.name}); S.inv[id]--; if (!S.inv[id]) delete S.inv[id];
    addText(P.x, P.y - 54, L(`อร่อย! ${it.name}`, `Yum! ${it.en}`), '#ffd890', 12); SFX.play('pot_hp', {tier:2}); dirty = true;
  };
}
/* buff tiles survive a reload: re-register captions for food buffs loaded from a save */
EV.on('tick', () => { for (const k of foodBuffs()) if (k !== 'food' && !BUFF_CAP[k]){ const lab = k.slice(5).split('_').map(foodLab).slice(0, 2).join('+'); BUFF_CAP[k] = [lab, lab]; BUFF_TH[k] = BUFF_TH.food || ['อาหาร', 'Food']; if (BUFF_IC.food) BUFF_IC[k] = BUFF_IC.food; } });
/* Auto: eat the best dish that does not clash with what is already going */
function foodAutoPick(){
  return Object.keys(S.inv).filter(id => S.inv[id] > 0 && ITEMS[id] && ITEMS[id].food && !foodClash(foodKeys(ITEMS[id].food)))
    .sort((a, b) => (ITEMS[b].sell || 0) - (ITEMS[a].sell || 0))[0] || null;
}
