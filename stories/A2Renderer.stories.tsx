import type { Meta, StoryObj } from "@storybook/react"
import { A2Renderer, Button, createRegistry, TextField } from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"] },
	TextField: { component: TextField as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Core/A2Renderer",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

// Button Stories
export const ButtonPrimary: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "primary", size: "md" },
			children: "Click me",
		},
	},
}

export const ButtonSecondary: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "secondary", size: "lg" },
			children: "Secondary",
		},
	},
}

export const ButtonDanger: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "danger", size: "sm" },
			children: "Delete",
		},
	},
}

export const ButtonDisabled: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "danger", disabled: true },
			children: "Disabled",
		},
	},
}

export const ButtonGhost: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "ghost", size: "lg" },
			children: "Ghost Button",
		},
	},
}

// TextField Stories
export const TextFieldEmail: Story = {
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

export const TextFieldPassword: Story = {
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

export const TextFieldOptional: Story = {
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

export const TextFieldDisabled: Story = {
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

// Error Handling
export const UnknownType: Story = {
	args: {
		node: { type: "Unknown" },
	},
}
