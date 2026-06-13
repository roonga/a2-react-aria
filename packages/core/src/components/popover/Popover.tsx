import type { ReactNode } from "react"
import { Button, DialogTrigger, Popover as RACPopover } from "react-aria-components"
import { getPopoverStyles } from "./popover.styles"

interface PopoverProps {
	triggerLabel?: string
	placement?: "top" | "bottom" | "left" | "right"
	isOpen?: boolean
	offset?: number
	onOpenChange?: (isOpen: boolean) => void
	children?: ReactNode
}

export function Popover({
	triggerLabel = "Open",
	placement = "bottom",
	isOpen,
	offset = 8,
	onOpenChange,
	children,
}: PopoverProps) {
	const styles = getPopoverStyles()

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className={styles.trigger}>{triggerLabel}</Button>
			<RACPopover placement={placement} offset={offset} className={styles.popover}>
				{children}
			</RACPopover>
		</DialogTrigger>
	)
}
