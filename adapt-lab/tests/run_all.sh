#!/bin/sh
# Runs every check for the Adapt Lab rebuild: sh adapt-lab/tests/run_all.sh
# The browser check (tests/page_check.js) runs only where Playwright and Chrome are installed.
cd "$(dirname "$0")/.." || exit 1
fail=0
for f in build.js src/js/*.js prototype/*.js tests/*.js; do node --check "$f" || fail=1; done
for t in tests/*.test.js; do echo "== $t"; node "$t" || fail=1; done
echo "== build"; node build.js || fail=1
if [ -d /opt/npm-tools/node_modules/playwright ] || node -e "require.resolve('playwright')" 2>/dev/null; then
  echo "== tests/page_check.js"; node tests/page_check.js || fail=1
else echo "(skipped the browser check: Playwright is not installed here)"; fi
[ $fail = 0 ] && echo "ALL CHECKS PASSED" || { echo "SOME CHECKS FAILED"; exit 1; }
