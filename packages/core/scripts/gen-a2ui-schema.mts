// Generates registry/a2ui-schema.json — a JSON Schema covering all built-in
// A2UI component nodes. The CLI `a2ra schema` command fetches this file from
// the registry and prints (or writes) it.
//
// Run via: pnpm build:schema  (or automatically as part of pnpm build:registry)
import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"
import { BreadcrumbSchema } from "../src/components/breadcrumb/breadcrumb.schema.ts"
import { ButtonSchema } from "../src/components/button/button.schema.ts"
import { CardSchema } from "../src/components/card/card.schema.ts"
import { CheckboxGroupSchema, CheckboxSchema } from "../src/components/checkbox/checkbox.schema.ts"
import { DatePickerSchema, DateRangePickerSchema } from "../src/components/date-picker/date-picker.schema.ts"
import { DialogSchema } from "../src/components/dialog/dialog.schema.ts"
import { FormSchema } from "../src/components/form/form.schema.ts"
import { FlexSchema, GridSchema } from "../src/components/layout/layout.schema.ts"
import { MenuSchema } from "../src/components/menu/menu.schema.ts"
import { NumberFieldSchema } from "../src/components/number-field/number-field.schema.ts"
import { PopoverSchema } from "../src/components/popover/popover.schema.ts"
import { RadioGroupSchema, RadioSchema } from "../src/components/radio/radio.schema.ts"
import { SelectSchema } from "../src/components/select/select.schema.ts"
import { SwitchSchema } from "../src/components/switch/switch.schema.ts"
import { TableSchema } from "../src/components/table/table.schema.ts"
import { TabsSchema } from "../src/components/tabs/tabs.schema.ts"
import { TextSchema } from "../src/components/text/text.schema.ts"
import { TextFieldSchema } from "../src/components/text-field/text-field.schema.ts"
import { TooltipSchema } from "../src/components/tooltip/tooltip.schema.ts"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../../..")
const OUT = resolve(ROOT, "registry/a2ui-schema.json")

const allSchemas: [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]] = [
	BreadcrumbSchema,
	ButtonSchema,
	CardSchema,
	CheckboxSchema,
	CheckboxGroupSchema,
	DatePickerSchema,
	DateRangePickerSchema,
	DialogSchema,
	FlexSchema,
	FormSchema,
	GridSchema,
	MenuSchema,
	NumberFieldSchema,
	PopoverSchema,
	RadioSchema,
	RadioGroupSchema,
	SelectSchema,
	SwitchSchema,
	TableSchema,
	TabsSchema,
	TextSchema,
	TextFieldSchema,
	TooltipSchema,
]

const registrySchema = z.union(allSchemas)

const jsonSchema = z.toJSONSchema(registrySchema, {
	target: "draft-7",
	$schema: true,
})

const output = {
	$schema: "http://json-schema.org/draft-07/schema#",
	title: "a2UI Component Node",
	description:
		"JSON Schema for a2UI component nodes. A valid node must match one of the oneOf entries. Custom components can be validated by building a registry schema with buildRegistrySchema() from @a2ra/core.",
	...jsonSchema,
}

writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Written: registry/a2ui-schema.json (${allSchemas.length} component types)`)
