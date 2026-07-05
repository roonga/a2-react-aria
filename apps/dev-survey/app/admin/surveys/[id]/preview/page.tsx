"use client"

import { FormStateContext } from "@a2ra/core"
import Link from "next/link"
import { useParams } from "next/navigation"
import { type CSSProperties, useEffect, useState } from "react"
import A2UIBlock from "@/components/A2UIBlock"
import { adminApi, type SkipCondition, type SkipGroup, type SkipIf, type SurveyDetail } from "@/hooks/useAdminData"

interface PreviewStep {
	id: string
	slug: string
	title: string
	nodes: unknown[]
	skip_if: unknown
}

type A2Node = { props?: Record<string, unknown>; children?: unknown }

function withPageTitle(nodes: unknown[], title: string): unknown[] {
	const root = nodes[0] as Record<string, unknown> | undefined
	if (!root || root.type !== "SurveyPage") return nodes
	const props = (root.props ?? {}) as Record<string, unknown>
	if (props.title) return nodes
	return [{ ...root, props: { ...props, title } }]
}

function buildLabelToNameMap(nodes: unknown[]): Record<string, string> {
	const map: Record<string, string> = {}
	function walk(n: unknown): void {
		if (!n || typeof n !== "object") return
		const node = n as A2Node
		const { label, name } = node.props ?? {}
		if (typeof label === "string" && typeof name === "string") map[label] = name
		const c = node.children
		if (Array.isArray(c)) c.forEach(walk)
		else if (c) walk(c)
	}
	nodes.forEach(walk)
	return map
}

function evaluateSkip(step: PreviewStep, answers: Record<string, string>): boolean {
	const si = step.skip_if as Record<string, unknown> | null
	if (!si) return false
	// Old format: { field, one_of }
	if (typeof si.field === "string" && Array.isArray(si.one_of)) {
		const val = answers[si.field]
		return typeof val === "string" && (si.one_of as string[]).includes(val)
	}
	// New format: { groups_op, groups }
	if (Array.isArray(si.groups)) {
		const skipIf = si as unknown as SkipIf
		const evalCond = (c: SkipCondition): boolean => {
			if (!c || typeof c.field !== "string" || !Array.isArray(c.values)) return false
			const val = answers[c.field]
			return typeof val === "string" && c.values.includes(val)
		}
		const evalGroup = (g: SkipGroup): boolean => {
			if (!g || !Array.isArray(g.conditions)) return false
			return g.op === "and" ? g.conditions.every(evalCond) : g.conditions.some(evalCond)
		}
		return skipIf.groups_op === "and" ? skipIf.groups.every(evalGroup) : skipIf.groups.some(evalGroup)
	}
	return false
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

	if (loading) return <p className="text-(--color-text-muted) text-sm">Loading…</p>
	if (error) return <p className="text-(--color-danger) text-sm">{error}</p>
	if (!survey) return null

	const visibleSteps = survey.steps.filter((s) => !evaluateSkip(s as PreviewStep, answers))
	const currentStep = visibleSteps[stepIndex] as PreviewStep | undefined
	const totalSteps = visibleSteps.length
	const progress = Math.round((stepIndex / Math.max(totalSteps - 1, 1)) * 100)

	const titledNodes = currentStep ? withPageTitle(currentStep.nodes as never[], currentStep.title) : []
	const labelToName = buildLabelToNameMap(titledNodes)

	function setValue(label: string, value: string) {
		const key = labelToName[label] ?? label
		setStepValues((prev) => ({ ...prev, [key]: value }))
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

	const isDone = currentStep?.slug === "done"
	const isWelcome = currentStep?.slug === "welcome"

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2 text-(--color-text-muted) text-sm">
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
						className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-background-muted)"
					>
						Restart
					</button>
					<Link
						href={`/admin/surveys/${id}`}
						className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-background-muted)"
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

			<div className="mx-auto max-w-2xl flex flex-col gap-4">
				<div
					style={{
						...(Object.fromEntries(
							Object.entries(survey.theme ?? {}).filter(([k]) => k.startsWith("--")),
						) as CSSProperties),
						fontFamily: "var(--font-family, inherit)",
					}}
				>
					{!isDone && !isWelcome && (
						<div className="mb-4 flex items-center gap-3">
							<div className="h-2 flex-1 overflow-hidden rounded-full bg-(--color-background-muted)">
								<div
									className="h-full rounded-full bg-(--color-primary) transition-all duration-300"
									style={{ width: `${progress}%` }}
								/>
							</div>
							<span className="shrink-0 text-(--color-text-muted) text-sm">
								{stepIndex} / {totalSteps - 2}
							</span>
						</div>
					)}

					{currentStep ? (
						<FormStateContext.Provider value={{ setValue }}>
							<A2UIBlock nodes={titledNodes as never} />
						</FormStateContext.Provider>
					) : (
						<p className="text-(--color-text-muted) text-sm">No steps to preview.</p>
					)}
				</div>

				{!isDone && currentStep && (
					<div className={`flex gap-2 ${isWelcome ? "justify-center" : "justify-end"}`}>
						{!isWelcome && stepIndex > 0 && (
							<button
								type="button"
								onClick={() => handleAction("__back__")}
								className="rounded-md border border-(--color-border) px-4 py-2 text-(--color-text) text-sm hover:bg-(--color-background-muted)"
							>
								Back
							</button>
						)}
						<button
							type="button"
							onClick={() => handleAction("__next__")}
							className="rounded-md bg-(--color-primary) px-4 py-2 text-(--color-primary-foreground) text-sm hover:opacity-90"
						>
							{isWelcome ? "Start Survey" : "Next"}
						</button>
					</div>
				)}

				<div className="mt-4 rounded-lg border border-(--color-border) bg-(--color-background-muted) p-3">
					<p className="mb-1 font-medium text-(--color-text-muted) text-xs">Current answers (debug)</p>
					<pre className="text-(--color-text) text-xs">{JSON.stringify({ ...answers, ...stepValues }, null, 2)}</pre>
				</div>
			</div>
		</div>
	)
}
