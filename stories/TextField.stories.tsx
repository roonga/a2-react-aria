import type { Meta, StoryObj } from "@storybook/react"
import { A2Renderer, createRegistry, TextField } from "../packages/core/src/index"

const registry = createRegistry({
	TextField: { component: TextField as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/TextField",
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

export const Email: Story = {
	args: {
		node: {
			type: "TextField",
			props: {
				label: "Email",
				placeholder: "you@example.com",
				type: "email",
				required: true,
			},
		},
	},
}

export const Password: Story = {
	args: {
		node: {
			type: "TextField",
			props: {
				label: "Password",
				type: "password",
				required: true,
			},
		},
	},
}

export const Optional: Story = {
	args: {
		node: {
			type: "TextField",
			props: {
				label: "Optional Notes",
				placeholder: "Add notes...",
				type: "text",
			},
		},
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "TextField",
			props: {
				label: "Disabled Field",
				value: "Cannot edit",
				disabled: true,
			},
		},
	},
}
