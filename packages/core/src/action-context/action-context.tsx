import type React from "react"
import type { ReactNode } from "react"
import { createContext, useContext } from "react"

export interface ActionCtx {
	buildAction: (label: string) => string
	fire: (text: string) => void
}

export const ActionContext = createContext<ActionCtx | null>(null)

/**
 * Wraps a pressable component so it fires actions via ActionContext.
 * If the node has a `value` prop, that value is fired directly.
 * Otherwise the button label is passed through `buildAction` (which can
 * collect co-located form field values) and the result is fired.
 * `value` is stripped before forwarding props to the wrapped component.
 */
export function withAction<T extends { onPress?: () => void; children?: ReactNode }>(
	Component: React.ComponentType<T>,
) {
	return function ActionField({ value, ...props }: T & { value?: string }) {
		const ctx = useContext(ActionContext)
		return (
			<Component
				{...(props as T)}
				onPress={() => {
					if (value) {
						ctx?.fire(value)
					} else if (typeof props.children === "string") {
						const text = ctx?.buildAction(props.children) ?? props.children
						ctx?.fire(text)
					}
				}}
			/>
		)
	}
}
