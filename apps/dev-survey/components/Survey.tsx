"use client"

import { FormStateContext } from "@a2ra/core"
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react"
import { type BackendSurveyStep, submitSurvey, useSurveyData } from "@/hooks/useSurveyData"
import A2UIBlock from "./A2UIBlock"

type SurveyAnswers = Record<string, string | string[]>

type A2Node = { type?: string; props?: Record<string, unknown>; children?: unknown }

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

function evaluateSkip(step: BackendSurveyStep, answers: SurveyAnswers): boolean {
	const si = step.skip_if as Record<string, unknown> | null | undefined
	if (!si) return false
	// Old format: { field, one_of }
	if (typeof si.field === "string" && Array.isArray(si.one_of)) {
		const val = answers[si.field]
		return typeof val === "string" && (si.one_of as string[]).includes(val)
	}
	// New multi-group format: { groups_op, groups }
	if (Array.isArray(si.groups)) {
		type Cond = { field: string; values: string[] }
		type Group = { op: "and" | "or"; conditions: Cond[] }
		const evalCond = (c: Cond): boolean => {
			if (!c || typeof c.field !== "string" || !Array.isArray(c.values)) return false
			const val = answers[c.field]
			return typeof val === "string" && c.values.includes(val)
		}
		const evalGroup = (g: Group): boolean => {
			if (!g || !Array.isArray(g.conditions)) return false
			return g.op === "and" ? g.conditions.every(evalCond) : g.conditions.some(evalCond)
		}
		const groups = si.groups as Group[]
		return si.groups_op === "and" ? groups.every(evalGroup) : groups.some(evalGroup)
	}
	return false
}

function getVisibleSteps(steps: BackendSurveyStep[], answers: SurveyAnswers): BackendSurveyStep[] {
	return steps.filter((s) => !evaluateSkip(s, answers))
}

export default function Survey() {
	const { steps, theme, isLoading, error } = useSurveyData()
	const [stepIndex, setStepIndex] = useState(0)
	const [answers, setAnswers] = useState<SurveyAnswers>({})
	const [stepValues, setStepValues] = useState<Record<string, string>>({})
	const [submitted, setSubmitted] = useState(false)

	const visibleSteps = useMemo(() => getVisibleSteps(steps, answers), [steps, answers])
	const currentStep = visibleSteps[stepIndex]
	const totalSteps = visibleSteps.length
	const progress = Math.round((stepIndex / Math.max(totalSteps - 1, 1)) * 100)

	const titledNodes = useMemo(
		() => (currentStep ? withPageTitle(currentStep.nodes, currentStep.title) : []),
		[currentStep],
	)
	const labelToName = useMemo(() => buildLabelToNameMap(titledNodes), [titledNodes])

	const setValue = useCallback(
		(label: string, value: string) => {
			const key = labelToName[label] ?? label
			setStepValues((prev) => ({ ...prev, [key]: value }))
		},
		[labelToName],
	)

	const handleAction = useCallback(
		(action: string) => {
			if (action === "__next__") {
				const merged: SurveyAnswers = { ...answers, ...stepValues }
				setAnswers(merged)
				setStepValues({})
				setStepIndex((i) => Math.min(i + 1, totalSteps - 1))
			} else if (action === "__back__") {
				setStepValues({})
				setStepIndex((i) => Math.max(i - 1, 0))
			}
		},
		[answers, stepValues, totalSteps],
	)

	useEffect(() => {
		if (currentStep?.id === "done" && !submitted) {
			setSubmitted(true)
			const finalAnswers = { ...answers, ...stepValues }
			submitSurvey(finalAnswers).catch((err: unknown) => {
				console.error("[Survey] submit failed:", err)
			})
		}
	}, [currentStep, submitted, answers, stepValues])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<p className="text-(--color-text-muted) text-sm">Loading survey…</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-16">
				<p className="text-(--color-danger) text-sm">Could not load survey: {error}</p>
			</div>
		)
	}

	if (!currentStep) return null

	const isDone = currentStep.id === "done"
	const isWelcome = currentStep.id === "welcome"

	return (
		<div className="flex flex-col gap-4">
			<div
				style={{
					...(Object.fromEntries(Object.entries(theme).filter(([k]) => k.startsWith("--"))) as CSSProperties),
					fontFamily: "var(--font-family, inherit)",
				}}
				className="flex flex-col gap-4"
			>
				{!isDone && !isWelcome && (
					<div className="flex items-center gap-3">
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

				<FormStateContext.Provider value={{ setValue }}>
					<A2UIBlock nodes={titledNodes} />
				</FormStateContext.Provider>
			</div>

			{!isDone && (
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
		</div>
	)
}
