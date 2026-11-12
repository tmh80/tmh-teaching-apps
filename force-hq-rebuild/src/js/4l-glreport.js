/* My Rescue page (worksheet page 1) for the new rescue board (4s-rescue5.js). Student copy: the best run's picture, result, score, a row per leg and the student's own maths from the route strip.
   Answer key: one example route (a pull to the cliff, a crane over it, a pull to the line), worked out below. Blank: empty boxes. */
const RB5_KEY = { sum: { won: true, pieces: 7, crystals: 239, hand: 2148, hull: 0, hints: 0, legs: [
  { type: 'pull', note: 'Rolling 32.3 m on the cart (a winch ×20 on the ground at the foot of the cliff)', needs: 1160, ma: 20, pull: 58, hand: 646.1 },
  { type: 'crane', note: 'Lifts 7.1 m, carries 5.5 m across, lowers 0.8 m onto a second cart (winch ×16 and a 7-rope pulley)', needs: 6300, ma: 112, pull: 56.3, hand: 793.3 },
  { type: 'pull', note: 'Rolling 35.4 m on the cart (a winch ×20 on the ground at the top)', needs: 1160, ma: 20, pull: 58, hand: 708.3 }] } };
function myRescueHTML(mode) {
  const stu = mode === 'student', key = mode === 'key', gl = (dbGet('chal.c6e', {}).gl) || {}, br = gl.bestRun && gl.bestRun.v5 ? gl.bestRun : null;
  const W = x => stu ? `<span class="stu">${x}</span>` : key ? `<span class="key">${x}</span>` : x, n0 = v => Math.round(v).toLocaleString('en-GB'), f1 = v => fmt(v, 1);
  const S = key ? RB5_KEY.sum : stu && br ? br.sum : null, w = stu && br ? (br.work || {}) : {};
  const snap = stu && br && br.snap ? `<div class="rsnap"><img src="${br.snap}" alt="My best rescue route"></div>` : `<div class="rsnap empty"><span>${stu ? 'Run the rescue in the sim and a picture of your best route appears here.' : key ? 'The student\'s picture goes here.' : 'Stick or draw your best rescue route here.'}</span></div>`;
  const sc = S ? (S.score || rb5Score(S, key ? true : !!w.approved)) : null, E = S ? rb5Ending(S) : null;
  const stamp = S ? `<div class="rstamp">Result: ${W('<b>' + esc(E[0]) + '</b>')} &nbsp; Score: ${W('<b>' + sc.total + ' of ' + RB5_MAXP + '</b>')} <small>(best run; the rescue is a Challenge, so it is reported here and not marked)</small></div>` : `<div class="rstamp">Result: ______________ &nbsp; Score: ____ of ${RB5_MAXP}</div>`;
  const rows = S ? S.legs.map((l, i) => `<tr><td>${i + 1}</td><td>${W(esc((RB5_NAME[l.type] || l.type) + ': ' + (l.note || '')))}</td><td>${W(n0(l.needs) + ' N')}</td><td>${W(f1(l.ma))}</td><td>${W(f1(l.pull) + ' N')}</td><td>${W(n0(l.hand || 0) + ' m')}</td></tr>`).join('') : [1, 2, 3].map(i => `<tr><td>${i}</td><td style="height:26px"></td><td></td><td></td><td></td><td></td></tr>`).join('');
  const tot = [['Pieces used', S && String(S.pieces)], ['Crystals spent', S && String(S.crystals)], ['Hand travel', S && n0(S.hand) + ' m'], ['Hull damage', S && S.hull + '%'], ['Hints used', S && String(key ? 0 : w.hints != null ? w.hints : S.hints || 0)], ['Maths approved by GASA', S && (key || w.approved ? 'yes' : 'no')]];
  const pts = S ? `<p class="note">Score: rescued ${sc.pts.rescue} of 4, hull ${sc.pts.hull} of 2, budget ${sc.pts.budget} of 2, oxygen ${sc.pts.oxy} of 1, 8 pieces or fewer ${sc.pts.pieces} of 1, maths approved ${sc.pts.maths} of 1.</p>` : '';
  return `<div class="rescue"><h2>My Rescue: Operation Gummy Lift</h2>${snap}${stamp}
    <table class="rtab"><tr><th>Leg</th><th>Machine and move</th><th>Force needed</th><th>Total MA</th><th>Smooshy's pull</th><th>Hand travel</th></tr>${rows}</table>
    <table class="rtot"><tr>${tot.map(t => `<th>${t[0]}</th>`).join('')}</tr><tr>${tot.map(t => `<td>${t[1] ? W(esc(t[1])) : ''}</td>`).join('')}</tr></table>${pts}
    <p class="note">${key ? 'This is one example route. Many routes can score well, so check a student\'s numbers against their own table: Smooshy\'s pull = force needed ÷ total MA, and hand travel = total MA × the distance moved. The rescue is a Challenge, so it is reported here and not marked. The reflection question is marked: check the numbers a student quotes against their My Rescue table.' : 'Fewest pieces and fewest crystals: ' + (stu && gl.best5 ? `${gl.best5.pieces} pieces, ${gl.best5.crystals} crystals.` : '______ pieces, ______ crystals.')}</p></div>`;
}
