import type { ReactNode } from "react"
import { getGridStyles } from "./layout.styles"

interface GridProps {
	columns?: number
	gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
	align?: "start" | "center" | "end" | "stretch"
	children?: ReactNode
}

export function Grid({ columns = 1, gap = "md", align = "start", children }: GridProps) {
	return <div className={getGridStyles(columns, gap, align)}>{children}</div>
}
