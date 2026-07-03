"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { adminApi, type SkipIf, type Step } from "@/hooks/useAdminData"

// ── Question data model (editor state, not DB) ────────────────────────────────

type QuestionType = "Text" | "RadioGroup" | "CheckboxGroup" | "Select" | "TextField"

interface Question {
	_id: string
	type: QuestionType
	// Text
	content?: string
	as?: string
	size?: string
	weight?: string
	align?: string
	color?: string
	// RadioGroup / CheckboxGroup / Select / TextField
	label?: string
	name?: string
	isRequired?: boolean
	// RadioGroup / CheckboxGroup — one option label per line
	options?: string[]
	// Select — {value, label} pairs
	items?: Array<{ value: string; label: string }>
	// TextField
	inputType?: string
}

let _idCounter = 0
function uid() {
	return `q${++_idCounter}`
}

// ── A2UI ↔ Question converters ────────────────────────────────────────────────

function nodeToQuestion(node: unknown): Question | null {
	if (!node || typeof node !== "object") return null
	const n = node as Record<string, unknown>
	const type = n.type as string
	const props = (n.props ?? {}) as Record<string, unknown>

	if (type === "Text") {
		return {
			_id: uid(),
			type: "Text",
			content: typeof n.children === "string" ? n.children : "",
			as: props.as as string | undefined,
			size: props.size as string | undefined,
			weight: props.weight as string | undefined,
			align: props.align as string | undefined,
			color: props.color as string | undefined,
		}
	}
	if (type === "RadioGroup") {
		const children = Array.isArray(n.children) ? (n.children as unknown[]) : []
		return {
			_id: uid(),
			type: "RadioGroup",
			label: props.label as string | undefined,
			name: props.name as string | undefined,
			isRequired: props.isRequired as boolean | undefined,
			options: children.map((c) => {
				const ch = c as Record<string, unknown>
				return (
					typeof ch.children === "string" ? ch.children : ((ch.props as Record<string, unknown>)?.value ?? "")
				) as string
			}),
		}
	}
	if (type === "CheckboxGroup") {
		const children = Array.isArray(n.children) ? (n.children as unknown[]) : []
		return {
			_id: uid(),
			type: "CheckboxGroup",
			label: props.label as string | undefined,
			name: props.name as string | undefined,
			options: children.map((c) => {
				const ch = c as Record<string, unknown>
				return (
					typeof ch.children === "string" ? ch.children : ((ch.props as Record<string, unknown>)?.value ?? "")
				) as string
			}),
		}
	}
	if (type === "Select") {
		const items = (props.items ?? props.options) as Array<{ value: string; label: string }> | undefined
		return {
			_id: uid(),
			type: "Select",
			label: props.label as string | undefined,
			name: props.name as string | undefined,
			isRequired: props.isRequired as boolean | undefined,
			items: items ?? [],
		}
	}
	if (type === "TextField") {
		return {
			_id: uid(),
			type: "TextField",
			label: props.label as string | undefined,
			name: props.name as string | undefined,
			isRequired: props.isRequired as boolean | undefined,
			inputType: props.inputType as string | undefined,
		}
	}
	return null
}

function questionToNode(q: Question): unknown {
	if (q.type === "Text") {
		const props: Record<string, unknown> = {}
		if (q.as) props.as = q.as
		if (q.size) props.size = q.size
		if (q.weight) props.weight = q.weight
		if (q.align) props.align = q.align
		if (q.color) props.color = q.color
		return { type: "Text", props, children: q.content ?? "" }
	}
	if (q.type === "RadioGroup") {
		const props: Record<string, unknown> = {}
		if (q.label) props.label = q.label
		if (q.name) props.name = q.name
		if (q.isRequired) props.isRequired = true
		return {
			type: "RadioGroup",
			props,
			children: (q.options ?? [])
				.filter((o) => o.trim())
				.map((o) => ({ type: "Radio", props: { value: o.trim(), label: o.trim() } })),
		}
	}
	if (q.type === "CheckboxGroup") {
		const props: Record<string, unknown> = {}
		if (q.label) props.label = q.label
		if (q.name) props.name = q.name
		return {
			type: "CheckboxGroup",
			props,
			children: (q.options ?? [])
				.filter((o) => o.trim())
				.map((o) => ({ type: "Checkbox", props: { value: o.trim(), label: o.trim() } })),
		}
	}
	if (q.type === "Select") {
		const props: Record<string, unknown> = {}
		if (q.label) props.label = q.label
		if (q.name) props.name = q.name
		if (q.isRequired) props.isRequired = true
		props.items = q.items ?? []
		return { type: "Select", props }
	}
	if (q.type === "TextField") {
		const props: Record<string, unknown> = {}
		if (q.label) props.label = q.label
		if (q.name) props.name = q.name
		if (q.isRequired) props.isRequired = true
		if (q.inputType) props.inputType = q.inputType
		return { type: "TextField", props }
	}
	return null
}

// Extract questions from a step's nodes_json (skip Card wrapper and nav Flex).
function extractQuestions(nodes: unknown[]): Question[] {
	const root = nodes[0] as Record<string, unknown> | undefined
	const children = root?.type === "Card" && Array.isArray(root.children) ? (root.children as unknown[]) : nodes
	return children
		.filter((c) => {
			const n = c as Record<string, unknown>
			// Skip the nav Flex (contains only Buttons)
			if (n.type === "Flex") {
				const kids = Array.isArray(n.children) ? (n.children as unknown[]) : []
				return !kids.every((k) => (k as Record<string, unknown>).type === "Button")
			}
			return true
		})
		.map(nodeToQuestion)
		.filter((q): q is Question => q !== null)
}

// Rebuild full nodes_json from question list (Card wrapper + questions + nav buttons).
function buildNodes(questions: Question[], stepSlug: string, allSteps: Step[], currentStep: Step): unknown[] {
	const isFirst = allSteps[0]?.id === currentStep.id
	const isWelcome = stepSlug === "welcome"
	const isDone = stepSlug === "done"

	const navButtons: unknown[] = []
	if (!isWelcome && !isDone && !isFirst) {
		navButtons.push({ type: "Button", props: { variant: "secondary", value: "__back__" }, children: "Back" })
	}
	if (!isDone) {
		navButtons.push({
			type: "Button",
			props: { variant: "primary", value: "__next__", size: isWelcome ? "lg" : undefined },
			children: isWelcome ? "Start Survey" : "Next",
		})
	}

	const nav =
		navButtons.length > 0
			? [{ type: "Flex", props: { gap: "sm", justify: isWelcome ? "center" : "end" }, children: navButtons }]
			: []

	return [{ type: "Card", props: { padding: "lg" }, children: [...questions.map(questionToNode), ...nav] }]
}

// ── Question form ─────────────────────────────────────────────────────────────

function QuestionForm({ q, onChange }: { q: Question; onChange: (updated: Question) => void }) {
	const update = (patch: Partial<Question>) => onChange({ ...q, ...patch })
	const p = q._id

	const inputCls =
		"w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-1.5 text-(--color-text) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
	const labelCls = "block text-(--color-textMuted) text-xs font-medium mb-1"

	if (q.type === "Text") {
		return (
			<div className="space-y-3">
				<div>
					<label htmlFor={`${p}-content`} className={labelCls}>
						Content
					</label>
					<textarea
						id={`${p}-content`}
						value={q.content ?? ""}
						onChange={(e) => update({ content: e.target.value })}
						rows={3}
						className={inputCls}
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label htmlFor={`${p}-as`} className={labelCls}>
							Element (as)
						</label>
						<select
							id={`${p}-as`}
							value={q.as ?? ""}
							onChange={(e) => update({ as: e.target.value || undefined })}
							className={inputCls}
						>
							<option value="">p (default)</option>
							<option value="h1">h1</option>
							<option value="h2">h2</option>
							<option value="h3">h3</option>
							<option value="span">span</option>
						</select>
					</div>
					<div>
						<label htmlFor={`${p}-size`} className={labelCls}>
							Size
						</label>
						<select
							id={`${p}-size`}
							value={q.size ?? ""}
							onChange={(e) => update({ size: e.target.value || undefined })}
							className={inputCls}
						>
							<option value="">default</option>
							<option value="xs">xs</option>
							<option value="sm">sm</option>
							<option value="md">md</option>
							<option value="lg">lg</option>
							<option value="xl">xl</option>
						</select>
					</div>
					<div>
						<label htmlFor={`${p}-weight`} className={labelCls}>
							Weight
						</label>
						<select
							id={`${p}-weight`}
							value={q.weight ?? ""}
							onChange={(e) => update({ weight: e.target.value || undefined })}
							className={inputCls}
						>
							<option value="">default</option>
							<option value="normal">normal</option>
							<option value="semibold">semibold</option>
							<option value="bold">bold</option>
						</select>
					</div>
					<div>
						<label htmlFor={`${p}-align`} className={labelCls}>
							Align
						</label>
						<select
							id={`${p}-align`}
							value={q.align ?? ""}
							onChange={(e) => update({ align: e.target.value || undefined })}
							className={inputCls}
						>
							<option value="">default</option>
							<option value="left">left</option>
							<option value="center">center</option>
							<option value="right">right</option>
						</select>
					</div>
					<div>
						<label htmlFor={`${p}-color`} className={labelCls}>
							Color
						</label>
						<select
							id={`${p}-color`}
							value={q.color ?? ""}
							onChange={(e) => update({ color: e.target.value || undefined })}
							className={inputCls}
						>
							<option value="">default</option>
							<option value="muted">muted</option>
							<option value="primary">primary</option>
							<option value="danger">danger</option>
						</select>
					</div>
				</div>
			</div>
		)
	}

	if (q.type === "RadioGroup" || q.type === "CheckboxGroup") {
		return (
			<div className="space-y-3">
				<div>
					<label htmlFor={`${p}-label`} className={labelCls}>
						Label
					</label>
					<input
						id={`${p}-label`}
						type="text"
						value={q.label ?? ""}
						onChange={(e) => update({ label: e.target.value })}
						className={inputCls}
					/>
				</div>
				<div>
					<label htmlFor={`${p}-name`} className={labelCls}>
						Field name
					</label>
					<input
						id={`${p}-name`}
						type="text"
						value={q.name ?? ""}
						onChange={(e) => update({ name: e.target.value })}
						className={inputCls}
					/>
				</div>
				{q.type === "RadioGroup" && (
					<label htmlFor={`${p}-required`} className="flex items-center gap-2 text-(--color-text) text-sm">
						<input
							id={`${p}-required`}
							type="checkbox"
							checked={q.isRequired ?? false}
							onChange={(e) => update({ isRequired: e.target.checked })}
						/>
						Required
					</label>
				)}
				<div>
					<label htmlFor={`${p}-options`} className={labelCls}>
						Options (one per line)
					</label>
					<textarea
						id={`${p}-options`}
						value={(q.options ?? []).join("\n")}
						onChange={(e) => update({ options: e.target.value.split("\n") })}
						rows={6}
						className={inputCls}
						placeholder="Option A&#10;Option B&#10;Option C"
					/>
				</div>
			</div>
		)
	}

	if (q.type === "Select") {
		return (
			<div className="space-y-3">
				<div>
					<label htmlFor={`${p}-label`} className={labelCls}>
						Label
					</label>
					<input
						id={`${p}-label`}
						type="text"
						value={q.label ?? ""}
						onChange={(e) => update({ label: e.target.value })}
						className={inputCls}
					/>
				</div>
				<div>
					<label htmlFor={`${p}-name`} className={labelCls}>
						Field name
					</label>
					<input
						id={`${p}-name`}
						type="text"
						value={q.name ?? ""}
						onChange={(e) => update({ name: e.target.value })}
						className={inputCls}
					/>
				</div>
				<label htmlFor={`${p}-required`} className="flex items-center gap-2 text-(--color-text) text-sm">
					<input
						id={`${p}-required`}
						type="checkbox"
						checked={q.isRequired ?? false}
						onChange={(e) => update({ isRequired: e.target.checked })}
					/>
					Required
				</label>
				<div>
					<label htmlFor={`${p}-items`} className={labelCls}>
						Items (one "Value | Label" per line, or just "Value")
					</label>
					<textarea
						id={`${p}-items`}
						value={(q.items ?? []).map((i) => (i.label !== i.value ? `${i.value} | ${i.label}` : i.value)).join("\n")}
						onChange={(e) => {
							const items = e.target.value
								.split("\n")
								.filter(Boolean)
								.map((line) => {
									const [v, l] = line.split("|").map((s) => s.trim())
									return { value: v, label: l ?? v }
								})
							update({ items })
						}}
						rows={6}
						className={inputCls}
						placeholder="Australia&#10;Canada&#10;US | United States"
					/>
				</div>
			</div>
		)
	}

	if (q.type === "TextField") {
		return (
			<div className="space-y-3">
				<div>
					<label htmlFor={`${p}-label`} className={labelCls}>
						Label
					</label>
					<input
						id={`${p}-label`}
						type="text"
						value={q.label ?? ""}
						onChange={(e) => update({ label: e.target.value })}
						className={inputCls}
					/>
				</div>
				<div>
					<label htmlFor={`${p}-name`} className={labelCls}>
						Field name
					</label>
					<input
						id={`${p}-name`}
						type="text"
						value={q.name ?? ""}
						onChange={(e) => update({ name: e.target.value })}
						className={inputCls}
					/>
				</div>
				<div>
					<label htmlFor={`${p}-inputType`} className={labelCls}>
						Input type
					</label>
					<select
						id={`${p}-inputType`}
						value={q.inputType ?? ""}
						onChange={(e) => update({ inputType: e.target.value || undefined })}
						className={inputCls}
					>
						<option value="">text (default)</option>
						<option value="email">email</option>
						<option value="number">number</option>
						<option value="url">url</option>
					</select>
				</div>
				<label htmlFor={`${p}-required`} className="flex items-center gap-2 text-(--color-text) text-sm">
					<input
						id={`${p}-required`}
						type="checkbox"
						checked={q.isRequired ?? false}
						onChange={(e) => update({ isRequired: e.target.checked })}
					/>
					Required
				</label>
			</div>
		)
	}

	return null
}

// ── Flow rule editor ──────────────────────────────────────────────────────────

function FlowRuleEditor({
	skipIf,
	onChange,
	prevStepNames,
}: {
	skipIf: SkipIf | null
	onChange: (rule: SkipIf | null) => void
	prevStepNames: Array<{ name: string; options: string[] }>
}) {
	const inputCls =
		"rounded-md border border-(--color-border) bg-(--color-background) px-3 py-1.5 text-(--color-text) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"

	const selectedField = prevStepNames.find((f) => f.name === skipIf?.field)
	const [newValue, setNewValue] = useState("")

	function addValue(v: string) {
		const trimmed = v.trim()
		if (!trimmed || !skipIf) return
		if (!skipIf.one_of.includes(trimmed)) {
			onChange({ ...skipIf, one_of: [...skipIf.one_of, trimmed] })
		}
		setNewValue("")
	}

	return (
		<div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-semibold text-(--color-text) text-sm">Conditional Skip</h3>
				{skipIf ? (
					<button
						type="button"
						onClick={() => onChange(null)}
						className="text-(--color-danger) text-xs hover:underline"
					>
						Remove rule
					</button>
				) : (
					<button
						type="button"
						onClick={() => onChange({ field: "", one_of: [] })}
						className="text-(--color-primary) text-xs hover:underline"
					>
						Add rule
					</button>
				)}
			</div>

			{skipIf ? (
				<div className="space-y-3">
					<p className="text-(--color-textMuted) text-xs">Skip this step if…</p>
					<div className="flex items-center gap-2">
						<span className="text-(--color-textMuted) text-sm">Field</span>
						<select
							value={skipIf.field}
							onChange={(e) => onChange({ ...skipIf, field: e.target.value, one_of: [] })}
							className={inputCls}
						>
							<option value="">Select a field…</option>
							{prevStepNames.map((f) => (
								<option key={f.name} value={f.name}>
									{f.name}
								</option>
							))}
						</select>
						<span className="text-(--color-textMuted) text-sm">is one of</span>
					</div>

					<div className="flex flex-wrap gap-1">
						{skipIf.one_of.map((v) => (
							<span
								key={v}
								className="flex items-center gap-1 rounded-full bg-(--color-backgroundMuted) px-2 py-0.5 text-(--color-text) text-xs"
							>
								{v}
								<button
									type="button"
									onClick={() => onChange({ ...skipIf, one_of: skipIf.one_of.filter((x) => x !== v) })}
									className="text-(--color-textMuted) hover:text-(--color-danger)"
								>
									×
								</button>
							</span>
						))}
					</div>

					<div className="flex gap-2">
						{selectedField && selectedField.options.length > 0 ? (
							<select
								value=""
								onChange={(e) => e.target.value && addValue(e.target.value)}
								className={`${inputCls} flex-1`}
							>
								<option value="">Add a value…</option>
								{selectedField.options
									.filter((o) => !skipIf.one_of.includes(o))
									.map((o) => (
										<option key={o} value={o}>
											{o}
										</option>
									))}
							</select>
						) : (
							<>
								<input
									type="text"
									placeholder="Add value…"
									value={newValue}
									onChange={(e) => setNewValue(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && addValue(newValue)}
									className={`${inputCls} flex-1`}
								/>
								<button
									type="button"
									onClick={() => addValue(newValue)}
									className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
								>
									Add
								</button>
							</>
						)}
					</div>
				</div>
			) : (
				<p className="text-(--color-textMuted) text-sm">No conditional skip rule. This step always shows.</p>
			)}
		</div>
	)
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<QuestionType, string> = {
	Text: "Text",
	RadioGroup: "Radio Group",
	CheckboxGroup: "Checkbox Group",
	Select: "Select",
	TextField: "Text Field",
}

export default function StepEditorPage() {
	const { id: surveyId, stepId } = useParams<{ id: string; stepId: string }>()
	const router = useRouter()

	const [step, setStep] = useState<Step | null>(null)
	const [allSteps, setAllSteps] = useState<Step[]>([])
	const [questions, setQuestions] = useState<Question[]>([])
	const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
	const [skipIf, setSkipIf] = useState<SkipIf | null>(null)
	const [slug, setSlug] = useState("")
	const [title, setTitle] = useState("")
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showJson, setShowJson] = useState(false)

	useEffect(() => {
		adminApi
			.getSurvey(surveyId)
			.then((survey) => {
				setAllSteps(survey.steps)
				const s = survey.steps.find((st) => st.id === stepId)
				if (!s) return
				setStep(s)
				setSlug(s.slug)
				setTitle(s.title)
				setSkipIf(s.skip_if)
				setQuestions(extractQuestions(s.nodes))
				if (survey.steps.length > 0) setSelectedIdx(0)
			})
			.catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
			.finally(() => setLoading(false))
	}, [surveyId, stepId])

	function addQuestion(type: QuestionType) {
		const q: Question = {
			_id: uid(),
			type,
			...(type === "RadioGroup" || type === "CheckboxGroup" ? { options: [] } : {}),
			...(type === "Select" ? { items: [] } : {}),
		}
		setQuestions((qs) => {
			const updated = [...qs, q]
			setSelectedIdx(updated.length - 1)
			return updated
		})
	}

	function removeQuestion(idx: number) {
		setQuestions((qs) => {
			const updated = qs.filter((_, i) => i !== idx)
			setSelectedIdx(updated.length > 0 ? Math.min(idx, updated.length - 1) : null)
			return updated
		})
	}

	function moveQuestion(idx: number, dir: -1 | 1) {
		const target = idx + dir
		if (target < 0 || target >= questions.length) return
		setQuestions((qs) => {
			const updated = [...qs]
			;[updated[idx], updated[target]] = [updated[target], updated[idx]]
			return updated
		})
		setSelectedIdx(target)
	}

	async function handleSave() {
		if (!step) return
		setSaving(true)
		setError(null)
		try {
			const nodes = buildNodes(questions, slug, allSteps, step)
			await adminApi.updateStep(surveyId, stepId, {
				slug,
				title,
				nodes,
				skip_if: skipIf ?? undefined,
				clear_skip_if: skipIf === null,
			})
			router.push(`/admin/surveys/${surveyId}`)
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to save")
			setSaving(false)
		}
	}

	// Build field options for the flow rule editor from previous steps' questions
	const currentIdx = allSteps.findIndex((s) => s.id === stepId)
	const prevStepNames = allSteps
		.slice(0, currentIdx)
		.flatMap((s) => extractQuestions(s.nodes))
		.filter((q): q is Question & { name: string } => !!q.name)
		.map((q) => ({ name: q.name, options: q.options ?? q.items?.map((i) => i.value) ?? [] }))

	const builtNodes = step ? buildNodes(questions, slug, allSteps, step) : []

	if (loading) return <p className="text-(--color-textMuted) text-sm">Loading…</p>
	if (!step) return <p className="text-(--color-danger) text-sm">Step not found.</p>

	return (
		<div>
			{/* Breadcrumb */}
			<div className="mb-4 flex items-center gap-2 text-(--color-textMuted) text-sm">
				<Link href="/admin" className="hover:text-(--color-text)">
					Surveys
				</Link>
				<span>/</span>
				<Link href={`/admin/surveys/${surveyId}`} className="hover:text-(--color-text)">
					{allSteps[0]?.survey_id ? "Survey" : "Survey"}
				</Link>
				<span>/</span>
				<span className="text-(--color-text)">{step.title}</span>
			</div>

			{/* Step meta */}
			<div className="mb-6 grid grid-cols-2 gap-4">
				<div>
					<label htmlFor="step-title" className="mb-1 block font-medium text-(--color-textMuted) text-xs">
						Step title
					</label>
					<input
						id="step-title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-text) text-sm focus:outline-none focus:ring-(--color-primary) focus:ring-2"
					/>
				</div>
				<div>
					<label htmlFor="step-slug" className="mb-1 block font-medium text-(--color-textMuted) text-xs">
						Slug (URL id)
					</label>
					<input
						id="step-slug"
						type="text"
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						className="w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-text) text-sm focus:outline-none focus:ring-(--color-primary) focus:ring-2"
					/>
				</div>
			</div>

			{error && (
				<div className="mb-4 rounded-md border border-(--color-danger) bg-(--color-backgroundMuted) p-3 text-(--color-danger) text-sm">
					{error}
				</div>
			)}

			{/* Question builder */}
			<div className="mb-6 grid grid-cols-5 gap-4">
				{/* Left: question list */}
				<div className="col-span-2 space-y-2">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-(--color-text) text-sm">Questions</h2>
						<div className="flex gap-1">
							{(["Text", "RadioGroup", "CheckboxGroup", "Select", "TextField"] as QuestionType[]).map((t) => (
								<button
									key={t}
									type="button"
									title={`Add ${TYPE_LABELS[t]}`}
									onClick={() => addQuestion(t)}
									className="rounded border border-(--color-border) px-2 py-1 text-(--color-textMuted) text-xs hover:bg-(--color-backgroundMuted) hover:text-(--color-text)"
								>
									+{t.replace("Group", "").slice(0, 3)}
								</button>
							))}
						</div>
					</div>

					{questions.length === 0 ? (
						<p className="rounded-lg border border-(--color-border) border-dashed p-4 text-center text-(--color-textMuted) text-sm">
							No questions. Use + buttons above to add.
						</p>
					) : (
						questions.map((q, idx) => (
							<div
								key={q._id}
								className={`rounded-lg border p-3 ${
									selectedIdx === idx
										? "border-(--color-primary) bg-(--color-backgroundMuted)"
										: "border-(--color-border) bg-(--color-surface)"
								}`}
							>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setSelectedIdx(idx)}
										className="flex-1 truncate text-left text-(--color-text) text-sm hover:text-(--color-primary)"
									>
										<span className="text-(--color-textMuted) text-xs">{TYPE_LABELS[q.type]}</span>
										{(q.label ?? q.content) && (
											<>
												{" "}
												<span className="font-medium">{q.label ?? q.content}</span>
											</>
										)}
									</button>
									<div className="flex shrink-0 gap-1">
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation()
												moveQuestion(idx, -1)
											}}
											disabled={idx === 0}
											className="text-(--color-textMuted) hover:text-(--color-text) disabled:opacity-30"
											title="Move up"
										>
											↑
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation()
												moveQuestion(idx, 1)
											}}
											disabled={idx === questions.length - 1}
											className="text-(--color-textMuted) hover:text-(--color-text) disabled:opacity-30"
											title="Move down"
										>
											↓
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation()
												removeQuestion(idx)
											}}
											className="text-(--color-danger) hover:text-(--color-dangerHover)"
											title="Remove"
										>
											×
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Right: question form */}
				<div className="col-span-3">
					{selectedIdx !== null && questions[selectedIdx] ? (
						<div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
							<h3 className="mb-4 font-semibold text-(--color-text) text-sm">
								Edit {TYPE_LABELS[questions[selectedIdx].type]}
							</h3>
							<QuestionForm
								q={questions[selectedIdx]}
								onChange={(updated) => {
									setQuestions((qs) => qs.map((q, i) => (i === selectedIdx ? updated : q)))
								}}
							/>
						</div>
					) : (
						<div className="flex h-full items-center justify-center rounded-lg border border-(--color-border) border-dashed p-8 text-(--color-textMuted) text-sm">
							Select a question to edit it.
						</div>
					)}
				</div>
			</div>

			{/* Flow rule editor */}
			<div className="mb-6">
				<FlowRuleEditor skipIf={skipIf} onChange={setSkipIf} prevStepNames={prevStepNames} />
			</div>

			{/* JSON preview */}
			<div className="mb-6">
				<button
					type="button"
					onClick={() => setShowJson((v) => !v)}
					className="text-(--color-primary) text-sm hover:underline"
				>
					{showJson ? "Hide" : "Show"} A2UI JSON preview
				</button>
				{showJson && (
					<pre className="mt-2 overflow-auto rounded-lg border border-(--color-border) bg-(--color-backgroundMuted) p-4 text-(--color-text) text-xs">
						{JSON.stringify(builtNodes, null, 2)}
					</pre>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-3">
				<button
					type="button"
					onClick={handleSave}
					disabled={saving}
					className="rounded-md bg-(--color-primary) px-6 py-2 font-medium text-(--color-primaryForeground) text-sm hover:bg-(--color-primaryHover) disabled:opacity-50"
				>
					{saving ? "Saving…" : "Save Step"}
				</button>
				<Link
					href={`/admin/surveys/${surveyId}`}
					className="rounded-md border border-(--color-border) px-6 py-2 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
				>
					Cancel
				</Link>
			</div>
		</div>
	)
}
