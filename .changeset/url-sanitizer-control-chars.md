---
"@a2ra/core": patch
---

Fix an XSS bypass in `A2Renderer`'s URL sanitizer: agent-supplied hrefs/srcs containing an ASCII
tab, newline, or carriage return embedded inside a blocked scheme name (e.g. `java\tscript:alert(1)`)
previously passed the scheme check unsanitized, because only leading/trailing whitespace was
trimmed. Browsers strip these characters from anywhere in a URL before parsing its scheme, so the
payload still executed as `javascript:` at render time. The sanitizer now strips embedded
tab/newline/CR characters before testing against the blocked scheme list.
