import type { Meta, StoryObj } from "@storybook/react"
import { A2Renderer, Button, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Button",
	component: A2Renderer,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Button component rendered from a2UI JSON. Each story shows the exact JSON structure passed to A2Renderer.",
			},
		},
	},
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

export const Primary: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "primary", size: "md" },
			children: "Click me",
		},
	},
}

export const Secondary: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "secondary", size: "lg" },
			children: "Secondary",
		},
	},
}

export const Danger: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "danger", size: "sm" },
			children: "Delete",
		},
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "primary", disabled: true },
			children: "Disabled",
		},
	},
}

export const Ghost: Story = {
	args: {
		node: {
			type: "Button",
			props: { variant: "ghost", size: "lg" },
			children: "Ghost Button",
		},
	},
}
