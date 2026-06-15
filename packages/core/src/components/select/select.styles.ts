interface TriggerState {
	isDisabled?: boolean
	isInvalid?: boolean
}

const triggerBase =
	"flex w-full min-w-40 cursor-pointer items-center justify-between gap-2 rounded border px-3 py-2 text-sm transition-colors"

export const getSelectStyles = () => ({
	field: "flex flex-col gap-1",
	label: "text-sm font-medium text-[var(--color-text)]",
	trigger({ isDisabled, isInvalid }: TriggerState) {
		if (isDisabled) {
			return `${triggerBase} cursor-not-allowed border-[var(--color-border)] bg-[var(--color-backgroundMuted)] opacity-50 text-[var(--color-textMuted)]`
		}
		if (isInvalid) {
			return `${triggerBase} border-[var(--color-danger)] bg-[var(--color-background)] text-[var(--color-text)]`
		}
		return `${triggerBase} border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] hover:border-[var(--color-primary)]`
	},
	value: "flex-1 truncate text-left",
	placeholder: "text-[var(--color-textMuted)]",
	chevron: "h-4 w-4 shrink-0 text-[var(--color-textMuted)]",
	popover:
		"z-50 min-w-[var(--trigger-width)] rounded border border-[var(--color-border)] bg-[var(--color-background)] p-1 shadow-md",
	listbox: "max-h-64 overflow-auto outline-none",
	item: "flex cursor-pointer items-center rounded px-3 py-1.5 text-sm text-[var(--color-text)] outline-none transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[focused]:bg-[var(--color-backgroundMuted)] data-[selected]:font-medium data-[selected]:text-[var(--color-primary)]",
	description: "text-xs text-[var(--color-textMuted)]",
	errorMessage: "text-xs text-[var(--color-danger)]",
})
