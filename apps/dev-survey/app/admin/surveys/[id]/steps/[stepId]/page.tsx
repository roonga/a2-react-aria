"use client"

import { FormStateContext } from "@a2ra/core"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react"
import A2UIBlock from "@/components/A2UIBlock"
import { adminApi, type SkipIf, type Step } from "@/hooks/useAdminData"

// ── Skip-rule editor types (extend API types with stable _id for React keys) ──

interface EditorCondition {
	_id: string
	field: string
	values: string[]
}

interface EditorGroup {
	_id: string
	op: "and" | "or"
	conditions: EditorCondition[]
}

interface EditorSkipIf {
	groups_op: "and" | "or"
	groups: EditorGroup[]
}

function toApiSkipIf(e: EditorSkipIf | null): SkipIf | null {
	if (!e) return null
	return {
		groups_op: e.groups_op,
		groups: e.groups.map((g) => ({
			op: g.op,
			conditions: g.conditions.map((c) => ({ field: c.field, values: c.values })),
		})),
	}
}

// ── Skip-rule backward compat ─────────────────────────────────────────────────

function normalizeSkipIf(raw: unknown): EditorSkipIf | null {
	if (!raw || typeof raw !== "object") return null
	const r = raw as Record<string, unknown>
	// Old format: { field: string, one_of: string[] }
	if (typeof r.field === "string" && Array.isArray(r.one_of)) {
		return {
			groups_op: "or",
			groups: [
				{
					_id: uid(),
					op: "or",
					conditions: [{ _id: uid(), field: r.field, values: r.one_of as string[] }],
				},
			],
		}
	}
	if (typeof r.groups_op === "string" && Array.isArray(r.groups)) {
		const si = raw as SkipIf
		return {
			groups_op: si.groups_op,
			groups: si.groups.map((g) => ({
				_id: uid(),
				op: g.op,
				conditions: g.conditions.map((c) => ({ _id: uid(), field: c.field, values: c.values })),
			})),
		}
	}
	return null
}

// ── Question data model ───────────────────────────────────────────────────────

type QuestionType = "Text" | "RadioGroup" | "CheckboxGroup" | "Select" | "TextField"

interface Question {
	_id: string
	_nameDirty?: boolean
	type: QuestionType
	content?: string
	as?: string
	size?: string
	weight?: string
	align?: string
	color?: string
	label?: string
	name?: string
	isRequired?: boolean
	options?: string[]
	items?: Array<{ value: string; label: string }>
	inputType?: string
	description?: string
	hint?: string
}

let _idCounter = 0
function uid() {
	return `q${++_idCounter}`
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 40)
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateQuestion(q: Question, duplicateNames: Set<string> = new Set()): Record<string, string> {
	const e: Record<string, string> = {}
	if (q.type === "Text") {
		if (!q.content?.trim()) e.content = "Content is required"
	} else if (q.type === "TextField") {
		if (!q.label?.trim()) e.label = "Label is required"
		if (!q.name?.trim()) e.name = "Field name is required"
		else if (duplicateNames.has(q.name)) e.name = "Field name must be unique"
	} else if (q.type === "RadioGroup" || q.type === "CheckboxGroup") {
		if (!q.label?.trim()) e.label = "Label is required"
		if (!q.name?.trim()) e.name = "Field name is required"
		else if (duplicateNames.has(q.name)) e.name = "Field name must be unique"
		if ((q.options ?? []).filter((o) => o.trim()).length < 2) e.options = "At least 2 options required"
	} else if (q.type === "Select") {
		if (!q.label?.trim()) e.label = "Label is required"
		if (!q.name?.trim()) e.name = "Field name is required"
		else if (duplicateNames.has(q.name)) e.name = "Field name must be unique"
		if (!q.items?.length) e.items = "At least 1 item required"
	}
	return e
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
			_nameDirty: true,
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
			_nameDirty: true,
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
			_nameDirty: true,
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
			_nameDirty: true,
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

function extractQuestions(nodes: unknown[]): { questions: Question[]; description: string } {
	const root = nodes[0] as Record<string, unknown> | undefined
	if (root?.type !== "SurveyPage" || !Array.isArray(root.children)) {
		return { questions: [], description: "" }
	}
	const description =
		typeof (root.props as Record<string, unknown>)?.description === "string"
			? ((root.props as Record<string, unknown>).description as string)
			: ""
	const questions: Question[] = []
	for (const c of root.children as unknown[]) {
		const node = c as Record<string, unknown>
		if (node.type === "SurveyQuestion") {
			const sqProps = (node.props ?? {}) as Record<string, unknown>
			const q = nodeToQuestion(node.children)
			if (q) {
				if (typeof sqProps.description === "string") q.description = sqProps.description
				if (typeof sqProps.hint === "string") q.hint = sqProps.hint
				questions.push(q)
			}
		} else {
			const q = nodeToQuestion(c)
			if (q) questions.push(q)
		}
	}
	return { questions, description }
}

function questionToSurveyQuestionNode(q: Question): unknown {
	const inner = questionToNode(q)
	if (!inner) return null
	if (q.type === "Text") return inner
	const sqProps: Record<string, unknown> = {}
	if (q.description) sqProps.description = q.description
	if (q.hint) sqProps.hint = q.hint
	return { type: "SurveyQuestion", props: sqProps, children: inner }
}

function buildNodes(questions: Question[], title: string, description: string): unknown[] {
	return [
		{
			type: "SurveyPage",
			props: { title, ...(description.trim() ? { description: description.trim() } : {}) },
			children: questions.map(questionToSurveyQuestionNode).filter(Boolean),
		},
	]
}

// ── Question form ─────────────────────────────────────────────────────────────

function QuestionForm({
	q,
	onChange,
	errors,
}: {
	q: Question
	onChange: (updated: Question) => void
	errors: Record<string, string>
}) {
	const update = (patch: Partial<Question>) => onChange({ ...q, ...patch })
	const p = q._id

	const inputCls = (field?: string) =>
		`w-full rounded-md border ${field && errors[field] ? "border-(--color-danger)" : "border-(--color-border)"} bg-(--color-background) px-3 py-1.5 text-(--color-text) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)`
	const labelCls = "block text-(--color-text-muted) text-xs font-medium mb-1"
	const errCls = "mt-1 text-(--color-danger) text-xs"

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
						className={inputCls("content")}
					/>
					{errors.content && <p className={errCls}>{errors.content}</p>}
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
							className={inputCls()}
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
							className={inputCls()}
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
							className={inputCls()}
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
							className={inputCls()}
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
							className={inputCls()}
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
						Question
					</label>
					<input
						id={`${p}-label`}
						type="text"
						value={q.label ?? ""}
						onChange={(e) => {
							const newLabel = e.target.value
							update({ label: newLabel, ...(!q._nameDirty ? { name: slugify(newLabel) } : {}) })
						}}
						className={inputCls("label")}
					/>
					{errors.label && <p className={errCls}>{errors.label}</p>}
				</div>
				<div>
					<label htmlFor={`${p}-name`} className={labelCls}>
						Field name
					</label>
					<input
						id={`${p}-name`}
						type="text"
						value={q.name ?? ""}
						onChange={(e) => update({ name: e.target.value, _nameDirty: true })}
						className={inputCls("name")}
					/>
					{errors.name && <p className={errCls}>{errors.name}</p>}
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
						className={inputCls("options")}
						placeholder="Option A&#10;Option B&#10;Option C"
					/>
					{errors.options && <p className={errCls}>{errors.options}</p>}
				</div>
				<div className="space-y-3 border-(--color-border) border-t pt-3">
					<div>
						<label htmlFor={`${p}-description`} className={labelCls}>
							Description (shown below the question label)
						</label>
						<textarea
							id={`${p}-description`}
							value={q.description ?? ""}
							onChange={(e) => update({ description: e.target.value || undefined })}
							rows={2}
							className={inputCls()}
							placeholder="Context or instructions…"
						/>
					</div>
					<div>
						<label htmlFor={`${p}-hint`} className={labelCls}>
							Hint (shown below input)
						</label>
						<input
							id={`${p}-hint`}
							type="text"
							value={q.hint ?? ""}
							onChange={(e) => update({ hint: e.target.value || undefined })}
							className={inputCls()}
							placeholder="Helpful hint…"
						/>
					</div>
				</div>
			</div>
		)
	}

	if (q.type === "Select") {
		return (
			<div className="space-y-3">
				<div>
					<label htmlFor={`${p}-label`} className={labelCls}>
						Question
					</label>
					<input
						id={`${p}-label`}
						type="text"
						value={q.label ?? ""}
						onChange={(e) => {
							const newLabel = e.target.value
							update({ label: newLabel, ...(!q._nameDirty ? { name: slugify(newLabel) } : {}) })
						}}
						className={inputCls("label")}
					/>
					{errors.label && <p className={errCls}>{errors.label}</p>}
				</div>
				<div>
					<label htmlFor={`${p}-name`} className={labelCls}>
						Field name
					</label>
					<input
						id={`${p}-name`}
						type="text"
						value={q.name ?? ""}
						onChange={(e) => update({ name: e.target.value, _nameDirty: true })}
						className={inputCls("name")}
					/>
					{errors.name && <p className={errCls}>{errors.name}</p>}
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
						className={inputCls("items")}
						placeholder="Australia&#10;Canada&#10;US | United States"
					/>
					{errors.items && <p className={errCls}>{errors.items}</p>}
				</div>
				<div className="space-y-3 border-(--color-border) border-t pt-3">
					<div>
						<label htmlFor={`${p}-description`} className={labelCls}>
							Description (shown below the question label)
						</label>
						<textarea
							id={`${p}-description`}
							value={q.description ?? ""}
							onChange={(e) => update({ description: e.target.value || undefined })}
							rows={2}
							className={inputCls()}
							placeholder="Context or instructions…"
						/>
					</div>
					<div>
						<label htmlFor={`${p}-hint`} className={labelCls}>
							Hint (shown below input)
						</label>
						<input
							id={`${p}-hint`}
							type="text"
							value={q.hint ?? ""}
							onChange={(e) => update({ hint: e.target.value || undefined })}
							className={inputCls()}
							placeholder="Helpful hint…"
						/>
					</div>
				</div>
			</div>
		)
	}

	if (q.type === "TextField") {
		return (
			<div className="space-y-3">
				<div>
					<label htmlFor={`${p}-label`} className={labelCls}>
						Question
					</label>
					<input
						id={`${p}-label`}
						type="text"
						value={q.label ?? ""}
						onChange={(e) => {
							const newLabel = e.target.value
							update({ label: newLabel, ...(!q._nameDirty ? { name: slugify(newLabel) } : {}) })
						}}
						className={inputCls("label")}
					/>
					{errors.label && <p className={errCls}>{errors.label}</p>}
				</div>
				<div>
					<label htmlFor={`${p}-name`} className={labelCls}>
						Field name
					</label>
					<input
						id={`${p}-name`}
						type="text"
						value={q.name ?? ""}
						onChange={(e) => update({ name: e.target.value, _nameDirty: true })}
						className={inputCls("name")}
					/>
					{errors.name && <p className={errCls}>{errors.name}</p>}
				</div>
				<div>
					<label htmlFor={`${p}-inputType`} className={labelCls}>
						Input type
					</label>
					<select
						id={`${p}-inputType`}
						value={q.inputType ?? ""}
						onChange={(e) => update({ inputType: e.target.value || undefined })}
						className={inputCls()}
					>
						<option value="">Text</option>
						<option value="email">Email</option>
						<option value="number">Number</option>
						<option value="url">URL</option>
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
				<div className="space-y-3 border-(--color-border) border-t pt-3">
					<div>
						<label htmlFor={`${p}-description`} className={labelCls}>
							Description (shown below the question label)
						</label>
						<textarea
							id={`${p}-description`}
							value={q.description ?? ""}
							onChange={(e) => update({ description: e.target.value || undefined })}
							rows={2}
							className={inputCls()}
							placeholder="Context or instructions…"
						/>
					</div>
					<div>
						<label htmlFor={`${p}-hint`} className={labelCls}>
							Hint (shown below input)
						</label>
						<input
							id={`${p}-hint`}
							type="text"
							value={q.hint ?? ""}
							onChange={(e) => update({ hint: e.target.value || undefined })}
							className={inputCls()}
							placeholder="Helpful hint…"
						/>
					</div>
				</div>
			</div>
		)
	}

	return null
}

// ── ConditionRow ──────────────────────────────────────────────────────────────

function ConditionRow({
	cond,
	prevStepNames,
	inputCls,
	onUpdate,
	onRemove,
	onAddValue,
	onRemoveValue,
	showOpBadge,
	groupOp,
	onToggleGroupOp,
}: {
	cond: EditorCondition
	prevStepNames: Array<{ name: string; options: string[] }>
	inputCls: string
	onUpdate: (patch: Partial<EditorCondition>) => void
	onRemove: () => void
	onAddValue: (v: string) => void
	onRemoveValue: (v: string) => void
	showOpBadge: boolean
	groupOp: "and" | "or"
	onToggleGroupOp: () => void
}) {
	const [newValue, setNewValue] = useState("")
	const selectedField = prevStepNames.find((f) => f.name === cond.field)

	return (
		<div className="space-y-1.5">
			{showOpBadge && (
				<div className="flex items-center">
					<button
						type="button"
						onClick={onToggleGroupOp}
						className="rounded border border-(--color-border) bg-(--color-surface) px-2 py-0.5 font-semibold text-(--color-primary) text-xs uppercase hover:bg-(--color-background-muted)"
					>
						{groupOp}
					</button>
				</div>
			)}
			<div className="flex items-center gap-2">
				<select
					value={cond.field}
					onChange={(e) => onUpdate({ field: e.target.value, values: [] })}
					className={`${inputCls} flex-1`}
				>
					<option value="">Select field…</option>
					{prevStepNames.map((f) => (
						<option key={f.name} value={f.name}>
							{f.name}
						</option>
					))}
				</select>
				<span className="shrink-0 whitespace-nowrap text-(--color-text-muted) text-xs">is one of</span>
				<button
					type="button"
					onClick={onRemove}
					title="Remove condition"
					className="shrink-0 text-(--color-danger) hover:text-(--color-danger-hover)"
				>
					×
				</button>
			</div>
			{cond.values.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{cond.values.map((v) => (
						<span
							key={v}
							className="flex items-center gap-1 rounded-full bg-(--color-background-muted) px-2 py-0.5 text-(--color-text) text-xs"
						>
							{v}
							<button
								type="button"
								onClick={() => onRemoveValue(v)}
								className="text-(--color-text-muted) hover:text-(--color-danger)"
							>
								×
							</button>
						</span>
					))}
				</div>
			)}
			<div className="flex gap-2">
				{selectedField && selectedField.options.length > 0 ? (
					<select
						value=""
						onChange={(e) => e.target.value && onAddValue(e.target.value)}
						className={`${inputCls} flex-1`}
					>
						<option value="">Add a value…</option>
						{selectedField.options
							.filter((o) => !cond.values.includes(o))
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
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									onAddValue(newValue)
									setNewValue("")
								}
							}}
							className={`${inputCls} flex-1`}
						/>
						<button
							type="button"
							onClick={() => {
								onAddValue(newValue)
								setNewValue("")
							}}
							className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-background-muted)"
						>
							Add
						</button>
					</>
				)}
			</div>
		</div>
	)
}

// ── FlowRuleEditor ────────────────────────────────────────────────────────────

function FlowRuleEditor({
	skipIf,
	onChange,
	prevStepNames,
}: {
	skipIf: EditorSkipIf | null
	onChange: (rule: EditorSkipIf | null) => void
	prevStepNames: Array<{ name: string; options: string[] }>
}) {
	const inputCls =
		"rounded-md border border-(--color-border) bg-(--color-background) px-3 py-1.5 text-(--color-text) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"

	function addGroup() {
		const newGroup: EditorGroup = { _id: uid(), op: "and", conditions: [{ _id: uid(), field: "", values: [] }] }
		onChange(skipIf ? { ...skipIf, groups: [...skipIf.groups, newGroup] } : { groups_op: "or", groups: [newGroup] })
	}

	function removeGroup(gIdx: number) {
		if (!skipIf) return
		const groups = skipIf.groups.filter((_, i) => i !== gIdx)
		onChange(groups.length > 0 ? { ...skipIf, groups } : null)
	}

	function updateGroup(gIdx: number, patch: Partial<EditorGroup>) {
		if (!skipIf) return
		onChange({ ...skipIf, groups: skipIf.groups.map((g, i) => (i === gIdx ? { ...g, ...patch } : g)) })
	}

	function addCondition(gIdx: number) {
		if (!skipIf) return
		const group = skipIf.groups[gIdx]
		updateGroup(gIdx, { conditions: [...group.conditions, { _id: uid(), field: "", values: [] }] })
	}

	function removeCondition(gIdx: number, cIdx: number) {
		if (!skipIf) return
		const conditions = skipIf.groups[gIdx].conditions.filter((_, i) => i !== cIdx)
		if (conditions.length === 0) removeGroup(gIdx)
		else updateGroup(gIdx, { conditions })
	}

	function updateCondition(gIdx: number, cIdx: number, patch: Partial<EditorCondition>) {
		if (!skipIf) return
		const conditions = skipIf.groups[gIdx].conditions.map((c, i) => (i === cIdx ? { ...c, ...patch } : c))
		updateGroup(gIdx, { conditions })
	}

	function addValue(gIdx: number, cIdx: number, val: string) {
		if (!skipIf || !val.trim()) return
		const cond = skipIf.groups[gIdx].conditions[cIdx]
		if (!cond.values.includes(val.trim())) {
			updateCondition(gIdx, cIdx, { values: [...cond.values, val.trim()] })
		}
	}

	function removeValue(gIdx: number, cIdx: number, val: string) {
		if (!skipIf) return
		const cond = skipIf.groups[gIdx].conditions[cIdx]
		updateCondition(gIdx, cIdx, { values: cond.values.filter((v) => v !== val) })
	}

	return (
		<div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-semibold text-(--color-text) text-sm">Conditional Skip</h3>
				<div className="flex gap-3">
					{skipIf && (
						<button
							type="button"
							onClick={() => onChange(null)}
							className="text-(--color-danger) text-xs hover:underline"
						>
							Remove all
						</button>
					)}
					<button type="button" onClick={addGroup} className="text-(--color-primary) text-xs hover:underline">
						+ Add {skipIf ? "group" : "rule"}
					</button>
				</div>
			</div>

			{!skipIf ? (
				<p className="text-(--color-text-muted) text-sm">No rule — this step always shows.</p>
			) : (
				<>
					<p className="mb-3 text-(--color-text-muted) text-xs">Skip this step when…</p>
					<div className="space-y-1">
						{skipIf.groups.map((group, gIdx) => (
							<div key={group._id}>
								<div className="space-y-2 rounded-md border border-(--color-border) bg-(--color-background-muted) p-3">
									<div className="flex items-center justify-between">
										{skipIf.groups.length > 1 && (
											<span className="font-medium text-(--color-text-muted) text-xs">Group {gIdx + 1}</span>
										)}
										<button
											type="button"
											onClick={() => removeGroup(gIdx)}
											className="ml-auto text-(--color-danger) text-xs hover:underline"
										>
											Remove
										</button>
									</div>
									{group.conditions.map((cond, cIdx) => (
										<ConditionRow
											key={cond._id}
											cond={cond}
											prevStepNames={prevStepNames}
											inputCls={inputCls}
											onUpdate={(patch) => updateCondition(gIdx, cIdx, patch)}
											onRemove={() => removeCondition(gIdx, cIdx)}
											onAddValue={(v) => addValue(gIdx, cIdx, v)}
											onRemoveValue={(v) => removeValue(gIdx, cIdx, v)}
											showOpBadge={cIdx > 0}
											groupOp={group.op}
											onToggleGroupOp={() => updateGroup(gIdx, { op: group.op === "and" ? "or" : "and" })}
										/>
									))}
									<button
										type="button"
										onClick={() => addCondition(gIdx)}
										className="text-(--color-primary) text-xs hover:underline"
									>
										+ Add condition
									</button>
								</div>
								{gIdx < skipIf.groups.length - 1 && (
									<div className="flex justify-center py-1">
										<button
											type="button"
											onClick={() => onChange({ ...skipIf, groups_op: skipIf.groups_op === "and" ? "or" : "and" })}
											className="rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-0.5 font-semibold text-(--color-primary) text-xs uppercase hover:bg-(--color-background-muted)"
										>
											{skipIf.groups_op}
										</button>
									</div>
								)}
							</div>
						))}
					</div>
					{skipIf.groups.length > 1 && (
						<p className="mt-2 text-(--color-text-muted) text-xs">
							Groups are combined with <strong>{skipIf.groups_op.toUpperCase()}</strong>. Click the badge between groups
							to toggle.
						</p>
					)}
				</>
			)}
		</div>
	)
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<QuestionType, string> = {
	Text: "Content block",
	RadioGroup: "Single choice",
	CheckboxGroup: "Multiple choice",
	Select: "Dropdown",
	TextField: "Short answer",
}

const QUESTION_INTENTS: Array<{ type: QuestionType; label: string; description: string }> = [
	{ type: "TextField", label: "Short answer", description: "A single line — name, email, or a brief response" },
	{ type: "RadioGroup", label: "Single choice", description: "Respondent picks exactly one option from a list" },
	{ type: "CheckboxGroup", label: "Multiple choice", description: "Respondent selects all options that apply" },
	{ type: "Select", label: "Dropdown", description: "Pick from a long list using a dropdown menu" },
	{ type: "Text", label: "Content block", description: "A heading, paragraph, or instruction" },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StepEditorPage() {
	const { id: surveyId, stepId } = useParams<{ id: string; stepId: string }>()
	const router = useRouter()

	const [step, setStep] = useState<Step | null>(null)
	const [allSteps, setAllSteps] = useState<Step[]>([])
	const [questions, setQuestions] = useState<Question[]>([])
	const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
	const [skipIf, setSkipIf] = useState<EditorSkipIf | null>(null)
	const [slug, setSlug] = useState("")
	const [title, setTitle] = useState("")
	const [description, setDescription] = useState("")
	const [surveyTheme, setSurveyTheme] = useState<Record<string, string>>({})
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showJson, setShowJson] = useState(false)
	const [showPicker, setShowPicker] = useState(false)
	const [, setPreviewValues] = useState<Record<string, string | string[]>>({})

	const pickerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		adminApi
			.getSurvey(surveyId)
			.then((survey) => {
				setAllSteps(survey.steps)
				setSurveyTheme(survey.theme ?? {})
				const s = survey.steps.find((st) => st.id === stepId)
				if (!s) return
				setStep(s)
				setSlug(s.slug)
				setTitle(s.title)
				setSkipIf(normalizeSkipIf(s.skip_if))
				const extracted = extractQuestions(s.nodes)
				setQuestions(extracted.questions)
				setDescription(extracted.description)
				if (survey.steps.length > 0) setSelectedIdx(0)
			})
			.catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
			.finally(() => setLoading(false))
	}, [surveyId, stepId])

	// Close picker on outside click or Escape
	useEffect(() => {
		if (!showPicker) return
		function onDown(e: MouseEvent) {
			if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setShowPicker(false)
		}
		document.addEventListener("mousedown", onDown)
		document.addEventListener("keydown", onKey)
		return () => {
			document.removeEventListener("mousedown", onDown)
			document.removeEventListener("keydown", onKey)
		}
	}, [showPicker])

	function addQuestion(type: QuestionType) {
		const q: Question = {
			_id: uid(),
			_nameDirty: false,
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

	const duplicateNames = useMemo(() => {
		const names = questions.map((q) => q.name).filter((n): n is string => !!n?.trim())
		const seen = new Set<string>()
		const dupes = new Set<string>()
		for (const n of names) {
			if (seen.has(n)) dupes.add(n)
			else seen.add(n)
		}
		return dupes
	}, [questions])

	async function handleSave() {
		if (!step) return
		// Block save if any question has errors
		const anyInvalid = questions.some((q) => Object.keys(validateQuestion(q, duplicateNames)).length > 0)
		if (anyInvalid) {
			setError("Fix validation errors before saving.")
			return
		}
		setSaving(true)
		setError(null)
		try {
			const nodes = buildNodes(questions, title, description)
			await adminApi.updateStep(surveyId, stepId, {
				slug,
				title,
				nodes,
				skip_if: toApiSkipIf(skipIf) ?? undefined,
				clear_skip_if: skipIf === null,
			})
			router.push(`/admin/surveys/${surveyId}`)
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to save")
			setSaving(false)
		}
	}

	const currentIdx = allSteps.findIndex((s) => s.id === stepId)
	const prevStepNames = allSteps
		.slice(0, currentIdx)
		.flatMap((s) => extractQuestions(s.nodes).questions)
		.filter((q): q is Question & { name: string } => !!q.name)
		.map((q) => ({ name: q.name, options: q.options ?? q.items?.map((i) => i.value) ?? [] }))

	const builtNodes = step ? buildNodes(questions, title, description) : []

	// Preview interactivity
	const setValue = useCallback((key: string, value: string | string[]) => {
		setPreviewValues((prev) => ({ ...prev, [key]: value }))
	}, [])

	const themeVars = Object.fromEntries(Object.entries(surveyTheme).filter(([k]) => k.startsWith("--"))) as CSSProperties

	if (loading) return <p className="text-(--color-text-muted) text-sm">Loading…</p>
	if (!step) return <p className="text-(--color-danger) text-sm">Step not found.</p>

	return (
		<div>
			{/* Breadcrumb */}
			<div className="mb-4 flex items-center gap-2 text-(--color-text-muted) text-sm">
				<Link href="/admin" className="hover:text-(--color-text)">
					Surveys
				</Link>
				<span>/</span>
				<Link href={`/admin/surveys/${surveyId}`} className="hover:text-(--color-text)">
					Survey
				</Link>
				<span>/</span>
				<span className="text-(--color-text)">{step.title}</span>
			</div>

			{/* Step meta */}
			<div className="mb-4 grid grid-cols-2 gap-4">
				<div>
					<label htmlFor="step-title" className="mb-1 block font-medium text-(--color-text-muted) text-xs">
						Page title
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
					<label htmlFor="step-slug" className="mb-1 block font-medium text-(--color-text-muted) text-xs">
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
			<div className="mb-6">
				<label htmlFor="step-description" className="mb-1 block font-medium text-(--color-text-muted) text-xs">
					Page description (optional)
				</label>
				<textarea
					id="step-description"
					rows={2}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Short intro shown below the title…"
					className="w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-text) text-sm focus:outline-none focus:ring-(--color-primary) focus:ring-2"
				/>
			</div>

			{error && (
				<div className="mb-4 rounded-md border border-(--color-danger) bg-(--color-background-muted) p-3 text-(--color-danger) text-sm">
					{error}
				</div>
			)}

			{/* Main editor + preview */}
			<div className="mb-6 grid grid-cols-[minmax(0,1fr)_320px] gap-6">
				{/* Left: question builder */}
				<div className="space-y-4">
					{/* Question list + form */}
					<div className="grid grid-cols-[200px_1fr] gap-4">
						{/* Question list */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<h2 className="font-semibold text-(--color-text) text-sm">Questions</h2>
								{/* Floating picker anchor */}
								<div className="relative" ref={pickerRef}>
									<button
										type="button"
										onClick={() => setShowPicker((v) => !v)}
										className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
											showPicker
												? "border-(--color-primary) bg-(--color-background-muted) text-(--color-primary)"
												: "border-(--color-border) text-(--color-text-muted) hover:bg-(--color-background-muted) hover:text-(--color-text)"
										}`}
									>
										+ Add
									</button>
									{showPicker && (
										<div className="absolute top-full right-0 z-50 mt-1 w-64 rounded-lg border border-(--color-border) bg-(--color-surface) p-2 shadow-lg">
											<p className="mb-1.5 px-1 font-medium text-(--color-text-muted) text-xs">
												What kind of question?
											</p>
											<div className="flex flex-col gap-1">
												{QUESTION_INTENTS.map((intent) => (
													<button
														key={intent.type}
														type="button"
														onClick={() => {
															addQuestion(intent.type)
															setShowPicker(false)
														}}
														className="flex flex-col items-start rounded-md px-2.5 py-2 text-left transition-colors hover:bg-(--color-background-muted)"
													>
														<span className="font-medium text-(--color-text) text-sm">{intent.label}</span>
														<span className="text-(--color-text-muted) text-xs leading-snug">{intent.description}</span>
													</button>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							{questions.length === 0 ? (
								<p className="rounded-lg border border-(--color-border) border-dashed p-3 text-center text-(--color-text-muted) text-xs">
									No questions yet.
								</p>
							) : (
								questions.map((q, idx) => {
									const qErrors = validateQuestion(q, duplicateNames)
									const hasError = Object.keys(qErrors).length > 0
									return (
										<div
											key={q._id}
											className={`rounded-lg border p-2.5 ${
												selectedIdx === idx
													? "border-(--color-primary) bg-(--color-background-muted)"
													: hasError
														? "border-(--color-danger) bg-(--color-surface)"
														: "border-(--color-border) bg-(--color-surface)"
											}`}
										>
											<div className="flex items-center gap-1.5">
												<button
													type="button"
													onClick={() => setSelectedIdx(idx)}
													className="min-w-0 flex-1 truncate text-left"
												>
													<span
														className={`text-xs ${hasError ? "text-(--color-danger)" : "text-(--color-text-muted)"}`}
													>
														{TYPE_LABELS[q.type]}
													</span>
													{(q.label ?? q.content) && (
														<>
															{" "}
															<span className="font-medium text-(--color-text) text-xs">{q.label ?? q.content}</span>
														</>
													)}
												</button>
												<div className="flex shrink-0 gap-0.5">
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation()
															moveQuestion(idx, -1)
														}}
														disabled={idx === 0}
														className="text-(--color-text-muted) hover:text-(--color-text) disabled:opacity-30"
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
														className="text-(--color-text-muted) hover:text-(--color-text) disabled:opacity-30"
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
														className="text-(--color-danger) hover:text-(--color-danger-hover)"
														title="Remove"
													>
														×
													</button>
												</div>
											</div>
										</div>
									)
								})
							)}
						</div>

						{/* Question form */}
						<div>
							{selectedIdx !== null && questions[selectedIdx] ? (
								<div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
									<h3 className="mb-4 font-semibold text-(--color-text) text-sm">
										{TYPE_LABELS[questions[selectedIdx].type]}
									</h3>
									<QuestionForm
										q={questions[selectedIdx]}
										errors={validateQuestion(questions[selectedIdx], duplicateNames)}
										onChange={(updated) => {
											setQuestions((qs) => qs.map((q, i) => (i === selectedIdx ? updated : q)))
										}}
									/>
								</div>
							) : (
								<div className="flex h-full items-center justify-center rounded-lg border border-(--color-border) border-dashed p-8 text-(--color-text-muted) text-sm">
									Select a question to edit it.
								</div>
							)}
						</div>
					</div>

					{/* Skip rule editor */}
					<FlowRuleEditor skipIf={skipIf} onChange={setSkipIf} prevStepNames={prevStepNames} />

					{/* JSON debug */}
					<div>
						<button
							type="button"
							onClick={() => setShowJson((v) => !v)}
							className="text-(--color-primary) text-sm hover:underline"
						>
							{showJson ? "Hide" : "Show"} A2UI JSON
						</button>
						{showJson && (
							<pre className="mt-2 overflow-auto rounded-lg border border-(--color-border) bg-(--color-background-muted) p-4 text-(--color-text) text-xs">
								{JSON.stringify(builtNodes, null, 2)}
							</pre>
						)}
					</div>
				</div>

				{/* Right: live preview */}
				<div className="sticky top-4 self-start">
					<div className="overflow-hidden rounded-lg border border-(--color-border)">
						<div className="flex items-center justify-between border-(--color-border) border-b px-3 py-2">
							<span className="font-medium text-(--color-text-muted) text-xs">Preview</span>
							<button
								type="button"
								onClick={() => setPreviewValues({})}
								className="text-(--color-text-muted) text-xs hover:text-(--color-text)"
							>
								Reset
							</button>
						</div>
						<div
							style={{ ...themeVars, fontFamily: "var(--font-family, inherit)" } as CSSProperties}
							className="bg-(--color-background) p-3"
						>
							{builtNodes.length > 0 ? (
								<FormStateContext.Provider value={{ setValue }}>
									<A2UIBlock nodes={builtNodes} onAction={() => setPreviewValues({})} />
								</FormStateContext.Provider>
							) : (
								<p className="py-8 text-center text-(--color-text-muted) text-xs">Add questions to see a preview.</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-3">
				<button
					type="button"
					onClick={handleSave}
					disabled={saving}
					className="rounded-md bg-(--color-primary) px-6 py-2 font-medium text-(--color-primary-foreground) text-sm hover:bg-(--color-primary-hover) disabled:opacity-50"
				>
					{saving ? "Saving…" : "Save Step"}
				</button>
				<Link
					href={`/admin/surveys/${surveyId}`}
					className="rounded-md border border-(--color-border) px-6 py-2 text-(--color-text) text-sm hover:bg-(--color-background-muted)"
				>
					Cancel
				</Link>
			</div>
		</div>
	)
}
