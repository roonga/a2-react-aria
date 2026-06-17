"use client"

import type { A2Node } from "@a2ui/core"
import { A2Renderer, createRegistry, DatePicker, NumberField, Radio, RadioGroup, Select, TextField } from "@a2ui/core"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { Button } from "./ui/Button"
import { Card } from "./ui/Card"
import { Flex } from "./ui/Flex"
import { Grid } from "./ui/Grid"
import { Text } from "./ui/Text"

// ── Shared contexts ────────────────────────────────────────────────────────────

interface FormStateCtx {
	setValue: (label: string, value: string) => void
}

interface ActionCtx {
	buildAction: (buttonLabel: string) => string
	fire: (text: string) => void
}

const FormStateContext = createContext<FormStateCtx | null>(null)
const ActionContext = createContext<ActionCtx | null>(null)

// ── Registry components (module-level so hooks are at top level) ───────────────

type RegComp = Parameters<typeof createRegistry>[0][string]["component"]

function FormTextField({
	label,
	placeholder,
	type,
	defaultValue,
	isRequired,
	isDisabled,
	isInvalid,
	errorMessage,
}: {
	label?: string
	placeholder?: string
	type?: "text" | "email" | "password" | "number" | "tel" | "url"
	defaultValue?: string
	isRequired?: boolean
	isDisabled?: boolean
	isInvalid?: boolean
	errorMessage?: string
}) {
	const ctx = useContext(FormStateContext)
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed — defaultValue is uncontrolled
	useEffect(() => {
		if (defaultValue && label) ctx?.setValue(label, defaultValue)
	}, [])
	return (
		<TextField
			label={label}
			placeholder={placeholder}
			type={type}
			defaultValue={defaultValue}
			isRequired={isRequired}
			isDisabled={isDisabled}
			isInvalid={isInvalid}
			errorMessage={errorMessage}
			onChange={(v) => label && ctx?.setValue(label, v)}
		/>
	)
}

function FormSelect({
	label,
	placeholder,
	items,
	defaultValue,
	isRequired,
	isDisabled,
}: {
	label?: string
	placeholder?: string
	items?: Array<{ label: string; value: string }>
	defaultValue?: string
	isRequired?: boolean
	isDisabled?: boolean
}) {
	const ctx = useContext(FormStateContext)
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed — defaultValue is uncontrolled
	useEffect(() => {
		if (defaultValue && label) ctx?.setValue(label, defaultValue)
	}, [])
	return (
		<Select
			label={label}
			placeholder={placeholder}
			items={items}
			defaultValue={defaultValue}
			isRequired={isRequired}
			isDisabled={isDisabled}
			onChange={(v) => label && ctx?.setValue(label, v)}
		/>
	)
}

function FormNumberField({
	label,
	placeholder,
	minValue,
	maxValue,
	step,
	defaultValue,
	isRequired,
	isDisabled,
}: {
	label?: string
	placeholder?: string
	minValue?: number
	maxValue?: number
	step?: number
	defaultValue?: number
	isRequired?: boolean
	isDisabled?: boolean
}) {
	const ctx = useContext(FormStateContext)
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed — defaultValue is uncontrolled
	useEffect(() => {
		if (defaultValue !== undefined && label) ctx?.setValue(label, String(defaultValue))
	}, [])
	return (
		<NumberField
			label={label}
			placeholder={placeholder}
			minValue={minValue}
			maxValue={maxValue}
			step={step}
			defaultValue={defaultValue}
			isRequired={isRequired}
			isDisabled={isDisabled}
			onChange={(v) => label && ctx?.setValue(label, String(v))}
		/>
	)
}

function FormRadioGroup({
	label,
	orientation,
	isRequired,
	isDisabled,
	isInvalid,
	errorMessage,
	children,
}: {
	label?: string
	orientation?: "horizontal" | "vertical"
	isRequired?: boolean
	isDisabled?: boolean
	isInvalid?: boolean
	errorMessage?: string
	children?: ReactNode
}) {
	const ctx = useContext(FormStateContext)
	return (
		<RadioGroup
			label={label}
			orientation={orientation}
			isRequired={isRequired}
			isDisabled={isDisabled}
			isInvalid={isInvalid}
			errorMessage={errorMessage}
			onChange={(v) => label && ctx?.setValue(label, v)}
		>
			{children}
		</RadioGroup>
	)
}

function FormDatePicker({
	label,
	isRequired,
	isDisabled,
	isInvalid,
	errorMessage,
	minValue,
	maxValue,
	defaultValue,
}: {
	label?: string
	isRequired?: boolean
	isDisabled?: boolean
	isInvalid?: boolean
	errorMessage?: string
	minValue?: string
	maxValue?: string
	defaultValue?: string
}) {
	const ctx = useContext(FormStateContext)
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed — defaultValue is uncontrolled
	useEffect(() => {
		if (defaultValue && label) ctx?.setValue(label, defaultValue)
	}, [])
	return (
		<DatePicker
			label={label}
			isRequired={isRequired}
			isDisabled={isDisabled}
			isInvalid={isInvalid}
			errorMessage={errorMessage}
			minValue={minValue}
			maxValue={maxValue}
			defaultValue={defaultValue}
			onChange={(v) => label && ctx?.setValue(label, v)}
		/>
	)
}

function ActionButton({
	children,
	variant,
	size,
	disabled,
}: {
	children?: ReactNode
	variant?: "primary" | "secondary" | "danger" | "ghost"
	size?: "sm" | "md" | "lg"
	disabled?: boolean
}) {
	const ctx = useContext(ActionContext)
	return (
		<Button
			variant={variant}
			size={size}
			disabled={disabled}
			onPress={() => {
				if (typeof children === "string") ctx?.fire(ctx.buildAction(children))
			}}
		>
			{children}
		</Button>
	)
}

// ── Static registry (components are module-level, no closure deps) ─────────────

const REGISTRY = createRegistry({
	Button: { component: ActionButton as RegComp },
	Card: { component: Card as RegComp },
	DatePicker: { component: FormDatePicker as RegComp },
	Flex: { component: Flex as RegComp },
	Grid: { component: Grid as RegComp },
	NumberField: { component: FormNumberField as RegComp },
	Radio: { component: Radio as unknown as RegComp },
	RadioGroup: { component: FormRadioGroup as RegComp },
	Select: { component: FormSelect as RegComp },
	Text: { component: Text as RegComp },
	TextField: { component: FormTextField as RegComp },
})

// ── Block component ────────────────────────────────────────────────────────────

interface Props {
	nodes: unknown[]
	onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	const fieldsRef = useRef<Record<string, string>>({})

	const formState = useMemo<FormStateCtx>(
		() => ({
			setValue: (label, value) => {
				fieldsRef.current[label] = value
			},
		}),
		[],
	)

	const buildAction = useCallback((buttonLabel: string): string => {
		const entries = Object.entries(fieldsRef.current).filter(([, v]) => v !== "")
		if (entries.length === 0) return buttonLabel
		const parts = entries.map(([k, v]) => `${k}: ${v}`)
		return `${buttonLabel} | ${parts.join(" | ")}`
	}, [])

	const actionCtx = useMemo<ActionCtx>(
		() => ({ buildAction, fire: (text) => onAction?.(text) }),
		[buildAction, onAction],
	)

	if (!nodes?.length) return null
	return (
		<FormStateContext.Provider value={formState}>
			<ActionContext.Provider value={actionCtx}>
				<div className="mt-3 space-y-3">
					{nodes.map((node, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: a2UI nodes have no stable IDs
						<A2Renderer key={i} node={node as A2Node} registry={REGISTRY} />
					))}
				</div>
			</ActionContext.Provider>
		</FormStateContext.Provider>
	)
}
