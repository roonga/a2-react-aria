export const getTooltipStyles = () => ({
	tooltip: [
		"rounded-md px-2 py-1 text-xs max-w-[200px]",
		"bg-[var(--color-text)] text-[var(--color-background)]",
		"shadow-md",
		"data-[entering]:animate-in data-[entering]:fade-in",
		"data-[exiting]:animate-out data-[exiting]:fade-out duration-150",
	].join(" "),
	trigger: [
		"rounded px-3 py-1.5 text-sm",
		"bg-[var(--color-backgroundMuted)] text-[var(--color-text)]",
		"border border-[var(--color-border)]",
		"hover:bg-[var(--color-border)] transition-colors",
		"focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
	].join(" "),
})
