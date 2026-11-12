/* ===== Chapter 6 Part 5: Operation Gummy Lift, on the new rescue board (4r-board5.js, generated from proto/Rescue-Core-Board.html).
   Flow: training rock (4u) -> opening pan -> build and test on the board -> route strip and GASA check (4t) -> Run it launches the rescue.
   Saved at chal.c6e.gl: { parts5, runs, trainDone, introDone, work5, firstDone, best (score of 11), best5 {pieces, crystals}, lastSum, bestRun { v5, sum, snap, parts, at } }.
   Score of 11: rescued 4, hull damage 2 (spotless) or 1 (under 20%), budget 475 crystals or less 2, hand travel 2,500 m or less 1, 8 pieces or fewer 1, and 1 for Maths approved by GASA. */
const RB5_NAME = { pull: 'Rope pull', tow: 'Rope tow', ramp: 'Ramp', crane: 'Crane', jack: 'Screw jack', lever: 'Lever' };
const RB5_MAXP = 11;
function rb5Score(sum, approved) {
  const p = { rescue: sum.won ? 4 : 0, hull: !sum.won ? 0 : sum.hull < 1 ? 2 : sum.hull < 20 ? 1 : 0, budget: sum.won && sum.crystals <= 475 ? 2 : 0, oxy: sum.won && sum.hand <= 2500 ? 1 : 0, pieces: sum.won && sum.pieces <= 8 ? 1 : 0, maths: sum.won && approved ? 1 : 0 };
  return { pts: p, total: Object.values(p).reduce((a, b) => a + b, 0) };
}
function rb5Ending(sum) {
  return !sum.won ? ['Not rescued yet', 'The Gumdrop did not reach the dotted line. Look at the legs table under the board: the first leg that says "Not enough" is the one to fix.']
    : sum.hull < 1 ? ['Spotless rescue!', 'The Gumdrop is safe without a single scratch.'] : sum.hull < 20 ? ['Dented, but home!', 'Smooshy is safe, though the Gumdrop needs a little repair.'] : ['Wrecked, but home!', 'The Gumdrop reaches the tractor beam, but the hull is in a terrible state. Smooshy is safe in the cabin.'];
}
function renderRescue5(ch, m, host, save) {
  const st0 = (dbGet('chal.' + ch, {})[m.id]) || {};
  const card = h('section', { class: 'panel mission glwrap', id: 'mi-gl' }); host.appendChild(card);
  card.innerHTML = `${typeof remindersHTML === 'function' ? remindersHTML() : ''}<details class="glbrief"${st0.runs ? '' : ' open'}><summary>📋 Your mission</summary><div class="gl">
      <p>Gummy Mission Control has bad news. The Gumdrop weighs <b>6,300 N</b> and is stuck in the crater. Smooshy is inside and can only pull <b>60 N</b>. Get the Gumdrop up to the dotted line, and the Big Jelly's tractor beam does the rest.</p>
      <p>Build machines to share the load. Each <b>leg</b> is one pull, and the Gumdrop moves when 60 N × the machines' mechanical advantage is at least the force that leg needs.</p>
      <p>💎 ${typeof T === 'function' ? T('sugarcrystal', 'Sugar crystals') : 'Sugar crystals'} are gummy money. GASA can only fly so much kit to Glimmer-9, so you have <b>475</b> to spend, and the cheapest, lightest design is best. Smooshy has enough oxygen for <b>2,500 m</b> of hand travel.</p>
      <p>Drag pieces from the tray onto the crater. Drag from a hook to connect ropes. Press <b>Delete</b> to remove the piece you picked. When the route works, work out the maths in the route strip, send it to GASA, then press <b>Run it</b>.</p>
      <p>After you save Smooshy, try the fun challenge: can you do it with fewer pieces and fewer crystals?</p></div></details>
    <div id="rb5Train"></div><div id="rb5Main"${st0.trainDone ? '' : ' hidden'}><div id="rb5Host"></div><div id="rb5Strip"></div><div id="rb5Res" class="glres"></div></div>`;
  const get = () => (dbGet('chal.' + ch, {})[m.id]) || {};
  const put = patch => { const all = dbGet('chal.' + ch, {}); all[m.id] = Object.assign(all[m.id] || {}, patch); dbSet('chal.' + ch, all); };
  const res = $('#rb5Res', card), host5 = $('#rb5Host', card);
  let strip = null, lastKey = '', lastWon = null, lastAp = null, board = null;
  const paintRes = () => { const g = get(), s = g.bestRun && g.bestRun.sum, l = g.lastSum;
    let html = '';
    if (l) { const E = rb5Ending(l), sc = l.score, P = sc && sc.pts, row = (lab, got, max, note) => `<li class="${got === max ? 'ok' : ''}"><span class="box">${got === max ? '✓' : ''}</span>${lab}: <b>${got} of ${max}</b>${note ? ` <small>${note}</small>` : ''}</li>`;
      html += `<div class="glstamp ${l.won ? 'ok' : ''}"><b>${E[0]}</b> ${sc ? `<span>${sc.total} of ${RB5_MAXP}</span>` : ''}</div><p>${E[1]}</p>`
        + (P ? `<ul class="objs glpts">${row('Gumdrop reaches the line', P.rescue, 4)}${row('Hull damage', P.hull, 2, `${l.hull}%. Spotless earns 2, under 20% earns 1.`)}${row('Budget: 475 crystals or less', P.budget, 2, `${l.crystals} crystals.`)}${row('Oxygen: 2,500 m or less', P.oxy, 1, `${l.hand.toLocaleString('en-GB')} m of hand travel.`)}${row('8 pieces or fewer', P.pieces, 1, `${l.pieces} pieces.`)}${row('Maths approved by GASA', P.maths, 1)}</ul>` : ''); }
    if (s) html += `<p><b>Best rescue so far:</b> ${s.pieces} pieces, ${s.crystals} crystals, ${s.legs.length} leg${s.legs.length === 1 ? '' : 's'}, hull damage ${s.hull}%.</p>`;
    res.innerHTML = html; };
  paintRes();
  function mountBoard() {
    $('#rb5Main', card).hidden = false; const first = !get().introDone && typeof FAST !== 'undefined' && !FAST && !RMOTION;
    strip = rb5Strip($('#rb5Strip', card), { get, put, onApprove: () => { if (board) board.repaint(); } });
    board = rescueBoardMount(host5, { parts: get().parts5 || [], intro: first,
      onIntroEnd: () => put({ introDone: true }),
      canRun: ev => (!ev.won || strip.approved()) ? true : 'Send your maths to GASA first: fill in the route strip under the board, then press Run it.',
      hidePull: () => !strip.approved(),
      onPaint: ev => { const legs = ev.legs.filter(l => l.ok).map(l => ({ type: l.m.type, name: `${RB5_NAME[l.m.type] || l.m.type}: ${l.pl.note}`, needs: l.pl.needs, ma: +l.ma.toFixed(2), pull: +l.pull.toFixed(2), hand: +(l.ma * (l.pl.dist || 0)).toFixed(1) }));
        const key = rb5LegsKey(legs), ap = strip.approved(); if (key !== lastKey || ev.won !== lastWon || ap !== lastAp) { lastKey = key; lastWon = ev.won; lastAp = ap; strip.update(legs, ev.won); } },
      onChange: parts => put({ parts5: parts, tried: !!parts.length || !!get().tried }),
      onRunEnd: (ev, parts) => {
        const g = get(), won = !!ev.won, w5 = g.work5 || {};
        const sum = { won, pieces: parts.length, crystals: Math.round(ev.total), hand: Math.round(ev.hand), hull: Math.round(ev.hull), end: ev.end, hints: w5.hints || 0,
          legs: ev.legs.filter(l => l.ok).map(l => ({ type: l.m.type, ma: +l.ma.toFixed(2), pull: +l.pull.toFixed(2), needs: Math.round(l.pl.needs), note: l.pl.note })) };
        sum.score = rb5Score(sum, strip.approved());
        const prev = g.bestRun && g.bestRun.sum, better = won && (!prev || sum.score.total > (prev.score ? prev.score.total : 0) || (prev.score && sum.score.total === prev.score.total && (sum.pieces < prev.pieces || (sum.pieces === prev.pieces && sum.crystals < prev.crystals))));
        const patch = { runs: (g.runs || 0) + 1, tried: true, parts5: parts, lastSum: sum, best: Math.max(g.best || 0, sum.score.total) };
        if (better) { let snap = null; try { const cv = host5.querySelector('canvas'), o = document.createElement('canvas'); o.width = 900; o.height = 378; o.getContext('2d').drawImage(cv, 0, 0, 900, 378); snap = o.toDataURL('image/jpeg', 0.7); } catch (e) { snap = null; }
          patch.bestRun = { v5: true, sum, snap, parts, work: w5, at: Date.now() }; }
        if (won) patch.best5 = { pieces: Math.min((g.best5 || {}).pieces || 99, sum.pieces), crystals: Math.min((g.best5 || {}).crystals || 9999, sum.crystals) };
        if (won && !g.firstDone) { patch.firstDone = Date.now(); put(patch); save({ id: m.id }, {}); } else { put(patch); paintRes(); }
      } });
  }
  if (st0.trainDone) mountBoard();
  else rb5Train($('#rb5Train', card), { onDone: () => { put({ trainDone: Date.now() }); $('#rb5Train', card).innerHTML = ''; mountBoard(); } });
}
