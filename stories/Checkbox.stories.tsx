import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { A2Renderer, Checkbox, CheckboxGroup, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({
	Checkbox: { component: Checkbox as Parameters<typeof createRegistry>[0][string]["component"] },
	CheckboxGroup: { component: CheckboxGroup as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Checkbox",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Checkbox",
			props: { label: "Accept terms" },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const checkbox = canvas.getByRole("checkbox", { name: /accept terms/i })
		await expect(checkbox).toBeInTheDocument()
		await expect(checkbox).not.toBeChecked()
	},
}

export const Checked: Story = {
	args: {
		node: {
			type: "Checkbox",
			props: { label: "Remember me", defaultSelected: true },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const checkbox = canvas.getByRole("checkbox", { name: /remember me/i })
		await expect(checkbox).toBeChecked()
	},
}

export const Indeterminate: Story = {
	args: {
		node: {
			type: "Checkbox",
			props: { label: "Select all", isIndeterminate: true },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const checkbox = canvas.getByRole("checkbox", { name: /select all/i })
		await expect(checkbox).toHaveAttribute("aria-checked", "mixed")
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "Checkbox",
			props: { label: "Not available", isDisabled: true },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const checkbox = canvas.getByRole("checkbox", { name: /not available/i })
		await expect(checkbox).toBeDisabled()
	},
}

export const Interactive: Story = {
	args: {
		node: {
			type: "Checkbox",
			props: { label: "Subscribe to newsletter" },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const checkbox = canvas.getByRole("checkbox", { name: /subscribe to newsletter/i })
		await expect(checkbox).not.toBeChecked()
		await userEvent.click(checkbox)
		await expect(checkbox).toBeChecked()
		await userEvent.click(checkbox)
		await expect(checkbox).not.toBeChecked()
	},
}

export const WithOnChange: Story = {
	args: {
		node: {
			type: "Checkbox",
			props: { label: "Enable notifications", onChange: fn() },
		},
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		const checkbox = canvas.getByRole("checkbox", { name: /enable notifications/i })
		await userEvent.click(checkbox)
		await expect(args.node.props?.onChange).toHaveBeenCalledWith(true)
	},
}

export const Group: Story = {
	args: {
		node: {
			type: "CheckboxGroup",
			props: { label: "Favourite fruits" },
			children: [
				{ type: "Checkbox", props: { label: "Apple", value: "apple" } },
				{ type: "Checkbox", props: { label: "Banana", value: "banana" } },
				{ type: "Checkbox", props: { label: "Cherry", value: "cherry" } },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByText("Favourite fruits")).toBeInTheDocument()
		const apple = canvas.getByRole("checkbox", { name: /apple/i })
		const banana = canvas.getByRole("checkbox", { name: /banana/i })
		await expect(apple).not.toBeChecked()
		await userEvent.click(apple)
		await expect(apple).toBeChecked()
		await expect(banana).not.toBeChecked()
	},
}

export const GroupHorizontal: Story = {
	args: {
		node: {
			type: "CheckboxGroup",
			props: { label: "Notification channels", orientation: "horizontal" },
			children: [
				{ type: "Checkbox", props: { label: "Email", value: "email" } },
				{ type: "Checkbox", props: { label: "SMS", value: "sms" } },
				{ type: "Checkbox", props: { label: "Push", value: "push" } },
			],
		},
	},
}

export const GroupPreselected: Story = {
	args: {
		node: {
			type: "CheckboxGroup",
			props: {
				label: "Permissions",
				defaultValue: ["read", "write"],
			},
			children: [
				{ type: "Checkbox", props: { label: "Read", value: "read" } },
				{ type: "Checkbox", props: { label: "Write", value: "write" } },
				{ type: "Checkbox", props: { label: "Admin", value: "admin" } },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByRole("checkbox", { name: /read/i })).toBeChecked()
		await expect(canvas.getByRole("checkbox", { name: /write/i })).toBeChecked()
		await expect(canvas.getByRole("checkbox", { name: /admin/i })).not.toBeChecked()
	},
}

export const GroupDisabled: Story = {
	args: {
		node: {
			type: "CheckboxGroup",
			props: { label: "Locked options", isDisabled: true },
			children: [
				{ type: "Checkbox", props: { label: "Option A", value: "a" } },
				{ type: "Checkbox", props: { label: "Option B", value: "b" } },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const checkboxes = canvas.getAllByRole("checkbox")
		for (const cb of checkboxes) {
			await expect(cb).toBeDisabled()
		}
	},
}

export const GroupWithDescriptionAndError: Story = {
	args: {
		node: {
			type: "CheckboxGroup",
			props: {
				label: "Agree to policies",
				isInvalid: true,
				description: "You must agree to all policies before proceeding.",
				errorMessage: "Please select at least one option.",
			},
			children: [
				{ type: "Checkbox", props: { label: "Privacy Policy", value: "privacy" } },
				{ type: "Checkbox", props: { label: "Terms of Service", value: "terms" } },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByText(/privacy policy/i)).toBeInTheDocument()
		await expect(canvas.getByText(/please select at least one option/i)).toBeInTheDocument()
	},
}
