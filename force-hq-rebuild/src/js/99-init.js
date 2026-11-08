/* ===== Explore + start-up ===== */
const TRYTHIS = [
  ['Make a perfect draw using a different number of pullers on each side.', () => S.left.length && S.right.length && S.left.length !== S.right.length && tot(S.left) === tot(S.right)],
  ['Find the lightest team that can move a 150 kg crate on rough concrete.', () => S.mass === 150 && S.floor === 'concrete' && S.flags.moved],
  ['Give the crate a push on ice with nobody pulling, and watch until it stops by itself.', () => S.floor === 'ice' && S.flags.shoved && S.flags.moved && !S.running && !S.left.length && !S.right.length]
];
function openExplore() {
  show('vExplore'); placeLab($('#exploreHost')); exploreHead('Explore · Main Arena', 'Tug-of-war sandbox');
  clearCh2(); S.left = ['adult']; S.right = ['adult', 'kid']; S.mass = 50; S.floor = 'smooth'; S.flags = newFlags(); resetSim();
  clearCh2(); LAB.mode = 'explore'; LAB.show = new Set(PANELS.filter(k => !EXPLORE_HIDE.includes(k))); LAB.sides = ['left', 'right']; LAB.pullers = ['kid', 'dog', 'adult', 'strong', 'pony', 'horse']; LAB.floors = null; LAB.idle = null;
  applyPanels(); $('#qCard').hidden = true; $('#dataCard').hidden = true; hideCards(); closeDesk();
  const done = new Set(dbGet('tryDone', []));
  const draw = () => { $('#rail').innerHTML = `${exploreSwitch('main')}<span class="lbl">Explore · Main Arena</span><h2>Test your own ideas</h2><p class="gl">Every control, readout and diagram is switched on. Tap any <b>ⓘ</b> to find out how to read a panel.</p><div class="lbl">Try this</div><ul class="tasks gl">${TRYTHIS.map((t, i) => `<li class="${done.has(i) ? 'ok' : ''}"><span class="box">✓</span><span>${t[0]}</span></li>`).join('')}</ul><p class="scaleNote">Change one thing at a time and keep everything else the same. That way you know what caused the difference.</p><button type="button" class="jbtn" data-journal><span>📓 My Journal</span></button><button type="button" class="ghost" data-act="home">← Home</button>`; };
  draw();
  LAB.onChange = null; LAB.tick = () => { TRYTHIS.forEach((t, i) => { if (!done.has(i) && t[1]()) { done.add(i); dbSet('tryDone', [...done]); addEvidence('challenge', 'Explore: ' + t[0]); toast('Nice experiment! That one is ticked off.', 'good'); draw(); } }); };
}
/* Explore has two places to play: the Main Arena tug-of-war and the Drop Zone */
const exploreHead = (a, b) => { const l = $('#vExplore .chhead .lbl'), t = $('#vExplore .chhead h1'); if (l) l.textContent = a; if (t) t.textContent = b; };
const exploreSwitch = cur => { const w = typeof exploreShopOpen === 'function' && exploreShopOpen(); return `<div class="seg ${w ? 'two' : 'three'} exsw" role="group" aria-label="Choose where to play"><button type="button" data-exscene="main" aria-pressed="${cur === 'main'}">Tug-of-war</button><button type="button" data-exscene="drop" aria-pressed="${cur === 'drop'}">Drop Zone</button><button type="button" data-exscene="heli" aria-pressed="${cur === 'heli'}">Helicopter</button>${w ? `<button type="button" data-exscene="shop" aria-pressed="${cur === 'shop'}">Workshop</button>` : ''}</div>`; };
function init() {
  readColors(); buildReads(); initPal(); initControls(); initDrop(); initHeli(); initShop(); initLesson(); initCalc(); initGlossary(); updateJCount(); refreshWho(); initJournal(); initRuns();
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); for (const k in ICONS) delete ICONS[k]; renderPal(); drawHome(); }); } catch (e) { }
  window.addEventListener('resize', () => { if (VIEW === 'vHome') drawHome(); });
  $('#cvHome').addEventListener('click', homeClick);
  document.addEventListener('click', e => {
    const t = e.target;
    const exs = t.closest('[data-exscene]'); if (exs && VIEW === 'vExplore') { if (exs.dataset.exscene === 'drop') openExploreDrop(); else if (exs.dataset.exscene === 'heli') openExploreHeli(); else if (exs.dataset.exscene === 'shop') openExploreShop('free'); else openExplore(); return; }
    if (t.closest('[data-journal]')) { if (journalOpen()) closeJournal(); else openJournal(); return; }
    const op = t.closest('[data-open]'); if (op) { if (op.closest('[data-close]') || op.closest('.modal')) closeModal(); openChapter(op.dataset.open); return; }
    const tab = t.closest('#chTabs [data-ctab]'); if (tab) { setCTab(tab.dataset.ctab); return; }
    const tg = t.closest('[data-ctab-go]'); if (tg) { setCTab(tg.dataset.ctabGo); return; }
    const g = t.closest('[data-goto]'); if (g && VIEW === 'vChapter') { if (CTAB !== 'learn') setCTab('learn'); setStep(+g.dataset.goto); return; }
    const inf = t.closest('[data-info]'); if (inf) { showInfo(inf.dataset.info); return; }
    if (t.closest('[data-close]')) { closeModal(); return; }
    const a = t.closest('[data-act]'); if (a) { const k = a.dataset.act;
      if (!$('#modal').hidden && (k === 'explore' || k === 'explore-anyway')) closeModal();
      if (k === 'home') { parkLab(); show('vHome'); } else if (k === 'explore') openExplore(); else if (k === 'explore-anyway') { dbSet('exploreAnyway', true); openExplore(); } else if (k === 'who') askWho(false); else if (k === 'transmission') openTransmission();
      else if (k === 'student') { DB.user = {}; saveDB(); refreshWho(); renderHome(); askWho(true); } return; }
    if (t.closest('#homeBtn')) { hideCards(); closeDesk(); parkLab(); show('vHome'); return; }
    if (t.closest('#teacherBtn')) { parkLab(); show('vTeacher'); renderTeacher(); return; }
    if (t.closest('#saveWorkBtn')) { if (!user().name && !isTeacher()) { askWho(false); return; } openSheet(null, 'progress'); return; }
  });
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (!$('#modal').hidden) closeModal(); else if (QSTATE === 'pop') qPlace('dock'); else if (journalOpen()) closeJournal(); });
  qDragInit();   // the pop-up layer is click-through now, so clicks on the arena reach the arena
  show('vHome');
  if (!user().name && !user().teacher) askWho(true);
  requestAnimationFrame(frame);
}
init();
