import type { ReactNode } from "react"

interface SurveyQuestionProps {
	label: string
	description?: string
	required?: boolean
	children?: ReactNode
}

export function SurveyQuestion({ label, description, required, children }: SurveyQuestionProps) {
	return (
		<div className="space-y-1.5">
			<p className="font-medium text-(--color-text) text-sm">
				{label}
				{required && (
					<span className="ml-0.5 text-(--color-danger)" aria-hidden="true">
						*
					</span>
				)}
			</p>
			{description && <p className="text-(--color-textMuted) text-xs">{description}</p>}
			{children}
		</div>
	)
}
