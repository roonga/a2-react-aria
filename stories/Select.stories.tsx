import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, Select } from "../packages/core/src/index"

const registry = createRegistry({
	Select: { component: Select as Parameters<typeof createRegistry>[0][string]["component"] },
})

const FRUITS = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Cherry", value: "cherry" },
	{ label: "Durian", value: "durian", isDisabled: true },
]

const meta = {
	title: "Components/Select",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Select",
			props: { label: "Favourite fruit", items: FRUITS },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByRole("button", { name: /select an option/i })).toBeInTheDocument()
	},
}

export const Preselected: Story = {
	args: {
		node: {
			type: "Select",
			props: { label: "Fruit", items: FRUITS, defaultValue: "banana" },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByRole("button")).toHaveTextContent(/banana/i)
	},
}

export const WithPlaceholder: Story = {
	args: {
		node: {
			type: "Select",
			props: {
				label: "Country",
				placeholder: "Choose your country…",
				items: [
					{ label: "Australia", value: "au" },
					{ label: "New Zealand", value: "nz" },
					{ label: "United States", value: "us" },
				],
			},
		},
	},
}

export const Required: Story = {
	args: {
		node: {
			type: "Select",
			props: { label: "Role (required)", items: FRUITS, isRequired: true },
		},
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "Select",
			props: { label: "Locked", items: FRUITS, isDisabled: true },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByRole("button")).toBeDisabled()
	},
}

export const WithDescriptionAndError: Story = {
	args: {
		node: {
			type: "Select",
			props: {
				label: "Priority",
				items: [
					{ label: "Low", value: "low" },
					{ label: "Medium", value: "medium" },
					{ label: "High", value: "high" },
				],
				isInvalid: true,
				description: "Choose the task priority level.",
				errorMessage: "A priority selection is required.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByText(/priority selection is required/i)).toBeInTheDocument()
	},
}

export const Interactive: Story = {
	args: {
		node: {
			type: "Select",
			props: { label: "Fruit", items: FRUITS },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const trigger = canvas.getByRole("button")
		await userEvent.click(trigger)
		const apple = await canvas.findByRole("option", { name: /apple/i })
		await expect(apple).toBeInTheDocument()
		await userEvent.click(apple)
		await expect(canvas.getByRole("button")).toHaveTextContent(/apple/i)
	},
}
