export const getPopoverStyles = () => ({
	popover: [
		"rounded-xl p-3 min-w-[200px] outline-none",
		"bg-(--color-background) border border-(--color-border)",
		"shadow-xl",
		"data-[entering]:animate-in data-[entering]:fade-in",
		"data-[exiting]:animate-out data-[exiting]:fade-out duration-150",
	].join(" "),
	trigger: [
		"rounded px-3 py-1.5 text-sm font-medium",
		"bg-(--color-backgroundMuted) text-(--color-text)",
		"border border-(--color-border)",
		"hover:bg-(--color-border) transition-colors",
		"focus-visible:outline-2 focus-visible:outline-(--color-primary)",
	].join(" "),
})
