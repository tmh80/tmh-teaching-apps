/* Adapt Lab: the one-line "biggest threat" sentence under the survival bars.
   Fixes Tom's feedback of 16 Nov 2026: the designer said "It gets too hot in the cold winter" because it always named the
   harshest season and guessed hot or cold. Now the sentence names the season where the temperature score is worst, and says
   hot or cold from that season's own direction. When the animal overheats because of a thick coat or fat, it says so.
   Pure logic, no DOM. Works in the browser (window.AdaptThreat) and in Node (module.exports). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AdaptThreat = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function () {
  'use strict';
  // "in the cold winter", "when the rains begin"
  function inSeason(name) {
    const n = String(name || '').toLowerCase();
    return /^rains /.test(n) ? 'when the ' + n : 'in the ' + n;
  }
  // the season with the worst temperature score (sleeping or migrated seasons are skipped). null if every season is fine.
  function worstTemp(sc) {
    let best = null;
    (sc && sc.ts || []).forEach((x, i) => { if (!x || x.dormant || x.away || !x.dir) return; if (!best || x.s < best.s) best = { i, s: x.s, dir: x.dir, T: x.T }; });
    return best;
  }
  function tempSentence(sc, B, t) {
    const w = worstTemp(sc), seasons = (B && B.seasons) || [];
    if (!w) return `It struggles with the temperature ${inSeason(seasons[B && B.hs] || 'harshest season')}.`;
    const when = inSeason(seasons[w.i]);
    if (w.dir < 0) return `It gets too cold ${when}.`;
    t = t || {};
    const coat = (t.cov === 'fur' || t.cov === 'feathers') && t.insul >= 60, fat = t.fatWhere === 'all' && t.fat >= 50;
    if (coat && fat) return `Its fat and coat are too thick, so it overheats ${when}.`;
    if (coat) return `Its coat is too thick, so it overheats ${when}.`;
    if (fat) return `Its fat layer is too thick, so it overheats ${when}.`;
    return `It gets too hot ${when}.`;
  }
  // worstKey: the pressure with the lowest bar ('temp', 'breath', 'pred', 'food', 'water'); lethal: from lethalOf()
  function threatSentence(worstKey, sc, B, t, lethal) {
    if (lethal) return 'It cannot live here: ' + lethal.why + '.';
    const harsh = inSeason((B.seasons || [])[B.hs] || 'harshest season');
    return {
      temp: () => tempSentence(sc, B, t),
      breath: () => 'It struggles to get enough oxygen.',
      pred: () => `Predators catch it too easily: ${String(B.preds || '').toLowerCase()}.`,
      food: () => `It cannot find enough food, most of all ${harsh}.`,
      water: () => B.aquatic ? 'The salt in the water is wrong for its body.' : 'It loses water faster than it can drink.'
    }[worstKey]();
  }
  return { threatSentence, tempSentence, worstTemp, inSeason };
});
