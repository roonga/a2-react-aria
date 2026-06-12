import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, TextField } from "../packages/core/src/index"

const registry = createRegistry({
	TextField: { component: TextField as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/TextField",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Email: Story = {
	args: {
		node: {
			type: "TextField",
			props: {
				label: "Email",
				placeholder: "you@example.com",
				type: "email",
				required: true,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole("textbox", { name: /email/i })
		await expect(input).toBeInTheDocument()
		await userEvent.type(input, "test@example.com")
		await expect(input).toHaveValue("test@example.com")
	},
}

export const Password: Story = {
	args: {
		node: {
			type: "TextField",
			props: {
				label: "Password",
				type: "password",
				required: true,
			},
		},
	},
}

export const Optional: Story = {
	args: {
		node: {
			type: "TextField",
			props: {
				label: "Optional Notes",
				placeholder: "Add notes...",
				type: "text",
			},
		},
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "TextField",
			props: {
				label: "Disabled Field",
				value: "Cannot edit",
				disabled: true,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole("textbox", { name: /disabled field/i })
		await expect(input).toBeDisabled()
	},
}
