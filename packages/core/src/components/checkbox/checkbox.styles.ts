interface IndicatorState {
	isSelected: boolean
	isIndeterminate: boolean
	isDisabled?: boolean
	isInvalid?: boolean
}

const indicatorBase = "w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors"

export const getCheckboxStyles = () => ({
	field: "flex flex-col gap-1",
	button: "flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer select-none",
	description: "text-xs text-[var(--color-textMuted)]",
	errorMessage: "text-xs text-[var(--color-danger)]",
	indicator({ isSelected, isIndeterminate, isDisabled, isInvalid }: IndicatorState) {
		if (isDisabled) {
			return `${indicatorBase} bg-[var(--color-backgroundMuted)] border-[var(--color-border)] opacity-50`
		}
		if (isInvalid) {
			return `${indicatorBase} bg-[var(--color-background)] border-[var(--color-danger)]`
		}
		if (isSelected || isIndeterminate) {
			return `${indicatorBase} bg-[var(--color-primary)] border-[var(--color-primary)] text-white`
		}
		return `${indicatorBase} bg-[var(--color-background)] border-[var(--color-border)]`
	},
})

export const getCheckboxGroupStyles = () => ({
	group: "flex flex-col gap-2",
	label: "text-sm font-medium text-[var(--color-text)]",
	items: (orientation: "horizontal" | "vertical" = "vertical") =>
		orientation === "horizontal" ? "flex flex-row flex-wrap gap-4" : "flex flex-col gap-2",
	description: "text-xs text-[var(--color-textMuted)]",
	errorMessage: "text-xs text-[var(--color-danger)]",
})
