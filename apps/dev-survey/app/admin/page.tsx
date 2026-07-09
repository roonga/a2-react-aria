"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { adminApi, type Survey } from "@/hooks/useAdminData"

export default function AdminPage() {
	const [surveys, setSurveys] = useState<Survey[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [creating, setCreating] = useState(false)
	const [newTitle, setNewTitle] = useState("")

	function load() {
		setLoading(true)
		adminApi
			.listSurveys()
			.then(setSurveys)
			.catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
			.finally(() => setLoading(false))
	}

	useEffect(load, [])

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault()
		if (!newTitle.trim()) return
		try {
			await adminApi.createSurvey(newTitle.trim())
			setNewTitle("")
			setCreating(false)
			load()
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to create")
		}
	}

	async function handleDelete(id: string, title: string) {
		if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
		try {
			await adminApi.deleteSurvey(id)
			load()
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to delete")
		}
	}

	async function handlePublish(id: string) {
		try {
			await adminApi.publishSurvey(id)
			load()
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to update")
		}
	}

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-(--color-text) text-2xl">Surveys</h1>
				<button
					type="button"
					onClick={() => setCreating(true)}
					className="rounded-md bg-(--color-primary) px-4 py-2 font-medium text-(--color-primary-foreground) text-sm hover:bg-(--color-primary-hover)"
				>
					New Survey
				</button>
			</div>

			{error && (
				<div className="mb-4 rounded-md border border-(--color-danger) bg-(--color-background-muted) p-3 text-(--color-danger) text-sm">
					{error}
				</div>
			)}

			{creating && (
				<form
					onSubmit={handleCreate}
					className="mb-6 flex items-center gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-4"
				>
					<input
						type="text"
						placeholder="Survey title"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						className="flex-1 rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-text) text-sm focus:outline-none focus:ring-(--color-primary) focus:ring-2"
					/>
					<button
						type="submit"
						className="rounded-md bg-(--color-primary) px-4 py-2 font-medium text-(--color-primary-foreground) text-sm hover:bg-(--color-primary-hover)"
					>
						Create
					</button>
					<button
						type="button"
						onClick={() => setCreating(false)}
						className="rounded-md border border-(--color-border) px-4 py-2 text-(--color-text) text-sm hover:bg-(--color-background-muted)"
					>
						Cancel
					</button>
				</form>
			)}

			{loading ? (
				<p className="text-(--color-text-muted) text-sm">Loading…</p>
			) : surveys.length === 0 ? (
				<p className="text-(--color-text-muted) text-sm">No surveys yet.</p>
			) : (
				<div className="space-y-3">
					{surveys.map((s) => (
						<div
							key={s.id}
							className="flex items-center gap-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-4"
						>
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<Link
										href={`/admin/surveys/${s.id}`}
										className="truncate font-medium text-(--color-text) hover:text-(--color-primary)"
									>
										{s.title}
									</Link>
									<span
										className={`shrink-0 rounded-full px-2 py-0.5 font-medium text-xs ${
											s.status === "published"
												? "bg-(--color-primary) text-(--color-primary-foreground)"
												: "bg-(--color-background-muted) text-(--color-text-muted)"
										}`}
									>
										{s.status}
									</span>
								</div>
								{s.description && <p className="mt-0.5 truncate text-(--color-text-muted) text-sm">{s.description}</p>}
								<p className="mt-0.5 text-(--color-text-muted) text-xs">{s.step_count ?? 0} steps</p>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								<Link
									href={`/admin/surveys/${s.id}/preview`}
									className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-background-muted)"
								>
									Preview
								</Link>
								<button
									type="button"
									onClick={() => handlePublish(s.id)}
									className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-background-muted)"
								>
									{s.status === "published" ? "Unpublish" : "Publish"}
								</button>
								<button
									type="button"
									onClick={() => handleDelete(s.id, s.title)}
									className="rounded-md border border-(--color-danger) px-3 py-1.5 text-(--color-danger) text-sm hover:bg-(--color-background-muted)"
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
