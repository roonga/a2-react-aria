---
title: Server-Side Validation
description: Validate a2UI nodes on the backend before they reach the renderer.
sidebar:
  order: 8
---

Think of this like OpenAPI: you define a schema for your API contract, generate a spec
file, and both the client and the server validate against it. a2UI works the same way.
`a2ra schema` generates a standard **JSON Schema (Draft 7)** file that describes every
component type your app accepts. JSON Schema is a widely supported open standard with
validator libraries in every major language — Python, Go, Ruby, Java, Rust, .NET and
more. Your agent does not need to know anything about React or Zod; it just needs a
JSON Schema validator, which it almost certainly already has access to.

The frontend validates incoming nodes against the schema before rendering; the backend
loads the same file to catch bad output before it ever leaves the agent. One source of
truth, validated at both ends.

Client-side validation catches bad nodes before React renders them. Server-side
validation catches them earlier: at the agent, before the response is sent. Catching
errors at the source produces a clear stack trace pointing at the agent code rather
than a cryptic error deep inside the renderer.

## 1. Generate the schema

Create `lib/registry-schemas.ts` exporting all component schemas (built-in and custom),
then generate the schema file:

```bash
# Scaffold a2ra.json with schema config
npx @a2ra/cli init --entry lib/registry-schemas.ts

# Generate the schema
npx @a2ra/cli schema
```

Re-run `a2ra schema` whenever you add or change a component.

The entry file maps component names to Zod schemas:

```ts
// lib/registry-schemas.ts
import { ButtonSchema, TextFieldSchema, SelectSchema } from "@a2ra/core"
import { MyWidgetSchema } from "./components/custom/my-widget.schema"

export const registrySchemas = {
  Button: ButtonSchema,
  TextField: TextFieldSchema,
  Select: SelectSchema,
  MyWidget: MyWidgetSchema,
}
```

## 2. Validate in the agent (Python)

Load the schema once at startup and validate every node list before serialising it:

```python
import json
from pathlib import Path
from jsonschema import Draft7Validator

_VALIDATOR = Draft7Validator(
    json.loads(Path("a2ui-schema.json").read_text())
)

def validate_nodes(nodes: list) -> None:
    """Raise ValueError if any node fails schema validation."""
    for node in nodes:
        errors = list(_VALIDATOR.iter_errors(node))
        if errors:
            raise ValueError(
                f"a2UI node '{node.get('type')}' failed validation: {errors[0].message}"
            )
```

Call `validate_nodes(nodes)` before building your response:

```python
nodes = build_search_results(results)
validate_nodes(nodes)          # raises if any node is invalid
return serialize(nodes)
```

Install `jsonschema`:

```bash
pip install jsonschema
# or: uv add jsonschema
```

## 3. Validate in the agent (Node.js / TypeScript)

```ts
import Ajv from "ajv"
import schema from "./a2ui-schema.json"

const ajv = new Ajv()
const validate = ajv.compile(schema)

function validateNodes(nodes: unknown[]): void {
  for (const node of nodes) {
    if (!validate(node)) {
      throw new Error(
        `Invalid a2UI node: ${ajv.errorsText(validate.errors)}`
      )
    }
  }
}
```

Install `ajv`:

```bash
pnpm add ajv
```

## 4. What gets validated

The generated file is plain JSON Schema Draft 7 — no proprietary format, no runtime
dependency on `@a2ra/core` or Zod. Any conformant validator will work.

The schema encodes the full prop surface of every registered component:

- **Type** must be one of the registered component names
- **Props** must match the component's schema (correct types, valid enum values)
- **Children** are validated recursively where the schema defines them

Invalid nodes — wrong variant names, missing required props, unknown types — all fail
with a descriptive error pointing at the offending field.

### Other languages

Any language with a JSON Schema Draft 7 library works. A few well-known ones:

| Language | Library |
|----------|---------|
| Go | `github.com/xeipuuv/gojsonschema` |
| Ruby | `json_schemer` gem |
| Java | `everit-org/json-schema` |
| Rust | `jsonschema` crate |
| .NET | `NJsonSchema` |

Load the schema file, compile it once, and call `validate` on each node — the pattern
is identical regardless of language.

## 5. When to regenerate

The validator is built once at process startup from the schema file. Re-run
`a2ra schema` and redeploy to pick up changes when you add or modify a component.
