"use client"

import { A2Renderer, buildRegistrySchema, createRegistry } from "@a2ra/core"
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

const nodeSchema = buildRegistrySchema(REGISTRY)

interface Props {
	nodes: unknown[]
	onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	const validNodes = nodes.filter((n) => nodeSchema.safeParse(n).success)

	return (
		<div className="mt-3 space-y-3">
			<A2Renderer nodes={validNodes} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
