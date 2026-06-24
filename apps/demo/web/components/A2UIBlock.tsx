"use client"

import {
	A2Renderer,
	Button,
	Card,
	createRegistry,
	DatePicker,
	Flex,
	Grid,
	NumberField,
	Radio,
	RadioGroup,
	Select,
	Text,
	TextField,
} from "@a2ra/core"
import schema from "../public/a2ui-schema.json"
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
