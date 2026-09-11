import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, Menu, MenuSchema } from "../packages/core/src/index"

const registry = createRegistry({
	Menu: { component: Menu as Parameters<typeof createRegistry>[0][string]["component"], schema: MenuSchema },
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

export const WithSeparator: Story = {
	args: {
		node: {
			type: "Menu",
			props: {
				triggerLabel: "Account",
				menuLabel: "Account actions",
				items: [
					{ id: "profile", label: "Profile", href: "#profile" },
					{ id: "rule", kind: "separator" },
					{ id: "sign-out", label: "Sign out" },
				],
			},
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /account/i }))
		const body = within(document.body)
		await expect(body.getByRole("menuitem", { name: /profile/i })).toHaveAttribute("href", "#profile")
		await expect(await body.findAllByRole("menuitem")).toHaveLength(2)
	},
}

/**
 * The slots a design system reaches for: a glyph trigger named by `triggerLabel`, a
 * non-interactive header above the rows, and a row whose label carries a mark beside its
 * text. None of these are expressible in A2UI JSON, so this story renders the component
 * directly rather than through `A2Renderer`.
 */
export const TriggerAndItemSlots: Story = {
	args: { node: { type: "Menu" } },
	render: () => (
		<Menu
			triggerLabel="Appearance: Dark"
			trigger={<span aria-hidden="true">{"\u25D1"}</span>}
			menuLabel="Colour mode"
			header={<span>{"Signed in as operator@example.test"}</span>}
			selectionMode="single"
			selectedKeys={["dark"]}
			disallowEmptySelection
			items={[
				{ id: "light", textValue: "Light", label: <RowLabel isChosen={false}>{"Light"}</RowLabel> },
				{ id: "dark", textValue: "Dark", label: <RowLabel isChosen={true}>{"Dark"}</RowLabel> },
			]}
		/>
	),
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: /appearance: dark/i }))
		const body = within(document.body)
		await expect(body.getByText(/signed in as/i)).toBeInTheDocument()
		await expect(body.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true")
	},
}

/** A check mark that never moves the text beside it, chosen or not. */
function RowLabel({ isChosen, children }: { isChosen: boolean; children: string }) {
	return (
		<>
			<span aria-hidden="true" className="inline-block w-4">
				{isChosen ? "\u2713" : ""}
			</span>
			{children}
		</>
	)
}
