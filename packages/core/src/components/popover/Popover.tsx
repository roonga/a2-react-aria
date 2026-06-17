import type { ReactNode } from "react"
import { Button, DialogTrigger, Popover as RACPopover } from "react-aria-components"
import { getPopoverStyles } from "./popover.styles"

interface PopoverProps {
	triggerLabel?: string
	placement?: "top" | "bottom" | "left" | "right"
	isOpen?: boolean
	defaultOpen?: boolean
	offset?: number
	crossOffset?: number
	shouldFlip?: boolean
	isKeyboardDismissDisabled?: boolean
	maxHeight?: number
	onOpenChange?: (isOpen: boolean) => void
	children?: ReactNode
}

export function Popover({
	triggerLabel = "Open",
	placement = "bottom",
	isOpen,
	defaultOpen,
	offset = 8,
	crossOffset,
	shouldFlip,
	isKeyboardDismissDisabled,
	maxHeight,
	onOpenChange,
	children,
}: PopoverProps) {
	const styles = getPopoverStyles()

	return (
		<DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			<Button className={styles.trigger}>{triggerLabel}</Button>
			<RACPopover
				placement={placement}
				offset={offset}
				crossOffset={crossOffset}
				shouldFlip={shouldFlip}
				isKeyboardDismissDisabled={isKeyboardDismissDisabled}
				maxHeight={maxHeight}
				className={styles.popover}
			>
				{children}
			</RACPopover>
		</DialogTrigger>
	)
}
