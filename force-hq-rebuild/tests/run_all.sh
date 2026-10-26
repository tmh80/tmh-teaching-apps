#!/bin/sh
# Run every Playwright test from the force-hq-rebuild folder: sh tests/run_all.sh
# Screenshots go to /tmp/fhq-shots/. Each test prints "errors []" when it is clean.
mkdir -p /tmp/fhq-shots/fhq /tmp/fhq-shots/c2 /tmp/fhq-shots/c3
python3 build.py || exit 1
for t in err play_c1 review misc stamp who qpop onego qdrag carddrag explore dark net play_c2 play_c3 runs vocab; do
  echo "== $t"; python3 tests/$t.py 2>&1 | tail -4
done
python3 tests/backup.py
