import type { Meta, StoryObj } from "@storybook/react"
import { A2Renderer, Button, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Core/A2Renderer",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const PrimaryButton: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "primary", size: "md" },
			children: "Click me",
		},
	},
}

export const SecondaryButton: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "secondary", size: "lg" },
			children: "Secondary",
		},
	},
}

export const DangerButton: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "danger", size: "sm", disabled: true },
			children: "Disabled",
		},
	},
}

export const UnknownType: Story = {
	args: {
		node: { type: "Unknown" },
	},
}
