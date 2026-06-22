"use client"

import { A2Renderer, ActionContext, createRegistry } from "@a2ra/core"
import { useContext } from "react"
import { Button } from "./a2ui/button"
import { Card } from "./a2ui/card"
import { DatePicker } from "./a2ui/date-picker"
import { Flex, Grid } from "./a2ui/layout"
import { NumberField } from "./a2ui/number-field"
import { Radio, RadioGroup } from "./a2ui/radio"
import { Select } from "./a2ui/select"
import { Text } from "./a2ui/text"
import { TextField } from "./a2ui/text-field"
import { FeedbackSurvey } from "./custom/FeedbackSurvey"

type RegComp = Parameters<typeof createRegistry>[0][string]["component"]

function FeedbackSurveyCard({
	title,
	description,
	submitLabel,
	commentPlaceholder,
}: {
	title?: string
	description?: string
	submitLabel?: string
	commentPlaceholder?: string
}) {
	const ctx = useContext(ActionContext)
	return (
		<FeedbackSurvey
			title={title}
			description={description}
			submitLabel={submitLabel}
			commentPlaceholder={commentPlaceholder}
			onSubmit={(rating, comment) => {
				const stars = "★".repeat(rating) + "☆".repeat(5 - rating)
				const text = comment ? `Feedback: ${stars} (${rating}/5) — ${comment}` : `Feedback: ${stars} (${rating}/5)`
				ctx?.fire(text)
			}}
		/>
	)
}

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

interface Props {
	nodes: unknown[]
	onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	return (
		<div className="mt-3 space-y-3">
			<A2Renderer nodes={nodes} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
