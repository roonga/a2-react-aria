"use client"

import {
	A2Renderer,
	Button,
	Card,
	Checkbox,
	CheckboxGroup,
	createRegistry,
	Flex,
	Grid,
	Radio,
	RadioGroup,
	Select,
	Text,
	TextField,
} from "@a2ra/core"
import { SurveyPage, SurveyQuestion } from "./survey-composites"

const REGISTRY = createRegistry({
	Button: { component: Button },
	Card: { component: Card },
	Checkbox: { component: Checkbox },
	CheckboxGroup: { component: CheckboxGroup },
	Flex: { component: Flex },
	Grid: { component: Grid },
	Radio: { component: Radio },
	RadioGroup: { component: RadioGroup },
	Select: { component: Select },
	SurveyPage: { component: SurveyPage },
	SurveyQuestion: { component: SurveyQuestion },
	Text: { component: Text },
	TextField: { component: TextField },
})

interface Props {
	readonly nodes: unknown[]
	readonly onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	return (
		<div className="w-full">
			<A2Renderer nodes={nodes} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
