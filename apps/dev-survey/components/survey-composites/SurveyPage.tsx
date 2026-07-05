import type { ReactNode } from "react"

interface SurveyPageProps {
	title: string
	description?: string
	children?: ReactNode
}

export function SurveyPage({ title, description, children }: SurveyPageProps) {
	return (
		<div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
			<h2 className="mb-1 font-semibold text-(--color-text) text-xl">{title}</h2>
			{description && <p className="mb-4 text-(--color-textMuted) text-sm">{description}</p>}
			<div className="space-y-5">{children}</div>
		</div>
	)
}
