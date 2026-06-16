export const getTextFieldStyles = () => ({
	container: "flex flex-col gap-2",
	label: "text-sm font-medium text-[var(--color-text)]",
	input:
		"px-3 py-2.5 border border-[var(--color-border)] rounded bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-textMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:bg-[var(--color-backgroundMuted)] disabled:cursor-not-allowed aria-[invalid]:border-[var(--color-danger)] aria-[invalid]:focus:ring-[var(--color-danger)]",
	description: "text-xs text-[var(--color-textMuted)]",
	errorMessage: "text-xs text-[var(--color-danger)]",
	requiredIndicator: "text-[var(--color-danger)]",
})
