import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { A2Renderer, Accordion, AccordionItem, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({
	Accordion: { component: Accordion as Parameters<typeof createRegistry>[0][string]["component"] },
	AccordionItem: { component: AccordionItem as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Accordion",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Accordion",
			children: [
				{
					type: "AccordionItem",
					props: { id: "info", heading: "Personal Information" },
					children: "Enter your name, email, and contact details here.",
				},
				{
					type: "AccordionItem",
					props: { id: "billing", heading: "Billing Address" },
					children: "Enter your billing address for payment processing.",
				},
				{
					type: "AccordionItem",
					props: { id: "shipping", heading: "Shipping Address" },
					children: "Enter your shipping address for delivery.",
				},
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Personal Information")).toBeDefined()
		await expect(canvas.getByText("Billing Address")).toBeDefined()
	},
}

export const DefaultExpanded: Story = {
	args: {
		node: {
			type: "Accordion",
			children: [
				{
					type: "AccordionItem",
					props: { id: "faq1", heading: "What is a2-react-aria?", defaultExpanded: true },
					children: "A React component catalog that renders A2UI JSON using React Aria Components.",
				},
				{
					type: "AccordionItem",
					props: { id: "faq2", heading: "How do I install it?" },
					children: "Run: npx @a2ra/cli init, then npx @a2ra/cli add button",
				},
				{
					type: "AccordionItem",
					props: { id: "faq3", heading: "Is it accessible?" },
					children: "Yes, all components are built on React Aria which provides WCAG 2.1 AA compliance.",
				},
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("What is a2-react-aria?")).toBeDefined()
	},
}

export const MultipleExpanded: Story = {
	args: {
		node: {
			type: "Accordion",
			props: { allowsMultipleExpanded: true },
			children: [
				{
					type: "AccordionItem",
					props: { id: "a", heading: "Section A", defaultExpanded: true },
					children: "Content for section A.",
				},
				{
					type: "AccordionItem",
					props: { id: "b", heading: "Section B", defaultExpanded: true },
					children: "Content for section B.",
				},
				{
					type: "AccordionItem",
					props: { id: "c", heading: "Section C" },
					children: "Content for section C.",
				},
			],
		},
	},
}

export const WithDisabledItem: Story = {
	args: {
		node: {
			type: "Accordion",
			children: [
				{
					type: "AccordionItem",
					props: { id: "active", heading: "Active Section" },
					children: "This section is available.",
				},
				{
					type: "AccordionItem",
					props: { id: "locked", heading: "Locked Section", isDisabled: true },
					children: "This section is disabled.",
				},
			],
		},
	},
}
