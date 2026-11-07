/* ===== Whole-app reading and self-review (Reading and Writing plan, part 8 of section 10):
   I can statements (own first screen + a button on every tab), the read-first OK, the self-check before every Check,
   and the stable shuffled order for table, match and sort rows. ===== */
let FAST = false;   // the test build switches this on, so older tests skip the new first screens; the new tests switch it off
const ICAN = {
  c1f: ["I can describe a force as a push or a pull measured in newtons.", "I can work out the resultant force and say whether forces are balanced or unbalanced.", "I can calculate an object's weight using weight = mass × 9.8.", "I can sort forces into contact and non-contact forces."],
  c1x: ["I can draw a free-body diagram with every arrow starting at the centre of the object.", "I can use a scale to draw each force arrow the right length.", "I can use a free-body diagram to work out whether an object will start to move."],
  c2f: ["I can explain why objects with more mass are harder to start moving and harder to stop.", "I can read a velocity from a velocity–time graph.", "I can state Newton's first law and use it to explain everyday examples."],
  c2s: ["I can choose a scatter graph or a bar graph for my data.", "I can make a graph with a title, labelled axes and accurate points.", "I can read a value from a graph and describe the trend using numbers.", "I can write a CER paragraph, and find the claim, evidence and reasoning in an article."],
  c2x: ["I can describe how an object is moving from the shape of a velocity–time graph.", "I can explain why a heavier vehicle needs a bigger brake force to stop in the same distance.", "I can draw the free-body diagram of an object gliding at a steady velocity."],
  c3f: ["I can describe how the resultant force and the mass change an object's acceleration.", "I can use F = m × a and the formula triangle to find the force, the mass or the acceleration.", "I can work out the resultant force when friction acts, then use it in F = m × a."],
  c3x: ["I can find an acceleration from the slope of a velocity–time graph.", "I can solve two-step problems: the resultant force first, then F = m × a.", "I can turn a weight into a mass before I use F = m × a."],
  c4f: ["I can state Newton's third law and describe a force pair.", "I can explain why the two forces in a pair do not cancel each other out.", "I can use F = m × a to explain why the lighter object in a pair moves faster."],
  c4x: ["I can explain how thrusters and rockets use force pairs.", "I can work out the push needed to reach a target velocity.", "I can choose a mass that keeps a velocity under a safe limit."],
  c5f: ["I can describe how weight and air resistance change during a fall.", "I can use balanced forces to explain terminal velocity.", "I can explain what happens to the forces and the velocity when a parachute opens."],
  c5x: ["I can explain why heavy and light objects fall differently in air, but not in a vacuum.", "I can use weight = mass × g to find an object's weight on different worlds.", "I can explain how a hovering helicopter's lift balances its weight.", "I can choose a canopy and an opening height for a safe landing."],
  c6a: ["I can name the fulcrum, the load and the effort on a lever.", "I can explain how moving the fulcrum changes the effort.", "I can describe the catch: a smaller effort means a bigger distance.", "I can name the three classes of lever."],
  c6b: ["I can describe how pulleys, wheels and axles, ramps, wedges and screws help a small effort move a big load.", "I can say how more ropes, a longer handle or a longer ramp changes the effort.", "I can explain why a smaller effort needs a bigger distance."],
  c6c: ["I can work out mechanical advantage as load ÷ effort.", "I can find mechanical advantage from a machine's shape and use it to predict the effort.", "I can calculate work in joules using work = force × distance.", "I can explain why a perfect machine does the same work, however much it reduces the effort."],
  c6d: ["I can describe a compound machine as simple machines working together.", "I can multiply mechanical advantages to find the total.", "I can work out the effort and the hand travel for a compound machine."],
  c6e: ["I can design a route of machines to rescue a spaceship.", "I can predict the effort before I test my machine.", "I can explain why a bigger mechanical advantage never reduces the work.", "I can weigh up two plans and choose one with reasons."],
  c6f: ["I can explain how friction wastes energy in a machine.", "I can calculate the efficiency of a machine.", "I can choose a machine that is strong enough and wastes little energy."],
};
/* the statements, as shown on the first screen and behind the "My I can statements" button */
const hasICAN = id => !!ICAN[id];
const icanListHTML = id => `<ul class="ican-list">${ICAN[id].map(t => `<li>${t}</li>`).join('')}</ul>`;
const icanSeen = id => FAST || !hasICAN(id) || !!dbGet('icanSeen.' + id, false);
let INTRO = false;
function showIntro() {
  INTRO = true; hideCards(); closeDesk(); qUnpop(); parkLab();
  const host = $('#learnHost'); host.innerHTML = `<div class="ican-card" id="icanCard"><h3>By the end of this section</h3>${icanListHTML(CH.id)}<button type="button" class="go ican-next">Next: Step 1 →</button></div>`;
  $('.ican-next', host).addEventListener('click', () => { dbSet('icanSeen.' + CH.id, true); setCTab('learn'); });
  renderPeek(); renderOnPage(); window.scrollTo(0, 0);
}
function leaveIntro() { if (!INTRO) return; INTRO = false; dbSet('icanSeen.' + CH.id, true); parkIntro(); placeLab($('#learnHost')); LAB.mode = 'guided'; renderPeek(); }
function renderPeek() { const el = $('#icanPeek'); if (!el) return; el.innerHTML = CH && hasICAN(CH.id) && !INTRO ? `<details class="ican-peek"><summary>My I can statements</summary>${icanListHTML(CH.id)}</details>` : ''; }

/* ---------- read-first OK: the rest of a step stays blurred until the student presses OK on its first card ---------- */
const readKey = () => 'readOK.' + CH.id + '.' + CHDATA[CH.id].steps[GI].id;
const readNeeded = () => !FAST && !!CH && !stepDone(CH.id, GI) && !dbGet(readKey(), false);
function gateEls() { const ch = $('#chunk'); return $$('#lab .leftcol, #lab .kit, #lab .stagecol > *, #lab .stagecard > *').filter(e => e.id !== 'chunk' && !e.contains(ch)); }
function gateOn(on) { gateEls().forEach(e => { e.classList.toggle('rg-blur', on); e.inert = on; }); }
function readOK() { if (CH && CHDATA[CH.id].steps[GI]) dbSet(readKey(), true); gateOn(false); }

/* ---------- self-check: an X on a Beginning to Mastering line for every I can statement, just before the Check ---------- */
const SA_LEVELS = ['Beginning', 'Developing', 'Proficient', 'Mastering'];
const saStore = id => dbGet('selfA.' + id, null) || { v: [], done: false };
const saLevel = v => SA_LEVELS[Math.min(3, Math.floor(v / 25))];
const saDone = id => !hasICAN(id) || !!saStore(id).done;
function saScale(label, val, onSet) {   // place an X anywhere on the line; val is 0 to 100
  const x = h('span', { class: 'sa-x', 'aria-hidden': 'true' }, '✕');
  const track = h('div', { class: 'sa-track', role: 'slider', tabindex: onSet ? '0' : '-1', 'aria-label': plain(label), 'aria-valuemin': '0', 'aria-valuemax': '100' }, SA_LEVELS.map(() => '<span class="sa-zone"></span>').join(''));
  track.appendChild(x);
  const show = v => { x.style.display = v == null ? 'none' : ''; if (v == null) return; x.style.left = v + '%'; track.setAttribute('aria-valuenow', String(v)); track.setAttribute('aria-valuetext', saLevel(v)); };
  const put = v => { v = clamp(Math.round(v), 0, 100); val = v; show(v); onSet(v); };
  show(val);
  if (onSet) {
    const at = e => { const r = track.getBoundingClientRect(); put((e.clientX - r.left) / r.width * 100); };
    track.addEventListener('pointerdown', e => { e.preventDefault(); track.focus({ preventScroll: true }); try { track.setPointerCapture(e.pointerId); } catch (err) { } at(e); });
    track.addEventListener('pointermove', e => { if (e.buttons) at(e); });
    track.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 0; if (!d) return; e.preventDefault(); put((val == null ? 50 : val) + d); });
  }
  const wrap = h('div', { class: 'sa-scale' }); wrap.appendChild(track); wrap.appendChild(h('div', { class: 'sa-labels' }, SA_LEVELS.map(t => `<span>${t}</span>`).join(''))); return wrap;
}
function selfAssessCard(id, locked, onDone) {
  const L = ICAN[id], S = saStore(id), card = h('div', { class: 'sa-card noglos' }, `<h3>How sure are you?</h3>${locked ? '' : '<p>Before you start the Check, place an X on each line to show where you are right now. This is just for you: it is not marked.</p>'}`);
  const go = locked ? null : h('button', { type: 'button', class: 'go sa-go', disabled: !L.every((_, i) => S.v[i] != null) }, 'Save and start my Check');
  if (go) go.addEventListener('click', () => { S.done = true; dbSet('selfA.' + id, S); onDone(); });
  L.forEach((t, i) => { const row = h('div', { class: 'sa-row' }, `<p class="sa-can">${t}</p>`); row.appendChild(saScale(t, S.v[i], locked ? null : v => { S.v[i] = v; dbSet('selfA.' + id, S); go.disabled = !L.every((_, k) => S.v[k] != null); })); card.appendChild(row); });
  if (go) card.appendChild(go);
  return card;
}
/* the self-check on a worksheet, straight under the name: the student's Xs, empty lines on the blank copy, a note on the answer key */
function wsSelfCheck(chId, mode) {
  if (!hasICAN(chId)) return '';
  const S = saStore(chId), fills = ['#fde3d3', '#fdf0c4', '#d6f0e2', '#dbe6fb'];
  const line = v => { const W = 600, z = W / 4; let g = SA_LEVELS.map((t, k) => `<rect x="${k * z + 1}" y="1" width="${z - 2}" height="28" fill="${fills[k]}" stroke="#8a93a8" stroke-width="1.2" rx="4"/><text x="${k * z + z / 2}" y="46" text-anchor="middle" font-size="13" fill="#3b4256" font-family="Arial,sans-serif">${t}</text>`).join('');
    if (v != null) { const x = clamp(v / 100 * W, 12, W - 12); g += `<path class="wsx" d="M${x - 8} 7L${x + 8} 23M${x + 8} 7L${x - 8} 23" stroke="${BLUE}" stroke-width="4" stroke-linecap="round" fill="none"/>`; }
    return `<svg viewBox="0 0 ${W} 52" width="100%" class="ws-sa-line" role="img" aria-label="${v == null ? 'Not marked' : saLevel(v)}">${g}</svg>`; };
  const note = mode === 'student' ? (S.done ? 'Before the Check, I placed an X on each line to show how sure I felt.' : 'The self-check was not done in the sim.') : mode === 'blank' ? 'Before you start the questions, put an X on each line to show how sure you are right now.' : 'Students place these X marks themselves before the Check. They are not marked, so there is nothing to mark here.';
  return `<div class="q ws-selfcheck"><div class="qh">My self-check before the Check</div><p class="note" style="margin:0 0 4px">${note}</p>${ICAN[chId].map((t, i) => `<div class="ws-sa-row" style="margin:4px 0"><div style="font-weight:700;font-size:10.5pt">${t}</div>${line(mode === 'student' && S.done ? S.v[i] : null)}</div>`).join('')}</div>`;
}

/* ---------- stable shuffled row order for table, match and sort rows ----------
   The authored order often follows the order of a lesson (and can give the answer away), so rows are shown in a seeded shuffle:
   the same on screen, on paper and after a reload. Saved answers, marking and the keys always use the ORIGINAL row index.
   Kept in order: q.keepRows, and rows that are the same words with a rising or falling number. */
const stripTags = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').trim();
function rowsKeepOrder(q, labs) {
  if (q.keepRows) return true;
  labs = labs.map(stripTags); if (!labs.length || labs.some(l => !/\d/.test(l))) return false;
  const pat = labs.map(l => l.replace(/-?\d+(\.\d+)?/g, '#')); if (pat.some(x => x !== pat[0])) return false;
  const nums = labs.map(l => parseFloat(l.match(/-?\d+(\.\d+)?/)[0]));
  return nums.every((v, k) => k === 0 || v >= nums[k - 1]) || nums.every((v, k) => k === 0 || v <= nums[k - 1]);
}
function rowOrder(q, labs) {
  const n = labs.length, id = labs.map((_, i) => i);
  if (n < 2 || rowsKeepOrder(q, labs)) return id;
  if (n === 2) return shuffled(id, hashStr(q.id + '|rows'));
  for (let k = 0; k < 300; k++) {   // few rows stay where they were, and (4 or more rows) no two neighbours stay together in their authored order
    const o = shuffled(id, hashStr(q.id + '|rows' + (k || '')));
    if (o.filter((x, p) => x === p).length <= Math.floor(n / 3) && (n < 4 || !o.some((x, p) => p > 0 && x === o[p - 1] + 1))) return o;
  }
  return id.slice(1).concat(id[0]);
}
