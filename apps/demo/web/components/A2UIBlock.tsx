"use client"

import type { A2ComponentType } from "@a2ra/core"
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
		Button: { component: Button as A2ComponentType },
		Card: { component: Card as A2ComponentType },
		DatePicker: { component: DatePicker as A2ComponentType },
		FeedbackSurvey: { component: FeedbackSurveyCard as A2ComponentType },
		Flex: { component: Flex as A2ComponentType },
		Grid: { component: Grid as A2ComponentType },
		NumberField: { component: NumberField as A2ComponentType },
		Radio: { component: Radio as unknown as A2ComponentType },
		RadioGroup: { component: RadioGroup as A2ComponentType },
		Select: { component: Select as A2ComponentType },
		Text: { component: Text as A2ComponentType },
		TextField: { component: TextField as A2ComponentType },
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
