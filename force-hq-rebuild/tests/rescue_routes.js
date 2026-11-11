/* Brief section 9 routes as rigs on the real crater. Read by tests/rescue_numbers.py (and handy for checking the builder by hand).
   Route 4 differs from the brief's 1-D model: with real geometry the single-ramp alternative is 'blast the crest, one 30 m ramp up to a 6 m
   platform, winches ×7 and ×8' (45.0 N, 1,680 m, score 8, as the brief's score). See docs/Rescue_Sonnet_Handoff.md. */
// Section 9 routes as rigs (shared by the node harness and tests/rescue_numbers.py)
/* the boulder kit (11 Nov 2026): leg 1 pries it free (a lever with a winch on its pulling end, which locks to hold it up), leg 2 lifts and shifts it (a crane with a winch carries it left, over the Gumdrop) */
const BL = [{ id: 'bl', type: 'lever', role: 'boulder', x: 19, arm: 1, rise: 0.5, dir: 1 }, { id: 'blw', type: 'winch', ratio: 2 }, { id: 'bc', type: 'crane', role: 'boulder', x: 18.7, rise: 6, across: -8, adir: -1, on: 'ground' }, { id: 'bcw', type: 'winch', ratio: 6 }];
const BLC = [{ a: 'bl', b: 'blw' }, { a: 'bc', b: 'bcw' }];
const chainOf = (m, ropes, ws) => { const parts = [], cables = []; let prev = m; if (ropes > 1) { parts.push({ id: m + 'b', type: 'block', ropes }); cables.push({ a: prev, b: m + 'b' }); prev = m + 'b'; } ws.forEach((r, i) => { parts.push({ id: m + 'w' + i, type: 'winch', ratio: r }); cables.push({ a: prev, b: m + 'w' + i }); prev = m + 'w' + i; }); return { parts, cables }; };
function rig(machines, extra) { const parts = [], cables = (extra || []).some(p => p.id === 'bl') ? BLC.slice() : []; machines.forEach(([p, ropes, ws]) => { parts.push(p); if (p.type === 'ramp' || p.type === 'crane') cables.push({ a: p.id, b: 'ship' }); /* roped to the Gumdrop's hook */ const c = chainOf(p.id, ropes, ws); parts.push(...c.parts); cables.push(...c.cables); }); return { v: 2, parts: parts.concat(extra || []), cables }; }
const R24a = x => ({ id: 'rA', type: 'ramp', x1: x, y1: 0, L: 24, rise: 6 });
const R24b = (x, y) => ({ id: 'rB', type: 'ramp', x1: x, y1: y || 6, L: 24, rise: 6 });
const CREST = { id: 'd1', type: 'dyn', big: true, x: 68 };
const ROUTES = {
  top: () => rig([[R24a(16), 4, [7]], [R24b(40.76), 4, [7]]], BL.concat([CREST])),
  crane: () => rig([[{ id: 'cr', type: 'crane', x: 14, rise: 4 }, 4, [7, 4]], [{ id: 'rA', type: 'ramp', x1: 16, y1: 4, L: 24, rise: 6 }, 4, [7]], [{ id: 'lv', type: 'lever', x: 40, arm: 1, rise: 2, dir: 1 }, 2, [6]]],
    BL.concat([CREST, { id: 'p1', type: 'platform', size: 'M', x: 16.5, h: 4 }, { id: 'p2', type: 'platform', size: 'L', x: 40, h: 4 }])),
  long: () => rig([[{ id: 'rA', type: 'ramp', x1: 11.5, y1: 0, L: 30, rise: 7.5 }, 4, [7]], [{ id: 'rB', type: 'ramp', x1: 38.95, y1: 7.5, L: 30, rise: 7.5 }, 4, [7]]], BL.concat([{ id: 'p1', type: 'platform', size: 'M', x: 39.75, h: 1.5 }])),
  single: () => rig([[{ id: 'rA', type: 'ramp', x1: 14.5, y1: 0, L: 30, rise: 12 }, 1, [7, 8]]], BL.concat([CREST, { id: 'p1', type: 'platform', size: 'L', x: 42, h: 6 }])),
  over: () => rig([[R24a(16), 4, [10]], [R24b(40.76), 4, [10]]], BL.concat([CREST])),
  dynb: () => rig([[R24a(16), 4, [7]], [R24b(40.76), 4, [7]]], [CREST, { id: 'd2', type: 'dyn', big: false, x: 19 }]),
  weak: () => rig([[R24a(16), 4, [7]], [R24b(40.76), 4, [4]]], BL.concat([CREST])),
  rock: () => rig([[R24a(16), 4, [7]], [R24b(40.76), 4, [7]]], [CREST]),
  none: () => ({ v: 2, parts: BL.slice(), cables: BLC.slice() })
};
const EXPECT = { top: [56.25, 1344, 10], crane: [58.33, 1336, 9] /* the boulder kit costs 70 more crystals, so this route is over budget */, long: [56.25, 1680, 9], single: [45.0, 1680, 8], over: [39.375, 1920, 7], dynb: [56.25, 1344, 9], weak: [98.44, 1056, 4], rock: [75.0, 1344, 4] /* old model; the pulling model tears the leg off instead: see tests/pull_model.js */, none: [6300, 0, null] };
