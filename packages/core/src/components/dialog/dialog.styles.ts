export const getDialogStyles = () => ({
	overlay:
		"fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm data-[entering]:animate-in data-[entering]:fade-in data-[exiting]:animate-out data-[exiting]:fade-out duration-200",
	modal: [
		"w-full max-w-md rounded-xl shadow-xl max-h-[90vh] overflow-y-auto",
		"bg-[var(--color-background)] border border-[var(--color-border)]",
		"data-[entering]:animate-in data-[entering]:zoom-in-95",
		"data-[exiting]:animate-out data-[exiting]:zoom-out-95 duration-200",
	].join(" "),
	dialog: "p-6 outline-none",
	header: "flex items-start justify-between gap-4 mb-4",
	title: "text-lg font-semibold text-[var(--color-text)]",
	closeButton: [
		"flex shrink-0 items-center justify-center w-8 h-8 rounded",
		"text-[var(--color-textMuted)] hover:bg-[var(--color-backgroundMuted)]",
		"focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] transition-colors",
	].join(" "),
	description: "text-sm text-[var(--color-textMuted)] mb-4",
	body: "flex flex-col gap-4",
	trigger: [
		"rounded px-4 py-2 text-sm font-medium",
		"bg-[var(--color-primary)] text-white",
		"hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] transition-opacity",
	].join(" "),
})
