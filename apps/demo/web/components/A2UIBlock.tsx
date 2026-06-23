"use client"

import { A2Renderer, createRegistry } from "@a2ra/core"
import { Button, ButtonSchema } from "./a2ui/button"
import { Card, CardSchema } from "./a2ui/card"
import { DatePicker, DatePickerSchema } from "./a2ui/date-picker"
import { Flex, FlexSchema, Grid, GridSchema } from "./a2ui/layout"
import { NumberField, NumberFieldSchema } from "./a2ui/number-field"
import { Radio, RadioGroup, RadioGroupSchema, RadioSchema } from "./a2ui/radio"
import { Select, SelectSchema } from "./a2ui/select"
import { Text, TextSchema } from "./a2ui/text"
import { TextField, TextFieldSchema } from "./a2ui/text-field"
import { FeedbackSurveyCard } from "./custom/FeedbackSurveyCard"
import { FeedbackSurveySchema } from "./custom/feedback-survey.schema"

type RegComp = Parameters<typeof createRegistry>[0][string]["component"]

const REGISTRY = createRegistry({
	Button: { component: Button as RegComp, schema: ButtonSchema },
	Card: { component: Card as RegComp, schema: CardSchema },
	DatePicker: { component: DatePicker as RegComp, schema: DatePickerSchema },
	FeedbackSurvey: { component: FeedbackSurveyCard as RegComp, schema: FeedbackSurveySchema },
	Flex: { component: Flex as RegComp, schema: FlexSchema },
	Grid: { component: Grid as RegComp, schema: GridSchema },
	NumberField: { component: NumberField as RegComp, schema: NumberFieldSchema },
	Radio: { component: Radio as unknown as RegComp, schema: RadioSchema },
	RadioGroup: { component: RadioGroup as RegComp, schema: RadioGroupSchema },
	Select: { component: Select as RegComp, schema: SelectSchema },
	Text: { component: Text as RegComp, schema: TextSchema },
	TextField: { component: TextField as RegComp, schema: TextFieldSchema },
})

interface Props {
	nodes: unknown[]
	onAction?: (text: string) => void
}

function isValidNode(n: unknown): boolean {
	if (typeof n !== "object" || n === null || typeof (n as Record<string, unknown>).type !== "string") return false
	const entry = REGISTRY.get((n as Record<string, unknown>).type as string)
	if (!entry) return false
	if (!entry.schema) return true
	return entry.schema.safeParse(n).success
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	const validNodes = nodes.filter(isValidNode)

	return (
		<div className="mt-3 space-y-3">
			<A2Renderer nodes={validNodes} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
