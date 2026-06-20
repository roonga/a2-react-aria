import type { ReactNode } from "react"
import { getCardStyles } from "./card.styles"

interface CardProps {
	padding?: "none" | "sm" | "md" | "lg"
	shadow?: "none" | "sm" | "md" | "lg"
	radius?: "none" | "sm" | "md" | "lg"
	border?: boolean
	children?: ReactNode
}

export function Card({ padding = "md", shadow = "none", radius = "md", border = false, children }: CardProps) {
	return <div className={getCardStyles(padding, shadow, radius, border)}>{children}</div>
}
