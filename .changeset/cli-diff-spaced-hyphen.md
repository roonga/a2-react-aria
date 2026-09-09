---
"@a2ra/cli": patch
---

`a2ra diff` no longer reports an identical file as changed because its source contains a
spaced hyphen.

`diffLines` decided whether anything moved by scanning its own rendered output for the
substrings `"- "` and `"+ "`. Those prefixes mark a removed or added line, but they also
occur inside ordinary prose, so any component whose source carries a spaced hyphen (or a plus
followed by a space in a comment or a string) diffed as drifted forever: the report listed every line as
context, with no `-` and no `+` anywhere in it, and still ended with "Run `a2ra add <name>
--overwrite` to update." A consumer checking vendoring fidelity got a red that no overwrite
could clear.

The walk now records that it emitted a removal or an addition, at the point it emits one,
instead of trying to recover the fact from the text afterwards.
