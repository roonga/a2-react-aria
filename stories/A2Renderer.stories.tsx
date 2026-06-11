import type { Meta, StoryObj } from "@storybook/react"
import { A2Renderer, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({})

const meta = {
	title: "Core/A2Renderer",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const UnknownType: Story = {
	args: {
		node: { type: "Unknown" },
	},
}
