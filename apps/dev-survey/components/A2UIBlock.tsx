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
