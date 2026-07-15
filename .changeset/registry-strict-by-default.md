---
"@a2ra/core": major
---

`createRegistry` is now strict by default and takes an options object.

- Every registry entry must provide a Zod-style schema (`safeParse`) unless you
  opt out with `{ strict: false }` for trusted, hand-written node trees.
- The positional `jsonSchema` second argument is replaced by the `jsonSchema`
  option: `createRegistry(entries, { jsonSchema })`.
- `createStrictRegistry` and `StrictRegistryEntryInput` are removed; use
  `createRegistry` (strict is the default). `CreateRegistryOptions` and
  `RegistryEntryInput` are now exported.

Migration:

```ts
// before
createRegistry(entries, jsonSchema)
createStrictRegistry(entries)

// after
createRegistry(entries, { jsonSchema })
createRegistry(entries)                  // strict by default
createRegistry(entries, { strict: false }) // trusted content only
```
