"use client"

import { FormStateContext } from "@a2ra/core"
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react"
import { type BackendSurveyStep, submitSurvey, useSurveyData } from "@/hooks/useSurveyData"
import A2UIBlock from "./A2UIBlock"

type SurveyAnswers = Record<string, string | string[]>

function withPageTitle(nodes: unknown[], title: string): unknown[] {
	const root = nodes[0] as Record<string, unknown> | undefined
	if (root?.type !== "SurveyPage") return nodes
	const props = (root.props ?? {}) as Record<string, unknown>
	if (props.title) return nodes
	return [{ ...root, props: { ...props, title } }, ...nodes.slice(1)]
}

function evaluateSkip(step: BackendSurveyStep, answers: SurveyAnswers): boolean {
	const si = step.skip_if as Record<string, unknown> | null | undefined
	if (!si) return false
	if (typeof si.field === "string" && Array.isArray(si.one_of)) {
		const val = answers[si.field]
		return typeof val === "string" && (si.one_of as string[]).includes(val)
	}
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

function deriveColorOverrides(dark: boolean): Record<string, string> {
	const light = !dark
	return {
		"--color-background": light ? "#ffffff" : "#0f172a",
		"--color-surface": light ? "#f8fafc" : "#1e293b",
		"--color-text": light ? "#0f172a" : "#f8fafc",
		"--color-text-muted": light ? "#64748b" : "#94a3b8",
		"--color-border": light ? "#e2e8f0" : "#334155",
		"--color-background-muted": light ? "#f1f5f9" : "#1e293b",
	}
}

export default function Survey() {
	const { steps, theme, isLoading, error } = useSurveyData()
	const [stepIndex, setStepIndex] = useState(0)
	const [answers, setAnswers] = useState<SurveyAnswers>({})
	const [stepValues, setStepValues] = useState<SurveyAnswers>({})
	const [submitted, setSubmitted] = useState(false)

	const savedBase = (theme._base as string) === "dark" ? "dark" : "light"
	const [darkMode, setDarkMode] = useState(savedBase === "dark")

	// Sync toggle state when theme loads
	useEffect(() => {
		setDarkMode(savedBase === "dark")
	}, [savedBase])

	// Effective theme: stored theme vars, with color tokens overridden when user toggles base
	const effectiveTheme = useMemo(() => {
		if (darkMode === (savedBase === "dark")) return theme
		return { ...theme, ...deriveColorOverrides(darkMode) }
	}, [theme, darkMode, savedBase])

	// Apply theme to document root so body background and other global styles pick it up
	useEffect(() => {
		const el = document.documentElement
		const entries = Object.entries(effectiveTheme).filter(([k]) => k.startsWith("--")) as [string, string][]
		for (const [k, v] of entries) el.style.setProperty(k, v)
		el.style.setProperty("font-family", "var(--font-family, inherit)")
		return () => {
			for (const [k] of entries) el.style.removeProperty(k)
			el.style.removeProperty("font-family")
		}
	}, [effectiveTheme])

	const themeVars = useMemo(
		() => Object.fromEntries(Object.entries(effectiveTheme).filter(([k]) => k.startsWith("--"))) as CSSProperties,
		[effectiveTheme],
	)

	const visibleSteps = useMemo(() => getVisibleSteps(steps, answers), [steps, answers])
	const currentStep = visibleSteps[stepIndex]
	const totalSteps = visibleSteps.length
	const progress = Math.round((stepIndex / Math.max(totalSteps - 1, 1)) * 100)

	const titledNodes = useMemo(
		() => (currentStep ? withPageTitle(currentStep.nodes, currentStep.title) : []),
		[currentStep],
	)

	const setValue = useCallback((key: string, value: string | string[]) => {
		setStepValues((prev) => ({ ...prev, [key]: value }))
	}, [])

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
		<div className="flex flex-col gap-4" style={{ ...themeVars, fontFamily: "var(--font-family, inherit)" }}>
			{/* Appearance toggle */}
			<div className="flex justify-end">
				<button
					type="button"
					aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
					onClick={() => setDarkMode((d) => !d)}
					className="rounded-full border border-(--color-border) bg-(--color-surface) p-1.5 text-(--color-text-muted) transition-colors hover:text-(--color-text)"
				>
					{darkMode ? (
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
						</svg>
					) : (
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					)}
				</button>
			</div>

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
