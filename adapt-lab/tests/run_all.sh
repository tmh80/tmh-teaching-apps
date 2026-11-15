#!/bin/sh
# Runs every check for the Adapt Lab rebuild: sh adapt-lab/tests/run_all.sh
cd "$(dirname "$0")/.." || exit 1
fail=0
for f in src/js/*.js prototype/*.js; do node --check "$f" || fail=1; done
for t in tests/*.test.js; do echo "== $t"; node "$t" || fail=1; done
[ $fail = 0 ] && echo "ALL CHECKS PASSED" || { echo "SOME CHECKS FAILED"; exit 1; }
