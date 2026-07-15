import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, Switch, SwitchSchema } from "../packages/core/src/index"

const registry = createRegistry({
	Switch: { component: Switch as Parameters<typeof createRegistry>[0][string]["component"], schema: SwitchSchema },
})

const meta = {
	title: "Components/Switch",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Switch",
			props: { label: "Enable notifications" },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const sw = canvas.getByRole("switch", { name: /enable notifications/i })
		await expect(sw).not.toBeChecked()
	},
}

export const Selected: Story = {
	args: {
		node: {
			type: "Switch",
			props: { label: "Dark mode", defaultSelected: true },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const sw = canvas.getByRole("switch", { name: /dark mode/i })
		await expect(sw).toBeChecked()
	},
}

export const Interactive: Story = {
	args: {
		node: {
			type: "Switch",
			props: { label: "Airplane mode" },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const sw = canvas.getByRole("switch", { name: /airplane mode/i })
		await expect(sw).not.toBeChecked()
		await userEvent.click(sw)
		await expect(sw).toBeChecked()
		await userEvent.click(sw)
		await expect(sw).not.toBeChecked()
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "Switch",
			props: { label: "Unavailable feature", isDisabled: true },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const sw = canvas.getByRole("switch", { name: /unavailable feature/i })
		await expect(sw).toBeDisabled()
	},
}

export const DisabledSelected: Story = {
	args: {
		node: {
			type: "Switch",
			props: { label: "Locked on", defaultSelected: true, isDisabled: true },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const sw = canvas.getByRole("switch", { name: /locked on/i })
		await expect(sw).toBeChecked()
		await expect(sw).toBeDisabled()
	},
}

export const WithDescription: Story = {
	args: {
		node: {
			type: "Switch",
			props: {
				label: "Two-factor authentication",
				description: "Adds an extra layer of security to your account.",
			},
		},
	},
}

export const Invalid: Story = {
	args: {
		node: {
			type: "Switch",
			props: {
				label: "Accept terms",
				isInvalid: true,
				errorMessage: "You must accept the terms to continue.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByText(/you must accept/i)).toBeInTheDocument()
	},
}
