import type { ReactNode } from "react"
import { getTextStyles } from "./text.styles"

interface TextProps {
	as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "label"
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
	weight?: "normal" | "medium" | "semibold" | "bold"
	color?: "default" | "muted" | "primary" | "danger"
	align?: "left" | "center" | "right" | "justify"
	italic?: boolean
	truncate?: boolean
	children?: ReactNode
}

export function Text({
	as: Tag = "p",
	size = "md",
	weight = "normal",
	color = "default",
	align,
	italic,
	truncate,
	children,
}: TextProps) {
	return <Tag className={getTextStyles(size, weight, color, align, italic, truncate)}>{children}</Tag>
}
