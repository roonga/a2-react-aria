"use client"

import { FormStateContext } from "@a2ra/core"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import A2UIBlock from "@/components/A2UIBlock"
import { adminApi, type SurveyDetail } from "@/hooks/useAdminData"

interface PreviewStep {
	id: string
	title: string
	nodes: unknown[]
	skip_if: { field: string; one_of: string[] } | null
}

function evaluateSkip(step: PreviewStep, answers: Record<string, string>): boolean {
	if (!step.skip_if) return false
	const value = answers[step.skip_if.field]
	return typeof value === "string" && step.skip_if.one_of.includes(value)
}

export default function PreviewPage() {
	const { id } = useParams<{ id: string }>()
	const [survey, setSurvey] = useState<SurveyDetail | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [stepIndex, setStepIndex] = useState(0)
	const [answers, setAnswers] = useState<Record<string, string>>({})
	const [stepValues, setStepValues] = useState<Record<string, string>>({})

	useEffect(() => {
		adminApi
			.getSurvey(id)
			.then(setSurvey)
			.catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
			.finally(() => setLoading(false))
	}, [id])

	if (loading) return <p className="text-(--color-textMuted) text-sm">Loading…</p>
	if (error) return <p className="text-(--color-danger) text-sm">{error}</p>
	if (!survey) return null

	const visibleSteps = survey.steps.filter((s) => !evaluateSkip(s as PreviewStep, answers))
	const currentStep = visibleSteps[stepIndex] as PreviewStep | undefined
	const totalSteps = visibleSteps.length
	const progress = Math.round((stepIndex / Math.max(totalSteps - 1, 1)) * 100)

	function setValue(label: string, value: string) {
		setStepValues((prev) => ({ ...prev, [label]: value }))
	}

	function handleAction(action: string) {
		if (action === "__next__") {
			setAnswers((a) => ({ ...a, ...stepValues }))
			setStepValues({})
			setStepIndex((i) => Math.min(i + 1, totalSteps - 1))
		} else if (action === "__back__") {
			setStepValues({})
			setStepIndex((i) => Math.max(i - 1, 0))
		}
	}

	const isDone = currentStep?.id === "done"
	const isWelcome = currentStep?.id === "welcome"

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2 text-(--color-textMuted) text-sm">
					<Link href="/admin" className="hover:text-(--color-text)">
						Surveys
					</Link>
					<span>/</span>
					<Link href={`/admin/surveys/${id}`} className="hover:text-(--color-text)">
						{survey.title}
					</Link>
					<span>/</span>
					<span className="text-(--color-text)">Preview</span>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => {
							setStepIndex(0)
							setAnswers({})
							setStepValues({})
						}}
						className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
					>
						Restart
					</button>
					<Link
						href={`/admin/surveys/${id}`}
						className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
					>
						Back to editor
					</Link>
				</div>
			</div>

			{/* Step indicator */}
			<div className="mb-4 flex gap-1">
				{visibleSteps.map((s, i) => (
					<button
						key={s.id}
						type="button"
						onClick={() => setStepIndex(i)}
						title={s.title}
						className={`h-1.5 flex-1 rounded-full transition-colors ${
							i === stepIndex ? "bg-(--color-primary)" : "bg-(--color-border)"
						}`}
					/>
				))}
			</div>

			<div className="mx-auto max-w-2xl">
				{!isDone && !isWelcome && (
					<div className="mb-4 flex items-center gap-3">
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-(--color-backgroundMuted)">
							<div
								className="h-full rounded-full bg-(--color-primary) transition-all duration-300"
								style={{ width: `${progress}%` }}
							/>
						</div>
						<span className="shrink-0 text-(--color-textMuted) text-sm">
							{stepIndex} / {totalSteps - 2}
						</span>
					</div>
				)}

				{currentStep ? (
					<FormStateContext.Provider value={{ setValue }}>
						<A2UIBlock nodes={currentStep.nodes as never} onAction={handleAction} />
					</FormStateContext.Provider>
				) : (
					<p className="text-(--color-textMuted) text-sm">No steps to preview.</p>
				)}

				<div className="mt-4 rounded-lg border border-(--color-border) bg-(--color-backgroundMuted) p-3">
					<p className="mb-1 font-medium text-(--color-textMuted) text-xs">Current answers (debug)</p>
					<pre className="text-(--color-text) text-xs">{JSON.stringify({ ...answers, ...stepValues }, null, 2)}</pre>
				</div>
			</div>
		</div>
	)
}
