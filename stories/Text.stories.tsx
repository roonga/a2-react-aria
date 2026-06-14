import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { A2Renderer, createRegistry, Text } from "../packages/core/src/index"

const registry = createRegistry({
	Text: { component: Text as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Text",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Heading1: Story = {
	args: {
		node: { type: "Text", props: { as: "h1", size: "2xl", weight: "bold" }, children: "Heading Level 1" },
	},
	play: async ({ canvas }) => {
		const el = canvas.getByRole("heading", { level: 1 })
		await expect(el).toBeDefined()
	},
}

export const Heading2: Story = {
	args: {
		node: { type: "Text", props: { as: "h2", size: "xl", weight: "semibold" }, children: "Heading Level 2" },
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("heading", { level: 2 })).toBeDefined()
	},
}

export const Body: Story = {
	args: {
		node: {
			type: "Text",
			props: { as: "p", size: "md" },
			children: "Body text renders as a paragraph with default styling.",
		},
	},
}

export const Caption: Story = {
	args: {
		node: { type: "Text", props: { as: "span", size: "xs", color: "muted" }, children: "Caption or helper text" },
	},
}

export const PrimaryColor: Story = {
	args: {
		node: {
			type: "Text",
			props: { as: "p", size: "md", weight: "medium", color: "primary" },
			children: "Primary colored text",
		},
	},
}

export const DangerColor: Story = {
	args: {
		node: { type: "Text", props: { as: "p", size: "sm", color: "danger" }, children: "Error or danger message" },
	},
}

export const Centered: Story = {
	args: {
		node: { type: "Text", props: { as: "p", align: "center" }, children: "This text is centered." },
	},
}

export const Italic: Story = {
	args: {
		node: { type: "Text", props: { as: "p", italic: true }, children: "This text is italic." },
	},
}

export const Truncated: Story = {
	args: {
		node: {
			type: "Text",
			props: { as: "p", truncate: true },
			children:
				"This is a very long line of text that will be truncated with an ellipsis when it overflows its container.",
		},
	},
}
