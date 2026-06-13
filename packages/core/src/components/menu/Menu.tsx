import { Button, MenuItem, MenuTrigger, Popover, Menu as RACMenu } from "react-aria-components"
import type { MenuItemEntry } from "./menu.schema"
import { getMenuStyles } from "./menu.styles"

interface MenuProps {
	triggerLabel?: string
	items?: MenuItemEntry[]
	placement?: "top" | "bottom" | "left" | "right"
	isOpen?: boolean
	selectionMode?: "none" | "single" | "multiple"
	defaultSelectedKeys?: string[]
	onAction?: (key: string) => void
	onOpenChange?: (isOpen: boolean) => void
}

export function Menu({
	triggerLabel = "Options",
	items = [],
	placement = "bottom",
	isOpen,
	selectionMode,
	defaultSelectedKeys,
	onAction,
	onOpenChange,
}: MenuProps) {
	const styles = getMenuStyles()

	return (
		<MenuTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className={styles.trigger}>{triggerLabel}</Button>
			<Popover placement={placement} className={styles.popover}>
				<RACMenu
					onAction={(key) => onAction?.(key as string)}
					selectionMode={selectionMode}
					defaultSelectedKeys={defaultSelectedKeys}
					className={styles.menu}
				>
					{items.map((item) => (
						<MenuItem key={item.id} id={item.id} isDisabled={item.isDisabled} className={styles.item}>
							{item.label}
						</MenuItem>
					))}
				</RACMenu>
			</Popover>
		</MenuTrigger>
	)
}
