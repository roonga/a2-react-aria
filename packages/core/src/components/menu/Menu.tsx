import { Button, MenuItem, MenuTrigger, Popover, Menu as RACMenu } from "react-aria-components"
import type { MenuItemEntry } from "./menu.schema"
import { getMenuStyles } from "./menu.styles"

interface MenuProps {
	triggerLabel?: string
	items?: MenuItemEntry[]
	placement?: "top" | "bottom" | "left" | "right"
	isOpen?: boolean
	selectionMode?: "none" | "single" | "multiple"
	selectedKeys?: string[]
	defaultSelectedKeys?: string[]
	disabledKeys?: string[]
	onAction?: (key: string) => void
	onSelectionChange?: (keys: string[]) => void
	onClose?: () => void
	onOpenChange?: (isOpen: boolean) => void
}

export function Menu({
	triggerLabel = "Options",
	items = [],
	placement = "bottom",
	isOpen,
	selectionMode,
	selectedKeys,
	defaultSelectedKeys,
	disabledKeys,
	onAction,
	onSelectionChange,
	onClose,
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
					selectedKeys={selectedKeys}
					defaultSelectedKeys={defaultSelectedKeys}
					disabledKeys={disabledKeys}
					onSelectionChange={
						onSelectionChange
							? (selection) => {
									if (selection !== "all") onSelectionChange([...selection].map((k) => k as string))
								}
							: undefined
					}
					onClose={onClose}
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
