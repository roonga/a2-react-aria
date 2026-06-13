import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, Radio, RadioGroup } from "../packages/core/src/index"

const registry = createRegistry({
	Radio: { component: Radio as Parameters<typeof createRegistry>[0][string]["component"] },
	RadioGroup: { component: RadioGroup as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/RadioGroup",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "RadioGroup",
			props: { label: "Favourite pet" },
			children: [
				{ type: "Radio", props: { label: "Dog", value: "dog" } },
				{ type: "Radio", props: { label: "Cat", value: "cat" } },
				{ type: "Radio", props: { label: "Dragon", value: "dragon" } },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByText("Favourite pet")).toBeInTheDocument()
		const dog = canvas.getByRole("radio", { name: /dog/i })
		await expect(dog).not.toBeChecked()
		await userEvent.click(dog)
		await expect(dog).toBeChecked()
	},
}

export const Preselected: Story = {
	args: {
		node: {
			type: "RadioGroup",
			props: { label: "Shipping method", defaultValue: "expedited" },
			children: [
				{ type: "Radio", props: { label: "Standard (Free)", value: "standard" } },
				{ type: "Radio", props: { label: "Expedited ($9.99)", value: "expedited" } },
				{ type: "Radio", props: { label: "Overnight ($19.99)", value: "overnight" } },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByRole("radio", { name: /expedited/i })).toBeChecked()
		await expect(canvas.getByRole("radio", { name: /standard/i })).not.toBeChecked()
	},
}

export const Horizontal: Story = {
	args: {
		node: {
			type: "RadioGroup",
			props: { label: "Size", orientation: "horizontal" },
			children: [
				{ type: "Radio", props: { label: "Small", value: "sm" } },
				{ type: "Radio", props: { label: "Medium", value: "md" } },
				{ type: "Radio", props: { label: "Large", value: "lg" } },
			],
		},
	},
}

export const WithOnChange: Story = {
	args: {
		node: {
			type: "RadioGroup",
			props: { label: "Plan", onChange: fn() },
			children: [
				{ type: "Radio", props: { label: "Free", value: "free" } },
				{ type: "Radio", props: { label: "Pro", value: "pro" } },
			],
		},
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByRole("radio", { name: /pro/i }))
		await expect(args.node.props?.onChange).toHaveBeenCalledWith("pro")
	},
}

export const Required: Story = {
	args: {
		node: {
			type: "RadioGroup",
			props: { label: "Role", isRequired: true },
			children: [
				{ type: "Radio", props: { label: "Admin", value: "admin" } },
				{ type: "Radio", props: { label: "Editor", value: "editor" } },
				{ type: "Radio", props: { label: "Viewer", value: "viewer" } },
			],
		},
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "RadioGroup",
			props: { label: "Locked options", isDisabled: true },
			children: [
				{ type: "Radio", props: { label: "Option A", value: "a" } },
				{ type: "Radio", props: { label: "Option B", value: "b" } },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const radios = canvas.getAllByRole("radio")
		for (const r of radios) {
			await expect(r).toBeDisabled()
		}
	},
}

export const WithDescriptionAndError: Story = {
	args: {
		node: {
			type: "RadioGroup",
			props: {
				label: "Notification frequency",
				isInvalid: true,
				description: "Choose how often you want to receive notifications.",
				errorMessage: "A frequency selection is required.",
			},
			children: [
				{ type: "Radio", props: { label: "Daily", value: "daily" } },
				{ type: "Radio", props: { label: "Weekly", value: "weekly" } },
				{ type: "Radio", props: { label: "Never", value: "never" } },
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByText(/frequency selection is required/i)).toBeInTheDocument()
		await expect(canvas.getByText(/choose how often/i)).toBeInTheDocument()
	},
}
