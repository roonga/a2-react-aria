import type { ReactNode } from "react"
import React from "react"
import { Tabs as RACTabs, Tab, TabList, TabPanel } from "react-aria-components"
import type { TabItem } from "./tabs.schema"
import { getTabsStyles } from "./tabs.styles"

interface TabsProps {
	tabs?: TabItem[]
	defaultSelectedKey?: string
	selectedKey?: string
	onSelectionChange?: (key: string) => void
	orientation?: "horizontal" | "vertical"
	keyboardActivation?: "automatic" | "manual"
	ariaLabel?: string
	children?: ReactNode
}

export function Tabs({
	tabs = [],
	defaultSelectedKey,
	selectedKey,
	onSelectionChange,
	orientation = "horizontal",
	keyboardActivation = "automatic",
	ariaLabel = "Navigation",
	children,
}: TabsProps) {
	const styles = getTabsStyles(orientation)
	const panels = React.Children.toArray(children)

	return (
		<RACTabs
			defaultSelectedKey={defaultSelectedKey}
			selectedKey={selectedKey}
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
