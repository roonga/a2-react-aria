export const accordionGroupStyles =
	"w-full divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]"

export const accordionItemStyles = "w-full"

export const accordionTriggerStyles = [
	"flex w-full items-center justify-between gap-2 px-4 py-3",
	"text-sm font-medium text-[var(--color-text)] bg-[var(--color-surface)]",
	"cursor-default outline-none transition-colors",
	"hover:bg-[var(--color-surface-hover)]",
	"focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-inset",
	"disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ")

export const accordionChevronStyles =
	"h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 [[data-expanded]_&]:rotate-180"

export const accordionPanelStyles = "px-4 py-3 text-sm text-[var(--color-text-muted)] bg-[var(--color-surface)]"
