import { Children, type ReactNode } from "react"
import { Tabs as RACTabs, Tab, TabList, TabPanel } from "react-aria-components"
import type { TabItem } from "./tabs.schema"
import { getTabsStyles } from "./tabs.styles"

interface TabsProps {
	readonly tabs?: TabItem[]
	readonly defaultSelectedKey?: string
	readonly selectedKey?: string
	readonly disabledKeys?: string[]
	readonly onSelectionChange?: (key: string) => void
	readonly orientation?: "horizontal" | "vertical"
	readonly keyboardActivation?: "automatic" | "manual"
	readonly ariaLabel?: string
	readonly children?: ReactNode
}

export function Tabs({
	tabs = [],
	defaultSelectedKey,
	selectedKey,
	disabledKeys,
	onSelectionChange,
	orientation = "horizontal",
	keyboardActivation = "automatic",
	ariaLabel = "Navigation",
	children,
}: TabsProps) {
	const styles = getTabsStyles(orientation)
	const panels = Children.toArray(children)

	return (
		<RACTabs
			defaultSelectedKey={defaultSelectedKey}
			selectedKey={selectedKey}
			disabledKeys={disabledKeys}
			onSelectionChange={(key) => onSelectionChange?.(key as string)}
			orientation={orientation}
			keyboardActivation={keyboardActivation}
			className={styles.root}
		>
			<TabList aria-label={ariaLabel} className={styles.tabList}>
				{tabs.map((tab) => (
					<Tab key={tab.id} id={tab.id} isDisabled={tab.isDisabled} className={styles.tab}>
						{tab.label}
					</Tab>
				))}
			</TabList>
			{tabs.map((tab, i) => (
				<TabPanel key={tab.id} id={tab.id} className={styles.panel}>
					{panels[i] ?? null}
				</TabPanel>
			))}
		</RACTabs>
	)
}
