/* ===== Part 5 worksheet page 1: "My Rescue" (best run's screenshot, result, a row per leg, totals, working) =====
   Student copy: from chal.c6e.gl.bestRun (snap, sum from glSummary, pred.working) plus runs and hints.
   Blank template: an empty frame and empty boxes. Answer key: the brief's top route (two 24 m ramps, 4 ropes, winch x7, lever on the boulder, crest blasted). */
const GL_KEY_RIG = (() => {
  const parts = [{ id: 'bl', type: 'lever', role: 'boulder', x: 19, arm: 1, rise: 0.5, dir: 1 }, { id: 'rA', type: 'ramp', x1: 16, y1: 0, L: 24, rise: 6 }, { id: 'rB', type: 'ramp', x1: 40.76, y1: 6, L: 24, rise: 6 }, { id: 'd1', type: 'dyn', big: true, x: 68 }], cables = [];
  ['rA', 'rB'].forEach(m => { parts.push({ id: m + 'b', type: 'block', ropes: 4 }, { id: m + 'w', type: 'winch', ratio: 7 }); cables.push({ a: m, b: m + 'b' }, { a: m + 'b', b: m + 'w' }); });
  return { parts, cables };
})();
let GL_KEY_CACHE = null;
function glKey() {
  if (!GL_KEY_CACHE) { const res = glEvaluate(GL_KEY_RIG, { hints: 0 }); GL_KEY_CACHE = { sum: glSummary(res), snap: glSnapURL(GL_KEY_RIG, 'Example route: two ramps, a lever and a blasted crest') }; }
  return GL_KEY_CACHE;
}
function myRescueHTML(mode) {
  const stu = mode === 'student', key = mode === 'key', gl = (dbGet('chal.c6e', {}).gl) || {}, br = gl.bestRun;
  const K = key ? glKey() : null, S = key ? K.sum : stu && br ? br.sum : null, snap = key ? K.snap : stu && br && br.snap ? br.snap : '';
  const W = x => stu ? `<span class="stu">${x}</span>` : key ? `<span class="key">${x}</span>` : x, f1 = v => fmt(v, 1), n0 = v => Math.round(v).toLocaleString('en-GB');
  const frame = snap ? `<div class="rsnap"><img src="${snap}" alt="${key ? 'An example rescue route' : 'My best rescue route'}"></div>` : `<div class="rsnap empty"><span>${stu ? 'Press Run Rescue in the sim and a picture of your best route appears here.' : 'A picture of the best rescue route goes here'}</span></div>`;
  const E = S ? GL_END[S.ending] : null;
  const stamp = S ? `<div class="rstamp">Result: ${W('<b>' + esc(E[0]) + '</b>')} &nbsp; Score: ${S.score != null ? W('<b>' + S.score + ' of 10</b>') : W('<b>not yet</b>')} <small>(best run; the rescue is not marked)</small></div>` : '<div class="rstamp">Result: ____________ &nbsp; Score: ____ of 10 <small>(best run; the rescue is not marked)</small></div>';
  const rows = S ? S.legs.map((l, i) => `<tr><td>${i + 1}</td><td>${W(esc(l.name))}</td><td>${W(f1(l.rise) + ' m')}</td><td>${W(f1(l.ma))}</td><td>${W(f1(l.pull) + ' N')}</td></tr>`).join('') : [1, 2, 3, 4].map(i => `<tr><td>${i}</td><td></td><td></td><td></td><td></td></tr>`).join('');
  const hints = key ? 0 : gl.hints || 0, tries = key ? 1 : gl.runs || 0;
  const tot = [['Hand travel', S && n0(S.hand) + ' m'], ['Crystals spent', S && String(S.cost)], ['Final crest height', S && f1(S.crest) + ' m'], ['Total work', S && n0(S.work) + ' J'], ['Ship damage', S && f1(S.dmg.total) + '%'], ['Hints used', S && String(hints)], ['Tries', S && String(tries)]];
  const work = key ? 'Leg 1: ramp MA = 24 ÷ 6 = 4. Total MA = 4 × 4 ropes × 7 = 112. Pull = 6,300 ÷ 112 = 56.3 N. Leg 2 is the same, so the hardest pull is 56.3 N (under 60 N, no thruster damage). Hand travel = 112 × 6 × 2 legs = 1,344 m. Work = 6,300 × 12 = 75,600 J (the crest was blasted from 15 m to 12 m).' : stu && S ? ((br.pred && br.pred.working) || gl.draftWork || '') : '';
  return `<div class="rescue"><h2>My Rescue: Operation Gummy Lift</h2>${frame}${stamp}
    <table class="rtab"><tr><th>Leg</th><th>Machines</th><th>Rise</th><th>Total MA</th><th>Pull</th></tr>${rows}</table>
    <table class="rtot"><tr>${tot.map(t => `<th>${t[0]}</th>`).join('')}</tr><tr>${tot.map(t => `<td>${t[1] ? W(esc(t[1])) : ''}</td>`).join('')}</tr></table>
    <div class="rwork"><b>My working</b><div class="box" style="white-space:pre-wrap">${work ? W(esc(work)) : ''}</div></div>
    <p class="note">${key ? 'This is one example route. Many routes can score well, so check a student\'s numbers against their own table. The rescue is a Challenge, so it is reported here and not marked. The reflection and the Check questions are marked.' : stu ? 'These numbers come from your best run in the sim. The rescue is a Challenge, so it is reported here and not marked.' : 'Students\' best run fills this page. The rescue is a Challenge, so it is reported here and not marked.'}</p></div>`;
}
