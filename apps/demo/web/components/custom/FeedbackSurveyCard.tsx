"use client"

import { ActionContext } from "@a2ra/core"
import { useContext } from "react"
import { FeedbackSurvey } from "./FeedbackSurvey"

interface FeedbackSurveyCardProps {
	title?: string
	description?: string
	submitLabel?: string
	commentPlaceholder?: string
}

export function FeedbackSurveyCard({ title, description, submitLabel, commentPlaceholder }: FeedbackSurveyCardProps) {
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
