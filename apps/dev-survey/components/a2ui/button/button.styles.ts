export const getButtonStyles = (variant: "primary" | "secondary" | "danger" | "ghost" = "primary") => {
	const baseStyles =
		"inline-flex items-center justify-center rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

	const variantStyles: Record<string, string> = {
		primary: "bg-(--color-primary) hover:bg-(--color-primaryHover) active:bg-(--color-primaryActive) text-white",
		secondary:
			"bg-(--color-secondary) hover:bg-(--color-secondaryHover) active:bg-(--color-secondaryActive) text-white",
		danger: "bg-(--color-danger) hover:bg-(--color-dangerHover) active:bg-(--color-dangerActive) text-white",
		ghost:
			"bg-(--color-ghost) hover:bg-(--color-ghostHover) active:bg-(--color-ghostActive) text-(--color-text) border border-(--color-border)",
	}

	return `${baseStyles} ${variantStyles[variant] || variantStyles.primary}`
}

export const getSizeStyles = (size: "sm" | "md" | "lg" = "md") => {
	const sizeMap: Record<string, string> = {
		sm: "px-3 py-1 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-lg",
	}
	return sizeMap[size] || sizeMap.md
}
