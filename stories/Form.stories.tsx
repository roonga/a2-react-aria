import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, Button, createRegistry, Form, Switch, TextField } from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"] },
	Form: { component: Form as Parameters<typeof createRegistry>[0][string]["component"] },
	Switch: { component: Switch as Parameters<typeof createRegistry>[0][string]["component"] },
	TextField: { component: TextField as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Form",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const LoginForm: Story = {
	args: {
		node: {
			type: "Form",
			props: { gap: "md" },
			children: [
				{ type: "TextField", props: { label: "Email", type: "email", required: true } },
				{ type: "TextField", props: { label: "Password", type: "password", required: true } },
				{ type: "Button", props: { variant: "primary", size: "md" }, children: "Sign in" },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByLabelText(/email/i)).toBeInTheDocument()
		await expect(canvas.getByLabelText(/password/i)).toBeInTheDocument()
		await expect(canvas.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
	},
}

export const SettingsForm: Story = {
	args: {
		node: {
			type: "Form",
			props: { gap: "lg" },
			children: [
				{ type: "TextField", props: { label: "Display name", type: "text" } },
				{ type: "Switch", props: { label: "Enable notifications" } },
				{ type: "Switch", props: { label: "Dark mode" } },
				{ type: "Button", props: { variant: "primary" }, children: "Save settings" },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const nameInput = canvas.getByLabelText(/display name/i)
		await userEvent.type(nameInput, "Alice")
		await expect(nameInput).toHaveValue("Alice")
	},
}

export const CompactForm: Story = {
	args: {
		node: {
			type: "Form",
			props: { gap: "sm" },
			children: [
				{ type: "TextField", props: { label: "Search", type: "text", placeholder: "Enter keywords…" } },
				{ type: "Button", props: { variant: "secondary", size: "sm" }, children: "Search" },
			],
		},
	},
}
