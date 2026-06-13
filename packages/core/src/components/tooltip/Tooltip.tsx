import { Button, Tooltip as RACTooltip, TooltipTrigger } from "react-aria-components"
import { getTooltipStyles } from "./tooltip.styles"

interface TooltipProps {
	content?: string
	triggerLabel?: string
	placement?: "top" | "bottom" | "left" | "right"
	isOpen?: boolean
	onOpenChange?: (isOpen: boolean) => void
}

export function Tooltip({
	content = "",
	triggerLabel = "Info",
	placement = "top",
	isOpen,
	onOpenChange,
}: TooltipProps) {
	const styles = getTooltipStyles()

	return (
		<TooltipTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className={styles.trigger}>{triggerLabel}</Button>
			<RACTooltip placement={placement} offset={8} className={styles.tooltip}>
				{content}
			</RACTooltip>
		</TooltipTrigger>
	)
}
