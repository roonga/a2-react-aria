import { A2Renderer, createRegistry } from "@a2ui/core"
import type { Meta, StoryObj } from "@storybook/react"

const DemoButton = ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
	// biome-ignore lint/a11y/useButtonType: demo-only component, not used in production
	<button data-variant={variant} style={{ borderRadius: 4, cursor: "pointer", padding: "8px 16px" }}>
		{children}
	</button>
)

const registry = createRegistry({
	Button: { component: DemoButton as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Core/A2Renderer",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const BasicButton: Story = {
	args: {
		node: { type: "Button", props: { variant: "primary" }, children: "Click me" },
	},
}

export const UnknownType: Story = {
	args: {
		node: { type: "Unknown" },
	},
}
