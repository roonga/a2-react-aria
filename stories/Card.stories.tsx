import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { A2Renderer, Button, Card, createRegistry, Text } from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"] },
	Card: { component: Card as Parameters<typeof createRegistry>[0][string]["component"] },
	Text: { component: Text as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Card",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Card",
			props: { padding: "md", shadow: "sm", radius: "md", border: true },
			children: [
				{ type: "Text", props: { as: "h3", size: "lg", weight: "semibold" }, children: "Card Title" },
				{
					type: "Text",
					props: { as: "p", color: "muted" },
					children: "This is a card with a border, shadow, and rounded corners.",
				},
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Card Title")).toBeDefined()
	},
}

export const WithButton: Story = {
	args: {
		node: {
			type: "Card",
			props: { padding: "lg", shadow: "md", radius: "lg", border: true },
			children: [
				{ type: "Text", props: { as: "h3", size: "lg", weight: "bold" }, children: "Restaurant Name" },
				{ type: "Text", props: { as: "p", size: "sm", color: "muted" }, children: "Italian · City Centre" },
				{ type: "Button", props: { variant: "primary", size: "sm" }, children: "Book Now" },
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("button", { name: /book now/i })).toBeDefined()
	},
}

export const NoShadow: Story = {
	args: {
		node: {
			type: "Card",
			props: { padding: "md", shadow: "none", radius: "md", border: true },
			children: [{ type: "Text", props: { as: "p" }, children: "Flat card with border only, no shadow." }],
		},
	},
}
