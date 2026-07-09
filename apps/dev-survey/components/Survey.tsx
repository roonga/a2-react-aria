"use client"

import { FormStateContext } from "@a2ra/core"
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react"
import { type BackendSurveyStep, submitSurvey, useSurveyData } from "@/hooks/useSurveyData"
import A2UIBlock from "./A2UIBlock"

type SurveyAnswers = Record<string, string | string[]>

type A2Node = { type?: string; props?: Record<string, unknown>; children?: unknown }

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
	if (!step.skipIf) return false
	const value = answers[step.skipIf.field]
	return typeof value === "string" && step.skipIf.oneOf.includes(value)
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

	const labelToName = useMemo(() => buildLabelToNameMap(currentStep?.nodes ?? []), [currentStep])

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
				<A2UIBlock nodes={currentStep.nodes} onAction={handleAction} />
			</FormStateContext.Provider>
		</div>
	)
}
