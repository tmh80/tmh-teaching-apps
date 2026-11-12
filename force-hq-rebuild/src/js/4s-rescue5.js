/* ===== Chapter 6 Part 5: Operation Gummy Lift, on the new rescue board (4r-board5.js, generated from proto/Rescue-Core-Board.html).
   Saved at chal.c6e.gl: { parts5 (the pieces on the board), runs, firstDone, best5 {pieces, crystals}, bestRun { v5, sum, snap, at } }.
   The old builder (4h to 4l, 4p) is no longer mounted; its drawing code is still used by other pages until it is cleaned out. */
function renderRescue5(ch, m, host, save) {
  const st0 = (dbGet('chal.' + ch, {})[m.id]) || {};
  const card = h('section', { class: 'panel mission glwrap', id: 'mi-gl' }); host.appendChild(card);
  card.innerHTML = `${typeof remindersHTML === 'function' ? remindersHTML() : ''}<details class="glbrief"${st0.runs ? '' : ' open'}><summary>📋 Your mission</summary><div class="gl">
      <p>The Gumdrop weighs <b>6,300 N</b>. Smooshy can only pull <b>60 N</b>. Get the Gumdrop up to the dotted line, and the Big Jelly's tractor beam does the rest.</p>
      <p>Build machines to share the load. Each <b>leg</b> is one pull, and the Gumdrop moves when 60 N × the machines' mechanical advantage is at least the force that leg needs.</p>
      <p>💎 ${typeof T === 'function' ? T('sugarcrystal', 'Sugar crystals') : 'Sugar crystals'} are gummy money. You have <b>475</b> to spend. Smooshy has enough oxygen for <b>2,500 m</b> of pulling.</p>
      <p>Drag pieces from the tray onto the crater. Drag from a hook to connect ropes. Press <b>Delete</b> to remove the piece you picked. When the route works, press <b>Run it</b>.</p>
      <p>After you save Smooshy, try the fun challenge: can you do it with fewer pieces and fewer crystals?</p></div></details>
    <div id="rb5Host"></div><div id="rb5Res" class="glres"></div>`;
  const put = patch => { const all = dbGet('chal.' + ch, {}); all[m.id] = Object.assign(all[m.id] || {}, patch); dbSet('chal.' + ch, all); };
  const res = $('#rb5Res', card), host5 = $('#rb5Host', card);
  const paintRes = () => { const g = (dbGet('chal.' + ch, {})[m.id]) || {}, s = g.bestRun && g.bestRun.sum, l = g.lastSum;
    const end = l ? (l.won ? (l.hull < 1 ? 'Spotless rescue! The Gumdrop is safe without a scratch.' : l.hull < 20 ? 'Dented, but home! Smooshy is safe, though the Gumdrop needs a little repair.' : 'Wrecked, but home! The hull is in a terrible state, but Smooshy is safe in the cabin.') : 'The Gumdrop did not reach the dotted line. Check the legs table under the board: the first leg that says "Not enough" is the one to fix.') : '';
    res.innerHTML = (l ? `<p><b>Last run:</b> ${end} (${l.pieces} pieces, ${l.crystals} crystals, hull damage ${l.hull}%.)</p>` : '') + (s ? `<p><b>Best rescue so far:</b> ${s.pieces} pieces, ${s.crystals} crystals, ${s.legs.length} leg${s.legs.length === 1 ? '' : 's'}, hull damage ${s.hull}%.</p>` : ''); };
  paintRes();
  rescueBoardMount(host5, { parts: st0.parts5 || [],
    onChange: parts => put({ parts5: parts, tried: !!parts.length || !!(dbGet('chal.' + ch, {})[m.id] || {}).tried }),
    onRunEnd: (ev, parts) => {
      const g = (dbGet('chal.' + ch, {})[m.id]) || {}, won = !!ev.won;
      const sum = { won, pieces: parts.length, crystals: Math.round(ev.total), hand: Math.round(ev.hand), hull: Math.round(ev.hull), end: ev.end,
        legs: ev.legs.filter(l => l.ok).map(l => ({ type: l.m.type, ma: +l.ma.toFixed(2), pull: +l.pull.toFixed(2), needs: Math.round(l.pl.needs), note: l.pl.note })) };
      const prev = g.bestRun && g.bestRun.sum, better = won && (!prev || sum.pieces < prev.pieces || (sum.pieces === prev.pieces && sum.crystals < prev.crystals));
      const patch = { runs: (g.runs || 0) + 1, tried: true, parts5: parts, lastSum: sum };
      if (better) { let snap = null; try { const cv = host5.querySelector('canvas'), o = document.createElement('canvas'); o.width = 900; o.height = 378; o.getContext('2d').drawImage(cv, 0, 0, 900, 378); snap = o.toDataURL('image/jpeg', 0.7); } catch (e) { snap = null; }
        patch.bestRun = { v5: true, sum, snap, parts, at: Date.now() }; }
      if (won) patch.best5 = { pieces: Math.min((g.best5 || {}).pieces || 99, sum.pieces), crystals: Math.min((g.best5 || {}).crystals || 9999, sum.crystals) };
      if (won && !g.firstDone) { patch.firstDone = Date.now(); put(patch); save({ id: m.id }, {}); } else { put(patch); paintRes(); }
    } });
}
