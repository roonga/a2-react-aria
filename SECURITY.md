# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| latest (`preview`) | Yes |
| older releases | No |

## Trust boundary

`A2Renderer` is designed for rendering A2UI JSON emitted by AI agents.
The renderer assumes **agent output is untrusted** and applies the following defences:

- **Allowlist registry**: only component types explicitly registered can be rendered.
  Unknown types throw at render time and are caught by `A2ErrorBoundary`.
- **URL sanitization**: props matching URL patterns (`href`, `src`, `action`, `formaction`,
  and any prop ending in `Url`, `Href`, or `Src`) have `javascript:`, `data:`, and `vbscript:`
  schemes replaced with `about:blank` before being spread onto components.
- **Depth cap**: render trees deeper than 50 levels throw an error, preventing stack-overflow
  DoS from pathologically nested agent JSON.

Props are spread onto React Aria Components without further schema validation by default.
For stricter validation, pass a Zod schema per component entry in `createRegistry` and call
`registry.validate(nodes)` before rendering.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Email: **a2ra@roonga.com.au**

Include:
- A description of the vulnerability
- Steps to reproduce
- The version affected
- Your assessment of severity

You will receive a response within 5 business days. If the vulnerability is confirmed,
a patch will be released and credited to you (unless you prefer to remain anonymous).
