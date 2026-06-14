const sizeMap = {
	xs: "text-xs",
	sm: "text-sm",
	md: "text-base",
	lg: "text-lg",
	xl: "text-xl",
	"2xl": "text-2xl",
}

const weightMap = {
	normal: "font-normal",
	medium: "font-medium",
	semibold: "font-semibold",
	bold: "font-bold",
}

const colorMap = {
	default: "text-[var(--color-text)]",
	muted: "text-[var(--color-textMuted)]",
	primary: "text-[var(--color-primary)]",
	danger: "text-[var(--color-danger)]",
}

export const getTextStyles = (
	size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" = "md",
	weight: "normal" | "medium" | "semibold" | "bold" = "normal",
	color: "default" | "muted" | "primary" | "danger" = "default",
) => [sizeMap[size], weightMap[weight], colorMap[color]].join(" ")
