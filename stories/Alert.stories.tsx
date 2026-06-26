import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { A2Renderer, Alert, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({
	Alert: { component: Alert as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Alert",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
	args: {
		node: {
			type: "Alert",
			props: { variant: "info", title: "Did you know?" },
			children: "This action will be applied to all selected items.",
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("alert")).toBeDefined()
		await expect(canvas.getByText("Did you know?")).toBeDefined()
	},
}

export const Success: Story = {
	args: {
		node: {
			type: "Alert",
			props: { variant: "success", title: "Saved" },
			children: "Your changes have been saved successfully.",
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("alert")).toBeDefined()
	},
}

export const Warning: Story = {
	args: {
		node: {
			type: "Alert",
			props: { variant: "warning", title: "Heads up" },
			children: "This will overwrite existing data. Make sure you have a backup.",
		},
	},
}

export const ErrorAlert: Story = {
	args: {
		node: {
			type: "Alert",
			props: { variant: "error", title: "Something went wrong" },
			children: "We could not process your request. Please try again.",
		},
	},
}

export const NoTitle: Story = {
	args: {
		node: {
			type: "Alert",
			props: { variant: "info" },
			children: "Your session will expire in 5 minutes.",
		},
	},
}
