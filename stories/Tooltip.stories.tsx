import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, Tooltip } from "../packages/core/src/index"

const registry = createRegistry({
	Tooltip: { component: Tooltip as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Tooltip",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Tooltip",
			props: { content: "Click to edit this field", triggerLabel: "Edit", placement: "top" },
		},
	},
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", { name: /edit/i })
		await userEvent.tab()
		await expect(trigger).toHaveFocus()
		const body = within(document.body)
		const tooltip = await body.findByRole("tooltip")
		await expect(tooltip).toBeInTheDocument()
		await expect(tooltip).toHaveTextContent(/click to edit/i)
	},
}

export const PlacementBottom: Story = {
	args: {
		node: {
			type: "Tooltip",
			props: { content: "Save your changes", triggerLabel: "Save", placement: "bottom" },
		},
	},
}

export const PlacementRight: Story = {
	args: {
		node: {
			type: "Tooltip",
			props: { content: "Delete this item permanently", triggerLabel: "Delete", placement: "right" },
		},
	},
}
