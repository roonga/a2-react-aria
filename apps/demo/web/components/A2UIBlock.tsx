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
import { registrySchemas } from "../lib/registry-schemas"
import schema from "../public/a2ui-schema.json"
import { FeedbackSurveyCard } from "./custom/FeedbackSurveyCard"

const REGISTRY = createRegistry(
	{
		Button: { component: Button, schema: registrySchemas.Button },
		Card: { component: Card, schema: registrySchemas.Card },
		DatePicker: { component: DatePicker, schema: registrySchemas.DatePicker },
		FeedbackSurvey: { component: FeedbackSurveyCard, schema: registrySchemas.FeedbackSurvey },
		Flex: { component: Flex, schema: registrySchemas.Flex },
		Grid: { component: Grid, schema: registrySchemas.Grid },
		NumberField: { component: NumberField, schema: registrySchemas.NumberField },
		Radio: { component: Radio, schema: registrySchemas.Radio },
		RadioGroup: { component: RadioGroup, schema: registrySchemas.RadioGroup },
		Select: { component: Select, schema: registrySchemas.Select },
		Text: { component: Text, schema: registrySchemas.Text },
		TextField: { component: TextField, schema: registrySchemas.TextField },
	},
	{ jsonSchema: schema },
)

interface Props {
	readonly nodes: unknown[]
	readonly onAction?: (text: string) => void
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
