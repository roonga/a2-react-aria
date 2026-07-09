export const getTooltipStyles = () => ({
	tooltip: [
		"rounded-md px-2 py-1 text-xs max-w-[200px]",
		"bg-(--color-text) text-(--color-background)",
		"shadow-md",
		"data-[entering]:animate-in data-[entering]:fade-in",
		"data-[exiting]:animate-out data-[exiting]:fade-out duration-150",
	].join(" "),
	trigger: [
		"rounded px-3 py-1.5 text-sm",
		"bg-(--color-background-muted) text-(--color-text)",
		"border border-(--color-border)",
		"hover:bg-(--color-border) transition-colors",
		"focus-visible:outline-2 focus-visible:outline-(--color-primary)",
	].join(" "),
})
