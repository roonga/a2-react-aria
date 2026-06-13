import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"
import { A2Renderer, Button, createRegistry, Switch, Tabs, TextField } from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"] },
	Switch: { component: Switch as Parameters<typeof createRegistry>[0][string]["component"] },
	Tabs: { component: Tabs as Parameters<typeof createRegistry>[0][string]["component"] },
	TextField: { component: TextField as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Tabs",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Tabs",
			props: {
				ariaLabel: "Settings",
				tabs: [
					{ id: "account", label: "Account" },
					{ id: "appearance", label: "Appearance" },
					{ id: "notifications", label: "Notifications" },
				],
			},
			children: [
				{ type: "TextField", props: { label: "Email address", type: "email" } },
				{ type: "Switch", props: { label: "Dark mode" } },
				{ type: "Switch", props: { label: "Email notifications", defaultSelected: true } },
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("tab", { name: /account/i })).toBeInTheDocument()
		await expect(canvas.getByRole("tab", { name: /appearance/i })).toBeInTheDocument()
		await expect(canvas.getByLabelText(/email address/i)).toBeInTheDocument()
		await userEvent.click(canvas.getByRole("tab", { name: /appearance/i }))
		await expect(canvas.getByRole("switch", { name: /dark mode/i })).toBeInTheDocument()
	},
}

export const WithDisabledTab: Story = {
	args: {
		node: {
			type: "Tabs",
			props: {
				ariaLabel: "Sections",
				defaultSelectedKey: "tab1",
				tabs: [
					{ id: "tab1", label: "Active" },
					{ id: "tab2", label: "Locked", isDisabled: true },
					{ id: "tab3", label: "Also active" },
				],
			},
			children: [
				{ type: "Button", props: { variant: "primary" }, children: "Action A" },
				{ type: "Button", props: { variant: "secondary" }, children: "Action B" },
				{ type: "Button", props: { variant: "ghost" }, children: "Action C" },
			],
		},
	},
	play: async ({ canvas }) => {
		const lockedTab = canvas.getByRole("tab", { name: /locked/i })
		await expect(lockedTab).toHaveAttribute("aria-disabled", "true")
	},
}

export const Vertical: Story = {
	args: {
		node: {
			type: "Tabs",
			props: {
				ariaLabel: "Navigation",
				orientation: "vertical",
				tabs: [
					{ id: "home", label: "Home" },
					{ id: "profile", label: "Profile" },
					{ id: "settings", label: "Settings" },
				],
			},
			children: [
				{ type: "Button", props: { variant: "primary" }, children: "Go home" },
				{ type: "TextField", props: { label: "Display name" } },
				{ type: "Switch", props: { label: "Privacy mode" } },
			],
		},
	},
}
