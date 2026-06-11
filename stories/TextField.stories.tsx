import type { Meta, StoryObj } from "@storybook/react"
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
}
