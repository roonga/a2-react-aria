import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, Menu } from "../packages/core/src/index"

const registry = createRegistry({
	Menu: { component: Menu as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Menu",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

const actions = [
	{ id: "open", label: "Open" },
	{ id: "rename", label: "Rename…" },
	{ id: "duplicate", label: "Duplicate" },
	{ id: "delete", label: "Delete…" },
]

export const Default: Story = {
	args: {
		node: {
			type: "Menu",
			props: { triggerLabel: "Actions", items: actions },
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /actions/i }))
		const body = within(document.body)
		await expect(body.getByRole("menu")).toBeInTheDocument()
		await expect(body.getByRole("menuitem", { name: /open/i })).toBeInTheDocument()
		await expect(body.getByRole("menuitem", { name: /delete/i })).toBeInTheDocument()
	},
}

export const WithDisabledItem: Story = {
	args: {
		node: {
			type: "Menu",
			props: {
				triggerLabel: "File",
				items: [
					{ id: "new", label: "New file" },
					{ id: "open", label: "Open file" },
					{ id: "save", label: "Save", isDisabled: true },
					{ id: "close", label: "Close" },
				],
			},
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /file/i }))
		const body = within(document.body)
		const saveItem = await body.findByRole("menuitem", { name: /save/i })
		await expect(saveItem).toHaveAttribute("aria-disabled", "true")
	},
}

export const SelectionMenu: Story = {
	args: {
		node: {
			type: "Menu",
			props: {
				triggerLabel: "View",
				selectionMode: "multiple",
				defaultSelectedKeys: ["grid"],
				items: [
					{ id: "list", label: "List view" },
					{ id: "grid", label: "Grid view" },
					{ id: "compact", label: "Compact view" },
				],
			},
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /view/i }))
		const body = within(document.body)
		await expect(body.getByRole("menu")).toBeInTheDocument()
	},
}

export const WithOnAction: Story = {
	args: {
		node: {
			type: "Menu",
			props: { triggerLabel: "Edit", items: actions },
		},
	},
	render: (args) => {
		const onAction = fn()
		const node = {
			...args.node,
			props: { ...args.node.props, onAction },
		}
		return <A2Renderer node={node} registry={registry} />
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /edit/i }))
		const body = within(document.body)
		await userEvent.click(await body.findByRole("menuitem", { name: /open/i }))
	},
}
