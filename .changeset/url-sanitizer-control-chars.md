---
"@a2ra/core": patch
---

Fix a URL sanitizer bypass where a blocked scheme (`javascript:`, `data:`, `vbscript:`) could
evade detection by embedding an ASCII tab, newline, or carriage return inside the scheme name
(e.g. `jav\tascript:alert(1)`). Browsers strip these characters from anywhere in a URL before
parsing the scheme, so the previous `.trim()`-only check missed them. The sanitizer now mirrors
the WHATWG URL parser's normalization: it strips ASCII tab/newline/CR from anywhere in the string
in addition to trimming leading/trailing C0 controls and spaces, before testing against the
blocked-scheme list.
