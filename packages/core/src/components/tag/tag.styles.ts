export const tagGroupStyles = "flex flex-col gap-2"
export const tagGroupLabelStyles = "text-sm font-medium text-[var(--color-text)]"
export const tagGroupListStyles = "flex flex-wrap gap-1.5"
export const tagGroupDescriptionStyles = "text-sm text-[var(--color-text-muted)] mt-1"

export const getTagStyles = ({
	isSelected = false,
	isDisabled = false,
}: {
	isSelected?: boolean
	isDisabled?: boolean
} = {}) =>
	[
		"inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium transition-colors",
		"cursor-default select-none outline-none",
		"focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-1",
		isSelected
			? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-foreground)]"
			: "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]",
		isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-[var(--color-border-strong)]",
	]
		.filter(Boolean)
		.join(" ")
