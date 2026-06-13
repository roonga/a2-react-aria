export const getPopoverStyles = () => ({
	popover: [
		"rounded-xl p-3 min-w-[200px] outline-none",
		"bg-[var(--color-background)] border border-[var(--color-border)]",
		"shadow-xl",
		"data-[entering]:animate-in data-[entering]:fade-in",
		"data-[exiting]:animate-out data-[exiting]:fade-out duration-150",
	].join(" "),
	trigger: [
		"rounded px-3 py-1.5 text-sm font-medium",
		"bg-[var(--color-backgroundMuted)] text-[var(--color-text)]",
		"border border-[var(--color-border)]",
		"hover:bg-[var(--color-border)] transition-colors",
		"focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
	].join(" "),
})
