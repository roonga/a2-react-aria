"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { adminApi, type Step, type SurveyDetail } from "@/hooks/useAdminData"

export default function SurveyDetailPage() {
	const { id } = useParams<{ id: string }>()
	const [survey, setSurvey] = useState<SurveyDetail | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [editingTitle, setEditingTitle] = useState(false)
	const [titleDraft, setTitleDraft] = useState("")
	const [addingStep, setAddingStep] = useState(false)
	const [newSlug, setNewSlug] = useState("")
	const [newStepTitle, setNewStepTitle] = useState("")
	const dragRef = useRef<number | null>(null)

	function load() {
		setLoading(true)
		adminApi
			.getSurvey(id)
			.then((s) => {
				setSurvey(s)
				setTitleDraft(s.title)
			})
			.catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
			.finally(() => setLoading(false))
	}

	useEffect(load, [id])

	async function saveTitle() {
		if (!survey || titleDraft.trim() === survey.title) {
			setEditingTitle(false)
			return
		}
		try {
			const updated = await adminApi.updateSurvey(id, { title: titleDraft.trim() })
			setSurvey((s) => (s ? { ...s, title: updated.title } : s))
			setEditingTitle(false)
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to save")
		}
	}

	async function handlePublish() {
		if (!survey) return
		try {
			const updated = await adminApi.publishSurvey(id)
			setSurvey((s) => (s ? { ...s, status: updated.status } : s))
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to update")
		}
	}

	async function handleAddStep(e: React.FormEvent) {
		e.preventDefault()
		if (!newSlug.trim() || !newStepTitle.trim()) return
		try {
			await adminApi.createStep(id, { slug: newSlug.trim(), title: newStepTitle.trim(), nodes: [] })
			setNewSlug("")
			setNewStepTitle("")
			setAddingStep(false)
			load()
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to create step")
		}
	}

	async function handleDeleteStep(stepId: string, title: string) {
		if (!confirm(`Delete step "${title}"?`)) return
		try {
			await adminApi.deleteStep(id, stepId)
			load()
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to delete step")
		}
	}

	function handleDragStart(index: number) {
		dragRef.current = index
	}

	function handleDragOver(e: React.DragEvent, index: number) {
		e.preventDefault()
		if (dragRef.current === null || dragRef.current === index || !survey) return
		const steps = [...survey.steps]
		const [moved] = steps.splice(dragRef.current, 1)
		steps.splice(index, 0, moved)
		dragRef.current = index
		setSurvey({ ...survey, steps })
	}

	async function handleDrop() {
		if (!survey) return
		dragRef.current = null
		try {
			await adminApi.reorderSteps(
				id,
				survey.steps.map((s) => s.id),
			)
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to reorder")
			load()
		}
	}

	if (loading) return <p className="text-(--color-textMuted) text-sm">Loading…</p>
	if (!survey) return <p className="text-(--color-danger) text-sm">Survey not found.</p>

	return (
		<div>
			<div className="mb-1 flex items-center gap-2 text-(--color-textMuted) text-sm">
				<Link href="/admin" className="hover:text-(--color-text)">
					Surveys
				</Link>
				<span>/</span>
				<span className="text-(--color-text)">{survey.title}</span>
			</div>

			<div className="mb-6 flex items-start justify-between gap-4">
				<div className="flex-1">
					{editingTitle ? (
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={titleDraft}
								onChange={(e) => setTitleDraft(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && saveTitle()}
								onBlur={saveTitle}
								className="rounded-md border border-(--color-primary) bg-(--color-background) px-3 py-1.5 font-bold text-(--color-text) text-2xl focus:outline-none"
							/>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setEditingTitle(true)}
							className="font-bold text-(--color-text) text-2xl hover:text-(--color-primary)"
						>
							{survey.title}
						</button>
					)}
					<p className="mt-1 text-(--color-textMuted) text-sm">{survey.description || "No description"}</p>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<Link
						href={`/admin/surveys/${id}/theme`}
						className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
					>
						Theme
					</Link>
					<Link
						href={`/admin/surveys/${id}/preview`}
						className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
					>
						Preview
					</Link>
					<button
						type="button"
						onClick={handlePublish}
						className={`rounded-md px-3 py-1.5 font-medium text-sm ${
							survey.status === "published"
								? "border border-(--color-border) text-(--color-text) hover:bg-(--color-backgroundMuted)"
								: "bg-(--color-primary) text-(--color-primaryForeground) hover:bg-(--color-primaryHover)"
						}`}
					>
						{survey.status === "published" ? "Unpublish" : "Publish"}
					</button>
					<span
						className={`rounded-full px-2 py-0.5 font-medium text-xs ${
							survey.status === "published"
								? "bg-(--color-primary) text-(--color-primaryForeground)"
								: "bg-(--color-backgroundMuted) text-(--color-textMuted)"
						}`}
					>
						{survey.status}
					</span>
				</div>
			</div>

			{error && (
				<div className="mb-4 rounded-md border border-(--color-danger) bg-(--color-backgroundMuted) p-3 text-(--color-danger) text-sm">
					{error}
				</div>
			)}

			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-(--color-text) text-lg">Steps</h2>
				<button
					type="button"
					onClick={() => setAddingStep(true)}
					className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
				>
					Add Step
				</button>
			</div>

			{addingStep && (
				<form
					onSubmit={handleAddStep}
					className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-4"
				>
					<input
						type="text"
						placeholder='Slug (e.g. "about")'
						value={newSlug}
						onChange={(e) => setNewSlug(e.target.value)}
						className="rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-text) text-sm focus:outline-none focus:ring-(--color-primary) focus:ring-2"
					/>
					<input
						type="text"
						placeholder="Step title"
						value={newStepTitle}
						onChange={(e) => setNewStepTitle(e.target.value)}
						className="rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-text) text-sm focus:outline-none focus:ring-(--color-primary) focus:ring-2"
					/>
					<div className="col-span-2 flex gap-2">
						<button
							type="submit"
							className="rounded-md bg-(--color-primary) px-4 py-2 font-medium text-(--color-primaryForeground) text-sm hover:bg-(--color-primaryHover)"
						>
							Add
						</button>
						<button
							type="button"
							onClick={() => setAddingStep(false)}
							className="rounded-md border border-(--color-border) px-4 py-2 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			{survey.steps.length === 0 ? (
				<p className="text-(--color-textMuted) text-sm">No steps yet. Add one above.</p>
			) : (
				<ul className="space-y-2">
					{survey.steps.map((step: Step, index: number) => (
						<li
							key={step.id}
							draggable
							onDragStart={() => handleDragStart(index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDrop={handleDrop}
							className="flex cursor-grab items-center gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-3 active:cursor-grabbing"
						>
							<span className="select-none text-(--color-textMuted)">⠿</span>
							<span className="w-5 shrink-0 text-center text-(--color-textMuted) text-sm">{index + 1}</span>
							<div className="min-w-0 flex-1">
								<span className="font-medium text-(--color-text) text-sm">{step.title}</span>
								<span className="ml-2 text-(--color-textMuted) text-xs">/{step.slug}</span>
								{step.skip_if && (
									<span className="ml-2 rounded-full bg-(--color-backgroundMuted) px-2 py-0.5 text-(--color-textMuted) text-xs">
										conditional
									</span>
								)}
							</div>
							<span className="shrink-0 text-(--color-textMuted) text-xs">
								{(step.nodes as unknown[]).length} node(s)
							</span>
							<div className="flex shrink-0 items-center gap-1">
								<Link
									href={`/admin/surveys/${id}/steps/${step.id}`}
									className="rounded-md border border-(--color-border) px-3 py-1 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
								>
									Edit
								</Link>
								<button
									type="button"
									onClick={() => handleDeleteStep(step.id, step.title)}
									className="rounded-md border border-(--color-danger) px-3 py-1 text-(--color-danger) text-sm hover:bg-(--color-backgroundMuted)"
								>
									Delete
								</button>
							</div>
						</li>
					))}
				</ul>
			)}

		</div>
	)
}
