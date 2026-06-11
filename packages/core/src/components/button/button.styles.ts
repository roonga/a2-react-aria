export const getButtonStyles = (variant: "primary" | "secondary" | "danger" | "ghost" = "primary") => {
	const baseStyles = "px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

	const variantStyles: Record<string, string> = {
		primary:
			"bg-[var(--color-primary)] hover:bg-[var(--color-primaryHover)] active:bg-[var(--color-primaryActive)] text-white",
		secondary:
			"bg-[var(--color-secondary)] hover:bg-[var(--color-secondaryHover)] active:bg-[var(--color-secondaryActive)] text-white",
		danger:
			"bg-[var(--color-danger)] hover:bg-[var(--color-dangerHover)] active:bg-[var(--color-dangerActive)] text-white",
		ghost:
			"bg-[var(--color-ghost)] hover:bg-[var(--color-ghostHover)] active:bg-[var(--color-ghostActive)] text-[var(--color-text)] border border-[var(--color-border)]",
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
