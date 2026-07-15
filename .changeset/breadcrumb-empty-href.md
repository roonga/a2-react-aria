---
"@a2ra/core": patch
---

Breadcrumb no longer passes an empty `href` to links for items without an `href`
(such as the current page). react-aria treats a present-but-undefined `href` as `""`,
which triggered a React warning and rendered an anchor with an empty href.
