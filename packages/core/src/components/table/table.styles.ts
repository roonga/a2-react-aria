export const getTableStyles = () => ({
	root: "w-full border-collapse text-sm",
	column: [
		"px-3 py-2 text-left font-medium text-[var(--color-textMuted)]",
		"border-b border-[var(--color-border)]",
		"outline-none",
		"focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
	].join(" "),
	row: [
		"border-b border-[var(--color-border)] outline-none cursor-default",
		"data-[hovered]:bg-[var(--color-surface)]",
		"data-[selected]:bg-[var(--color-primary)]/10",
		"data-[focused]:outline-2 data-[focused]:outline-[var(--color-primary)]",
	].join(" "),
	cell: [
		"px-3 py-2 text-[var(--color-text)]",
		"focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
	].join(" "),
})
