export const getNumberFieldStyles = () => ({
	container: "flex flex-col gap-2",
	label: "text-sm font-medium text-[var(--color-text)]",
	inputGroup:
		"flex items-center border border-[var(--color-border)] rounded bg-[var(--color-background)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent",
	input:
		"self-stretch flex-1 px-3 text-sm bg-transparent text-[var(--color-text)] placeholder-[var(--color-textMuted)] focus:outline-none disabled:cursor-not-allowed",
	stepper:
		"h-11 w-11 shrink-0 flex items-center justify-center text-[var(--color-textMuted)] hover:text-[var(--color-text)] hover:bg-[var(--color-backgroundMuted)] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed select-none",
	divider: "w-px self-stretch bg-[var(--color-border)]",
	description: "text-xs text-[var(--color-textMuted)]",
	errorMessage: "text-xs text-[var(--color-danger)]",
	requiredIndicator: "text-[var(--color-danger)]",
})
