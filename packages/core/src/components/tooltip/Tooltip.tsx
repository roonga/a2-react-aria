import { Button, Tooltip as RACTooltip, TooltipTrigger } from "react-aria-components"
import { getTooltipStyles } from "./tooltip.styles"

interface TooltipProps {
	readonly content?: string
	readonly triggerLabel?: string
	readonly placement?: "top" | "bottom" | "left" | "right"
	readonly isOpen?: boolean
	readonly defaultOpen?: boolean
	readonly offset?: number
	readonly crossOffset?: number
	readonly shouldFlip?: boolean
	readonly onOpenChange?: (isOpen: boolean) => void
}

export function Tooltip({
	content = "",
	triggerLabel = "Info",
	placement = "top",
	isOpen,
	defaultOpen,
	offset = 8,
	crossOffset,
	shouldFlip,
	onOpenChange,
}: TooltipProps) {
	const styles = getTooltipStyles()

	return (
		<TooltipTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			<Button className={styles.trigger}>{triggerLabel}</Button>
			<RACTooltip
				placement={placement}
				offset={offset}
				crossOffset={crossOffset}
				shouldFlip={shouldFlip}
				className={styles.tooltip}
			>
				{content}
			</RACTooltip>
		</TooltipTrigger>
	)
}
