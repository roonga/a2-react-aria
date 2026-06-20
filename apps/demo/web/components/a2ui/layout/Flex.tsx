import type { ReactNode } from "react"
import { getFlexStyles } from "./layout.styles"

interface FlexProps {
	direction?: "row" | "column" | "row-reverse" | "column-reverse"
	gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
	align?: "start" | "center" | "end" | "stretch" | "baseline"
	justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
	wrap?: boolean
	children?: ReactNode
}

export function Flex({
	direction = "row",
	gap = "md",
	align = "stretch",
	justify = "start",
	wrap = false,
	children,
}: FlexProps) {
	return <div className={getFlexStyles(direction, gap, align, justify, wrap)}>{children}</div>
}
