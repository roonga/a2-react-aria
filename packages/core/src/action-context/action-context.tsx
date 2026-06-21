import { createContext } from "react"

export interface ActionCtx {
	buildAction: (label: string) => string
	fire: (text: string) => void
}

export const ActionContext = createContext<ActionCtx | null>(null)
