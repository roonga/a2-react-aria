import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import {
	A2Renderer,
	Button,
	ButtonSchema,
	createRegistry,
	Dialog,
	DialogSchema,
	TextField,
	TextFieldSchema,
} from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"], schema: ButtonSchema },
	Dialog: { component: Dialog as Parameters<typeof createRegistry>[0][string]["component"], schema: DialogSchema },
	TextField: {
		component: TextField as Parameters<typeof createRegistry>[0][string]["component"],
		schema: TextFieldSchema,
	},
})

const meta = {
	title: "Components/Dialog",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const WithTrigger: Story = {
	args: {
		node: {
			type: "Dialog",
			props: {
				title: "Subscribe to newsletter",
				description: "Enter your email to receive updates about new features.",
				triggerLabel: "Open dialog",
				isDismissable: true,
			},
			children: [
				{ type: "TextField", props: { label: "Email", type: "email" } },
				{ type: "Button", props: { variant: "primary" }, children: "Subscribe" },
			],
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /open dialog/i }))
		const body = within(document.body)
		await expect(body.getByRole("dialog")).toBeInTheDocument()
		await expect(body.getByText(/subscribe to newsletter/i)).toBeInTheDocument()
		await expect(body.getByLabelText(/email/i)).toBeInTheDocument()
	},
}

export const AlertDialog: Story = {
	args: {
		node: {
			type: "Dialog",
			props: {
				title: "Confirm delete",
				description: "This action cannot be undone. Are you sure you want to delete this item?",
				triggerLabel: "Delete item",
				role: "alertdialog",
				isDismissable: false,
				isKeyboardDismissDisabled: true,
			},
			children: [
				{ type: "Button", props: { variant: "danger" }, children: "Confirm delete" },
				{ type: "Button", props: { variant: "secondary" }, children: "Cancel" },
			],
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /delete item/i }))
		const body = within(document.body)
		await expect(body.getByRole("alertdialog")).toBeInTheDocument()
		await expect(body.getByRole("heading", { name: /confirm delete/i })).toBeInTheDocument()
	},
}

export const Controlled: Story = {
	args: {
		node: {
			type: "Dialog",
			props: {
				title: "Account settings",
				description: "Update your account preferences below.",
				isOpen: true,
			},
			children: [
				{ type: "TextField", props: { label: "Display name" } },
				{ type: "Button", props: { variant: "primary" }, children: "Save changes" },
			],
		},
	},
	play: async () => {
		const body = within(document.body)
		await expect(body.getByRole("dialog")).toBeInTheDocument()
		await expect(body.getByText(/account settings/i)).toBeInTheDocument()
		await expect(body.getByLabelText(/display name/i)).toBeInTheDocument()
	},
}
