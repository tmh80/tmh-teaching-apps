/* ===== Part 5 training round: the SAME rescue board (4r-board5.js) in training mode. A 252 N rock is wedged beside the Gumdrop.
   Leg 1: pry it up with a lever. Leg 2: lift it and carry it clear with a crane. Same tray, same hooks, same rule as the rescue: 60 N × total MA must reach the force needed.
   When the run clears the rock the training kit packs away, and nothing from training goes into the route strip or the score. Saved as chal.c6e.gl.trainDone. */
function rb5Train(host, o) {   // o: { onDone() }
  host.innerHTML = `<div class="panel rb5train"><h3>🪨 Training: clear the rock first</h3>
    <p>A <b>252 N</b> rock is wedged beside the Gumdrop, and Smooshy can only pull <b>60 N</b>. This is the same simulator you will use for the rescue, with a smaller job. The rule is the same too: <b>60 N × total mechanical advantage (MA)</b> must be at least the force the job needs.</p>
    <p>Add a piece from the tray, tap it to change it, and watch the table under the board. When both legs work, press <b>Run it</b>.</p>
    <div id="rb5TrainHost"></div>
    <div class="row"><button id="rb5tskip" class="ghost">Skip training</button><span id="rb5tmsg" class="rb5msg"></span></div></div>`;
  let done = false; const fin = () => { if (done) return; done = true; o.onDone(); };
  rescueBoardMount($('#rb5TrainHost', host), { train: true, parts: [], onRunEnd: ev => { if (!ev.won || done) return; $('#rb5tmsg', host).textContent = 'Rock cleared! The training kit is packed away. Now for the real rescue.'; setTimeout(fin, 2200); } });
  $('#rb5tskip', host).addEventListener('click', fin);
}
