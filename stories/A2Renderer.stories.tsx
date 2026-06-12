import type { Meta, StoryObj } from "@storybook/react"
import { A2Renderer, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({})

const meta = {
	title: "Core/A2Renderer",
	component: A2Renderer,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "A2Renderer resolves a2UI JSON nodes to registered React Aria components.",
			},
		},
	},
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const UnregisteredComponent: Story = {
	name: "Unregistered Component",
	parameters: {
		docs: {
			description: {
				story: 'Shows the fallback when the node type has no matching entry in the registry.',
			},
		},
	},
	args: {
		node: { type: "Unknown" },
		fallback: <span className="text-red-600">Unknown component type: &quot;Unknown&quot;</span>,
	},
}
