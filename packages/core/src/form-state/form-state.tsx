import { createContext } from "react"

export interface FormStateCtx {
	setValue: (label: string, value: string) => void
}

export const FormStateContext = createContext<FormStateCtx | null>(null)
