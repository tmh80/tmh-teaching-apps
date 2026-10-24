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
  C1.missions.forEach(m => {
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
      S.left = []; S.right = []; S.mass = 50; S.floor = m.floor || 'smooth'; resetSim(); S.flags = newFlags();
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
  host.appendChild(h('div', { class: 'row' }, `<button type="button" class="go" data-ctab-go="review">Go to the Review →</button>`));
}
/* draw the arena for a given set-up onto another canvas (keeps the live arena unchanged) */
function snapArena(cv, setup) {
  if (!cv.offsetParent) return; readColors();
  const keep = { left: S.left, right: S.right, mass: S.mass, floor: S.floor, x: S.x, v: S.v, running: S.running, t: S.t, lastShoveT: S.lastShoveT }, ks = LAB.show;
  Object.assign(S, { left: setup.left, right: setup.right, mass: setup.mass, floor: setup.floor, x: 0, v: 0, running: false, t: 0, lastShoveT: null }); LAB.show = new Set(['meter']);
  const hits = HITS; drawScene(forces(), cv); HITS = hits; Object.assign(S, keep); LAB.show = ks;
}
