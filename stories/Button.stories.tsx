import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, Button, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Button",
	component: A2Renderer,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Button component rendered from a2UI JSON. Each story shows the exact JSON structure passed to A2Renderer.",
			},
		},
	},
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "primary", size: "md" },
			children: "Click me",
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const button = canvas.getByRole("button", { name: "Click me" })
		await expect(button).toBeInTheDocument()
		await expect(button).not.toBeDisabled()
		await userEvent.click(button)
	},
}

export const Secondary: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "secondary", size: "lg" },
			children: "Secondary",
		},
	},
}

export const Danger: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "danger", size: "sm" },
			children: "Delete",
		},
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "primary", isDisabled: true },
			children: "Disabled",
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const button = canvas.getByRole("button", { name: "Disabled" })
		await expect(button).toBeDisabled()
	},
}

export const Ghost: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "ghost", size: "lg" },
			children: "Ghost Button",
		},
	},
}
