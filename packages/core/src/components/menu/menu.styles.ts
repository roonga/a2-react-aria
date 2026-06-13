export const getMenuStyles = () => ({
	trigger: [
		"rounded px-3 py-1.5 text-sm font-medium",
		"bg-[var(--color-backgroundMuted)] text-[var(--color-text)]",
		"border border-[var(--color-border)]",
		"hover:bg-[var(--color-border)] transition-colors",
		"focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
	].join(" "),
	popover: [
		"min-w-[150px] rounded-lg p-1 outline-none",
		"bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg",
		"data-[entering]:animate-in data-[entering]:fade-in",
		"data-[exiting]:animate-out data-[exiting]:fade-out duration-150",
	].join(" "),
	menu: "outline-none",
	item: [
		"flex cursor-pointer items-center rounded px-3 py-1.5 text-sm text-[var(--color-text)] outline-none transition-colors",
		"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
		"data-[focused]:bg-[var(--color-backgroundMuted)]",
		"data-[selected]:font-medium data-[selected]:text-[var(--color-primary)]",
	].join(" "),
})
