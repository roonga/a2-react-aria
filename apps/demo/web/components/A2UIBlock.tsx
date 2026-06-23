"use client"

import { A2Renderer, createRegistry } from "@a2ra/core"
import schema from "../public/a2ui-schema.json"
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

const REGISTRY = createRegistry(
	{
		Button: { component: Button },
		Card: { component: Card },
		DatePicker: { component: DatePicker },
		FeedbackSurvey: { component: FeedbackSurveyCard },
		Flex: { component: Flex },
		Grid: { component: Grid },
		NumberField: { component: NumberField },
		Radio: { component: Radio },
		RadioGroup: { component: RadioGroup },
		Select: { component: Select },
		Text: { component: Text },
		TextField: { component: TextField },
	},
	schema,
)

interface Props {
	nodes: unknown[]
	onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	const result = REGISTRY.validate(nodes)
	if (!result.success) {
		throw new Error(`Invalid a2UI node(s): ${result.error}`)
	}

	return (
		<div className="mt-3 space-y-3">
			<A2Renderer nodes={nodes} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
