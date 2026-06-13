interface IndicatorState {
	isSelected: boolean
	isDisabled?: boolean
	isInvalid?: boolean
}

const indicatorBase = "w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"

export const getRadioStyles = () => ({
	field: "flex flex-col gap-1",
	button: "flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer select-none",
	indicator({ isSelected, isDisabled, isInvalid }: IndicatorState) {
		if (isDisabled) {
			return `${indicatorBase} bg-[var(--color-backgroundMuted)] border-[var(--color-border)] opacity-50`
		}
		if (isSelected) {
			return `${indicatorBase} bg-[var(--color-background)] border-[var(--color-primary)]`
		}
		if (isInvalid) {
			return `${indicatorBase} bg-[var(--color-background)] border-[var(--color-danger)]`
		}
		return `${indicatorBase} bg-[var(--color-background)] border-[var(--color-border)]`
	},
	dot: "w-2 h-2 rounded-full bg-[var(--color-primary)]",
})

export const getRadioGroupStyles = () => ({
	group: "flex flex-col gap-2",
	label: "text-sm font-medium text-[var(--color-text)]",
	items: (orientation: "horizontal" | "vertical" = "vertical") =>
		orientation === "horizontal" ? "flex flex-row flex-wrap gap-4" : "flex flex-col gap-2",
	description: "text-xs text-[var(--color-textMuted)]",
	errorMessage: "text-xs text-[var(--color-danger)]",
})
