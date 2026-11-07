/* ===== MYP objectives (teacher-only): strand wording, level cut-offs, answer-key text and the Toddle AI feedback text ===== */
// MYP level cut-offs: lowest percentage for each level 1–8 (0% earned = level 0). Tom can change these.
const LEVEL_CUTS = [1, 13, 26, 38, 51, 63, 76, 88];
// MYP Year 3 Sciences strands. Tom can change the year's wording here.
const MYP_STRANDS = {
  Ai: 'describe scientific knowledge',
  Aii: 'apply scientific knowledge and understanding to solve problems set in familiar and unfamiliar situations',
  Aiii: 'analyse information to make scientifically supported judgments',
  Di: 'describe the ways in which science is applied and used to address a specific problem or issue',
  Dii: 'discuss and analyse the various implications of using science and its application in solving a specific problem or issue',
  Diii: 'apply scientific language effectively'
};
const MYP_CRIT = { A: 'Criterion A: Knowing and understanding', D: 'Criterion D: Reflecting on the impacts of science' };
// q.obj is also the Drop Zone object name (a string) on some freeze questions, so only an array counts as strand tags
const strandsOf = q => Array.isArray(q.obj) ? q.obj : [];
const strandLabel = s => s[0] + ' ' + s.slice(1);                                   // 'Aii' -> 'A ii'
const strandsFull = list => list.map(strandLabel).join(', ');                       // 'A i, A ii'
const strandsTag = q => strandsOf(q).length ? strandsFull(strandsOf(q)) : '';
const STRAND_ORDER = Object.keys(MYP_STRANDS);
function sheetStrands(chId) { const u = new Set(); CHDATA[chId].review.forEach(q => strandsOf(q).forEach(s => u.add(s))); return STRAND_ORDER.filter(s => u.has(s)); }
function taskStrands(chIds) { const u = new Set(); chIds.forEach(c => sheetStrands(c).forEach(s => u.add(s))); return STRAND_ORDER.filter(s => u.has(s)); }
/* the compact form used in the table of §6a: 'A i, ii, iii · D i, iii' */
function strandsShort(list) { return ['A', 'D'].map(c => { const l = list.filter(s => s[0] === c).map(s => s.slice(1)); return l.length ? c + ' ' + l.join(', ') : ''; }).filter(Boolean).join(' · '); }
/* marks available per criterion: a question counts once for each criterion it is tagged with */
function critTotals(chIds) {
  const t = { A: 0, D: 0 };
  chIds.forEach(c => CHDATA[c].review.forEach(q => { const crits = new Set(strandsOf(q).map(s => s[0])); crits.forEach(k => { t[k] += qMarks(q); }); }));
  return t;
}
function levelFor(earned, available) {
  if (!available || earned <= 0) return 0;
  const pct = earned / available * 100; let lv = 0;
  LEVEL_CUTS.forEach((c, i) => { if (pct >= c) lv = i + 1; });
  return lv;
}
function levelTable() {
  return LEVEL_CUTS.map((c, i) => { const hi = i + 1 < LEVEL_CUTS.length ? LEVEL_CUTS[i + 1] - 1 : 100; return `${c === hi ? c : c + '–' + hi}% = level ${i + 1}`; }).join(', ');
}
const strandTagHTML = q => strandsTag(q) ? `<span class="mypt">MYP: ${strandsTag(q)}</span>` : '';
const sheetStrandHTML = chId => `<p class="note mypline">MYP strands on this sheet: ${strandsFull(sheetStrands(chId))}</p>`;

/* ---------- written answer key (plain text) ---------- */
function answerKeyText(chId) {
  const ch = secOf(chId), R = CHDATA[chId].review, total = R.reduce((a, q) => a + qMarks(q), 0);
  const out = [`=== Force HQ Ch${ch.n} ${ch.part} (${ch.title}) worksheet (${total} marks) · MYP: ${strandsFull(sheetStrands(chId))} ===`];
  R.forEach((q, i) => {
    const m = plain(markItem(q, i)), mm = m.match(/^Q\d+ \(([^)]*)\): ([\s\S]*)$/), tag = strandsTag(q);
    out.push(mm ? `Q${i + 1} ${QLABEL[q.type]}, ${mm[1]}${tag ? ' [' + tag + ']' : ''}: ${mm[2]}` : m);
  });
  if (chId === 'c6e') out.push('My Rescue page (not marked): Page 1 of the worksheet has a My Rescue page: a picture of the student\'s best rescue route, the result and score, a row for each leg (machines, rise, total MA, pull) and totals for hand travel, crystals, crest height, work, damage, hints and tries. It is not marked, because Challenges are not marked, but you may mention it in a strength or the next step. The last question is a reflection on their own route: check the numbers they quote against the My Rescue table.');
  return out.join('\n');
}

/* ---------- marking rules (shared by the printable scheme and the AI text) ---------- */
function markingRules(hasSure) {
  return [
    'Student answers are printed in blue. Mark only what the student added. The worksheet\'s own text, choices and word lists are not student work.',
    'Students don\'t need to match the answer key word for word: accept any correct scientific wording.',
    'The feedback page at the end of each PDF shows how the student did in the sim. If it disagrees with what you can see on the worksheet, trust the visible answer and say so.',
    'The worksheet starts with "Steps completed in the sim". A blue tick means the sim recorded that step as done. These ticks are not marked, but mention any skipped steps in the feedback.',
    'Auto-marked questions in the sim allowed one go each, so mark the answer exactly as printed.',
    'A blank question scores 0. Add a kind note saying what is missing.',
    ...(hasSure ? ['Some questions ask "How sure are you?" (Guessing, Fairly sure or Certain). Confidence is not marked. If a student was Certain but wrong, mention it kindly in the feedback: it shows an idea worth talking about.'] : []),
    'Don\'t take marks off for spelling unless the meaning is unclear.',
    'Mark each worksheet separately. An optional worksheet that wasn\'t submitted is not counted.'
  ];
}
const FEEDBACK_STYLE = 'Feedback for Grade 7–8: the score with a breakdown per question, one or two specific strengths quoting the student, and one next step with a hint rather than the answer.';

/* ---------- the text pasted into Toddle's AI feedback box ---------- */
function aiFeedbackText(secIds, optIds) {
  optIds = optIds || [];
  const ids = [...secIds, ...optIds.filter(x => !secIds.includes(x))];
  if (!ids.length) return 'Tick at least one section to build the AI feedback instructions.';
  const L = [`All written feedback should be grade 7-8 appropriate language, short and to-the-point, and enthusiastic.`, ''];   /* first line of every AI feedback text (Tom, 3 Nov 2026) */
  L.push('HOW TO MARK');
  markingRules(ids.some(c => CHDATA[c].review.some(q => q.sure))).forEach(r => L.push('- ' + r));
  L.push(''); L.push('FEEDBACK STYLE'); L.push(FEEDBACK_STYLE);
  const st = taskStrands(ids), tot = critTotals(ids);
  L.push(''); L.push('MYP LEVELS');
  L.push('Strands on this task (MYP Year 3 Sciences):');
  st.forEach(s => L.push(`- ${strandLabel(s)}: ${MYP_STRANDS[s]}`));
  L.push('Each question is tagged in the answer key, for example [A ii]. A question counts towards every criterion it is tagged with, once per criterion even if it carries two strands of that criterion. For each criterion, add the marks earned and the marks available across all the worksheets, work out the percentage, then give the level: ' + levelTable() + ' (0% = level 0).');
  L.push('Check the level against the MYP band (1–2 limited, 3–4 adequate, 5–6 substantial, 7–8 excellent). You may move it by one level if the student\'s work clearly fits a different band; say why if you do. Report each criterion as \'Criterion A: level x/8 (strands assessed: i, ii, iii)\', followed by one sentence for each strand.');
  if (optIds.length) L.push('Work out the levels from the required worksheets. If an optional worksheet is submitted, include it only if it raises the level, and say so.');
  L.push(''); L.push('WRITTEN ANSWER KEY');
  ids.forEach(c => { L.push(''); L.push(answerKeyText(c)); });
  const totalMarks = ids.reduce((a, c) => a + CHDATA[c].review.reduce((b, q) => b + qMarks(q), 0), 0);
  L.push(''); L.push('TOTALS');
  L.push(`Total marks for this task: ${totalMarks}.`);
  L.push(['A', 'D'].filter(k => tot[k] > 0).map(k => `Criterion ${k}: ${tot[k]} marks available`).join('; ') + '.');
  return L.join('\n');
}
