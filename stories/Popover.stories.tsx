import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, Button, createRegistry, Popover, Switch } from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"] },
	Popover: { component: Popover as Parameters<typeof createRegistry>[0][string]["component"] },
	Switch: { component: Switch as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Popover",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Popover",
			props: { triggerLabel: "Settings", placement: "bottom" },
			children: [
				{ type: "Switch", props: { label: "Wi-Fi", defaultSelected: true } },
				{ type: "Switch", props: { label: "Bluetooth", defaultSelected: true } },
				{ type: "Switch", props: { label: "Mute" } },
			],
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /settings/i }))
		const body = within(document.body)
		await expect(body.getByRole("switch", { name: /wi-fi/i })).toBeInTheDocument()
	},
}

export const TopPlacement: Story = {
	args: {
		node: {
			type: "Popover",
			props: { triggerLabel: "Open above", placement: "top" },
			children: [{ type: "Button", props: { variant: "primary" }, children: "Action" }],
		},
	},
}

export const Controlled: Story = {
	args: {
		node: {
			type: "Popover",
			props: { triggerLabel: "Always open", isOpen: true, placement: "bottom" },
			children: [{ type: "Switch", props: { label: "Dark mode" } }],
		},
	},
	play: async () => {
		const body = within(document.body)
		await expect(body.getByRole("switch", { name: /dark mode/i })).toBeInTheDocument()
	},
}
