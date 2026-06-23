"use client"

import { A2Renderer, createNodeValidator, createRegistry } from "@a2ra/core"
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

type RegComp = Parameters<typeof createRegistry>[0][string]["component"]

const REGISTRY = createRegistry({
	Button: { component: Button as RegComp },
	Card: { component: Card as RegComp },
	DatePicker: { component: DatePicker as RegComp },
	FeedbackSurvey: { component: FeedbackSurveyCard as RegComp },
	Flex: { component: Flex as RegComp },
	Grid: { component: Grid as RegComp },
	NumberField: { component: NumberField as RegComp },
	Radio: { component: Radio as unknown as RegComp },
	RadioGroup: { component: RadioGroup as RegComp },
	Select: { component: Select as RegComp },
	Text: { component: Text as RegComp },
	TextField: { component: TextField as RegComp },
})

const validate = createNodeValidator(schema)

interface Props {
	nodes: unknown[]
	onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	const result = validate(nodes)
	if (!result.success) {
		throw new Error(`Invalid a2UI node(s): ${result.error}`)
	}

	return (
		<div className="mt-3 space-y-3">
			<A2Renderer nodes={nodes} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
