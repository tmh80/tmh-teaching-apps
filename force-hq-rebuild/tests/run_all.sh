#!/bin/sh
# Run every Playwright test from the force-hq-rebuild folder: sh tests/run_all.sh
# Screenshots go to /tmp/fhq-shots/. Each test prints "errors []" when it is clean.
mkdir -p /tmp/fhq-shots/fhq /tmp/fhq-shots/c2 /tmp/fhq-shots/c3 /tmp/fhq-shots/c4 /tmp/fhq-shots/dz /tmp/fhq-shots/obs /tmp/fhq-shots/c5 /tmp/fhq-shots/c6 /tmp/fhq-shots/bt /tmp/fhq-shots/lesson
python3 build.py || exit 1
for t in err play_c2s ican_selfcheck graph_maker shuffle_spread qtypes obs_types dropzone_physics dropzone_ui play_c1 review misc stamp who qpop onego qdrag answer_box carddrag explore dark net play_c2 play_c3 play_c4 play_c5 play_c5x workshop_numbers play_c6 lesson_engine throb_next trolley lesson_trolley challenge_board play_bt rescue_numbers stage2_ropes play_rescue play_story play_hints play_myrescue stage4_gasa calc_formulas runs vocab dz_verdict calcorder pdf_c1x strands teacher; do
  echo "== $t"; python3 tests/$t.py 2>&1 | tail -4
done
python3 tests/backup.py
