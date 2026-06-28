import type { ReactNode } from "react"
import { Button, DialogTrigger, Popover as RACPopover } from "react-aria-components"
import { getPopoverStyles } from "./popover.styles"

interface PopoverProps {
	readonly triggerLabel?: string
	readonly placement?: "top" | "bottom" | "left" | "right"
	readonly isOpen?: boolean
	readonly defaultOpen?: boolean
	readonly offset?: number
	readonly crossOffset?: number
	readonly shouldFlip?: boolean
	readonly isKeyboardDismissDisabled?: boolean
	readonly maxHeight?: number
	readonly onOpenChange?: (isOpen: boolean) => void
	readonly children?: ReactNode
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
