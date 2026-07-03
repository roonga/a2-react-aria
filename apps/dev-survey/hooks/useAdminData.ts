"use client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9081"

export interface Survey {
	id: string
	title: string
	description: string
	status: "draft" | "published"
	created_at: string
	updated_at: string
	step_count?: number
	theme?: Record<string, string>
}

export interface SkipIf {
	field: string
	one_of: string[]
}

export interface Step {
	id: string
	survey_id: string
	slug: string
	title: string
	position: number
	nodes: unknown[]
	skip_if: SkipIf | null
	updated_at: string
}

export interface SurveyDetail extends Survey {
	steps: Step[]
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { "Content-Type": "application/json" },
		...init,
	})
	if (!res.ok) {
		const text = await res.text().catch(() => "")
		throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`)
	}
	if (res.status === 204) return undefined as T
	return res.json() as Promise<T>
}

// ── Surveys ──────────────────────────────────────────────────────────────────

export const adminApi = {
	listSurveys: () => apiFetch<Survey[]>("/api/admin/surveys"),

	getSurvey: (id: string) => apiFetch<SurveyDetail>(`/api/admin/surveys/${id}`),

	createSurvey: (title: string, description = "") =>
		apiFetch<Survey>("/api/admin/surveys", {
			method: "POST",
			body: JSON.stringify({ title, description }),
		}),

	updateSurvey: (id: string, data: { title?: string; description?: string; theme?: Record<string, string> }) =>
		apiFetch<Survey>(`/api/admin/surveys/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		}),

	deleteSurvey: (id: string) => apiFetch<void>(`/api/admin/surveys/${id}`, { method: "DELETE" }),

	publishSurvey: (id: string) => apiFetch<Survey>(`/api/admin/surveys/${id}/publish`, { method: "PUT" }),

	// ── Steps ─────────────────────────────────────────────────────────────────

	createStep: (surveyId: string, data: { slug: string; title: string; nodes?: unknown[] }) =>
		apiFetch<Step>(`/api/admin/surveys/${surveyId}/steps`, {
			method: "POST",
			body: JSON.stringify(data),
		}),

	updateStep: (
		surveyId: string,
		stepId: string,
		data: {
			slug?: string
			title?: string
			nodes?: unknown[]
			skip_if?: SkipIf | null
			clear_skip_if?: boolean
		},
	) =>
		apiFetch<Step>(`/api/admin/surveys/${surveyId}/steps/${stepId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		}),

	deleteStep: (surveyId: string, stepId: string) =>
		apiFetch<void>(`/api/admin/surveys/${surveyId}/steps/${stepId}`, { method: "DELETE" }),

	reorderSteps: (surveyId: string, stepIds: string[]) =>
		apiFetch<Step[]>(`/api/admin/surveys/${surveyId}/steps/reorder`, {
			method: "PUT",
			body: JSON.stringify({ step_ids: stepIds }),
		}),
}
