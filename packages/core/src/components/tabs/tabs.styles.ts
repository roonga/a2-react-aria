export const getTabsStyles = (orientation: "horizontal" | "vertical" = "horizontal") => ({
	root: `flex ${orientation === "horizontal" ? "flex-col" : "flex-row"} gap-0`,
	tabList: [
		"flex",
		orientation === "horizontal"
			? "flex-row border-b border-(--color-border)"
			: "flex-col border-r border-(--color-border)",
	].join(" "),
	tab: [
		"px-4 py-2 text-sm font-medium text-(--color-text-muted) transition-colors outline-none cursor-pointer",
		orientation === "horizontal" ? "border-b-2 border-transparent -mb-px" : "border-r-2 border-transparent -mr-px",
		"hover:text-(--color-text)",
		"data-[selected]:text-(--color-primary) data-[selected]:border-(--color-primary)",
		"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
		"focus-visible:outline-2 focus-visible:outline-(--color-primary)",
	].join(" "),
	panel: "p-4 outline-none text-(--color-text)",
})
