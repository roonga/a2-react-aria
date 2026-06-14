import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, NumberField } from "../packages/core/src/index"

const registry = createRegistry({
	NumberField: { component: NumberField as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/NumberField",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const GuestCount: Story = {
	args: {
		node: {
			type: "NumberField",
			props: {
				label: "Party Size",
				minValue: 1,
				maxValue: 12,
				defaultValue: 2,
				isRequired: true,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole("textbox", { name: /party size/i })
		await expect(input).toBeInTheDocument()
		await expect(input).toHaveValue("2")
	},
}

export const WithSteps: Story = {
	args: {
		node: {
			type: "NumberField",
			props: {
				label: "Quantity",
				minValue: 0,
				maxValue: 100,
				step: 5,
				defaultValue: 10,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const incBtn = canvas.getByRole("button", { name: /increase/i })
		await userEvent.click(incBtn)
		const input = canvas.getByRole("textbox")
		await expect(input).toHaveValue("15")
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "NumberField",
			props: {
				label: "Fixed Amount",
				defaultValue: 5,
				isDisabled: true,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole("textbox", { name: /fixed amount/i })
		await expect(input).toBeDisabled()
	},
}

export const WithDescription: Story = {
	args: {
		node: {
			type: "NumberField",
			props: {
				label: "Number of Guests",
				minValue: 1,
				maxValue: 20,
				defaultValue: 2,
				description: "Maximum 20 guests per booking",
			},
		},
	},
}
