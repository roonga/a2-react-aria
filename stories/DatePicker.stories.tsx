import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { A2Renderer, createRegistry, DatePicker, DateRangePicker } from "../packages/core/src/index"

const registry = createRegistry({
	DatePicker: { component: DatePicker as Parameters<typeof createRegistry>[0][string]["component"] },
	DateRangePicker: {
		component: DateRangePicker as Parameters<typeof createRegistry>[0][string]["component"],
	},
})

const meta = {
	title: "Components/DatePicker",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "DatePicker",
			props: { label: "Appointment date" },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/appointment date/i)).toBeInTheDocument()
	},
}

export const WithDefaultValue: Story = {
	args: {
		node: {
			type: "DatePicker",
			props: { label: "Start date", defaultValue: "2024-06-15" },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/start date/i)).toBeInTheDocument()
	},
}

export const Required: Story = {
	args: {
		node: {
			type: "DatePicker",
			props: { label: "Due date", isRequired: true },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/due date/i)).toBeInTheDocument()
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "DatePicker",
			props: { label: "Locked date", isDisabled: true, defaultValue: "2024-01-01" },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/locked date/i)).toBeInTheDocument()
	},
}

export const Invalid: Story = {
	args: {
		node: {
			type: "DatePicker",
			props: { label: "Expiry date", isInvalid: true, errorMessage: "Date is in the past." },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/date is in the past/i)).toBeInTheDocument()
	},
}

export const WithDescription: Story = {
	args: {
		node: {
			type: "DatePicker",
			props: {
				label: "Event date",
				description: "Select the date of the event.",
				defaultValue: "2025-12-25",
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/select the date/i)).toBeInTheDocument()
	},
}

export const DateRange: Story = {
	args: {
		node: {
			type: "DateRangePicker",
			props: {
				label: "Vacation period",
				defaultValue: { start: "2024-07-01", end: "2024-07-14" },
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/vacation period/i)).toBeInTheDocument()
	},
}

export const DateRangeDisabled: Story = {
	args: {
		node: {
			type: "DateRangePicker",
			props: { label: "Booking window", isDisabled: true },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/booking window/i)).toBeInTheDocument()
	},
}
