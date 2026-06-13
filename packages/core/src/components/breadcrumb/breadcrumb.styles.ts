export const getBreadcrumbStyles = () => ({
	breadcrumbs: "flex items-center list-none m-0 p-0",
	item: "flex items-center",
	link: [
		"text-sm text-[var(--color-primary)] no-underline outline-none cursor-pointer",
		"hover:underline",
		"data-[current]:text-[var(--color-text)] data-[current]:font-semibold data-[current]:cursor-default data-[current]:hover:no-underline",
		"data-[disabled]:text-[var(--color-textMuted)] data-[disabled]:cursor-not-allowed data-[disabled]:hover:no-underline",
		"focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:rounded-sm",
	].join(" "),
	separator: "mx-2 text-sm text-[var(--color-textMuted)] select-none",
})
