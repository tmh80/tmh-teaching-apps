/* ===== Chapter challenges ===== */
CHDATA.c1.challenge = {
  title: 'Arena Inspector',
  intro: 'The arena crew needs an inspector who can read forces at a glance. Draw the free-body diagram for three set-ups, then build a set-up that matches a diagram. Trying every mission is enough to finish the Challenge. Your score is how many objectives you meet.',
  missions: [
    { id: 'm1', kind: 'fbd', title: 'Mission 1: Gliding on air', setup: { mass: 42, floor: 'air', left: [], right: ['adult'] },
      scen: { id: 'c1m1', obj: 'crate', label: '42 kg', brief: '<p>A <b>42 kg crate</b> is on the air floor. One adult pulls it to the right with <b>130 N</b>.</p><p>Remember: the air floor has no friction at all.</p>', forces: [{ type: 'weight', dir: 'down', value: 411.6 }, { type: 'normal', dir: 'up', value: 411.6 }, { type: 'pull', dir: 'right', value: 130 }] } },
    { id: 'm2', kind: 'fbd', title: 'Mission 2: Stuck on concrete', setup: { mass: 60, floor: 'concrete', left: ['kid', 'kid'], right: [] },
      scen: { id: 'c1m2', obj: 'crate', label: '60 kg', brief: '<p>A <b>60 kg crate</b> is on rough concrete. Two kids pull it to the left with <b>120 N</b> altogether, but it doesn\'t budge.</p>', forces: [{ type: 'weight', dir: 'down', value: 588 }, { type: 'normal', dir: 'up', value: 588 }, { type: 'pull', dir: 'left', value: 120 }, { type: 'friction', dir: 'right', value: 120 }] } },
    { id: 'm3', kind: 'fbd', title: 'Mission 3: Sliding on the smooth floor', setup: { mass: 35, floor: 'smooth', left: ['dog'], right: ['strong'] },
      scen: { id: 'c1m3', obj: 'crate', label: '35 kg', brief: '<p>A <b>35 kg crate</b> is sliding to the right across the smooth floor. A dog pulls left with <b>70 N</b> and a strong adult pulls right with <b>200 N</b>. Friction on the sliding crate is <b>34.3 N</b>.</p><p>Hint: draw a separate arrow for each pull.</p>', forces: [{ type: 'weight', dir: 'down', value: 343 }, { type: 'normal', dir: 'up', value: 343 }, { type: 'pull', dir: 'left', value: 70 }, { type: 'pull', dir: 'right', value: 200 }, { type: 'friction', dir: 'left', value: 34.3 }] } },
    { id: 'm4', kind: 'build', title: 'Mission 4: Build it to match', target: { mass: 65, L: 130, R: 260 }, floor: 'air',
      scen: { id: 'c1m4', obj: 'crate', label: '? kg', forces: [{ type: 'weight', dir: 'down', value: 637 }, { type: 'normal', dir: 'up', value: 637 }, { type: 'pull', dir: 'left', value: 130 }, { type: 'pull', dir: 'right', value: 260 }] },
      brief: '<p>This crate is on the <b>air floor</b>, so there is no friction. The right team is winning, so it slides to the right.</p><p>Set up the arena so the crate\'s free-body diagram matches this one exactly. You choose the crate\'s mass and both teams. Then press <b>Check my build</b>.</p>',
      clue: '<p>You know that <b>weight = mass × 9.8</b>. Here you already know the weight: <b>637 N</b>.</p><p>If you <b>multiply</b> the mass by 9.8 to get the weight, what do you need to do to the weight and 9.8 to get the mass?</p>' }
  ]
};
function challengeState(ch) {
  if (!CHDATA[ch] || !CHDATA[ch].challenge) return { tried: 0, total: 0, score: 0, max: 0 };
  const C1 = CHDATA[ch].challenge, st = dbGet('chal.' + ch, {}); let tried = 0, score = 0, max = 0;
  C1.missions.forEach(m => { const s = st[m.id] || {}; if (s.tried) tried++; score += s.best || 0; max += m.kind === 'fbd' ? 4 : 4; });
  return { tried, total: C1.missions.length, score, max };
}
function challengeDone(ch) { if (!CHDATA[ch]) return false; if (!CHDATA[ch].challenge) return true; const c = challengeState(ch); return c.tried === c.total; }
function fbdObjectives(res) { return res ? ['present', 'dir', 'values', 'lengths'].filter(k => res.chips.find(c => c[0] === k)[2]).length : 0; }
function renderChallenge(ch) {
  const C1 = CHDATA[ch].challenge, host = $('#challengeHost'); parkLab(); host.innerHTML = '';
  const lp = learnProgress(ch);
  if (lp.done < lp.total) host.appendChild(h('div', { class: 'gate' }, `<b>Tip:</b> you have finished ${lp.done} of ${lp.total} Learn steps. The Challenge uses everything from Learn, so it's easier if you finish those first. You can still have a go now.`));
  host.appendChild(h('div', { class: 'panel mission gl' }, `<span class="lbl">Challenge</span><h3>${C1.title}</h3><p>${C1.intro}</p>`));
  const save = (m, patch) => { const st = dbGet('chal.' + ch, {}); st[m.id] = Object.assign(st[m.id] || {}, patch); dbSet('chal.' + ch, st); renderOnPage(); tabTicks(); if (challengeDone(ch)) { addEvidence('challenge', `Chapter ${CH.n} ${CH.part} Challenge: ${C1.title}, ${challengeState(ch).score} of ${challengeState(ch).max} objectives met.`); maybeStamp(ch); } };
  const bm = C1.missions.filter(m => m.kind === 'brake'); if (bm.length) renderBrakeCourse(ch, bm, host, save);
  const sm = C1.missions.filter(m => m.kind === 'sled'); if (sm.length) renderSledCourse(ch, sm, host, save);
  C1.missions.filter(m => m.kind !== 'brake' && m.kind !== 'sled').forEach(m => {
    const st = (dbGet('chal.' + ch, {})[m.id]) || {};
    const card = h('section', { class: 'panel mission', id: 'mi-' + m.id }); host.appendChild(card);
    if (m.kind === 'fbd') {
      card.innerHTML = `<h3>${m.title}</h3><canvas class="snap" style="width:100%;max-width:620px;aspect-ratio:900/380;border-radius:10px;display:block" role="img" aria-label="The arena set-up for ${esc(m.title)}"></canvas><div class="fhost"></div><ul class="objs" data-o></ul>`;
      requestAnimationFrame(() => snapArena($('.snap', card), m.setup));
      const objs = () => { const s = (dbGet('chal.' + ch, {})[m.id]) || {}, r = s.res; $('[data-o]', card).innerHTML = [['Try the mission (you get one check)', s.tried], ['All the forces are there', r && r.present], ['Arrows point the right way', r && r.dir], ['Numbers are correct', r && r.values], ['Bigger forces have longer arrows', r && r.lengths]].map(([t, ok]) => `<li class="${ok ? 'ok' : ''}"><span class="box">✓</span>${t}</li>`).join(''); };
      /* one go: after the check, the diagram locks and the correct one appears beside it */
      const lockF = () => { const s = (dbGet('chal.' + ch, {})[m.id]) || {}, b = s.best || 0; $('.fhost', card).innerHTML = `<div class="fb ${b === 4 ? 'ok' : b ? 'hint' : 'no'}">${b === 4 ? 'Perfect diagram! You met all four objectives: 4 of 4 points.' : `You met ${b} of 4 objectives, so you scored ${b} of 4 points. Compare your diagram with the correct one.`}</div>` + fbdCompare(m.scen, s.state); };
      if (st.tried && st.state) lockF();
      else FBDB.mount($('.fhost', card), m.scen, { state: st.state, onChange: s2 => save(m, { state: s2 }), onCheck: (s2, res) => { save(m, { state: s2, tried: true, res: { present: res.present, dir: res.dir, values: res.values, lengths: res.lengths }, best: fbdObjectives(res) }); objs(); lockF(); } });
      objs();
    } else {
      card.innerHTML = `<h3>${m.title}</h3><div class="gl">${m.brief}</div>${m.clue ? `<details class="clue"><summary>Need a clue for the mass?</summary><div class="gl">${m.clue}</div></details>` : ''}<div style="max-width:420px">${FBDB.svg(m.scen, FBDB.model(m.scen), { noDot: true })}</div><div class="labhost"></div><div class="row"><button type="button" class="go" id="bCheck">Check my build</button></div><div class="fb" id="bFb"></div><ul class="objs" data-o></ul>`;
      const objs = () => { const s = (dbGet('chal.' + ch, {})[m.id]) || {}, o = s.o || {}; $('[data-o]', card).innerHTML = [['Try the mission (you get one check)', s.tried], [`The weight matches (${fmt(m.target.mass * G, 1)} N)`, o.w], [`The left pull matches (${m.target.L} N)`, o.l], [`The right pull matches (${m.target.R} N)`, o.r]].map(([t, ok]) => `<li class="${ok ? 'ok' : ''}"><span class="box">✓</span>${t}</li>`).join(''); };
      // a full sandbox arena for this mission
      clearCh2(); S.left = []; S.right = []; S.mass = 50; S.floor = m.floor || 'smooth'; resetSim(); S.flags = newFlags();
      LAB.mode = 'challenge'; LAB.showRes = false; LAB.show = new Set(['pal', 'meter', 'readL', 'readR', 'readF', 'readW', 'readN', 'readM', 'fbd', 'floor', 'mass', 'run', 'shove']); LAB.sides = ['left', 'right']; LAB.pullers = ['kid', 'dog', 'adult', 'strong', 'pony', 'horse']; LAB.floors = null; LAB.onChange = null; LAB.tick = null; LAB.idle = null;
      placeLab($('.labhost', card)); $('#lab').classList.add('nolc'); applyPanels();
      $('#bCheck', card).addEventListener('click', () => { const o = { w: S.mass === m.target.mass, l: tot(S.left) === m.target.L, r: tot(S.right) === m.target.R }; const n = Object.values(o).filter(Boolean).length;
        const T = m.target, msg = n === 3 ? 'A perfect match! The weight and both pulls are exactly right: 4 of 4 points.' : `Whoops! The target was a ${fmt(T.mass, 0)} kg crate (weight ${fmt(T.mass * G, 1)} N), with ${T.L} N pulling left and ${T.R} N pulling right. You matched ${n} of 3, so you scored ${1 + n} of 4 points.`;
        save(m, { tried: true, o, best: 1 + n, msg }); lockB(); objs(); });
      const lockB = () => { const s = (dbGet('chal.' + ch, {})[m.id]) || {}; if (!s.tried) return; const b = $('#bCheck', card); b.disabled = true; b.textContent = 'Build checked'; const fb = $('#bFb', card); fb.className = 'fb ' + ((s.best || 0) === 4 ? 'ok' : 'hint'); fb.textContent = s.msg || ''; };
      lockB();
      objs();
    }
  });
  host.appendChild(h('div', { class: 'row' }, `<button type="button" class="go" data-ctab-go="review">Go to the Check →</button>`));
}
/* draw the arena for a given set-up onto another canvas (keeps the live arena unchanged) */
function snapArena(cv, setup) {
  if (!cv.offsetParent) return; readColors();
  const keep = { left: S.left, right: S.right, mass: S.mass, floor: S.floor, x: S.x, v: S.v, running: S.running, t: S.t, lastShoveT: S.lastShoveT }, ks = LAB.show;
  Object.assign(S, { left: setup.left, right: setup.right, mass: setup.mass, floor: setup.floor, x: 0, v: 0, running: false, t: 0, lastShoveT: null }); LAB.show = new Set(['meter']);
  const hits = HITS; drawScene(forces(), cv); HITS = hits; Object.assign(S, keep); LAB.show = ks;
}
/* Chapter 2 Challenge: the inertia obstacle course (one shared arena, a tab per crate).
   Every launch counts: on target at the 1st launch = 4 points, 2nd = 3, 3rd = 2, later = 1. "Move on" after 3 misses scores 1. */
function renderBrakeCourse(ch, bm, host, save) {
  const get = id => (dbGet('chal.' + ch, {})[id]) || {};
  let cur = Math.max(0, bm.findIndex(m => !get(m.id).done)), active = false;
  const card = h('section', { class: 'panel mission', id: 'mi-course' }); host.appendChild(card);
  card.innerHTML = `<div class="mtabs" role="tablist" aria-label="Choose a crate"></div><div class="mbrief gl"></div>
    <details class="clue"><summary>Need a clue?</summary><div class="gl"><p>If the crate slid <b>past</b> the target, it needs a <b>bigger</b> brake force. If it stopped <b>short</b> of the target, use a <b>smaller</b> one. The yellow (too low) and red (too high) marks on the slider remember your tries.</p><p>A heavier crate has more inertia, so it needs a bigger brake force than a light one. In Car versus truck, 3 times the mass needed 3 times the force to stop in the same distance.</p></div></details>
    <div class="labhost"></div><div class="fb" id="bkFb" hidden></div><ol class="blog" id="bkLog"></ol><ul class="objs" data-o></ul><div class="row" id="bkMore"></div>`;
  LAB.mode = 'challenge'; LAB.showRes = false; LAB.show = new Set(['launch', 'brake', 'readD', 'readM', 'vt']); LAB.sides = []; LAB.pullers = []; LAB.floors = null; LAB.onChange = null; LAB.idle = 'Choose a brake force, then press Launch the crate';
  placeLab($('.labhost', card)); $('#lab').classList.add('nolc'); applyPanels();
  const paint = () => {
    const m = bm[cur], s = get(m.id);
    $('.mtabs', card).innerHTML = bm.map((x, i) => { const g = get(x.id); return `<button type="button" role="tab" aria-selected="${i === cur}" data-cr="${i}" class="${g.done ? 'done' : ''}">${g.done ? '✓ ' : ''}${x.title.split(':')[0]}</button>`; }).join('');
    $('.mbrief', card).innerHTML = `<h3>${m.title}</h3><p>This <b>${m.mass} kg</b> crate is launched at <b>${fmt(m.v0, 1)} m/s</b>. Choose a brake force so it stops <b>${fmt(m.target, 1)} m</b> after the brake line, on the green target.</p>`;
    $('#bkLog').innerHTML = (s.log || []).map((r, i) => `<li class="${r.hit ? 'ok' : ''}">Launch ${i + 1}: brake ${r.F} N, ${r.d == null ? 'the crate reached the end of the arena' : `stopped ${fmt(r.d, 2)} m after the brake line`}${r.hit ? ' ✓ on target!' : r.d == null || r.d > m.target ? ' (too far)' : ' (too short)'}</li>`).join('');
    const fb = $('#bkFb'); fb.hidden = !s.msg; fb.className = 'fb ' + (s.done ? (s.best === 4 ? 'ok' : 'hint') : 'no'); fb.textContent = s.msg || '';
    $('[data-o]', card).innerHTML = [['Launch the crate (every launch counts)', s.tried], ['Stop it on the target, within 15 cm', s.done && s.hit], ['Hit the target on your first launch', s.best === 4]].map(([t, ok]) => `<li class="${ok ? 'ok' : ''}"><span class="box">✓</span>${t}</li>`).join('');
    $('#bkMore').innerHTML = s.done ? (cur < bm.length - 1 ? `<button type="button" class="go" data-cr="${cur + 1}">Next crate →</button>` : `<button type="button" class="go" data-ctab-go="review">Go to the Check →</button>`) : (s.n >= 3 ? `<button type="button" class="ghost" id="bkGive">Move on to the next crate (1 point)</button>` : '');
    const gv = $('#bkGive'); if (gv) gv.addEventListener('click', () => { save(m, { done: true, best: 1, msg: `You moved on after ${s.n} launches. The brake force that works is about ${Math.round(m.mass * m.v0 * m.v0 / (2 * m.target))} N. You scored 1 of 4 points.` }); paint(); });
  };
  const load = i => {
    cur = i; const m = bm[cur], s = get(m.id); clearCh2(); S.left = []; S.right = []; course(m.mass, m.v0, s.F || 40); S.target = m.target; LAB.bmarks = { mass: m.mass, target: m.target, tol: 0.15, hi: s.hi != null ? s.hi : null, lo: s.lo != null ? s.lo : null }; S.flags = newFlags(); resetSim(); active = false; labChanged(); paint();
  };
  card.addEventListener('click', e => { const b = e.target.closest('[data-cr]'); if (b) load(+b.dataset.cr); });
  LAB.tick = () => {
    if (S.running && S.flags.launched) active = true;
    if (!active || S.running) return;
    active = false; const m = bm[cur], s = get(m.id); if (s.done) { paint(); return; }
    const d = S.brakeFrom != null && S.flags.stopped ? S.x - S.brakeFrom : null, hit = d != null && Math.abs(d - m.target) <= 0.15, n = (s.n || 0) + 1, log = (s.log || []).concat([{ F: S.brakeF, d, hit }]);
    const best = hit ? Math.max(1, 5 - n) : 0; brakeMark(LAB.bmarks, d, S.brakeF); renderControls();
    save(m, { tried: true, n, log, F: S.brakeF, hi: LAB.bmarks.hi, lo: LAB.bmarks.lo, hit, done: hit, best, msg: hit ? `On target after ${n} launch${n > 1 ? 'es' : ''}! You scored ${best} of 4 points.` : `Not quite: ${d == null ? 'it reached the end of the arena' : `it stopped ${fmt(d, 2)} m after the brake line`}. The target is ${fmt(m.target, 1)} m. Change the brake force and launch again.` });
    paint();
  };
  load(cur);
}

/* Chapter 3 Challenge: the mail run (one shared Snow Arena, a tab per run).
   The student works out how many huskies to use, then runs the sled. A run counts when the sled crosses the finish line, and
   it is judged on its acceleration. Every run counts: on target at the 1st run = 4 points, 2nd = 3, 3rd = 2, later = 1. "Move on" after 3 misses scores 1. */
function renderSledCourse(ch, sm, host, save) {
  const get = id => (dbGet('chal.' + ch, {})[id]) || {};
  let cur = Math.max(0, sm.findIndex(m => !get(m.id).done)), active = false;
  const card = h('section', { class: 'panel mission', id: 'mi-sled' }); host.appendChild(card);
  card.innerHTML = `<div class="mtabs" role="tablist" aria-label="Choose a run"></div><div class="mbrief gl"></div>
    <details class="clue"><summary>Need a clue?</summary><div class="gl"><p>Work in two steps. First find the friction: pull the sled once and read the Friction readout. A run only counts when the sled crosses the finish line, so you can press Reset first, for free.</p><p>Then, for each number of huskies, work out the <b>resultant force = pull − friction</b> and the <b>acceleration = resultant ÷ mass</b>. Which number of huskies lands inside the target?</p></div></details>
    <div class="labhost"></div><div class="fb" id="snFb" hidden></div><ol class="blog" id="snLog"></ol><ul class="objs" data-o></ul><div class="row" id="snMore"></div>`;
  LAB.mode = 'challenge'; LAB.showRes = true; LAB.onChange = null; LAB.idle = 'Add huskies, then press Pull!';
  placeLab($('.labhost', card)); $('#lab').classList.add('nolc');
  const paint = () => {
    const m = sm[cur], s = get(m.id);
    $('.mtabs', card).innerHTML = sm.map((x, i) => { const g = get(x.id); return `<button type="button" role="tab" aria-selected="${i === cur}" data-sr="${i}" class="${g.done ? 'done' : ''}">${g.done ? '✓ ' : ''}${x.title.split(':')[0]}</button>`; }).join('');
    $('.mbrief', card).innerHTML = `<h3>${m.title}</h3><p>${m.brief}</p>`;
    $('#snLog').innerHTML = (s.log || []).map((r, i) => `<li class="${r.hit ? 'ok' : ''}">Run ${i + 1}: ${r.n} husk${r.n === 1 ? 'y' : 'ies'}, ${r.mass} kg, acceleration ${fmt(r.a, 2)} m/s²${r.hit ? ' ✓ on target!' : r.mass !== m.mass ? ' (wrong mass)' : r.a < m.lo ? ' (too small)' : ' (too big)'}</li>`).join('');
    const fb = $('#snFb'); fb.hidden = !s.msg; fb.className = 'fb ' + (s.done ? (s.best === 4 ? 'ok' : 'hint') : 'no'); fb.textContent = s.msg || '';
    $('[data-o]', card).innerHTML = [['Run the sled to the finish line (every run counts)', s.tried], [`Get the acceleration between ${fmt(m.lo, 1)} and ${fmt(m.hi, 1)} m/s²`, s.done && s.hit], ['Do it on your first run', s.best === 4]].map(([t, ok]) => `<li class="${ok ? 'ok' : ''}"><span class="box">✓</span>${t}</li>`).join('');
    $('#snMore', card).innerHTML = s.done ? (cur < sm.length - 1 ? `<button type="button" class="go" data-sr="${cur + 1}">Next run →</button>` : `<button type="button" class="go" data-ctab-go="review">Go to the Check →</button>`) : (s.n >= 3 ? `<button type="button" class="ghost" id="snGive">Move on (1 point)</button>` : '');
    const gv = $('#snGive'); if (gv) gv.addEventListener('click', () => { save(m, { done: true, best: 1, msg: `You moved on after ${s.n} runs. ${m.huskies} huskies work for this sled. You scored 1 of 4 points.` }); paint(); });
  };
  const load = i => {
    cur = i; const m = sm[cur];
    clearCh2(); S.scene = 'sled'; S.x0 = SLED_X0; S.left = []; S.right = []; S.mass = m.setMass ? 100 : m.mass; S.floor = m.floor; S.flags = newFlags(); resetSim(); active = false;
    LAB.show = new Set(['pal', 'run', 'meter', 'readR', 'readM', 'readRes', 'readA', 'readF', 'readV', 'fbd'].concat(m.setMass ? ['mass'] : [])); LAB.sides = ['right']; LAB.pullers = ['husky']; LAB.floors = [m.floor];
    applyPanels(); labChanged(); paint();
  };
  card.addEventListener('click', e => { const b = e.target.closest('[data-sr]'); if (b) load(+b.dataset.sr); });
  LAB.tick = () => {
    if (S.running) active = true;
    let late = false;
    if (S.running && S.t >= 8 && !S.flags.finished) { S.running = false; syncRun(); S.msg = 'The sled had not reached the finish line after 8 s. Press Reset to go again.'; late = true; }   // too little pull: do not wait for ever
    if (!active || S.running) return;
    active = false; if (!S.flags.finished && !late) return;
    const m = sm[cur], s = get(m.id); if (s.done) { paint(); return; }
    const a = forces().a, nR = S.right.length, hit = S.mass === m.mass && a >= m.lo - 1e-9 && a <= m.hi + 1e-9, n = (s.n || 0) + 1, log = (s.log || []).concat([{ n: nR, mass: S.mass, a, hit }]);
    const best = hit ? Math.max(1, 5 - n) : 0;
    const why = S.mass !== m.mass ? `The sled's mass was ${S.mass} kg, but this run needs ${m.mass} kg.` : a < m.lo ? `${nR} husk${nR === 1 ? 'y' : 'ies'} gave ${fmt(a, 2)} m/s². That is too small, so the mail would be late. Try more huskies.` : `${nR} huskies gave ${fmt(a, 2)} m/s². That is too big, so the mail sacks would tumble off. Try fewer huskies.`;
    save(m, { tried: true, n, log, hit, done: hit, best, msg: hit ? `On target after ${n} run${n > 1 ? 's' : ''}! ${nR} huskies gave ${fmt(a, 2)} m/s². You scored ${best} of 4 points.` : `Not quite. ${why}` });
    paint();
  };
  load(cur);
}
