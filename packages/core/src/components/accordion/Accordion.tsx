import type { ReactNode } from "react"
import { Button, Disclosure, DisclosureGroup, DisclosurePanel, Heading } from "react-aria-components"
import {
	accordionChevronStyles,
	accordionGroupStyles,
	accordionItemStyles,
	accordionPanelStyles,
	accordionTriggerStyles,
} from "./accordion.styles"

interface AccordionItemProps {
	readonly id?: string
	readonly heading: string
	readonly defaultExpanded?: boolean
	readonly isDisabled?: boolean
	readonly children?: ReactNode
}

export function AccordionItem({ id, heading, defaultExpanded, isDisabled, children }: AccordionItemProps) {
	return (
		<Disclosure id={id} defaultExpanded={defaultExpanded} isDisabled={isDisabled} className={accordionItemStyles}>
			<Heading>
				<Button slot="trigger" className={accordionTriggerStyles}>
					<span>{heading}</span>
					<svg
						aria-hidden
						role="presentation"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className={accordionChevronStyles}
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</Button>
			</Heading>
			<DisclosurePanel className={accordionPanelStyles}>{children}</DisclosurePanel>
		</Disclosure>
	)
}

interface AccordionProps {
	readonly allowsMultipleExpanded?: boolean
	readonly isDisabled?: boolean
	readonly children?: ReactNode
}

export function Accordion({ allowsMultipleExpanded = false, isDisabled, children }: AccordionProps) {
	return (
		<DisclosureGroup
			allowsMultipleExpanded={allowsMultipleExpanded}
			isDisabled={isDisabled}
			className={accordionGroupStyles}
		>
			{children}
		</DisclosureGroup>
	)
}
