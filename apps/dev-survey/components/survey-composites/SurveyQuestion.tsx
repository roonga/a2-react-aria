import type { ReactNode } from "react"

interface SurveyQuestionProps {
	description?: string
	hint?: string
	error?: string
	children?: ReactNode
}

// `description` is normally hoisted into the inner input node by A2UIBlock so it
// renders below the question label; the paragraph here is a fallback for nodes
// where that hoist is not possible (e.g. no single input child).
export function SurveyQuestion({ description, hint, error, children }: SurveyQuestionProps) {
	return (
		<div className="space-y-1.5">
			{description && <p className="text-(--color-text-muted) text-sm">{description}</p>}
			{children}
			{hint && <p className="text-(--color-text-muted) text-xs italic">{hint}</p>}
			{error && <p className="text-(--color-danger) text-xs">{error}</p>}
		</div>
	)
}
