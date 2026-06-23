"use client"

import { A2Renderer, buildRegistrySchema, createRegistry } from "@a2ra/core"
import { registrySchemas } from "../lib/registry-schemas"
import { Button } from "./a2ui/button"
import { Card } from "./a2ui/card"
import { DatePicker } from "./a2ui/date-picker"
import { Flex, Grid } from "./a2ui/layout"
import { NumberField } from "./a2ui/number-field"
import { Radio, RadioGroup } from "./a2ui/radio"
import { Select } from "./a2ui/select"
import { Text } from "./a2ui/text"
import { TextField } from "./a2ui/text-field"
import { FeedbackSurveyCard } from "./custom/FeedbackSurveyCard"

type RegComp = Parameters<typeof createRegistry>[0][string]["component"]

const REGISTRY = createRegistry({
	Button: { component: Button as RegComp, schema: registrySchemas.Button },
	Card: { component: Card as RegComp, schema: registrySchemas.Card },
	DatePicker: { component: DatePicker as RegComp, schema: registrySchemas.DatePicker },
	FeedbackSurvey: { component: FeedbackSurveyCard as RegComp, schema: registrySchemas.FeedbackSurvey },
	Flex: { component: Flex as RegComp, schema: registrySchemas.Flex },
	Grid: { component: Grid as RegComp, schema: registrySchemas.Grid },
	NumberField: { component: NumberField as RegComp, schema: registrySchemas.NumberField },
	Radio: { component: Radio as unknown as RegComp, schema: registrySchemas.Radio },
	RadioGroup: { component: RadioGroup as RegComp, schema: registrySchemas.RadioGroup },
	Select: { component: Select as RegComp, schema: registrySchemas.Select },
	Text: { component: Text as RegComp, schema: registrySchemas.Text },
	TextField: { component: TextField as RegComp, schema: registrySchemas.TextField },
})

const nodeSchema = buildRegistrySchema(REGISTRY)

interface Props {
	nodes: unknown[]
	onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	for (const n of nodes) {
		const result = nodeSchema.safeParse(n)
		if (!result.success) {
			const type = typeof n === "object" && n !== null ? (n as Record<string, unknown>).type : n
			throw new Error(`Invalid a2UI node (type: ${JSON.stringify(type)}): ${result.error.message}`)
		}
	}

	return (
		<div className="mt-3 space-y-3">
			<A2Renderer nodes={nodes} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
