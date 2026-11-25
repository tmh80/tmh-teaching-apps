# Planet Dice

G7/8 Earth in Space. Roll dice to discover a new planet one feature at a time, work out its temperature, year, orbital speed and tides from the reference tables, then swap roles and check the working as an analyst. Includes a Mission Log (digital worksheet), a Station Lab (states of matter at the planet's temperature), tide watch, a star map, the Planet Forge, and a formation story.

## Files

- `Planet-Dice.html` — the original app from the Claude "Science Apps and Sims" project. Single file; runs in a browser. (Uses Google Fonts, so it needs internet as-is; make an `-offline` build with embedded fonts before uploading to Toddle.)
- `Planet-Dice-kimi-test.html` — Kimi test build. Identical, plus a **🖨️ Make a worksheet** button (in the 📓 Mission Log header and under the analyst check / self-check) that gathers the planet, the student's own working, the check results, the lab report, the *So what?* answers, the briefing script and a feedback page into a printable worksheet. Students choose **Save as PDF** and upload it to Toddle as evidence of learning.

## Notes

- Everything is saved in the browser (localStorage) on that laptop.
- Teacher code and answers: open the teacher panel on the page.
