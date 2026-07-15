"use client"

import {
	A2Renderer,
	Button,
	ButtonSchema,
	Card,
	CardSchema,
	Checkbox,
	CheckboxGroup,
	CheckboxGroupSchema,
	CheckboxSchema,
	createRegistry,
	Flex,
	FlexSchema,
	Grid,
	GridSchema,
	Radio,
	RadioGroup,
	RadioGroupSchema,
	RadioSchema,
	Select,
	SelectSchema,
	Text,
	TextField,
	TextFieldSchema,
	TextSchema,
} from "@a2ra/core"
import { SurveyPage, SurveyPageSchema, SurveyQuestion, SurveyQuestionSchema } from "./survey-composites"

// Strict registry: every node from the agent is validated against its schema
// before rendering.
const REGISTRY = createRegistry({
	Button: { component: Button, schema: ButtonSchema },
	Card: { component: Card, schema: CardSchema },
	Checkbox: { component: Checkbox, schema: CheckboxSchema },
	CheckboxGroup: { component: CheckboxGroup, schema: CheckboxGroupSchema },
	Flex: { component: Flex, schema: FlexSchema },
	Grid: { component: Grid, schema: GridSchema },
	Radio: { component: Radio, schema: RadioSchema },
	RadioGroup: { component: RadioGroup, schema: RadioGroupSchema },
	Select: { component: Select, schema: SelectSchema },
	SurveyPage: { component: SurveyPage, schema: SurveyPageSchema },
	SurveyQuestion: { component: SurveyQuestion, schema: SurveyQuestionSchema },
	Text: { component: Text, schema: TextSchema },
	TextField: { component: TextField, schema: TextFieldSchema },
})

interface Props {
	readonly nodes: unknown[]
	readonly onAction?: (text: string) => void
}

type LooseNode = { type?: unknown; props?: Record<string, unknown>; children?: unknown }

// Hoist SurveyQuestion.props.description into the inner input node's own
// `description` prop, so it renders below the question label and is associated
// with the field via aria-describedby. Leaves the description on the wrapper
// when there is no single input child to receive it.
function hoistQuestionDescriptions(node: unknown): unknown {
	if (!node || typeof node !== "object") return node
	const n = node as LooseNode
	if (n.type === "SurveyQuestion") {
		const props = n.props ?? {}
		const inner = n.children as LooseNode | undefined
		if (
			typeof props.description === "string" &&
			inner &&
			typeof inner === "object" &&
			!Array.isArray(inner) &&
			inner.props?.description === undefined
		) {
			const { description, ...rest } = props
			return {
				...n,
				props: rest,
				children: { ...inner, props: { ...(inner.props ?? {}), description } },
			}
		}
		return n
	}
	if (Array.isArray(n.children)) {
		return { ...n, children: n.children.map(hoistQuestionDescriptions) }
	}
	if (n.children && typeof n.children === "object") {
		return { ...n, children: hoistQuestionDescriptions(n.children) }
	}
	return n
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	const processed = nodes.map(hoistQuestionDescriptions)
	return (
		<div className="w-full">
			<A2Renderer nodes={processed} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
