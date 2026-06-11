import type { Meta, StoryObj } from "@storybook/react"
import { A2Renderer, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({})

const meta = {
	title: "Core/A2Renderer",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
	decorators: [
		(Story, context) => (
			<div>
				<Story />
				<div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
					<details style={{ fontSize: "0.875rem", color: "#666" }}>
						<summary style={{ cursor: "pointer", fontWeight: "bold" }}>a2UI JSON</summary>
						<pre
							style={{
								background: "#f5f5f5",
								padding: "1rem",
								borderRadius: "4px",
								overflow: "auto",
								marginTop: "0.5rem",
							}}
						>
							{JSON.stringify(context.args.node, null, 2)}
						</pre>
					</details>
				</div>
			</div>
		),
	],
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const UnknownType: Story = {
	args: {
		node: { type: "Unknown" },
	},
}
