#!/usr/bin/env python3
"""Build the rescue physics grey-box: proto/greybox.src.html with the real model files (src/js/4f-gummylift.js, 4q-pull.js) inlined.
Run from force-hq-rebuild:  python3 proto/build_greybox.py   ->  proto/Rescue-Physics-Greybox.html (no internet needed)"""
import os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(R, p), encoding='utf-8').read()
out = rd('proto/greybox.src.html').replace('/*__MODEL__*/', rd('src/js/4f-gummylift.js') + '\n' + rd('src/js/4q-pull.js'))
open(os.path.join(R, 'proto', 'Rescue-Physics-Greybox.html'), 'w', encoding='utf-8').write(out)
print('built', len(out) // 1024, 'KB')
