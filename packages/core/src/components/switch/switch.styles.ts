interface TrackState {
	isSelected: boolean
	isDisabled?: boolean
	isInvalid?: boolean
}

const trackBase = "relative flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200"
const handleBase = "h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"

export const getSwitchStyles = () => ({
	field: "flex flex-col gap-1",
	button: "flex cursor-pointer select-none items-center gap-2 text-sm text-[var(--color-text)]",
	track({ isSelected, isDisabled, isInvalid }: TrackState) {
		if (isDisabled) return `${trackBase} bg-[var(--color-border)] opacity-50`
		if (isSelected && isInvalid) return `${trackBase} bg-[var(--color-danger)]`
		if (isSelected) return `${trackBase} bg-[var(--color-primary)]`
		if (isInvalid) return `${trackBase} bg-[var(--color-danger)] opacity-40`
		return `${trackBase} bg-[var(--color-border)]`
	},
	handle: (isSelected: boolean) => `${handleBase} ${isSelected ? "translate-x-4" : "translate-x-0"}`,
	description: "text-xs text-[var(--color-textMuted)]",
	errorMessage: "text-xs text-[var(--color-danger)]",
})
