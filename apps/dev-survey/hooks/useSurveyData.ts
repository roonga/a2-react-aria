"use client"

import { useEffect, useState } from "react"

export interface SkipCondition {
	field: string
	oneOf: string[]
}

export interface BackendSurveyStep {
	id: string
	title: string
	nodes: unknown[]
	skipIf?: SkipCondition
}

interface UseSurveyDataResult {
	steps: BackendSurveyStep[]
	theme: Record<string, string>
	isLoading: boolean
	error: string | null
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9081"

export function useSurveyData(): UseSurveyDataResult {
	const [steps, setSteps] = useState<BackendSurveyStep[]>([])
	const [theme, setTheme] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		fetch(`${API_BASE}/api/survey/steps`)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`)
				return r.json() as Promise<{ steps: BackendSurveyStep[]; theme?: Record<string, string> }>
			})
			.then((data) => {
				setSteps(data.steps)
				setTheme(data.theme ?? {})
				setIsLoading(false)
			})
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : "Failed to load survey")
				setIsLoading(false)
			})
	}, [])

	return { steps, theme, isLoading, error }
}

export function submitSurvey(answers: Record<string, string | string[]>): Promise<void> {
	return fetch(`${API_BASE}/api/survey/submit`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ answers }),
	}).then((r) => {
		if (!r.ok) throw new Error(`HTTP ${r.status}`)
	})
}
